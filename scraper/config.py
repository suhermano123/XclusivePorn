"""Configuración central del pipeline. Todo sale de variables de entorno.

Requeridas (GitHub Actions -> Settings -> Secrets and variables -> Actions):
  R2_ACCESS_KEY_ID        secret  - S3 access key del token R2
  R2_SECRET_ACCESS_KEY    secret  - S3 secret
  SUPABASE_KEY            secret  - key de Supabase con permiso de INSERT en posted_videos
Opcionales (variables, no secretos):
  R2_ACCOUNT_ID           default 4e606a01f4fc407cb118d0fafbaee583
  SUPABASE_URL            default https://gegdnoqjglidnijpmhay.supabase.co
  LIMITE_VIDEOS           default 12
  SCRAPE_BASE_URL         default https://xmoviesforyou.com/
"""
import os

R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "4e606a01f4fc407cb118d0fafbaee583")
R2_ACCESS_KEY_ID = os.environ["R2_ACCESS_KEY_ID"]
R2_SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"]
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://gegdnoqjglidnijpmhay.supabase.co")
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

# Buckets R2
BUCKET_PLAY = "videos-play"       # HLS  (.m3u8 + .ts)
BUCKET_INFO = "videos-info"       # preview mp4 (5s)
BUCKET_IMAGES = "video-previews"  # thumbnail webp

# Dominios CDN (custom domains con Cache Rule de edge cache 30d)
CDN_PLAY = "https://cdn.novapornx.com"
CDN_INFO = "https://preview.novapornx.com"
CDN_IMAGES = "https://img.novapornx.com"

# Cache-Control que se pone en cada objeto al subir
CC_IMMUTABLE = "public, max-age=31536000, immutable"   # .ts, preview mp4, thumbnails
CC_PLAYLIST = "public, max-age=3600"                    # .m3u8

LIMITE_VIDEOS = int(os.environ.get("LIMITE_VIDEOS", "12"))

# Paralelismo
WORKERS = int(os.environ.get("WORKERS", "3"))            # videos en paralelo
DL_CONNS = int(os.environ.get("DL_CONNS", "16"))         # conexiones por descarga
SCRAPE_WORKERS = int(os.environ.get("SCRAPE_WORKERS", "6"))  # fetch de detalle en paralelo
UPLOAD_WORKERS = int(os.environ.get("UPLOAD_WORKERS", "16")) # subidas .ts a R2 en paralelo
SCRAPE_BASE_URL = os.environ.get("SCRAPE_BASE_URL", "https://xmoviesforyou.com/")

# Rutas de trabajo (efímeras, se limpian por video)
import pathlib
WORKDIR = pathlib.Path(os.environ.get("WORKDIR", "work")).resolve()
HLS_DIR = WORKDIR / "videos-hls"
PREVIEW_DIR = WORKDIR / "preview"
