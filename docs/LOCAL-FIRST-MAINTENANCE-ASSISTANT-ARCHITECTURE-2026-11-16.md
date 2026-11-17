# Local-First Maintenance AI Assistant — Architecture & Branch Audit
**Date:** 2026-11-16  
**Baseline:** `main` at `8202b700e75cdefd19057e90b8c58ed7eddb9915`  
**Status:** Architecture proposal and repository audit; no runtime code changes.

## 1. Product decision

Maintenance AI Toolkit is to become a **local-first, self-contained industrial maintenance assistant** whose primary interface is a conversational diagnostic chatbot.

The product must not require a third-party hosted LLM, provider API, API key, paid inference account, or remote AI Worker for its normal operation. All inference and retrieval used by the assistant must run on the user's device. Network access may be used for optional user-initiated software/model/document updates, but not as a hidden dependency for answering a diagnostic conversation. The offline acceptance test must pass with airplane mode enabled after the app, runtime, model, and user documents have been installed.

This is not a requirement to reproduce the quality or speed of a large hosted general-purpose model on every Android device. The product must communicate device capability limits honestly and preserve useful deterministic diagnostic and knowledge functions on devices that cannot run the selected local model.

## 2. Product experience

The chatbot is the main entry point, not a thin chat skin over a fixed questionnaire.

The technician can write naturally in Arabic, French, or English, for example:
- "The centrifugal pump has low flow and high vibration."
- "The motor overheats after twenty minutes."
- "I measured normal suction pressure. What should I check next?"
- "Search the manual I uploaded and show the relevant page."

The assistant must:
1. Understand the current message and conversation context.
2. Identify the task and the equipment/context known so far.
3. Ask one high-value clarification when essential information is missing.
4. Invoke internal application capabilities (diagnostic engine, document retrieval, fault casebook, maintenance history, PM/predictive modules, safety checks).
5. Distinguish observed facts, user-reported facts, retrieved claims, model-generated suggestions, and unknowns.
6. Continue the same diagnostic case across turns, incorporating new measurements and contradictory evidence.
7. Return a concise answer with ranked hypotheses, reasons, uncertainty, safety constraints, next test, and traceable sources.
8. Persist the session locally and allow the technician to inspect or correct the extracted structured facts.

No tool result, model suggestion, or similarity match alone confirms a root cause.

## 3. Target architecture

### 3.1 Layers

**A. Chat UI**
- One conversational workspace for diagnosis and application tasks.
- Displays conversation, equipment context, active diagnostic state, hypotheses, evidence, source citations, and next action.
- Optional collapsible panels for "Evidence", "Hypotheses", "Equipment", and "Session history"; avoid duplicating the same state in separate pages.
- UI must not contain diagnostic rules or provider-specific networking logic.

**B. Local Assistant Orchestrator**
- The single application entry point for assistant turns.
- Maintains a typed conversation/session state and selects internal tools.
- Uses explicit tool schemas, permission checks, timeouts, bounded result sizes, and deterministic dispatch.
- Never exposes arbitrary filesystem, database, or JavaScript execution to the model.
- Validates tool arguments and outputs before they enter session state.
- Must work without network connectivity.

**C. On-device Language Model Runtime**
- Runs inference locally on Android/browser-supported hardware.
- Exposes a provider-neutral internal interface such as `generate(messages, responseSchema, limits)`; "provider-neutral" here means interchangeable local runtimes, not remote service providers.
- Supports streaming where practical, constrained/structured output, cancellation, context-window limits, and model capability metadata.
- Model files and runtime assets must be packaged or explicitly installed locally. Remote inference endpoints are prohibited in the product path.
- Runtime/model choice remains open until measured on target Android devices for memory, latency, thermal load, storage, language quality, license, and offline operation.

**D. Diagnostic Reasoning Engine**
- Remains a deterministic, testable subsystem responsible for equipment-specific rules, evidence handling, hypothesis ranking, constraints, and next-test selection.
- Accepts normalized structured observations, not raw model prose.
- Returns hypotheses rather than declaring root cause unless a separately defined evidence threshold and human confirmation policy are satisfied.
- Unknown and contradictory evidence must remain explicit; missing values must never be treated as negative findings.
- Bayesian or other probabilistic outputs must be labelled provisional unless calibrated against representative field data.

