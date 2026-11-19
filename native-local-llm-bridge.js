(function (root) {
  "use strict";
  const host = root.MaintenanceAndroidHost;
  if (!host || typeof host.invoke !== "function") return;
  let sequence = 0;
  const pending = new Map();
  function call(method, payload) {
    return new Promise((resolve, reject) => {
      const id = "native-" + (++sequence).toString(36);
      pending.set(id, { resolve, reject });
      try { host.invoke(method, JSON.stringify(payload || {}), id); }
      catch (error) { pending.delete(id); reject(error); }
    });
  }
  root.__MaintenanceNativeLLMResolve = function (id, serialized) {
    const item = pending.get(id);
    if (!item) return;
    pending.delete(id);
    let result;
    try { result = JSON.parse(serialized); }
    catch (_) { item.reject(new Error("invalid_native_response")); return; }
    if (!result || result.ok !== true) {
      const error = new Error(result && result.error || "native_local_runtime_failed");
      error.code = result && result.error || "native_local_runtime_failed";
      item.reject(error);
    } else item.resolve(result);
  };
  root.MaintenanceNativeLLM = Object.freeze({
    getCapabilities: async () => JSON.parse(host.getCapabilities()),
    getStatus: async () => JSON.parse(host.getStatus()),
    pickModel: () => call("pickModel", {}),
    loadModel: args => call("loadModel", args),
    unloadModel: () => call("unloadModel", {}),
    generate: args => call("generate", args),
    cancel: () => call("cancel", {})
  });
})(window);
