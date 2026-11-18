# Local LLM Runtime Evaluation and Integration Plan

**Date:** 2026-11-18  
**Target branch:** `study/local-llm-runtime-evaluation`  
**Baseline:** `main` at `28bd2ecea8282e8f6d7bb915d83e8509d198b06e`  
**Status:** Research and implementation plan; no production code, model weights, cloud service, or deployment changes.

## 1. Binding product decision

Maintenance AI Toolkit's assistant is to use **local inference only**. Do not use OpenAI API, Gemini API, Cloudflare Workers AI, or another hosted LLM for assistant generation. Do not silently fall back to a cloud provider when the local model is unavailable.

The diagnostic engine, reviewed document retrieval, safety checks, and session state remain local application capabilities. Network access may be used only for an explicit user-initiated download/update of an app component or model. Once installed, inference and retrieval must work with the device offline.

This requirement is stronger than the current repository behavior: the current README and UI still describe a consent-based Cloudflare Worker AI route (Gemini or Workers AI). That route is not the target architecture and must be retired from the assistant UX when the local path is ready. Do not delete the existing route in this research branch before the replacement has been implemented and regression-tested.

## 2. Repository baseline audit

The repository is a static JavaScript PWA. The root has no `package.json`, Gradle build, Android manifest, Capacitor configuration, or native Android module. It is therefore not currently an Android-native app and has no Kotlin bridge to host a native LLM runtime.

Existing reusable modules:
- `diagnostic-chat.js`: current chat UI and heuristic/regex-based message routing; includes the old explicit cloud-AI action.
- `assistant-session-contract.js`: versioned assistant session shape and validation.
- `assistant-tool-registry.js`: allow-listed local tool registry and input/output validation.
- `assistant-local-orchestrator.js`: local turn/session orchestration; deliberately does not parse natural language, load a model, or access network.
- `assistant-local-tools.js`: adapters for diagnostic engine, reviewed document retrieval, equipment context, maintenance history and safety-related capabilities.
- `engineering-core.js`, `diagnostic-engine.js`, `bayesian-engine.js`: existing deterministic / evidence reasoning capabilities.
- `document-library-core.js`, `document-semantic-search.js`, `document-retrieval-adapter.js`, `document-review-workspaces.js`: local document management, local embedding search, retrieval and review workflow.
- `learning-memory.js`: local case/feedback records; not model training.
- `sw.js`: PWA app-shell caching. It currently pre-caches optional large OCR/PDF/Transformers assets; model weights must NOT be added to the install-time app shell.
- `docs/ANDROID-PDF-ACCEPTANCE-TESTS.md`: existing manual Android acceptance checklist.

The current semantic search uses Transformers.js and a multilingual MiniLM embedding model. Its code currently allows remote model loading and disallows local model loading. This must be considered separately from the new generation model: an offline assistant requires a deliberate local embedding-model installation/cache path too. Do not assume the current embedding pipeline is fully offline on a fresh device.

Important product gap: the current assistant orchestrator accepts preselected `toolCalls`; it does not ask an LLM to understand a message and select tools. The chat UI still has heuristic routing. A local LLM runtime alone will not create an agent: the model adapter, structured tool-call protocol, turn loop, validation, safety policy and context assembly must be implemented.

## 3. Runtime comparison

### A. Google LiteRT-LM — primary candidate for native Android

Strengths:
- Official Android/Kotlin API; documented streaming conversation lifecycle.
- GPU and CPU backends, with NPU options where compatible.
- Local model files use the `.litertlm` format and are stored outside the APK.
- Kotlin API exposes tool definitions and supports manual tool-call handling.
- Google publishes converted open-weight model artifacts, including Gemma and Qwen family models.

Constraints:
- The repository has no Android module today; using the stable Kotlin runtime requires introducing a native Android host or wrapper.
- The JavaScript/Web API is early preview and currently supports only a limited set of web-compatible Gemma 4 E2B/E4B text-in/text-out model files. It is not currently a general Qwen Web runtime and must not be treated as equivalent to the stable Kotlin API.
- Native tool execution is only useful when the selected model has reliable tool-use behavior. Our app should initially use manual tool calls: model proposes a typed action; the existing JS registry validates and executes it; safety checks remain in app code.
- Runtime compatibility is version-sensitive. Pin an exact runtime and model artifact pair after device testing; do not use `latest.release` in a reproducible production build.

