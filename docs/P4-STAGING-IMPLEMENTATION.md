# P4 Staging Implementation Notes

Status: first-use profile UI, anonymous session Worker boundary, and migrations 0001–0003 are implemented on the feature branch. The recorded 2026-11-01 staging update reports an isolated D1 database with migrations 0001–0003 applied; R2 remains disabled, no Worker deployment or production changes were made, and no live upload has been tested.

## Staging MVP identity and first-use profile

Login is deliberately deferred. The first staging MVP uses a first-use profile plus a server-issued anonymous session:

- On first launch, collect the user's display name and professional title/specialty.
- Qualification/certificate is optional.
- Save the profile locally and reuse it automatically for all later document uploads, claims, reviews, and corrections. Do not repeat the form for every contribution.
- Provide a profile/settings screen so the user can edit these fields later.
- Label name, title, and qualification as self-declared; do not imply that credentials have been verified.
- Generate a random installation/session bootstrap value and exchange it with the Worker for a revocable server-issued anonymous session token. The server derives contributor ID from that session; never trust a contributor ID, role, owner ID, or approval state sent in request JSON.
- Persist the session token and profile locally for the staging test, with an explicit reset/revoke path. Do not put privileged secrets in the browser.
- This anonymous session is a staging convenience, not verified identity. Before opening public contribution at scale, add Google and/or email OTP (provider choice remains deferred) and account recovery/linking.

A single test contributor can exercise the full workflow without repeated profile entry. Do not enable unrestricted public writes on the basis of this anonymous flow.

## Database migration

File: `migrations/0001_p4_community_knowledge.sql`

D1 schema covers:
- contributor profiles and linked authentication identities (identity-linking is deferred; schema may be simplified for the staging-only anonymous profile);
- source documents and page-level extraction metadata;
- extraction runs;
- community claims and immutable revisions;
- single-contributor approval events;
- flags/disputes and audit events;
- community reports.

Raw extracted page text is referenced by an R2 object key rather than stored as a large D1 row. Original files and page previews belong in private R2; D1 stores metadata and provenance.

Before implementing anonymous sessions, update the migration to store profile fields (display name, professional title/specialty, optional qualification) and revocable session-token hashes. Never store raw session tokens in D1. Remove or defer provider-specific identity records until login is implemented. Add tests for session issuance, expiry, revocation, profile reuse, and rejection of client-supplied identity/role fields.

The original pre-provisioning checklist below is historical: the 2026-11-01 staging update records that migrations 0001 and 0002 were applied to the isolated staging D1. Apply any later migration only after reviewing its SQL and confirming the target is the isolated staging database:
1. Create a named staging D1 database.
2. Add its ID and binding to a non-production Wrangler environment.
3. Run migration locally against a clean SQLite/D1-compatible test database.
4. Apply remotely to staging only.
5. Verify tables, indexes, constraints, rollback/recovery, and access restrictions.

## Storage and upload policy

- R2 bucket must remain private; do not enable public bucket access.
- Document visibility defaults to private.
- Community/public sharing requires an explicit user action and rights confirmation.
- Upload endpoints must authorize ownership using the server-issued anonymous session and contributor record.
- Validate MIME and file signatures, enforce size limits, calculate SHA-256 server-side, and generate opaque object keys.
- Never trust filenames or client-provided MIME types as proof of content.
- Use short-lived signed upload/download URLs only after authorization, or stream through authenticated Worker routes.
- Configure bucket CORS only for the exact app origins and required methods/headers.
- Add malware scanning/content validation and abuse limits before accepting public community uploads.

## OCR processing decision for initial release

Use local/browser extraction for text PDFs where possible and offer local OCR as a later opt-in path. Do not silently upload a user's source file to a remote OCR or AI provider. A server-side OCR mode may be added only with an explicit per-upload consent explaining that document bytes leave the device.

## Implemented on the feature branch (not deployed)

- `migrations/0002_p4_anonymous_profiles.sql`: self-declared display name, professional title/specialty, optional qualification, profile-completed flag, and revocable session records. Only a SHA-256 token hash is stored in D1.
- `p4-community.js`: Worker routes for first-use enrollment, profile read/update, and session revocation. Contributor identity is resolved from the validated bearer session; client-supplied contributor IDs and roles are not used.
- `p4-profile.js`: first-use form, local profile persistence, profile editing, retry of server enrollment, and session revocation controls. The profile is not re-entered for each contribution.
- `worker.js`: delegates `/api/community/*` routes to the community module.
- `scripts/test-p4-anonymous-profile.py`: SQLite behavioral tests for the migration.
- P4 schema CI now runs the original knowledge workflow tests and anonymous-profile migration tests.

