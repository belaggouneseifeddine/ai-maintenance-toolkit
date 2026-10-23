# Architecture and Runtime Audit — 2026-10-24

## Scope and baseline

- Repository: `belaggouneseifeddine/ai-maintenance-toolkit`
- Audited branch: `main`
- Baseline commit: `445726d827537f0742b0f1de5ed5123e901e6bc6` (2026-10-23)
- Product direction: evolve the existing maintenance PWA into a specialized engineering AI workspace without replacing working local diagnosis prematurely.
- This is a source/repository audit plus review of recorded CI results. It is not a new live browser session or a successful live Gemini generation test.

## Executive result

The repository already contains most of the primitives needed for an incremental transition: a deterministic diagnostic engine, structured follow-up flows, fault data, a public knowledge corpus, multilingual UI, a local maintenance log, safety gates, an optional Cloudflare Worker, source-grounded lexical retrieval, and CI checks.

The next step should not be a wholesale rewrite. It should be a thin, testable engineering-assistant core that orchestrates the existing capabilities behind explicit contracts, while keeping the local diagnostic path available when the network or model is unavailable.

## Confirmed repository facts

1. `main` currently points to `445726d827537f0742b0f1de5ed5123e901e6bc6`.
2. The app is a static, mobile-first PWA served through GitHub Pages; the README identifies Cloudflare Workers as the only supported backend target.
3. `diagnostic-engine.js` is an offline deterministic ranking engine. It labels results as advisory/preliminary and does not make network calls.
4. `diagnostic-flows.js`, `faults.json`, and `normalization.js` provide structured diagnostic content and shared normalization.
5. `worker.js` implements a bounded JSON diagnosis contract, validates provider output, enforces deterministic safety gates for at least some hazardous inputs, and exposes the optional AI request path.
6. The current retrieval design is lexical section ranking over selected Markdown knowledge files, not embedding/vector retrieval. A retrieved excerpt is evidence supplied to the model, not proof that every generated claim is grounded.
7. The frontend asks for explicit consent before sending diagnosis data to the configured Worker. The API key is intended to remain a Worker secret.
8. Maintenance records are browser-local; they are not automatically synchronized or backed up across devices.
9. Existing verification scripts include `scripts/quality-check.mjs`, `scripts/ui-smoke-test.mjs`, `scripts/smoke-test-live.mjs`, diagnostic engine tests, worker contract tests, knowledge validation, and GitHub Actions workflows.
10. The recorded GitHub Actions runs for the baseline commit passed the diagnostic tests, quality checks, and Pages deployment. These historical results do not prove a new live AI generation succeeded.
11. PR #44 is still open as a draft and proposes an opt-in model-comparison harness. Its live comparison has not been run; do not merge it as evidence that a candidate model is better.
12. The repository branch metadata reports `main` is not protected and has no required status checks configured. The team should enforce a PR/CI release gate before accepting functional changes.

## Verification boundary

- The recorded baseline CI run reported the published Pages page, Worker health, CORS preflight, invalid-payload rejection, and two deterministic safety gates as passing.
- Those checks did not demonstrate a successful provider-generated answer.
- An additional direct Worker request could not be completed from the current audit environment because outbound DNS/network access was unavailable. Therefore the current audit does not mark the Worker or Gemini generation as live-verified.
- Vercel status contexts are external failures caused by a Vercel build-rate limit. Vercel is not the target deployment path and must not be used to deploy this project.
- Browser tests and static checks are useful, but they do not replace manual technical review of generated engineering guidance or target-device testing.

## Architecture assessment

### Keep

- GitHub Pages for the public frontend.
- Cloudflare Worker for server-side AI requests.
- `diagnostic-engine.js` as a deterministic, offline-capable baseline.
- Structured diagnostic flows and existing fault/knowledge assets.
- Arabic, French, and English support.
- Explicit consent, server-side secrets, bounded response schema, safety gates, and current test workflows.

### Improve next

