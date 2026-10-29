# OpenAI provider integration — staged plan

## Current verified baseline

- The Worker `/health` endpoint responds successfully according to the operator's live check on 2026-10-29.
- This is not proof that `POST /api/chat` successfully reaches a model.
- The OpenAI provider adapter and explicit provider routing were merged into `main` and deployed to the Cloudflare Worker on 2026-10-29.
- Production currently has `AI_PROVIDER=gemini`; `OPENAI_API_KEY` remains configured as a Worker secret but is not read by this task.
- Cloudflare settings include `OPENAI_API_KEY` and `AI_API_KEY` secret bindings, `AI_RATE_LIMITER`, and `AI_PROVIDER=gemini`. Secret values were not read.
- A real OpenAI `POST /api/chat` attempt returned HTTP 502 with upstream status 429. The exact cause (quota, billing, or rate limit) is not confirmed.
- A subsequent real model request with Gemini configured failed before an upstream HTTP response was received. Model-generated diagnosis is therefore not verified in production yet.

## Implementation guardrails

1. Keep all provider secrets in Cloudflare Worker secrets; never expose them to the browser, repository, logs, or responses.
2. Preserve deterministic safety gates, retrieval, evidence traceability, and the existing diagnosis validation contract.
3. Keep Gemini configured as the production provider until the live provider path passes; never silently switch providers.
4. Use the OpenAI Responses API with Structured Outputs and `store: false`.
5. Normalize provider errors into bounded safe codes; never return raw provider response bodies.
6. A provider-generated answer must still pass the Worker’s existing diagnosis validator and evidence attribution.
7. Do not merge or deploy from this branch automatically.

## Stages

- [x] Add an isolated OpenAI Responses API adapter.
- [x] Add unit tests for request format, strict schema normalization, output extraction, malformed output, missing secret, network failure, and safe error handling.
- [x] Adapter unit tests passed in [GitHub Actions](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/runs/40929342318).
- [x] Worker contract tests and diagnostic engine regression tests passed on the integrated branch: [Worker tests](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/runs/40929848157), [diagnostic tests](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/runs/40929668103).
- [x] Static quality, UI smoke, and published Worker API smoke checks passed: [quality workflow](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/runs/40929848191).
- [x] Integrate explicit provider selection into the Worker. Gemini remains the default; OpenAI requires `AI_PROVIDER=openai` and `OPENAI_API_KEY`. Provider failures do not silently switch providers.
- [x] Verify that the Cloudflare secret binding `OPENAI_API_KEY` exists without reading its value.
- [x] Existing live smoke workflow passed health, CORS, input-validation, and deterministic safety-gate checks on the published Worker. It did not exercise a real model-generated diagnosis.
- [x] Merge and deploy the OpenAI adapter while keeping the production provider configuration explicit.
- [x] Attempt one live generic OpenAI diagnosis; it returned upstream HTTP 429 and did not pass the end-to-end test.
- [x] Restore `AI_PROVIDER=gemini` to avoid leaving production on a provider that rejected the request.
- [x] Add a manual live-model smoke workflow that checks provider/model metadata and the diagnosis safety contract.
- [ ] Resolve the OpenAI 429 by checking account quota, billing, and rate limits; do not infer the exact cause from status alone.
- [ ] Diagnose the Gemini upstream network failure, then rerun the manual live-model smoke workflow and require a successful validated diagnosis.
- [ ] Review costs, rate limiting, data handling, and output validity before enabling OpenAI for normal traffic.

## Current status

The adapter is merged to `main` and deployed to the Worker. Adapter tests, Worker contract tests, diagnostic engine tests, static safety checks, UI checks, Pages deployments, and Worker health/CORS/input-validation/deterministic-safety smoke checks passed. The real OpenAI request failed with upstream HTTP 429; a follow-up Gemini model request failed before receiving an upstream HTTP response. Production was left configured to Gemini to avoid keeping the app on the failing OpenAI path. The integration code is deployed, but the end-to-end model service is not yet verified. Do not enable OpenAI for normal use until a live request succeeds and the returned diagnosis passes the Worker validator.
