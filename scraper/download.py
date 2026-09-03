"""Fase 2: para UN video, resuelve el mp4 de streamtape (sin navegador) y lo
baja como HLS con ffmpeg a work/videos-hls/<video_id>/.

streamtape ya no necesita Playwright: la pagina /e/<id> trae el link real en
un getElementById('robotlink').innerHTML = 'PREFIX' + ('BODY').substring(n)...
"""
import re
import shutil
import logging
import subprocess

import requests

from config import HLS_DIR

log = logging.getLogger("download")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


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


def _ffmpeg_hls(src_url: str, dest_dir, titulo: str) -> bool:
    dest_dir.mkdir(parents=True, exist_ok=True)
    playlist = dest_dir / "index.m3u8"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "warning",
        "-user_agent", UA,
        "-i", src_url,
        "-c", "copy", "-bsf:a", "aac_adtstoasc",
        "-f", "hls", "-hls_time", "10", "-hls_list_size", "0",
        str(playlist),
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    ok = p.returncode == 0 and playlist.exists() and any(dest_dir.glob("*.ts"))
    if not ok:
        log.warning("  ffmpeg rc=%s: %s", p.returncode, (p.stderr or "")[-400:])
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
    return _ffmpeg_hls(mp4, dest, titulo)
