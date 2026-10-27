# Knowledge Claim Records — V1

**Review status:** Initial audit scaffold; not a completed OEM verification.
**Created:** 2026-10-27
**Branch:** `feature/dynamic-diagnostic-agent-knowledge-v1`

## Purpose

Track individual maintenance claims separately from the documents that contain them. A URL to a manufacturer portal is a discovery route, not proof that a claim applies to an installed asset. Until a reviewer inspects the exact model-specific source and records the supporting passage, entries remain `candidate_unreviewed` or `public_reviewed`; do not label them `official_verified`.

## Allowed evidence states

- `candidate_unreviewed`: extracted from project knowledge or general public guidance; technical claim has not been checked against its cited passage.
- `public_reviewed`: a reviewer has inspected the cited public passage and confirmed that it supports the wording, but it is not necessarily model-specific OEM evidence.
- `official_model_verified`: exact manufacturer, model/series, document title and revision, page/section, claim passage, and review date are recorded and checked.
- `rejected_or_conflicted`: unsupported, conflicting, outdated, or unsafe claim; exclude from diagnostic support until resolved.

Do not infer these states from a filename, brand name, citation URL, retrieval score, or language overlap.

## Claim register

| Claim ID | Claim (bounded wording) | Current source | Source class | Evidence state | Limits / next action |
|---|---|---|---|---|---|
| MOT-VFD-001 | A motor that does not start is a symptom and does not by itself identify a root cause. | `knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md`, “Case 1 — Motor does not start” | Project-authored synthesis | `candidate_unreviewed` | Verify against an appropriate motor/starter troubleshooting reference before external/model-specific promotion. |
| MOT-VFD-002 | VFD alarm meanings and reset rules vary by manufacturer, model, firmware, and configuration. | `knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md`, “Case 3 — VFD trips or motor will not run from the drive” | Project-authored synthesis | `candidate_unreviewed` | Verify with exact installed drive manual; do not attach a universal alarm meaning. |
| MOT-VFD-003 | A VFD DC bus may remain charged after input power is isolated; follow the exact manual's discharge and verification procedure. | `knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md`, “Rules before diagnosis” | Project-authored safety guidance | `candidate_unreviewed` | High-priority safety claim; review against the exact drive manufacturer's safety instructions before marking verified. |
| MOT-VFD-004 | Repeatedly resetting a protective trip or increasing an overload setting without identifying the cause is not an acceptable diagnostic substitute. | `knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md`, “Case 2 — Overload relay trips” | Project-authored safety guidance | `candidate_unreviewed` | Review against applicable equipment documentation and site procedures. |
| GEN-001 | A general troubleshooting pattern is a hypothesis, not a confirmed diagnosis for a specific machine. | `knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md`, evidence and maturity sections | Project-authored synthesis | `candidate_unreviewed` | Preserve as a system-level epistemic rule; audit representative source passages. |

## Required fields before adding a claim

Every new record should include:

- Stable claim ID and exact bounded wording.
- Source URL and publisher/author.
- Document title, revision/publication date, and access/review date.
- Exact equipment family/model and serial range, if the claim is model-specific.
- Page, section, table, or quoted short passage supporting the claim.
- Evidence state, reviewer, known limitations, and any conflicting source.
- Safety impact and whether the claim may affect a recommended action.
- Supported languages; translated text must not broaden the source claim.

## Promotion checklist

A record may become `official_model_verified` only after all model-specific fields above are populated and the cited primary document has been inspected. Keep general guidance separate from verified model-specific facts. If a source cannot be accessed or its revision cannot be established, retain the lower evidence state.

## Runtime contract

The runtime must not treat the mere presence of a claim ID as proof of validity. Retrieval should carry the claim ID, evidence state, source locator, and exact excerpt together. The generator may explain supported claims but must not upgrade evidence states, invent claim IDs, or use a source unrelated to the selected hypothesis. A text-overlap score is only a candidate-matching heuristic, not semantic verification.

## Current limitation

This initial register is intentionally small. It does **not** claim that all records in the knowledge library have been audited. Existing general catalog entries and manufacturer portal links remain unverified unless individually recorded and reviewed.
