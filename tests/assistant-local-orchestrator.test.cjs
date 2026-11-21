const test = require("node:test");
const assert = require("node:assert/strict");
const Session = require("../assistant-session-contract.js");
const Registry = require("../assistant-tool-registry.js");
const Orchestrator = require("../assistant-local-orchestrator.js");

test("local orchestrator records a multi-turn conversation without a model/provider", async () => {
  const assistant = Orchestrator.createLocalOrchestrator({
    tools: {
      getEquipmentContext: {
        validate: input => !!input && typeof input.assetId === "string",
        execute: async input => ({ assetId: input.assetId, source: "local_fixture" })
      }
    }
  });
  assistant.start({ sessionId: "local-turn-001", language: "ar", equipment: { type: "pump" } });
  const first = await assistant.processTurn({
    messageId: "user-1", message: "المضخة تصدر اهتزازًا",
    toolCalls: [{ name: "getEquipmentContext", input: { assetId: "P-01" } }],
    assistantMessage: "سأراجع سياق المعدة قبل ترتيب الفرضيات."
  });
  assert.equal(first.ok, true);
  assert.equal(first.results[0].data.assetId, "P-01");
  assert.deepEqual(first.session.messages.map(item => item.role), ["user", "assistant"]);
  assert.equal(first.session.toolEvents[0].status, "completed");
  const second = await assistant.processTurn({ message: "لا تتوفر قراءة اهتزاز حاليًا" });
  assert.equal(second.session.messages.length, 3);
  assert.equal(second.session.messages[2].content, "لا تتوفر قراءة اهتزاز حاليًا");
  assert.equal(Session.validateSession(second.session).ok, true);
});

test("orchestrator records advisory safety warnings and still executes local diagnostics", async () => {
  let executions = 0;
  const assistant = Orchestrator.createLocalOrchestrator({
    tools: {
      diagnose: {
        validate: () => true,
        safetySensitive: true,
        execute: async () => { executions++; return { diagnosis: "unsafe" }; }
      }
    },
    safetyGate: async () => ({ allowed: false, reason: "hazard_not_reviewed" })
  });
  assistant.start({ sessionId: "local-turn-002" });
  const result = await assistant.processTurn({
    message: "افحص المعدة",
    toolCalls: [{ name: "diagnose", input: {} }]
  });
  assert.equal(result.status, "completed");
  assert.equal(result.results[0].status, "completed");
  assert.equal(result.results[0].safetyNotice.reason, "hazard_not_reviewed");
  assert.equal(result.session.toolEvents[0].status, "completed");
  assert.equal(executions, 1);
});

test("orchestrator rejects use before session start and keeps LLM facts proposed", () => {
  const assistant = Orchestrator.createLocalOrchestrator({ tools: {} });
  assert.throws(() => assistant.addMessage("user", "test"), /assistant_session_not_started/);
  assistant.start({ sessionId: "local-turn-003" });
  assert.throws(() => assistant.addFact({
    factId: "pressure", value: 2.1, unit: "bar",
    provenance: "llm_suggested", status: "accepted"
  }), /llm_fact_requires_explicit_review/);
});

test("orchestrator restores a validated local session without changing its evidence provenance", () => {
  const assistant = Orchestrator.createLocalOrchestrator({ tools: {} });
  const original = Session.createSession({ sessionId: "restore-session-001", language: "en", equipment: { type: "pump" } });
  const withMessage = Session.appendMessage(original, {
    messageId: "restore-message-001", role: "user", content: "Low flow observed"
  });
  const withFact = Session.recordFact(withMessage, {
    factId: "symptom", value: "low flow", provenance: "user_reported", status: "accepted"
  });
  const restored = assistant.restore(withFact);
  assert.deepEqual(restored, withFact);
  assert.equal(assistant.getSession().facts[0].revisions[0].provenance, "user_reported");
  assert.throws(
    () => assistant.restore({ ...withFact, schemaVersion: "99.0.0" }),
    error => error.message === "assistant_session_snapshot_invalid" &&
      error.cause && error.cause.message === "unsupported_schema_version"
  );
});

test("orchestrator updates equipment context with bounded allow-listed fields", () => {
  const assistant = Orchestrator.createLocalOrchestrator({ tools: {} });
  assistant.start({ sessionId: "equipment-context-001", equipment: { type: "pump" } });
  const updated = assistant.updateEquipment({ manufacturer: "KSB", model: "Etanorm", assetId: "P-101" });
  assert.deepEqual(updated.equipment, {
    type: "pump", manufacturer: "KSB", model: "Etanorm", assetId: "P-101"
  });
  assert.equal(updated.revision, 1);
  assert.throws(() => assistant.updateEquipment({ serialNumber: "secret" }), /invalid_equipment_context_field/);
  assert.throws(() => assistant.updateEquipment({ model: "x".repeat(121) }), /invalid_equipment_context_field/);
});


test("maintenance history tool output remains historical context and is not promoted into diagnostic facts", async () => {
  const assistant = Orchestrator.createLocalOrchestrator({
    tools: {
      getMaintenanceHistory: {
        validate: input => !!input && typeof input === "object",
        execute: async () => ({
          ok: true,
          status: "records_found",
          records: [{ date: "2026-11-16", machine: "Pump P-101", fault: "Low flow", action: "Cleaned strainer", status: "Repaired" }]
        })
      }
    }
  });
  assistant.start({ sessionId: "history-is-not-evidence-001", equipment: { type: "pump" } });
  const result = await assistant.invokeTool("getMaintenanceHistory", {});
  assert.equal(result.ok, true);
  assert.equal(result.data.records[0].fault, "Low flow");
  assert.equal(assistant.getSession().facts.length, 0);
  assert.equal(assistant.getSession().toolEvents[0].toolName, "getMaintenanceHistory");
  assert.equal(assistant.getSession().toolEvents[0].status, "completed");
});

test("public session snapshots cannot mutate the orchestrator's internal state", () => {
  const assistant = Orchestrator.createLocalOrchestrator({ tools: {} });
  const started = assistant.start({ sessionId: "snapshot-session-001", equipment: { type: "pump" } });
  started.equipment.type = "motor";
  assert.equal(assistant.getSession().equipment.type, "pump");
  const snapshot = assistant.getSession();
  snapshot.messages.push({ messageId: "forged", role: "assistant", content: "forged" });
  assert.equal(assistant.getSession().messages.length, 0);
});
