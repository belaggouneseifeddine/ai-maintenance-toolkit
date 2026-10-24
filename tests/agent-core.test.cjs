const test = require("node:test");
const assert = require("node:assert/strict");
const engineeringCore = require("../engineering-core.js");
const agentModule = require("../agent-core.js");
const evidenceLibrary = require("../evidence-library.js");
require("../normalization.js");
const faults = require("../faults.json");
global.MAINTENANCE_FAULTS = faults;
require("../diagnostic-engine.js");

function makeAgent(tools = {}) {
  return agentModule.createAgentCore({
    engineeringCore,
    diagnosticEngine: global.MaintenanceDiagnosticEngine,
    faultLibrary: faults,
    evidenceLibrary,
    tools
  });
}

test("agent core exposes a versioned, dependency-injected API", () => {
  assert.equal(agentModule.version, "0.1.0");
  assert.equal(typeof agentModule.createAgentCore, "function");
  assert.equal(typeof makeAgent().run, "function");
});

test("diagnosis uses local deterministic engine first when AI consent is absent", async () => {
  let aiCalls = 0;
  const result = await makeAgent({ aiAssist: async () => { aiCalls++; return "should not run"; } }).run({
    intent: "diagnose",
    language: "en",
    equipment: { type: "pump" },
    symptom: "low flow",
    observations: ["flow is lower than usual"],
    consent: { sendToAI: false }
  });
  assert.equal(result.ok, true);
  assert.equal(result.route, "local_diagnostic");
  assert.equal(result.status, "preliminary_assessment");
  assert.equal(result.data.modelEnhanced, false);
  assert.equal(result.data.confirmedCause, "");
  assert.equal(aiCalls, 0);
});

test("AI may explain local findings only after explicit consent", async () => {
  let payload;
  const result = await makeAgent({
    aiAssist: async input => { payload = input; return { explanation: "Preliminary only." }; }
  }).run({
    intent: "diagnose",
    language: "en",
    equipment: { type: "pump" },
    symptom: "low flow",
    consent: { sendToAI: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.route, "local_diagnostic");
  assert.equal(result.data.modelEnhanced, true);
  assert.equal(payload.task, "explain_local_diagnosis");
  assert.equal(payload.policy.doNotConfirmRootCauseWithoutEvidence, true);
});

test("safety gate blocks every adapter even when AI consent is true", async () => {
  let calls = 0;
  const agent = makeAgent({
    aiAssist: async () => { calls++; },
    searchKnowledge: async () => { calls++; },
    calculate: async () => { calls++; },
    analyzeDocument: async () => { calls++; }
  });
  const result = await agent.run({
    intent: "diagnose",
    language: "en",
    equipment: { type: "hydraulic system" },
    symptom: "high-pressure oil leak",
    consent: { sendToAI: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "escalation_required");
  assert.equal(result.route, "safety_review");
  assert.equal(result.data.modelCalled, false);
  assert.equal(calls, 0);
});

test("malformed requests fail validation before any tool call", async () => {
  let calls = 0;
  const result = await makeAgent({ aiAssist: async () => { calls++; } }).run({
    language: "xx",
    intent: "run_machine",
    symptom: "unknown"
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "invalid_request");
  assert.equal(calls, 0);
});

test("AI failure degrades to the local diagnosis without leaking exception text", async () => {
  const result = await makeAgent({
    aiAssist: async () => { throw new Error("secret token or upstream details"); }
  }).run({
    intent: "diagnose",
    language: "en",
    equipment: { type: "pump" },
    symptom: "low flow",
    consent: { sendToAI: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.modelEnhanced, false);
  assert.equal(result.data.aiFallback, "tool_failed");
  assert.equal(JSON.stringify(result).includes("secret token"), false);
});

test("knowledge lookup requires an injected source-aware adapter", async () => {
  const missing = await makeAgent().run({
    intent: "search_knowledge",
    language: "en",
    symptom: "manual source for compressor alarm",
    consent: { sendToAI: false }
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.error.code, "tool_not_configured");

  const found = await makeAgent({
    searchKnowledge: async input => ({ matches: [], sources: [], query: input.request.symptom })
  }).run({
    intent: "search_knowledge",
    language: "en",
    symptom: "manual source for compressor alarm"
  });
  assert.equal(found.ok, true);
  assert.equal(found.route, "knowledge_lookup");
  assert.equal(found.data.sources.length, 0);
});

test("calculation tool receives explicit unit and missing-input constraints", async () => {
  let payload;
  const result = await makeAgent({
    calculate: async input => { payload = input; return { result: null, missing: ["rated power"] }; }
  }).run({
    intent: "calculate",
    language: "en",
    symptom: "calculate motor current"
  });
  assert.equal(result.ok, true);
  assert.equal(payload.requireUnits, true);
  assert.equal(payload.doNotInventInputs, true);
});

test("document metadata never implies a file upload or completed analysis", async () => {
  let calls = 0;
  const result = await makeAgent({
    analyzeDocument: async () => { calls++; }
  }).run({
    intent: "analyze_document",
    language: "en",
    attachments: [{ id: "local-file-1", mediaType: "application/pdf", name: "manual.pdf" }]
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "awaiting_document_adapter");
  assert.equal(result.data.fileUploaded, false);
  assert.equal(result.data.analysisPerformed, false);
  assert.equal(calls, 0);
});

test("report generation uses supplied data only and leaves root cause unconfirmed", async () => {
  const result = await makeAgent().run({
    intent: "create_report",
    language: "ar",
    equipment: { type: "motor", manufacturer: "OEM", model: "M-1" },
    symptom: "ارتفاع حرارة",
    observations: ["إنذار حرارة"],
    measurements: [{ name: "temperature", value: 80, unit: "°C" }]
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "draft_created");
  assert.equal(result.data.confirmedCause, "");
  assert.deepEqual(result.data.measurements[0], { name: "temperature", value: 80, unit: "°C" });
  assert.equal(result.data.sourceReferences.length, 0);
});

test("oversized adapter output is rejected without forwarding the payload", async () => {
  const result = await makeAgent({
    searchKnowledge: async () => ({ text: "x".repeat(13000) })
  }).run({ intent: "search_knowledge", language: "en", symptom: "manual" });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "tool_output_too_large");
});

test("timed-out AI adapter preserves the local result and returns a stable error code", async () => {
  const result = await agentModule.createAgentCore({
    engineeringCore,
    diagnosticEngine: global.MaintenanceDiagnosticEngine,
    faultLibrary: faults,
    toolTimeoutMs: 10,
    tools: { aiAssist: () => new Promise(() => {}) }
  }).run({
    intent: "diagnose",
    language: "en",
    equipment: { type: "pump" },
    symptom: "low flow",
    consent: { sendToAI: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.modelEnhanced, false);
  assert.equal(result.data.aiFallback, "tool_timeout");
});


test("knowledge lookup returns registered citations when no remote adapter is configured", async () => {
  const result = await makeAgent().run({
    intent: "search_knowledge",
    language: "en",
    equipment: { type: "pump" },
    symptom: "pump curve system performance"
  });
  assert.equal(result.ok, true);
  assert.equal(result.route, "knowledge_lookup");
  assert.equal(result.data.status, "sources_found");
  assert.ok(result.data.results.some(item => item.citationId === "doe-pump-sourcebook"));
  assert.ok(result.data.results.every(item => item.source.url.startsWith("https://")));
});
