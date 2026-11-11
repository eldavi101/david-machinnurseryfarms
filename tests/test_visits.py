"""Real HTTP and persistent SQLite tests for the first-party counter."""
import concurrent.futures
import json
import sys
import tempfile
import threading
import unittest
import urllib.request
import uuid
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from serve import handler
from visit_store import VisitStore


class VisitTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.database = Path(self.directory.name) / "visits.sqlite3"
        self.store = VisitStore(self.database)
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), handler(ROOT / "dist", self.store))
        self.base = f"http://127.0.0.1:{self.server.server_port}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.directory.cleanup()

    def request(self, session=None, origin=None, body=None):
        headers = {"Origin": origin or self.base, "Content-Type": "application/json"}
        if session is not None:
            body = json.dumps({"session": session}).encode()
        request = urllib.request.Request(self.base + "/api/visits", data=body, headers=headers)
        try:
            return urllib.request.urlopen(request)
        except HTTPError as error:
            return error

    def count(self, session):
        with self.request(session) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers["Cache-Control"], "no-store")
            return json.load(response)["count"]

    def test_total_starts_at_zero_and_reads_do_not_increment(self):
        for _ in range(2):
            with self.request() as response:
                self.assertEqual(json.load(response), {"count": 0})

    def test_reload_navigation_and_retry_are_deduplicated_and_persistent(self):
        session = str(uuid.uuid4())
        self.assertEqual(self.count(session), 1)
        self.assertEqual(self.count(session), 1)
        self.assertEqual(self.count(str(uuid.uuid4())), 2)
        reopened = VisitStore(self.database)
        self.assertEqual(reopened.total(), 2)
        self.assertEqual(reopened.record(session), 2)

    def test_simultaneous_duplicate_and_distinct_sessions_are_atomic(self):
        session = str(uuid.uuid4())
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(set(pool.map(self.store.record, [session] * 16)), {1})
            list(pool.map(self.store.record, [str(uuid.uuid4()) for _ in range(16)]))
        self.assertEqual(self.store.total(), 17)

    def test_cross_origin_and_malformed_requests_never_increment(self):
        with self.request(str(uuid.uuid4()), origin="https://other.example") as response:
            self.assertEqual(response.status, 403)
        for body in (b"not-json", b'[]', b'{"session":"invalid"}', b'{"session":4}', b'{}', b'x' * 129):
            with self.request(body=body) as response:
                self.assertEqual(response.status, 400)
        self.assertEqual(self.store.total(), 0)

    def test_expired_identifiers_are_removed_without_resetting_total(self):
        session = str(uuid.uuid4())
        self.store.record(session)
        with self.store.connect() as connection:
            connection.execute("UPDATE sessions SET expires = 0")
        self.assertEqual(self.store.record(session), 2)
        with self.store.connect() as connection:
            self.assertEqual(connection.execute("SELECT count(*) FROM sessions").fetchone()[0], 1)

    def test_database_stores_hashes_not_raw_identifiers(self):
        session = str(uuid.uuid4())
        self.store.record(session)
        with self.store.connect() as connection:
            digest = connection.execute("SELECT digest FROM sessions").fetchone()[0]
        self.assertEqual(len(digest), 64)
        self.assertNotEqual(digest, session)
