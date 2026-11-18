const test = require("node:test");
const assert = require("node:assert/strict");
const Session = require("../assistant-session-contract.js");
const Registry = require("../assistant-tool-registry.js");
const Orchestrator = require("../assistant-local-orchestrator.js");
const Agent = require("../assistant-model-agent.js");

function setup(responses, options) {
  const assistant = Orchestrator.createLocalOrchestrator({
    sessionContract: Session,
    toolRegistry: Registry,
    tools: {
      getEquipmentContext: {
        validate: input => !!input && typeof input.assetId === "string",
        execute: async input => ({ assetId: input.assetId, manufacturer: "KSB" })
      }
    }
  });
  assistant.start({ sessionId: "model-agent-test-001", language: "ar", equipment: { type: "pump" } });
  let index = 0;
  const runtime = { generate: async request => {
    assert.equal(request.maxOutputTokens, 384);
    return { text: responses[Math.min(index++, responses.length - 1)] };
  }};
  const agent = Agent.createLocalModelAgent({
    runtime, orchestrator: assistant,
    tools: [{ name: "getEquipmentContext", description: "Read local asset context", inputSchema: { type: "object" } }],
    ...(options || {})
  });
  return { assistant, agent, getCalls: () => index };
}

test("agent performs a validated local tool call then returns a final response", async () => {
  const { assistant, agent, getCalls } = setup([
    JSON.stringify({ type: "tool_call", name: "getEquipmentContext", input: { assetId: "P-10" } }),
    JSON.stringify({ type: "final", text: "المعدة P-10 مسجلة من KSB. ما القراءة الحالية للتدفق؟" })
  ]);
  const result = await agent.runTurn({ message: "المضخة P-10 تدفقها ضعيف" });
  assert.equal(result.ok, true);
  assert.equal(result.status, "completed");
  assert.equal(result.toolEvents.length, 1);
  assert.equal(result.toolEvents[0].ok, true);
  assert.equal(getCalls(), 2);
  assert.equal(assistant.getSession().messages[0].role, "user");
  assert.equal(assistant.getSession().messages[1].role, "tool");
  assert.equal(assistant.getSession().messages[2].role, "assistant");
});

test("agent refuses model-requested tools absent from the local registry and declared catalog", async () => {
  const { assistant, agent } = setup([
    JSON.stringify({ type: "tool_call", name: "runShell", input: { command: "delete" } })
  ]);
  const result = await agent.runTurn({ message: "شغّل أمرًا" });
  assert.equal(result.status, "tool_rejected");
  assert.equal(result.error, "tool_not_allowlisted");
  assert.equal(assistant.getSession().toolEvents.length, 0);
});

test("agent rejects prose and malformed JSON instead of executing guesses", async () => {
  const { assistant, agent } = setup(["Here is a tool call: getEquipmentContext({assetId:'P-1'})"]);
  const result = await agent.runTurn({ message: "افحص المعدة" });
  assert.equal(result.status, "invalid_model_output");
  assert.equal(assistant.getSession().toolEvents.length, 0);
});

test("agent never falls back to a hosted provider when local generation fails", async () => {
  const assistant = Orchestrator.createLocalOrchestrator({ sessionContract: Session, toolRegistry: Registry, tools: {} });
  assistant.start({ sessionId: "model-agent-fail-001" });
  const agent = Agent.createLocalModelAgent({
    orchestrator: assistant,
    runtime: { generate: async () => { throw new Error("offline"); } }
  });
  const result = await agent.runTurn({ message: "ما سبب العطل؟" });
  assert.equal(result.status, "local_model_error");
  assert.equal(assistant.getSession().messages.length, 1);
});

test("agent stops after a bounded number of tool turns", async () => {
  const responses = Array.from({ length: 4 }, () =>
    JSON.stringify({ type: "tool_call", name: "getEquipmentContext", input: { assetId: "P-10" } })
  );
  const { agent, getCalls } = setup(responses);
  const result = await agent.runTurn({ message: "اعرض سياق المعدة" });
  assert.equal(result.status, "tool_loop_limit");
  assert.equal(result.toolEvents.length, 3);
  assert.equal(getCalls(), 3);
});

test("agent handles local context provider failure without attempting network access", async () => {
  const { agent } = setup([
    JSON.stringify({ type: "final", text: "لا تتوفر معلومات إضافية محليًا." })
  ], { getContext: async () => { throw new Error("context failed"); } });
  const result = await agent.runTurn({ message: "حلل الحالة" });
  assert.equal(result.ok, true);
  assert.equal(result.text, "لا تتوفر معلومات إضافية محليًا.");
});
