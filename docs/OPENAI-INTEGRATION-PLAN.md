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
- [ ] Run the new unit tests and the existing Worker contract/quality tests in CI.
- [ ] Integrate explicit provider selection into the Worker, retaining Gemini fallback only when configured and explicitly allowed.
- [ ] Verify that the Cloudflare secret binding `OPENAI_API_KEY` exists without reading its value.
- [ ] Run the live health, CORS, input-validation, deterministic safety-gate, and generic diagnosis smoke checks.
- [ ] Review costs, rate limiting, data handling, and output validity before any release decision.

## Current status

The adapter and tests are committed to the isolated feature branch, but are not yet integrated into `worker.js`, deployed, or proven against a live OpenAI API request.
