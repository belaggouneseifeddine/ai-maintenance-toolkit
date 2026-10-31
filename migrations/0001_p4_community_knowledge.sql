-- P4 community knowledge foundation.
-- D1 stores metadata and immutable review history; binary source files belong in private R2.
-- No production database is created or modified by this migration file.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contributors (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'limited', 'suspended', 'deleted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'email')),
  provider_subject TEXT NOT NULL,
  email_normalized TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  created_at TEXT NOT NULL,
  last_seen_at TEXT,
  UNIQUE (provider, provider_subject),
  UNIQUE (provider, email_normalized)
);

CREATE INDEX IF NOT EXISTS idx_auth_identities_contributor
  ON auth_identities(contributor_id);

CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  owner_contributor_id TEXT NOT NULL REFERENCES contributors(id),
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  byte_size INTEGER NOT NULL CHECK (byte_size > 0),
  sha256 TEXT NOT NULL,
  r2_object_key TEXT NOT NULL UNIQUE,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'community', 'public')),
  rights_confirmed INTEGER NOT NULL DEFAULT 0 CHECK (rights_confirmed IN (0, 1)),
  sharing_consent_at TEXT,
  processing_status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (processing_status IN ('uploaded', 'queued', 'processing', 'extracted', 'failed', 'deleted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_source_documents_owner
  ON source_documents(owner_contributor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_documents_sha256
  ON source_documents(sha256);

CREATE TABLE IF NOT EXISTS document_pages (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL CHECK (page_number > 0),
  preview_object_key TEXT,
  extraction_method TEXT NOT NULL DEFAULT 'pending'
    CHECK (extraction_method IN ('pending', 'embedded_text', 'ocr', 'manual', 'mixed')),
  language TEXT CHECK (language IN ('ar', 'en', 'fr', 'und')),
  ocr_confidence REAL CHECK (ocr_confidence IS NULL OR (ocr_confidence >= 0 AND ocr_confidence <= 1)),
  raw_text_object_key TEXT,
  extraction_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending', 'complete', 'low_confidence', 'failed', 'not_applicable')),
  created_at TEXT NOT NULL,
  UNIQUE(document_id, page_number)
);

CREATE TABLE IF NOT EXISTS extraction_runs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  parser_version TEXT NOT NULL,
  ocr_engine TEXT,
  languages TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'complete', 'partial', 'failed')),
  error_code TEXT,
  error_message TEXT,
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_extraction_runs_document
  ON extraction_runs(document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_claims (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES source_documents(id),
  page_id TEXT REFERENCES document_pages(id),
  submitted_by TEXT NOT NULL REFERENCES contributors(id),
  equipment_family TEXT,
  manufacturer TEXT,
  model TEXT,
  claim_type TEXT NOT NULL
    CHECK (claim_type IN ('symptom', 'cause', 'inspection', 'solution', 'limit', 'safety', 'other')),
  current_revision INTEGER NOT NULL DEFAULT 1 CHECK (current_revision > 0),
  evidence_class TEXT NOT NULL
    CHECK (evidence_class IN ('documented-model', 'general', 'personal-local', 'candidate')),
  review_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (review_status IN ('candidate', 'community-approved', 'disputed', 'rejected', 'withdrawn')),
  diagnostic_eligible INTEGER NOT NULL DEFAULT 0 CHECK (diagnostic_eligible IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
);

CREATE INDEX IF NOT EXISTS idx_knowledge_claims_status
  ON knowledge_claims(review_status, evidence_class, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_claims_equipment
  ON knowledge_claims(equipment_family, manufacturer, model);

CREATE TABLE IF NOT EXISTS claim_revisions (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES knowledge_claims(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  claim_text TEXT NOT NULL,
  normalized_text TEXT,
  section_reference TEXT,
  extraction_method TEXT NOT NULL
    CHECK (extraction_method IN ('embedded_text', 'ocr', 'manual', 'community_edit')),
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  edited_by TEXT NOT NULL REFERENCES contributors(id),
  change_summary TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(claim_id, revision_number)
);

CREATE TABLE IF NOT EXISTS claim_approvals (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES knowledge_claims(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  approved_by TEXT NOT NULL REFERENCES contributors(id),
  rationale TEXT NOT NULL,
  approved_at TEXT NOT NULL,
  UNIQUE(claim_id, revision_number),
  FOREIGN KEY(claim_id, revision_number)
    REFERENCES claim_revisions(claim_id, revision_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS knowledge_flags (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES knowledge_claims(id) ON DELETE CASCADE,
  reporter_id TEXT NOT NULL REFERENCES contributors(id),
  reason_code TEXT NOT NULL
    CHECK (reason_code IN ('incorrect', 'unsafe', 'copyright', 'privacy', 'spam', 'other')),
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_knowledge_flags_status
  ON knowledge_flags(status, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_contributor_id TEXT REFERENCES contributors(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_target
  ON audit_events(target_type, target_id, created_at DESC);

CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id),
  report_type TEXT NOT NULL
    CHECK (report_type IN ('diagnostic_case', 'maintenance_case', 'correction', 'other')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'community', 'public')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_reports_visibility
  ON community_reports(visibility, created_at DESC);


-- Enforce append-only provenance and review history.
CREATE TRIGGER IF NOT EXISTS trg_claim_revisions_no_update
BEFORE UPDATE ON claim_revisions
BEGIN
  SELECT RAISE(ABORT, 'claim revisions are immutable; create a new revision');
END;

CREATE TRIGGER IF NOT EXISTS trg_claim_revisions_no_delete
BEFORE DELETE ON claim_revisions
BEGIN
  SELECT RAISE(ABORT, 'claim revisions are immutable');
END;

CREATE TRIGGER IF NOT EXISTS trg_claim_approvals_no_update
BEFORE UPDATE ON claim_approvals
BEGIN
  SELECT RAISE(ABORT, 'approval events are immutable');
END;

CREATE TRIGGER IF NOT EXISTS trg_claim_approvals_no_delete
BEFORE DELETE ON claim_approvals
BEGIN
  SELECT RAISE(ABORT, 'approval events are immutable');
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit events are append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit events are append-only');
END;

-- An approval only applies to the current immutable revision.
CREATE TRIGGER IF NOT EXISTS trg_approval_current_revision
BEFORE INSERT ON claim_approvals
WHEN NEW.revision_number != (
  SELECT current_revision FROM knowledge_claims WHERE id = NEW.claim_id
)
BEGIN
  SELECT RAISE(ABORT, 'approval must target the current claim revision');
END;

-- A valid approval makes this revision community-approved, without changing
-- its evidence class. Disputes and withdrawals can later disable eligibility.
CREATE TRIGGER IF NOT EXISTS trg_approval_updates_claim
AFTER INSERT ON claim_approvals
BEGIN
  UPDATE knowledge_claims
  SET review_status = 'community-approved',
      diagnostic_eligible = 1,
      updated_at = NEW.approved_at
  WHERE id = NEW.claim_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dispute_disables_diagnostics
AFTER UPDATE OF review_status ON knowledge_claims
WHEN NEW.review_status IN ('disputed', 'rejected', 'withdrawn', 'candidate')
BEGIN
  UPDATE knowledge_claims
  SET diagnostic_eligible = 0
  WHERE id = NEW.id;
END;

-- Guard eligibility independently so a dispute can atomically disable a claim.
CREATE TRIGGER IF NOT EXISTS trg_claim_insert_eligibility_guard
BEFORE INSERT ON knowledge_claims
WHEN NEW.diagnostic_eligible = 1 AND NEW.review_status != 'community-approved'
BEGIN
  SELECT RAISE(ABORT, 'only community-approved claims can be diagnostic eligible');
END;

CREATE TRIGGER IF NOT EXISTS trg_claim_eligibility_guard
BEFORE UPDATE OF diagnostic_eligible ON knowledge_claims
WHEN NEW.diagnostic_eligible = 1 AND NEW.review_status != 'community-approved'
BEGIN
  SELECT RAISE(ABORT, 'only community-approved claims can be diagnostic eligible');
END;

-- Status cannot be set to community-approved without an approval event
-- for the exact current revision.
CREATE TRIGGER IF NOT EXISTS trg_claim_approval_status_guard
BEFORE UPDATE OF review_status ON knowledge_claims
WHEN NEW.review_status = 'community-approved'
 AND NOT EXISTS (
   SELECT 1 FROM claim_approvals a
   WHERE a.claim_id = NEW.id
     AND a.revision_number = NEW.current_revision
 )
BEGIN
  SELECT RAISE(ABORT, 'community approval event required for current revision');
END;
