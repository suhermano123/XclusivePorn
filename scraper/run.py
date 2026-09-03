"""Orquestador del pipeline diario.

Flujo por-video (para no llenar el disco del runner):
  1. scrape del listado -> metadata de hasta LIMITE_VIDEOS
  2. por cada video:  dedup -> download HLS -> preview -> upload R2 + Supabase -> borrar local
  3. resumen

Uso:  python -m scraper.run   (o  cd scraper && python run.py)
"""
import sys
import shutil
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("run")

from config import LIMITE_VIDEOS, WORKDIR, HLS_DIR, PREVIEW_DIR
from scrape import scrape_listing
from download import download_video
from preview import generar_preview
from upload import publicar, ya_existe


def _limpiar_video(video_id: str):
    shutil.rmtree(HLS_DIR / video_id, ignore_errors=True)
    (PREVIEW_DIR / f"{video_id}.mp4").unlink(missing_ok=True)


def main() -> int:
    WORKDIR.mkdir(parents=True, exist_ok=True)
    HLS_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    log.info("=== scrape (limite=%d) ===", LIMITE_VIDEOS)
    # pedimos de más porque el dedup descarta algunos
    candidatos = scrape_listing(LIMITE_VIDEOS * 3)
    log.info("candidatos: %d", len(candidatos))

    publicados = 0
    fallidos = 0
    saltados = 0

    for meta in candidatos:
        if publicados >= LIMITE_VIDEOS:
            break
        titulo = meta["titulo"]

        if ya_existe(titulo):
            log.info("skip (ya existe): %s", titulo[:50])
            saltados += 1
            continue

        log.info("--- %s ---", titulo[:60])
        try:
            if not download_video(meta["id"], titulo, meta["enlace"]):
                fallidos += 1
                _limpiar_video(meta["id"])
                continue

            generar_preview(meta["id"])  # opcional; si falla seguimos sin preview

            if publicar(meta):
                publicados += 1
            else:
                saltados += 1
        except Exception as e:
            log.exception("error procesando %s: %s", titulo[:40], e)
            fallidos += 1
        finally:
            _limpiar_video(meta["id"])

    log.info("=== FIN  publicados=%d  saltados=%d  fallidos=%d ===",
             publicados, saltados, fallidos)
    # exit 0 aunque haya fallidos individuales; solo fallo si no se publicó nada
    return 0 if publicados > 0 or saltados > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
