# Local Assistant, Diagnostic Reasoning, and PDF Refactor Audit

Audit date: 2026-11-19  
Base: `main` at `28bd2ecea8282e8f6d7bb915d83e8509d198b06e`  
Working branch: `refactor/local-assistant-diagnostic-pdf-2026-11-19`

## Scope and evidence boundary

This document records code-level relationships confirmed by reading the current source and tests. It is not a claim that the Android build, OCR quality, offline embedding runtime, or physical-device performance has been validated.

## 1. Current responsibility map

### Conversation and local tools

```text
diagnostic-chat.js
  ├─ diagnostic-session-ui.js
  │    └─ diagnostic-session.js
  │         ├─ diagnostic-flows.js (shared fallback flow registry)
  │         └─ bayesian-engine.js (qualitative relative-support scorer)
  └─ assistant-local-orchestrator.js
       ├─ assistant-session-contract.js
       └─ assistant-tool-registry.js
            └─ assistant-local-tools.js
                 ├─ engineering-core.js
                 ├─ diagnostic-engine.js + faults.json
                 ├─ bayesian-engine.js (next-test EIG capability)
                 └─ document-retrieval-adapter.js
                      └─ document-library.js / document-semantic-search.js
```

The diagram describes the intended/runtime call boundaries at a high level; individual UI paths and fallback branches still need end-to-end tracing.

- `assistant-local-orchestrator.js` owns conversation turn coordination, session updates, and tool invocation. Its header explicitly excludes natural-language parsing, model loading, network access, and persistence.
- `assistant-session-contract.js` owns the versioned message/fact/tool-event schema and provenance/status validation.
- `assistant-tool-registry.js` is the allow-list, input-validation, timeout, output-bounding, and execution boundary.
- `assistant-local-tools.js` adapts concrete local capabilities. It loads the local fault library, calls the deterministic engineering core and diagnostic engine, and delegates reviewed-document retrieval.
- `diagnostic-chat.js` is the conversational UI/controller that calls the session UI and local orchestrator. Do not move DOM concerns into the orchestrator.

**Cleanup decision:** keep these modules separate. Their responsibilities are not duplicates. Simplify their contracts and remove code only after runtime references, HTML script order, service-worker cache entries, deployment copy lists, and tests have been checked.

## 2. Diagnostic engine and evidence limitations

- `diagnostic-engine.js` scores equipment match, symptom match, and matching observation keywords. It records numeric measurements and quality warnings, but its measurement summary explicitly reports `usedForNumericThresholdDecision: false`.
- Measurement names are added to keyword text; the current rule-based score does not compare numeric values, units, timestamps, sensor quality, or operating conditions against fault-specific thresholds.
- `diagnostic-session.js` owns adaptive questions and hypothesis updates for its embedded flows. It calls `bayesian-engine.js` for a qualitative support score when available.
- The Bayesian engine uses a default prior and fixed heuristic likelihood ratios. Its own source comments state that these are not learned or calibrated field probabilities. Keep the output labelled as relative support, not probability or confidence percentage.
- The Bayesian EIG function is stricter: it requires approved, resolvable likelihood sources and valid outcome distributions. If these are missing, it returns a non-success status rather than fabricating an information-gain ranking.
- `assistant-local-tools.js` exposes `rankNextDiagnosticTests`; verify every model/tool adapter exposes it before describing next-test ranking as available in all assistant paths.

**Measurement-rule implementation on this branch:** a separate evaluator now accepts only rules with approved review status, verified source status, a visually verified source page, a document/page locator, exact measurement name and unit, exact operating context, and an explicit comparison operator/range. It accepts only direct measurements with healthy sensor status and good quality. Unsupported, estimated, PLC/Historian, stale, mismatched, missing, or ambiguous readings remain `unknown`. Verified supports/contradictions are used only as tie-breakers after the existing equipment/symptom/keyword score; no generic numeric limits or calibrated probabilities are added. Existing fault records without these rule fields are unchanged.

**Next diagnostic change:** introduce a single evidence/result contract before adding more scoring logic. Numerical evidence may influence ranking only when a fault rule defines the measured variable, canonical unit, valid operating context, comparison operator/range, source reference, and review state. Missing, stale, estimated, contradictory, or non-independent readings must remain explicitly qualified. No generic thresholds should be inferred.

## 3. Flow registry versus adaptive session engine

These files are related but not duplicates:

- `diagnostic-flows.js` provides a shared structured registry used as a fallback for equipment/symptom pairs not embedded in the adaptive session engine.
- `diagnostic-session.js` embeds adaptive multi-question flows and owns session state, evidence accumulation, hypothesis ranking, and next-question selection. When no embedded flow exists, it can create a limited single-step registry session.
- `diagnostic-session-ui.js` resolves UI equipment/symptom text, creates sessions, renders questions, and submits answers.

