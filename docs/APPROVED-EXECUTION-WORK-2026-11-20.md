# Approved execution work — 20 November 2026

## Decision boundary

This branch implements only the user's approved items: centrifugal-pump pilot completion, probabilistic-reasoning development, code cleanup, local Qwen completion, PDF/knowledge improvements, test and candidate-isolation improvements, staged equipment expansion, maintenance collaboration/work-order capability, and ongoing GitHub/competitor inventory.

Explicitly excluded by the user:
- Task 2: evidence/source-traceability remediation. Do not change source registries, claim provenance rules, or source-validation policy under this authorization.
- Task 4: deterministic safety-gate enforcement. Do not change safety-gate policy or make it stricter under this authorization.

No merge, production deployment, paid service, or externally binding action is authorized.

## First implementation slice

### Bayesian evaluation foundation

Added `bayesian-calibration-evaluator.js` as an offline evaluation-only utility. It calculates multiclass Brier score, mean log loss, and top-label expected calibration error for explicitly held-out predictions. It rejects malformed probability vectors, duplicate holdout IDs, non-holdout records, and asset-group overlap with training data. It does not train a calibrator, modify the existing qualitative Bayesian engine, or claim that any output is calibrated.

### Pump pilot test contract

The existing centrifugal-pump casebook remains candidate-only. The next test slice must cover:
- Missing/unknown readings.
- Estimated values versus direct and PLC values.
- Noisy, stale, contradictory, suspect, and failed sensor readings.
- Duplicate tags and incompatible units.
- Pump command/frequency versus actual shaft-speed evidence.
- Concurrent flow, suction pressure and discharge pressure under comparable operating conditions.
- Six separate differential cases: cavitation, air lock/loss of prime, suction restriction, low flow, mechanical-seal leakage, and bearing degradation.
- No universal numeric thresholds without the exact equipment curve or applicable model documentation.
- No conversion of sound or a single symptom into a confirmed root cause.

### Definition of done for the pilot

A case remains a candidate and cannot enter runtime until its differential hypotheses, measurements, expected result patterns, uncertainty limits, and post-repair verification tests are reviewed. This implementation slice does not perform source-traceability remediation or safety-gate policy changes.

## Remaining approved work

1. Complete the six pump case records and executable scenario tests.
2. Integrate evidence-group probabilities only when independently validated likelihood tables exist; otherwise retain relative support labels.
3. Review module boundaries and remove duplication only when imports, runtime references and tests prove a module unused.
4. Complete local Qwen integrity and Android performance verification.
5. Finish PDF extraction, page-anchored retrieval, and local semantic-search tests.
6. Ensure candidate knowledge is excluded from both runtime bundles and deployed static artifacts.
7. Add equipment families only through candidate datasets and test fixtures until technical and licensing review.
8. Add local maintenance work orders, asset history, and export/import as a later feature slice.
9. Continue repository inventory with separate code/data licensing and primary-source checks.

## Verification status

The new evaluator tests are authored but have not yet been executed in this environment. No test result is claimed here.
