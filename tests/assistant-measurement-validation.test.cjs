const test = require("node:test");
const assert = require("node:assert/strict");
const LocalTools = require("../assistant-local-tools.js");
const Registry = require("../assistant-tool-registry.js");

test("diagnostic tool rejects malformed measurement evidence before engine execution", async () => {
  let executed = 0;
  const tools = LocalTools.createLocalTools({
    engineeringCore: {
      routeRequest: () => ({ ok: true, decision: { route: "local_diagnostic" } }),
      executeLocalDiagnosis: () => { executed++; return { ok: true }; }
    },
    diagnosticEngine: {},
    faultLibrary: { faults: [] }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const invalid = await registry.call("diagnose", {
    request: {
      equipment: { type: "pump" }, symptom: "low flow", language: "en",
      measurements: [{ name: "pressure", value: 1.2 }]
    }
  });
  assert.equal(invalid.status, "invalid_input");
  assert.equal(executed, 0);

  const valid = await registry.call("diagnose", {
    request: {
      equipment: { type: "pump" }, symptom: "low flow", language: "en",
      measurements: [{
        name: "suction pressure", value: 1.2, unit: "bar",
        sourceType: "direct_measurement", timestamp: "2026-11-19T10:00:00.000Z", sensorStatus: "normal", qualityFlag: "normal"
      }]
    }
  });
  assert.equal(valid.status, "completed");
  assert.equal(executed, 1);
});
