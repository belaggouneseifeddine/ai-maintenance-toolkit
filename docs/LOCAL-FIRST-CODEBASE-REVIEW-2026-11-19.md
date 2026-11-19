# Local-first codebase review and cleanup — 2026-11-19

## Target architecture

The Android application is an offline host for the existing PWA. The local language model interprets the technician's request and selects from a small, explicit tool catalogue. It is not the source of truth for measurements, diagnostic calculations, source approval, or safety state.

~~~text
Android WebView (packaged PWA)
  ├─ Local assistant UI
  │    ├─ Case-context normalizer
  │    ├─ Local model agent (Qwen / LiteRT-LM)
  │    └─ Strict JSON tool-call loop
  ├─ Local orchestrator + allow-listed tool registry
  │    ├─ Deterministic diagnostic engine
  │    ├─ Reviewed PDF retrieval (approved, page-linked claims only)
  │    └─ Local maintenance history / PM records
  └─ Narrow Android bridge
       ├─ Import model through SAF
       ├─ Load / unload local model
       └─ Generate locally on CPU
~~~

The Android manifest has no INTERNET permission. The local host has no hosted-model fallback. The bridge exposes only bounded model operations; the model cannot execute arbitrary JavaScript, shell commands, or network requests.

## Changes in this cleanup branch

### Assistant context and tool contracts
- Added assistant-case-context.js as a pure, testable module. It has no DOM, storage, network, or model-runtime access.
- The assistant reads the most recently edited case form and normalizes equipment, manufacturer, model, symptom, alarm code, observations, and measurements.
- Measurement rows are parsed into the exact engineering-core.js contract: numeric value, unit, source type, timestamp, operating condition, sensor status, and quality flag.
- Unknown measurement provenance is retained as unknown with a warning; non-numeric and incomplete rows are not silently converted into measurements.
- Diagnostic input validation now matches the deterministic engine's limits and accepted measurement fields.
- The model catalogue does not expose expected-information-gain ranking as a tool yet. The current diagnostic result does not provide a validated candidate-test/likelihood package; exposing that tool now would invite invented inputs. Keep it internal until the diagnostic engine returns grounded candidate tests and approved likelihood sources.
- The assistant's legacy duplicate submit button and hosted-provider controls are hidden in the Android host. Hosted AI invocation also returns a local-only-disabled status if called from that host.
- The old diagnosis form can still provide case context to Qwen. The last-edited form wins, avoiding stale fields from the other form.

### Safety behavior
- The diagnostic safety checklist remains advisory. Incomplete checks or urgent priority no longer suppress local diagnostic hypotheses.
- A visible advisory notice is shown alongside the hypotheses. It does not claim that isolation was verified or authorize work.
- The tool registry's safety-sensitive path continues to execute local analysis with an advisory notice, matching the agreed application behavior.

### Android packaging
- Replaced broad repository copying with a Gradle Sync allow-list for the PWA entrypoint, runtime modules, required knowledge files, and local data.
- The sync removes stale generated assets before rebuilding.
- Android builds skip the unused Transformers.js embedding runtime. PDF.js and Tesseract OCR remain packaged; Arabic, English, and French OCR data are kept.
- The Android build no longer ships the broad repository tree, test files, CI scripts, provider/Worker source, research drafts, or unused embedding runtime.
- The vendor script now conditionally installs and packages Transformers.js only for builds that explicitly need semantic embeddings.
- Updated the service-worker cache version and deployment asset manifests for the new context module.

### Native bridge
- Added a bounded timeout for native bridge calls and explicit handling for malformed host status responses.
- Pending requests are rejected when the page is closed instead of being left unresolved indefinitely.
- The model UI no longer re-enables chat actions after a model import or new-session action until the runtime confirms a loaded model.

## Intentionally retained
- Cloudflare Worker/provider source and its tests remain in the repository. They are not part of the Android runtime package. They will not be deleted until the local route is fully validated and the owner explicitly decides to retire them.
- Static PWA optional cloud features remain available outside the local Android host; the Android host hides and disables those controls.
- The semantic-search source remains in the PWA for future local embedding support. Its model weights and Transformers runtime are not packaged in the current Android APK.

## Known limitations / next acceptance gates
1. The Android WebView APK must be installed and tested on the target phone after this cleanup build.
2. Verify airplane-mode operation for Qwen generation, PDF text extraction, OCR, local retrieval, and source-page opening.
3. Measure model load time, first-token latency, full response time, peak memory, thermal behavior, and repeated-session stability.
4. Test Qwen tool-call reliability with Arabic, French, and English cases, malformed JSON, tool errors, unknown equipment, contradictory readings, and prompt-injection text inside imported PDFs.
5. Semantic-vector search is not available in Android until a compatible embedding model is packaged locally and its licence/runtime compatibility is verified.
6. Expected-information-gain ranking is not exposed to Qwen until the diagnostic engine supplies grounded candidate tests and source-reviewed likelihoods.
7. Chat persistence across process restarts and native cancellation of long-running generation still need explicit acceptance tests.

## Verification policy
A passing CI build proves that the source compiles and the APK is assembled. It does not prove device compatibility, OCR correctness, model quality, offline behavior, or acceptable performance. No merge or deployment is part of this branch.
