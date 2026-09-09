"""Backfill: re-comprime a calidad 74 las miniaturas que ya estaban en R2
de antes de la baja de calidad 82->74 del 2026-09-09 (commit 44a453c).

A diferencia de backfill_thumbnails.py, este NO toca Supabase -- las
imagenes ya estan en la key correcta (BUCKET_IMAGES/<uuid>.webp), esto
solo sobreescribe el objeto en R2 con una version mas liviana. Lista
TODOS los objetos del bucket y los reprocesa; correrlo de nuevo no rompe
nada -- en el peor caso reprocesa objetos que ya estan en calidad 74 (el
resultado sale igual de liviano, no pasa nada malo). Si la recompresion
sale MAS pesada que el original (le paso al logo del navbar por tener un
degradado -- ver commit 44a453c) se deja el original intacto.

OJO -- Cache-Control: estas imagenes se sirven con
"public, max-age=31536000, immutable". Sobreescribir el objeto en R2 NO
hace que Cloudflare descarte lo que ya tiene cacheado en el edge para esa
URL exacta -- hasta que ese cache expire solo, o se purgue a mano
(dashboard de Cloudflare: Caching -> Configuration -> Custom Purge ->
hostname img.novapornx.com), Lighthouse y los visitantes que ya
cachearon esa URL van a seguir viendo el archivo viejo un rato.

Uso local:
  cd scraper
  export R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=...
  python recompress_thumbnails.py              # todo el bucket
  python recompress_thumbnails.py --limite 10  # prueba con 10
"""
import argparse
import concurrent.futures as cf
import logging

import boto3

from config import (
    R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
    BUCKET_IMAGES, CC_IMMUTABLE,
)
from upload import _optimizar

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("recompress_thumbnails")

s3 = boto3.client(
    "s3", endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
)


def listar_claves() -> list[str]:
    claves = []
    token = None
    while True:
        kwargs = {"Bucket": BUCKET_IMAGES}
        if token:
            kwargs["ContinuationToken"] = token
        resp = s3.list_objects_v2(**kwargs)
        claves.extend(o["Key"] for o in resp.get("Contents", []))
        if not resp.get("IsTruncated"):
            break
        token = resp["NextContinuationToken"]
    return claves


def recomprimir_uno(key: str) -> str:
    """Devuelve 'ok', 'sin_mejora' o 'error'."""
    try:
        obj = s3.get_object(Bucket=BUCKET_IMAGES, Key=key)
        original = obj["Body"].read()
        nuevo = _optimizar(original)
        if len(nuevo) >= len(original):
            log.info("  %s: recompresion no mejora (%d -> %d bytes), se deja igual", key, len(original), len(nuevo))
            return "sin_mejora"
        s3.put_object(
            Bucket=BUCKET_IMAGES, Key=key, Body=nuevo,
            ContentType="image/webp", CacheControl=CC_IMMUTABLE,
        )
        log.info("  %s: %d -> %d bytes", key, len(original), len(nuevo))
        return "ok"
    except Exception as e:
        log.warning("  error en %s: %s", key, e)
        return "error"


def main(limite: int = 0) -> int:
    claves = listar_claves()
    log.info("miniaturas en el bucket: %d", len(claves))
    if limite > 0:
        claves = claves[:limite]
        log.info("recortado a %d por --limite", limite)

    if not claves:
        log.info("nada que procesar")
        return 0

    resultados = {"ok": 0, "sin_mejora": 0, "error": 0}
    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        for r in ex.map(recomprimir_uno, claves):
            resultados[r] += 1

    log.info("listo: %s de %d totales", resultados, len(claves))
    return 0 if resultados["error"] == 0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limite", type=int, default=0, help="procesar como maximo N objetos (0 = todos)")
    args = parser.parse_args()
    raise SystemExit(main(args.limite))
