# P4 Authentication Integration Review

Date: 2026-10-31
Status: researched design decision; no provider account, project, SMTP credentials, secrets, or Cloudflare resources created.

## Decision summary

For the staging MVP, use Supabase Auth as the identity provider and Brevo as the custom SMTP delivery service for email OTP. Keep the community data plane in Cloudflare Worker + D1 + private R2. Supabase is an identity dependency only; it is not the canonical community database or file store.

This is a conditional recommendation, not a production approval. It depends on verifying that the free Supabase project can be kept active during the test and that a sender domain can be verified in Brevo.

## Evidence from current official documentation

- Supabase Auth supports Google social sign-in and passwordless email OTP. Supabase Auth issues JWT access tokens. See https://supabase.com/docs/guides/auth and https://supabase.com/docs/guides/auth/jwts
- Supabase's default SMTP is not suitable for a public contributor test: it sends only to pre-authorized team addresses and is currently limited to 2 messages/hour. Custom SMTP is required for external addresses. Supabase documents Brevo as a compatible SMTP provider. See https://supabase.com/docs/guides/auth/auth-smtp
- Brevo's current Free plan includes 300 email sends/day, including transactional sends, but requires a registered/verified sender. See https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan and https://developers.brevo.com/docs/send-a-transactional-email
- Supabase Free currently includes 50,000 MAU and 500 MB database, but a project with insufficient activity over a 7-day period can be paused. It is therefore suitable for a short staging experiment, not an uptime commitment. See https://supabase.com/pricing and https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase exposes a project JWKS endpoint for asymmetric signing keys. Its documentation recommends verifying tokens against the project JWKS and not caching keys longer than the recommended rotation window. See https://supabase.com/docs/guides/auth/jwts and https://supabase.com/docs/guides/auth/signing-keys
- Cloudflare Workers provides Web Crypto APIs for signature verification and supports the Workers Vitest integration for testing in the actual Workers runtime. See https://developers.cloudflare.com/workers/runtime-apis/web-crypto/ and https://developers.cloudflare.com/workers/testing/vitest-integration/

## Important implementation conditions

1. Configure Supabase Auth to use asymmetric JWT signing (RS256 or ES256) before integrating the Worker. Do not design around the legacy shared HS256 JWT secret.
2. Worker must verify the bearer access token cryptographically against the configured Supabase project's JWKS; validate allowed algorithm, issuer, audience, expiry, not-before when present, subject, and verified email where required.
3. Restrict issuer/JWKS URL to a server-configured exact project URL. Never fetch a JWKS URL, issuer, or key URL supplied by a request or token claim.
4. Cache JWKS only for a bounded interval that permits key rotation; refresh once on unknown key ID. Fail closed if verification cannot be completed.
5. Treat the verified Supabase subject as an external identity only. Resolve/create the internal contributor record server-side using a unique (provider, provider_subject) mapping. Never accept contributor ID, role, owner ID, or approval authority from request JSON.
6. Google OAuth must use the Supabase-managed provider flow with exact allowed redirect URLs, state and PKCE protections. Google credentials belong only in Supabase provider configuration; never in frontend source or Worker variables exposed to clients.
7. Email OTP must be enabled as passwordless sign-in, require email verification, use short expiry and single use, and have CAPTCHA/abuse controls and rate limits. The Worker must not create its own OTP scheme.
8. Brevo SMTP credentials must be stored only in Supabase Auth SMTP configuration, not in the repository, browser, D1, or Worker. Verify sender/domain ownership and SPF/DKIM/DMARC before public use. Free tier is 300 messages/day; delivery is not guaranteed and rate limits must be tested.
9. Do not link Google and email identities merely because they report the same email string. Require an authenticated session proving control of the existing identity and a secure provider-linking flow.
10. Use D1 for contributor authorization state, ownership, and moderation state. A valid identity token alone does not imply permission to access another user's document or approve arbitrary claims.
11. For MVP, contributor role is assigned server-side at first verified sign-in. Admin/moderator privileges are never self-assignable and must not be derived from OAuth metadata or client input.
12. No document bytes or extracted text are sent to Supabase, Brevo, Gemini, or Cloudflare AI. Supabase receives authentication identifiers and email; Brevo receives OTP email content only.

## Worker integration boundary

- Public read endpoints may remain separate, but all P4 writes require a verified Supabase access token.
- Require authentication for document registration, upload URL creation, extraction submission, claim creation, approval, dispute, withdrawal, and private document access.
- Enforce ownership on every private document/page/extraction read and mutation.
- Approval must be bound to the authenticated contributor and the exact current immutable revision. The server must insert the approval event; clients cannot set review_status or diagnostic_eligible directly.
- Disputes and withdrawals must remove a claim from diagnostic eligibility in the same database transaction/batch.
- CORS allowlists remain browser-origin policy only, never an authentication mechanism.
- Do not expose service-role keys or SMTP credentials to the browser or Worker.

## Staging MVP provider setup checklist

