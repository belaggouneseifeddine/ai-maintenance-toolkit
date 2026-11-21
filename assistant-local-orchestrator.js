/* Local-first assistant turn orchestrator.
 * Coordinates the versioned session contract and allow-listed local tools.
 * It does not parse natural language, load a model, access the network, or persist data.
 */
(function (root) {
  "use strict";
  const VERSION = "0.1.0";

  function createLocalOrchestrator(options) {
    const config = options || {};
    const Session = config.sessionContract || root.MaintenanceAssistantSession;
    const Registry = config.toolRegistry || root.MaintenanceAssistantToolRegistry;
    if (!Session || typeof Session.createSession !== "function" ||
        !Registry || typeof Registry.createToolRegistry !== "function") {
      throw new TypeError("assistant_dependencies_unavailable");
    }
    const registry = config.registry || Registry.createToolRegistry({
      tools: config.tools || {},
      safetyGate: config.safetyGate,
      timeoutMs: config.timeoutMs
    });
    let current = null;
    let sequence = 0;

    function snapshot() { return current ? JSON.parse(JSON.stringify(current)) : null; }

    function nextId(prefix) {
      sequence += 1;
      return prefix + "-" + Date.now().toString(36) + "-" + sequence.toString(36);
    }
    function start(input) {
      current = Session.createSession(input || {});
      return snapshot();
    }
    function restore(sessionSnapshot) {
      const migrated = typeof Session.migrateSession === "function"
        ? Session.migrateSession(sessionSnapshot)
        : JSON.parse(JSON.stringify(sessionSnapshot));
      const validation = Session.validateSession(migrated);
      if (!validation || validation.ok !== true) throw new TypeError("assistant_session_snapshot_invalid");
      current = JSON.parse(JSON.stringify(migrated));
      sequence = Math.max(sequence, current.messages.length + current.toolEvents.length + current.facts.length);
      return snapshot();
    }
    function requireSession() {
      if (!current) throw new Error("assistant_session_not_started");
      const validation = Session.validateSession(current);
      if (!validation.ok) throw new Error("assistant_session_invalid");
    }
    function updateEquipment(input) {
      requireSession();
      if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError("invalid_equipment_context");
      }
      const allowed = ["type", "manufacturer", "model", "assetId"];
      for (const key of Object.keys(input)) {
        if (!allowed.includes(key) || typeof input[key] !== "string" || input[key].length > 120) {
          throw new TypeError("invalid_equipment_context_field");
        }
      }
      const next = JSON.parse(JSON.stringify(current));
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(input, key)) next.equipment[key] = input[key].trim();
      }
      next.updatedAt = new Date().toISOString();
      const validation = Session.validateSession(next);
      if (!validation.ok) throw new TypeError("assistant_session_invalid");
      current = next;
      return snapshot();
    }
    function addMessage(role, content, messageId) {
      requireSession();
      current = Session.appendMessage(current, {
        messageId: messageId || nextId("msg"),
        role,
        content: String(content || "")
      });
      return snapshot();
    }
    function addFact(fact) {
      requireSession();
      current = Session.recordFact(current, fact || {});
      return snapshot();
    }
    async function invokeTool(name, input, extraContext) {
      requireSession();
      const result = await registry.call(name, input, {
        sessionId: current.sessionId,
        language: current.language,
        equipment: current.equipment,
        ...(extraContext && typeof extraContext === "object" ? extraContext : {})
      });
      const eventStatus = result.status === "completed" ? "completed"
        : result.status === "blocked" ? "blocked"
        : result.status === "timed_out" ? "timed_out" : "failed";
      current = Session.appendToolEvent(current, {
        eventId: nextId("evt"),
        toolName: /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,99}$/.test(String(name || "")) ? String(name) : "invalid_tool",
        status: eventStatus,
        summary: result.ok ? "Local tool completed." : String(result.error || result.status || "Local tool failed.")
      });
      return result;
    }
    async function processTurn(input) {
      requireSession();
      const turn = input || {};
      if (typeof turn.message !== "string" || !turn.message.trim()) {
        return { ok: false, status: "invalid_turn", error: "message_required", session: current };
      }
      addMessage("user", turn.message, turn.messageId);
      const requests = Array.isArray(turn.toolCalls) ? turn.toolCalls.slice(0, 5) : [];
      const results = [];
      for (const request of requests) {
        const call = request || {};
        const name = String(call.name || "");
        const result = await invokeTool(name, call.input);
        results.push({ name, ...result });
      }
      if (typeof turn.assistantMessage === "string" && turn.assistantMessage.trim()) {
        addMessage("assistant", turn.assistantMessage);
      }
      return {
        ok: true,
        status: results.some(item => item.status === "blocked") ? "safety_blocked" : "completed",
        results,
        session: snapshot()
      };
    }
    return Object.freeze({
      version: VERSION,
      start,
      restore,
      getSession: snapshot,
      updateEquipment,
      addMessage,
      addFact,
      invokeTool,
      processTurn,
      availableTools: () => registry.list()
    });
  }

  const api = Object.freeze({ version: VERSION, createLocalOrchestrator });
  root.MaintenanceLocalAssistantOrchestrator = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
