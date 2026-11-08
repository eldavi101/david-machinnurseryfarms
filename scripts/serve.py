"""Local preview with real security headers; this does not configure GitHub Pages."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from security_policy import headers_for_site
from build import ROOT


def handler(directory):
    security = headers_for_site(directory)

    class Handler(SimpleHTTPRequestHandler):
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
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler(ROOT / "dist"))
    print(f"Local secure preview: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()