Assessment: best first candidate for a native Android proof of concept because it offers one runtime family for Gemma and some converted Qwen models, with a supported Kotlin integration path.

### B. MLC LLM / WebLLM

Strengths:
- Open deployment stack with Android and browser/WebGPU routes.
- WebLLM can run selected models locally in a compatible browser.
- MLC documents Android builds and OpenCL paths, including Mali support in its platform matrix.

Constraints:
- Browser support depends on WebGPU, available GPU memory, Chrome version, and the model's compiled WebLLM library. A model appearing in Hugging Face does not automatically mean it is supported by WebLLM.
- Android native integration requires compiled model libraries and device-specific testing.
- The published Android sample devices do not establish compatibility or performance on the user's Samsung Exynos/Mali device.
- Do not assume Qwen3.5 is available as a ready-to-use WebLLM model; verify the exact model ID, quantization and WebGPU library before implementation.

Assessment: secondary candidate, especially if a specific small Qwen model is available in a compatible WebLLM build or if LiteRT-LM performance is poor.

### C. llama.cpp

Strengths:
- Mature GGUF ecosystem, broad quantization options, and CPU fallback.
- Android integration is possible through JNI/native builds.
- Useful fallback for Qwen variants distributed in GGUF.

Constraints:
- GPU acceleration is hardware/backend-dependent. Official OpenCL verification lists specific Qualcomm Adreno devices; this does not prove support for the Galaxy M33's Mali GPU.
- A native JNI integration is extra Android work.
- Tool calling depends on the model's chat template and output quality; our own typed/manual tool protocol remains necessary.

Assessment: keep as a fallback/benchmark runtime, not the first implementation target.

### D. Transformers.js / ONNX Runtime Web

Strengths:
- Already present in the PWA for local embedding inference.
- Preserves a browser-only architecture and avoids a native Android host.
- Suitable for small encoder models and potentially selected small generation models.

Constraints:
- Current project use is embedding extraction, not chat generation.
- Browser memory, WASM/WebGPU compatibility and model weight size may be limiting.
- A model that loads in Transformers.js on desktop is not evidence it will run acceptably on Android.
- The current embedding model is fetched remotely on first use; offline-first installation still needs work.

Assessment: retain for embeddings where useful; do not assume it is the primary chat-generation runtime.

## 4. Model candidates

### Qwen family
Evaluate these exact instruction/chat artifacts, not Base checkpoints:
- Qwen3.5-0.8B Instruct / LiteRT-converted variant, if the exact official/maintained artifact and runtime compatibility are verified.
- Qwen3.5-2B Instruct / LiteRT-converted variant, if available and validated.
- Qwen3.5-4B converted LiteRT-LM variant as a larger reference candidate, not an assumed phone target.

A LiteRT Community Qwen3.5-4B conversion is documented for LiteRT-LM, with runtime/version-specific GPU and CPU files. This is useful evidence that the family can be converted, but it is not a performance guarantee for our device. Verify artifact provenance, model card, quantization, chat template, license, and exact runtime version before downloading.

### Google family
- Gemma 4 E2B instruction-tuned Mobile/LiteRT-LM artifact: first Google candidate for constrained-device testing.
- Gemma 4 E4B instruction-tuned: comparison/reference only until memory measurements justify it.
- Gemini Nano via Android AICore: optional device-specific study, not the app's baseline. Availability is controlled by Android/AICore device support and API access, and cannot be assumed on every phone. It also differs from shipping our own open-weight model artifact.

Gemma 4 model card states Apache 2.0 and describes open weights, multilingual and multimodal capabilities. Still verify the exact model file's license and redistribution conditions before bundling or mirroring it.

