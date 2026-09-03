"""Fase 2: para UN video, resuelve el mp4 de streamtape (sin navegador) y lo
deja como HLS en work/videos-hls/<video_id>/.

streamtape estrangula por conexión (~0.7 MB/s) pero acepta Range requests, así
que bajamos el mp4 con DL_CONNS conexiones en paralelo (~7-8 MB/s) a disco y
después ffmpeg -c copy lo remuxea a HLS (rápido, es I/O local). Si el server no
soporta rangos o algo falla, se cae al método viejo (ffmpeg leyendo la URL).
"""
import os
import re
import time
import shutil
import logging
import threading
import subprocess
import concurrent.futures as cf

import requests

from config import HLS_DIR, DL_CONNS

log = logging.getLogger("download")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

_FFMPEG_TIMEOUT = 25 * 60  # tope duro por si un remux/stream se cuelga


def _eval_innerhtml(expr: str) -> str | None:
    """'PREFIX' + ('BODY').substring(1).substring(2)  ->  PREFIX + BODY[3:]"""
    m = re.match(
        r"""\s*["'](.*?)["']\s*\+\s*\(?\s*["'](.*?)["']\s*\)?((?:\s*\.substring\(\d+\))*)""",
        expr,
    )
    if not m:
        return None
    prefix, body, subs = m.group(1), m.group(2), m.group(3)
    for n in re.findall(r"substring\((\d+)\)", subs):
        body = body[int(n):]
    return prefix + body


def resolver_streamtape(embed_url: str, sess: requests.Session) -> str | None:
    r = sess.get(embed_url, timeout=25)
    r.raise_for_status()
    for m in re.finditer(r"getElementById\('([a-z]+)'\)\.innerHTML\s*=\s*(.+?);", r.text):
        name, expr = m.group(1), m.group(2)
        if "link" not in name:
            continue
        rel = _eval_innerhtml(expr)
        if not rel or "get_video" not in rel:
            continue
        url = ("https:" + rel) if rel.startswith("//") else rel
        url += "&stream=1"
        try:
            h = sess.get(url, timeout=25, stream=True, allow_redirects=True)
            ok = h.status_code == 200 and "video" in (h.headers.get("Content-Type") or "")
            h.close()
            if ok:
                return url
        except Exception:
            continue
    return None


# ─── descarga multi-conexión ────────────────────────────────────────────────
def _probe(url: str) -> tuple[int, bool]:
    """Devuelve (content_length, soporta_rangos)."""
    s = requests.Session()
    s.headers.update({"User-Agent": UA})
    h = s.get(url, timeout=30, stream=True, allow_redirects=True)
    try:
        length = int(h.headers.get("Content-Length") or 0)
        accepts = (h.headers.get("Accept-Ranges") or "").lower() == "bytes"
    finally:
        h.close()
    if length and not accepts:  # algunos mienten en Accept-Ranges
        rr = s.get(url, headers={"Range": "bytes=0-1023"}, timeout=20, stream=True)
        accepts = rr.status_code == 206
        rr.close()
    return length, (accepts and length > 0)


def _download_range(url: str, path: str, lo: int, hi: int,
                    lock: threading.Lock, progress: list, retries: int = 3):
    for attempt in range(retries):
        try:
            s = requests.Session()
            s.headers.update({"User-Agent": UA})
            r = s.get(url, headers={"Range": f"bytes={lo}-{hi}"}, timeout=60, stream=True)
            if r.status_code not in (200, 206):
                raise RuntimeError(f"range status {r.status_code}")
            pos = lo
            with open(path, "r+b") as f:
                for chunk in r.iter_content(1 << 20):
                    if not chunk:
                        continue
                    with lock:
                        f.seek(pos)
                        f.write(chunk)
                    pos += len(chunk)
                    progress[0] += len(chunk)
            r.close()
            if pos - 1 >= hi:
                return
            raise RuntimeError(f"rango corto {pos - 1} < {hi}")
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