The profile UI uses the staging Worker URL. Until the staging D1 binding and rate-limit binding are configured, enrollment will remain unavailable and the app will explicitly retain the profile locally only. No real community upload or claim submission endpoints have been implemented yet.

## Private document upload API — implemented in code, not provisioned

The staging branch now includes `POST /api/community/documents` in `p4-community.js` and a private upload form in `p4-profile.js`:

- Requires an active server-issued contributor session; owner identity is taken only from that session.
- Remains disabled unless `P4_STAGING_ENABLED=true`.
- Requires a private R2 binding named `COMMUNITY_FILES` and a dedicated rate-limit binding named `P4_UPLOAD_RATE_LIMITER`.
- Accepts PDF, JPEG, PNG, and WebP only; checks file signatures against the declared MIME type.
- Enforces a 10 MiB limit while streaming the request body, including when Content-Length is absent.
- Enforces hard staging storage ceilings of 1 GiB for the dedicated staging corpus and 100 MiB per contributor to limit accidental free-tier overuse.
- Computes SHA-256 server-side and writes to an opaque contributor-scoped key under `private/`.
- Uses private/no-store object metadata; creates D1 document metadata with `visibility='private'` and `rights_confirmed=0`.
- Writes the document row and audit event in one D1 batch. If storage or the metadata transaction fails, it attempts to remove the R2 object.
- Does not issue public URLs, extract content, perform OCR, or publish uploaded documents.

The contributor UI now lets a signed-in staging contributor choose and explicitly upload a PDF/image from the browser. It reports the returned document ID and states that the file remains private and unprocessed. The CORS preflight supports the custom filename header and DELETE session revocation. A syntax error in the profile script was corrected and a Node syntax check was added to CI.

Automated Node tests cover origin/session gates, staging-disabled behavior, missing storage, MIME/signature mismatch, successful private PDF storage/provenance, CORS preflight, and R2 cleanup after D1 failure. The GitHub Actions workflow now runs these tests alongside the SQLite migration tests.

Required before an end-to-end staging test: confirm the existing isolated D1 database and its migration ledger, enable R2 only after explicit approval, create a private staging bucket, configure the COMMUNITY_FILES and P4_UPLOAD_RATE_LIMITER bindings in the non-production Wrangler environment, and apply any pending reviewed migration (including 0004) to staging only. The UI and API route are present but cannot complete an upload until the private R2 binding and staging enable flag are configured. No live R2 upload has been tested.

## Atomic private-storage quota reservation — 2026-11-05

The isolated quota-hardening branch adds migration `0004_p4_storage_quota_reservations.sql` and changes the upload path:

- A D1 reservation row is inserted before any R2 write.
- A SQLite/D1 `BEFORE INSERT` trigger checks the global 1 GiB ceiling and the 100 MiB per-contributor ceiling in the same serialized database write.
- Only active R2-backed documents and unexpired reservations count. GitHub-backed public documents do not consume the private R2 staging quota.
- Each reservation has a 30-minute lease. Expired reservations are ignored by the trigger and cleaned opportunistically on later uploads.
- Successful document metadata, audit event, and reservation release are committed in one D1 batch. R2 or D1 failure attempts to delete the object and release the reservation.
- If migration 0004 is absent, the upload route fails closed with HTTP 503; it does not fall back to the previous non-atomic quota query.

**Deployment boundary:** this is code and a local SQLite test change only. Migration 0004 has not been applied to the remote staging D1; R2 remains unavailable until the owner enables and binds a private bucket. Do not enable staging uploads until the migration is applied and verified.

**Residual distributed-failure window:** a Worker crash after the R2 put but before the D1 metadata batch can leave an orphan R2 object. The reservation expires after 30 minutes, so quota accounting recovers, but orphan-object reconciliation/cleanup remains a separate required task. The database trigger prevents concurrent requests from exceeding recorded quota; it cannot make R2 and D1 one distributed transaction.

## Latest automated verification

