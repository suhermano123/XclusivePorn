"""Backfill: migra a R2 las miniaturas de videos viejos que todavia apuntan
directo al dominio de origen (xmoviescdn.online) en vez de a img.novapornx.com.

Por que existe: `subir_thumbnail()` (Fase 4, subida a R2 con optimizacion
webp) se agrego en la reescritura de scraper/ de septiembre 2026. Los videos
insertados ANTES de eso -- una tanda entera de marzo 2026, ~186 de ~700 al
momento de escribir esto -- se guardaron con la URL cruda del scraper viejo
en `imagen_url`. Cada vista de esos videos hace un fetch en vivo cruzado a
xmoviescdn.online via /image-proxy: sin cache de CDN, sin la compresion
ajustada de _optimizar().

No corre en el cron diario -- es un job aparte, manual (workflow_dispatch),
pensado para correrse una sola vez (y de nuevo despues si aparecen mas
rezagados). Reusa subir_thumbnail() de upload.py tal cual: ya hace
`head_object` antes de subir, asi que si se corre dos veces no hace nada
la segunda vez.

Uso local:
  cd scraper
  export SUPABASE_URL=... SUPABASE_KEY=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=...
  python backfill_thumbnails.py              # migra todo lo pendiente
  python backfill_thumbnails.py --limite 10  # prueba con 10 nada mas
"""
import argparse
import concurrent.futures as cf
import logging

from supabase import create_client

from config import SUPABASE_URL, SUPABASE_KEY
from upload import subir_thumbnail

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("backfill_thumbnails")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def _es_legacy(imagen_url: str) -> bool:
    """True si la miniatura todavia no paso por subir_thumbnail() (no esta
    en R2). Una imagen_url vacia no cuenta -- sin URL de origen no hay nada
    que migrar."""
    if not imagen_url:
        return False
    return "img.novapornx.com" not in imagen_url and ".r2.dev" not in imagen_url


def videos_pendientes() -> list[dict]:
    out = []
    paso = 500
    desde = 0
    while True:
        res = (
            supabase.table("posted_videos")
            .select("uuid,imagen_url,img_src")
            .range(desde, desde + paso - 1)
            .execute()
        )
        filas = res.data or []
        out.extend(filas)
        if len(filas) < paso:
            break
        desde += paso

    pendientes = []
    for f in out:
        origen = f.get("imagen_url") or f.get("img_src") or ""
        if _es_legacy(origen):
            pendientes.append({"uuid": f["uuid"], "origen": origen})
    return pendientes


def migrar_uno(video: dict) -> bool:
    uuid, origen = video["uuid"], video["origen"]
    nueva_url, _ = subir_thumbnail(uuid, origen)
    if not nueva_url:
        log.warning("  no se pudo migrar %s (%s)", uuid, origen[:80])
        return False
    supabase.table("posted_videos").update({"imagen_url": nueva_url}).eq("uuid", uuid).execute()
    log.info("  migrado %s -> %s", uuid, nueva_url)
    return True


def main(limite: int = 0) -> int:
    pendientes = videos_pendientes()
    log.info("videos con miniatura legacy (fuera de R2): %d", len(pendientes))
    if limite > 0:
        pendientes = pendientes[:limite]
        log.info("recortado a %d por --limite", limite)

    if not pendientes:
        log.info("nada que migrar")
        return 0

    ok = fail = 0
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for exito in ex.map(migrar_uno, pendientes):
            ok += 1 if exito else 0
            fail += 0 if exito else 1

    log.info("listo: %d migrados, %d fallidos, %d totales", ok, fail, len(pendientes))
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limite", type=int, default=0, help="migrar como maximo N videos (0 = todos)")
    args = parser.parse_args()
    raise SystemExit(main(args.limite))
