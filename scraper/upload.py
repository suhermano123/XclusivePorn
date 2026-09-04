"""Fase 4: sube HLS + preview + thumbnail a R2 (con Cache-Control) y crea la
fila en Supabase posted_videos.

Sustituye la celda 11 del notebook. URLs -> dominios CDN nuevos.
"""
import io
import re
import time
import random
import logging
import datetime
import threading
import unicodedata
import concurrent.futures as cf

import boto3
import requests
from PIL import Image
from supabase import create_client

from config import (
    R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
    BUCKET_PLAY, BUCKET_INFO, BUCKET_IMAGES,
    CDN_PLAY, CDN_INFO, CDN_IMAGES,
    CC_IMMUTABLE, CC_PLAYLIST,
    SUPABASE_URL, SUPABASE_KEY,
    HLS_DIR, PREVIEW_DIR, UPLOAD_WORKERS,
)

log = logging.getLogger("upload")

s3 = boto3.client(
    "s3", endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def duracion_hls(video_id: str) -> int:
    m3u8 = HLS_DIR / video_id / "index.m3u8"
    if not m3u8.exists():
        return 0
    total = 0.0
    for linea in m3u8.read_text(encoding="utf-8").splitlines():
        if linea.startswith("#EXTINF:"):
            try:
                total += float(linea.split(":")[1].split(",")[0])
            except Exception:
                pass
    return int(total)


def _put_ts(archivo, video_id: str):
    key = f"{video_id}/{archivo.name}"
    s3.upload_file(
        str(archivo), BUCKET_PLAY, key,
        ExtraArgs={"ContentType": "video/MP2T", "CacheControl": CC_IMMUTABLE},
    )


def subir_hls(video_id: str) -> tuple[str, str]:
    carpeta = HLS_DIR / video_id
    archivos = sorted(carpeta.iterdir())
    ts_files = [a for a in archivos if a.suffix == ".ts"]
    m3u8 = next((a for a in archivos if a.suffix == ".m3u8"), None)

    t0 = time.time()
    with cf.ThreadPoolExecutor(max_workers=UPLOAD_WORKERS) as ex:
        list(ex.map(lambda a: _put_ts(a, video_id), ts_files))
    log.info("  subidos %d .ts en %.0fs", len(ts_files), time.time() - t0)

    if not m3u8:
        return "", ""
    key = f"{video_id}/{m3u8.name}"
    s3.upload_file(
        str(m3u8), BUCKET_PLAY, key,
        ExtraArgs={"ContentType": "application/vnd.apple.mpegurl", "CacheControl": CC_PLAYLIST},
    )
    return f"{CDN_PLAY}/{key}", key


def subir_preview(video_id: str) -> tuple[str, str]:
    archivo = PREVIEW_DIR / f"{video_id}.mp4"
    if not archivo.exists():
        return "", ""
    key = f"{video_id}.mp4"
    s3.upload_file(
        str(archivo), BUCKET_INFO, key,
        ExtraArgs={"ContentType": "video/mp4", "CacheControl": CC_IMMUTABLE},
    )
    return f"{CDN_INFO}/{key}", key


def _optimizar(image_bytes: bytes, calidad: int = 82):
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode in ("CMYK", "P"):
        img = img.convert("RGBA" if "transparency" in img.info else "RGB")
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=calidad, method=6)
    return buf.getvalue()


def subir_thumbnail(video_id: str, image_url: str) -> tuple[str, str]:
    if not image_url:
        return "", ""
    try:
        r = requests.get(
            image_url, timeout=20,
            headers={"User-Agent": "Mozilla/5.0", "Accept": "image/webp,image/*,*/*;q=0.8"},
        )
        if r.status_code != 200:
            log.warning("  thumbnail %s -> %s", image_url, r.status_code)
            return "", ""
        try:
            body, ext, ctype = _optimizar(r.content), "webp", "image/webp"
        except Exception as e:
            log.warning("  no se optimizó thumbnail (%s), subo original", e)
            body = r.content
            ct = r.headers.get("Content-Type", "image/jpeg").lower()
            ext = "png" if "png" in ct else ("webp" if "webp" in ct else "jpg")
            ctype = ct
        key = f"{video_id}.{ext}"
        try:
            s3.head_object(Bucket=BUCKET_IMAGES, Key=key)
            return f"{CDN_IMAGES}/{key}", key
        except Exception:
            pass
        s3.put_object(
            Bucket=BUCKET_IMAGES, Key=key, Body=body,
            ContentType=ctype, CacheControl=CC_IMMUTABLE,
        )
        return f"{CDN_IMAGES}/{key}", key
    except Exception as e:
        log.warning("  error thumbnail: %s", e)
        return "", ""


