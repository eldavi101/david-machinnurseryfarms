"""Local preview with real security headers; this does not configure GitHub Pages."""
import argparse
import json
import sqlite3
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from security_policy import headers_for_site
from build import ROOT
from visit_store import VisitStore


def handler(directory, store=None, public_origin=None):
    security = headers_for_site(directory)

    class Handler(SimpleHTTPRequestHandler):
        def counter_response(self, status, data, head=False):
            body = json.dumps(data).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if not head:
                self.wfile.write(body)

        def read_counter(self, head=False):
            if not store:
                self.counter_response(503, {"error": "Counter not configured"}, head)
                return
            try:
                self.counter_response(200, {"count": store.total()}, head)
            except sqlite3.Error:
                self.counter_response(503, {"error": "Counter unavailable"}, head)

        def do_GET(self):
            if self.path.split("?", 1)[0] == "/api/visits":
                self.read_counter()
            else:
                super().do_GET()

        def do_HEAD(self):
            if self.path.split("?", 1)[0] == "/api/visits":
                self.read_counter(head=True)
            else:
                super().do_HEAD()

        def do_POST(self):
            if self.path != "/api/visits":
                self.counter_response(405, {"error": "Method not allowed"})
                return
            if not store:
                self.counter_response(503, {"error": "Counter not configured"})
                return
            origin = public_origin or f"http://127.0.0.1:{self.server.server_port}"
            if self.headers.get("Origin") != origin or self.headers.get("Sec-Fetch-Site") not in (None, "same-origin"):
                self.counter_response(403, {"error": "Origin not allowed"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 128 or self.headers.get("Transfer-Encoding"):
                    raise ValueError()
                if self.headers.get("Content-Type", "").split(";", 1)[0] != "application/json":
                    raise ValueError()
                self.connection.settimeout(5)
                data = json.loads(self.rfile.read(length))
                if not isinstance(data, dict) or set(data) != {"session"}:
                    raise ValueError()
                count = store.record(data["session"])
            except (ValueError, UnicodeError, OSError):
                self.counter_response(400, {"error": "Invalid request"})
                return
            except sqlite3.Error:
                self.counter_response(503, {"error": "Counter unavailable"})
                return
            self.counter_response(200, {"count": count})

        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

        def end_headers(self):
            for name, value in security.items(): self.send_header(name, value)
            super().end_headers()

        def list_directory(self, path):
            self.send_error(404)
            return None

        def send_error(self, code, message=None, explain=None):
            if code != 404:
                return super().send_error(code, message, explain)
            body = (directory / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD": self.wfile.write(body)

    return Handler


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8001)
    parser.add_argument("--database", type=Path, default=ROOT / ".data/visits.sqlite3")
    parser.add_argument("--origin", default=None, help="Public HTTPS origin when behind a reverse proxy")
    args = parser.parse_args()
    database = args.database.resolve()
    if database == ROOT / "dist" or ROOT / "dist" in database.parents:
        parser.error("Database must be outside the public dist directory")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler(ROOT / "dist", VisitStore(database), args.origin))
    print(f"Local secure preview: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()
