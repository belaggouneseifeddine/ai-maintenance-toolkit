const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Casebook = require("../diagnostic-casebook.js");

const lowFlow = JSON.parse(fs.readFileSync("knowledge/candidates/diagnostic-cases/centrifugal-pump-low-flow.json", "utf8"));
const sourceRegistry = JSON.parse(fs.readFileSync("knowledge/sources.json", "utf8"));
const schema = JSON.parse(fs.readFileSync("knowledge/schemas/diagnostic-case.schema.json", "utf8"));

test("low-flow candidate validates and remains reference-only", () => {
  const result = Casebook.validateCase(lowFlow, sourceRegistry);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(lowFlow.status, "candidate");
  assert.equal(lowFlow.licenseStatus, "reference_only");
});

test("schema and executable contract remain aligned", () => {
  assert.deepEqual(schema.required.slice().sort(), Casebook.contract.required.slice().sort());
  assert.ok(schema.properties.measurements.items.required.includes("allowedUnits"));
  assert.ok(schema.properties.measurements.items.properties.allowedUnits);
  assert.ok(schema.properties.tests.items.properties.timeCost);
  assert.ok(schema.properties.tests.items.properties.resourceCost);
});

test("measurement definitions require allowed units and provenance", () => {
  for (const measurement of lowFlow.measurements) {
    assert.ok(Array.isArray(measurement.allowedUnits) && measurement.allowedUnits.length > 0);
    assert.ok(measurement.sourceTypes.includes("direct_measurement"));
    assert.ok(measurement.sourceTypes.includes("plc_value"));
  }
  const broken = structuredClone(lowFlow);
  delete broken.measurements[0].location;
  assert.equal(Casebook.validateCase(broken, sourceRegistry).ok, false);
});

test("claim review requires a source section or page", () => {
  const broken = structuredClone(lowFlow);
  broken.status = "technically_reviewed";
  broken.sources[0].sectionOrPage = null;
  const result = Casebook.validateCase(broken, sourceRegistry);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => /claim-level sources/.test(error)));
});

test("reference-only sources prevent field-validated reuse promotion", () => {
  const promoted = structuredClone(lowFlow);
  promoted.status = "field_validated";
  promoted.licenseStatus = "reuse_permitted";
  const result = Casebook.validateCase(promoted, sourceRegistry);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => /field_validated source is not cleared for reuse/.test(error)));
});

test("unknown source IDs fail registry validation", () => {
  const broken = structuredClone(lowFlow);
  broken.sources[0].sourceId = "not-registered";
  const result = Casebook.validateCase(broken, sourceRegistry);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => /unregistered source/.test(error)));
});

test("triage keeps hypotheses unresolved and does not claim information gain", () => {
  const result = Casebook.triageLowFlow({
    measurements: [{
      name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101",
      operatingCondition: "stable", sourceType: "plc_value"
    }]
  }, lowFlow, sourceRegistry);

  assert.equal(result.status, "candidate_triage_only");
  assert.equal(result.runtimeEligible, false);
  assert.equal(result.selectionMethod, "coverage_heuristic_not_information_gain");
  assert.equal(result.informationGainAvailable, false);
  assert.ok(result.hypotheses.every(item => item.status === "unresolved" && !Object.hasOwn(item, "probability")));
  assert.equal(result.evidenceQuality.qualityUnknownCount, 1);
});

test("missing and incomplete readings are not promoted to measured evidence", () => {
  const result = Casebook.triageLowFlow({
    measurements: [
      { name: "Suction pressure", value: 1.2, unit: "bar(g)", location: "", operatingCondition: "unknown", sourceType: "estimated" },
      { name: "Discharge pressure", value: null, unit: "bar(g)", location: "PT-102", operatingCondition: "stable", sourceType: "unknown" }
    ]
  }, lowFlow);

  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 2);
});

test("estimated and unknown provenance remains distinct from direct readings", () => {
  const result = Casebook.triageLowFlow({
    measurements: [{
      name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101",
      operatingCondition: "stable", sourceType: "estimated"
    }]
  }, lowFlow);

  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 1);
  assert.equal(result.evidenceQuality.estimatedOrUnknownCount, 1);
});

