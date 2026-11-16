# Android PDF acceptance checklist

Status: required manual validation; not yet performed.

## Test device
- Android phone and Chrome version:
- App URL / commit:
- Available storage before test:
- Network state:

## Test files
1. Text-based PDF with known printed page labels.
2. Scanned Arabic PDF.
3. Scanned French PDF.
4. Scanned English PDF.
5. Mixed document where printed page numbers differ from PDF page indexes.

## Acceptance steps
- [ ] Import a text PDF under 40 MiB; confirm the app reports page and chunk counts.
- [ ] Search for a technical term; confirm the result cites the correct 1-based PDF page.
- [ ] Tap “open source page”; confirm the PDF viewer opens that exact page.
- [ ] Repeat with Arabic, French and English OCR enabled separately.
- [ ] For a text-based PDF, preview a page and inspect the suggested candidate tags; confirm each suggestion preserves the exact source wording and PDF page.
- [ ] Use a suggested candidate as draft text; confirm it does not auto-approve the claim or bypass original-page review.
- [ ] For a text-based PDF, preview a page, open the original PDF page, compare the technical claim with the source context, and confirm page review before approving the claim.
- [ ] Compare OCR text against the visible source page; record confidence and errors, then confirm both source-page review and OCR visual verification before approval.
- [ ] Confirm OCR pages over the 150-page cap are explicitly reported as skipped.
- [ ] Confirm a mixed printed/PDF page label can be recorded separately.
- [ ] Close and reopen the app; confirm IndexedDB documents and claims remain available.
- [ ] Test with network disabled after parser/OCR assets have been cached; record which functions remain available.
- [ ] Test low-storage behavior and document deletion.
- [ ] Confirm unreviewed documents and claims never appear in diagnostic evidence.
- [ ] Approve a test document and one page claim with verified rights; confirm only the matching equipment family/model retrieves it.
- [ ] Change the document's rights, edition, or equipment scope; confirm prior claims are marked stale and no longer retrieved until reviewed again under the new document revision.
- [ ] Tap the diagnostic citation and verify the exact original PDF page opens.

## Failure record
For every failure, record device/browser, file language/type, PDF page index, printed page label, extraction method, OCR confidence, observed behavior, and screenshot if safe.

Do not mark Android acceptance complete from desktop/browser CI. PDF page fragments, popup handling, OCR quality, memory use, and IndexedDB persistence require a real Android device.
