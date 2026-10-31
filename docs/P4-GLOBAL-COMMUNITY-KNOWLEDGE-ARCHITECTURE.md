# P4 Global Community Knowledge — Architecture Decision

Date: 2026-10-31
Base: `main` at the P1 merge (2026-10-31)
Branch: `feature/p4-global-community-knowledge`
Status: product decisions recorded; architecture proposal; implementation not yet deployed.

## Confirmed product decisions

1. A single contributor may approve a candidate and publish it as community knowledge. A second approval is not mandatory.
2. The product will use a central database and global synchronization, not device-only storage.
3. Extracted information is retained in the knowledge data store. Unreviewed extraction remains visibly marked as a candidate and is excluded from verified diagnostic evidence.
4. The app retains Gemini and Cloudflare AI as optional providers; uploaded source files and extracted text must not be sent to either provider without separate, explicit consent.
5. Existing curated `knowledge/` assets and diagnostic safety/evidence validation must remain intact.

## Proposed architecture (Cloudflare-aligned; subject to staging validation)

- **Cloudflare Worker API**: authenticated endpoints for document registration, uploads, extraction jobs, candidate claims, review/approval, community search, corrections, reports, and sync.
- **Cloudflare D1**: relational metadata and workflow state: users, contributor profiles, documents, document pages, extraction runs, claims, claim versions, approvals, source citations, revisions, reports, flags, and audit events.
- **Cloudflare R2**: original PDF/image objects and derived page previews. Store object keys and checksums in D1; do not put binary files in D1 or localStorage.
- **Browser local cache**: IndexedDB for offline drafts, upload queue, and recently used knowledge. D1 remains the canonical shared source after successful sync.
- **Background processing**: bounded extraction jobs with retry/idempotency and explicit OCR status. Prefer embedded PDF text first; OCR only scanned/image pages. Keep original page numbering and OCR confidence.
- **Static curated corpus**: keep existing repository knowledge files separate from community-submitted content, with explicit source class and provenance.

This uses Cloudflare products already present in the project, but D1/R2 resources, bindings, access policy, quotas, and any cost implications must be verified in a non-production staging environment before provisioning or deployment.

## Community approval model

A single authenticated contributor can approve a candidate. The system must not imply that approval is equivalent to OEM certification or independent scientific validation.

Required visible states:
- `candidate`: extracted/submitted; not eligible as verified diagnostic evidence.
- `community-approved`: approved by one identified contributor; eligible only with visible provenance and evidence class.
- `disputed`: a substantive correction or challenge is open; show warning and apply a configurable diagnostic-use policy.
- `rejected`: not used in diagnostic retrieval, but retained in audit history unless deletion/privacy rules require removal.
- `withdrawn`: removed from active retrieval while retaining a tombstone/audit event where legally appropriate.

Every approval must record contributor ID, timestamp, claim version, evidence class, and rationale. A later edit creates a new version and must not silently inherit the previous approval. Users can flag content; moderators/admins can suspend an account or withdraw harmful content. Provide a transparent correction and appeal trail.

## Evidence classes (not interchangeable with approval status)

- `documented-model`: exact model-specific manufacturer document with edition/revision and page/section.
- `general`: general technical information not proven specific to a model.
- `personal-local`: user experience or locally supplied material; retain its origin and do not present it as OEM documentation.
- `candidate`: not yet reviewed/approved.

Approval status and evidence class are separate fields. A community-approved claim sourced from personal experience remains personal experience; it must not be relabeled documented-model. The diagnostic UI must distinguish direct source evidence from a hypothesis or field report.

## Required records and provenance

- Document: ID, owner/contributor, filename, MIME, byte size, SHA-256, object key, upload time, visibility/consent, deletion status.
- Page: document ID, original page number, preview object key, embedded-text/OCR method, language, OCR confidence.
- Extraction run: versioned parser/OCR configuration, timestamps, status, errors, raw extracted text reference, per-page result.
- Claim: normalized text, equipment family, manufacturer/model if known, symptom/cause/check/solution type, document/page/section references, extraction method, evidence class, confidence, status.
- Claim revision: immutable version, editor, timestamp, change summary.
- Approval event: approver, timestamp, exact claim revision, rationale.
- Audit event: actor, action, target, timestamp, minimal metadata; avoid storing secrets or unnecessary personal data.

