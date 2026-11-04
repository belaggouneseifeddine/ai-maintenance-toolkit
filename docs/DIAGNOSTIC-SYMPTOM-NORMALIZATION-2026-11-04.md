# Diagnostic symptom normalization correction — 2026-11-04

## Finding

The shared normalizer converted both `low_flow` and `low_pressure` to the same `low_flow_pressure` canonical ID. The local diagnostic matcher then treated either input as a match for fault records tagged with either symptom. This could return a flow-related fault for a pressure-only report (or the reverse) when the equipment type matched.

Evidence on the base commit `f22880fe561324e95a22989230af7f2a25b29b09`:
- `normalization.js` merged both symptom IDs in `canonicalize()`.
- `diagnostic-engine.js` explicitly accepted both `low_flow` and `low_pressure` records for the merged ID.
- Existing tests asserted the merged ID and did not assert negative cross-matches.

## Change on this branch

- Preserve `low_flow` and `low_pressure` as separate canonical symptom IDs.
- Remove the broad low-flow/low-pressure equivalence from fault matching.
- Keep the existing `noise_vibration` behavior unchanged; it is outside this correction.
- Add normalization assertions in English and Arabic.
- Add a focused regression test proving each symptom returns only its corresponding record.

## Scope and safety

No fault knowledge, thresholds, OEM claims, safety gate, Worker, provider configuration, deployment workflow, or production environment is changed. The change only narrows symptom matching to avoid unrelated candidate records.

## Verification

- GitHub Actions CI is the required full-suite execution path because a local repository clone could not be obtained in this runtime.
- Do not treat this branch or its tests as production-ready until the PR checks complete and the regression result is reviewed.
