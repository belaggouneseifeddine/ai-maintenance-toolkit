# P4 Staging Implementation Notes

Status: foundation schema committed; no Cloudflare resources provisioned and no production changes made.

## Confirmed sign-in requirement

Contributor sign-in must offer both:
- Google OAuth / OpenID Connect.
- Email one-time verification code.

The app is intended for worldwide community participation. Do not put a restrictive Cloudflare Access allowlist in front of the public contributor workflow: it would prevent open community registration. Cloudflare Access can protect operator/admin tooling, but the public contributor identity flow needs an application identity layer that supports self-service registration and account linking.

Implementation requirements:
- Verify Google ID tokens server-side (issuer, audience, signature, expiry, nonce/state).
- Email OTP must be short-lived, single-use, rate-limited, and stored hashed; never log or persist the plaintext code.
- Normalize and verify email addresses before linking identities.
- Prevent account takeover during Google/email account linking; require proof of control of both identities.
- Create contributor identity records only after successful verification.
- Derive contributor ID and roles from verified server-side identity, never from request JSON.
- No public write endpoint until authentication and authorization middleware is complete.

## Database migration

File: `migrations/0001_p4_community_knowledge.sql`

D1 schema covers:
- contributor profiles and linked authentication identities;
- source documents and page-level extraction metadata;
- extraction runs;
- community claims and immutable revisions;
- single-contributor approval events;
- flags/disputes and audit events;
- community reports.

Raw extracted page text is referenced by an R2 object key rather than stored as a large D1 row. Original files and page previews belong in private R2; D1 stores metadata and provenance.

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
- Upload endpoints must authenticate, authorize ownership, validate MIME and file signatures, enforce size limits, calculate SHA-256 server-side, and generate opaque object keys.
- Never trust filenames or client-provided MIME types as proof of content.
- Use short-lived signed upload/download URLs only after authorization, or stream through authenticated Worker routes.
- Configure bucket CORS only for the exact app origins and required methods/headers.
- Add malware scanning/content validation and abuse limits before accepting public community uploads.

## OCR processing decision for initial release

Use local/browser extraction for text PDFs where possible and offer local OCR as a later opt-in path. Do not silently upload a user's source file to a remote OCR or AI provider. A server-side OCR mode may be added only with an explicit per-upload consent explaining that document bytes leave the device.

## Current implementation boundary

This branch currently contains the architecture decision, the first D1 schema migration, and this staging checklist. It does not yet include authentication routes, upload routes, OCR workers, frontend screens, Cloudflare bindings, secrets, database creation, bucket creation, or deployment. Those are separate implementation steps and must be tested in staging before production.
