# Phased engineering plan

Last reviewed: 2026-10-21

## Working rules

- Keep the GitHub Pages frontend and Cloudflare Worker architecture; do not introduce Vercel.
- Never place provider secrets in browser code, local storage, or the public repository.
- Do not describe untested behavior as verified.
- Do not invent technical limits, wiring details, alarm meanings or manufacturer specifications.
- Keep all diagnostic output advisory; defer to LOTO, site procedures, qualified personnel and exact manufacturer documentation.
- Make small changes with regression checks and a record of what was and was not verified.

## Phase 0 — Baseline and product scope

Status: initial static review completed; live runtime verification remains open.

- [x] Inspect the main interface, localization module, diagnostic engine, structured fault library, service worker and Cloudflare Worker source.
- [x] Identify product categories to compare: general AI workspaces (ChatGPT/Claude) and CMMS products (MaintainX/Fiix).
- [x] Add a documented comparison and product positioning.
- [ ] Verify the actual deployed site and worker from a live client.
- [ ] Record the current GitHub Actions state and a baseline manual test run.

## Phase 1 — Reliability foundation

- [x] Add automated regression tests for the deterministic diagnostic engine.
- [x] Add a GitHub Actions workflow to run those tests on relevant changes.
- [ ] Execute the tests in CI and record the run result.
- [ ] Add browser-level tests for language switching, header theme toggle, navigation and form validation.
- [x] Fix photo-to-record identity using stable record IDs and migration-safe handling (real-browser verification pending).
- [x] Validate monthly due dates and custom report date ranges; reject invalid preventive-maintenance dates.
- [x] Add JavaScript syntax regression tests for the maintenance utility and inline scripts in `index.html`.
- [x] Bump the service-worker cache to v27 after frontend changes.
- [ ] Test JSON backup/import round trips and malformed-file handling.

## Phase 2 — Localization and mobile UX

- [ ] Maintain a single translation catalog for Arabic, French and English.
- [ ] Translate static and dynamic text: tabs, buttons, placeholders, options, generated notices, errors, empty states, and accessibility labels.
- [ ] Ensure RTL/LTR direction changes with the selected language where appropriate.
- [ ] Verify theme toggle stays beside the language selector in narrow mobile widths and persists across reloads.
- [ ] Verify current cache version and PWA update behavior on an installed Android shortcut.

## Phase 3 — Diagnostic quality and safety

- [ ] Inventory every supported equipment type and symptom.
- [ ] Mark each equipment family as structured-rule supported, generic safe guidance only, or not supported.
- [ ] Expand the fault library only from reviewed technical references and exact model documentation where available.
- [ ] Build a reviewed test set including normal cases, ambiguous cases, contradictory evidence and insufficient evidence.
- [ ] Verify no unsupported setpoints, torque values, alarm interpretations or bypass instructions are produced.
- [ ] Keep checklist acknowledgement distinct from verified isolation; do not represent a checkbox as proof of safety.

## Phase 4 — AI backend and privacy

- [ ] Verify /health and one real generic POST to /api/chat.
- [ ] Test invalid input, wrong provider key, quota/rate error, timeout and malformed upstream response.
- [ ] Confirm frontend validates HTTPS and only sends data after explicit consent.
- [ ] Add operational abuse controls and usage monitoring before public release; CORS is not authentication.
- [ ] Confirm server-side secrets only and review provider data handling/terms before sending plant information.

## Phase 5 — Maintenance workflow

- [ ] Use stable asset and record identifiers.
- [ ] Make work-order fields explicit: reporter, priority, status, observations, measurements with units, actions, parts, downtime, evidence and sign-off where applicable.
- [ ] Link photos to stable record IDs and test behavior after record deletion/reordering.
- [ ] Add PM completion history rather than overwriting the previous execution date without an audit trail.
- [ ] Define backup, restore, retention and eventual optional sync behavior.

## Phase 6 — Release gate

- [ ] Automated tests pass.
- [ ] Static security review has no unresolved critical findings.
- [ ] Real API request succeeds in a controlled test.
- [ ] Android tests pass for navigation, translations, theme, records, backup, PWA install and offline mode.
- [ ] Known limitations and recovery steps are documented.
- [ ] No production-readiness claim until all release-gate evidence is recorded.