**E. Local Knowledge Engine**
- Local fault database and reviewed diagnostic cases.
- PDF/document library with page-level extraction, original file identity, page number, chunk ID, extraction method, and source metadata.
- Retrieval pipeline combining lexical retrieval with local embedding-based semantic retrieval when a suitable on-device embedding model is available.
- Re-rank results using equipment/model applicability, source quality, review state, recency/version, and query relevance.
- Return evidence objects with exact source and page references; never fabricate a citation or page.
- Candidate knowledge extracted from a manual remains draft until technical review and exact equipment/model applicability checks are complete.

**F. Application Tools**
- Equipment registry and operating context.
- Maintenance history and intervention records.
- Preventive maintenance plans.
- Predictive indicators only where actual sensor/history data support them.
- Report generation and export.
- Document import, review, and source navigation.
- All tools are local-first and called through typed interfaces.

**G. Independent Safety and Validation Gate**
- A deterministic layer outside the LLM that validates safety-critical outputs and tool calls.
- Covers isolation/LOTO, electrical/mechanical stored energy, pressure, temperature, rotating machinery, hazardous media, guarding, and stop-work conditions as applicable.
- Can block unsafe instructions or require qualified-person confirmation.
- Must not infer that isolation has occurred merely because a user says "done"; record it as user-reported unless independently verified.
- Model prompts are not a safety control. Safety checks must be enforced in code and covered by regression tests.

**H. Local Storage and Privacy**
- Store conversation sessions, documents, indexes, model configuration, and maintenance records locally.
- Define retention, deletion, backup/export, corruption recovery, and storage quota behavior.
- No diagnostic text, PDF content, embeddings, or personal maintenance records are transmitted to a remote AI service.
- Any future optional synchronization must be a separate, explicit product decision and must not be needed for diagnosis.

### 3.2 Turn lifecycle

1. Receive technician message.
2. Load local conversation state and equipment/session context.
3. Apply input size, file, and safety prechecks.
4. Ask the on-device LLM to classify intent and extract candidate structured facts/tool requests using a constrained schema.
5. Validate extracted facts; preserve original text and mark confidence/provenance. Do not silently overwrite user-confirmed facts.
6. Orchestrator invokes only allow-listed local tools.
7. Diagnostic engine evaluates structured observations and relevant reviewed knowledge.
8. Safety gate validates proposed tests/actions and blocks or qualifies unsafe steps.
9. LLM verbalizes the verified tool results and uncertainty in the user's language; it cannot add unsupported specifications, limits, citations, or conclusions.
10. Validate the final answer against evidence/source IDs and safety constraints.
11. Persist the turn and tool trace locally.
12. Render answer with source/page links and an actionable next question/test.

The model may request another tool call, but the orchestrator controls whether it is allowed. The model does not directly mutate the diagnostic state.

## 4. Responsibilities and trust boundaries

| Component | Owns | Must not own |
|---|---|---|
| Local LLM | Language understanding, dialogue, extraction proposals, explanation | Final fault confirmation, safety authorization, source truth |
| Orchestrator | Session lifecycle, tool routing, schema validation, permissions | Domain-specific diagnosis logic |
| Diagnostic engine | Hypotheses, evidence updates, next-test logic | Free-form conversation rendering |
| Knowledge engine | Retrieval, provenance, page-level evidence | Claim approval without review |
| Safety gate | Stop/go constraints and unsafe-output blocking | Assumption that user actions are verified |
| Chat UI | Conversation and evidence presentation | Hidden state mutation or provider calls |

### Required data labels

Every diagnostic item must identify its provenance:
- `user_reported`
- `measured` (with unit, method, time, and instrument when available)
- `document_claim` (document ID, version/hash, page, chunk, review state)
- `case_history`
- `engine_inferred`
- `llm_suggested`
- `unknown`

A model-suggested fact must not silently become a measured fact or reviewed document claim.

## 5. Chat and session contract

