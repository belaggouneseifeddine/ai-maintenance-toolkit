/* Local-only LLM runtime adapter.
 * The web app never downloads models, calls hosted inference, or falls back to a provider.
 * A native Android host may inject window.MaintenanceNativeLLM with this narrow contract.
 */
(function (root) {
  "use strict";

  const VERSION = "0.1.0";
  const MAX_MESSAGES = 48;
  const MAX_MESSAGE_CHARS = 6000;
  const MAX_OUTPUT_TOKENS = 768;
  const ROLES = new Set(["system", "user", "assistant", "tool"]);

  function fail(code) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }

  function validateMessages(messages) {
    if (!Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES) {
      fail("invalid_messages");
    }
    return messages.map(message => {
      if (!message || !ROLES.has(message.role) ||
          typeof message.content !== "string" ||
          !message.content.trim() ||
          message.content.length > MAX_MESSAGE_CHARS) {
        fail("invalid_message");
      }
      return { role: message.role, content: message.content };
    });
  }

  function createLocalLlmRuntime(options) {
    const config = options || {};
    const bridge = Object.prototype.hasOwnProperty.call(config, "bridge")
      ? config.bridge : root.MaintenanceNativeLLM;
    let loadedModelId = null;
    let generationActive = false;

    function available() {
      return !!bridge && typeof bridge === "object";
    }

    async function invoke(method, args) {
      if (!available() || typeof bridge[method] !== "function") {
        fail("local_runtime_unavailable");
      }
      return bridge[method](args || {});
    }

    async function getCapabilities() {
      if (!available() || typeof bridge.getCapabilities !== "function") {
        return {
          available: false,
          executionMode: "unavailable",
          localOnly: true,
          reason: "native_local_runtime_not_installed"
        };
      }
      const result = await invoke("getCapabilities");
      if (!result || result.executionMode !== "local" || result.localOnly !== true) {
        return {
          available: false,
          executionMode: "rejected",
          localOnly: true,
          reason: "runtime_must_explicitly_confirm_local_execution"
        };
      }
      return {
        available: true,
        executionMode: "local",
        localOnly: true,
        runtime: typeof result.runtime === "string" ? result.runtime.slice(0, 80) : "native",
        supportedOperations: Array.isArray(result.supportedOperations)
          ? result.supportedOperations.filter(value =>
              ["status", "load", "unload", "generate", "cancel"].includes(value))
          : []
      };
    }

    async function getStatus() {
      const capabilities = await getCapabilities();
      if (!capabilities.available) {
        return { ...capabilities, modelLoaded: false, modelId: null };
      }
      const status = typeof bridge.getStatus === "function"
        ? await invoke("getStatus") : {};
      const modelId = typeof status.modelId === "string" ? status.modelId.slice(0, 120) : null;
      loadedModelId = status.modelLoaded === true ? modelId : null;
      return {
        ...capabilities,
        modelLoaded: status.modelLoaded === true && !!modelId,
        modelId: status.modelLoaded === true ? modelId : null,
        busy: status.busy === true,
        backend: typeof status.backend === "string" ? status.backend.slice(0, 40) : "unknown"
      };
    }

    async function loadModel(modelId, options) {
      if (typeof modelId !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,119}$/.test(modelId)) {
        fail("invalid_model_id");
      }
      const capabilities = await getCapabilities();
      if (!capabilities.available) fail("local_runtime_unavailable");
      if (typeof bridge.loadModel !== "function") fail("model_loading_unsupported");
      const result = await invoke("loadModel", {
        modelId,
        options: options && typeof options === "object" ? options : {}
      });
      if (!result || result.ok !== true || result.executionMode !== "local") {
        fail("local_model_load_failed");
      }
      loadedModelId = modelId;
      return { ok: true, modelId, executionMode: "local" };
    }

    async function unloadModel() {
      if (!available() || typeof bridge.unloadModel !== "function") {
        loadedModelId = null;
        return { ok: false, status: "unsupported" };
      }
      const result = await invoke("unloadModel");
      loadedModelId = null;
      return { ok: !!(result && result.ok === true), status: "unloaded" };
    }

    async function generate(input) {
      if (generationActive) fail("generation_already_active");
      const request = input || {};
      const messages = validateMessages(request.messages);
      const status = await getStatus();
      if (!status.available) fail("local_runtime_unavailable");
      if (!status.modelLoaded || !status.modelId) fail("local_model_not_loaded");
      if (typeof bridge.generate !== "function") fail("generation_unsupported");
      const requestedTokens = Number(request.maxOutputTokens);
      const maxOutputTokens = Number.isFinite(requestedTokens)
        ? Math.max(1, Math.min(MAX_OUTPUT_TOKENS, Math.floor(requestedTokens)))
        : 384;
      generationActive = true;
      try {
        const result = await invoke("generate", {
          messages,
          modelId: status.modelId,
          maxOutputTokens,
          temperature: Number.isFinite(Number(request.temperature))
            ? Math.max(0, Math.min(1, Number(request.temperature))) : 0.2
        });
        if (!result || result.executionMode !== "local" ||
            typeof result.text !== "string" || !result.text.trim()) {
          fail("invalid_local_generation_result");
        }
        return {
          ok: true,
          text: result.text.slice(0, 16000),
          executionMode: "local",
          modelId: status.modelId,
          finishReason: typeof result.finishReason === "string"
            ? result.finishReason.slice(0, 40) : "unknown"
        };
      } finally {
        generationActive = false;
      }
    }

    async function cancel() {
      if (!available() || typeof bridge.cancel !== "function") {
        return { ok: false, status: "unsupported" };
      }
      const result = await invoke("cancel");
      return { ok: !!(result && result.ok === true) };
    }

    return Object.freeze({
      version: VERSION,
      mode: "local-only",
      getCapabilities,
      getStatus,
      loadModel,
      unloadModel,
      generate,
      cancel
    });
  }

  const api = Object.freeze({ version: VERSION, createLocalLlmRuntime });
  root.MaintenanceLocalLlmRuntime = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