## Privacy, rights, and security gates

- Upload visibility must be explicit: private workspace, shared with community, or public. Do not assume upload implies public sharing.
- Before community publication, require the contributor to confirm they have the right to share the file/content. Support takedown/report workflows and document-level removal.
- Do not expose personal data, serial numbers, customer identifiers, credentials, or sensitive site information in public knowledge. Provide redaction and reporting.
- Do not send user documents or extracted text to Gemini/Cloudflare AI unless the user separately opts in for that processing and sees what will be sent.
- Enforce authentication, authorization, upload size/type limits, malware/content checks where feasible, rate limits, abuse controls, signed short-lived upload/download URLs, and server-side validation.
- CORS is not authentication. Never treat a client-provided contributor ID or approval state as trusted.
- Preserve LOTO and qualified-person safety gates. Community approval cannot bypass procedural safety validation.

## Synchronization and offline behavior

- IndexedDB stores local drafts and a retryable sync queue; every operation has an idempotency key.
- D1 is canonical for shared community records. Resolve conflicts through versioned append-only claim revisions, not silent last-write-wins overwrites.
- Show pending, synced, failed, and conflict states to the user.
- Local-only/private documents remain private unless the contributor explicitly changes sharing scope.
- Provide export and account deletion/data-retention behavior before public launch.

## Staged implementation plan

1. **P4.0 foundation**: D1 schema/migrations, R2 object lifecycle, Worker auth boundary, contributor identity/roles, audit events, staging-only resources.
2. **P4.1 ingestion**: PDF/image validation, private upload, checksums, embedded PDF text extraction, page records and previews.
3. **P4.2 OCR and candidate extraction**: Arabic/English/French OCR, confidence thresholds, raw-text retention, structured claims linked to original pages.
4. **P4.3 review and community publication**: single-contributor approval, revision history, evidence classes, flags/disputes/withdrawals, consent controls.
5. **P4.4 diagnostic retrieval and sync**: retrieve only eligible approved claims with provenance; IndexedDB offline queue and conflict handling.
6. **P4.5 resilience and launch review**: quotas/cost monitoring, abuse/privacy/rights review, backups/restore, migration, tests and mobile accessibility.

## Decisions still needed before production implementation

- **Authentication provider** for worldwide contributors (e.g. Google/GitHub OAuth or email one-time code). Do not ship public write endpoints without verified identity.
- **Community visibility default**: private until explicitly shared is recommended.
- **Moderation authority and abuse response**: define who can suspend accounts, handle takedowns, and resolve disputes.
- **Retention/deletion policy** for original uploads and personal data.
- **OCR execution location**: browser-local OCR versus server-side processing. Server-side OCR improves consistency but uploads document content to the service; local OCR improves privacy but increases device/data constraints. This must be a user-visible choice.
- **Staging resource approval**: D1/R2 resource names, region/jurisdiction implications, quotas, and cost monitoring before provisioning.

## Acceptance criteria

- Every extracted page/text fragment is retained with source-document and page provenance.
- Unreviewed candidates never appear as verified diagnostic evidence.
- One authenticated contributor can approve a specific immutable claim revision.
- Approval never changes evidence class or invents model specificity.
- Corrections create new revisions; disputed/withdrawn claims are visibly flagged and excluded according to policy.
- Documents are private by default and public sharing requires explicit consent.
- No document content is sent to an AI provider without separate explicit consent.
- Existing diagnosis validation, LOTO gate, Gemini/Cloudflare provider paths, and curated knowledge assets remain regression-tested.
- Sync is idempotent and exposes pending/failure/conflict states.
- No production database, storage bucket, secrets, or deployment are changed as part of this architecture document.
