"""Fase 3: genera un preview mp4 corto (320px, ~5s) desde los .ts del HLS.

Sustituye la celda 7 del notebook.
"""
import shutil
import tempfile
import pathlib
import subprocess
import logging

from config import HLS_DIR, PREVIEW_DIR

log = logging.getLogger("preview")

ANCHO = 320
FPS = 30
SEGMENTOS = 5
DUR_POR_SEG = 1.0  # segundos


def generar_preview(video_id: str):
    carpeta = HLS_DIR / video_id
    salida = PREVIEW_DIR / f"{video_id}.mp4"
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    ts_files = sorted(carpeta.glob("*.ts"))
    if len(ts_files) < SEGMENTOS:
        log.warning("  muy pocos segmentos (%d) para preview %s", len(ts_files), video_id)
        return None

    total = len(ts_files)
    indices = [int(total * f) for f in (0.1, 0.3, 0.5, 0.7, 0.9)]
    seleccionados = [ts_files[i] for i in indices if i < total]

    tmp = pathlib.Path(tempfile.mkdtemp())
    try:
        trims = []
        for i, seg in enumerate(seleccionados):
            out = tmp / f"cut_{i}.ts"
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(seg),
                 "-t", str(DUR_POR_SEG), "-c", "copy", str(out)],
                check=False,
            )
            if out.exists():
                trims.append(out)
        if not trims:
            return None

        lista = tmp / "lista.txt"
        lista.write_text("".join(f"file '{p.resolve()}'\n" for p in trims))

        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
             "-i", str(lista), "-vf", f"fps={FPS},scale={ANCHO}:-2",
             "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-an", str(salida)],
            check=False,
        )
        if salida.exists():
            log.info("  preview OK: %s", video_id)
            return salida
        return None
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
