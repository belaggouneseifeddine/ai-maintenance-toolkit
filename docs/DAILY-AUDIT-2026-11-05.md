# Daily audit — Maintenance AI Toolkit — 2026-11-05

## Baseline and scope

- Repository: `belaggouneseifeddine/ai-maintenance-toolkit`
- Current production branch: `main` at `63d219c4667f858515354f76d68b2ec46cb43c0a`
- Scope: release state, diagnostic reasoning, knowledge provenance, P4 community upload security, offline/UX, and a rotating competitor scan focused on mobile offline workflows and AI-assisted troubleshooting.
- No production deployment, remote D1 migration, R2 enablement, paid provider request, merge, or Vercel deployment was performed by this audit.

## 1. Current status and changes since the previous audit

### Main changes

| PR | Current state | Verified result |
|---|---|---|
| #122 | Merged | Added compressor low-pressure adaptive flow and moved the deterministic safety gate ahead of AI rate limiting. |
| #123 | Merged | Added deployment governance and manual controls. |
| #124 | Merged | Kept low-flow and low-pressure normalization separate. |
| #128 | Merged | Restored automatic GitHub Pages deployment on pushes to `main`. |
| #129 | Merged | Updated governance tests: Pages auto-deploy is allowed; Cloudflare Pages and Worker remain manual-only. |
| #117 | Draft/open | P4 community knowledge remains unmerged and has deployment-workflow conflicts. |

### CI and deployment evidence

