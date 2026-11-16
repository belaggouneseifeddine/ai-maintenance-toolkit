const test = require("node:test");
const assert = require("node:assert/strict");
const LocalTools = require("../assistant-local-tools.js");
const Registry = require("../assistant-tool-registry.js");

test("diagnostic tool is blocked by deterministic safety review before execution", async () => {
  let executed = 0;
  const tools = LocalTools.createLocalTools({
    engineeringCore: {
      routeRequest: () => ({ ok: true, decision: { route: "safety_review", safetyReviewRequired: true } }),
      executeLocalDiagnosis: () => { executed++; return { ok: true }; }
    },
    diagnosticEngine: { diagnose() {} },
    faultLibrary: { faults: [] }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const result = await registry.call("diagnose", {
    request: { intent: "diagnose", language: "ar", equipment: { type: "pump" }, symptom: "leak" }
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.error, "safety_review_required");
  assert.equal(executed, 0);
});

test("diagnostic tool invokes only the injected local engine after safety passes", async () => {
  let loaded = 0;
  let diagnosed = 0;
  const tools = LocalTools.createLocalTools({
    engineeringCore: {
      routeRequest: () => ({ ok: true, decision: { route: "local_diagnostic", safetyReviewRequired: false } }),
      executeLocalDiagnosis: (request, engine, library) => {
        diagnosed++;
        assert.equal(request.consent.sendToAI, false);
        assert.equal(library.faults.length, 1);
        return { ok: true, diagnosis: engine.diagnose(request) };
      }
    },
    diagnosticEngine: { diagnose: () => "local-only" },
    loadFaultLibrary: async () => { loaded++; return { faults: [{}] }; }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const result = await registry.call("diagnose", {
    request: { intent: "diagnose", language: "ar", equipment: { type: "pump" }, symptom: "low flow", observations: [] }
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.diagnosis, "local-only");
  assert.equal(loaded, 1);
  assert.equal(diagnosed, 1);
});

test("document search delegates only to the reviewed local retrieval adapter", async () => {
  let received = "";
  const tools = LocalTools.createLocalTools({
    documentRetrieval: {
      forDiagnostics: async query => {
        received = query;
        return { ok: true, status: "approved_claims_retrieved", results: [{ citation: "p. 12" }] };
      }
    }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const result = await registry.call("searchReviewedDocuments", { query: "pump cavitation" });
  assert.equal(received, "pump cavitation");
  assert.equal(result.data.results[0].citation, "p. 12");
  assert.equal((await registry.call("searchReviewedDocuments", { query: " " })).status, "invalid_input");
});