A session should have a stable local ID and include:
- Equipment type, manufacturer, model, serial/asset identifier where provided.
- Operating conditions: load, speed, flow, pressure, temperature, medium, duty cycle, environment.
- Symptoms and onset/timeline.
- Observations and measurements with units and provenance.
- Hypotheses with rationale, evidence for/against, and provisional confidence.
- Tests already performed and their outcomes.
- Retrieved sources and exact page/chunk references.
- Safety state and unresolved hazards.
- Conversation messages and tool-call audit trail.
- Current next question/test and reason it has the highest information value.

Free text that cannot be mapped must remain in the conversation and be eligible for local model extraction in a later turn. It must not be dropped or reduced to a passive note without explanation. The technician must be able to correct extracted facts.

## 6. Knowledge and PDF architecture

The existing PDF intake/review work merged into main is a valuable foundation and should be retained. Extend it rather than replacing it.

Required stages:
1. Import local PDF and compute a stable content hash.
2. Extract selectable text page by page; OCR image-only pages locally.
3. Preserve original page text, extraction method, confidence/quality flags, and page boundaries.
4. Segment content into bounded chunks while retaining page and document-version provenance.
5. Extract candidate facts (fault codes, symptoms, causes, procedures, safety warnings, limits, parts, maintenance intervals) using the local model or deterministic parsers.
6. Validate schema, units, exact model applicability, contradictions, and source traceability.
7. Store candidates as draft.
8. Technician/reviewer inspects the original page and approves or rejects each claim.
9. Only approved and applicable claims enter diagnostic retrieval.
10. Retrieval returns the exact claim and source page; the assistant explains whether it is a manufacturer instruction, a reviewed field case, or a lower-confidence reference.

Search roadmap:
- Phase A: current lexical search with transparent ranking and exact model filters.
- Phase B: local embeddings and vector index; benchmark multilingual retrieval against a labelled test set.
- Phase C: hybrid lexical + semantic retrieval and re-ranking.
- Phase D: retrieval evaluation for recall@k, precision@k, source correctness, model applicability, and page citation accuracy.

Do not call lexical search "semantic search". Do not treat embedding similarity as evidence quality or truth.

PDF.js, OCR engines, fonts, and other required assets must be available locally for offline acceptance. CDN-only runtime dependencies are not acceptable for the offline workflow.

## 7. Local model selection and device constraints

Do not select a model by popularity or parameter count alone. Create a benchmark matrix using representative maintenance tasks in Arabic, French, and English:
- Understand mixed-language equipment descriptions and technical vocabulary.
- Extract equipment, symptoms, measurements, units, and unknowns into a strict schema.
- Ask a single high-value follow-up question.
- Select from a bounded set of local tools using valid arguments.
- Summarize retrieved manual evidence without changing numeric limits or model scope.
- Handle contradictory evidence and refuse to invent missing data.
- Produce clear short technical explanations and structured reports.

Measure on at least the user's target Android device and one lower-resource Android device:
- Download/install size and runtime memory.
- First-token latency and tokens/second.
- Battery/thermal behavior over repeated turns.
- App responsiveness while inference runs.
- Context-window behavior and persistence.
- Airplane-mode success after installation.
- Arabic/French/English quality and structured-output validity.
- Runtime/model license and redistribution requirements.

Use a model adapter so the runtime can be replaced without changing the chat, orchestrator, diagnostic, or knowledge contracts. If the device cannot run the LLM reliably, the app must degrade gracefully to a deterministic guided assistant and explain the reduced conversational capability. It must never silently fall back to a remote model.

## 8. Security, privacy, and robustness

- No remote inference, provider API keys, or model calls from the browser/Worker in the product path.
- No arbitrary model-generated code execution.
- Tool allow-list, strict argument schemas, output size limits, and input sanitization.
- Treat PDF text, imported files, and retrieved documents as untrusted data, not executable instructions. Defend against prompt injection embedded in manuals.
- Keep document text and original files local; do not send full manuals to a model service.
- Validate numeric units/ranges and never invent manufacturer limits.
- Prevent cross-session document evidence leakage.
- Handle corrupt PDFs, OCR failure, unsupported languages, low storage, model load failure, app termination, and interrupted writes.
- Provide explicit local backup/export and restore validation.
- No telemetry containing diagnostic content by default.

## 9. Proposed module boundaries

