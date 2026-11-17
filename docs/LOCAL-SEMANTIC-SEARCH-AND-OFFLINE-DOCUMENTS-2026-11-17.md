# Offline PDF, OCR and Local Semantic Search — 2026-11-17

## Implemented in this branch

### Document ingestion

- PDF.js 4.10.38 is loaded from `./vendor/pdfjs/`, not from a CDN.
- Tesseract.js 5.1.1 and its matching `tesseract.js-core` 5.1.1 runtime are loaded from `./vendor/tesseract/`.
- OCR language packs are prepared for Arabic (`ara`), English (`eng`) and French (`fra`) from the upstream `tessdata_fast` repository.
- `scripts/vendor-document-runtime.sh` pins the package versions and builds the deployment-side `vendor/` directory. The vendor files are generated into the static-site artifact; they are not committed as copied binaries.
- The Service Worker precaches these heavier runtime assets as optional resources. The app shell remains installable if an optional vendor asset cannot be fetched; OCR/PDF processing requires that the relevant assets have been cached once.

### Semantic retrieval

- `document-semantic-search.js` uses Transformers.js 3.8.1 with the `q8` model variant of `Xenova/paraphrase-multilingual-MiniLM-L12-v2`, pinned to model revision `2c4055b12046f11709e9df2c122e59ffbdc2f900`.
- The model is activated explicitly by the user because the q8 ONNX model file is 118 MB. Download progress is displayed, and the download is never triggered automatically. It must not be auto-downloaded over mobile data.
- First activation requires connectivity to fetch model assets. Transformers.js browser caching is enabled; after the model has been cached, inference can run locally without sending PDF text or queries to a model API.
- Embeddings are stored in a separate IndexedDB database (`maintenance-ai-semantic-index`) keyed by PDF chunk ID and document ID.
- PDF chunks retain their original document, page number, extraction method, OCR confidence, rights state and review state in the document library.
- Retrieval uses reciprocal-rank fusion between BM25 and cosine-ranked multilingual embeddings. Raw similarity is a retrieval score, not a fault probability.
- Diagnostic retrieval only maps semantic hits back to claims that are already approved, tied to a reviewed document revision and source page, and eligible for the equipment/model context. Unreviewed OCR text is not promoted to diagnostic evidence.

### Safety interaction

- The diagnostic checklist no longer blocks the diagnosis form.
- Incomplete checklist state produces an advisory warning. It does not clear results, stop the local engine, or require an acknowledgement button.
- The assistant tool registry also returns an advisory warning for safety-sensitive diagnosis instead of blocking the local diagnostic tool.
- The warning is visible in the assistant's diagnostic response. It is not a safety clearance and does not authorize physical intervention.

### Local assistant and evidence ranking

- Local assistant tools remain allow-listed and locally executed.
- Tool outputs are JSON-cloned before being returned to the orchestrator.
- Public session methods return defensive snapshots instead of mutable references to the orchestrator's internal state.
- The Bayesian engine now exposes `expectedInformationGain`. It requires complete, explicit outcome likelihoods for every hypothesis; missing likelihoods are rejected rather than invented.
- Expected information gain ranks candidate tests in bits. It is conditional on the supplied likelihoods and is not a calibrated fault probability. Cost, time and safety warnings remain visible as separate fields.

## Licensing and provenance

| Asset | Version/source | License status | Distribution rule |
|---|---|---|---|
| PDF.js | 4.10.38, Mozilla | Apache-2.0 | Bundled with its notice |
| Tesseract.js | 5.1.1, naptha | Apache-2.0 | Bundled with its notice |
| Tesseract.js-core | 5.1.1, naptha | Apache-2.0 | Bundled with its notice |
| tessdata_fast | upstream ara/eng/fra packs | Apache-2.0 repository | Bundled with source attribution |
| Transformers.js | 3.8.1, Hugging Face | Apache-2.0 | Runtime bundle and notice are included |
| Multilingual MiniLM model | base model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2; ONNX export: Xenova | Base model declares Apache-2.0; a separate license notice for the Xenova export was not verified in this review | Model weights are not bundled or redistributed. Verify export terms before any redistribution. User-triggered download only. |

## Known limitations — do not mark as complete yet

1. No physical Android-device benchmark has been run for OCR latency, memory pressure, thermal throttling, storage growth or embedding latency.
2. No real multilingual PDF fixture suite has yet been run against scanned and text-based Arabic, French and English documents. The current tests are contract/static tests, not OCR accuracy tests.
3. The first embedding-model activation requires internet and about 118 MB of model assets. Browser storage can be evicted by the operating system; the app must detect a missing cache and explain that the model needs to be downloaded again.
4. The embedding model is general multilingual text, not trained on industrial maintenance terminology. Search relevance must be measured against a reviewed query/document set before the results are used to influence diagnosis.
5. A semantic hit is only a retrieval candidate. It does not verify technical correctness, applicability to an OEM model, copyright permission, or diagnostic causality.
6. The new information-gain API is exposed as a local assistant tool but is not yet connected to the technician-facing next-test selector. It refuses to rank unless an application-injected trusted source resolver confirms the reviewed likelihood source; no such production resolver or approved likelihood table is registered yet. Likelihood tables must be source-backed and reviewed per equipment family before production use.
7. The local assistant still has no private trained language model and no autonomous natural-language tool planner. Its local orchestrator and deterministic chat routing are not a from-scratch LLM.

## Required verification

Run from the repository root:

```sh
node --test tests/*.test.cjs
node scripts/quality-check.mjs
bash scripts/vendor-document-runtime.sh /tmp/maintenance-runtime-test
```

Then verify on a real Android phone:

- Import a text PDF in Arabic, French and English.
- Import a scanned PDF in each language and verify the exact page anchor and OCR confidence.
- Disconnect the network after vendor assets and the embedding model have been cached; repeat PDF extraction, search and retrieval.
- Search across languages (Arabic query against French/English text and vice versa).
- Verify source title, revision, page, extraction method, rights status and review status for every result.
- Confirm that unreviewed documents and OCR-only claims never enter diagnostic evidence.
- Record model download size, first-run time, indexing time per 100 chunks, query latency, peak memory and storage use.

## Next work

1. Complete the real Android multilingual PDF/OCR and semantic retrieval test matrix.
2. Add skip/rebuild logic for unchanged vectors, index progress and a clear cache-health indicator.
3. Connect expected-information-gain ranking to the diagnostic session while preserving explicit likelihood provenance and advisory safety warnings.
4. Improve the diagnostic chat's structured extraction of equipment, operating context, measurements, units and data provenance.
5. Extend the component/equipment ontology only after the centrifugal-pump pilot has source-reviewed cases and measurable tests.
