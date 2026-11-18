const test = require("node:test");
const assert = require("node:assert/strict");
const Runtime = require("../local-llm-runtime.js");

function fakeBridge(overrides) {
  let loaded = false;
  const calls = [];
  const bridge = {
    getCapabilities: async () => ({
      executionMode: "local", localOnly: true, runtime: "fake-litert",
      supportedOperations: ["status", "load", "unload", "generate", "cancel"]
    }),
    getStatus: async () => ({ modelLoaded: loaded, modelId: loaded ? "qwen-small" : null, backend: "cpu" }),
    loadModel: async ({ modelId }) => { calls.push(["load", modelId]); loaded = true; return { ok: true, executionMode: "local" }; },
    unloadModel: async () => { loaded = false; return { ok: true }; },
    generate: async input => { calls.push(["generate", input]); return { executionMode: "local", text: "Local answer", finishReason: "stop" }; },
    cancel: async () => ({ ok: true }),
    ...overrides
  };
  return { bridge, calls };
}

test("runtime fails closed when no native local runtime exists", async () => {
  const runtime = Runtime.createLocalLlmRuntime({ bridge: null });
  assert.equal(runtime.mode, "local-only");
  assert.equal((await runtime.getCapabilities()).available, false);
  await assert.rejects(runtime.generate({ messages: [{ role: "user", content: "hello" }] }),
    error => error.code === "local_runtime_unavailable");
});

test("runtime rejects a bridge that does not explicitly guarantee local inference", async () => {
  const runtime = Runtime.createLocalLlmRuntime({
    bridge: { getCapabilities: async () => ({ executionMode: "remote", localOnly: false }) }
  });
  assert.equal((await runtime.getCapabilities()).available, false);
  await assert.rejects(runtime.loadModel("qwen-small"),
    error => error.code === "local_runtime_unavailable");
});

test("runtime loads and generates only through the local bridge", async () => {
  const fake = fakeBridge();
  const runtime = Runtime.createLocalLlmRuntime({ bridge: fake.bridge });
  assert.equal((await runtime.loadModel("qwen-small")).executionMode, "local");
  const result = await runtime.generate({
    messages: [{ role: "user", content: "اشرح سبب انخفاض التدفق" }],
    maxOutputTokens: 1200,
    temperature: 1.5
  });
  assert.equal(result.text, "Local answer");
  assert.equal(result.executionMode, "local");
  const request = fake.calls.find(call => call[0] === "generate")[1];
  assert.equal(request.maxOutputTokens, 768);
  assert.equal(request.temperature, 1);
  assert.equal(request.modelId, "qwen-small");
});

test("runtime validates messages and rejects empty or malformed prompts", async () => {
  const fake = fakeBridge();
  const runtime = Runtime.createLocalLlmRuntime({ bridge: fake.bridge });
  await runtime.loadModel("qwen-small");
  await assert.rejects(runtime.generate({ messages: [] }),
    error => error.code === "invalid_messages");
  await assert.rejects(runtime.generate({ messages: [{ role: "system", content: "" }] }),
    error => error.code === "invalid_message");
  await assert.rejects(runtime.generate({ messages: [{ role: "developer", content: "bad role" }] }),
    error => error.code === "invalid_message");
});

test("runtime refuses to claim a model is loaded until native status confirms it", async () => {
  const fake = fakeBridge({ getStatus: async () => ({ modelLoaded: false }) });
  const runtime = Runtime.createLocalLlmRuntime({ bridge: fake.bridge });
  await assert.rejects(runtime.generate({ messages: [{ role: "user", content: "test" }] }),
    error => error.code === "local_model_not_loaded");
});

test("runtime unloads and cancels without introducing a provider fallback", async () => {
  const fake = fakeBridge();
  const runtime = Runtime.createLocalLlmRuntime({ bridge: fake.bridge });
  await runtime.loadModel("qwen-small");
  assert.deepEqual(await runtime.cancel(), { ok: true });
  assert.deepEqual(await runtime.unloadModel(), { ok: true, status: "unloaded" });
  assert.equal((await runtime.getStatus()).modelLoaded, false);
});
