"""Teaser semi-automático para X (Twitter).

Corre 3 veces al día (GitHub Actions). Cada corrida:
  1. Elige un video al azar de `posted_videos` (duración >= 90s) que NO se
     haya usado antes -- el registro vive en used_videos.json, versionado
     en el repo (no hay acceso DDL al Postgres de Supabase para una tabla
     de seguimiento, así que el archivo del repo hace ese papel). Cuando
     ya se usaron todos, el ciclo se reinicia solo.
  2. Corta un clip de CLIP_SECONDS desde un punto random del HLS, con
     preferencia por la mitad del video (distribución triangular, no
     uniforme), con el dominio quemado en pantalla (marca de agua) via
     ffmpeg.
  3. Sube el clip a R2 (bucket videos-info, el mismo de los previews de
     5s -- dominio público preview.novapornx.com) bajo teasers/. La API
     de bots de Telegram tiene un límite de 50MB por archivo subido
     directamente; con clips largos (240s) eso se pasa fácil, así que en
     vez de mandar el archivo se manda el link -- sin límite de tamaño
     ni pérdida de calidad.
  4. Arma un caption variado con el título + link al video, y manda un
     mensaje de texto a Telegram con el caption + el link del clip.
     Cristian revisa y publica manualmente en X. Así no hace falta la
     API de pago de X ni automatizar el login (ambas descartadas a
     propósito).

El workflow de GitHub Actions commitea used_videos.json de vuelta al repo
después de cada corrida para que la próxima corrida (en un runner nuevo)
sepa qué ya se usó.

Uso local:
  cd social
  pip install -r requirements.txt
  export SUPABASE_URL=... SUPABASE_KEY=... TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
  python post_teaser.py

Env requeridas:
  SUPABASE_URL, SUPABASE_KEY      - mismas del scraper (solo necesita SELECT)
  TELEGRAM_BOT_TOKEN              - token del bot (@BotFather)
  TELEGRAM_CHAT_ID                - a quién le manda el link (tu chat id)
  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY - mismas del scraper (bucket videos-info)
Opcionales:
  R2_ACCOUNT_ID       default 4e606a01f4fc407cb118d0fafbaee583 (el mismo de siempre)
  CLIP_SECONDS        default 60
  MIN_DURATION        default 90   (no elige videos más cortos que esto)
"""
import os
import json
import time
import random
import logging
import subprocess
import tempfile
from pathlib import Path

import boto3
import requests
from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("social")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "4e606a01f4fc407cb118d0fafbaee583")
R2_ACCESS_KEY_ID = os.environ["R2_ACCESS_KEY_ID"]
R2_SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"]

CLIP_SECONDS = int(os.environ.get("CLIP_SECONDS", "60"))
MIN_DURATION = int(os.environ.get("MIN_DURATION", "90"))
BASE_URL = "https://novapornx.com"
USED_FILE = Path(__file__).parent / "used_videos.json"

# Mismo bucket que usa el scraper para los previews de 5s (upload.py: BUCKET_INFO).
R2_BUCKET = "videos-info"
R2_CDN = "https://preview.novapornx.com"
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # ubuntu-latest (GitHub runner)
    "C:/Windows/Fonts/arialbd.ttf",  # por si se corre local en Windows
]

CAPTIONS = [
    "New upload just dropped 👀 full scene free, no signup: {url}",
    "This one's a favorite already. Watch the full video free: {url}",
    "{title} — full HD, 100% free. Link: {url}",
    "POV: you found the good stuff. Full video here: {url}",
    "Free, no paywall, no bs. Watch the rest: {url}",
    "This scene is too good to keep to myself 🔥 Full video: {url}",
    "New on NovaPornX: {title}. Free in HD: {url}",
    "Save this one. Full video, completely free: {url}",
    "If you liked the clip, the full scene is free here: {url}",
    "Fresh upload 🔥 {title} — watch free: {url}",
    "No catch, no signup, just free HD porn: {url}",
    "This is why I keep this account alive lol. Full video: {url}",
    "{title} — the full thing is free, link below: {url}",
    "Daily upload #{n}: watch the whole scene free at {url}",
    "Bookmark this one. Full HD, free: {url}",
    "New scene just posted. Watch it all here: {url}",
    "This clip doesn't do it justice, full video is way better: {url}",
    "Free HD, updated daily. Today's pick: {url}",
    "{title} 🔥 full video, zero cost: {url}",
    "Found this one today, had to share. Full scene: {url}",
]


def _pick_font() -> str | None:
    for f in FONT_CANDIDATES:
        if Path(f).exists():
            return f
    return None


