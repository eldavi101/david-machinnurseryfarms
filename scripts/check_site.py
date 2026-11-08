"""Check page links, SEO identity, JSON-LD, images and generated output."""
import json
import re
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
from build import ROOT, ROUTES, build, route_url


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.ids = set()
        self.canonical = []
        self.alternates = {}
        self.h1 = 0
        self.schema = False
        self.schema_text = ""
        self.schema_count = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            assert a["id"] not in self.ids, f"Duplicate id: {a['id']}"
            self.ids.add(a["id"])
        if tag == "h1": self.h1 += 1
        if tag == "link" and a.get("rel") == "canonical": self.canonical.append(a["href"])
        if tag == "link" and a.get("rel") == "alternate": self.alternates[a.get("hreflang")] = a["href"]
        for key in ("href", "src"):
            if key in a: self.refs.append(a[key])
        if tag == "img":
            assert a.get("alt"), "Image missing descriptive alt text"
            assert a.get("width") and a.get("height"), "Image missing dimensions"
        if tag == "script" and a.get("type") == "application/ld+json":
            self.schema = True
            self.schema_text = ""

    def handle_data(self, text):
        if self.schema: self.schema_text += text

    def handle_endtag(self, tag):
        if tag == "script" and self.schema:
            json.loads(self.schema_text)
            self.schema_count += 1
            self.schema = False


def check():
    config = json.loads((ROOT / "config/site.json").read_text(encoding="utf-8"))
    base = config["url"]
    parsed = {}
    for pair in ROUTES:
        for path in pair[:2]:
            text = (ROOT / path).read_text(encoding="utf-8")
            assert "REPLACE_" not in text and "{{" not in text, f"Placeholder in {path}"
            page = Page()
            page.feed(text)
            assert page.h1 == 1, f"{path}: expected one h1"
            assert page.canonical == [base + route_url(path)], f"{path}: canonical mismatch"
            assert page.alternates.get("en") == base + route_url(pair[0])
            assert page.alternates.get("es") == base + route_url(pair[1])
            parsed[path] = page
    for path, page in parsed.items():
        for ref in page.refs:
            parts = urlsplit(ref)
            if parts.scheme or parts.netloc: continue
            target = ROOT / unquote(parts.path.lstrip('/')) if parts.path.startswith('/') else (ROOT / path).parent / unquote(parts.path)
            if not parts.path: target = ROOT / path
            if target.is_dir(): target /= "index.html"
            assert target.is_file(), f"{path}: broken reference {ref}"
            if parts.fragment:
                key = target.relative_to(ROOT).as_posix()
                assert key in parsed and parts.fragment in parsed[key].ids, f"{path}: missing anchor {ref}"
    urls = {node.text for node in ET.parse(ROOT / "sitemap.xml").iter() if node.tag.endswith('}loc')}
    assert urls == {base + route_url(path) for path in parsed}, "Sitemap page mismatch"
    with tempfile.TemporaryDirectory() as directory:
        output = Path(directory)
        build(output)
        for path in (*parsed, "sitemap.xml"):
            assert (output / path).read_bytes() == (ROOT / path).read_bytes(), f"Regenerate {path}"
    print(f"PASS: {len(parsed)} pages; local links, anchors, images, canonical/hreflang, JSON-LD, sitemap and reproducible generation")


if __name__ == "__main__":
    check()
