# Maintenance Local Model Host (POC)

This is a separate Android proof-of-concept module for testing the exact Qwen
LiteRT-LM CPU artifact on the target phone before wiring inference into the PWA.

## Scope

- User selects an existing `.litertlm` file through Android's Storage Access Framework.
- The app copies it to app-private storage; no network download is performed.
- LiteRT-LM runs on CPU only.
- The model is loaded off the UI thread and released when the activity is destroyed.
- The prompt/response test is local. No API key, Worker, Gemini, OpenAI, or cloud fallback exists.

This is a runtime smoke-test shell, **not yet the Maintenance AI Toolkit chat integration**.
It intentionally does not execute diagnostic tools or modify the existing PWA.

## Build

Open `android-local-host/` in Android Studio with JDK 17 and Android SDK 36,
or run:

```bash
gradle :app:assembleDebug
```

The module pins the published Google Maven Android artifact LiteRT-LM 0.19.1. The selected Qwen3.5-0.8B CPU artifact is documented for LiteRT-LM 0.19.x and was also checked on earlier desktop runtimes. This exact Android + CPU combination still requires a physical-device smoke test; the model card's 0.19.2 recommendation refers to the newer upstream runtime release, which was not resolvable as an Android Maven artifact in the initial CI build.

## Device test

1. Build and install the debug APK.
2. Select the existing `Qwen3.5-0.8B_int8.litertlm` file from Downloads.
3. Wait for the copy to finish (the source file is not deleted).
4. Load model; verify that the UI reports CPU / local.
5. Run the short Arabic valve test, then the pump diagnostic case.
6. Record load time, first-token/complete-response time, device temperature,
   battery impact, crashes, and whether airplane mode remains enabled.
7. Repeat after closing and reopening the app.

The file is copied into app-private storage because LiteRT-LM requires a filesystem
path. Ensure at least the model size plus temporary copy space is available.

## Known limits

- This POC uses a simple synchronous response call on a dedicated single-thread
  executor; it does not yet provide token streaming or cancellation.
- It uses one Engine/Conversation for this single test session and closes both
  on activity destruction. A future chat integration must create a fresh Engine
  per assistant session unless a later pinned LiteRT-LM release is verified to
  resolve the Qwen recurrent-state reuse issue.
- No WebView bridge, PWA chat wiring, tool calling, PDF retrieval, or diagnostic
  orchestration is included yet.
- The POC build and physical-device inference must both pass before integration.
