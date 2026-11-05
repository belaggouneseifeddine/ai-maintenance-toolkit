-- P4: atomic storage reservations for concurrent private R2 uploads.
-- Apply only to the isolated staging D1 database before enabling uploads.
-- Reservations expire after the Worker lease window; expired rows do not consume quota.

CREATE TABLE IF NOT EXISTS source_document_reservations (
  id TEXT PRIMARY KEY,
  owner_contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 10485760),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_source_document_reservations_expiry
  ON source_document_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_source_document_reservations_owner_expiry
  ON source_document_reservations(owner_contributor_id, expires_at);

-- SQLite/D1 serializes writes. The BEFORE INSERT trigger evaluates current
-- R2-backed documents plus all unexpired reservations as one atomic decision.
-- GitHub-backed public documents do not consume the private R2 staging quota.
CREATE TRIGGER IF NOT EXISTS trg_p4_storage_quota_reservation_guard
BEFORE INSERT ON source_document_reservations
BEGIN
  SELECT CASE WHEN
    (SELECT COALESCE(SUM(byte_size), 0)
       FROM source_documents
      WHERE storage_backend = 'r2' AND deleted_at IS NULL) +
    (SELECT COALESCE(SUM(byte_size), 0)
       FROM source_document_reservations
      WHERE expires_at > NEW.created_at) +
    NEW.byte_size > 1073741824
  THEN RAISE(ABORT, 'staging_storage_quota') END;

  SELECT CASE WHEN
    (SELECT COALESCE(SUM(byte_size), 0)
       FROM source_documents
      WHERE storage_backend = 'r2'
        AND deleted_at IS NULL
        AND owner_contributor_id = NEW.owner_contributor_id) +
    (SELECT COALESCE(SUM(byte_size), 0)
       FROM source_document_reservations
      WHERE owner_contributor_id = NEW.owner_contributor_id
        AND expires_at > NEW.created_at) +
    NEW.byte_size > 104857600
  THEN RAISE(ABORT, 'contributor_storage_quota') END;
END;