def norm_titulo(titulo: str) -> str:
    """Clave de comparación: sin acentos, sin puntuación, minúsculas, 1 espacio.

    Así 'Hot Wife / 01.02.2024', 'hot  wife' y 'Hôt Wife!' colapsan a la misma
    clave y no se descarga/inserta la misma película dos veces.
    """
    if not titulo:
        return ""
    t = unicodedata.normalize("NFKD", titulo)
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = t.lower()
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def ya_existe(titulo: str) -> bool:
    """Chequeo puntual contra la DB justo antes de insertar (exacto + normalizado)."""
    if not titulo:
        return False
    try:
        res = supabase.table("posted_videos").select("titulo").eq("titulo", titulo).limit(1).execute()
        if res.data:
            return True
        # segundo intento tolerante a mayúsculas/espacios sobrantes
        like = "%" + re.sub(r"\s+", "%", titulo.strip()) + "%"
        res = supabase.table("posted_videos").select("titulo").ilike("titulo", like).limit(20).execute()
        objetivo = norm_titulo(titulo)
        return any(norm_titulo(r.get("titulo", "")) == objetivo for r in (res.data or []))
    except Exception as e:
        log.warning("  no se pudo comprobar duplicado: %s", e)
        return False


def titulos_publicados_norm() -> set[str]:
    """TODAS las claves normalizadas ya en posted_videos. Pagina la tabla entera
    (solo la columna `titulo`)."""
    out: set[str] = set()
    paso = 1000
    desde = 0
    while True:
        try:
            res = (supabase.table("posted_videos")
                   .select("titulo")
                   .range(desde, desde + paso - 1)
                   .execute())
        except Exception as e:
            log.warning("  no se pudo listar títulos existentes: %s", e)
            break
        filas = res.data or []
        for r in filas:
            n = norm_titulo(r.get("titulo", ""))
            if n:
                out.add(n)
        if len(filas) < paso:
            break
        desde += paso
    log.info("títulos ya publicados: %d", len(out))
    return out


class RegistroTitulos:
    """Set thread-safe de claves normalizadas: lo ya publicado + lo reservado en
    esta corrida. `reservar` es atómico (check-and-set) para que dos workers no
    procesen la misma película en paralelo."""

    def __init__(self, iniciales: set[str]):
        self._set = set(iniciales)
        self._lock = threading.Lock()

    def existe(self, titulo: str) -> bool:
        n = norm_titulo(titulo)
        if not n:
            return False
        with self._lock:
            return n in self._set

    def reservar(self, titulo: str) -> bool:
        """True si quedó reservado para este worker; False si ya estaba (duplicado)."""
        n = norm_titulo(titulo)
        if not n:
            return False
        with self._lock:
            if n in self._set:
                return False
            self._set.add(n)
            return True


def publicar(meta: dict) -> bool:
    """Sube todo lo de work/ para meta['id'] e inserta en Supabase. True si insertó."""
    video_id = meta["id"]

    # Chequeo final contra la DB antes de subir nada: cubre la ventana entre el
    # dedup inicial y este momento (corridas largas, título que ya se coló).
    if ya_existe(meta.get("titulo", "")):
        log.info("  duplicado detectado antes de insertar, salto: %s",
                 meta.get("titulo", "")[:50])
        return False

    dur = duracion_hls(video_id)
    video_url, video_key = subir_hls(video_id)
    preview_url, preview_key = subir_preview(video_id)
    imagen_url, _ = subir_thumbnail(video_id, meta.get("imagen", ""))

    payload = {
        "uuid": video_id,
        "titulo": meta.get("titulo", ""),
        "descripcion": meta.get("descripcion", ""),
        "imagen_url": imagen_url,
        "tags": meta.get("TAG", ""),
        "video_stream_url": video_url,
        "preview_url": preview_url,
        "video_key": video_key,
        "preview_key": preview_key,
        "duracion_segundos": dur,
        "studio": meta.get("studio", ""),
        "actresses": meta.get("actriz", ""),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "views": random.randint(0, 10),
    }
    try:
        supabase.table("posted_videos").insert(payload).execute()
        log.info("  insertado en posted_videos: %s", video_id)
        return True
    except Exception as e:
        if "duplicate key" in str(e).lower():
            log.info("  ya existía (uuid dup): %s", video_id)
            return False
        raise
