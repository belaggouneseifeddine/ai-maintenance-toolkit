# Full-Stack Modernization Plan — 2026-11-18

## Objective

Move Maintenance AI Toolkit from layered prototype code toward a maintainable, local-first industrial maintenance product. This work is staged: a refactor is not treated as complete until the same behavior is covered by tests and verified in the installed PWA.

## Current integration branch

- Working branch: `work/full-stack-modernization-2026-11-18`
- Draft integration PR: https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/pull/142
- Production branch: `main`
- No merge, Cloudflare Pages deployment, Worker deployment, or live AI request is performed by this work.

## Work completed in this first slice

### Frontend shell

- Extracted the inline application stylesheet into `app-shell.css`.
- Extracted the inline legacy bootstrap into `app-legacy.js` at the same script position, preserving synchronous execution order.
- Extracted maintenance-record persistence, rendering, and import/export into `maintenance-records.js`; the module exposes a small compatibility API for the remaining legacy UI.
- Added `design-system.css` as the final stylesheet layer with the established Industrial Premium palette: navy structure, cyan interaction accents, amber safety/warning accents, and coordinated light/dark tokens.
- Added the missing home dashboard inside the Diagnosis workspace and consolidated the primary navigation to five destinations: Diagnosis, Knowledge, Safety, History, and More. The optional AI panel is embedded inside Diagnosis rather than occupying a separate navigation slot.
- Removed conflicting navigation mutations from `p1-app-shell.js`; it now owns theme switching only, while `navigation-redesign.js` is the single navigation controller.
- Corrected the bottom navigation to allocate five columns for the five navigation destinations.
- Added all new assets to the service-worker shell and both static-site artifact workflows.
- Added the two previously omitted learning modules (`learning-feedback-ui.js` and `learning-memory.js`) to both static-site artifact copy lists.
- Updated runtime and quality contracts to validate the extracted assets and design tokens.

### Backend provider boundary

- Extracted Gemini Interactions API HTTP behavior into `providers/gemini-provider.mjs`.
- The Worker route now delegates Gemini requests to that adapter, as it already delegates Cloudflare Workers AI to its own adapter.
- The adapter owns request serialization, bounded transient retries, Retry-After handling, timeout signaling, response extraction, and JSON-shape checks.
- Provider credentials remain in Worker request headers and are not returned to the browser. Raw provider response bodies are not exposed.
- Added focused provider tests for missing credentials, request contract, retryable and non-retryable responses, transient network failures, and malformed/empty output.
- CI now runs all `tests/*.test.mjs` files as well as the CommonJS suite.

## Audit findings that remain open

1. `app-legacy.js` is still a large legacy bootstrap. Record storage and import/export are separated, but diagnosis form state, guided session UI, rendering, and report orchestration still need independent modules.
2. Several visual layers still overlap (`app-shell.css`, `ux-redesign.css`, `p1-app-shell.css`, and `design-system.css`). The new token layer provides a consistent final system; later work should consolidate obsolete rules only after screenshot and interaction regression checks.
3. `worker.js` remains a large route/orchestration module. Gemini provider behavior is now separated, but route handling, request validation, retrieval, safety routing, prompt construction, and diagnosis validation still need bounded modules and tests.
4. CORS origin allowlisting is not authentication. Public Worker abuse controls, privacy boundaries, rate-limit behavior, and deployment secrets need a separate security review. Do not claim the API is authenticated.
5. Automated image defect recognition, cross-user learning, model-weight training, and a privately owned language model are not implemented by these changes.

## Next implementation phases

### Phase A — verify integration

- Run the full Node test suite and application quality checks in GitHub Actions.
- Resolve any test failures rather than weakening or deleting assertions.
- Confirm every HTML script and stylesheet is included in both deployment artifacts and the service-worker cache.
- Confirm worker module bundling with the configured Wrangler workflow without deploying production.

### Phase B — frontend architecture and UX

- Define one navigation and page hierarchy for Home, Diagnosis, Knowledge, Safety, Maintenance Log, and More.
- Separate the diagnostic workspace from cloud AI consent and response presentation. The local engine remains the default and works without network access.
- Extract records/storage, diagnosis form state, rendering, reports/export, and navigation into independent modules with explicit public APIs.
- Consolidate duplicate CSS rules into tokens and components after the new visual layer is validated.
- Keep Arabic, French, and English behavior aligned; do not expose untranslated technical content as reviewed translation.
- Verify keyboard focus, contrast, text scaling, reduced motion, RTL/LTR, small Android screens, and safe-area navigation.

### Phase C — backend architecture and security

- Split the Worker into route, request-validation, safety-gate, retrieval, diagnosis-contract, and provider-adapter modules.
- Keep Gemini and Cloudflare Workers AI as explicit provider adapters; do not silently switch providers on failure.
- Keep local diagnosis independent of the Worker and make provider failures fail closed.
- Add schema boundary tests, prompt-injection fixtures, oversized/invalid payload tests, CORS tests, and provider timeout/rate-limit tests.
- Review IP-based rate limiting, public endpoint abuse controls, request logging, retention, and privacy. Do not introduce user-upload storage or cross-user data sharing without explicit consent and an approved design.
- Keep API keys and provider secrets exclusively in Worker secrets.

### Phase D — diagnostic knowledge integration

- Complete the centrifugal-pump pilot with traceable sources and measurements.
- Keep hypotheses, confirmed findings, and technician reports distinct.
- Use PDF/image extraction as candidate knowledge only until source and technical review pass.
- Compare predicted hypotheses with repair-confirmed outcomes using versioned evaluation cases; do not auto-promote records into live diagnosis.

### Phase E — release verification

- Execute all CI tests.
- Verify PWA install/update/offline behavior on Android.
- Test PDF and image import, OCR, original-source opening, semantic retrieval, page citations, deletion, and storage limits.
- Test local diagnosis and Worker failure modes separately.
- Review screenshots and actual interactions before promoting the branch.
- GitHub Pages has an automatic deployment workflow on pushes to `main`; merging can therefore publish the fallback site. Cloudflare Pages and Worker production workflows are manual-only and require separate approval.

## Acceptance criteria

A phase is complete only when:
- source code, tests, and deployment packaging agree;
- no runtime dependency is silently omitted from the PWA;
- local diagnosis works without a cloud provider;
- safety controls remain independent of generative model output;
- sources and page references remain traceable;
- offline and Android behavior is verified on a real device;
- no production deployment or external data sharing occurs without explicit approval.
