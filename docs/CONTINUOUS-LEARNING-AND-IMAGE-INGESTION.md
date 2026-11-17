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

## Learning workflow update — image and document claims

- The review workspace now accepts OCR-extracted claims from uploaded images as well as PDF pages. Images are treated as source page 1 and can be opened from the original local blob.
- A claim extracted by either PDF OCR or image OCR cannot be approved unless the original source is opened and the OCR text, numbers, units and model identifiers are visually checked. This closes the previous gap where `image-ocr` was not classified as OCR during claim approval.
- Document-review and knowledge-claim metadata are now also recorded in the local learning-memory event log. The log stores identifiers, source page, equipment/model scope, extraction method, reviewer and review state; it does not duplicate the extracted claim text or upload source files.
- The document review workspace displays a local learning dashboard: imported documents, currently approved document reviews, saved claims, approved claims, diagnostic outcome candidates and conflicting outcomes. Counts use the latest review state for each document/claim.
- Deleting a document removes its ingestion, document-review and knowledge-claim events, in addition to the existing document chunks, claims and semantic vectors.
- No cross-user sharing, cloud contribution endpoint, automatic fault-library promotion, or model-weight training has been added.

## Next implementation stage

1. Add a structured review/export format for rights-cleared and technically approved claims, preserving source/page/model provenance.
2. Add image-specific quality checks and an explicit manual transcription fallback for unreadable labels; do not infer damaged components from OCR.
3. Build an opt-in shared contribution backend only after explicit product/privacy approval, with authentication, consent, tenant isolation, retention/deletion and moderation.
4. Evaluate vision-language inference separately for visual condition assessment. OCR and visual diagnosis must remain separate capabilities.

### Human-verified visual observations from uploaded images

- The review workspace now offers a separate image-observation form for image sources. It requires opening the original local image, explicitly confirming that it was inspected, identifying the visible component, selecting a visible condition, describing only what is actually seen, and recording supporting context.
- Visual condition labels include normal appearance, wear, corrosion, crack, leakage trace, contamination/deposit, visible heat effect, deformation, unknown and other.
- A human confidence label is stored as a qualitative label, not as a probability. The record is tagged `candidate-requires-technical-review` and `eligibleForVisionTraining: false`.
- The dashboard lists these image observations for later technical review. The original image remains local in the document library; the learning event stores structured observation metadata and a link to the document ID, not a duplicate image or a claim that a model recognized the defect.
- OCR-derived image claims and visual observations are separate paths: OCR supports reading nameplates/text; visual observations are manually entered by a technician. Neither path currently performs automated visual defect recognition.

## Independent technical review for image observations — 2026-11-18

- The public MaintenanceLearningMemory API now exposes the document-review, claim-review, dashboard and image-observation methods used by the UI. Previously these functions existed internally but were not exported, so the dashboard and image-observation save path could fail at runtime.
- Each image observation can receive one recorded technical decision: approved or rejected. A decision requires a reviewer label different from the contributor label and a written evidence rationale of at least 30 characters.
- The review record preserves the observation ID, document ID, contributor label, reviewer label, decision, rationale and timestamp. Deleting the source document also removes its image observation review events.
- A technically approved observation remains not eligible for diagnosis or vision-model training. Approval records a review decision only; it does not establish reviewer identity, legal rights, or scientific validity. Reviewer names are self-entered and are not authenticated.
- The dashboard now shows pending and decided observations, including the decision rationale. A second review cycle requires a new observation rather than silently overwriting the previous decision.

## Verification update

- Contract tests now assert that the required learning APIs are exported and that image decisions require a distinct reviewer label, written rationale, and remain excluded from diagnosis and vision training.
- Static contract assertions are not a substitute for executing the Node test suite or testing the review workflow on Android. Those remain outstanding.

- Before making a decision, the second reviewer must open the original local image and explicitly confirm their own visual inspection. The decision API rejects reviews without this confirmation; the checkbox is enabled only after the source-opening action succeeds.
