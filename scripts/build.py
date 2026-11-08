"""Build the bilingual static site using only Python's standard library."""
import argparse
import html
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTES = [
    ("index.html", "es/index.html", "Home", "Inicio"),
    ("about.html", "es/nosotros.html", "About", "Nosotros"),
    ("services.html", "es/servicios.html", "Services", "Servicios"),
    ("plants.html", "es/plantas.html", "Plants", "Plantas"),
    ("gallery.html", "es/galeria.html", "Gallery", "Galería"),
    ("contact.html", "es/contacto.html", "Contact", "Contacto"),
    ("privacy.html", "es/privacidad.html", "Privacy", "Privacidad"),
]


def route_url(path):
    return "/" + path.removesuffix("index.html")


def build(output):
    config = json.loads((ROOT / "config/site.json").read_text(encoding="utf-8"))
    base = config["url"].rstrip("/")
    if urlsplit(base).scheme != "https" or not urlsplit(base).netloc:
        raise ValueError("site.url must be an absolute HTTPS URL")
    if config["analytics_id"] and not re.fullmatch(r"G-[A-Z0-9]+", config["analytics_id"]):
        raise ValueError("Invalid GA4 measurement ID")
    if not re.fullmatch(r"[0-9]{8,15}", config["whatsapp"]):
        raise ValueError("WhatsApp number must contain international digits only")
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", config["email"]):
        raise ValueError("Invalid contact email")
    esc = html.escape
    sitemap = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for pair in ROUTES:
        for lang_index, lang in enumerate(("en", "es")):
            path = pair[lang_index]
            page = json.loads((ROOT / "src/pages" / (path + ".json")).read_text(encoding="utf-8"))
            spanish = lang == "es"
            contact = route_url(ROUTES[5][lang_index])
            privacy = route_url(ROUTES[6][lang_index])
            nav = "\n".join(
                f'<a href="{route_url(item[lang_index])}"' + (' aria-current="page"' if item == pair else '') + f'>{item[2 + lang_index]}</a>'
                for item in ROUTES[:6]
            )
            alternate = pair[1 - lang_index]
            nav += f'\n<a href="{route_url(alternate)}" lang="{"en" if spanish else "es"}" hreflang="{"en" if spanish else "es"}">{"EN" if spanish else "ES"}</a>'
            tracking = ""
            if config["analytics_id"]:
                analytics = json.dumps(config["analytics_id"])
                tracking = f'<script async src="https://www.googletagmanager.com/gtag/js?id={esc(config["analytics_id"])}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag("js",new Date());gtag("config",{analytics});</script>'
            if config["bing_verification"]:
                tracking += f'<meta name="msvalidate.01" content="{esc(config["bing_verification"])}">'
            schema_data = json.loads(json.dumps(page["schema"]).replace("{{EMAIL}}", config["email"]))
            schemas = "\n".join('<script type="application/ld+json">' + json.dumps(s, ensure_ascii=False).replace("<", "\\u003c") + '</script>' for s in schema_data)
            document = (ROOT / "src/layout.html").read_text(encoding="utf-8")
            values = {
                "LANG": lang, "TITLE": esc(page["title"]), "DESCRIPTION": esc(page["description"]),
                "CANONICAL": base + route_url(path), "EN_URL": base + route_url(pair[0]),
                "ES_URL": base + route_url(pair[1]), "BASE": base,
                "NAV": nav, "MAIN": page["main"].replace("{{EMAIL}}", esc(config["email"])).replace("{{WHATSAPP}}", config["whatsapp"]), "SCHEMA": schemas, "TRACKING": tracking,
                "HOME": "/es/" if spanish else "/", "MENU": "Menú" if spanish else "Menu",
                "SKIP": "Ir al contenido principal" if spanish else "Skip to main content",
                "CONTACT": contact, "PRIVACY": privacy,
                "CONTACT_LABEL": "Contacto" if spanish else "Contact",
                "PRIVACY_LABEL": "Privacidad" if spanish else "Privacy",
                "CTA": "Consultar por WhatsApp" if spanish else "Ask on WhatsApp",
                "EMAIL": esc(config["email"]), "WHATSAPP": config["whatsapp"],
                "YEAR": str(date.today().year),
                "RIGHTS": "Todos los derechos reservados." if spanish else "All rights reserved.",
            }
            document = re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: values[m[1]], document)
            document = "\n".join(line.rstrip() for line in document.splitlines()) + "\n"
            target = output / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(document, encoding="utf-8", newline="\n")
            url = ET.SubElement(sitemap, "url")
            ET.SubElement(url, "loc").text = base + route_url(path)
    ET.indent(sitemap)
    (output / "sitemap.xml").write_bytes(ET.tostring(sitemap, encoding="utf-8", xml_declaration=True))
    print(f"Built 14 pages in {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT)
    args = parser.parse_args()
    build(args.output.resolve())
