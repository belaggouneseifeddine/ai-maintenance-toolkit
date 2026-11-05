-- P4.1 anonymous first-use profile and revocable staging sessions.
-- Apply only to an isolated staging D1 database after local tests pass.

ALTER TABLE contributors ADD COLUMN professional_title TEXT;
ALTER TABLE contributors ADD COLUMN qualification TEXT;
ALTER TABLE contributors ADD COLUMN profile_completed INTEGER NOT NULL DEFAULT 0
  CHECK (profile_completed IN (0, 1));

CREATE TABLE IF NOT EXISTS contributor_sessions (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  token_sha256 TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  last_seen_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contributor_sessions_owner
  ON contributor_sessions(contributor_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_contributor_sessions_active
  ON contributor_sessions(token_sha256, expires_at) WHERE revoked_at IS NULL;

-- Profiles are self-declared; never represent them as verified credentials.
