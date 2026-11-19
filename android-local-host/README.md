# Maintenance AI Toolkit — Android local assistant host

This Android app packages the existing Maintenance AI Toolkit PWA as local WebView assets and connects it to on-device Qwen inference through LiteRT-LM. It uses application ID `com.maintenanceaitoolkit.localassistant`, separate from the earlier model-test POC, so both apps can remain installed side by side.

## Local-first behavior

- The APK contains an explicit allow-list of PWA entrypoints, runtime modules, and required local knowledge/data files. Gradle uses a Sync task to remove stale generated assets and copy only those files into `app/src/main/assets/www`.
- WebView serves those assets through AndroidX WebKit's `WebViewAssetLoader` on the secure `appassets.androidplatform.net` origin.
- The manifest deliberately does **not** request `INTERNET`. No hosted LLM, Worker, Gemini, OpenAI API, remote inference, or cloud fallback is used by this host.
- The user imports a `.litertlm` file through Android's document picker. The source file is not deleted; a private app copy is created.
- The native bridge exposes a narrow allow-list: capability/status, model pick/load/unload, and generation. It does not expose filesystem, shell, arbitrary URLs, or code execution.
- The PWA's local assistant agent remains responsible for constrained JSON actions and allow-listed local tools. Tool execution and validation remain in JavaScript.

## First model

Expected artifact: `Qwen3.5-0.8B_int8.litertlm` (CPU, approximately 965 MB).

Model ID used by the app: `qwen3.5-0.8b-int8-cpu`.

The host pins `com.google.ai.edge.litertlm:litertlm-android:0.19.1`. The exact artifact/runtime/device combination launched and generated on the Android phone in the standalone POC. The integrated WebView host now builds successfully; it still requires a second physical-device test because the native bridge and PWA integration are new.

## Runtime isolation

The Qwen model card documents recurrent-state leakage when multiple conversations reuse one Engine on LiteRT-LM releases through 0.19.1. To avoid sharing recurrent state across independent generation calls, this host creates a fresh Engine and Conversation for each generation request and closes both after completion. This is conservative and may increase first-token latency; measure it on the target phone before optimizing.

## Build

Open `android-local-host/` in Android Studio (JDK 17, Android SDK 36), or run:

```bash
gradle :app:assembleDebug --no-daemon
```

The build runs `syncMaintenanceWebAssets` and `vendorDocumentRuntime` before Android compilation. The Android build vendors pinned PDF.js/Tesseract runtime code and Arabic, English and French OCR data, but deliberately skips the unused Transformers.js embedding runtime. PDF text extraction, OCR, local BM25 retrieval and page citations are available offline. Multilingual embedding weights are **not** bundled; Android disables remote model downloads, so semantic-vector search remains unavailable until a compatible local embedding model is packaged. Do not commit generated `app/src/main/assets/www` output.

## Device acceptance checks

1. Install the new integration APK.
2. Confirm the Maintenance AI Toolkit PWA opens inside the Android host.
3. Import the existing Qwen CPU `.litertlm` file and load it.
4. Confirm status reports local / CPU / ready.
5. Run one Arabic valve question and one pump case.
6. Verify the model can call the local diagnostic and reviewed-document tools; reject unknown tool names and malformed JSON.
7. Enable airplane mode and repeat generation and local document retrieval.
8. Reopen the app and confirm the model file remains available in app-private storage.
9. Record load time, first-token latency, total generation time, memory pressure, temperature, battery use, and crash/ANR behavior.

## Known limits

- The native host streams generation chunks through LiteRT-LM callbacks and displays partial output in the chat UI; the final response is assembled when generation completes.
- The first WebView bridge build is an integration prototype. Do not merge it until the current APK passes physical-device and airplane-mode tests, and the diagnostic/security regression suite remains green. CI build and source tests have passed, but they do not prove device performance or model quality.
- The small Qwen model is the primary local generator, not an authority for engineering facts. Local deterministic tools, reviewed PDF evidence, source/page references, and technician verification remain authoritative.
