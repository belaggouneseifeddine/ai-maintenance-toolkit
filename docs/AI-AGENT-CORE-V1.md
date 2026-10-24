# AI Agent Core v1 — implementation contract

## Purpose

Introduce a small, testable orchestration layer for the existing Maintenance AI Toolkit. This is not a new model and does not claim autonomous control of equipment. The core coordinates deterministic routing and optional, explicitly injected tools while preserving local diagnosis and safety-first behavior.

## Current implementation in this branch

- `engineering-core.js`: existing request normalization, conservative intent routing, hazard detection, and local diagnostic adapter.
- `agent-core.js`: new orchestration contract that calls only allowlisted injected adapters.
- `tests/agent-core.test.cjs`: behavior tests for safety precedence, consent, local fallback, tool errors, report provenance, and bounded outputs.
- The current `index.html` loads `agent-core.js` and `agent-ui.js`; the UI wiring is present in repository source. This is not proof that the deployed site has the same revision, that the browser flow works end-to-end, or that a live AI provider is configured. Worker behavior remains a separate API path and requires live verification.

## Agent contract

The core accepts a bounded request through `engineering-core.js` and returns a structured result with a status, route, decision, and data.

Supported orchestration behavior:

1. Validate and normalize the request before running any tool.
2. Give deterministic safety routing absolute precedence. Safety-gated requests invoke no AI or other adapters.
3. Run the existing local diagnostic engine first for diagnosis requests.
4. Only ask an injected AI adapter to explain local findings when the request explicitly includes `consent.sendToAI === true`. If AI fails, retain the local preliminary assessment.
5. Require an injected, source-aware adapter for knowledge lookup; do not fabricate sources when no matches are found.
6. Send calculation requests to an injected calculation adapter with explicit unit and missing-input constraints; the core itself does not invent a result.
7. Treat attachment metadata as metadata only. Document analysis remains pending until a real, bounded file-content adapter is implemented.
8. Generate draft reports only from supplied data. Leave confirmed cause blank and source references empty unless later validated evidence is provided.
9. Bound adapter output size and avoid returning raw provider/network exception messages.

## Tool adapter interface

Adapters are injected at core creation time:

- `aiAssist({ task, request, localDiagnosis?, policy? })`
- `searchKnowledge({ request, requireProvenance: true })`
- `calculate({ request, requireUnits: true, doNotInventInputs: true })`

All adapter outputs are untrusted data and must be validated before being rendered. This core does not discover tools dynamically, access the network, read secrets, or upload attachments.

## Remaining verification and next integration work

| File | Planned change |
|---|---|
| `index.html` and `agent-ui.js` | Verify the existing user-facing assistant flow on desktop and Android, including explicit consent and accessible error/fallback states; only change the wiring if tests identify a defect. |
| `engineering-core.js` | Extend the route contract only where tests demonstrate a missing intent or field; keep safety routing deterministic. |
| `agent-core.js` | Review cancellation behavior of real provider adapters; preserve stable error codes and avoid hidden retries. |
| `worker.js` | Adapt the current Gemini and knowledge-retrieval functions behind allowlisted server-side adapters; preserve source traceability, response schema validation, CORS/input checks, and safety gates. |
| `sw.js` | Cache new browser-loaded modules only when they are actually referenced by the UI; bump cache version for the UI integration. |
| `tests/agent-core.test.cjs` | Add timeouts, contradictory evidence, no-match retrieval, and consent-regression cases. |
| `tests/worker-contract.test.cjs` | Add adapter contract tests, prompt-injection cases in retrieved content, malformed output, timeout, 429/503, and no-source claims. |
| `scripts/ui-smoke-test.mjs` and quality workflow | Verify mobile layout, consent, language switching, offline fallback, and new script syntax. |
| `docs/AI-SETUP.md` and `README.md` | Document setup, data boundaries, limitations, and what has or has not been verified. |

The integration list is a plan, not a claim that those files have already changed.

## Acceptance gates before merge

- [ ] The new unit tests pass in CI together with all existing tests and quality checks.
- [ ] Hazardous cases call zero AI, retrieval, or calculation adapters.
- [ ] Local diagnosis still works with no provider secret, no network, and AI consent disabled.
- [ ] AI is called only after explicit consent and cannot change a safety-gated route.
- [ ] AI failure, timeout, oversized output, and malformed output produce bounded errors and preserve the local result where available.
- [ ] Every source citation maps to a retrieved source record; absent sources remain absent.
- [ ] Reports distinguish user-provided facts, suggestions, and confirmed causes.
- [ ] No API key is introduced into browser code, local storage, logs, or repository files.
- [ ] Automated UI and worker contract tests pass.
- [ ] A controlled real provider request is tested only after confirming acceptable quota/cost; no paid call is assumed.
- [ ] No merge or production deployment occurs automatically as part of this branch.

## Explicit non-goals for v1

- No model training or fine-tuning.
- No autonomous equipment control or work-order execution.
- No cloud-sync or user-account system.
- No vector database before lexical retrieval quality is measured.
- No claim of predictive maintenance until timestamped operational data and held-out evaluation exist.
- No replacement of the current diagnostic engine.
