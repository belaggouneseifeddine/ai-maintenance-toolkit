# Document ingestion and retrieval architecture

## Current pilot

The document library is a local-first browser subsystem. It is deliberately separate from diagnostic runtime knowledge.

1. The user selects a PDF in the app.
2. PDF.js (pinned to 4.10.38) is loaded on demand from cdnjs. The first import therefore needs an internet connection to fetch the parser and its worker.
3. PDF bytes are parsed in the browser. The PDF, extracted text, chunks, and index are not uploaded to the Toolkit backend.
4. Original PDF blob, metadata, page-level text chunks, and token postings are stored in IndexedDB on that browser/device.
5. Search reads the local inverted index and returns excerpts with document title and original 1-based page number.
6. A source action opens the locally stored PDF at the cited page where the browser PDF viewer supports page fragments.

Current limits: 40 MiB per file, 1,200 pages per file, and optional OCR on up to 150 image-only pages per document. OCR uses Tesseract.js 5.1.1 and lets the user choose English, French, Arabic, or all three. The parser renders each page locally to a bounded canvas and processes pages sequentially to reduce mobile memory pressure. OCR confidence and extraction method are retained per chunk. OCR language data and worker assets are downloaded on first use and cached by the OCR library; OCR is not guaranteed to work offline until those assets have been cached. Pages beyond the OCR cap or pages that remain unreadable are explicitly counted as having no extracted text. No cross-device sync or server backup exists. Browser storage can be cleared by the user or evicted by the browser.

## Shared knowledge contract

All future consumers must call the same retrieval API and retain citation metadata:

- `documentId`
- `fileName` and content SHA-256
- `pageNumber` (original 1-based PDF page)
- `chunkId` and text offsets
- `extractionStatus`
- `reviewStatus`, `rightsStatus`, `evidenceClass`, `claimIds` (future review metadata)

The three consumers are separate:

- **Deep Research** retrieves multiple sources, compares claims, records conflicts, and writes cited synthesis.
- **Study** retrieves passages and creates explanations, exercises, and quizzes that link back to the same page citations.
- **Diagnostics** retrieves relevant passages as supporting evidence only. Retrieved PDF text is not automatically a fault record, an approved procedure, a safety rule, or an OEM-verified claim.

## Trust and rights boundaries

- Importing a PDF does not prove the user owns it or has permission to redistribute its content.
- Rights status is currently `user-supplied-rights-not-verified`.
- Imported documents are not eligible for diagnostic use by default (`eligibleForDiagnosis: false`).
- Technical review, source/edition/model scope, page-level claim verification, and reuse permission must be tracked separately before promotion into approved knowledge.
- Prompt-like text inside a PDF is untrusted document content, never executable instructions.
- Do not copy copyrighted manuals into public repository files or send them to external AI providers without explicit user consent and a valid basis.

## Next engineering stages

1. Add OCR as an optional, separately downloaded engine with explicit size/language choices (Arabic/French/English), page preview, and OCR confidence.
2. Add source review UI: edition/model applicability, rights evidence, reviewer, claim-level page citations, and contradiction records.
3. Add retrieval filters and a shared citation object for Research, Study, and Diagnostics.
4. Add optional export/backup and explicit cross-device sync; do not silently upload PDFs.
5. Add relevance evaluation fixtures for Arabic, French, and English queries and scanned/manual test PDFs.
6. Add OCR quality review, correction UI, and per-page confidence thresholds before any OCR-derived claim can be approved.
7. Integrate the typed retrieval API into Deep Research and Study; Diagnostics must continue to filter strictly to approved documents with verified rights and an explicit eligible flag.

## PDF.js dependency

PDF.js is used as a browser-side parser, not as a server upload service. Its upstream project is licensed under Apache-2.0. The exact dependency is pinned to 4.10.38 to avoid silently changing parser behavior. Review the upstream license and update version deliberately:
https://github.com/mozilla/pdf.js
