# P4 Knowledge Pipeline — Read-only Audit

Date: 2026-10-31
Base: `main` at `436e158ad8784fdb9ded2c43656d55ee20451254`
Branch: `audit/p4-knowledge-pipeline-2026-10-31`

## User-approved product rule

Every supported extracted item should be retained in the app's knowledge data store. Unreviewed extraction results must be visibly classified as candidates and must not be presented to the diagnostic engine as verified facts. Promotion into diagnostic knowledge requires explicit review/approval. Each item must retain traceability to its original file and page/section.

## Current-state findings

1. **A review queue already exists, but it is for maintenance records, not source-document ingestion.**
   - `knowledge-review.js` reads records from localStorage key `maintenance-ai-toolkit-records-v1` and review states from `maintenance-ai-toolkit-knowledge-review-v1`.
   - It can mark records as candidate/reviewed-for-consideration/rejected and export reviewed candidates as JSON.
   - Its UI text explicitly says this is not technical approval or publication; it does not write approved material into the knowledge corpus.
   - `tests/knowledge-review.test.cjs` verifies this local-only/manual-export behavior.

2. **No document-ingestion pipeline is present in the executable app code inspected.**
   - No PDF.js or Tesseract integration was found in the repository code search.
   - No IndexedDB implementation was found in executable app files; search hits were documentation/test references only.
   - No PDF/image source-document upload and page-level extraction flow was found in the current UI/source files inspected.

3. **Current app data persistence is browser-local and fragmented.**
   - The existing review workflow uses localStorage.
   - The app's README describes maintenance records as stored in the current browser/device, without automatic sync or backup.
   - The service worker caches static application assets; this is not a source-document database and should not be used as one.

4. **A substantial curated knowledge corpus already exists.**
   - The `knowledge/` directory contains bilingual/trilingual troubleshooting references, OEM source registers, OEM fault datasets, casebooks, and evidence-gap/audit files.
   - These static assets are distinct from user-imported documents and should remain intact during P4.

5. **The diagnostic stack already has provenance-oriented structures, but ingestion must integrate without weakening evidence boundaries.**
   - Existing diagnosis contracts distinguish source-supported hypotheses from hypothesis-only items and carry source IDs.
   - P4 should add durable document/page provenance and evidence class metadata, not bypass the existing diagnostic validation or safety gate.

## P4 implementation requirements

- Source-document library: retain original PDF/image, checksum, filename, MIME type, size, import date, and local storage status.
- Extraction: first attempt embedded PDF text extraction; OCR scanned pages/images only when needed. Keep original page numbers.
- OCR: expose language selection/detection for Arabic, English, and French; preserve OCR confidence and flag low-confidence spans.
- Structured extraction: store raw extracted text and structured candidate claims separately. Never silently discard extracted text.
- Traceability: every candidate claim links to document ID, page number, optional section, extraction method, and source metadata.
- Review queue: preview original page beside extracted text; edit, accept, reject, or defer each candidate. Approval must be explicit.
- Evidence levels: preserve documented-model, general, personal-local, and candidate distinctions. Never label an item documented-model without exact model-specific source evidence.
- Diagnostic integration: only approved claims may be eligible for retrieval by the diagnostic engine; candidates remain searchable in the review workspace but excluded from confirmed evidence.
- Offline behavior: local-first storage and clear quota/error handling. Do not assume localStorage can hold source PDFs/images.
- Privacy: no document or OCR text is sent to Gemini, Cloudflare AI, or any remote service unless a separate explicit consent path is designed and approved.
- Data management: export/import and backup strategy, duplicate detection, deletion controls, and migration/versioning must be designed before implementation.
- Safety: retain warnings and procedural context; extracted procedures must not become instructions to intervene without appropriate LOTO/qualified-person gates.

## Recommended implementation sequence

1. Decide storage scope and who may grant final approval.
2. Define versioned document, page, extraction, candidate-claim, and approval schemas.
3. Implement local document storage and upload validation.
4. Implement PDF embedded-text extraction and page previews.
5. Add OCR for images/scanned pages with confidence reporting.
6. Add candidate structuring and page-linked review queue.
7. Add explicit approval and controlled retrieval into diagnostic knowledge.
8. Add export/import, duplicate handling, quota/error handling, and migration.
9. Test text PDFs, scanned PDFs, Arabic/English/French images, poor-quality OCR, duplicate files, offline restart, large files, and rejected/approved candidate isolation.

## Decisions still required before implementation

- Storage: device-only local storage, or local-first with an optional future backup/sync path.
- Final approval authority: the repository/app owner only, or owner plus explicitly delegated technical reviewers.

## Scope and safety

This branch contains an audit report only. No runtime code, deployment configuration, secrets, production data, or live deployments were changed. No merge or deployment is authorized by this audit.
