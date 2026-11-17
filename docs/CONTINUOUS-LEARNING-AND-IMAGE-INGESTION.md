# Continuous Learning and Image Ingestion — 2026-11-17

## Implemented in this branch

### PDF and image ingestion
- The document picker accepts PDF, JPEG, PNG and WebP.
- PDF processing continues through PDF.js and optional Tesseract OCR.
- Image ingestion uses browser `createImageBitmap`, downsizes to at most 4 megapixels, and runs local Tesseract OCR using the selected Arabic, English or French language packs.
- Image uploads are limited to 15 MB; PDF uploads remain limited to 40 MB.
- Original image bytes and extracted chunks are stored in the existing device-local IndexedDB document library.
- Images are represented as one-page sources so search results retain a source ID and page anchor (page 1); opening the source opens the original image.
- SHA-256 duplicate detection is used for both PDFs and images.
- Extracted image text remains unreviewed, has user-supplied rights unverified, and is never eligible for diagnosis automatically.

### Local learning memory
- `learning-memory.js` stores document-ingestion events, local diagnostic predictions and technician-reported outcomes in a separate IndexedDB database.
- Events are bounded to 5,000 records and retain metadata rather than original document contents or raw measurement values.
- Diagnostic hypotheses are explicitly labeled as heuristic rankings, not calibrated probabilities.
- A technician feedback panel appears after a matched local diagnostic result. It records whether a suggested fault was confirmed, not confirmed or inconclusive, and requires an evidence note.
- Confirmed outcomes require a selected candidate fault and an evidence summary.
- `getEvaluationCandidates()` joins predictions with contributor-confirmed outcomes and labels them as candidates requiring technical review.

## What this does not do
- It does not update model weights, fine-tune a language model, modify the live fault database, or alter diagnostic ranking automatically.
- It does not share one user's uploads or learning events with another user. All document and learning memory remains local to the current browser/device.
- It does not visually identify damaged bearings, cracks, corrosion or other visual defects. Current image processing is OCR only; image understanding requires a separately selected and evaluated vision model.
- It does not establish the truth of an uploaded manual, image, repair note or technician report.
- It does not automatically approve copyright or data reuse rights.

## Learning stages required for cross-user improvement
1. Keep source uploads and contributions local by default.
2. Add an explicit opt-in contribution workflow with authentication, tenant separation, access controls, retention/deletion, encryption, audit logging and abuse handling.
3. Upload only the minimum structured case data the contributor has agreed to share; do not upload full OEM manuals or copyrighted documents by default.
4. Deduplicate and quarantine incoming cases. Preserve source, rights, model/equipment scope, reviewer and revision.
5. Have a qualified reviewer verify the technical outcome and evidence before adding a case to a versioned shared evaluation/knowledge dataset.
6. Run regression, contradiction, leakage and cross-equipment tests before publishing a knowledge release.
7. Only after enough high-quality, rights-cleared cases exist should model fine-tuning be evaluated. Prefer retrieval and structured case reasoning first; fine-tuning is not a substitute for traceable sources.

## Verification still required
- Run `node --test tests/*.test.cjs` and `node scripts/quality-check.mjs`.
- Build the pinned PDF/OCR vendor assets and verify the new image OCR path against actual JPG/PNG/WebP fixtures.
- Test Arabic, French and English images on a real Android device, including rotated, blurred, low-light and low-resolution photos.
- Verify image original-source opening, deletion of chunks/vectors, duplicate detection and storage pressure.
- Test that a failed/empty OCR operation does not create a partial document or learning event.
- Confirm the feedback panel stores the correct diagnostic case ID and only records a confirmed fault after the required evidence is supplied.
- Cross-user learning is not implemented; it requires a separate backend and explicit privacy/product decisions.
