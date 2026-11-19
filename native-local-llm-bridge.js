(function (root) {
  "use strict";
  const host = root.MaintenanceAndroidHost;
  if (!host || typeof host.invoke !== "function") return;

  const REQUEST_TIMEOUT_MS = 300000;
  let sequence = 0;
  const pending = new Map();

  function settle(id, result, error) {
    const item = pending.get(id);
    if (!item) return;
    pending.delete(id);
    if (item.timer !== null && typeof root.clearTimeout === "function") {
      root.clearTimeout(item.timer);
    }
    if (error) item.reject(error);
    else item.resolve(result);
  }

  function call(method, payload) {
    return new Promise((resolve, reject) => {
      const id = "native-" + (++sequence).toString(36);
      const timer = typeof root.setTimeout === "function"
        ? root.setTimeout(() => {
            const error = new Error("native_request_timeout");
            error.code = "native_request_timeout";
            settle(id, null, error);
          }, REQUEST_TIMEOUT_MS)
        : null;
      pending.set(id, { resolve, reject, timer });
      try {
        host.invoke(method, JSON.stringify(payload || {}), id);
      } catch (error) {
        settle(id, null, error);
      }
    });
  }

  root.__MaintenanceNativeLLMResolve = function (id, serialized) {
    const item = pending.get(id);
    if (!item) return;
    let result;
    try {
      result = JSON.parse(serialized);
    } catch (_) {
      const error = new Error("invalid_native_response");
      error.code = "invalid_native_response";
      settle(id, null, error);
      return;
    }
    if (!result || result.ok !== true) {
      const error = new Error(result && result.error || "native_local_runtime_failed");
      error.code = result && result.error || "native_local_runtime_failed";
      settle(id, null, error);
    } else settle(id, result, null);
  };

  function parseHostJson(method) {
    try {
      const value = JSON.parse(host[method]());
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("invalid_native_" + method + "_response");
      }
      return value;
    } catch (_) {
      const error = new Error("invalid_native_" + method + "_response");
      error.code = "invalid_native_" + method + "_response";
      throw error;
    }
  }

  root.MaintenanceNativeLLM = Object.freeze({
    getCapabilities: async () => parseHostJson("getCapabilities"),
    getStatus: async () => parseHostJson("getStatus"),
    pickModel: () => call("pickModel", {}),
    loadModel: args => call("loadModel", args),
    unloadModel: () => call("unloadModel", {}),
    generate: args => call("generate", args)
  });

  if (typeof root.addEventListener === "function") {
    root.addEventListener("pagehide", () => {
      for (const [id] of pending) {
        const error = new Error("native_page_closed");
        error.code = "native_page_closed";
        settle(id, null, error);
      }
    }, { once: true });
  }
})(window);