1. Establish a single typed contract for user intent, evidence, tool results, safety state, and final assistant output.
2. Introduce an orchestration layer that classifies requests into explain, diagnose, calculate, search-knowledge, analyze-document, and create-report intents. Keep routing conservative and testable.
3. Let deterministic safety and diagnostic results run before optional model synthesis where applicable.
4. Return provenance separately from prose: source ID, file, heading/line range, retrieval method, and confidence/limitations. Do not fabricate manufacturer page numbers.
5. Make model failure degrade gracefully to local diagnostic guidance and clearly state that AI was unavailable.
6. Add behavioral tests for rendered UI paths, source-supported claims, malformed model output, prompt-injection in retrieved documents, timeout, quota failure, and safety escalation.
7. Verify the configured Cloudflare platform rate limiter under controlled load and add usage/cost monitoring before public multi-user exposure.
8. Separate local session context from durable maintenance records; do not silently upload records.
9. Document which modules are implemented, tested, experimental, or planned.

### Do not do yet

- Do not replace the entire `index.html` application or the diagnostic engine in one change.
- Do not introduce a multi-agent runtime, vector database, user-account system, or cloud sync before a measured need exists.
- Do not change the production model based on a proposed benchmark without running and reviewing the benchmark and staging integration.
- Do not put API keys in frontend code, local storage, or public files.
- Do not claim the AI assistant is operational based on `/health` alone.

## Prioritized risk register

| ID | Priority | Finding | Evidence / status | Next action |
|---|---|---|---|---|
| AUD-01 | P0 | Actual provider generation is not verified in this audit | Historical CI covered health and deterministic gates, not a successful generation; direct request blocked in this environment | Run a controlled generic POST from a network-enabled environment using the existing Worker secret; record sanitized status/schema only |
| AUD-02 | P1 | Main branch lacks required-check protection | GitHub branch metadata says protection disabled | Configure required PR checks and prohibit unreviewed direct-to-main changes where feasible |
| AUD-03 | P1 | Rate-limit binding is configured, but runtime enforcement and broader abuse controls need verification | Read-only Cloudflare inspection on 2026-10-24 confirmed the deployed Worker has an `AI_RATE_LIMITER` binding set to 10 requests per 60 seconds; no limit-exhaustion test was run | Test enforcement safely and add usage/cost monitoring; CORS is not authentication |
| AUD-04 | P1 | Retrieval is lexical and coverage-limited | Current documented design fetches and ranks selected Markdown sections | Add deterministic retrieval tests and low-evidence behavior before considering semantic retrieval |
| AUD-05 | P1 | Browser app is large and tightly coupled | Core UI and some diagnosis logic remain in `index.html` | Extract one small capability behind tests at a time |
| AUD-06 | P2 | Maintenance records are device-local | README and setup docs | Add explicit export/backup UX before considering optional sync |
| AUD-07 | P2 | Existing checks include source assertions that can miss runtime defects | Static quality script uses numerous source-level assertions | Increase behavior-level coverage incrementally; keep source assertions for invariants only |
| AUD-08 | P2 | Model comparison PR is unvalidated live | PR #44 draft states live run pending | Keep separate; do not merge or select a model until benchmark and staging gates pass |

## Acceptance criteria for closing the audit

- [ ] A controlled, successful generic AI POST is verified and its schema validated without logging secrets or sensitive payloads.
- [ ] The deployed Worker revision/configuration is correlated with repository source.
- [ ] Branch/PR gate policy is established or the limitation is explicitly accepted.
- [ ] Each high-priority risk has an owner/status and an evidence-based remediation plan.
- [ ] The first engineering-core implementation has behavioral tests and preserves local diagnosis.


## Post-audit verification update — 2026-10-24

A read-only Cloudflare API inspection after this audit confirmed:

- Worker script `maintenance-ai-toolkit-api` exists in the connected account.
- Latest listed deployment at inspection time was created on 2026-10-23 at 04:15 UTC, with its active version receiving 100% of traffic.
- Secret binding metadata includes `AI_API_KEY`. The secret value was not read or exposed.
- Deployed settings include `AI_RATE_LIMITER` with a 10-request / 60-second configuration, matching `wrangler.toml`; the Worker source calls this binding.
- This verifies the existence of deployment and bindings, not successful Gemini generation or rate-limit enforcement. A direct request from the audit runtime was blocked by unavailable outbound DNS/network access; the recorded CI smoke test covers health, CORS, invalid payloads, and deterministic safety gates but not a successful model-generated answer.
- PR #47 merged the first isolated `engineering-core.js` module and tests in commit `2a29b31a16ae9406aa22a5a1a809d838f9fb8816`. It is not yet wired into the production UI, and therefore does not change the live app's behavior.
