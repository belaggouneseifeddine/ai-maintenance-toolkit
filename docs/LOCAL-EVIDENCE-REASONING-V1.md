# Local Evidence Reasoning v1 — experimental module

## Purpose

This module adds a small, offline reasoning layer for reviewing local diagnostic hypotheses. It does not call a model, access the network, replace the existing diagnostic engine, or confirm a root cause.

## What it does

- Separates **supporting** and **contradicting** evidence instead of hiding conflicts.
- Routes structured follow-up answers to a documented next step.
- Reports one of four evidence states: `source-supported-hypothesis`, `contradictory-evidence`, `mixed-evidence`, or `insufficient-verified-evidence`.
- Preserves traceability to source ID, URL, section, page and the reviewed claim.
- Treats missing sources, non-HTTPS URLs, unknown statuses, duplicate IDs, unreviewed claims, and model/manufacturer scope mismatches as non-applicable evidence.
- Always returns `confirmedFault: null`; this is a hypothesis-review aid, not an autonomous maintenance decision.

## Evidence record contract

A source must have a unique `id`, non-empty `title`, HTTPS `url`, `status: "verified"`, and explicit `scope.manufacturers` and `scope.models` values matching the requested equipment. To count as applicable, `verifiedClaims` must contain a reviewed claim explicitly tied to the current hypothesis:

```json
{
  "hypothesisId": "low-suction",
  "claim": "Low suction pressure can reduce flow.",
  "reviewed": true
}
```

A URL alone, a generic note, or a reviewed claim linked to a different hypothesis is not sufficient. Exact model matching does not automatically prove that a source revision or site conditions are current; technicians must verify applicability before acting.

## API

- CommonJS: `require("./evidence-reasoning.js").analyse(input)`
- Browser global: `MaintenanceEvidenceReasoning.analyse(input)`
- Input: `equipment`, `evidence`, `hypotheses`, and optional structured `answers`.
- Output: preliminary status, per-hypothesis evidence state, separate supporting/contradicting source records, a next-step prompt/action, limitations, and no confirmed fault.

## Current status and limits

This is an **opt-in, unintegrated module**. Adding the file and unit tests does not mean the production UI calls it. Before integration, validate it against the current fault library and UI contract, review every source record, and run the test suite. The module has not been clinically/industrially validated against technician-labeled cases, and it makes no predictive-maintenance claim. Do not merge or publish based solely on the existence of these files.
