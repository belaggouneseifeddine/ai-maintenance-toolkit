const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("native-local-llm-bridge.js", "utf8");

test("native bridge exposes only the bounded local model operations", async () => {
  const calls = [];
  const window = {};
  const host = {
    getCapabilities: () => JSON.stringify({executionMode:"local",localOnly:true}),
    getStatus: () => JSON.stringify({modelLoaded:true,modelId:"qwen3.5-0.8b-int8-cpu",backend:"CPU"}),
    invoke(method, payload, id) {
      calls.push({method,payload:JSON.parse(payload)});
      window.__MaintenanceNativeLLMResolve(id, JSON.stringify({
        ok:true, executionMode:"local", modelId:"qwen3.5-0.8b-int8-cpu",
        text:"local answer"
      }));
    }
  };
  window.MaintenanceAndroidHost = host;
  vm.runInNewContext(source, {window, Promise, Map, JSON, Error});
  const api = window.MaintenanceNativeLLM;
  assert.deepEqual(Object.keys(api).sort(), [
    "generate","getCapabilities","getStatus","loadModel","pickModel","unloadModel"
  ].sort());
  assert.equal((await api.getCapabilities()).localOnly, true);
  assert.equal((await api.getStatus()).backend, "CPU");
  assert.equal((await api.pickModel()).ok, true);
  assert.equal((await api.loadModel({modelId:"qwen3.5-0.8b-int8-cpu"})).ok, true);
  assert.equal((await api.generate({messages:[{role:"user",content:"test"}]})).text, "local answer");
  assert.equal((await api.unloadModel()).ok, true);
  assert.deepEqual(calls.map(call => call.method), ["pickModel","loadModel","generate","unloadModel"]);
});

test("native bridge rejects failed host responses without disguising them as success", async () => {
  const window = {};
  window.MaintenanceAndroidHost = {
    getCapabilities: () => JSON.stringify({executionMode:"local",localOnly:true}),
    getStatus: () => JSON.stringify({modelLoaded:false}),
    invoke(method, payload, id) {
      window.__MaintenanceNativeLLMResolve(id, JSON.stringify({ok:false,error:"local_model_not_loaded"}));
    }
  };
  vm.runInNewContext(source, {window, Promise, Map, JSON, Error});
  await assert.rejects(window.MaintenanceNativeLLM.generate({messages:[{role:"user",content:"test"}]}),
    error => error.code === "local_model_not_loaded");
});

test("native bridge is inert outside the trusted Android WebView host", () => {
  const window = {};
  vm.runInNewContext(source, {window, Promise, Map, JSON, Error});
  assert.equal(window.MaintenanceNativeLLM, undefined);
});
