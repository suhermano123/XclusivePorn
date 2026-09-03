"""Orquestador del pipeline diario.

Flujo:
  1. scrape del listado -> metadata de LIMITE_VIDEOS*3 candidatos (detalle en paralelo)
  2. dedup en batch contra posted_videos.titulo (1 query)
  3. WORKERS videos en paralelo:  download -> preview -> upload R2 + Supabase -> borrar local
  4. resumen

Uso:  cd scraper && python run.py
Env:  LIMITE_VIDEOS, WORKERS, DL_CONNS, SCRAPE_WORKERS, UPLOAD_WORKERS
"""
import sys
import time
import shutil
import logging
import threading
import concurrent.futures as cf

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("run")

from config import LIMITE_VIDEOS, WORKERS, WORKDIR, HLS_DIR, PREVIEW_DIR
from scrape import scrape_listing
from download import download_video
from preview import generar_preview
from upload import publicar, titulos_existentes


def _limpiar_video(video_id: str):
    shutil.rmtree(HLS_DIR / video_id, ignore_errors=True)
    (PREVIEW_DIR / f"{video_id}.mp4").unlink(missing_ok=True)
    (HLS_DIR / f"{video_id}.src.mp4").unlink(missing_ok=True)


def _procesar(meta: dict) -> str:
    """Devuelve 'ok' | 'fail'. Limpia el local pase lo que pase."""
    titulo = meta["titulo"]
    vid = meta["id"]
    t0 = time.time()
    try:
        if not download_video(vid, titulo, meta.get("streamtape", "")):
            return "fail"
        generar_preview(vid)  # opcional
        if publicar(meta):
            log.info("PUBLICADO en %.0fs: %s", time.time() - t0, titulo[:50])
            return "ok"
        return "fail"
    except Exception as e:
        log.exception("error procesando %s: %s", titulo[:40], e)
        return "fail"
    finally:
        _limpiar_video(vid)


def main() -> int:
    for d in (WORKDIR, HLS_DIR, PREVIEW_DIR):
        d.mkdir(parents=True, exist_ok=True)

    t_start = time.time()
    log.info("=== scrape (limite=%d, workers=%d) ===", LIMITE_VIDEOS, WORKERS)
    candidatos = scrape_listing(LIMITE_VIDEOS * 3)
    log.info("candidatos: %d  (%.0fs)", len(candidatos), time.time() - t_start)

    ya = titulos_existentes([c["titulo"] for c in candidatos])
    pendientes = [c for c in candidatos if c["titulo"] and c["titulo"] not in ya]
    saltados = len(candidatos) - len(pendientes)
    log.info("nuevos: %d  ya existen: %d", len(pendientes), saltados)

    publicados = 0
    fallidos = 0
    lock = threading.Lock()
    stop = threading.Event()

    def _wrap(meta):
        if stop.is_set():
            return "skip"
        r = _procesar(meta)
        nonlocal publicados, fallidos
        with lock:
            if r == "ok":
                publicados += 1
                if publicados >= LIMITE_VIDEOS:
                    stop.set()
            elif r == "fail":
                fallidos += 1
        return r

    with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(_wrap, m) for m in pendientes]
        for _ in cf.as_completed(futs):
            if stop.is_set():
                for f in futs:
                    f.cancel()
                break

    dt = time.time() - t_start
    log.info("=== FIN  publicados=%d  fallidos=%d  saltados=%d  en %dm%02ds ===",
             publicados, fallidos, saltados, int(dt // 60), int(dt % 60))
    return 0 if (publicados > 0 or saltados > 0) else 1


if __name__ == "__main__":
    sys.exit(main())
