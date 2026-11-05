#!/usr/bin/env python3
"""P4 anonymous profile/session schema tests; stdlib SQLite only."""
from pathlib import Path
import sqlite3
import unittest

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [ROOT / "migrations/0001_p4_community_knowledge.sql",
              ROOT / "migrations/0002_p4_anonymous_profiles.sql"]

class P4AnonymousProfileTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys=ON")
        for migration in MIGRATIONS:
            self.db.executescript(migration.read_text(encoding="utf-8"))
        self.db.execute("""INSERT INTO contributors
          (id,display_name,professional_title,qualification,profile_completed,status,created_at,updated_at)
          VALUES ('u1','Tech One','Maintenance technician',NULL,1,'active','now','now')""")
        self.db.execute("""INSERT INTO contributor_sessions
          (id,contributor_id,token_sha256,created_at,expires_at,last_seen_at)
          VALUES ('s1','u1','hash1','now','2099-01-01T00:00:00Z','now')""")

    def tearDown(self):
        self.db.close()

    def test_profile_fields_persist_once(self):
        row = self.db.execute("""SELECT display_name,professional_title,qualification,profile_completed
          FROM contributors WHERE id='u1'""").fetchone()
        self.assertEqual(row, ('Tech One','Maintenance technician',None,1))

    def test_session_hash_unique(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("""INSERT INTO contributor_sessions
              (id,contributor_id,token_sha256,created_at,expires_at,last_seen_at)
              VALUES ('s2','u1','hash1','now','2099-01-01','now')""")

    def test_session_revocation_is_recorded(self):
        self.db.execute("UPDATE contributor_sessions SET revoked_at='now' WHERE id='s1'")
        revoked = self.db.execute("SELECT revoked_at FROM contributor_sessions WHERE id='s1'").fetchone()[0]
        self.assertEqual(revoked, 'now')

    def test_sessions_cascade_on_contributor_deletion(self):
        self.db.execute("DELETE FROM contributors WHERE id='u1'")
        count = self.db.execute("SELECT COUNT(*) FROM contributor_sessions").fetchone()[0]
        self.assertEqual(count, 0)

    def test_profile_is_self_declared_not_verified(self):
        columns = {row[1] for row in self.db.execute("PRAGMA table_info(contributors)")}
        self.assertTrue({'display_name','professional_title','qualification','profile_completed'} <= columns)
        self.assertNotIn('verified_qualification', columns)

if __name__ == "__main__":
    unittest.main(verbosity=2)
