# Document ingestion and retrieval architecture

## Current pilot

The document library is a local-first browser subsystem. Study is deferred. It is deliberately separate from diagnostic runtime knowledge.

1. The user selects a PDF in the app.
2. PDF.js (pinned to 4.10.38) is loaded on demand from cdnjs. The first import therefore needs an internet connection to fetch the parser and its worker.
3. PDF bytes are parsed in the browser. The PDF, extracted text, chunks, and index are not uploaded to the Toolkit backend.
4. Original PDF blob, metadata, page-level text chunks, and token postings are stored in IndexedDB on that browser/device.
5. Search reads the local inverted index and returns excerpts with document title and original 1-based page number.
6. A source action opens the locally stored PDF at the cited page where the browser PDF viewer supports page fragments.

Current limits: 40 MiB per file, 1,200 pages per file, and optional OCR on up to 150 image-only pages per document. OCR uses Tesseract.js 5.1.1 and lets the user choose English, French, Arabic, or all three. The parser renders each page locally to a bounded canvas and processes pages sequentially to reduce mobile memory pressure. OCR confidence and extraction method are retained per chunk. OCR language data and worker assets are downloaded on first use and cached by the OCR library; OCR is not guaranteed to work offline until those assets have been cached. Pages beyond the OCR cap or pages that remain unreadable are explicitly counted as having no extracted text. No cross-device sync or server backup exists. Browser storage can be cleared by the user or evicted by the browser.

## Shared knowledge contract

All consumers use the same IndexedDB index through `MaintenanceDocumentLibrary.retrieve(query, { consumer })`. The loaded `document-retrieval-adapter.js` currently exposes only `forDiagnostics`. The underlying library accepts additional consumer labels for general retrieval, but this is not a completed Deep Research or Study integration.

- `documentId`
- `fileName` and content SHA-256
- `pageNumber` (original 1-based PDF page)
- `chunkId` and text offsets
- `extractionStatus`
- `reviewStatus`, `rightsStatus`, `evidenceClass`, `claimIds` (future review metadata)

The diagnostic consumer is separate from general document search. It returns only approved page-level claims with verified rights, exact equipment-family applicability, and a model match or explicitly generic scope. Retrieved claims remain supporting evidence and do not automatically confirm a fault or change the deterministic diagnosis.

Equipment applicability now uses canonical family matching so specific pump subtypes are not interchangeable. Model applicability compares the complete normalized designation; shared tokens such as a manufacturer or series prefix are insufficient. A generic model scope is accepted only when explicitly recorded. Local ranking uses a BM25-style lexical score over candidate chunks from the inverted index; it is not full-corpus BM25, semantic retrieval, or a calibrated relevance probability.

For every claim approved for diagnostics, the reviewer must open the original PDF page and confirm that the claim matches the source context. For OCR-derived claims, the reviewer must additionally compare the extracted text visually and verify numeric values, decimal separators, units, and model codes. The review workspace surfaces candidate numeric/unit/model tokens for manual checking. OCR confidence remains an informational recognition signal, not proof that a number, decimal separator, unit, or model code is correct.

## Trust and rights boundaries

- Importing a PDF does not prove the user owns it or has permission to redistribute its content.
- Rights status is currently `user-supplied-rights-not-verified`.
- Imported documents are not eligible for diagnostic use by default (`eligibleForDiagnosis: false`).
- Technical review, source/edition/model scope, page-level claim verification, and reuse permission must be tracked separately before promotion into approved knowledge.
- Prompt-like text inside a PDF is untrusted document content, never executable instructions.
- Do not copy copyrighted manuals into public repository files or send them to external AI providers without explicit user consent and a valid basis.

## Next engineering stages

