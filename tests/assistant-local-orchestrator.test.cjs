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

test("orchestrator records safety blocks and never executes blocked tools", async () => {
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
  assert.equal(result.status, "safety_blocked");
  assert.equal(result.results[0].status, "blocked");
  assert.equal(executions, 0);
  assert.equal(result.session.toolEvents[0].status, "blocked");
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
