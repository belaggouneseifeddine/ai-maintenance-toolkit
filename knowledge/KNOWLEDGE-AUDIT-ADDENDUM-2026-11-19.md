# Knowledge audit addendum — 2026-11-19

This file supplements the generated `KNOWLEDGE-AUDIT-REPORT.md`; it does not alter its script-generated inventory.

- Added candidate case **CP-005**: PACO VL/VLS vertical inline centrifugal pump — insufficient flow. Scope is limited to the PACO VL/VLS families covered by the Grundfos/PACO installation and operating instructions, Section 12.1–12.2, printed page 15.
- The source is registered as **reference-only** because an open redistribution license was not verified. The case remains `candidate`, `licenseStatus: reference_only`, and is not promoted into the live fault library. It adds no universal numeric thresholds and no field-validation claim.
- Added a source-gated measurement-rule evaluator. It accepts only explicitly approved rules with a verified source status and page, exact model scope, exact unit and operating-condition match, direct-measurement provenance, valid timestamp, healthy sensor status and good quality. Verified support/contradiction is used only as a tie-breaker after the existing diagnostic score; unsupported or mismatched readings remain unknown.
- Added regression tests for the new candidate case, source registration, measurement-rule eligibility and ranking behavior.
- Added PDF retrieval-adapter tests to verify that document ID, PDF page, printed page, review state and retrieval methods survive the adapter boundary. These do not replace real OCR/table extraction or Android device testing.

The inventory counts in the generated audit report remain the prior baseline. CP-005 is a separate casebook candidate and must not be added to live fault counts.