- [ ] Create a Supabase Free project manually; confirm no paid plan/add-on is selected.
- [ ] Enable Google provider and configure exact app redirect URLs.
- [ ] Configure asymmetric signing keys (RS256 or ES256); record issuer and JWKS URL.
- [ ] Register a sender/domain in Brevo Free; verify sender/domain and SPF/DKIM/DMARC.
- [ ] Configure Supabase custom SMTP with Brevo credentials; never commit credentials.
- [ ] Set email OTP templates, expiry, CAPTCHA, and conservative rate limits.
- [ ] Confirm external test addresses receive OTP; test resend, expiry, replay, and rate limiting.
- [ ] Add only public Supabase project URL and anon/publishable key to the client. Keep service-role and SMTP credentials server-side.
- [ ] Add exact Supabase issuer/JWKS configuration to the Worker staging environment as non-secret configuration; keep any privileged keys as secrets.
- [ ] Confirm free-tier quotas, pause behavior, and provider terms before inviting anyone beyond the single test contributor.

## Required automated security tests before any staging resource provisioning

### Token verification
1. Missing Authorization header -> 401.
2. Malformed bearer header -> 401.
3. Invalid JWT signature -> 401.
4. alg=none, unexpected algorithm, or unsupported key type -> 401.
5. Wrong issuer -> 401.
6. Wrong audience -> 401.
7. Expired token -> 401.
8. Future nbf -> 401.
9. Missing/empty subject -> 401.
10. Unknown kid triggers one bounded JWKS refresh; still unknown -> 401.
11. JWKS endpoint failure or malformed JWKS -> fail closed; no P4 write.
12. Key rotation: newly published key becomes accepted after refresh; revoked key is rejected after bounded cache expiry.
13. Request-supplied contributor_id, role, owner_id, review_status, or diagnostic_eligible never overrides server-derived state.

### Authorization and ownership
14. Authenticated contributor A can create/read their own private document.
15. Contributor B cannot read, replace, delete, or request a download for A's private document (404/403 consistently).
16. Unauthenticated upload/register/extract/approve/dispute/withdraw writes are rejected.
17. Contributor cannot assign self moderator/admin role.
18. Approval is rejected if the actor is not authenticated, claim is not owned/approvable under policy, or revision is stale.
19. Approval records the authenticated contributor and exact current revision; client-supplied approver is ignored.
20. Dispute/withdrawal atomically disables diagnostic eligibility.
21. Candidate and disputed/withdrawn/rejected claims never appear in diagnostic retrieval.
22. Private source file remains private even if claim text is approved; document sharing requires separate explicit consent.
23. CORS from an unlisted origin does not grant access; allowed Origin without a valid token still gets 401.

### Email/provider flow
24. OTP request is rate-limited per account/IP and protected against enumeration.
25. Expired, already-used, and invalid OTPs cannot create a session.
26. Repeated resend attempts are throttled; logs contain no OTP or SMTP credentials.
27. Google OAuth callback rejects invalid state/PKCE and unapproved redirect destinations.
28. Linking Google and email identities requires proof of control of both identities.
29. Supabase/Brevo outages fail closed for new sign-ins; existing valid, unexpired sessions follow the configured token policy.

### Test execution approach
- Use Cloudflare Workers Vitest integration for Worker middleware and D1/R2 binding behavior, with isolated local test bindings.
- Use deterministic, locally generated test signing keys and a mocked JWKS endpoint for positive/negative JWT cases; never use production user tokens in CI.
- Add provider sandbox/manual smoke tests for real Google redirect and Brevo OTP delivery only after credentials are configured in staging.
- CI must not require Supabase/Brevo secrets and must not make external email sends.
- Android acceptance remains a manual device test: Google login, email OTP, upload a small private PDF over mobile data, verify candidate state, approve one claim, dispute/withdraw, and verify retrieval/source citation.

## Risks and limitations

- Supabase Free may pause after a week of low activity; not appropriate as a guaranteed always-on public identity service.
- Brevo's 300/day limit is ample for one-contributor MVP but not a promise of inbox placement or delivery.
- A verified sender domain is required. If the user does not control a domain, email OTP delivery setup may be blocked or constrained; do not assume a generic Gmail sender will work.
- The current repository Worker has no P4 auth middleware or P4 routes. Existing CORS and AI rate limiting do not protect future community writes.
- The repository currently has no root package.json or established Worker Vitest configuration on this P4 branch. Do not add a new runtime test stack blindly; inspect the repository's existing CI/test conventions and introduce the smallest compatible test harness in a separate change.
- No staging resources, provider projects, OAuth credentials, SMTP credentials, secrets, database bindings, or deployments were created by this review.

## Recommendation

Proceed with Supabase Auth + Brevo SMTP for a one-contributor, short-lived staging MVP only if a verified sender domain is available. Keep Cloudflare Worker + D1 + private R2 as the data plane. If a sender domain is not available, pause the email OTP portion rather than silently substituting an unverified mail flow. Before provisioning resources, implement and locally test the Worker authentication/authorization boundary and verify it with mocked JWKS and D1/R2 test bindings.