Names are proposals; map them to existing files after a dependency audit.

| Proposed module | Responsibility |
|---|---|
| `assistant-chat-ui.js` | Chat UI only |
| `assistant-session.js` | Conversation and diagnostic session state |
| `assistant-orchestrator.js` | Intent routing and local tool orchestration |
| `local-llm-runtime.js` | On-device model adapter, loading, inference, cancellation |
| `assistant-tool-registry.js` | Allow-listed typed application tools |
| `diagnostic-engine.js` | Existing deterministic diagnostic logic, extended |
| `diagnostic-evidence.js` | Evidence provenance and hypothesis updates |
| `knowledge-retrieval.js` | Lexical/vector/hybrid retrieval |
| `document-ingestion.js` | PDF/OCR/chunking and source provenance |
| `safety-gate.js` | Independent deterministic safety validation |
| `local-storage.js` | Versioned local persistence and migrations |

Avoid a large rewrite. Introduce adapters around existing modules, migrate one responsibility at a time, and preserve existing public APIs until replacement tests pass.

## 10. Migration plan and gates

### Phase 0 — Architecture and branch governance
- Freeze the baseline and identify reusable modules.
- Review open PRs and divergent branches before cherry-picking anything.
- Approve this architecture and define the exact phase-1 scope.
- No main changes.

### Phase 1 — Local assistant foundation (no LLM runtime dependency yet)
- Introduce a typed assistant session contract.
- Introduce a local orchestrator and explicit tool registry.
- Connect existing diagnostic, document retrieval, equipment, history, and safety functions through adapters.
- Ensure free-text turns are preserved and structured facts can be proposed, reviewed, and corrected.
- Keep the current UI functional behind a feature flag or isolated route.
- Remove remote-provider invocation from the new assistant path; do not delete legacy code until dependency and deployment impact is understood.
- Add unit and integration tests for tool routing, session continuity, evidence provenance, session isolation, safety blocking, and offline behavior.

**Gate:** The assistant can conduct a multi-turn deterministic local diagnostic, call at least the diagnostic and reviewed-document retrieval tools, preserve context, and pass safety regressions without any remote request.

### Phase 2 — On-device LLM runtime spike
- Benchmark candidate runtimes/models on Android.
- Build a small isolated prototype and test schema-constrained extraction, tool selection, and Arabic/French/English.
- Decide model packaging, storage, memory, and fallback behavior from measured results.

**Gate:** Offline Android benchmark meets agreed latency, memory, quality, and license criteria.

### Phase 3 — LLM integration
- Add local model adapter to the orchestrator.
- Restrict the model to tool proposals and response drafting.
- Validate all proposed facts, tool calls, and final claims.
- Maintain deterministic fallback when the model is unavailable.

**Gate:** No unsupported claim, invalid tool call, safety bypass, or hidden remote fallback in adversarial and regression suites.

### Phase 4 — Hybrid local knowledge retrieval
- Integrate local embeddings and vector search.
- Combine lexical and semantic retrieval.
- Add labelled retrieval evaluation and exact page-citation tests.

**Gate:** Retrieval improves measured recall/precision without reducing source and model applicability accuracy.

### Phase 5 — Product-wide assistant integration
- Expose PM, history, reporting, and predictive features as tools.
- Redesign navigation around one assistant workspace plus focused knowledge, safety, and maintenance-history views.
- Perform Android usability and offline acceptance.

## 11. Non-functional acceptance criteria

A release claiming "self-contained/offline assistant" must demonstrate:
- Airplane-mode multi-turn conversation after initial local installation.
- No outbound AI inference requests (verified by network inspection).
- No API key or provider account required.
- Local retrieval of a reviewed PDF claim with exact page citation.
- Correct handling of unknown and contradictory facts.
- No cross-session context or PDF leakage.
- Safety-critical prompts cannot bypass deterministic safety rules.
- Model/runtime failure leaves deterministic diagnostic and knowledge features usable.
- App restart restores the conversation and its evidence trace.
- All model-generated diagnostic claims remain distinguishable from reviewed facts.

## 12. Current repository audit — 2026-11-16

