"""Fase 2: para UN video, resuelve el stream (streamtape) con Playwright y baja
el HLS con ffmpeg a work/videos-hls/<video_id>/.

Sustituye la celda 5 del notebook, pero por-video (no batch) para no llenar disco.
"""
import re
import shutil
import asyncio
import logging

from playwright.async_api import async_playwright

from config import HLS_DIR

log = logging.getLogger("download")


def _hms(s: str) -> float:
    try:
        h, m, sec = s.split(":")
        return int(h) * 3600 + int(m) * 60 + float(sec)
    except Exception:
        return 0.0


async def _ffmpeg_hls(src_url: str, dest_dir, titulo: str) -> bool:
    dest_dir.mkdir(parents=True, exist_ok=True)
    playlist = dest_dir / "index.m3u8"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "info",
        "-headers", "User-Agent: Mozilla/5.0\r\nReferer: https://streamtape.com/\r\n",
        "-i", src_url,
        "-c", "copy",
        "-f", "hls",
        "-hls_time", "10",
        "-hls_list_size", "0",
        str(playlist),
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    last = 0
    while True:
        line = await proc.stderr.readline()
        if not line:
            break
        m = re.search(r"time=(\d{2}:\d{2}:\d{2}\.\d{2})", line.decode(errors="ignore"))
        if m:
            cur = int(_hms(m.group(1)))
            if cur - last >= 30:
                log.info("  %s: %ds descargados", titulo[:30], cur)
                last = cur
    await proc.wait()
    ok = proc.returncode == 0 and playlist.exists() and any(dest_dir.glob("*.ts"))
    if not ok:
        log.warning("  ffmpeg falló (rc=%s) para %s", proc.returncode, titulo[:40])
    return ok


async def _resolve_and_download(video_id: str, titulo: str, page_url: str) -> bool:
    dest = HLS_DIR / video_id
    if dest.exists():
        shutil.rmtree(dest)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(user_agent="Mozilla/5.0")
        page = await ctx.new_page()
        try:
            await page.goto(page_url, timeout=60000)
            el = page.locator("a[href*='streamtape.com']").first
            url_st = await el.get_attribute("href")
            if not url_st:
                log.warning("  sin enlace streamtape: %s", titulo[:40])
                return False

            await page.goto(url_st, timeout=60000)
            bot = await page.evaluate("document.getElementById('norobotlink')?.innerText")
            if not bot:
                log.warning("  sin norobotlink: %s", titulo[:40])
                return False
            final_url = "https:" + bot if bot.startswith("//") else bot

            await page.goto(final_url, timeout=60000)
            data = await page.evaluate(
                "() => { const v = document.querySelector('video');"
                " return v ? {src: (v.currentSrc || v.src)} : null; }"
            )
            if not data or not data.get("src"):
                log.warning("  sin <video> src: %s", titulo[:40])
                return False

            return await _ffmpeg_hls(data["src"], dest, titulo)
        finally:
            await page.close()
            await ctx.close()
            await browser.close()


def download_video(video_id: str, titulo: str, page_url: str) -> bool:
    """True si work/videos-hls/<video_id>/ quedó con index.m3u8 + segmentos."""
    return asyncio.run(_resolve_and_download(video_id, titulo, page_url))
