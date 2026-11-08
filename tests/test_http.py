"""Exercise the optional local server using real HTTP, not mocked responses."""
import json
import sys
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from serve import handler
from security_policy import headers_for_site


class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler(ROOT / "dist"))
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, path, method="GET"):
        request = urllib.request.Request(self.base + path, method=method)
        try:
            return urllib.request.urlopen(request)
        except HTTPError as error:
            return error

    def test_all_nine_headers_are_sent_over_http(self):
        with self.request("/") as response:
            self.assertEqual(response.status, 200)
            for name, value in headers_for_site(ROOT / "dist").items():
                self.assertEqual(response.headers[name], value)
            self.assertNotIn("noindex", response.headers.get("X-Robots-Tag", ""))

    def test_unknown_url_is_404_and_custom_page_is_not_a_soft_404(self):
        with self.request("/not-a-real-page") as response:
            self.assertEqual(response.status, 404)
            body = response.read().decode()
            self.assertIn("Page not found", body)
            self.assertIn('content="noindex,follow"', body)
            self.assertEqual(response.headers["X-Content-Type-Options"], "nosniff")

    def test_head_returns_status_and_headers_without_body(self):
        with self.request("/not-a-real-page", "HEAD") as response:
            self.assertEqual(response.status, 404)
            self.assertEqual(response.read(), b"")

    def test_private_source_is_not_packaged(self):
        for path in ("/src/layout.html", "/config/site.json", "/.git/config", "/scripts/build.py"):
            with self.request(path) as response:
                self.assertEqual(response.status, 404, path)

    def test_robots_sitemap_and_static_content_are_accessible(self):
        for path, marker in (("/robots.txt", "Sitemap:"), ("/sitemap.xml", "<urlset"), ("/plants.html", "Clusia")):
            with self.request(path) as response:
                self.assertEqual(response.status, 200)
                self.assertIn(marker, response.read().decode())


if __name__ == "__main__":
    unittest.main()