def cargar_usados() -> set:
    if USED_FILE.exists():
        try:
            return set(json.loads(USED_FILE.read_text(encoding="utf-8")))
        except Exception:
            return set()
    return set()


def guardar_usados(usados: set):
    USED_FILE.write_text(json.dumps(sorted(usados), indent=2), encoding="utf-8")


def fetch_candidatos() -> list:
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    out = []
    paso = 500
    desde = 0
    while True:
        res = (
            sb.table("posted_videos")
            .select("uuid,titulo,video_stream_url,duracion_segundos")
            .gte("duracion_segundos", MIN_DURATION)
            .order("created_at", desc=True)
            .range(desde, desde + paso - 1)
            .execute()
        )
        filas = res.data or []
        out.extend(filas)
        if len(filas) < paso:
            break
        desde += paso
    return out


def pick_random_video(usados: set) -> tuple:
    """Devuelve (video, usados_actualizado). No repite hasta agotar el catálogo."""
    candidatos = fetch_candidatos()
    if not candidatos:
        raise RuntimeError(f"no hay videos con duracion_segundos >= {MIN_DURATION}")

    disponibles = [v for v in candidatos if v["uuid"] not in usados]
    if not disponibles:
        log.info("ya se usaron los %d videos disponibles -- reiniciando el ciclo", len(candidatos))
        usados = set()
        disponibles = candidatos

    video = random.choice(disponibles)
    usados = usados | {video["uuid"]}
    return video, usados


def cortar_clip(video_url: str, duracion_total: int, dest: str) -> float:
    """Devuelve el segundo de inicio usado (por si se quiere loguear).

    El punto de inicio se elige con una distribución triangular centrada
    en la mitad del rango válido: preferentemente cerca de la mitad del
    video, pero sin excluir el resto del rango.
    """
    margen = 5
    max_inicio = max(margen, duracion_total - CLIP_SECONDS - margen)
    if max_inicio <= margen:
        inicio = 0.0
    else:
        medio = (margen + max_inicio) / 2
        inicio = random.triangular(margen, max_inicio, medio)

    font = _pick_font()
    vf = "scale='min(1280,iw)':-2"
    if font:
        vf += (
            f",drawtext=fontfile='{font}':text='novapornx.com':"
            "fontsize=28:fontcolor=white@0.85:borderw=2:bordercolor=black@0.6:"
            "x=w-tw-20:y=h-th-20"
        )

    cmd = [
        "ffmpeg", "-y", "-loglevel", "warning",
        "-ss", f"{inicio:.1f}",
        "-i", video_url,
        "-t", str(CLIP_SECONDS),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        dest,
    ]
    log.info("cortando clip: inicio=%.0fs duracion=%ss", inicio, CLIP_SECONDS)
    subprocess.run(cmd, check=True, timeout=10 * 60)
    return inicio


def armar_caption(video: dict) -> str:
    frase = random.choice(CAPTIONS)
    url = f"{BASE_URL}/video/{video['uuid']}"
    return frase.format(title=video.get("titulo", "New video"), url=url, n=random.randint(100, 999))


def subir_clip_r2(clip_path: str, video_uuid: str) -> str:
    """Sube el clip a R2 y devuelve su URL pública. Sin límite de tamaño
    (a diferencia de mandarlo directo por Telegram, capado a 50MB)."""
    s3 = boto3.client(
        "s3", endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    )
    key = f"teasers/{video_uuid}-{int(time.time())}.mp4"
    s3.upload_file(
        clip_path, R2_BUCKET, key,
        ExtraArgs={"ContentType": "video/mp4", "CacheControl": "public, max-age=604800"},
    )
    log.info("clip subido a R2: %s", key)
    return f"{R2_CDN}/{key}"


def enviar_telegram(clip_url: str, caption: str):
    api = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    texto = f"{caption}\n\nClip: {clip_url}"
    resp = requests.post(
        api,
        data={"chat_id": TELEGRAM_CHAT_ID, "text": texto, "disable_web_page_preview": False},
        timeout=30,
    )
    resp.raise_for_status()
    log.info("enviado a Telegram OK")


def main() -> int:
    usados = cargar_usados()
    video, usados = pick_random_video(usados)
    guardar_usados(usados)
    log.info("elegido: %s (%ss) -- %d videos usados en el ciclo actual",
              video["titulo"][:60], video["duracion_segundos"], len(usados))

    with tempfile.TemporaryDirectory() as tmp:
        clip_path = str(Path(tmp) / "clip.mp4")
        cortar_clip(video["video_stream_url"], video["duracion_segundos"], clip_path)
        clip_url = subir_clip_r2(clip_path, video["uuid"])
        caption = armar_caption(video)
        log.info("caption: %s", caption)
        enviar_telegram(clip_url, caption)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
