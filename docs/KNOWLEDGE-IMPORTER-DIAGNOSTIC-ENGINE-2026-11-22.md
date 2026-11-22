# Knowledge Importer and Diagnostic Knowledge Engine — implementation notes

**Branch:** feat/knowledge-importer-diagnostic-engine-2026-11-22  
**Baseline:** main at 28bd2ecea8282e8f6d7bb915d83e8509d198b06e  
**Status:** isolated implementation foundation; no merge, deployment, or runtime knowledge promotion.

## Existing architecture findings

- Structured pump case validation already exists in `diagnostic-casebook.js` and `knowledge/schemas/diagnostic-case.schema.json`.
- The current centrifugal-pump low-flow case is CP-004 and remains `candidate` with `licenseStatus: reference_only`.
- `bayesian-engine.js` already contains qualitative relative-support scoring and source-gated expected-information-gain logic. Its LR values are explicitly heuristics, not field-calibrated probabilities.
- PDF import/retrieval already exists as a separate local IndexedDB document library. It retains page references and has review workspaces; it is not a structured fault-knowledge importer.
- There is no dedicated general-purpose knowledge-import module in the main-branch file tree.
- Existing diagnostic reasoning is split across `diagnostic-engine.js`, `diagnostic-flows.js`, `diagnostic-session.js`, `diagnostic-casebook.js` and `bayesian-engine.js`. A previous branch audit already identified that casebook coverage heuristics and Bayesian expected information gain are separate strategies.

## New boundaries

1. `knowledge-importer.js` parses JSON, CSV, Markdown and text into a staging-only envelope. It validates source metadata, requires separate code/data license declarations, applies a 5 MiB/5,000-row cap, rejects unsafe JSON keys and malformed CSV, and never publishes or executes imported content.
2. PDF bytes remain in the existing local document-library workflow. Importing a PDF does not establish redistribution permission or diagnostic eligibility.
3. `diagnostic-knowledge-engine.js` adapts structured cases to a conservative assessment contract. It preserves source types, flags missing/estimated/PLC/historian/suspect/noisy/conflicting readings, keeps hypotheses unresolved, and selects only installed-instrument observations as automatic next-test candidates.
4. Runtime eligibility is fail-closed: schema valid + `field_validated` + `reuse_permitted` + reviewed claim-level sources with section/page. No existing candidate record is promoted by this work.
5. The next-test selection is explicitly a safe-observation coverage heuristic, not Bayesian information gain. EIG remains unavailable unless the likelihood table and source resolver gates are satisfied.

## Import review checklist

- [ ] Confirm source owner, exact URL, version/edition and source date.
- [ ] Record code license and data/content license separately; use `not_applicable` only when demonstrably inapplicable.
- [ ] Record attribution and reuse status; `unknown` and `reference_only` remain non-publishable.
- [ ] Preserve original source file and hash outside the public repository when it contains user documents or restricted content.
- [ ] Identify content type: technical document, dataset, telemetry, simulation, ontology, model, procedure or fault case.
- [ ] Inspect actual files and dataset provenance; do not infer dataset rights from a repository code license.
- [ ] Map equipment family, exact model scope, component, fault mechanism, symptoms, competing hypotheses and confounders.
- [ ] Map each measurement to unit, location, operating condition, timestamp, source type, sensor status and quality.
- [ ] Record tests, prerequisites, safety class, expected outcomes per hypothesis, interpretation limits and stop conditions.
- [ ] Attach claim-level source title, revision, section/page, reviewer and review status.
- [ ] Validate schema; test missing, contradictory, noisy, stale and suspect-sensor cases.
- [ ] Complete technical and safety review before any runtime promotion.
- [ ] Verify post-repair outcome and field validation before `field_validated`.

## Verification and remaining limitations

- A user-facing file picker and device-local IndexedDB staging store are now wired into the Knowledge tab. The importer accepts JSON, CSV, Markdown and TXT; PDF/OCR remains in the existing document-library workflow.
- CSV and Markdown are intentionally retained as raw candidate records; no automatic conversion to verified diagnosis rules is performed.
- Case-specific likelihood mappings and validated Bayesian update rules are not yet implemented. The current next-test ordering is a safe-observation coverage heuristic, not information gain.
- GitHub Actions on commit `1f397185d35cad19dbebc7c0a64b85cf044ff4a5` completed successfully: diagnostic regression suite 364/364, full unit/integration test workflow, static safety/integrity checks, UI smoke tests and read-only live app/Worker smoke checks.
- No manual Android-device acceptance test, technician field validation, new source/license adjudication, runtime knowledge promotion, merge or deployment has been performed.
