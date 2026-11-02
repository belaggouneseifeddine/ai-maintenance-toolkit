# Private Knowledge Adapter — contract and implementation boundary

Status: schema contract added on an isolated feature branch. This is not a live adapter, importer, search endpoint, or diagnostic integration.

## Purpose

Represent concise, original maintenance knowledge as traceable records without publishing the underlying private or restricted source documents. The public repository contains only the schema and this policy document. Actual records derived from private books/manuals must remain in private storage controlled by the owner.

## Evidence classes

- `SOURCE`: the cited source directly supports the concise statement. Store the source identity and exact printed page(s).
- `INFERENCE`: a reasoned interpretation derived from one or more source records. Populate `derived_from`; do not present it as a direct quotation or source fact.
- `OEM_REQUIRED`: the statement cannot support a machine-specific action or setting until the exact manufacturer, model, revision, and applicable manual section are verified. These records are explicitly ineligible for diagnostic retrieval.

## Mandatory distinctions

1. A book's general PLC teaching is not an OEM procedure for a particular PLC or machine.
2. An educational example is `example_only` and cannot become a live diagnostic instruction or setpoint.
3. Community review is not independent scientific validation, regulatory approval, or OEM certification.
4. Unknown, pending, or private-only redistribution rights force private visibility.
5. A source page reference is provenance, not proof that the statement applies to every model.
6. Do not infer numeric probabilities from qualitative evidence labels.

## Safety gate

The adapter must never recommend bypassing guards, interlocks, emergency stops, safety relays, pressure protection, or other protective devices. It must not recommend energized intervention, unsafe isolation shortcuts, or forced I/O as a troubleshooting workaround. If isolation status, hazard controls, or competence are unknown, the runtime must stop at safe information gathering and escalation.

The schema stores safety metadata; it does not itself enforce a safe work permit, LOTO procedure, or site risk assessment. Runtime enforcement and tests are required before any operational use.

## Privacy and copyright

- Do not commit PDFs, extracted full-page text, copied tables, figures, or substantial source passages to this public repository.
- Keep private-only or rights-unclear knowledge records outside the repository and outside public D1/GitHub-backed indexing.
- Store only original concise summaries and the minimum page-level provenance required for audit.
- Public visibility requires explicit redistribution permission and a separate review decision.
- Do not upload a private source to a remote OCR/AI service without explicit per-document consent.

## Retrieval contract (future work)

A future adapter may return a record only when all of these are true:
- `publication.visibility = public` or the requesting user is authorized for its private scope;
- `publication.diagnostic_eligible = true`;
- review state is accepted by the runtime policy;
- source locator and page provenance are present;
- equipment scope matches, or the record is explicitly a general principle;
- no safety or rights restriction blocks use.

The diagnostic response must preserve the evidence class, source title, printed page, scope, limitations, and review state. It must not upgrade community review to OEM verification.

## Acceptance tests required before integration

- Reject missing source identity, missing page provenance for page-based sources, and invalid evidence classes.
- Reject diagnostic eligibility for `OEM_REQUIRED` and `example_only` records.
- Reject public visibility when redistribution rights are private, pending, or unknown.
- Ensure inferences reference their parent source records.
- Ensure unknown observations remain unknown and do not become negative evidence.
- Ensure safety gates run before ranking or retrieval.
- Verify exact model/revision matching before machine-specific recommendations.
- Verify citations survive normalization, ranking, UI rendering, and report export.

## Current status

Implemented: JSON Schema contract and this policy document.

Not implemented: private record store, schema validator in runtime, authenticated private retrieval, importer, search endpoint, citation UI integration, OCR/table extraction, or end-to-end tests. No private book content is included. No Worker deployment, database mutation, merge, or production update is part of this branch.
