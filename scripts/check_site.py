"""Check page links, SEO identity, JSON-LD, images and generated output."""
import json
import re
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
from urllib.robotparser import RobotFileParser
from build import ROOT, ROUTES, build, route_url
from security_policy import digest


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
        self.titles = []
        self.in_title = False
        self.descriptions = []
        self.robots = []
        self.csp = []
        self.asset_integrities = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        assert not any(key.lower().startswith("on") for key in a), "Inline event handler forbidden by CSP"
        assert "style" not in a, "Inline style forbidden by CSP"
        if tag == "title":
            self.in_title = True
            self.titles.append("")
        if tag == "meta" and a.get("name") == "description": self.descriptions.append(a.get("content", ""))
        if tag == "meta" and a.get("name") == "robots": self.robots.append(a.get("content", "").lower())
        if tag == "meta" and a.get("http-equiv") == "Content-Security-Policy": self.csp.append(a.get("content", ""))
        if tag == "a":
            assert a.get("href"), "Link is not crawlable: missing href"
            assert not a["href"].lower().startswith(("javascript:", "data:")), "Unsafe link URL"
            if a.get("target") == "_blank":
                assert {"noopener", "noreferrer"}.issubset(a.get("rel", "").split()), "Unsafe new-window link"
        if tag in ("script", "link") and a.get("integrity"):
            self.asset_integrities.append((a.get("src", a.get("href")), a["integrity"]))
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
        if self.in_title: self.titles[-1] += text
        if self.schema: self.schema_text += text

    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
        if tag == "script" and self.schema:
            json.loads(self.schema_text)
            self.schema_count += 1
            self.schema = False


def check():
    config = json.loads((ROOT / "config/site.json").read_text(encoding="utf-8"))
    base = config["url"]
    parsed = {}
    titles = set()
    descriptions = set()
    robots = RobotFileParser()
    robots.parse((ROOT / "robots.txt").read_text(encoding="utf-8").splitlines())
    for pair in ROUTES:
        for path in pair[:2]:
            text = (ROOT / path).read_text(encoding="utf-8")
            assert "REPLACE_" not in text and "{{" not in text, f"Placeholder in {path}"
            page = Page()
            page.feed(text)
            assert page.h1 == 1, f"{path}: expected one h1"
            assert len(page.titles) == 1 and page.titles[0].strip(), f"{path}: missing or duplicate title tag"
            assert page.titles[0].casefold() not in titles, f"{path}: duplicate title"
            titles.add(page.titles[0].casefold())
            assert len(page.descriptions) == 1 and page.descriptions[0].strip(), f"{path}: missing description"
            assert page.descriptions[0].casefold() not in descriptions, f"{path}: duplicate description"
            descriptions.add(page.descriptions[0].casefold())
            assert len(page.robots) == 1 and not re.search(r"(?:^|[\s,])(noindex|none)(?:$|[\s,])", page.robots[0]), f"{path}: indexing blocked"
            for agent in ("Googlebot", "Bingbot", "GPTBot"):
                assert robots.can_fetch(agent, base + route_url(path)), f"{path}: robots.txt blocks {agent}"
            main = re.search(r"<main\b[^>]*>(.*?)</main>", text, re.S)
            assert main and len(re.sub(r"<[^>]+>", " ", main[1]).split()) > 30, f"{path}: important content missing from static HTML"
            assert len(page.csp) == 1 and "'unsafe-inline'" not in page.csp[0] and "'unsafe-eval'" not in page.csp[0], f"{path}: weak or missing CSP"
            assert "frame-ancestors" not in page.csp[0], "frame-ancestors only works in an HTTP header"
            assert 'name="referrer" content="no-referrer"' in text
            for asset, integrity in page.asset_integrities:
                assert digest((ROOT / urlsplit(asset).path.lstrip('/')).read_bytes()) == integrity, f"{path}: broken SRI for {asset}"
            assert len(page.asset_integrities) == 2, f"{path}: stylesheet/script integrity missing"
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
        for path in (*parsed, "sitemap.xml", "404.html"):
            assert (output / path).read_bytes() == (ROOT / path).read_bytes(), f"Regenerate {path}"
    not_found = Page()
    not_found.feed((ROOT / "404.html").read_text(encoding="utf-8"))
    assert not_found.h1 == 1 and "noindex,follow" in not_found.robots and not not_found.canonical
    assert base + "/404.html" not in urls
    graph = {}
    for path, page in parsed.items():
        links = set()
        for ref in page.refs:
            parts = urlsplit(ref)
            if parts.scheme or parts.netloc: continue
            target = ROOT / parts.path.lstrip('/') if parts.path.startswith('/') else (ROOT / path).parent / parts.path
            if target.is_dir(): target /= 'index.html'
            key = target.relative_to(ROOT).as_posix()
            if key in parsed: links.add(key)
        graph[path] = links
    reachable, pending = set(), ['index.html']
    while pending:
        key = pending.pop()
        if key not in reachable:
            reachable.add(key)
            pending.extend(graph[key] - reachable)
    assert reachable == set(parsed), "Orphan pages are unreachable through HTML links"
    print(f"PASS: {len(parsed)} pages; unique titles/descriptions, robots/noindex, crawlable links, no orphan pages, static content, canonical/hreflang, JSON-LD, sitemap, CSP/SRI and reproducible generation")


if __name__ == "__main__":
    check()