### Important tool-calling distinction
A runtime having a tool API does not mean every model can use tools reliably. Google documentation notes that tool definitions work with models that support tool use (example: FunctionGemma). Therefore:
- First release uses **manual, constrained tool calling** through our own orchestrator.
- The model emits a small JSON action object matching a local schema.
- The app validates the action name, arguments, session state and safety preconditions.
- The existing allow-listed registry executes only approved local tools.
- The tool result is passed back to the model for explanation.
- Limit tool-loop iterations and total generation time.
- Never allow model output to execute arbitrary JS, shell commands, URLs or database queries.

## 5. Device and form-factor constraints

The available device identifier suggests a Samsung Galaxy M33 5G family device (SM-M336B variant), but the exact RAM SKU and current Android/One UI version are not confirmed. Published Samsung specifications show that M33 variants can differ in RAM (6 GB or 8 GB), so do not assume a specific memory budget.

Before device benchmarking, manually collect:
1. Settings → About phone → Model name / Model number.
2. Settings → Device care → Memory (physical RAM, not RAM Plus).
3. Android version and One UI version.
4. Free internal storage.
5. Chrome version.
6. Whether Chrome reports WebGPU availability (only if testing browser inference).

The 6 GB variant is the conservative baseline until the user confirms otherwise. Virtual RAM / RAM Plus is not equivalent to physical RAM for LLM inference. The device's Mali GPU/backend and available driver support must be measured; do not assume a Qualcomm NPU path.

## 6. Recommended architecture

Keep the current PWA UI and diagnostic/knowledge engines. Introduce an optional Android-native runtime host only for local text generation:

`PWA Chat UI -> Assistant Orchestrator (JS) -> Model Adapter -> Native Android Bridge -> LiteRT-LM Kotlin Runtime -> Local Model File`

Tool loop:
1. JS orchestrator assembles compact conversation state, equipment context, relevant approved document excerpts and tool schemas.
2. Runtime streams model output to the UI.
3. If output proposes a tool call, JS parses it as data (never executes it directly).
4. JS validates the action against `assistant-tool-registry.js`, schema, user/session context and safety policy.
5. JS executes existing local tools.
6. Tool result is returned to the model.
7. Model explains the evidence and asks the next high-value question.
8. Final response validator checks citations, claims and safety status before display.

The PWA without a native runtime must continue to offer deterministic local diagnosis, reviewed-document search and maintenance records. It must not silently switch to a cloud model.

Potential adapter contract (conceptual, not committed code):
- `getCapabilities()`
- `getModelStatus()`
- `loadModel(modelId, options)`
- `unloadModel()`
- `generate(messages, options)`
- `stream(messages, options, onChunk)`
- `cancel()`
- `releaseResources()`

The native bridge should expose only these narrow operations. The JS layer remains authoritative for tool execution and safety.

## 7. Storage, downloads and offline behavior

- Never package multi-GB weights inside the PWA app shell or APK.
- Model download is explicit, Wi-Fi-first, size-labelled, resumable if supported, integrity-checked, and cancellable.
- Store native model files in app-private storage; use IndexedDB/OPFS only for a browser runtime with confirmed quota and persistence behavior.
- Do not cache model weights in the service worker's install-time shell.
- Show available storage before download and verify SHA-256 where a trusted checksum is published.
- Keep model and embedding model separate; do not load both large models into memory simultaneously without measurements.
- Release model memory when the user exits the assistant or the OS reports memory pressure.
- Provide a no-model offline mode using existing deterministic diagnostic and document tools.
- Test airplane mode after successful model installation and after app/device restart.

## 8. Security and safety requirements

- Model output is untrusted input.
- No arbitrary code execution or direct model access to storage/database.
- Tool registry is the only execution gateway.
- Safety denial must block the corresponding action; a warning alone is insufficient for prohibited/high-risk operations.
- Retrieved PDF content is untrusted data, not instructions to the assistant.
- The model cannot approve extracted knowledge, change source trust, invent page references, or elevate evidence confidence.
- Distinguish user observations, extracted evidence, reviewed evidence, model hypotheses and verified outcomes.
- Do not persist raw hidden reasoning; persist concise evidence, tool events and diagnostic state only.

## 9. Benchmark plan

