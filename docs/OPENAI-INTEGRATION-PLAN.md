# OpenAI provider integration — staged plan

## Current verified baseline

- The Worker `/health` endpoint responds successfully according to the operator's live check on 2026-10-29.
- This is not proof that `POST /api/chat` successfully reaches a model.
- The current Worker implementation calls Gemini Interactions API using `GEMINI_API_KEY || AI_API_KEY`.
- Cloudflare Worker settings inspected during this task showed a secret binding named `AI_API_KEY` and a rate-limit binding. No `OPENAI_API_KEY` binding was present in that inspection. Secret values were not read.
- No live diagnosis request has been executed or verified by this change.

## Implementation guardrails

1. Keep all provider secrets in Cloudflare Worker secrets; never expose them to the browser, repository, logs, or responses.
2. Preserve deterministic safety gates, retrieval, evidence traceability, and the existing diagnosis validation contract.
3. Keep Gemini behavior intact while the OpenAI adapter is tested; do not silently switch production traffic.
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
- [ ] Verify that the Cloudflare secret binding `OPENAI_API_KEY` exists without reading its value.
- [x] Existing live smoke workflow passed health, CORS, input-validation, and deterministic safety-gate checks on the published Worker. It did not exercise a real model-generated diagnosis.
- [ ] Run a live generic model-generated diagnosis test after the OpenAI secret is configured and deployment is explicitly approved.
- [ ] Review costs, rate limiting, data handling, and output validity before any release decision.

## Current status

The adapter is integrated into `worker.js` behind explicit provider selection on the isolated feature branch. Adapter tests, Worker contract tests, diagnostic engine tests, static checks, UI checks, and the live Worker health/CORS/validation/safety smoke tests passed in GitHub Actions. The live smoke test does not invoke a model-generated diagnosis. No Worker deployment was performed. The inspected Cloudflare bindings did not include `OPENAI_API_KEY`, so a real OpenAI API request remains untested.
