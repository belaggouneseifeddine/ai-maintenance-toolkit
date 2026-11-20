# Codebase boundary audit — 2026-11-20

**Scope:** first-pass architecture review on the approved working branch. No files were deleted in this pass because a safe removal requires repository-wide reference checks and a runnable test suite.

## Current module boundaries observed

| Layer | Files | Current responsibility | Review |
|---|---|---|---|
| Native model host | `android-local-host/.../MainActivity.kt`, `native-local-llm-bridge.js`, `local-llm-runtime.js` | Android file/model lifecycle, JS bridge, local inference contract | Reasonably separated; model integrity and native lifecycle tests still need Android execution |
| LLM agent | `assistant-model-agent.js` | Prompt assembly, structured action parsing, bounded tool loop | Keep model parsing here; do not move equipment logic into the agent |
| Orchestrator/session | `assistant-local-orchestrator.js`, `assistant-session-contract.js` | Session state, messages, tool invocation, snapshots | Clear boundary; persistence should remain outside orchestrator |
| Tool policy and adapters | `assistant-tool-registry.js`, `assistant-local-tools.js` | Allowlist/validation/timeout and adapters to diagnostic/document/history functions | Registry and adapters are distinct; avoid copying tool implementations into the agent |
| Diagnostic reasoning | `diagnostic-engine.js`, `diagnostic-flows.js`, `diagnostic-session.js`, `diagnostic-casebook.js`, `bayesian-engine.js` | Broad rules, guided flows, dynamic session, structured candidate cases, evidence ranking | Highest consolidation risk: CP-004 casebook triage currently uses coverage heuristic; Bayesian EIG is a separate API and not connected to the same next-test contract |
| PDF and retrieval | `document-library-core.js`, `document-library.js`, `document-semantic-search.js`, `document-retrieval-adapter.js`, `document-review-workspaces.js`, `diagnostic-document-evidence.js` | Extraction, page chunks, embeddings, retrieval, review, diagnostic citations | Good conceptual separation; Android embedding-model availability remains unresolved |
| UI/bootstrap | `index.html`, `app-legacy.js`, `ux-redesign.js`, `navigation-redesign.js`, `p1-app-shell.js`, CSS files | App entry, legacy behavior, redesign and navigation | Potential overlap; no removal until selector/event ownership and script load order are traced |
| Maintenance records | `maintenance-records.js`, `ux-redesign.js`, `assistant-local-tools.js` | Local history, PM tasks, dashboard summaries and assistant read adapters | Review storage keys and schema ownership before any migration |

## Specific duplication and divergence risks

1. **Two next-test strategies:** casebook triage chooses a safe installed observation by hypothesis coverage and qualitative costs; Bayesian EIG ranks only when complete likelihood tables and a trusted resolver are supplied. These are not interchangeable. The UI must not imply EIG is active when the casebook returned a coverage heuristic.
2. **Multiple diagnostic representations:** symptom flows, guided session flows and structured casebook records overlap in equipment/symptom vocabulary. Define a canonical case contract and adapters before deleting any source.
3. **Local storage ownership:** dashboard, records and assistant adapters read local maintenance state. A future work-order store must not create a second competing maintenance-history database.
4. **UI event ownership:** legacy bootstrap and redesign modules both participate in navigation and dashboard presentation. Static filename presence does not prove a module is unused.

## Safe cleanup sequence

1. Generate a dependency/reference map covering HTML script tags, dynamic imports, Android asset includes, Service Worker cache, Worker imports, deployment lists and tests.
2. Mark modules as runtime, build-only, test-only, research-only or candidate-only.
3. Identify duplicate functions and schemas with exact call sites.
4. Move one responsibility at a time behind a stable API; preserve compatibility adapters during the transition.
5. Add behavior tests before removal; delete only when references are zero and full tests pass.
6. Verify PWA and Android packaging after every removal.

## Not changed in this audit

- No safety-gate behavior or policy.
- No source registry, claim provenance or licensing validation.
- No production runtime fault records.
- No files removed or renamed.
