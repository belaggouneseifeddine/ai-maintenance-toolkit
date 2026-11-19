# Local Industrial Chatbot — Architecture and Integration Plan

Date: 2026-11-19  
Target: Android-first, fully local Maintenance AI Toolkit

## Executive decision

Keep one conversational interface. Make Qwen the local language interface and tool planner, not the authority for engineering conclusions. The deterministic diagnostic engine, reviewed fault knowledge, and cited PDF claims remain the evidence layer. Do not require a cloud provider for normal operation.

## What exists today on the main-derived app branch

- `diagnostic-chat.js` renders and persists the conversation locally.
- Input routing relies heavily on regex/keyword detection and special-case handlers for history, PM, handover, equipment context, and checklists.
- The chat can call local tools through `assistant-local-orchestrator.js`, `assistant-tool-registry.js`, and `assistant-local-tools.js`.
- The orchestrator records messages/facts/tool events and executes explicitly supplied `toolCalls`; it does not itself interpret natural language, plan tool calls, or run an agent loop.
- The optional generative button calls `MaintenanceAgentUI.runCloudAI()` after explicit consent. The refactor branch now adds local-only runtime/bridge adapters and Qwen import/load controls inside the same diagnostic chat; once Qwen is loaded in a compatible Android host, free-text chat turns use the bounded local agent. The Android host project itself remains on a separate branch and is not yet integrated or device-validated.
- When a guided diagnostic flow ends, an additional free-text note can be retained without re-ranking the guided hypotheses. This must be corrected so new evidence is either evaluated by the general diagnostic path or clearly marked as pending, never silently ignored.

## Qwen Android integration status

A separate, unmerged branch exists: `feature/android-local-assistant-integration-2026-11-19`.

Its README describes:
- Android WebView packaging of the PWA.
- An on-device Qwen3.5-0.8B int8 CPU model through LiteRT-LM.
- A narrow native bridge for model capability/status, import/load/unload, and generation.
- JavaScript remains responsible for validating and executing allow-listed tools.
- No INTERNET permission or cloud fallback in that host.
- The standalone model-test POC reportedly generated on the user's phone, but the WebView bridge integration still needs its own APK build and physical-device test.
- The bridge currently returns completed output rather than streaming tokens.
- Embedding weights are not bundled in that Android host; PDF text/OCR/BM25 may be local, but semantic-vector retrieval is unavailable until a local embedding model is packaged.

Do not merge the Android branch wholesale into this refactor. Select the runtime/bridge pieces only after inspecting exact diffs, Gradle workflow, asset synchronization, and device evidence.

## Target request/response loop

```text
Technician message
  -> conversation context builder
  -> Qwen local inference (structured action response)
  -> strict JSON/schema validation
  -> local agent policy + allow-listed tool registry
       -> diagnostic engine
       -> next-test ranking (EIG only with approved likelihood evidence)
       -> reviewed PDF retrieval (document + page + excerpt)
       -> equipment context / maintenance history / PM schedule
  -> tool results with provenance and limitations
  -> Qwen local inference (explain, ask next question, or summarize)
  -> assistant response + updated structured session
```

The loop must be bounded (e.g. maximum 3 tool rounds per user turn), reject unknown tools and malformed arguments, enforce per-tool schemas/timeouts/output limits, and never execute arbitrary code, shell commands, URLs, or model-generated SQL.

## Separation of responsibilities

### Qwen local model
- Understand Arabic/French/English technician messages.
- Extract candidate equipment, manufacturer/model, symptom, alarm code, measurements, units, operating state, and missing fields.
- Decide which registered local tool is relevant and prepare schema-valid arguments.
- Summarize returned evidence, explain uncertainty, and ask one useful next question.
- Never invent OEM specifications, source citations, measured values, or confirmed root causes.

### Deterministic diagnostic layer
- Normalize and validate measurements and units.
- Rank fault hypotheses only from declared evidence relationships and validated conditions.
- Distinguish supporting, contradicting, missing, stale, estimated, and low-quality evidence.
- Recommend the next test using documented expected outcome distributions; otherwise label the recommendation heuristic.
- Keep relative support scores separate from calibrated probabilities.

