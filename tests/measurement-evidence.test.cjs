const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../engineering-core.js");
const Diagnostic = require("../diagnostic-engine.js");

test("measurement normalization preserves actual, PLC, historian and estimated provenance", () => {
  const result = Core.normalizeRequest({
    intent: "diagnose",
    language: "ar",
    equipment: { type: "centrifugal-pump", manufacturer: "Example", model: "P-100" },
    symptom: "low flow",
    observations: [],
    measurements: [
      { name: "suction pressure", value: 1.2, unit: "bar", sourceType: "plc_value", timestamp: "2026-11-17T10:00", operatingCondition: "70% load" },
      { name: "flow", value: 18, unit: "m3/h", sourceType: "direct_measurement" },
      { name: "bearing temperature", value: 75, unit: "C", sourceType: "estimated" }
    ]
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.measurements[0].sourceType, "plc_value");
  assert.equal(result.value.measurements[1].sourceType, "direct_measurement");
  assert.equal(result.value.measurements[2].sourceType, "estimated");
});

test("missing, noisy and suspect-sensor readings remain warnings, not negative evidence", () => {
  const result = Diagnostic.summarizeMeasurements([
    { name: "flow", value: null, unit: "m3/h", sourceType: "unknown" },
    { name: "vibration", value: 8.2, unit: "mm/s", sourceType: "direct_measurement", qualityFlag: "noisy", sensorStatus: "suspect" },
    { name: "temperature", value: 70, unit: "C", sourceType: "estimated" }
  ]);
  const codes = result.warnings.map(item => item.code);
  assert.ok(codes.includes("measurement_missing"));
  assert.ok(codes.includes("measurement_quality_warning"));
  assert.ok(codes.includes("sensor_status_warning"));
  assert.ok(codes.includes("estimated_value_not_measured"));
  assert.equal(result.usedForNumericThresholdDecision, false);
});

test("conflicting values under identical recorded conditions are flagged without choosing one", () => {
  const result = Diagnostic.summarizeMeasurements([
    { name: "suction pressure", value: 1.1, unit: "bar", sourceType: "plc_value", timestamp: "2026-11-17T10:00", operatingCondition: "70% load" },
    { name: "suction pressure", value: 1.8, unit: "bar", sourceType: "direct_measurement", timestamp: "2026-11-17T10:00", operatingCondition: "70% load" }
  ]);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].code, "conflicting_readings_same_context");
  assert.equal(result.readings.length, 2);
});
