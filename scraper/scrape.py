"""Fase 1: scrapea el listado de xmoviesforyou.com y devuelve metadata por video.

Sustituye la celda 1 del notebook. En vez de escribir videos-{fecha}.txt
devuelve una lista de dicts en memoria.
"""
import re
import uuid
import logging
import concurrent.futures as cf
from urllib.parse import urljoin

import cloudscraper
from bs4 import BeautifulSoup

from config import SCRAPE_BASE_URL, SCRAPE_WORKERS

log = logging.getLogger("scrape")

NICHO_KEYWORDS_EN = [
    "housewife", "personal maid", "cleavage show", "detention sex", "risky sex",
    "real estate agent", "escort", "house cleaner", "oiled butt", "natural big tits",
    "4k", "hd", "ultra hd", "full video", "pov", "homemade", "amateur", "reality",
    "latina", "ebony", "asian", "interracial", "colombian", "big tits", "milf", "step sister",
]
TRANSLATE_MAP = {
    "ama de casa": "housewife", "madura": "mature", "tetona": "big tits",
    "jovencita": "teen", "estudiante": "student", "trío": "threesome",
}


def _ensure_nltk():
    import nltk
    for pkg in ("stopwords", "punkt", "punkt_tab"):
        try:
            nltk.data.find(f"corpora/{pkg}" if pkg == "stopwords" else f"tokenizers/{pkg}")
        except LookupError:
            nltk.download(pkg, quiet=True)


def limpiar_titulo(titulo: str) -> str:
    if not titulo:
        return "No Title"
    t = re.sub(r"^\[.*?\]\s*", "", titulo)
    t = re.sub(r"\s*/\s*\d{2}[\./]\d{2}[\./]\d{4}", "", t)
    return t.strip().rstrip("/").strip()


def generar_tags_en(texto: str) -> str:
    if not texto or texto == "No disponible":
        return ""
    from rake_nltk import Rake
    r = Rake(language="english")
    r.extract_keywords_from_text(texto)
    detectados = r.get_ranked_phrases()[:7]
    low = texto.lower()
    tags = set()
    for esp, eng in TRANSLATE_MAP.items():
        if esp in low:
            tags.add(eng)
    for w in NICHO_KEYWORDS_EN:
        if w in low:
            tags.add(w)
    for t in detectados:
        if len(t) > 3:
            tags.add(t)
    return ", ".join(list(tags)[:10])


def scrape_listing(limite: int) -> list[dict]:
    """Devuelve hasta `limite` dicts: id, titulo, actriz, studio, enlace, imagen,
    descripcion, tags_ia, TAG."""
    _ensure_nltk()
    scraper = cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "windows", "desktop": True}
    )
    log.info("Conectando a %s", SCRAPE_BASE_URL)
    resp = scraper.get(SCRAPE_BASE_URL, timeout=20)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    grid = soup.find(
        "div",
        class_="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    )
    if not grid:
        raise RuntimeError("No se encontró el contenedor de videos (cambió el HTML?)")

    # 1) Datos base de cada tarjeta del listado (sin red)
    bases = []
    for art in grid.find_all("a", href=True):
        if len(bases) >= limite:
            break
        href = urljoin(SCRAPE_BASE_URL, art.get("href", ""))
        if not href:
            continue
        img_tag = art.find("img")
        h3 = art.find("h3")
        bases.append({
            "href": href,
            "img_src": img_tag.get("src", "") if img_tag else "",
            "titulo": limpiar_titulo(h3.get_text(strip=True) if h3 else "No Title"),
        })

    # 2) Página de detalle de cada uno, en paralelo
    def _detalle(base: dict) -> dict:
        href, titulo = base["href"], base["titulo"]
        actriz = studio = descripcion = tags_ia = categorias = streamtape = ""
        try:
            rv = scraper.get(href, timeout=15)
            if rv.status_code == 200:
                m = re.search(r"https?://streamtape\.com/[ve]/([A-Za-z0-9]+)", rv.text)
                if m:
                    streamtape = f"https://streamtape.com/e/{m.group(1)}"
                sv = BeautifulSoup(rv.text, "html.parser")
                actrices, studios = [], []
                for a in sv.select("a[href]"):
                    hv = a.get("href", "").lower()
                    span = a.select_one("span.font-medium")
                    if not span:
                        continue
                    nombre = span.get_text(strip=True)
                    if not nombre:
                        continue
                    if "/pornstar/" in hv and nombre not in actrices:
                        actrices.append(nombre)
                    elif "/studio/" in hv and nombre not in studios:
                        studios.append(nombre)
                actriz = ", ".join(actrices)
                studio = ", ".join(studios)

                cat_div = sv.find("div", class_="flex flex-wrap justify-center gap-2")
                if cat_div:
                    cats = [
                        a.get_text(strip=True).replace("category", "").replace("Category", "").strip()
                        for a in cat_div.find_all("a")
                    ]
                    categorias = ", ".join(filter(None, cats))

                desc_div = sv.find(
                    "div",
                    class_="prose prose-lg prose-invert text-on-surface-variant/90 max-w-3xl mx-auto leading-relaxed",
                )
                if desc_div:
                    descripcion = " ".join(p.get_text(strip=True) for p in desc_div.find_all("p"))
                    tags_ia = generar_tags_en(descripcion)
        except Exception as e:
            log.warning("No se pudo leer detalle de %s: %s", href, e)

        log.info("listado: %s | actriz=%s | st=%s",
                 titulo[:45], actriz or "-", "si" if streamtape else "NO")
        return {
            "id": str(uuid.uuid4()),
            "titulo": titulo,
            "actriz": actriz,
            "studio": studio,
            "enlace": href,
            "streamtape": streamtape,
            "imagen": base["img_src"],
            "descripcion": descripcion,
            "tags_ia": tags_ia,
            "TAG": categorias,
        }

    with cf.ThreadPoolExecutor(max_workers=SCRAPE_WORKERS) as ex:
        resultados = list(ex.map(_detalle, bases))

    return resultados