Use the same fixed maintenance test set for all models/runtimes:
- Arabic, French and English fault descriptions.
- Mixed Arabic/English technical terms and units.
- Correct equipment/symptom extraction.
- Structured JSON validity and schema compliance.
- Tool selection and argument accuracy.
- Multi-step tool loop with result incorporation.
- PDF evidence and page citation fidelity.
- Contradictory/missing measurements and calibrated uncertainty.
- Prompt injection inside a PDF/manual.
- Safety gate denial and refusal to bypass it.
- Conversation continuation after app restart.

Record on the actual phone:
- model artifact size and download size;
- peak memory and app restarts;
- load time / time-to-first-token / decode tokens per second;
- CPU/GPU backend and fallback;
- temperature after 10–15 minutes;
- battery use;
- offline success;
- crash/ANR behavior.

Do not accept vendor benchmarks on flagship devices as a substitute for this test.

## 10. Phased implementation

### Phase 0 — this branch
- Document the local-only decision, existing-code audit, runtime/model comparison and acceptance criteria.
- No runtime dependencies or weights added.
- No production deployment.

### Phase 1 — desktop/host-side proof of concept
- Use LiteRT-LM CLI/Python to test the exact candidate artifacts and tool-call protocol.
- Compare Qwen and Gemma with the fixed industrial test set.
- This validates model behavior and artifacts, not Android performance.

### Phase 2 — Android runtime shell
- Create a minimal, separate Android host project only after the user completes the device details and confirms the proof-of-concept direction.
- Embed the current web app in a WebView/bridge or evaluate a Capacitor wrapper; preserve the existing PWA as the web fallback.
- Integrate LiteRT-LM Kotlin with app-private model storage and a narrow JS bridge.
- Do not merge into main until a working APK, offline tests and safety/tool tests pass.

### Phase 3 — production integration
- Replace the chat UI's regex-first flow with model-driven intent understanding and constrained tool proposals.
- Connect the model adapter to the current local orchestrator and tool registry.
- Wire expected-information-gain ranking into the conversational next-test decision.
- Retire the cloud-AI route and its consent UI only after the local assistant path is accepted.
- Add regression tests and update offline/cache strategy.

## 11. Current conclusion

**First runtime to prototype:** LiteRT-LM Kotlin on Android.

**First model comparison:** Qwen3.5-0.8B/2B converted artifacts versus Gemma 4 E2B Mobile/LiteRT-LM. Include Qwen3.5-4B and Gemma E4B only as higher-resource references if storage/memory allow.

**Fallback runtime:** llama.cpp; MLC/WebLLM remains an alternative if exact model/backend compatibility is demonstrated.

**Do not implement yet:** automatic model download on app install, model weights in the PWA cache, arbitrary automatic tool execution, cloud LLM fallback, or a full rewrite of the existing diagnostic engine.

**Manual input needed before device integration:** confirm physical RAM, Android/One UI version, and free storage on the phone. Do not ask for API keys or cloud credentials; none are needed for this architecture.

## 12. Official references

- Google LiteRT-LM overview: https://developers.google.com/edge/litert-lm/overview
- LiteRT-LM Android Kotlin guide: https://developers.google.com/edge/litert-lm/android
- LiteRT-LM JavaScript guide and current supported web models: https://developers.google.com/edge/litert-lm/js
- Google Gemma 4 model card: https://gemma.ai/models/gemma-4/model-card/
- Google Gemma 4 mobile/LiteRT deployment: https://gemma.ai/deployment/litert/
- LiteRT Community model collection: https://huggingface.co/litert-community
- Qwen3.5-2B instruct model: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen3.5-4B LiteRT conversion: https://huggingface.co/litert-community/Qwen3.5-4B
- MLC LLM Android/Web documentation: https://llm.mlc.ai/docs/get_started/quick_start.html
- llama.cpp OpenCL backend: https://github.com/ggml-org/llama.cpp/blob/master/docs/backend/OPENCL.md
- Samsung Galaxy M33 specifications: https://www.samsung.com/sa_en/business/smartphones/galaxy-m/galaxy-m33-5g-sm-m336bznimea/


