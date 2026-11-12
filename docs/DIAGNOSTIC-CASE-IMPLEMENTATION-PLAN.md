# Diagnostic Case Contract — Implementation Plan (Draft)

**Status:** Architecture draft only. Not loaded by the app, Worker, or service worker.  
**Branch:** `work/diagnostic-pilot-foundation-2026-11-12`  
**Scope:** Establish a traceable case format and measurable acceptance gates before adding centrifugal-pump knowledge to runtime.

## Why this is the first implementation unit

The current Pilot casebook already describes the intended fields in prose. The missing engineering boundary is a machine-readable contract that can reject incomplete, contradictory, untraceable, or unsafe case records before they reach the application.

The new JSON Schema is deliberately marked `1.0-draft`. It does not certify the technical truth of a record. It checks shape and mandatory provenance only. Technical approval and field validation remain separate states.

## Contract files

- `knowledge/schemas/diagnostic-case.schema.json`: draft JSON Schema 2020-12.
- `tests/diagnostic-case-schema.test.cjs`: structural contract tests and a guard that the schema is not loaded by production runtime.
- `docs/DIAGNOSTIC-KNOWLEDGE-CASEBOOK-CENTRIFUGAL-PUMP-PILOT.md`: domain-level Pilot requirements.

## Required evidence model

Every case must separate:

1. Observable symptoms from inferred causes.
2. Competing hypotheses from confirmed outcomes.
3. Evidence supporting a hypothesis from evidence against it and from unknown information.
4. Physical measurements from PLC indications, estimates, and unknown values.
5. Measurement value from unit, location, instrument, calibration status, operating condition, timestamp, and uncertainty.
6. Technical authority from copyright/license/reuse permission.
7. Source metadata review from inspection of the exact supporting passage.
8. Candidate review from technical review and field validation.

A source record must identify the precise section, page, table, figure, or paragraph reviewed. A link or README alone is not evidence that the cited claim is supported.

## Test-selection policy to implement after the contract review

The next-test selector must first remove tests that are unsafe, unauthorized, infeasible, or missing prerequisites. Only then may it compare remaining tests.

For each eligible test, the engine should estimate:

- Which currently live hypotheses the test can distinguish.
- The expected result patterns under each hypothesis.
- The amount of uncertainty it may remove.
- Time, direct cost, required instruments, and skill/authorization.
- Whether a less invasive observation can answer the same question.

The first implementation should use transparent qualitative information-gain bands with explicit assumptions. It must not emit a numeric probability or pretend to calculate calibrated Expected Information Gain without defensible priors and likelihoods. Safety is a hard constraint, not a weighted score.

## Pilot evaluation gates

A case is not accepted because it parses. Acceptance requires all of the following:

- Schema validation passes.
- Every referenced source claim exists and supports the exact statement and scope.
- License and reuse decision are recorded independently from technical authority.
- No unresolved duplicate or contradiction exists with runtime records.
- Missing values remain unknown; no defaults or universal limits are invented.
- Sensor/PLC/estimated provenance is preserved.
- Competing hypotheses include evidence for, evidence against, and confounders.
- Every test has prerequisites, authorized role, expected outcomes, interpretation limits, and stop conditions.
- Unsafe requests terminate in a safety stop and escalation.
- Contradictory/noisy readings trigger data-quality checks rather than forced diagnosis.
- Test selection is explainable and respects safety, feasibility, time, and cost.
- A repaired case is not field-validated until post-repair evidence is captured.
- Arabic, French, and English identifiers and units remain stable.

## Evaluation fixtures planned (not yet created)

1. Low-flow case with complete, mutually consistent measurements.
2. Low-flow case with missing suction tap location.
3. Low-flow case with contradictory suction and flow indications.
4. Flow transmitter stuck/frozen while PLC value appears plausible.
5. Noisy vibration observation with no corroborating measurement.
6. Cavitation versus suction restriction with overlapping symptoms.
7. Air-lock hypothesis with a non-self-priming pump applicability question.
8. Unsafe request to open a pressurized suction strainer.
9. Unknown pump model and unavailable pump curve.
10. Post-repair run where the symptom persists.

These fixtures should test reasoning behavior, not teach the system unsupported technical facts.

## Rollout boundary

The draft schema and fixtures remain outside runtime. No candidate pump case should be added to `faults.json`, `faults-supplement.json`, the local knowledge index, or Worker retrieval until source review, license review, technical review, schema validation, safety review, and regression tests all pass.

## Decisions required later

No decision is required to continue drafting and testing the contract. Ask the product owner before:

- Selecting a permanent runtime storage model (versioned JSON bundles vs indexed local database).
- Introducing an embedding/vector dependency or remote embedding service.
- Defining field-data retention, synchronization, and sharing defaults.
- Promoting any case from technically reviewed to field validated.
- Integrating pilot cases into runtime, merging, or deploying.
