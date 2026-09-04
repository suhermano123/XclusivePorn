# Scraper diario

Pipeline que trae contenido nuevo a novapornx.com. Reemplaza al notebook
`ScrapingMovies.ipynb`. Corre en GitHub Actions (`.github/workflows/scraper.yml`),
cron diario 07:00 UTC, y también a mano con *Run workflow*.

## Flujo (`run.py`)

1. `scrape.py` — listado de `xmoviesforyou.com`; el detalle de cada tarjeta
   (streamtape, actriz, studio, tags) se baja en paralelo (`SCRAPE_WORKERS`).
2. dedup por **título normalizado** (sin acentos/puntuación, minúsculas, espacios
   colapsados): se baja la columna `titulo` de toda la tabla `posted_videos` una
   vez, se descartan los candidatos que ya existen y los repetidos dentro del
   propio lote. Además, antes de descargar cada video un worker lo *reserva* de
   forma atómica (dos workers no procesan la misma peli en paralelo) y justo
   antes del `INSERT` se vuelve a consultar la DB. Nada se descarga ni se
   inserta dos veces.
3. `WORKERS` videos a la vez. Por video:
   - `download.py` — resuelve el mp4 de streamtape (sin navegador) y lo baja con
     `DL_CONNS` conexiones en paralelo (streamtape estrangula por conexión a
     ~0.7 MB/s; con 16 conns son ~7-8 MB/s). Después `ffmpeg -c copy` remuxea el
     mp4 local a HLS. Si el server no acepta Range, cae al método viejo
     (`ffmpeg` leyendo la URL).
   - `preview.py` — recorta 5 trozos → preview mp4 de ~5 s / 320 px.
   - `upload.py` — sube los `.ts` a R2 en paralelo (`UPLOAD_WORKERS`), el
     `.m3u8` al final, y crea la fila en Supabase.
   - borra el local.

Un video ~650 MB pasó de ~15 min a ~2 min. Cada fase loguea su tiempo
(`download=Xs remux=Ys`, `subidos N .ts en Zs`, `PUBLICADO en Ws`).

### Env de paralelismo (opcional, todo tiene default)

| var | default | qué |
|---|---|---|
| `LIMITE_VIDEOS` | 24 | videos a publicar por corrida |
| `WORKERS` | 3 | videos procesados a la vez |
| `DL_CONNS` | 16 | conexiones HTTP por descarga |
| `SCRAPE_WORKERS` | 6 | páginas de detalle en paralelo |
| `UPLOAD_WORKERS` | 16 | subidas `.ts` a R2 en paralelo |

Ojo con el disco: pico ≈ `WORKERS × ~1.3 GB`. Con `WORKERS=3` sobra en el runner.

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
