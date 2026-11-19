# Local Qwen adoption and Android integration — 2026-11-19

## Decision

Adopt `litert-community/Qwen3.5-0.8B` CPU artifact as the first operational local generative model for Maintenance AI Toolkit. Pin the Android runtime to LiteRT-LM 0.19.1 for this integration increment. No cloud LLM provider or hosted inference fallback is part of the Android host.

## Integration path

1. Package the existing PWA as Android WebView assets using Gradle's `syncMaintenanceWebAssets` task.
2. Serve the app from AndroidX WebKit `WebViewAssetLoader` under a secure app-assets origin.
3. Keep Android manifest free of the INTERNET permission.
4. Expose only a narrow JavaScript bridge for model capabilities/status, import, load/unload, and generation.
5. Use the existing `local-llm-runtime.js` adapter.
6. Add a technician-facing Qwen panel in the AI workspace.
7. Connect `assistant-model-agent.js` to the existing local orchestrator and allow-listed local tools.
8. Keep diagnostic engine, Bayesian ranking, reviewed PDF retrieval, maintenance records, and safety notices as deterministic/local components.

## Trust boundaries

- Model output is untrusted data.
- The model may propose one allow-listed tool call in strict JSON; JavaScript validates the action and invokes the existing registry.
- No generated JavaScript, shell, filesystem path, URL, or arbitrary native method is executable.
- Retrieved PDF content and user text are data, not instructions.
- The model cannot approve knowledge claims, alter source trust, invent page references, or mark a hypothesis as verified.
- Safety warnings remain advisory as selected by the user. Tool input validation and the allow-list remain enforced.
- No raw hidden reasoning is persisted.

## Qwen runtime lifecycle

The Qwen3.5-0.8B model card documents recurrent-state leakage when separate conversations reuse one Engine on LiteRT-LM versions through 0.19.1. This integration therefore creates a fresh Engine and Conversation for each generation request and closes both after completion. This is intentionally conservative. Benchmark latency and memory on the target 6 GB RAM phone; optimize only after confirming a safe lifecycle.

## Known integration limitations

- The native bridge currently resolves each generation as a complete response. UI token streaming and cancellation are not yet connected.
- Model import is explicit and copies the selected file into app-private storage.
- The APK includes the PWA assets but no model weights; the user imports the existing 965 MB CPU artifact.
- The existing browser PWA remains usable without a native model, with deterministic local diagnostic features. The native Qwen panel is available only in the Android host.
- The hosted-provider controls are hidden in this branch; the Android APK itself has no INTERNET permission.

## Acceptance gates before merge

- Android CI build succeeds.
- New APK launches the packaged PWA.
- Qwen import and load work after app restart.
- Arabic/French/English prompt handling and structured JSON action parsing are measured.
- Local diagnostic and reviewed-PDF tools execute through the existing allow-list only.
- Malformed JSON, unknown tool names, oversized context, repeated requests, and model failures fail closed.
- Airplane-mode tests pass.
- Memory, thermal, battery, load, and generation latency are recorded on the target phone.
- No main-branch merge or production deployment is performed by this branch.