- Main commit `63d219c`: GitHub Pages deployment run #42072822648 succeeded. Both the build and deploy jobs passed; the live published-app/Worker smoke-test step passed.
- Main commit `63d219c`: diagnostic engine tests #42072823096 and quality checks #42072823145 succeeded.
- Knowledge assets were refreshed in commit `e7934bc` on 2026-11-05; the knowledge validation run #42071594297 succeeded on that commit.
- Cloudflare Pages and Worker remain manual-only. Their last confirmed successful deployment is commit `ec06e75` on 2026-11-04 (runs #41932837260 and #41932837194). This audit did not redeploy them.
- A live generative-model request was not made. A successful health or smoke endpoint does not prove a paid/provider inference path.
- GitHub rulesets query returned an empty list; the direct branch-protection read was denied to the integration. Do not treat branch protection as verified.
- Vercel bot comments and Preview deployments appeared automatically on PRs #128 and #129. Vercel remains connected to the repository despite the project's no-Vercel preference. This audit did not use Vercel.

## 2. Diagnostic engine and Bayesian reasoning

### Confirmed implementation

- `diagnostic-flows.js` contains 11 curated equipment/symptom flows.
- `diagnostic-session.js` implements three multi-step flows: pump low-flow, motor no-start, and compressor low-pressure.
- The remaining eight registry entries use `registry_single_step`: one curated question/check, no ranked hypothesis set, and no adaptive sequence.
- The three multi-step flows rank hypotheses from grouped evidence. The ranking explicitly states that its scores are not calibrated probabilities.
- The next-question selector uses pairwise hypothesis separation with equal outcome weighting. This is a heuristic, not entropy-based expected information gain.
- `bayesian-engine.js` uses default prior 0.2 and fixed likelihood ratios 1.5 / 1÷1.5. It reports `calibrated: false`. There are no field-failure datasets or learned conditional probability tables in this implementation.
- `evidence-reasoning.js` requires explicit verified claims and exact manufacturer/model scope before treating a source as applicable. A source URL by itself is insufficient.

### Critical critique

The name “Bayesian network” is stronger than the implementation. The current code is a small qualitative cause/evidence scoring model with fixed likelihood assumptions and limited grouping to reduce double-counting. It is not a field-calibrated Bayesian network. Do not display the resulting score as a real-world probability.

The larger product gap is coverage: eight of eleven curated flows stop after one check. The next engineering milestone should be a reviewed multi-step workflow for each supported equipment family, with a test-selection method that accounts for outcome likelihood, diagnostic value, test risk, time, and whether the technician can safely obtain the measurement.

## 3. Knowledge base and source quality

The committed `knowledge/KNOWLEDGE-AUDIT-REPORT.md` was regenerated in commit `e7934bc` on 2026-11-05. It reports:

- 10 Worker-referenced Markdown documents; 3,862 lines, 55,772 whitespace-separated words, and 282 headings.
- 284 structured fault records; 36 equipment labels; 767 cause entries; 31 records with alarm/error-code arrays.
- 60 model/manual-scoped fault records marked manual-reviewed, not field-verified.
- 63 manufacturer/support discovery records; 29 OEM platform-index entries; 0 model-verified platform entries.
- 99 structured OEM diagnostic records marked claim-reviewed with exact source scope and page references. This is a review of manual claims, not field-performance validation.
- A separate licence-tracked source registry has 2 candidate entries and 0 approved entries. Five reference-only portals are not allowlisted for automated fetching.

The 2026-11-05 digital-electronics reference index is a locator/index only; it does not reproduce copyrighted chapter content.

**Interpretation:** the repository has useful breadth and unusually explicit scope metadata, but source discovery, claim review, model verification, and field validation must remain separate states. Do not collapse these into one “verified” badge.

## 4. P4 community upload security audit

### PR #117 blockers

- PR #117 remains Draft/open. Compared with current `main`, its branch is 10 commits behind and 74 commits ahead.
- The PR branch changes `deploy-cloudflare-pages.yml` and `deploy-worker.yml` to add push-to-main triggers. Merging it unchanged would restore automatic Cloudflare Pages and Worker production deployment, contrary to current manual-only policy.
- The current P4 API exposes document upload, profile read/update, and session revocation. It does not expose document listing or deletion; the UI cannot manage uploaded documents after upload.
- `p4-profile.js` stores the bearer session token in `localStorage`. This is a credible XSS exposure path, not evidence that a token has been stolen.
- The staging documentation and PR description are inconsistent about whether the D1 staging database and migration 0003 have already been provisioned. Verify the actual D1 migration ledger before any enablement.
- R2 is not enabled for end-to-end upload testing. No Android upload test or cross-contributor storage test was demonstrated.

### Safe implementation on an isolated child branch

Branch: `fix/p4-atomic-storage-quotas-2026-11-05`

- Replaced the read-then-upload quota check with a D1 reservation inserted before R2.
- Added `migrations/0004_p4_storage_quota_reservations.sql`: a trigger enforces the 1 GiB global and 100 MiB per-contributor caps using current R2 documents plus unexpired reservations.
- GitHub-backed documents do not consume the private R2 staging quota. Expired reservations are ignored; the Worker uses a 30-minute lease and cleans expired rows opportunistically.
- Successful document metadata, audit event, and reservation release are committed in one D1 batch. R2/D1 failures attempt object deletion and reservation release.
- If migration 0004 is absent, upload fails closed with HTTP 503 rather than reverting to the non-atomic quota check.
- Updated schema and API tests, added the branch to the P4 test workflow, documented the migration boundary, and pinned the Playwright test dependency to a published stable version.

Commits on the isolated branch:
- `33d04e4` — atomic reservation before R2 upload
- `247fb90` — migration 0004
- `9b53e46` — SQLite quota regression tests
- `1c902e6` — API reservation/rollback tests
- `26729bf` — run P4 tests on the child branch
- `e86defe` — document the migration and residual failure window
- `0e0663c` — pin Playwright to 1.64.1

P4 workflow run #42090170398 passed:
- 13 SQLite schema tests
- 5 anonymous-profile/session tests
- 14 API upload tests
- 3 PDF extraction tests
- `node --check p4-profile.js`

Total: 35 tests passed. The main app test run #42090201413 also passed on the docs commit. The quality-check workflow initially failed before browser tests because npm could not resolve `playwright-core@1.65.0`; the branch now pins `playwright@1.64.1`. The rerun #42090420875 was still in progress at the time of this report.

The child branch is still 10 commits behind and 81 commits ahead of `main`, because it inherits PR #117's old history. It is not merge-ready. No PR was opened, partly to avoid triggering the repository's automatic Vercel Preview integration. Migration 0004 has not been applied remotely, and R2 has not been enabled.

**Residual risk:** a Worker crash after R2.put but before the D1 metadata batch can leave an orphan R2 object. The reservation expires after 30 minutes, so quota accounting recovers, but object reconciliation remains a separate task.

## 5. Offline, UX, architecture, and performance

- The app is a static, mobile-first PWA with a local deterministic engine, local maintenance records, CSV/report export, multilingual UI, and app-shell caching.
- The service worker does not provide a full offline work-order sync system. Maintenance records remain browser-local; no cross-device synchronization or conflict resolution is present.
- Guided diagnostic-session state is held in the UI session object and is not persisted as a resumable offline session.
- There is no demonstrated local upload queue for community documents.
- The UI has Arabic RTL, English/French support, keyboard focus and reduced-motion checks, and a six-tab mobile navigation. CI passed the automated viewport/language/theme browser checks on main commit `63d219c`; physical Android acceptance remains unverified.
- The static multi-script architecture is low-cost and avoids bundler/runtime overhead, but large knowledge assets are loaded as part of the app shell. Measure actual mobile transfer and memory before optimizing by guesswork.
- The application is a diagnostic toolkit, not a CMMS: no complete asset hierarchy, work-order lifecycle, PM scheduler, inventory/parts management, labor/cost tracking, or multi-user work assignment is implemented.

## 6. Competitor scan — official documentation and product pages

This was a documentation/product-page review, not a hands-on trial or independent accuracy benchmark.

| Product | Publicly documented capability | Comparison with this Toolkit |
|---|---|---|
| MaintainX | Mobile offline mode caches work orders, updates local copies, and syncs automatically or manually after reconnection. The help page lists platform/plan availability. | Stronger work-order offline workflow; this app caches its shell and local records but has no work-order sync/conflict engine. [Official offline guide](https://help.getmaintainx.com/offline-mode) |
| Limble | Offline work is limited to open/in-progress tasks; the guide documents supported and unsupported task actions and sync on reconnection. | Stronger CMMS task execution; this app needs a durable offline session/report workflow before claiming equivalent field operations. [Official offline guide](https://help.limblecmms.com/en/articles/8857152-offline-mode) |
| Fiix | A vendor feature PDF (last updated 2020) lists work orders, PM triggers, condition-based maintenance, asset/parts management, QR tagging, and mobile capabilities. Treat the document as historical until current plan details are checked. | Much broader CMMS scope; not a like-for-like diagnostic-engine comparison. [Feature PDF](https://www.fiixsoftware.com/wp-content/uploads/2020/05/FiixCMMSFeatureList_Final_May14.pdf) |
| YAFEX | Product page claims manual/work-order ingestion, ranked causes, source-backed steps, automatic work-order creation, and learning from closed work orders. | Similar evidence/manual-first direction, but the Toolkit currently has no work-order feedback loop. Performance metrics on the page are vendor claims, not independently verified. [Product page](https://yafex.io/) |
| InduQT | Product page describes guided troubleshooting sessions, ranking likely causes, selecting the next check, recording confirmed fixes, and optional OPC UA/MQTT/CSV data. | Closest public workflow analogue to adaptive evidence gathering; the Toolkit needs stronger next-test selection and case-history learning. Claims/demo were not independently validated. [Product page](https://induqt.ai/) |
| Diagster | Product page claims read-only OPC access, PLC program analysis, local deployment, and vendor-independent support; video analysis is marked as coming soon. | A specialized automation/PLC diagnostic niche absent from this app. A read-only, opt-in PLC/OPC integration could be a later extension, not an immediate dependency. [Product page](https://diagster.com/en/) |

### Competitive product opportunities

1. Build a robust offline diagnostic session with cached selected manuals, resumable state, and a clear sync/export queue.
2. Add QR/asset passport lookup and structured work-order export before building a full CMMS.
3. Capture technician-confirmed cause, test results, repair, and recurrence so future ranking can be calibrated from reviewed cases.
4. Add read-only data ingestion (CSV first; OPC only after security, units, calibration, and network isolation design).
5. Preserve a differentiator competitors also claim but the Toolkit can enforce more transparently: exact model scope, evidence citations, uncertainty, and a safety gate that AI cannot override.

## 7. Ranked roadmap

| Rank | Problem / opportunity | Impact | Effort | Next acceptance gate |
|---|---|---:|---:|---|
| P0 | Deployment policy and Vercel integration drift | Critical | Low–medium | Verify branch protection; keep Cloudflare/Worker manual-only; explicitly approve Pages auto-deploy; remove/disable Vercel GitHub integration if still unwanted |
| P1 | Eight single-step flows lack adaptive hypothesis tracking | High | High | Add multi-step evidence trees with missing/contradictory-data regression tests |
| P1 | Bayesian-style scores and question selector are not calibrated/true information gain | High | High | Use reviewed case frequencies and test-risk/time costs; validate calibration before exposing probabilities |
| P1 | P4 upload lifecycle incomplete | High | High | Review quota branch against current main; add document list/delete, token hardening, cross-user tests, then migrate staging D1 and enable private R2 only after approval |
| P1 | Knowledge approval and model applicability | High | Medium–high | Approve source/licence records; preserve exact model, firmware, manual revision, page and claim scope; keep field validation distinct |
| P2 | Offline session persistence and sync | Medium–high | Medium | Resume an interrupted diagnostic offline; prove no data loss; define conflict semantics |
| P2 | Asset/work-order/PM/parts integration | Medium–high | High | Local asset passport and QR lookup; exportable work-order payload; integrate with an existing CMMS rather than clone it |
| P2 | Mobile performance and accessibility | Medium | Medium | Measure low-end Android load, cache completeness, memory and keyboard/screen-reader flows |
| P3 | Sensor/OPC predictive monitoring | Conditional | High | Read-only prototype with timestamped, unit-normalized, calibrated data and a validated baseline |

## 8. Explicitly not done

- No merge or PR creation.
- No production deployment by this audit.
- No remote D1 migration or R2 binding.
- No paid AI/provider request.
- No Vercel action.
- No physical Android test.
- No claim that vendor performance metrics or diagnostic accuracy have been independently verified.