def _parallel_download(url: str, dest_mp4: str, conns: int) -> bool:
    length, ranged = _probe(url)
    if not ranged:
        log.info("  (sin soporte de rangos) -> fallback stream")
        return False

    conns = max(1, min(conns, 32))
    with open(dest_mp4, "wb") as f:
        f.truncate(length)

    step = (length + conns - 1) // conns
    spans = [(i * step, min((i + 1) * step, length) - 1) for i in range(conns)]
    spans = [(lo, hi) for lo, hi in spans if lo <= hi]

    lock = threading.Lock()
    progress = [0]
    t0 = time.time()
    done = threading.Event()

    def _watch():
        while not done.wait(15):
            mb = progress[0] / 1e6
            spd = mb / max(time.time() - t0, 0.1)
            log.info("    %.0f%%  %.0f/%.0f MB  %.1f MB/s",
                     100 * progress[0] / length, mb, length / 1e6, spd)

    threading.Thread(target=_watch, daemon=True).start()
    try:
        with cf.ThreadPoolExecutor(max_workers=conns) as ex:
            futs = [ex.submit(_download_range, url, dest_mp4, lo, hi, lock, progress)
                    for lo, hi in spans]
            for fu in cf.as_completed(futs):
                fu.result()
    finally:
        done.set()

    got = os.path.getsize(dest_mp4)
    dt = time.time() - t0
    log.info("  bajado %.0f MB en %.0fs (%.1f MB/s, %d conns)",
             got / 1e6, dt, got / 1e6 / max(dt, 0.1), conns)
    return got >= length * 0.999


# ─── remux / fallback ───────────────────────────────────────────────────────
def _remux_local(mp4_path: str, dest_dir) -> bool:
    dest_dir.mkdir(parents=True, exist_ok=True)
    playlist = dest_dir / "index.m3u8"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "warning",
        "-i", mp4_path,
        "-c", "copy", "-bsf:a", "aac_adtstoasc",
        "-f", "hls", "-hls_time", "10", "-hls_list_size", "0",
        str(playlist),
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=_FFMPEG_TIMEOUT)
    ok = p.returncode == 0 and playlist.exists() and any(dest_dir.glob("*.ts"))
    if not ok:
        log.warning("  remux rc=%s: %s", p.returncode, (p.stderr or "")[-400:])
    return ok


def _hls_stream(src_url: str, dest_dir) -> bool:
    dest_dir.mkdir(parents=True, exist_ok=True)
    playlist = dest_dir / "index.m3u8"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "warning",
        "-user_agent", UA,
        "-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "5",
        "-i", src_url,
        "-c", "copy", "-bsf:a", "aac_adtstoasc",
        "-f", "hls", "-hls_time", "10", "-hls_list_size", "0",
        str(playlist),
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=_FFMPEG_TIMEOUT)
    ok = p.returncode == 0 and playlist.exists() and any(dest_dir.glob("*.ts"))
    if not ok:
        log.warning("  ffmpeg stream rc=%s: %s", p.returncode, (p.stderr or "")[-400:])
    return ok


def download_video(video_id: str, titulo: str, embed_url: str) -> bool:
    """True si work/videos-hls/<video_id>/ quedó con index.m3u8 + segmentos.
    `embed_url` = https://streamtape.com/e/<id> (viene de scrape.py)."""
    if not embed_url:
        log.warning("  sin streamtape: %s", titulo[:45])
        return False

    dest = HLS_DIR / video_id
    if dest.exists():
        shutil.rmtree(dest)

    sess = requests.Session()
    sess.headers.update({"User-Agent": UA})
    try:
        mp4 = resolver_streamtape(embed_url, sess)
    except Exception as e:
        log.warning("  streamtape %s: %s", embed_url, e)
        return False
    if not mp4:
        log.warning("  no se resolvió el mp4: %s", titulo[:45])
        return False

    log.info("  bajando: %s", titulo[:45])
    tmp_mp4 = str(HLS_DIR / f"{video_id}.src.mp4")
    t0 = time.time()
    try:
        if _parallel_download(mp4, tmp_mp4, DL_CONNS):
            tr = time.time()
            ok = _remux_local(tmp_mp4, dest)
            log.info("  download=%.0fs remux=%.0fs %s",
                     tr - t0, time.time() - tr, titulo[:35])
            if ok:
                return True
            log.warning("  remux falló -> fallback stream")
    except subprocess.TimeoutExpired:
        log.warning("  ffmpeg timeout -> fallback stream")
    except Exception as e:
        log.warning("  descarga paralela falló (%s) -> fallback stream", e)
    finally:
        try:
            os.remove(tmp_mp4)
        except OSError:
            pass

    if dest.exists():
        shutil.rmtree(dest, ignore_errors=True)
    try:
        ok = _hls_stream(mp4, dest)
        log.info("  fallback total=%.0fs %s", time.time() - t0, titulo[:35])
        return ok
    except subprocess.TimeoutExpired:
        log.warning("  fallback ffmpeg timeout: %s", titulo[:45])
        return False
