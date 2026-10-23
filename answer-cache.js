/* Optional exact-input answer cache. Entries remain on this device and expire after 24 hours. */
(function (root) {
  "use strict";
  const STORAGE_KEY = "maintenance-ai-toolkit-ai-answer-cache-v1";
  const TTL_MS = 24 * 60 * 60 * 1000;
  const MAX_ENTRIES = 20;

  function readEntries(storage) {
    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(item =>
        item && typeof item.signature === "string" &&
        Number.isFinite(item.savedAt) && item.result && typeof item.result.answer === "string"
      ) : [];
    } catch {
      return [];
    }
  }

  async function fingerprint(payload, cryptoProvider, Encoder) {
    if (!cryptoProvider || !cryptoProvider.subtle || typeof Encoder !== "function") return null;
    const exactInput = JSON.stringify([
      payload.machine, payload.symptom, payload.code || "", payload.observations || "",
      payload.measurementStatus || "unknown", payload.language || "ar"
    ]);
    try {
      const digest = await cryptoProvider.subtle.digest("SHA-256", new Encoder().encode(exactInput));
      return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    } catch {
      return null;
    }
  }

  function cacheable(result) {
    return !!result &&
      typeof result.answer === "string" && result.answer.trim().length > 0 &&
      !result.safety_gate &&
      result.diagnosis && result.diagnosis.status === "preliminary_assessment" &&
      result.diagnosis.escalation && result.diagnosis.escalation.required !== true &&
      result.retrieval && Number(result.retrieval.matchedChunks) > 0;
  }

  function create(options = {}) {
    let defaultStorage = null;
    let defaultCrypto = null;
    try { defaultStorage = root.localStorage; } catch {}
    try { defaultCrypto = root.crypto; } catch {}
    const storage = options.storage || defaultStorage;
    const cryptoProvider = options.crypto || defaultCrypto;
    const Encoder = options.TextEncoder || root.TextEncoder;
    const now = typeof options.now === "function" ? options.now : () => Date.now();

    async function get(payload) {
      const signature = await fingerprint(payload, cryptoProvider, Encoder);
      if (!signature || !storage) return null;
      try {
        const cutoff = now() - TTL_MS;
        const all = readEntries(storage);
        const valid = all.filter(item => item.savedAt >= cutoff && item.savedAt <= now());
        if (valid.length !== all.length) storage.setItem(STORAGE_KEY, JSON.stringify(valid));
        const match = valid.find(item => item.signature === signature);
        return match ? match.result : null;
      } catch {
        return null;
      }
    }

    async function set(payload, result) {
      if (!storage || !cacheable(result)) return false;
      const signature = await fingerprint(payload, cryptoProvider, Encoder);
      if (!signature) return false;
      try {
        const cutoff = now() - TTL_MS;
        const entries = readEntries(storage).filter(item => item.savedAt >= cutoff && item.savedAt <= now() && item.signature !== signature);
        entries.push({ signature, savedAt: now(), result });
        storage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
        return true;
      } catch {
        return false;
      }
    }

    function clear() {
      try {
        if (storage) storage.removeItem(STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    }

    return { get, set, clear, cacheable };
  }

  root.MaintenanceAnswerCache = create();
  root.MaintenanceAnswerCache.create = create;

  function initClearControl() {
    const button = root.document && root.document.getElementById("clearAiAnswerCache");
    const status = root.document && root.document.getElementById("aiCacheStatus");
    if (!button || !status) return;
    button.addEventListener("click", () => {
      const cleared = root.MaintenanceAnswerCache.clear();
      const i18n = root.MaintenanceI18n;
      status.textContent = cleared
        ? (i18n && i18n.t ? i18n.t("aiCacheCleared") : "Locally saved answers cleared.")
        : (i18n && i18n.t ? i18n.t("aiCacheClearFailed") : "Could not clear local answer cache.");
    });
  }
  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", initClearControl);
    else initClearControl();
  }
})(window);
