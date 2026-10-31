# P4 Staging Implementation Notes

Status: first-use profile UI, anonymous session Worker boundary, and schema migration implemented on the feature branch; no Cloudflare resources provisioned and no production changes made.

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

The migration has not been applied to any database. Before applying:
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
- Computes SHA-256 server-side and writes to an opaque contributor-scoped key under `private/`.
- Uses private/no-store object metadata; creates D1 document metadata with `visibility='private'` and `rights_confirmed=0`.
- Writes the document row and audit event in one D1 batch. If storage or the metadata transaction fails, it attempts to remove the R2 object.
- Does not issue public URLs, extract content, perform OCR, or publish uploaded documents.

The contributor UI now lets a signed-in staging contributor choose and explicitly upload a PDF/image from the browser. It reports the returned document ID and states that the file remains private and unprocessed. The CORS preflight supports the custom filename header and DELETE session revocation. A syntax error in the profile script was corrected and a Node syntax check was added to CI.

Automated Node tests cover origin/session gates, staging-disabled behavior, missing storage, MIME/signature mismatch, successful private PDF storage/provenance, CORS preflight, and R2 cleanup after D1 failure. The GitHub Actions workflow now runs these tests alongside the SQLite migration tests.

Required before an end-to-end staging test: create an isolated D1 database and private R2 bucket, configure the two bindings and a dedicated upload rate limiter in a non-production Wrangler environment, and apply migrations only to that staging database. The UI and API route are present but cannot complete an upload until these resources and the staging enable flag are configured. No resources have been provisioned and no upload has been tested against live Cloudflare infrastructure.

## Latest automated verification

On 2026-10-31, GitHub Actions P4 schema workflow run #58 completed successfully:
- 5 knowledge-schema SQLite tests passed.
- 5 anonymous-profile/session SQLite tests passed.
- 10 private-upload API tests passed.
- `node --check p4-profile.js` passed.

The upload API tests use mocked D1/R2 bindings. They validate route behavior and rollback logic but do not prove that real Cloudflare resources, browser CORS, or Android file selection work end to end. Live staging acceptance is still outstanding.

## Remaining implementation boundary

Not yet implemented: D1/R2 staging bindings/resources, page extraction/OCR, candidate claim creation/review/approval, dispute/withdrawal routes, diagnostic retrieval of approved community claims, and Android device acceptance. The private upload UI and API route exist in code but remain unable to store files until isolated staging resources and bindings are configured. No staging resources, secrets, buckets, databases, or deployments have been created. These steps require local/CI tests and separate staging-resource approval before provisioning.