Potential consolidation should target duplicated flow *definitions* and inconsistent schemas, not delete either runtime layer. A future normalized flow schema should support localized questions/options, evidence IDs, unknown outcomes, source refs, and a declared mode (adaptive vs single-step).

## 4. PDF ingestion and retrieval

- `document-library.js` owns local PDF import/extraction and orchestrates OCR/chunk indexing.
- `document-semantic-search.js` owns the optional local multilingual embedding pipeline and the separate IndexedDB vector store.
- `document-retrieval-adapter.js` exposes reviewed diagnostic excerpts to local tools.
- `diagnostic-document-evidence.js` and the review workspace provide source/page review and citation UI.

Current semantic-search behavior:
- Embeddings use a pinned multilingual MiniLM Q8 model.
- First activation requires an explicit model load/download; this is not a fully offline first-run path.
- The IndexedDB store already has a non-unique `modelVersion` index.
- Search previously called `getAll()` on the entire vector store, including records from inactive model versions, before filtering them in memory.

**Implemented in this branch:** search now streams `vectors` through the existing `modelVersion` index for the active model version and retains only the requested top-K matches. This avoids materializing the active model's full vector corpus in memory. The scan remains linear in the active model's vector count; this is not an approximate nearest-neighbor index. No IndexedDB schema migration is required. Static regression assertions protect the indexed cursor and bounded result set.

Still unverified:
- OCR accuracy for real Arabic/French/English industrial PDFs.
- Table, diagram, curve, and multi-column extraction quality.
- End-to-end citation correctness from PDF page to retrieved claim to diagnostic response.
- Android memory, latency, storage growth, and thermal behavior on a 6 GB RAM device.
- Semantic retrieval behavior with large corpora and stale/deleted documents.

## 5. Planned implementation sequence

1. **Contracts first:** define shared shapes for equipment context, observations/measurements, evidence provenance, hypotheses, unknown/contradictory evidence, next-question/test recommendations, and PDF citations.
2. **Diagnostic integration:** route adaptive session results, deterministic fault-library results, Bayesian relative support, and source-verified EIG through one normalized result envelope. Keep their evidence classes distinct.
3. **Measurement semantics:** add value-aware interpretation only for reviewed fault rules with explicit units, context and source-backed ranges; add tests for boundary values, unit mismatch, stale data, sensor quality, contradictory readings and missing values.
4. **Knowledge expansion:** add fault cases with localized symptoms, differential causes, discriminating evidence, counter-evidence, unknown states, measurements, source/page references, and verification class. Do not increase record count by adding unsupported generic causes.
5. **PDF validation:** build a fixture suite for text PDFs, scanned PDFs, Arabic/French/English, tables, columns, malformed/large files, repeated imports, deleted documents, and source-page citations. Separate static contract tests from real extraction/quality tests.
6. **Cleanup:** only after the contract and tests stabilize, remove confirmed dead code and update HTML loading, service-worker cache, GitHub Pages/Cloudflare Pages asset lists, and tests together.

## 6. Verification status for this branch

- Implemented: model-version-indexed vector cursor with bounded top-K retention; regression contract assertions; local Qwen runtime/agent adapters and one-chat controls; canonical evidence envelope; post-guided-flow note reassessment.
- Not implemented or proven: numeric threshold scoring (no source-reviewed measurement rules were found in the current diagnostic schema), new fault cases (no new claims added without reviewed source evidence), real PDF extraction/quality fixtures, Android APK rebuild/device acceptance, and dead-file deletion.
- CI/device validation: not yet demonstrated by this document.
- Merge and production deployment: not performed.


## Additional implementation — source-gated measurements and candidate knowledge

- Added `diagnostic-measurement-rules.js`. A measurement rule is eligible only when it is approved, source-verified, page-verified, exact-model-scoped, and matches the exact measurement name, unit, operating condition, direct-measurement source, timestamp, sensor state and quality flag. It does not convert units or invent limits.
- Verified support/contradiction now acts only as a tie-breaker after the existing equipment/symptom/keyword score. No verified rule means numeric values do not change ranking.
- Added candidate case CP-005 for PACO VL/VLS insufficient flow, sourced to the Grundfos/PACO manual Section 12.1–12.2, printed page 15. It is reference-only and candidate-only; it is not added to the live fault library.
- Added PDF retrieval-adapter tests to verify that document ID, PDF page, printed page, review state and retrieval methods survive the adapter boundary. These tests do not replace real OCR/table extraction or Android device testing.
