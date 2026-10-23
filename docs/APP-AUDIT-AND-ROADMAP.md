# Application Audit and Improvement Roadmap

**Status:** Workbench only. Do not merge to `main`, deploy GitHub Pages, or deploy the Cloudflare Worker without explicit approval.

**Date:** 2026-10-23

## Verified baseline

- Frontend: GitHub Pages, mobile-first web app with Arabic, French, and English.
- Backend: Cloudflare Worker; `GET /health` was verified from the user's phone and returned `{"ok":true,"service":"maintenance-ai-toolkit-api"}`.
- The frontend's configured AI endpoint is the Worker `/api/chat` route.
- The Worker explicitly permits the exact frontend origin `https://belaggouneseifeddine.github.io`.
- Opening `/api/chat` directly in a browser is not a valid integration test: the route expects a JSON POST request with an allowed Origin. A direct navigation can correctly return `Origin not allowed.`.
- Worker code calls Gemini only after origin, method, payload, evidence, and rate-limit checks. A healthy `/health` response does not prove Gemini requests work.
- Existing maintenance records are local to the browser/device; there is no automatic account sync/backup.
- The current knowledge retrieval uses repository-hosted Markdown documents; those documents should not be represented as OEM manuals unless they actually are.

## Priority 0 — Validate before changing behavior

1. Run the existing repository quality checks and inspect recent GitHub Actions results.
2. Exercise the frontend's real POST request path, not a direct browser GET to `/api/chat`.
3. Record the actual HTTP status and sanitized error for a generic test request.
4. Confirm the configured Worker secret exists without printing or exposing its value.
5. Confirm the configured Gemini model is supported by the account/API and verify quota/permissions only from the actual provider response.
6. Re-test the three language flows and the local-only diagnosis fallback.

## Priority 1 — Reliability and UX fixes

- Make connection-test feedback distinguish: Worker unreachable, Origin/CORS rejected, backend secret missing, provider rejected the request, provider quota/rate limit, and invalid AI output.
- Keep the API endpoint in one canonical setting and explain clearly that saving the endpoint is not the same as testing it.
- Audit the diagnosis form for duplicate controls, stale values, required-field validation, mobile overflow, and double submission.
- Prevent repeated clicks while a diagnosis is in progress; show progress and a retry action only when appropriate.
- Ensure the local diagnostic mode remains usable when the AI service is offline.
- Add regression checks for API endpoint construction, payload validation, and localized error messages.

## Priority 2 — Diagnostic quality

- Keep evidence quality explicit: equipment make/model, exact symptom, alarm text, operating conditions, and existing measurements.
- Separate confirmed facts from hypotheses and do not label a cause confirmed without supporting evidence.
- Make each proposed check state its purpose, expected result, and next decision.
- Keep lockout/tagout, stop-work conditions, and restrictions on hazardous live measurements visible in all languages.
- Show source provenance and distinguish internal troubleshooting references from manufacturer/OEM documentation.
- Add reviewed, testable case studies for motors/VFDs, centrifugal pumps, compressors, sensors, PLCs, and hydraulics before expanding breadth.

## Priority 3 — Maintenance workflow features

- Searchable equipment register with asset ID, make/model, location, and criticality.
- Structured work orders with status, assigned technician, parts, downtime, and verification.
- Preventive-maintenance schedules and due/overdue reminders.
- Maintenance history by asset, with filters and export/print.
- Backup/export and import/restore for local records before considering synchronization.
- Optional AI-generated draft reports that require technician review before being marked verified or closed.

## Priority 4 — Security and operational readiness

- Keep all provider API keys in Cloudflare Worker secrets; never in frontend JavaScript, HTML, GitHub Pages, or public repository files.
- Keep CORS restricted to the intended frontend origin.
- Review rate limiting, abuse protection, payload size, timeout behavior, and provider error handling.
- Add safe, sanitized diagnostics that never log API keys or sensitive maintenance notes.
- Add automated tests for origin allow/deny behavior, OPTIONS preflight, request validation, rate limiting, and upstream failure cases.
- Keep deployment credentials in GitHub Actions secrets and use a narrowly scoped Cloudflare token.

## Acceptance criteria before any release

- Existing tests and quality checks pass.
- Frontend loads and language switching works in Arabic, French, and English.
- The frontend can submit a real JSON POST to `/api/chat` from the approved origin.
- A valid response is rendered, and failures show a specific safe explanation.
- Local diagnosis still works without Gemini.
- No secret is present in repository content or frontend assets.
- Mobile layout and the previously reported duplicated-field issue are rechecked.
- User explicitly approves the release before any deployment.

## Workbench rules

- Make changes only on `workbench/app-audit-2026-10-23`.
- Do not merge to `main`.
- Do not trigger or manually run a deployment.
- Review and test each change before requesting release approval.