test("noisy, stale, contradictory and failed/suspect sensor readings are excluded", () => {
  const samples = [
    { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value", sensorStatus: "normal", qualityFlag: "noisy" },
    { name: "Suction pressure", value: 1.2, unit: "bar(g)", location: "PT-101", operatingCondition: "stable", sourceType: "direct_measurement", sensorStatus: "failed", qualityFlag: "normal" },
    { name: "Discharge pressure", value: 2.4, unit: "bar(g)", location: "PT-102", operatingCondition: "stable", sourceType: "historian_value", sensorStatus: "normal", qualityFlag: "contradictory" },
    { name: "Pump speed", value: 1450, unit: "rpm", location: "drive feedback", operatingCondition: "stable", sourceType: "plc_value", sensorStatus: "suspect", qualityFlag: "stale" }
  ];
  const result = Casebook.triageLowFlow({ measurements: samples }, lowFlow);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.rejectedMeasurementCount, 4);
});

test("duplicate measurement names are withheld until reconciled", () => {
  const result = Casebook.triageLowFlow({
    measurements: [
      { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value" },
      { name: "Flow rate", value: 15, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "direct_measurement" }
    ]
  }, lowFlow);

  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.deepEqual(result.evidenceQuality.duplicateMeasurementNames, ["flow rate"]);
});

test("unknown measurements, invalid units and timestamps are rejected", () => {
  const result = Casebook.triageLowFlow({
    measurements: [
      { name: "Pump current", value: 12, unit: "A", location: "M-101", operatingCondition: "stable", sourceType: "plc_value" },
      { name: "Flow rate", value: 12, unit: "bar(g)", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value" },
      { name: "Pump speed", value: 1450, unit: "rpm", location: "drive", operatingCondition: "stable", sourceType: "plc_value", timestamp: "not-a-date" }
    ]
  }, lowFlow);

  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.rejectedMeasurementCount, 3);
});

test("only safe installed observations are eligible for automatic next-step selection", () => {
  const result = Casebook.triageLowFlow({ measurements: [] }, lowFlow);
  assert.ok(result.nextEvidence);
  assert.equal(result.nextEvidence.safetyClass, "installed_instrument_observation");
  assert.equal(result.nextEvidence.selectionMethod, "coverage_heuristic_not_information_gain");
});

test("stale, noisy and contradictory quality flags are each rejected independently", () => {
  for (const qualityFlag of ["stale", "noisy", "contradictory"]) {
    const result = Casebook.triageLowFlow({
      measurements: [{
        name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101",
        operatingCondition: "stable", sourceType: "plc_value",
        sensorStatus: "normal", qualityFlag
      }]
    }, lowFlow, sourceRegistry);
    assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0, qualityFlag);
    assert.equal(result.evidenceQuality.rejectedMeasurementCount, 1, qualityFlag);
  }
});

test("direct, PLC, historian and estimated readings retain distinct provenance", () => {
  const sourceTypes = ["direct_measurement", "plc_value", "historian_value", "estimated"];
  const result = Casebook.triageLowFlow({
    measurements: sourceTypes.map((sourceType, index) => ({
      name: ["Flow rate", "Suction pressure", "Discharge pressure", "Pump speed"][index],
      value: [12, 1.1, 2.3, 1450][index],
      unit: ["m3/h", "bar(g)", "bar(g)", "rpm"][index],
      location: ["FT-101", "PT-101", "PT-102", "drive feedback"][index],
      operatingCondition: "stable at recorded operating point",
      sourceType,
      sensorStatus: "normal",
      qualityFlag: "normal"
    }))
  }, lowFlow, sourceRegistry);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 4);
  assert.equal(result.evidenceQuality.estimatedOrUnknownCount, 1);
  assert.equal(result.status, "candidate_triage_only");
  assert.ok(result.hypotheses.every(item => item.status === "unresolved"));
});

test("absence of measurements leaves all competing causes unresolved", () => {
  const result = Casebook.triageLowFlow({ measurements: [] }, lowFlow, sourceRegistry);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.hypotheses.length, lowFlow.hypotheses.length);
  assert.ok(result.hypotheses.every(item => item.status === "unresolved"));
  assert.equal(result.informationGainAvailable, false);
});
