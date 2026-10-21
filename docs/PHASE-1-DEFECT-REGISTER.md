# Phase 1 defect register — 2026-10-21

## Confirmed from source inspection

## Implementation progress — 2026-10-21

- [x] Fixed monthly due-date calculation so January 31 clamps to the last day of February, including leap years.
- [x] Added validation for malformed preventive-maintenance dates and custom report ranges.
- [x] Added stable IDs to existing maintenance records and changed new photo links to use record IDs.
- [x] Updated the main log, diagnosis-save, and draft-save paths to assign IDs at record creation.
- [x] Bumped the service-worker cache to v27 so updated frontend files can be picked up by clients.
- [x] Added one-time migration for legacy photo rows from `recordIndex` to `recordId`; legacy attachments that no longer map to a record are shown as unavailable rather than silently reassigned.
- [x] Added a Node regression test for JavaScript syntax and month-end date behavior; expanded the workflow to run all `tests/*.test.cjs` when relevant files change.
- [ ] Verify the actual GitHub Actions run result; available status checks currently show Vercel build-rate-limit failures, not a confirmed result for the new test workflow.
- [ ] Verify photo migration on real browser storage. Historical photo links that were already wrong before migration cannot be reconstructed reliably from array positions alone.


### P1 — Photo attachments use array positions instead of stable record identity

Status: code fix committed; real-browser migration test pending.
File: `maintenance-v03.js`

- The photo selector serializes the current array position as its option value.
- Saved photo objects store `recordIndex`.
- Photo rendering resolves a record with `records[p.recordIndex]`.
- Inserting a new record at the beginning of the array changes every older record's position. Deleting or importing records can also change the association.
- Result: a photo can appear attached to a different maintenance record, or become orphaned. This is a data-integrity defect.

Required fix:
1. Assign a persistent unique `id` to every record; migrate existing records in local storage without deleting any fields.
2. Use the record ID as the photo selector value.
3. Store `recordId` in each new photo, never the array index.
4. Migrate legacy photo rows from `recordIndex` to `recordId` once, using the existing record order at migration time.
5. Render photos by finding the matching ID; clearly mark orphaned attachments and never silently reassign them.
6. Test: add a record after saving a photo, delete another record, reorder/import records, reload, and verify the photo remains linked to the original record.

### P1 — Record ID migration must preserve older records
The main log form and some generated records currently write records without IDs. A migration confined to the photo module is insufficient unless every read path assigns and persists IDs before a photo can be attached.

### P2 — Dynamic localization is incomplete
File: `maintenance-v03.js`

The feature panel has a small hard-coded Arabic-to-French/English map. Several dynamic messages and generated record strings are Arabic literals, including preventive-maintenance status/alerts, validation errors, report text, photo status/errors, and some statistics labels. The observer translates only text nodes whose complete trimmed text matches a key, so mixed text and changing values often remain untranslated.

Required fix:
- Use the existing `MaintenanceI18n.t(key)` dictionary where possible.
- Add translation keys for the feature panel instead of broad text-node replacement.
- Translate dynamic status, validation, empty-state, photo and report messages.
- Keep user-entered maintenance notes unchanged.
- Test Arabic, French and English after switching languages while the panel is open and after adding/removing records.

### P2 — Monthly due-date edge case

Status: code fix committed; regression test added; CI result pending.
The monthly due-date calculation uses JavaScript `Date.setMonth`. For dates near the end of a month, this can roll into the following month instead of clamping to its last day. Test month-end dates and define a deliberate calendar rule before release.

### P2 — Date validation

Status: custom report range and new preventive-task date validation committed. Existing malformed task records are now excluded from due/overdue calculations and shown with an invalid-date label; browser verification pending.
Custom report ranges should reject or clearly handle a start date later than the end date. Preventive-maintenance tasks should require a valid last-execution date before computing a due date.

## Release-blocking verification still required

- Run `node --test tests/diagnostic-engine.test.cjs` in GitHub Actions and record the actual result.
- Add browser tests for language switching, theme toggle, navigation and record/photo integrity.
- Test backup/import round trips and malformed JSON.
- From a real client, verify Cloudflare `/health` and one consented generic `POST /api/chat`; record status, latency and error handling without exposing API secrets.
- Verify the deployed GitHub Pages build and service-worker update behavior on Android.
- Do not claim the app is production-ready until these checks pass.

## Safety and privacy constraints

- Keep API credentials only in Cloudflare secrets; never put them in browser code or public repository files.
- Treat AI and rule-based findings as advisory, not a confirmed diagnosis.
- Do not add generic pressure, torque, vibration or electrical setpoints without exact manufacturer/source support.
- Keep photos local unless the user explicitly consents to a reviewed upload workflow.