### Baseline
- Default branch: `main`.
- Audited main commit: `8202b700e75cdefd19057e90b8c58ed7eddb9915`.
- The PDF knowledge intake and PDF review safeguard PRs #139 and #140 were merged immediately before this audit.
- This document branch is based directly on that main commit.

### Main observations
- `diagnostic-chat.js` and `diagnostic-session-ui.js` provide a guided chat experience, but unmapped free text is not yet equivalent to a persistent natural-language diagnostic turn.
- `agent-core.js` is a deterministic orchestrator, not a language model. It is a useful design seed for typed local tool routing.
- `diagnostic-engine.js` contains deterministic/heuristic reasoning and provisional scoring. Probabilistic assumptions must not be represented as empirically calibrated confidence.
- PDF extraction, page provenance, draft candidates, and review safeguards have meaningful foundations on main after #139/#140.
- Current retrieval is not yet a complete local multilingual semantic RAG stack; lexical search must remain accurately labelled.
- Some PDF/OCR runtime assets have CDN loading paths; offline asset packaging remains a requirement.
- Existing README/AI setup and Worker/provider paths describe external generation. They conflict with the new product decision and require a controlled deprecation plan.
- A fully local LLM runtime was not found in the audited main source files. This must be verified with a repository-wide dependency/network audit before claiming there is no other inference path.
- This is a source and documentation audit, not a full execution, security penetration test, or Android device test.

### Open pull requests found

| PR | Topic | Current state | Audit view |
|---|---|---|---|
| #126 | Provider-neutral semantic retrieval primitives | Draft; mergeable reported true; 4 commits | Best isolated starting point for vector-index code. No embedding model/runtime, persistence, or diagnostic integration. Review and rebase against current main before reuse. |
| #117 | P4 community knowledge staging | Draft; mergeable false; 74 commits | Out of phase-1 scope; has external Cloudflare/D1/R2 and public-sharing concerns. Keep isolated; do not merge for the local-first assistant. |
| #106 | Schneider ATS22 candidate knowledge | Draft; mergeable true; 2 commits | Potentially useful after source PDF is independently reviewed. Candidate remains review-needed; not production diagnostic truth. |
| #100 | Gemini default model fix | Open; mergeable false | Conflicts with no-external-provider direction. Do not merge; later close/deprecate after checking dependencies and history. |
| #99 | Compressor overheat adaptive flow | Open; mergeable false | Domain-specific diagnostic case may be useful. Port/rebase tests and flow logic selectively; do not merge stale branch wholesale. |
| #97 | Experimental Bayesian engine | Draft; mergeable false; 19 commits | Limited pump/low-flow model with provisional priors. Research/reference only until calibration, safety and integration review. |
| #94 | Local evidence reasoning/provenance | Draft; mergeable true | Review selectively for claim-to-hypothesis provenance. It is not a validated diagnostic model. |
| #93 | Answer cache safety regressions | Open; mergeable true | Tests may be useful; not core assistant architecture. Verify the current implementation and Europe PMC status before reuse. |
| #92 | Equipment workflows | Open; mergeable false | Review individual flows against current main; likely stale and potentially duplicative. |
| #91 | Older architecture audit/docs | Open; mergeable false | Historical documentation only; do not treat as current baseline. |
| #88 | Live external AI generation smoke test | Draft; mergeable false | Provider-specific and contrary to the target product path. Retain only historical test evidence; do not integrate into local assistant runtime. |
| #87 | Bounded offline evidence library | Open; mergeable true | Potentially useful local source registry; inspect contracts/tests before selective reuse. |
| #86 | Additive local reasoning module | Open; mergeable true | Potentially useful hypothesis-only response patterns; inspect against current engine and tests before reuse. |

"Mergeable" is GitHub's current merge-conflict signal, not an approval or test result. Several branches have very old base histories; do not merge them wholesale.

### Relevant branch comparisons against current main

The following comparisons were made against `main`; many branches are significantly behind and have diverged.