## 13. Confirmed device design baseline — 6 GB physical RAM

The user has selected **6 GB physical RAM as the engineering baseline** for the first implementation. This is a design constraint, not yet a measured benchmark of the phone. Do not count RAM Plus / virtual memory toward this budget.

Consequences:
- Prioritize compact instruction-tuned models and quantized runtime artifacts.
- First on-device comparison should start with a Qwen 0.8B-class instruct artifact and Gemma 4 E2B; Qwen 2B is a stretch candidate to measure after the small baseline works.
- Treat 4B-class models as out of scope for the initial release unless actual peak-memory, thermal and latency measurements later justify reconsideration.
- Keep the PWA/WebView, Android host, runtime, tokenizer/context buffers and OS within the same 6 GB device budget. Do not estimate model feasibility from parameter count or download size alone.
- Set an initial conservative context window and cap concurrent model/embedding workloads; unload or suspend embedding inference while generation is active if measurements show memory pressure.
- The model must be optional: deterministic diagnostics, local tools and reviewed-document search remain usable when the model cannot load or is unloaded.
- This confirmation does not establish Android version, One UI version, free storage, GPU backend, or actual inference performance. Those still require manual confirmation and device tests.

Updated candidate order for the 6 GB baseline:
1. Qwen 0.8B Instruct (small-model smoke test; exact LiteRT artifact and chat template must be verified).
2. Gemma 4 E2B Mobile/LiteRT-LM (Google comparison candidate).
3. Qwen 2B Instruct (quality-versus-memory comparison only after the first two).
4. No 4B model in the first implementation scope.

No model weights, runtime dependency, Android module, production code, main-branch change or deployment is included by this decision.


## 14. Confirmed phone software details

User-provided screenshot confirms:
- One UI: 8.0
- Android: 16
- Build identifiers shown: M336BUXXSGGZFE1 / M336BODM G GZB3 / M336BUXXSGGZB3 (retain exact screenshot transcription as build metadata only; verify directly on device if needed).

Still unconfirmed:
- Available internal storage.
- Exact physical RAM confirmation (6 GB is the selected conservative design baseline, not a screenshot-verified memory reading).
- Chrome version and WebGPU availability.

This Android 16 / One UI 8.0 confirmation is suitable to record for planning, but does not by itself establish LiteRT-LM runtime compatibility or inference performance on the device.


## 11. Confirmed target-device constraints and first implementation increment

**User-confirmed device budget (2026-11-18):**
- Physical RAM budget: **6 GB** (conservative design ceiling; do not count RAM Plus as physical memory).
- Android: **16**.
- One UI: **8.0**.
- Internal storage capacity: **128 GB**.
- Free internal storage: **10 GB**.

This is sufficient to begin a controlled small-model evaluation, but it is not evidence that any particular model will fit in available runtime memory. Reserve storage for Android, the PWA, user PDFs, OCR assets, and model cache. Do not start with a 4B model. Compare small instruction-tuned Qwen and Gemma candidates using measured peak RAM, load time, token latency, thermal behavior and offline operation. Model download must remain user-initiated and Wi-Fi-first.

**First code increment on this study branch:**
- Added `local-llm-runtime.js`, a provider-free adapter contract for a future native local runtime bridge.
- The adapter requires an explicit `executionMode: "local"` and `localOnly: true` capability declaration; it fails closed if the native bridge or model is absent.
- It validates bounded conversation messages and generation limits, and exposes status/load/unload/generate/cancel only.
- Added Node tests for missing runtime, remote runtime rejection, input validation, local generation, unload and cancellation.
- This is an interface and test scaffold only. It does **not** embed LiteRT-LM, download weights, create an Android project, or prove device inference.
- The adapter is loaded by the PWA shell and covered by CI syntax/test checks. No model weights are added to service-worker caches.

**Next implementation gate:** create the Android host and LiteRT-LM Kotlin bridge only after selecting and verifying an exact model artifact/runtime version. Do not expose a fake “AI ready” status in the PWA before the native bridge reports a real local model loaded.
