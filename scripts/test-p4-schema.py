#!/usr/bin/env python3
"""Behavioral tests for the P4 D1/SQLite schema; uses Python's stdlib only."""
from pathlib import Path
import sqlite3
import unittest

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "migrations" / "0001_p4_community_knowledge.sql"


class P4SchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys = ON")
        self.db.executescript(MIGRATION.read_text(encoding="utf-8"))
        self.db.execute(
            "INSERT INTO contributors VALUES (?, ?, 'active', ?, ?)",
            ("u1", "Technician One", "2026-10-31T00:00:00Z", "2026-10-31T00:00:00Z"),
        )
        self.db.execute("""
            INSERT INTO knowledge_claims
            (id, submitted_by, claim_type, current_revision, evidence_class,
             review_status, diagnostic_eligible, created_at, updated_at)
            VALUES ('c1', 'u1', 'inspection', 1, 'personal-local',
                    'candidate', 0, 'now', 'now')
        """)
        self.db.execute("""
            INSERT INTO claim_revisions
            (id, claim_id, revision_number, claim_text, extraction_method, edited_by, created_at)
            VALUES ('r1', 'c1', 1, 'Check coupling alignment', 'manual', 'u1', 'now')
        """)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_approval_activates_current_revision_without_upgrading_evidence(self):
        self.db.execute("""
            INSERT INTO claim_approvals
            (id, claim_id, revision_number, approved_by, rationale, approved_at)
            VALUES ('a1', 'c1', 1, 'u1', 'I confirm this field observation', 'now')
        """)
        status, eligible, evidence = self.db.execute("""
            SELECT review_status, diagnostic_eligible, evidence_class
            FROM knowledge_claims WHERE id='c1'
        """).fetchone()
        self.assertEqual((status, eligible, evidence),
                         ("community-approved", 1, "personal-local"))

    def test_revision_is_immutable(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE claim_revisions SET claim_text='Changed' WHERE id='r1'")

    def test_approval_must_target_current_revision(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("""
                INSERT INTO claim_approvals
                (id, claim_id, revision_number, approved_by, rationale, approved_at)
                VALUES ('a-old', 'c1', 2, 'u1', 'stale', 'now')
            """)

    def test_dispute_disables_diagnostic_eligibility(self):
        self.db.execute("""
            INSERT INTO claim_approvals
            (id, claim_id, revision_number, approved_by, rationale, approved_at)
            VALUES ('a1', 'c1', 1, 'u1', 'approved', 'now')
        """)
        self.db.execute("UPDATE knowledge_claims SET review_status='disputed' WHERE id='c1'")
        eligible = self.db.execute(
            "SELECT diagnostic_eligible FROM knowledge_claims WHERE id='c1'"
        ).fetchone()[0]
        self.assertEqual(eligible, 0)

    def test_audit_events_are_append_only(self):
        self.db.execute("""
            INSERT INTO audit_events (id, action, target_type, target_id, created_at)
            VALUES ('e1', 'created', 'claim', 'c1', 'now')
        """)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("DELETE FROM audit_events WHERE id='e1'")


if __name__ == "__main__":
    unittest.main(verbosity=2)
