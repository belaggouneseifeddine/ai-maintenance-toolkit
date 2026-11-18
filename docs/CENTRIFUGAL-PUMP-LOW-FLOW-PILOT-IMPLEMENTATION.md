# Centrifugal-pump low-flow pilot — implementation note

**Branch:** `work/maintenance-offline-semantic-phase2-2026-11-17`  
**Status:** Candidate case + build-time contract; not runtime knowledge.

## What was added

- `knowledge/diagnostic-cases/centrifugal-pump-low-flow.json`: a structured differential case with six competing hypotheses, explicit measurement metadata, three evidence-gathering activities, limits, stop conditions, verification criteria and source/license status.
- `knowledge/schemas/diagnostic-case.schema.json`: JSON Schema contract for diagnostic cases.
- `diagnostic-casebook.js`: dependency-free contract validator and conservative candidate triage helper.
- `tests/diagnostic-casebook.test.cjs`: tests for missing metadata, provenance, source-review gates, unresolved hypotheses and safe next-observation selection.

## Important behavior

This first runner is intentionally not a diagnostic classifier. It does not assign scores, likelihoods or probabilities, and it does not claim a root cause. It preserves hypotheses as unresolved and can only suggest an installed-instrument observation as the next evidence-gathering step. PLC values, historian values, estimates and direct measurements remain distinct.

The source register now also records three bounded reference-only sources: the GIW/KSB MDX manual (Section 12.1, Table 12-2, p.83; MDX slurry-pump scope only), the KSB pump lexicon (operating point and operating limits), and ASHRAE Handbook 2024 Chapter 44 (hydronic-system curves). They support parts of the operating-point framework and selected MDX examples, not a universal six-way diagnosis. Reuse is not permitted by this registry; the OEM manual and handbook remain link-and-cite references only. The case therefore remains `candidate`, with `licenseStatus: reference_only`, and is not loaded into the live diagnosis engine.

## Next work

1. Obtain an applicable pump OEM manual and pump/system curve for a specific model/configuration, with exact page/section and reuse terms.
2. Review each claim against its source and separate general mechanism from model-specific limits.
3. Add contradictory, stale, noisy, mismatched-unit and sensor-fault fixtures.
4. Have a qualified pump technician review the test logic and stop conditions.
5. Only then consider connecting the case to the runtime registry.
