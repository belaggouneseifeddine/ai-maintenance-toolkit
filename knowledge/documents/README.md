# Technical document library (GitHub-backed staging)

This folder is the temporary document store for the P4 staging workflow while Cloudflare R2 remains disabled.

## Important: repository visibility

The repository is public. **Every PDF committed here is publicly downloadable by anyone.**
Only add documents that you own or are explicitly permitted to redistribute publicly. Do not upload:
- private company manuals, internal procedures, customer documents, or confidential reports;
- documents containing personal data, serial numbers tied to customers, credentials, or site-sensitive information;
- copyrighted manuals unless the licence or written permission allows public redistribution.

If public redistribution is not permitted, do not use this folder. Keep the file local until a private storage option is approved.

## Folder layout

Place PDFs under:

`knowledge/documents/<manufacturer>/<equipment-family>/<model>/`

Use short, descriptive, ASCII-safe folder and file names, for example:

`knowledge/documents/example-oem/centrifugal-pump/model-x/service-manual.pdf`

Avoid duplicate filenames within the same model folder.

## Upload from Android

1. Open the repository on GitHub in Chrome.
2. Navigate to the intended model folder (create folders through **Add file → Create new file** if needed).
3. Choose **Add file → Upload files**.
4. Select the PDF from the phone and commit it to `feature/p4-global-community-knowledge`, not `main`.
5. Wait for the **Extract PDF pages** workflow to finish.
6. Check the generated JSON under `knowledge/extracted/`. Text extraction is not the same as technical validation.

The workflow is triggered only by PDF additions or changes under this folder. It does not deploy the Worker or modify Cloudflare.

## Extraction limits

- Text-based PDFs: page-level text is extracted with page numbers and a SHA-256 fingerprint.
- Scanned/image-only pages: marked `ocr_required`; no OCR is silently performed.
- Tables: the first pass preserves extracted text order but does not guarantee structured table cells. Pages containing tables must be visually checked and marked for manual review.
- Extraction output is a candidate index only. It does not make a claim OEM-verified, community-approved, or safe for diagnosis.
- D1 ingestion and diagnostic retrieval are a separate step and remain disabled until their API and tests are implemented.

## Required evidence metadata

For every document, record the manufacturer, equipment family, exact model (or `unknown`), document title, source URL or origin, publication/revision date if known, language, and redistribution permission. Never invent missing values; use `unknown` and keep the document out of public use if rights are unclear.
