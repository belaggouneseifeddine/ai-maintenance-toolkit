-- P4.2: GitHub-backed public source documents and page-level extracted text.
-- GitHub is the temporary binary store; D1 remains the searchable metadata/index.
-- The legacy r2_object_key column is retained for compatibility. For GitHub-backed
-- rows it stores an opaque "github://<repo>/<path>" locator, never an R2 object key.
-- Do not store private, licensed-restricted, or non-public documents in this pipeline.

ALTER TABLE source_documents ADD COLUMN storage_backend TEXT NOT NULL DEFAULT 'r2'
  CHECK (storage_backend IN ('r2', 'github'));
ALTER TABLE source_documents ADD COLUMN github_path TEXT;
ALTER TABLE source_documents ADD COLUMN github_blob_sha TEXT;
ALTER TABLE source_documents ADD COLUMN source_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_source_documents_github_path
  ON source_documents(github_path) WHERE github_path IS NOT NULL;

ALTER TABLE document_pages ADD COLUMN extracted_text TEXT;
ALTER TABLE document_pages ADD COLUMN text_sha256 TEXT;
ALTER TABLE document_pages ADD COLUMN text_char_count INTEGER NOT NULL DEFAULT 0
  CHECK (text_char_count >= 0);
ALTER TABLE document_pages ADD COLUMN table_extraction_status TEXT NOT NULL DEFAULT 'not_processed'
  CHECK (table_extraction_status IN ('not_processed', 'manual_review_required', 'structured', 'ocr_required'));

CREATE INDEX IF NOT EXISTS idx_document_pages_document_page
  ON document_pages(document_id, page_number);

-- Keep page text bounded. Large pages must be split/reviewed before indexing.
CREATE TRIGGER IF NOT EXISTS trg_document_page_text_limit
BEFORE INSERT ON document_pages
WHEN NEW.extracted_text IS NOT NULL AND length(NEW.extracted_text) > 80000
BEGIN
  SELECT RAISE(ABORT, 'extracted page text exceeds 80000 characters');
END;

CREATE TRIGGER IF NOT EXISTS trg_document_page_text_update_limit
BEFORE UPDATE OF extracted_text ON document_pages
WHEN NEW.extracted_text IS NOT NULL AND length(NEW.extracted_text) > 80000
BEGIN
  SELECT RAISE(ABORT, 'extracted page text exceeds 80000 characters');
END;
