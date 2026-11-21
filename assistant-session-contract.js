/* Versioned local assistant conversation/session contract.
 * No DOM, network, model runtime, or persistence dependency.
 */
(function (root) {
  "use strict";
  const VERSION = "1.1.0";
  const MAX_MESSAGES = 200;
  const MAX_FACTS = 300;
  const MAX_EVENTS = 300;
  const MAX_TEXT = 4000;
  const ROLES = new Set(["system", "user", "assistant", "tool"]);
  const PROVENANCE = new Set([
    "user_reported", "measured", "document_claim", "case_history",
    "engine_inferred", "llm_suggested", "unknown"
  ]);
  const FACT_STATUS = new Set(["proposed", "accepted", "rejected", "unknown"]);

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function text(value, max) {
    return typeof value === "string" ? value.trim().slice(0, max || MAX_TEXT) : "";
  }
  function validId(value) {
    return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,99}$/.test(value);
  }
  function createSession(input) {
    const data = input || {};
    if (!validId(data.sessionId)) throw new TypeError("invalid_session_id");
    const now = new Date().toISOString();
    return {
      schemaVersion: VERSION,
      sessionId: data.sessionId,
      createdAt: text(data.createdAt, 40) || now,
      updatedAt: now,
      language: ["ar", "fr", "en"].includes(data.language) ? data.language : "ar",
      status: "active",
      equipment: {
        type: text(data.equipment && data.equipment.type, 120),
        manufacturer: text(data.equipment && data.equipment.manufacturer, 120),
        model: text(data.equipment && data.equipment.model, 120),
        assetId: text(data.equipment && data.equipment.assetId, 120)
      },
      operatingContext: {},
      symptoms: [],
      measurements: [],
      evidence: [],
      hypotheses: [],
      tests: [],
      references: [],
      repairOutcome: null,
      revision: 0,
      messages: [],
      facts: [],
      toolEvents: [],
      activeHypotheses: [],
      safetyState: { status: "not_assessed", unresolvedHazards: [] }
    };
  }
  function touch(session) {
    session.updatedAt = new Date().toISOString();
    session.revision = (Number.isSafeInteger(session.revision) && session.revision >= 0 ? session.revision : 0) + 1;
    return session;
  }
  function appendMessage(session, message) {
    const next = copy(session);
    const item = message || {};
    if (!ROLES.has(item.role) || !validId(item.messageId)) throw new TypeError("invalid_message");
    const content = text(item.content, MAX_TEXT);
    if (!content) throw new TypeError("empty_message");
    if (next.messages.some(existing => existing.messageId === item.messageId)) {
      throw new TypeError("duplicate_message_id");
    }
    if (next.messages.length >= MAX_MESSAGES) throw new RangeError("message_limit_reached");
    next.messages.push({
      messageId: item.messageId,
      role: item.role,
      content,
      createdAt: text(item.createdAt, 40) || new Date().toISOString(),
      provenance: item.role === "tool" ? "tool_result" : item.role
    });
    return touch(next);
  }
  function recordFact(session, fact) {
    const next = copy(session);
    const item = fact || {};
    if (!validId(item.factId)) throw new TypeError("invalid_fact_id");
    if (!PROVENANCE.has(item.provenance)) throw new TypeError("invalid_fact_provenance");
    const status = FACT_STATUS.has(item.status) ? item.status : "proposed";
    if (item.provenance === "llm_suggested" && status === "accepted") {
      throw new TypeError("llm_fact_requires_explicit_review");
    }
    const valueType = typeof item.value;
    if (!["string", "number", "boolean"].includes(valueType) ||
        (valueType === "number" && !Number.isFinite(item.value))) {
      throw new TypeError("invalid_fact_value");
    }
    let record = next.facts.find(entry => entry.factId === item.factId);
    if (!record) {
      if (next.facts.length >= MAX_FACTS) throw new RangeError("fact_limit_reached");
      record = { factId: item.factId, revisions: [] };
      next.facts.push(record);
    }
    if (record.revisions.length >= 50) throw new RangeError("fact_revision_limit_reached");
    record.revisions.push({
      value: item.value,
      unit: text(item.unit, 40),
      provenance: item.provenance,
      status,
      sourceRef: item.sourceRef && typeof item.sourceRef === "object" ? copy(item.sourceRef) : null,
      recordedAt: new Date().toISOString()
    });
    return touch(next);
  }
  function appendToolEvent(session, event) {
    const next = copy(session);
    const item = event || {};
    if (!validId(item.eventId) || !validId(item.toolName)) throw new TypeError("invalid_tool_event");
    if (!["completed", "blocked", "failed", "timed_out"].includes(item.status)) {
      throw new TypeError("invalid_tool_event_status");
    }
    if (next.toolEvents.some(existing => existing.eventId === item.eventId)) {
      throw new TypeError("duplicate_tool_event_id");
    }
    if (next.toolEvents.length >= MAX_EVENTS) throw new RangeError("tool_event_limit_reached");
    next.toolEvents.push({
      eventId: item.eventId,
      toolName: item.toolName,
      status: item.status,
      summary: text(item.summary, 1000),
      createdAt: text(item.createdAt, 40) || new Date().toISOString()
    });
    return touch(next);
  }
  function migrateSession(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new TypeError("invalid_session_snapshot");
    }
    const session = copy(input);
    if (session.schemaVersion === "1.0.0") {
      session.operatingContext = {};
      session.symptoms = [];
      session.measurements = [];
      session.evidence = [];
      session.hypotheses = Array.isArray(session.activeHypotheses) ? session.activeHypotheses : [];
      session.tests = [];
      session.references = [];
      session.repairOutcome = null;
      session.revision = 0;
      session.schemaVersion = VERSION;
    }
    if (session.schemaVersion !== VERSION) throw new TypeError("unsupported_schema_version");
    const collections = ["symptoms", "measurements", "evidence", "hypotheses", "tests", "references"];
    for (const key of collections) {
      if (!Array.isArray(session[key])) session[key] = [];
      if (session[key].length > MAX_FACTS) throw new RangeError("session_collection_limit_reached");
    }
    if (!session.operatingContext || typeof session.operatingContext !== "object" || Array.isArray(session.operatingContext)) {
      session.operatingContext = {};
    }
    if (!Number.isSafeInteger(session.revision) || session.revision < 0) session.revision = 0;
    if (!Object.prototype.hasOwnProperty.call(session, "repairOutcome")) session.repairOutcome = null;
    return session;
  }

  const DIAGNOSTIC_COLLECTIONS = new Set([
    "symptoms", "measurements", "evidence", "hypotheses", "tests", "references"
  ]);

  function appendDiagnosticRecord(session, collection, item) {
    if (!DIAGNOSTIC_COLLECTIONS.has(collection)) throw new TypeError("invalid_diagnostic_collection");
    const next = copy(session);
    const record = item && typeof item === "object" && !Array.isArray(item) ? copy(item) : null;
    if (!record || !validId(record.id)) throw new TypeError("invalid_diagnostic_record_id");
    if (!PROVENANCE.has(record.provenance)) {
      throw new TypeError("invalid_diagnostic_record_provenance");
    }
    // Provenance remains mandatory, but record status is controlled by the
    // diagnostic workflow and may be promoted after review or corroboration.
    // The generic fact API retains its stricter LLM acceptance rule.
    const entries = Array.isArray(next[collection]) ? next[collection] : [];
    if (entries.some(existing => existing && existing.id === record.id)) {
      throw new TypeError("duplicate_diagnostic_record_id");
    }
    if (entries.length >= MAX_FACTS) throw new RangeError("diagnostic_collection_limit_reached");
    if (JSON.stringify(record).length > 12000) throw new RangeError("diagnostic_record_too_large");
    entries.push(record);
    next[collection] = entries;
    return touch(next);
  }

  function updateOperatingContext(session, patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new TypeError("invalid_operating_context_patch");
    }
    const next = copy(session);
    const current = next.operatingContext && typeof next.operatingContext === "object" &&
      !Array.isArray(next.operatingContext) ? next.operatingContext : {};
    const merged = { ...current, ...copy(patch) };
    if (JSON.stringify(merged).length > 12000) throw new RangeError("operating_context_too_large");
    next.operatingContext = merged;
    return touch(next);
  }

  function validateSession(session) {
    const errors = [];
    if (!session || session.schemaVersion !== VERSION) errors.push("unsupported_schema_version");
    if (!session || !validId(session.sessionId)) errors.push("invalid_session_id");
    if (!session || !Array.isArray(session.messages) || session.messages.length > MAX_MESSAGES) errors.push("invalid_messages");
    if (!session || !Array.isArray(session.facts) || session.facts.length > MAX_FACTS) errors.push("invalid_facts");
    if (!session || !Array.isArray(session.toolEvents) || session.toolEvents.length > MAX_EVENTS) errors.push("invalid_tool_events");
    for (const key of ["symptoms", "measurements", "evidence", "hypotheses", "tests", "references"]) {
      if (!session || !Array.isArray(session[key]) || session[key].length > MAX_FACTS) errors.push("invalid_" + key);
    }
    if (!session || !Number.isSafeInteger(session.revision) || session.revision < 0) errors.push("invalid_revision");
    if (session && (!session.operatingContext || typeof session.operatingContext !== "object" || Array.isArray(session.operatingContext))) errors.push("invalid_operating_context");
    if (session && Array.isArray(session.messages)) {
      for (const message of session.messages) {
        if (!message || !ROLES.has(message.role) || !validId(message.messageId) ||
            typeof message.content !== "string" || message.content.length > MAX_TEXT) {
          errors.push("malformed_message");
          break;
        }
      }
    }
    return { ok: errors.length === 0, errors };
  }

  const api = Object.freeze({
    version: VERSION, createSession, migrateSession, appendMessage, recordFact, appendToolEvent, appendDiagnosticRecord, updateOperatingContext, validateSession
  });
  root.MaintenanceAssistantSession = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
