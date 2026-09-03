"""Fase 4: sube HLS + preview + thumbnail a R2 (con Cache-Control) y crea la
fila en Supabase posted_videos.

Sustituye la celda 11 del notebook. URLs -> dominios CDN nuevos.
"""
import io
import time
import random
import logging
import datetime

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
    HLS_DIR, PREVIEW_DIR,
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


def subir_hls(video_id: str) -> tuple[str, str]:
    carpeta = HLS_DIR / video_id
    m3u8_url = video_key = ""
    for archivo in sorted(carpeta.iterdir()):
        key = f"{video_id}/{archivo.name}"
        if archivo.suffix == ".m3u8":
            ctype, cc = "application/vnd.apple.mpegurl", CC_PLAYLIST
        else:
            ctype, cc = "video/MP2T", CC_IMMUTABLE
        s3.upload_file(
            str(archivo), BUCKET_PLAY, key,
            ExtraArgs={"ContentType": ctype, "CacheControl": cc},
        )
        if archivo.suffix == ".m3u8":
            video_key = key
            m3u8_url = f"{CDN_PLAY}/{key}"
    return m3u8_url, video_key


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


def ya_existe(titulo: str) -> bool:
    if not titulo:
        return False
    try:
        res = supabase.table("posted_videos").select("uuid").eq("titulo", titulo).limit(1).execute()
        return bool(res.data)
    except Exception as e:
        log.warning("  no se pudo comprobar duplicado: %s", e)
        return False


def publicar(meta: dict) -> bool:
    """Sube todo lo de work/ para meta['id'] e inserta en Supabase. True si insertó."""
    video_id = meta["id"]
    dur = duracion_hls(video_id)
    video_url, video_key = subir_hls(video_id)
    preview_url, preview_key = subir_preview(video_id)
    imagen_url, _ = subir_thumbnail(video_id, meta.get("imagen", ""))
    time.sleep(1.0)

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
