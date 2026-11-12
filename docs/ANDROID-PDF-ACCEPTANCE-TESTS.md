# Android PDF acceptance checklist

Status: **manual validation required — not yet performed**. Desktop CI is not evidence of Android PDF viewer, OCR, storage, or popup behavior.

## Test device and build record
- Android device / Android version:
- Chrome version:
- App URL:
- Git commit:
- Available storage before test:
- Network state and connection type:

## Test files
1. Text-based PDF with known printed page labels.
2. Scanned Arabic PDF.
3. Scanned French PDF.
4. Scanned English PDF.
5. Mixed document where printed page numbers differ from PDF page indexes.
6. At least one manual containing tables, symbols, units, and multi-column text.

## Acceptance steps

### Import and extraction
- [ ] Import a text PDF under 40 MiB; confirm the app reports page count, extracted pages, and chunk count.
- [ ] Import scanned Arabic, French, and English PDFs separately with the matching OCR language enabled.
- [ ] Confirm OCR is optional and runs in the browser; note that the OCR library and language data may need to download from a CDN.
- [ ] Compare extracted text against the visible source page; record OCR confidence and errors.
- [ ] Confirm pages beyond the 150-page OCR limit are explicitly reported as skipped.
- [ ] Confirm a page with no extractable text remains visible as an extraction gap, not as a successful page.

### Page anchors and source opening
- [ ] Search for a technical term; confirm the result cites the correct 1-based PDF page.
- [ ] Select a document and page in the review workspace; preview the extracted text from that exact page.
- [ ] Tap “open source page”; confirm the PDF viewer opens that exact PDF page.
- [ ] Repeat on a page where the printed page label differs from the PDF page index.
- [ ] Record PDF page index and printed page label separately; verify both remain visible in the claim record.
- [ ] Tap a diagnostic evidence citation and verify it opens the same original PDF page.

### Review, rights, and diagnostic eligibility
- [ ] Save a document review with rights basis, evidence, reviewer, source origin, manufacturer, equipment family, model applicability, and edition.
- [ ] Confirm unknown rights basis cannot be marked verified.
- [ ] Confirm a document with unverified rights cannot supply diagnostic evidence.
- [ ] Confirm an unreviewed page claim cannot enter diagnostic retrieval.
- [ ] Approve one test document and one page claim with a documented rights basis; confirm only matching equipment-family and model context retrieves it.
- [ ] Confirm a different numeric model variant does not retrieve the claim.
- [ ] Confirm generic applicability is accepted only when explicitly recorded as generic.

### Persistence, offline, and resource use
- [ ] Close and reopen the app; confirm documents, page chunks, and claims remain in IndexedDB.
- [ ] Test with network disabled after parser/OCR assets have been cached; record which functions remain available.
- [ ] Test low-storage behavior and document deletion.
- [ ] Record memory use, import time, OCR time, and any browser tab reload or crash.

## Failure record
For every failure, record device/browser, file language/type, file size, PDF page index, printed page label, extraction method, OCR confidence, expected behavior, observed behavior, and screenshot if safe.

Do not mark Android acceptance complete from desktop/browser CI. PDF page fragments, popup handling, OCR quality, memory use, IndexedDB persistence, and real-world scanned layouts require a physical Android test.
