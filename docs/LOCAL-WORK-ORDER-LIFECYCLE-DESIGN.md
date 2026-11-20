# Local maintenance work-order lifecycle — design proposal

**Status:** approved scope, design stage; not yet implemented or connected to the UI.

## Goal

Add a small local-first work-order lifecycle without turning the toolkit into a network-dependent CMMS. It should link an asset, diagnostic session, work performed, parts used, and post-repair verification.

## Proposed record

- `workOrderId`: stable local identifier.
- `assetId`, equipment family, manufacturer/model when known.
- `title`, symptom/complaint, priority, creation date, requested/due date.
- `status`: draft, open, in_progress, blocked, completed, cancelled.
- `assignedToLabel`: optional plain label only; no identity or authentication claim.
- `diagnosticSessionId`: optional link to a local diagnostic session.
- `hypothesesAtOpen`: snapshot of candidate hypotheses, explicitly not confirmed causes.
- `workLog`: timestamped observations and actions, author label, attachments by local reference.
- `parts`: part number/description/quantity; no inventory availability claim.
- `completion`: cause confirmed/not confirmed/inconclusive, repair performed, verification measurements and remaining limitations.
- `revision`: monotonically increasing local revision for conflict detection on import.

## Lifecycle rules

1. A diagnostic hypothesis cannot automatically become a confirmed failure.
2. Completed requires a completion note and verification outcome; unresolved work can be blocked or inconclusive rather than falsely completed.
3. Preserve a local event history for status changes and edits.
4. Export/import must validate schema and detect duplicate IDs/revision conflicts.
5. Attachments remain local unless the user explicitly exports them.
6. No remote synchronization, team accounts, access control or audit-grade attribution in the first version.

## Phased implementation

- Phase A: versioned schema, pure validation and lifecycle tests.
- Phase B: local persistence and import/export with backup/restore tests.
- Phase C: compact UI integrated with asset and diagnostic history.
- Phase D: optional team sync only after authentication, authorization, conflict resolution and privacy review.

## Definition of done

A technician can create, update, pause, complete and export a work order offline; the app preserves history and distinguishes hypotheses from verified outcomes; invalid imports and revision conflicts are rejected without data loss.
