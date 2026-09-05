"""Teaser semi-automático para X (Twitter).

Corre 3 veces al día (GitHub Actions). Cada corrida:
  1. Elige un video al azar de `posted_videos` (duración >= 90s).
  2. Corta un clip de CLIP_SECONDS desde un punto random del HLS, con el
     dominio quemado en pantalla (marca de agua) via ffmpeg.
  3. Arma un caption variado con el título + link al video.
  4. Manda el clip + caption a Telegram — NO publica solo. Cristian revisa
     y publica manualmente en X. Así no hace falta la API de pago de X
     ni automatizar el login (ambas cosas descartadas a propósito).

Uso local:
  cd social
  pip install -r requirements.txt
  export SUPABASE_URL=... SUPABASE_KEY=... TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
  python post_teaser.py

Env requeridas:
  SUPABASE_URL, SUPABASE_KEY      - mismas del scraper (solo necesita SELECT)
  TELEGRAM_BOT_TOKEN              - token del bot (@BotFather)
  TELEGRAM_CHAT_ID                - a quién le manda el clip (tu chat id)
Opcionales:
  CLIP_SECONDS        default 60
  MIN_DURATION        default 90   (no elige videos más cortos que esto)
"""
import os
import random
import logging
import subprocess
import tempfile
from pathlib import Path

import requests
from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("social")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]

CLIP_SECONDS = int(os.environ.get("CLIP_SECONDS", "60"))
MIN_DURATION = int(os.environ.get("MIN_DURATION", "90"))
BASE_URL = "https://novapornx.com"

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


def pick_random_video() -> dict:
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    count_res = (
        sb.table("posted_videos")
        .select("uuid", count="exact")
        .gte("duracion_segundos", MIN_DURATION)
        .execute()
    )
    total = count_res.count or 0
    if total == 0:
        raise RuntimeError(f"no hay videos con duracion_segundos >= {MIN_DURATION}")

    offset = random.randint(0, total - 1)
    row = (
        sb.table("posted_videos")
        .select("uuid,titulo,video_stream_url,duracion_segundos")
        .gte("duracion_segundos", MIN_DURATION)
        .order("created_at", desc=True)
        .range(offset, offset)
        .execute()
    )
    if not row.data:
        raise RuntimeError("no se pudo elegir un video random (range vacío)")
    return row.data[0]


def cortar_clip(video_url: str, duracion_total: int, dest: str) -> float:
    """Devuelve el segundo de inicio usado (por si se quiere loguear)."""
    margen = 5
    max_inicio = max(margen, duracion_total - CLIP_SECONDS - margen)
    inicio = random.uniform(margen, max_inicio) if max_inicio > margen else 0

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


def enviar_telegram(clip_path: str, caption: str):
    api = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendVideo"
    with open(clip_path, "rb") as f:
        resp = requests.post(
            api,
            data={"chat_id": TELEGRAM_CHAT_ID, "caption": caption},
            files={"video": f},
            timeout=120,
        )
    resp.raise_for_status()
    log.info("enviado a Telegram OK")


def main() -> int:
    video = pick_random_video()
    log.info("elegido: %s (%ss)", video["titulo"][:60], video["duracion_segundos"])

    with tempfile.TemporaryDirectory() as tmp:
        clip_path = str(Path(tmp) / "clip.mp4")
        cortar_clip(video["video_stream_url"], video["duracion_segundos"], clip_path)
        caption = armar_caption(video)
        log.info("caption: %s", caption)
        enviar_telegram(clip_path, caption)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
