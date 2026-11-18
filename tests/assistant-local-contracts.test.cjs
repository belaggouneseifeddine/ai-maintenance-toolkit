const test = require("node:test");
const assert = require("node:assert/strict");
const Session = require("../assistant-session-contract.js");
const Registry = require("../assistant-tool-registry.js");

test("session contract creates a versioned local session with equipment context", () => {
  const session = Session.createSession({
    sessionId: "case-001", language: "ar",
    equipment: { type: "pump", manufacturer: "KSB", model: "Etanorm" }
  });
  assert.equal(session.schemaVersion, "1.0.0");
  assert.equal(session.equipment.model, "Etanorm");
  assert.deepEqual(Session.validateSession(session), { ok: true, errors: [] });
});

test("messages are appended immutably and duplicate IDs are rejected", () => {
  const original = Session.createSession({ sessionId: "case-002" });
  const next = Session.appendMessage(original, {
    messageId: "msg-1", role: "user", content: "التدفق ضعيف"
  });
  assert.equal(original.messages.length, 0);
  assert.equal(next.messages.length, 1);
  assert.throws(() => Session.appendMessage(next, {
    messageId: "msg-1", role: "assistant", content: "ما القياسات؟"
  }), /duplicate_message_id/);
});

test("LLM suggestions cannot be silently accepted as verified facts", () => {
  const session = Session.createSession({ sessionId: "case-003" });
  assert.throws(() => Session.recordFact(session, {
    factId: "suction-pressure", value: 1.2, unit: "bar",
    provenance: "llm_suggested", status: "accepted"
  }), /llm_fact_requires_explicit_review/);
  const next = Session.recordFact(session, {
    factId: "suction-pressure", value: 1.2, unit: "bar",
    provenance: "llm_suggested", status: "proposed"
  });
  assert.equal(next.facts[0].revisions[0].status, "proposed");
});

test("fact revisions preserve prior values and provenance", () => {
  let session = Session.createSession({ sessionId: "case-004" });
  session = Session.recordFact(session, {
    factId: "motor-temp", value: 78, unit: "°C",
    provenance: "measured", status: "accepted",
    sourceRef: { instrument: "IR thermometer" }
  });
  session = Session.recordFact(session, {
    factId: "motor-temp", value: 83, unit: "°C",
    provenance: "measured", status: "accepted"
  });
  assert.equal(session.facts.length, 1);
  assert.equal(session.facts[0].revisions.length, 2);
  assert.equal(session.facts[0].revisions[0].value, 78);
  assert.equal(session.facts[0].revisions[1].value, 83);
});

test("tool events are bounded, typed, and duplicate IDs are rejected", () => {
  const session = Session.createSession({ sessionId: "case-005" });
  const next = Session.appendToolEvent(session, {
    eventId: "evt-1", toolName: "diagnose",
    status: "completed", summary: "Preliminary hypotheses updated"
  });
  assert.equal(next.toolEvents[0].status, "completed");
  assert.throws(() => Session.appendToolEvent(next, {
    eventId: "evt-1", toolName: "diagnose", status: "failed"
  }), /duplicate_tool_event_id/);
});

test("tool registry exposes only allow-listed local tools", async () => {
  let called = 0;
  const registry = Registry.createToolRegistry({
    tools: {
      diagnose: { validate: input => !!input && typeof input.symptom === "string",
        execute: async input => { called++; return { hypotheses: [input.symptom] }; } },
      arbitraryCode: { validate: () => true, execute: async () => "not allowed" }
    }
  });
  assert.deepEqual(registry.list(), ["diagnose"]);
  const result = await registry.call("diagnose", { symptom: "low flow" });
  assert.equal(result.ok, true);
  assert.equal(result.data.hypotheses[0], "low flow");
  const rejected = await registry.call("arbitraryCode", {});
  assert.equal(rejected.error, "tool_not_registered");
  assert.equal(called, 1);
});

test("safety-sensitive tools continue with advisory warnings when the safety gate is missing or flags a hazard", async () => {
  let called = 0;
  const tools = {
    diagnose: { validate: () => true, safetySensitive: true, execute: async () => { called++; return {}; } }
  };
  const missing = Registry.createToolRegistry({ tools });
  const missingResult = await missing.call("diagnose", {});
  assert.equal(missingResult.status, "completed");
  assert.equal(missingResult.safetyNotice.severity, "warning");
  assert.equal(missingResult.safetyNotice.reason, "safety_gate_unavailable");
  const blocked = Registry.createToolRegistry({
    tools, safetyGate: async () => ({ allowed: false, reason: "hazard_review" })
  });
  const result = await blocked.call("diagnose", {});
  assert.equal(result.status, "completed");
  assert.equal(result.safetyNotice.severity, "warning");
  assert.equal(result.safetyNotice.reason, "hazard_review");
  assert.equal(called, 2);
});

test("tool input validation and oversized output are rejected", async () => {
  const registry = Registry.createToolRegistry({
    tools: {
      searchReviewedDocuments: {
        validate: input => !!input && typeof input.query === "string" && input.query.length < 100,
        execute: async () => ({ text: "x".repeat(13000) })
      }
    }
  });
  assert.equal((await registry.call("searchReviewedDocuments", { query: "manual" })).error, "tool_output_too_large");
  assert.equal((await registry.call("searchReviewedDocuments", { query: 123 })).status, "invalid_input");
});

test("tool output is cloned before leaving the registry", async () => {
  const payload = { nested: { value: 1 } };
  const registry = Registry.createToolRegistry({
    tools: { getEquipmentContext: { validate: () => true, execute: async () => payload } }
  });
  const result = await registry.call("getEquipmentContext", {});
  payload.nested.value = 2;
  assert.equal(result.data.nested.value, 1);
  result.data.nested.value = 3;
  assert.equal(payload.nested.value, 2);
});
