# Scraper diario

Pipeline que trae contenido nuevo a novapornx.com. Reemplaza al notebook
`ScrapingMovies.ipynb`. Corre en GitHub Actions (`.github/workflows/scraper.yml`),
cron diario 07:00 UTC, y también a mano con *Run workflow*.

## Flujo (`run.py`)

Por-video, borrando el local después de cada uno (el runner tiene ~14 GB):

1. `scrape.py` — listado de `xmoviesforyou.com` → metadata (título, actriz, studio, tags).
2. dedup contra `posted_videos.titulo`.
3. `download.py` — Playwright resuelve el stream de streamtape → `ffmpeg` baja el HLS.
4. `preview.py` — recorta 5 trozos → preview mp4 de ~5 s / 320 px.
5. `upload.py` — sube a R2 con `Cache-Control` y crea la fila en Supabase.

## Destinos R2 → CDN

| bucket | dominio | contenido | Cache-Control |
|---|---|---|---|
| `videos-play` | `cdn.novapornx.com` | HLS `.m3u8` + `.ts` | `.ts` immutable 1a · `.m3u8` 1h |
| `videos-info` | `preview.novapornx.com` | preview mp4 | immutable 1a |
| `video-previews` | `img.novapornx.com` | thumbnail webp | immutable 1a |

Los 3 dominios tienen la Cache Rule `R2 media cache` (edge TTL 30 d).

## Secrets a configurar

GitHub → repo → Settings → Secrets and variables → Actions → **New repository secret**:

| nombre | qué es |
|---|---|
| `R2_ACCESS_KEY_ID` | Access Key ID de un **token R2 nuevo** (R2 → Manage R2 API Tokens → Create, permiso *Object Read & Write* sobre los 3 buckets) |
| `R2_SECRET_ACCESS_KEY` | el secret de ese token |
| `SUPABASE_KEY` | key de Supabase con permiso de `INSERT` en `posted_videos` (ideal `service_role`) |

> ⚠️ El notebook viejo tenía la Access Key + Secret de R2 y la key de Supabase
> hardcodeadas. **Revócalas** (R2 API Tokens → el token viejo → Delete) y genera
> unas nuevas solo para esto.

`R2_ACCOUNT_ID`, `SUPABASE_URL` y `LIMITE_VIDEOS` van como texto plano en el YAML
(no son secretos). Cambia `LIMITE_VIDEOS` ahí o al lanzar el workflow a mano.

## Local

```bash
cd scraper
python -m venv .venv && . .venv/Scripts/activate   # o source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium
python -m nltk.downloader stopwords punkt punkt_tab
export R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... SUPABASE_KEY=...
python run.py
```
