/* Allow-listed local tool registry for the Maintenance Assistant.
 * Tools are injected local functions; this module performs no network access.
 */
(function (root) {
  "use strict";
  const VERSION = "1.1.0";
  const MAX_OUTPUT_CHARS = 12000;
  const ALLOWED = new Set([
    "diagnose", "rankNextDiagnosticTests", "searchReviewedDocuments", "getEquipmentContext",
    "getMaintenanceHistory", "getPreventiveMaintenanceSchedule", "createShiftHandoverDraft", "getSafetyChecklistStatus", "checkSafety", "createDraftReport"
  ]);

  function bounded(value) {
    let serialized;
    try { serialized = JSON.stringify(value); } catch (_) { return { ok: false, error: "unserializable_tool_output" }; }
    if (typeof serialized !== "string" || serialized.length > MAX_OUTPUT_CHARS) {
      return { ok: false, error: "tool_output_too_large" };
    }
    return { ok: true, value: JSON.parse(serialized) };
  }
  function createToolRegistry(options) {
    const config = options || {};
    const tools = config.tools || {};
    const safetyGate = config.safetyGate;
    const timeoutValue = Number(config.timeoutMs);
    const timeoutMs = Number.isFinite(timeoutValue) && timeoutValue > 0
      ? Math.min(timeoutValue, 30000) : 12000;

    async function call(name, input, context) {
      if (!ALLOWED.has(name) || !tools[name] || typeof tools[name].execute !== "function") {
        return { ok: false, status: "unavailable", error: "tool_not_registered" };
      }
      const tool = tools[name];
      if (typeof tool.validate !== "function" || tool.validate(input) !== true) {
        return { ok: false, status: "invalid_input", error: "tool_input_rejected" };
      }
      let safetyNotice = null;
      if (tool.safetySensitive === true) {
        if (typeof safetyGate !== "function") {
          safetyNotice = {
            severity: "block",
            reason: "safety_gate_unavailable",
            message: "Safety-sensitive tool execution is blocked because the deterministic safety gate is unavailable."
          };
          return { ok: false, status: "blocked", error: "safety_gate_unavailable", safetyNotice };
        }
        let decision;
        try { decision = await safetyGate({ toolName: name, input, context: context || {} }); }
        catch (_) { decision = { allowed: false, reason: "safety_gate_failed" }; }
        if (!decision || decision.allowed !== true) {
          safetyNotice = {
            severity: "block",
            reason: decision && decision.reason ? String(decision.reason) : "safety_review_required",
            decision: decision || null,
            message: "Safety-sensitive tool execution is blocked until the deterministic safety gate allows it."
          };
          return { ok: false, status: "blocked", error: "safety_gate_denied", safetyNotice };
        }
      }
      let timer;
      let timedOut = false;
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
          timedOut = true;
          if (controller) controller.abort();
          reject(new Error("tool_timeout"));
        }, timeoutMs);
      });
      try {
        const result = await Promise.race([
          Promise.resolve().then(() => tool.execute(input, {
            context: context || {},
            signal: controller ? controller.signal : undefined,
            safetyNotice
          })),
          timeout
        ]);
        const checked = bounded(result);
        if (!checked.ok) return { ok: false, status: "failed", error: checked.error };
        return { ok: true, status: "completed", data: checked.value, safetyNotice };
      } catch (_) {
        return { ok: false, status: timedOut ? "timed_out" : "failed", error: timedOut ? "tool_timeout" : "tool_execution_failed" };
      } finally {
        clearTimeout(timer);
      }
    }
    return Object.freeze({
      version: VERSION,
      list: () => Object.keys(tools).filter(name => ALLOWED.has(name) && tools[name] && typeof tools[name].execute === "function").sort(),
      call
    });
  }
  const api = Object.freeze({ version: VERSION, createToolRegistry });
  root.MaintenanceAssistantToolRegistry = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
