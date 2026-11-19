const test = require("node:test");
const assert = require("node:assert/strict");
const Context = require("../assistant-case-context.js");

test("parses supplied measurements without promoting unknown provenance", () => {
  const result = Context.parseMeasurementReadings([
    "Suction pressure|1.25|bar|direct_measurement|2026-11-19T10:00:00Z|70% load|normal|verified",
    "Flow|18|m3/h|plc_value|2026-11-19T10:01:00Z|70% load|normal|verified",
    "Temperature|hot|C|mystery_source|not-a-date"
  ].join("\n"));
  assert.equal(result.measurements.length, 3);
  assert.equal(result.measurements[0].value, 1.25);
  assert.equal(result.measurements[0].source, "direct_measurement");
  assert.equal(result.measurements[1].source, "plc_value");
  assert.equal(result.measurements[2].value, "hot");
  assert.equal(result.measurements[2].source, "unverified_source");
  assert.equal(result.measurements[2].timestamp, null);
  assert.ok(result.warnings.includes("line_3_unrecognized_source"));
  assert.ok(result.warnings.includes("line_3_invalid_timestamp"));
});

test("rejects incomplete measurement rows instead of inventing values or units", () => {
  const result = Context.parseMeasurementReadings("Pressure|1.2\n|2|bar\nFlow|18|m3/h");
  assert.equal(result.measurements.length, 1);
  assert.equal(result.measurements[0].name, "Flow");
  assert.equal(result.warnings.length, 2);
});

test("builds bounded equipment context and preserves source and operating conditions", () => {
  const result = Context.createCaseContext({
    equipmentType: "centrifugal pump",
    manufacturer: "Grundfos",
    model: "CR 32-4",
    assetId: "P-101",
    symptom: "low flow",
    alarmCode: "E-01",
    observations: "Flow dropped\nNo abnormal vibration",
    measurementStatus: "available",
    measurementText: "Discharge pressure|2.1|bar|plc_value|2026-11-19T10:00:00Z|70% load|normal|verified",
    guidedDiagnostic: { sessionId: "session-1" }
  });
  assert.deepEqual(result.equipment, {
    type: "centrifugal pump", manufacturer: "Grundfos",
    model: "CR 32-4", assetId: "P-101"
  });
  assert.deepEqual(result.observations, ["Flow dropped", "No abnormal vibration"]);
  assert.equal(result.measurements[0].source, "plc_value");
  assert.equal(result.measurements[0].operatingConditions, "70% load");
  assert.equal(result.guidedDiagnostic.sessionId, "session-1");
});
