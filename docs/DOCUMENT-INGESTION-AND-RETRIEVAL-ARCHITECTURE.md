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

All consumers use the same IndexedDB index through `MaintenanceDocumentLibrary.retrieve(query, { consumer })`. The loaded `document-retrieval-adapter.js` exposes separate `forResearch`, `forStudy`, and `forDiagnostics` entrypoints. Each result carries the same source reference and page citation; the adapter never merges the three consumers into one result stream.

- `documentId`
- `fileName` and content SHA-256
- `pageNumber` (original 1-based PDF page)
- `chunkId` and text offsets
- `extractionStatus`
- `reviewStatus`, `rightsStatus`, `evidenceClass`, `claimIds` (future review metadata)

The three consumers are separate:

- **Deep Research** uses `MaintenanceDocumentRetrieval.forResearch(query)` to retrieve passages for multi-source comparison, claim conflict handling, and cited synthesis. This adapter retrieves passages; it does not itself perform research synthesis.
- **Study** uses `MaintenanceDocumentRetrieval.forStudy(query)` to retrieve passages for explanations, exercises, and quizzes that link back to the same page citations. Learning-content generation remains a separate layer.
- **Diagnostics** uses `MaintenanceDocumentRetrieval.forDiagnostics(query)`. The current gate returns only documents with `eligibleForDiagnosis: true`, `reviewStatus: approved`, and `rightsStatus: verified`. All imported documents start ineligible, so an unreviewed PDF cannot silently become diagnostic evidence. Retrieved text is still supporting evidence, not an automatic fault record, approved procedure, safety rule, or OEM-verified claim.

## Trust and rights boundaries

- Importing a PDF does not prove the user owns it or has permission to redistribute its content.
- Rights status is currently `user-supplied-rights-not-verified`.
- Imported documents are not eligible for diagnostic use by default (`eligibleForDiagnosis: false`).
- Technical review, source/edition/model scope, page-level claim verification, and reuse permission must be tracked separately before promotion into approved knowledge.
- Prompt-like text inside a PDF is untrusted document content, never executable instructions.
- Do not copy copyrighted manuals into public repository files or send them to external AI providers without explicit user consent and a valid basis.

## Next engineering stages

1. Add source review UI: edition/model applicability, rights evidence, reviewer, claim-level page citations, and contradiction records.
2. Add OCR quality review, correction UI, and per-page confidence thresholds before any OCR-derived claim can be approved.
3. Integrate the typed retrieval API into Deep Research and Study; Diagnostics must continue to filter strictly to approved documents with verified rights and an explicit eligible flag.
4. Add relevance evaluation fixtures for Arabic, French, and English queries and scanned/manual test PDFs.
5. Add optional export/backup and explicit cross-device sync; do not silently upload PDFs.

## OCR dependency\n\nTesseract.js is pinned to 5.1.1 and loaded only when the user enables OCR and the parser encounters a page without extractable text. Its upstream project is licensed under Apache-2.0. The official project documents the browser worker API and language data loading: https://github.com/naptha/tesseract.js\n\n## PDF.js dependency

PDF.js is used as a browser-side parser, not as a server upload service. Its upstream project is licensed under Apache-2.0. The exact dependency is pinned to 4.10.38 to avoid silently changing parser behavior. Review the upstream license and update version deliberately:
https://github.com/mozilla/pdf.js