### Knowledge/PDF layer
- Return only claims eligible under the document review policy for diagnosis.
- Every claim must carry document ID/title, page number, excerpt, review status, rights status, applicability/scope, and source locator.
- The model may explain a claim but may not upgrade its verification status.
- If retrieval is unavailable, continue with local fault knowledge and state that no applicable PDF evidence was found.

### Conversation/session layer
- Maintain canonical structured case state separately from transcript text.
- Store provenance for each fact: user-reported, measured, document claim, case history, engine-inferred, or model-suggested.
- A model-suggested fact must not become accepted evidence without technician confirmation or a trusted source.
- New observations after a guided flow completes must trigger a fresh general assessment or an explicit pending-evidence prompt.

## Structured model output contract

Use a small versioned JSON envelope. Example only:

```json
{
  "schemaVersion": "1.0",
  "kind": "tool_call",
  "tool": "diagnose",
  "arguments": {
    "equipment": {"type": "pump", "manufacturer": "", "model": ""},
    "symptom": "low_flow",
    "observations": ["flow lower than normal"],
    "measurements": []
  },
  "userFacingText": ""
}
```

Allowed `kind` values should include `message`, `ask_question`, and `tool_call`. Validate every field and enum. Do not accept arbitrary tool names or extra executable fields. Tool output should be returned to the model as untrusted data, not as instructions.

## Mobile constraints and runtime design

- Target device class: Android, 6 GB RAM, 128 GB storage.
- Keep one model engine resident only if the tested LiteRT-LM/model combination is stable. The current Android README deliberately creates a fresh Engine per generation due to recurrent-state concerns on the pinned runtime; measure latency and memory before changing this.
- Add streaming after correctness and cancellation semantics are tested.
- Limit context by token budget, not JavaScript character count. Use a compact case summary plus the latest turns and retrieved evidence; do not send the entire transcript indefinitely.
- Use a bounded local conversation store and explicit model lifecycle states: not imported, imported, loading, ready, generating, failed, unloading.
- If Qwen is unavailable or not imported, retain deterministic local diagnosis and scripted guided prompts as a degraded mode. Clearly label it as such.

## Implementation sequence

1. **Bridge audit:** inspect exact Android branch files and commit diff; verify model lifecycle, WebView origin, bridge allow-list, asset sync, and error/cancel handling. The JS runtime/bridge and same-chat agent path are now present on the refactor branch; Android host packaging and physical-device acceptance remain outstanding.
2. **Agent contract:** a pure JavaScript response parser, bounded tool loop (maximum three tool calls per user turn), local allow-list intersection, bounded context/results, and regression tests are now implemented. Continue hardening with model-generated Qwen output fixtures. Test malformed JSON, unknown tools, oversized outputs, repeated tool loops, timeout, and hostile prompt text.
3. **Chat integration:** replace special-case routing gradually with Qwen structured intent/action planning. Keep explicit deterministic shortcuts only as fallback, not the primary intelligence.
4. **Evidence feedback:** feed tool results back into Qwen with provenance and source citations. Require one next question when essential information is missing.
5. **State correctness:** re-evaluate newly added free text after guided flows; separate model suggestions from accepted facts.
6. **Android acceptance:** build a new APK and test Arabic/French/English, pump and valve cases, tool calls, invalid tool calls, airplane mode, app restart, model reload, memory, latency, battery, and crash/ANR.
7. **UX:** show model status and local-only status; provide clear loading/cancel/retry states; stream tokens only after the bridge is proven stable.

## Acceptance criteria

- The same chat interface works with no external provider configured.
- Qwen can understand a free-form technician message and select a valid local tool using structured output.
- The app rejects malformed outputs and unknown tool names without executing them.
- Diagnostic conclusions are grounded in deterministic results and reviewed evidence, not model confidence.
- Every PDF claim shown in an answer links to the exact source document and page.
- New observations update or explicitly extend the case rather than being silently ignored.
- With Qwen unavailable, the app still provides a clearly labelled deterministic fallback.
- Offline behavior is verified on the target Android device.

## Explicit non-goals for this phase

- Training Qwen weights on-device.
- Automatic sharing or federated learning from user cases.
- Cloud inference or a cloud fallback.
- Letting the model directly edit records, change equipment settings, or execute arbitrary actions.
