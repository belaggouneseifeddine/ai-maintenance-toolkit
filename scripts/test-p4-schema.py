#!/usr/bin/env python3
"""Behavioral tests for the P4 D1/SQLite schema; uses Python's stdlib only."""
from pathlib import Path
import sqlite3
import unittest

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [
    ROOT / "migrations" / "0001_p4_community_knowledge.sql",
    ROOT / "migrations" / "0002_p4_anonymous_profiles.sql",
    ROOT / "migrations" / "0003_github_document_index.sql",
    ROOT / "migrations" / "0004_p4_storage_quota_reservations.sql",
]


class P4SchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys = ON")
        for migration in MIGRATIONS:
            self.db.executescript(migration.read_text(encoding="utf-8"))
        self.db.execute(
            """INSERT INTO contributors
               (id, display_name, status, created_at, updated_at)
               VALUES (?, ?, 'active', ?, ?)""",
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

    def insert_document(self, document_id, byte_size, storage_backend="r2", deleted_at=None):
        object_key = (
            "github://repo/" + document_id + ".pdf"
            if storage_backend == "github"
            else "private/" + document_id
        )
        self.db.execute(
            """INSERT INTO source_documents
               (id, owner_contributor_id, original_filename, mime_type, byte_size,
                sha256, r2_object_key, storage_backend, created_at, updated_at, deleted_at)
               VALUES (?, 'u1', ?, 'application/pdf', ?, ?, ?, ?, '2026-11-05T19:00:00.000Z',
                       '2026-11-05T19:00:00.000Z', ?)""",
            (document_id, document_id + ".pdf", byte_size, "a" * 64,
             object_key, storage_backend, deleted_at),
        )

    def insert_reservation(self, reservation_id, byte_size, created_at="2026-11-05T19:00:00.000Z",
                           expires_at="2026-11-05T19:30:00.000Z"):
        self.db.execute(
            """INSERT INTO source_document_reservations
               (id, owner_contributor_id, byte_size, created_at, expires_at)
               VALUES (?, 'u1', ?, ?, ?)""",
            (reservation_id, byte_size, created_at, expires_at),
        )

    def test_global_r2_quota_is_enforced_by_atomic_reservation_trigger(self):
        self.insert_document("global-full", 1024 * 1024 * 1024)
        with self.assertRaises(sqlite3.IntegrityError) as error:
            self.insert_reservation("global-over", 1)
        self.assertIn("staging_storage_quota", str(error.exception))

    def test_per_contributor_r2_quota_is_enforced_by_atomic_reservation_trigger(self):
        self.insert_document("contributor-full", 100 * 1024 * 1024)
        with self.assertRaises(sqlite3.IntegrityError) as error:
            self.insert_reservation("contributor-over", 1)
        self.assertIn("contributor_storage_quota", str(error.exception))

    def test_active_reservations_are_counted_before_uploads_finish(self):
        for index in range(10):
            self.insert_reservation("active-" + str(index), 10 * 1024 * 1024)
        with self.assertRaises(sqlite3.IntegrityError) as error:
            self.insert_reservation("active-over", 1)
        self.assertIn("contributor_storage_quota", str(error.exception))

    def test_github_documents_and_expired_reservations_do_not_consume_r2_quota(self):
        self.insert_document("github-large", 1024 * 1024 * 1024, storage_backend="github")
        self.insert_reservation(
            "expired", 10 * 1024 * 1024,
            created_at="2026-11-05T18:00:00.000Z",
            expires_at="2026-11-05T18:30:00.000Z",
        )
        self.insert_reservation("current", 10 * 1024 * 1024)
        active = self.db.execute(
            "SELECT COUNT(*) FROM source_document_reservations WHERE expires_at > ?",
            ("2026-11-05T19:00:00.000Z",),
        ).fetchone()[0]
        self.assertEqual(active, 1)

    def test_deleted_r2_documents_do_not_consume_quota(self):
        self.insert_document("deleted-doc", 100 * 1024 * 1024, deleted_at="2026-11-05T18:00:00.000Z")
        self.insert_reservation("after-delete", 10 * 1024 * 1024)

    def test_reservation_size_cannot_exceed_single_upload_limit(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.insert_reservation("too-large", 10 * 1024 * 1024 + 1)

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

    def test_github_document_and_page_text_are_indexable(self):
        self.db.execute("""
            INSERT INTO source_documents
              (id, owner_contributor_id, original_filename, mime_type, byte_size,
               sha256, r2_object_key, storage_backend, github_path, github_blob_sha,
               source_url, created_at, updated_at)
            VALUES
              ('doc1', 'u1', 'manual.pdf', 'application/pdf', 123,
               'a' || printf('%063d', 0), 'github://repo/knowledge/documents/manual.pdf',
               'github', 'knowledge/documents/manual.pdf', 'blobsha',
               'https://github.com/example/repo/blob/branch/knowledge/documents/manual.pdf',
               'now', 'now')
        """)
        self.db.execute("""
            INSERT INTO document_pages
              (id, document_id, page_number, extraction_method, extraction_status,
               extracted_text, text_sha256, text_char_count, table_extraction_status, created_at)
            VALUES ('page1', 'doc1', 1, 'embedded_text', 'complete',
                    'Check pump suction pressure', 'textsha', 28,
                    'manual_review_required', 'now')
        """)
        row = self.db.execute("""
            SELECT d.storage_backend, d.github_path, p.page_number, p.extracted_text,
                   p.table_extraction_status
            FROM source_documents d JOIN document_pages p ON p.document_id=d.id
            WHERE d.id='doc1'
        """).fetchone()
        self.assertEqual(row, (
            'github', 'knowledge/documents/manual.pdf', 1,
            'Check pump suction pressure', 'manual_review_required'
        ))

    def test_page_text_size_is_bounded(self):
        self.db.execute("""
            INSERT INTO source_documents
              (id, owner_contributor_id, original_filename, mime_type, byte_size,
               sha256, r2_object_key, storage_backend, github_path, created_at, updated_at)
            VALUES ('doc-limit', 'u1', 'limit.pdf', 'application/pdf', 123,
                    'sha', 'github://repo/limit.pdf', 'github',
                    'knowledge/documents/limit.pdf', 'now', 'now')
        """)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("""
                INSERT INTO document_pages
                  (id, document_id, page_number, extracted_text, created_at)
                VALUES ('page-too-large', 'doc1', 1, ?, 'now')
            """, ("x" * 80001,))


if __name__ == "__main__":
    unittest.main(verbosity=2)