On 2026-10-31, GitHub Actions P4 schema workflow run #63 completed successfully:
- 5 knowledge-schema SQLite tests passed.
- 5 anonymous-profile/session SQLite tests passed.
- 12 private-upload API tests passed, including global and per-contributor storage quotas.
- `node --check p4-profile.js` passed.

The upload API tests use mocked D1/R2 bindings. They validate route behavior and rollback logic but do not prove that real Cloudflare resources, browser CORS, or Android file selection work end to end. Live staging acceptance is still outstanding.

## Remaining implementation boundary

Not yet implemented: private R2 staging bucket/binding, OCR, structured table extraction, candidate claim creation/review/approval, dispute/withdrawal routes, diagnostic retrieval of approved community claims, and Android device acceptance. The isolated D1 staging database is recorded as provisioned with migrations 0001–0003; migration 0004 is not applied. The upload UI/API still cannot store files until R2 is enabled and the private staging binding is configured. No Worker deployment or live upload has been performed. Any further staging resource change requires separate approval.


## Cloudflare staging provisioning update — 2026-11-01

The isolated Cloudflare D1 database `maintenance-community-staging` has now been created in the EU jurisdiction. It is separate from production and has read replication disabled.

- Database UUID: `6d8edd48-85dd-48a5-be63-fa031af9f18a`.
- Applied `0001_p4_community_knowledge.sql` and `0002_p4_anonymous_profiles.sql` directly through the D1 SQL API, sequentially.
- Created the standard `d1_migrations` ledger and recorded both migration filenames so subsequent Wrangler migration commands do not attempt to reapply the already-executed schema changes.
- Remote read-only verification returned 12 domain tables, the migration ledger, Cloudflare's internal `_cf_KV` table (14 tables total), 12 triggers, 2 migration ledger entries, 0 contributors, and 0 uploaded documents.
- The schema and migration ledger are present in this isolated staging database. No production database or Worker deployment was changed.
- `wrangler.staging.toml` now binds `COMMUNITY_DB` to this database, enables the staging feature flag, and declares separate enrollment and upload rate-limit bindings. These are repository configuration changes only; the Worker has not been deployed, so those bindings are not active yet.
- Cloudflare R2 is still not enabled on the account. The private document-upload path cannot be tested end to end until the user enables R2 and a private staging bucket/binding is configured.
- GitHub Actions for the updated branch are running; their final conclusions are not yet known.

The D1 API rejected a combined diagnostic request containing SQLite PRAGMA commands with `SQLITE_AUTH`; no schema changes resulted from that read-only diagnostic attempt. Verification was repeated with ordinary SELECT queries and succeeded. A full integrity/foreign-key PRAGMA check therefore remains outstanding.


## GitHub document library fallback — 2026-11-01

Cloudflare R2 remains disabled by user choice. A GitHub-backed public-document path has been added on this feature branch:

- Public PDFs belong under `knowledge/documents/<manufacturer>/<equipment-family>/<model>/`.
- `.github/workflows/extract-pdf-pages.yml` runs on PDF changes to the staging branch and creates page-numbered JSON sidecars under `knowledge/extracted/`.
- `scripts/extract-pdf-pages.py` uses pypdf, records the source SHA-256 and page numbers, and marks image-only pages as `ocr_required`.
- Text extraction does not perform OCR, structure tables, verify technical accuracy, or grant OEM/community approval. Table-bearing pages are explicitly marked for manual review.
- `migrations/0003_github_document_index.sql` adds GitHub storage provenance and bounded page-text fields. It was applied to the isolated D1 staging database on 2026-11-01 and recorded as migration 3.
- D1 verification confirmed the new columns and migration ledger entries 1–3. No document records or page text have been imported yet.
- The legacy `r2_object_key` column remains for schema compatibility; GitHub-backed rows will use a documented opaque `github://` locator until a later storage-schema cleanup. This does not create or enable R2.

**Public-repository warning:** the GitHub repository is public. Any PDF committed to this folder is publicly downloadable. Only documents with explicit public redistribution permission may be uploaded. Do not upload confidential, internal, customer, or personal-data documents.

### Current implementation boundary

The GitHub upload instructions and automatic PDF-to-page-text extraction pipeline are present. The D1 schema can now store GitHub document metadata and extracted page text. The authenticated import endpoint that transfers generated sidecars into D1, the searchable knowledge API, and diagnostic citation integration are still outstanding. No Worker has been deployed; no PDF has been uploaded or processed in this turn; no R2 resource, production setting, or live site was changed.