| Branch | Ahead / behind | Changes observed | Recommendation |
|---|---:|---|---|
| `feature/semantic-retrieval-p1-p2` | 4 / 185 | Embedding adapter, cosine vector index, tests | Inspect/rebase selectively; promising for a later retrieval phase. |
| `feat/semantic-retrieval-core-v1` | 4 / 178 | Same four semantic retrieval files | Appears to duplicate #126; compare exact commits and choose one source, not both. |
| `feature/bayesian-diagnostic-engine-v1-main` | 19 / 219 | Bayesian engine/UI plus deployment and shell changes | Do not merge wholesale; isolate engine/tests for review. |
| `feature/compressor-overheat-diagnostic-flow-2026-10-27` | 2 / 218 | Two diagnostic-flow/test changes | Selective port only if current-main case coverage is still missing. |
| `feature/oem-knowledge-schneider-ats22` | 2 / 211 | ATS22 JSON candidate + tests | Hold for source verification and model-scope review. |
| `feature/p4-global-community-knowledge` | 74 / 192 | D1/R2/community backend and workflows | Out of scope; keep isolated and do not couple to local assistant. |
| `docs/architecture-audit-phase2-2026-10-24` | 2 / 257 | Older architecture/engineering docs | Historical; superseded by this document and current main. |
| `assistant-redesign` | 24 / 309 | Knowledge drafts, source registry, workflow and Worker edits | Not a clean assistant implementation branch; review individual knowledge assets only. |
| `redesign-assistant` | 33 / 267 | Compare endpoint returned no file list | Insufficient evidence; inspect branch/PR provenance before any use. |
| `work/diagnostic-pilot-foundation-2026-11-12` | 145 / 181 | Large mixed branch including product requirements, PDF, knowledge, deployment/workflow edits | Do not merge wholesale; extract only specifically needed, reviewed changes. |
| `feat/engineering-ai-core-v1` | 9 / 257 | Engineering core + tests | Compare against current main; current main has evolved, so port tests/logic selectively. |
| `feature/ai-agent-core-v1` | 7 / 251 | Agent core + docs/tests | Historical design reference; compare with current `agent-core.js`, avoid duplicate architecture. |
| `feature/adaptive-diagnostic-agent-v1` | 1 / 213 | Agent contract doc | Reference only. |
| `feature/dynamic-diagnostic-agent-knowledge-v1` | 46 / 213 | Session/UI/provider/knowledge work | Mixed and partly provider-specific; do not merge wholesale. |

The repository has many additional historical branches. The comparisons above prioritize open PR heads and branches whose names/content indicate direct relevance to the local assistant, diagnosis, knowledge, and retrieval. No branch was deleted, closed, merged, or modified during this audit.

## 13. Branch and execution recommendation

1. Use current `main` as the only integration baseline.
2. Keep this architecture/audit on its own documentation branch until reviewed.
3. Create a separate phase-1 implementation branch from the latest `main` after architecture approval; do not base it on any stale divergent feature branch.
4. Port only reviewed, testable pieces from #126, #86, #87, #94, #99, and #106 when their specific scope is reached.
5. Keep #117 and provider-specific PRs out of the local assistant foundation.
6. Do not merge or deploy automatically. Require CI, focused regression tests, and explicit approval for integration/deployment.

## 14. Phase-1 deliverables and definition of done

Phase 1 should produce:
- A versioned assistant-session schema and migration tests.
- A local tool registry with typed input/output schemas.
- An orchestrator that can call diagnostic reasoning, reviewed-document retrieval, equipment context, and safety validation.
- Session continuity with correction of extracted facts and traceable tool events.
- A deterministic chat path that functions without a local LLM, proving the orchestration and domain contracts independently.
- A clear local-only network contract and tests that fail if the new assistant path attempts remote inference.
- An architecture map of existing modules and adapters, plus removal/deprecation plan for external-provider UI paths (without deleting unrelated deployment infrastructure prematurely).

**Phase 1 does not include:** selecting/bundling the final LLM, broad UI redesign, community knowledge backend, automatic PDF claim approval, cloud sync, or production deployment.

---

**Audit conclusion:** The repository contains useful foundations but not yet the integrated local conversational assistant requested. The safest route is incremental: establish local session/tool/safety contracts first, prove multi-turn deterministic orchestration, then benchmark and integrate an on-device LLM. This avoids making the entire product dependent on an untested model runtime and avoids discarding the existing diagnostic and PDF work.
