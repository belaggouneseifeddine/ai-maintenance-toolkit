# P4 Authentication Integration Review — Deferred

Date: 2026-10-31
Status: Supabase Auth + Brevo review retained for a later phase; not part of the current staging MVP.

## Current product decision

The user has decided to defer login and work first on expanding the knowledge foundation. The staging MVP will collect a contributor profile once on first use:

- Display name: required.
- Professional title/specialty: required.
- Qualification/certificate: optional.
- The app reuses the saved profile automatically for subsequent contributions and offers profile editing in settings.
- These fields are self-declared and must not be presented as verified identity or credentials.

For the single-contributor staging test, use a limited anonymous enrollment flow with a server-issued, revocable session token. Store only a hash of the token in D1. Derive contributor ID from the validated session on every write; never trust client-supplied contributor ID, owner ID, role, approver, review status, or diagnostic eligibility. This does not provide verified identity and must not be exposed as unrestricted public registration.

## Deferred provider research

The earlier Supabase Auth + Brevo review remains useful if/when public community access requires verified identity:

- Supabase Auth supports Google social sign-in and passwordless email OTP.
- Supabase custom SMTP can use Brevo, but external delivery requires custom SMTP and a verified sender/domain.
- The Worker would validate asymmetric Supabase JWTs against a fixed, server-configured JWKS endpoint.
- Brevo SMTP credentials must remain in Supabase configuration and never enter browser code, repository files, D1, or Worker variables.
- Identity linking must require proof of control of both identities; matching email strings alone are insufficient.

No Supabase project, Google OAuth app, Brevo account configuration, SMTP credential, secret, D1/R2 resource, or deployment has been created.

## Security boundary for the anonymous staging flow

1. Anonymous enrollment issues an unpredictable high-entropy token once; only its hash is stored server-side.
2. Token expiry, revocation, rate limits, and abuse controls are required.
3. Contributor profile fields are validated and length-limited; users can update their own profile, with an audit event.
4. Every document and claim operation derives its owner/contributor from the session, not request fields.
5. Private documents remain private by default. Upload does not imply community publication.
6. A single staging contributor may approve the exact current immutable claim revision under the limited MVP policy.
7. Candidate, disputed, rejected, and withdrawn claims are excluded from diagnostic retrieval.
8. Do not send uploaded documents or extracted text to Gemini, Cloudflare AI, Supabase, or Brevo without separate explicit consent. Supabase/Brevo are deferred identity/email providers, not document processors.

## Required local tests before staging resources

- Missing, malformed, expired, and revoked anonymous session -> reject write.
- Random/unknown token -> reject write.
- Valid session -> contributor identity is resolved server-side.
- Client-supplied contributor ID, owner ID, role, approver, review status, or diagnostic eligibility is ignored/rejected.
- First-use profile is saved once and reused on subsequent contributions.
- Profile can be edited only by its own session; changes are audited.
- Contributor A cannot read or mutate contributor B's private document.
- Upload defaults to private; public sharing requires explicit consent and rights confirmation.
- Approval applies only to the exact current immutable revision.
- Dispute/withdrawal atomically disables diagnostic eligibility.
- Candidate and disputed/withdrawn/rejected claims never appear in diagnostic retrieval.

Use the repository's existing test conventions after inspecting them. Do not provision D1/R2 or deploy until these tests pass locally and the user separately approves staging resource creation.