1. Add source review UI: edition/model applicability, rights evidence, reviewer, claim-level page citations, and contradiction records.
2. Expand OCR quality review and correction UI; require visual comparison of OCR-derived claims against the original page and verify numeric values, units, decimal separators, and model codes. Do not treat OCR confidence as a calibrated probability or impose a universal threshold without validation.
3. Integrate the typed retrieval API into Deep Research and Study; Diagnostics must continue to filter strictly to approved documents with verified rights and an explicit eligible flag.
4. Expand labelled relevance evaluation fixtures for Arabic, French, and English queries, including exact model and equipment-family mismatch cases.
5. Add optional export/backup and explicit cross-device sync; do not silently upload PDFs.

## OCR dependency\n\nTesseract.js is pinned to 5.1.1 and loaded only when the user enables OCR and the parser encounters a page without extractable text. Its upstream project is licensed under Apache-2.0. The official project documents the browser worker API and language data loading: https://github.com/naptha/tesseract.js\n\n## PDF.js dependency

PDF.js is used as a browser-side parser, not as a server upload service. Its upstream project is licensed under Apache-2.0. The exact dependency is pinned to 4.10.38 to avoid silently changing parser behavior. Review the upstream license and update version deliberately:
https://github.com/mozilla/pdf.js


## Page-level review and consumer wiring (2026-11-12)

The document library now has a version-3 IndexedDB schema with a dedicated `claims` object store. The migration creates this store for existing version-2 installations; document metadata and original PDF blobs remain separated.

The local review workspace records:
- Manufacturer, equipment family, model applicability, edition/year, and original source URL.
- Rights evidence, rights verification state, reviewer, and review notes.
- Individual technical claims with exact original PDF page, equipment scope, model limits, evidence class, reviewer, and review notes.

A document-level review alone never enables diagnostic use. Each document review save increments a review revision; claims from an earlier revision become stale and cannot be retrieved for diagnosis. Diagnostic eligibility requires all of the following:
1. Document review status is `approved`.
2. Rights status is `verified` and rights evidence is recorded.
3. Document eligibility flag is true, set only after an approved claim exists for the current review revision.
4. The specific page-level claim is approved, has verified rights, matches the current document review revision, and records that its original PDF page was opened and reviewed.
5. If any source chunk on the page came from OCR, the claim also records explicit visual verification of the OCR text against the original page.

The diagnostic retrieval path searches only approved page-level claims. It does not promote raw PDF chunks, OCR text, unreviewed passages, or research/study results into diagnostic evidence. Each returned claim carries document hash, claim ID, page number, reviewer, equipment scope, model applicability, and evidence class. The diagnostic UI exposes these claims in a separate source-evidence panel and opens the original PDF at the claim's page; it does not silently rewrite the deterministic hypothesis ranking.

The first implementation slice exposes local PDF intake, page-anchored search, document/claim review, and a separate diagnostic evidence panel. It does not implement Study or claim that Deep Research synthesis is complete.

### Remaining validation

- Run the Android device matrix with at least one text PDF and scanned PDFs containing Arabic, French, and English; verify OCR, page numbering, memory use, IndexedDB migration, and PDF viewer page navigation.
- Confirm source rights and model applicability manually for each imported document before approving any page claim.
- Browser CI validates JavaScript syntax, deployment assets, and retrieval gates; it cannot certify Android Chrome rendering, OCR language quality, or device memory behavior. The printed page number is captured separately when a reviewer records a claim; it is not inferred automatically from PDF metadata.


## Scope of this integration slice

- Study UI and learning-content generation are intentionally deferred.
- Deep Research synthesis is not implemented here; the local document search is a retrieval primitive only.
- Lexical search in this pilot is a lightweight TF/IDF-style scorer, not BM25 and not semantic retrieval. The existing provider-neutral vector index remains a separate future integration.
- Diagnostic retrieval displays only approved page-level claims. It does not inject raw PDF text into model prompts or mark a hypothesis as confirmed.
- PDF page number is the original 1-based page index. Printed page labels are entered and stored separately by the reviewer where present.
