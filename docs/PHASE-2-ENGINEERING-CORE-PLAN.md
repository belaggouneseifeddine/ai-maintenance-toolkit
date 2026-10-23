# Phase 2 — Engineering AI Core: Implementation Plan

## Goal

Create the first thin, testable engineering-assistant core that coordinates existing maintenance capabilities without replacing the current UI or deterministic diagnosis. The first increment must be safe to merge independently and must not change production behavior by default.

## Non-goals for the first increment

- No full UI rewrite.
- No new model provider or production-model change.
- No API-key handling in the browser.
- No automatic execution of industrial controls or work orders.
- No new vector database, account system, cloud synchronization, or autonomous multi-agent runtime.
- No merge to `main` until CI and independent diff/safety review pass.

## Proposed core contract

Keep the first contract provider-agnostic and deterministic. The orchestration layer should receive a normalized request and return an explicit route decision; it should not call the network itself.

Illustrative request:

```js
{
  intent: "diagnose" | "explain" | "calculate" | "search_knowledge" | "analyze_document" | "create_report" | "unknown",
  language: "ar" | "fr" | "en",
  equipment: { type: string, manufacturer?: string, model?: string },
  symptom?: string,
  observations?: string[],
  measurements?: Array<{ name: string, value: number, unit: string, timestamp?: string }>,
  attachments?: Array<{ id: string, mediaType: string, name?: string }>,
  consent: { sendToAI: boolean },
  context: { sessionId?: string, assetId?: string }
}
```

The initial implementation must validate and normalize inputs, preserve unknown values as unknown, reject unsupported language values safely, and avoid retaining attachments or sending data externally. It must not interpret the illustrative contract as permission to upload any file.

Illustrative route result:

```js
{
  intent: "diagnose",
  route: "local_diagnostic" | "knowledge_lookup" | "ai_assist" | "engineering_tool" | "report" | "clarify",
  requiresNetwork: false,
  requiresExplicitAIConsent: false,
  safetyReviewRequired: true,
  missingInformation: [],
  reasonCodes: []
}
```

## First implementation slices

### Slice A — Contract and request normalization

- Add a standalone module (proposed path: `engineering-core.js`) with no DOM, storage, fetch, or provider dependency.
- Normalize intent and language against allowlists.
- Bound string lengths and list sizes; reject malformed measurement values and unsupported units rather than guessing.
- Do not log user-provided content.
- Return machine-readable validation errors without echoing secrets or entire submitted payloads.
- Add unit tests for valid requests, missing/oversized fields, unsupported languages, malformed measurements, and ambiguous intent.

### Slice B — Conservative intent routing

- Route clear diagnostic requests to the existing deterministic engine first.
- Route requests needing a manufacturer/model-specific specification to knowledge lookup or clarification; never invent a setpoint.
- Route calculation requests only to a validated deterministic calculation tool (not included until its formulas and units have tests).
- Route requests to AI only when explicit consent is true and the caller has an available backend. The core itself never fetches.
- Hazardous language must not be treated as ordinary generic chat; mark safety review and use the existing safety policy.
- Unknown or ambiguous requests return `clarify` rather than guessing.

### Slice C — Stable assistant result envelope

Define a stable result shape for later integration:

- `status`: needs clarification, preliminary assessment, escalation required, or unable to assess.
- `language`: selected language.
- `summary`: bounded plain text.
- `evidence`: structured references with source ID and available provenance.
- `hypotheses`: explicitly labelled as unconfirmed.
- `nextChecks`: ordered, safe checks; distinguish observation from intervention.
- `safety`: warnings, stop conditions, LOTO requirement, escalation state.
- `unknowns`: facts or model-specific data not established.
- `sessionSummary`: confirmed inputs only; a cause remains empty unless explicitly verified.

Do not connect this envelope to the UI or Worker until contract tests and compatibility review are complete.

## Test plan and merge gates

1. Unit tests for normalization and every routing branch.
2. Negative tests for malformed requests, unsupported language, oversized input, and unsupported units.
3. Safety tests for interlock bypass, high-pressure hydraulic leak, energized equipment, and insufficient evidence.
4. Tests prove that routing never calls `fetch`, accesses browser storage, or depends on DOM globals.
5. Contract tests confirm existing Worker response schema remains unchanged.
6. Run existing diagnostic-engine, diagnostic-flow, normalization, worker-contract, knowledge, static-quality, and browser-smoke checks.
7. Review the diff for accidental production behavior changes and secret exposure.
8. Open a PR; do not merge until checks pass and a live provider test is separately recorded.

## Rollback

Because the first core is an isolated module and not wired into the production UI by default, rollback is deleting/reverting the module and its tests. Existing diagnosis and AI flows remain unchanged.

## Follow-up after Slice A/B passes

- Add adapter functions for existing diagnostic engine and knowledge retrieval.
- Build a small synthetic evaluation set across Arabic, French, and English.
- Integrate one UI path behind a feature flag or explicit opt-in.
- Add a controlled AI adapter only after real backend availability, consent, and output validation are confirmed.
