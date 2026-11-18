const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Casebook = require("../diagnostic-casebook.js");
const lowFlow = JSON.parse(fs.readFileSync("knowledge/diagnostic-cases/centrifugal-pump-low-flow.json", "utf8"));
const sourceRegistry = JSON.parse(fs.readFileSync("knowledge/sources.json", "utf8"));

function reading(overrides = {}) {
  const sourceType = overrides.sourceType || "direct_measurement";
  const defaultRole = {
    direct_measurement: "physical_measurement",
    plc_value: "controller_feedback",
    historian_value: "historian_derived",
    estimated: "estimate",
    unknown: "unknown"
  }[sourceType] || "unknown";
  return {
    name: "Flow rate",
    value: 12,
    unit: "m3/h",
    location: "FT-101",
    operatingCondition: "stable at recorded speed and valve state",
    sourceType,
    timestamp: "2026-11-18T20:00:00+01:00",
    sensorStatus: "verified",
    qualityFlag: "good",
    signalRole: defaultRole,
    ...overrides
  };
}

test("low-flow candidate case satisfies the case contract and stays outside runtime", () => {
  const result = Casebook.validateCase(lowFlow, { sourceRegistry });
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(lowFlow.status, "candidate");
  assert.equal(lowFlow.licenseStatus, "reference_only");
  assert.equal(lowFlow.runtimeEligible, undefined);
});

test("measurement definitions preserve units, location, operating condition and source provenance", () => {
  for (const m of lowFlow.measurements) {
    assert.ok(m.unit && m.location && m.operatingCondition);
    assert.ok(m.sourceTypes.includes("plc_value"));
    assert.ok(m.sourceTypes.includes("direct_measurement"));
  }
  const broken = structuredClone(lowFlow);
  delete broken.measurements[0].location;
  assert.equal(Casebook.validateCase(broken, { sourceRegistry }).ok, false);
});

test("measurement quality policy requires timestamps, verified sensors, good flags and no automatic unit conversion", () => {
  assert.equal(lowFlow.measurementQualityPolicy.timestampRequired, true);
  assert.deepEqual(lowFlow.measurementQualityPolicy.sensorStatusAllowedForEvidence, ["verified"]);
  assert.deepEqual(lowFlow.measurementQualityPolicy.qualityFlagsAllowedForEvidence, ["good"]);
  assert.ok(!lowFlow.measurementQualityPolicy.evidenceSourceTypes.includes("estimated"));
  assert.ok(!lowFlow.measurementQualityPolicy.evidenceSourceTypes.includes("unknown"));
  assert.equal(lowFlow.measurementQualityPolicy.unitHandling, "preserve_exact_units_no_automatic_conversion");
  const broken = structuredClone(lowFlow);
  broken.measurementQualityPolicy.evidenceSourceTypes.push("estimated");
  assert.equal(Casebook.validateCase(broken, { sourceRegistry }).ok, false);
});

test("claim traceability maps every case claim and records source gaps explicitly", () => {
  const expected = new Set(Casebook.expectedClaimTargets(lowFlow));
  const actual = new Set(lowFlow.claimTraceability.map(row => row.target));
  assert.deepEqual(actual, expected);
  assert.ok(lowFlow.claimTraceability.some(row => row.evidenceClass === "engineering_hypothesis" && row.sourceId === null && row.licenseStatus === "source_gap"));
  assert.ok(lowFlow.claimTraceability.some(row => row.evidenceClass === "source_supported_bounded" && row.sourceId === "ksb-mdx-maintenance-manual-2021-8-01"));
  const broken = structuredClone(lowFlow);
  broken.claimTraceability = broken.claimTraceability.filter(row => row.target !== "hypotheses/suction-restriction");
  assert.match(Casebook.validateCase(broken, { sourceRegistry }).errors.join("; "), /missing claimTraceability target/);
});

test("claim traceability rejects unknown sources and mismatched source locations", () => {
  const unknown = structuredClone(lowFlow);
  const row = unknown.claimTraceability.find(item => item.sourceId);
  row.sourceId = "not-registered";
  assert.match(Casebook.validateCase(unknown, { sourceRegistry }).errors.join("; "), /claimTraceability source/);
  const mismatched = structuredClone(lowFlow);
  const sourceRow = mismatched.claimTraceability.find(item => item.sourceId);
  sourceRow.sectionOrPage = "invented page";
  assert.match(Casebook.validateCase(mismatched, { sourceRegistry }).errors.join("; "), /must match case source record/);
});

test("diagnostic tests require explicit time and cost classes, including unknown", () => {
  assert.ok(lowFlow.tests.every(t => t.timeCost === "unknown" && t.costLevel === "unknown"));
  const broken = structuredClone(lowFlow);
  delete broken.tests[0].costLevel;
  assert.equal(Casebook.validateCase(broken, { sourceRegistry }).ok, false);
});

test("reviewed status cannot be claimed while claim-level sources remain unresolved", () => {
  const broken = structuredClone(lowFlow);
  broken.status = "technically_reviewed";
  broken.sources[0].sectionOrPage = null;
  assert.equal(Casebook.validateCase(broken, { sourceRegistry }).ok, false);
  const gap = structuredClone(lowFlow);
  gap.status = "source_reviewed";
  assert.match(Casebook.validateCase(gap, { sourceRegistry }).errors.join("; "), /every claim target/);
});

test("source validation rejects unknown IDs and reference-only evidence cannot be promoted to reuse-permitted", () => {
  const unknown = structuredClone(lowFlow);
  unknown.sources[0].sourceId = "not-registered";
  assert.match(Casebook.validateCase(unknown, { sourceRegistry }).errors.join("; "), /unregistered source/);

  const restricted = structuredClone(lowFlow);
  restricted.licenseStatus = "reuse_permitted";
  assert.match(Casebook.validateCase(restricted, { sourceRegistry }).errors.join("; "), /reuse_permitted conflicts/);
});

test("numeric parser rejects blank, whitespace, boolean, non-finite and locale-ambiguous values", () => {
  assert.equal(Casebook.parseNumericValue(0), 0);
  assert.equal(Casebook.parseNumericValue(" 1.25 "), 1.25);
  for (const value of ["", "   ", false, true, null, undefined, NaN, Infinity, "1,25", "12 bar"]) {
    assert.equal(Casebook.parseNumericValue(value), null, String(value));
  }
});

test("timestamp parser requires an explicit timezone", () => {
  assert.equal(Casebook.parseTimestamp("2026-11-18T20:00:00+01:00") !== null, true);
  assert.equal(Casebook.parseTimestamp("2026-11-18T20:00:00Z") !== null, true);
  assert.equal(Casebook.parseTimestamp("2026-11-18T20:00:00"), null);
  assert.equal(Casebook.parseTimestamp("not-a-date"), null);
});

test("blank, boolean and unknown-provenance readings remain incomplete instead of becoming zero", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ value: "" }),
    reading({ name: "Suction pressure", value: "  ", unit: "bar", location: "PT-101" }),
    reading({ name: "Discharge pressure", value: false, unit: "bar", location: "PT-102" }),
    reading({ name: "Pump speed", value: 1450, unit: "rpm", location: "VFD feedback", sourceType: "unknown" })
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 4);
  assert.equal(result.evidenceQuality.unknownProvenanceCount, 1);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
});

test("contradictory same-parameter readings at the same location and timestamp are excluded", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ value: 12, sourceType: "plc_value" }),
    reading({ value: 14, sourceType: "direct_measurement" })
  ] }, lowFlow, { sourceRegistry });
  assert.deepEqual(result.evidenceQuality.conflictingMeasurementNames, ["flow rate"]);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.ok(result.evidenceQuality.missingMeasurementDefinitions.includes("Flow rate"));
});

test("different timestamps are not falsely treated as simultaneous contradictory readings", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ value: 12 }),
    reading({ value: 14, timestamp: "2026-11-18T20:01:00+01:00" })
  ] }, lowFlow, { sourceRegistry });
  assert.deepEqual(result.evidenceQuality.conflictingMeasurementNames, []);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 2);
});

test("estimated and unknown-provenance readings are retained but do not satisfy required evidence", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ name: "Suction pressure", value: 1.2, unit: "bar", location: "PT-101", sourceType: "estimated" }),
    reading({ name: "Discharge pressure", value: 2, unit: "bar", location: "PT-102", sourceType: "unknown" })
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 2);
  assert.equal(result.evidenceQuality.estimatedMeasurementCount, 1);
  assert.equal(result.evidenceQuality.unknownProvenanceCount, 1);
  assert.ok(result.evidenceQuality.missingMeasurementDefinitions.includes("Suction pressure"));
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
});

test("noisy data and failed sensors are excluded from evidence", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ qualityFlag: "noisy" }),
    reading({ name: "Suction pressure", value: 1.2, unit: "bar", location: "PT-101", sensorStatus: "failed" })
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.noisyMeasurementCount, 1);
  assert.equal(result.evidenceQuality.failedSensorCount, 1);
  assert.equal(result.evidenceQuality.qualityRejectedCount, 2);
});

test("PLC command values are not treated as actual measured speed", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ name: "Pump speed", value: 1450, unit: "rpm", location: "VFD command", sourceType: "plc_value", signalRole: "controller_command" })
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.controllerCommandCount, 1);
  assert.ok(result.evidenceQuality.missingMeasurementDefinitions.includes("Pump speed"));
});

test("unit changes are flagged rather than silently converted", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ value: 12, unit: "m3/h" }),
    reading({ value: 0.0033, unit: "m3/s", timestamp: "2026-11-18T20:01:00+01:00" })
  ] }, lowFlow, { sourceRegistry });
  assert.deepEqual(result.evidenceQuality.unitConflictNames, ["flow rate"]);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
});

test("unrecognized measurement names do not enter the evidence set", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ name: "Pump current", value: 8, unit: "A", location: "MCC feeder" })
  ] }, lowFlow, { sourceRegistry });
  assert.deepEqual(result.evidenceQuality.unknownMeasurementNames, ["pump current"]);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
});

test("PLC feedback remains distinguishable from independent physical measurements", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    reading({ sourceType: "plc_value", signalRole: "controller_feedback" }),
    reading({ name: "Suction pressure", value: 1.2, unit: "bar", location: "PT-101", sourceType: "direct_measurement" })
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 2);
  assert.equal(result.evidenceQuality.independentMeasurementCount, 1);
  assert.equal(result.evidenceQuality.controlSystemValueCount, 1);
});

test("candidate triage lists safe observations but does not rank a next test without validated information models", () => {
  const result = Casebook.triageLowFlow({ measurements: [] }, lowFlow, { sourceRegistry });
  assert.equal(result.status, "candidate_triage_only");
  assert.equal(result.runtimeEligible, false);
  assert.equal(result.nextEvidence, null);
  assert.equal(result.selection.status, "blocked_unvalidated_information_model");
  assert.ok(result.candidateNextEvidence.length > 0);
  assert.ok(result.candidateNextEvidence.every(t =>
    ["installed_instrument_observation", "external_observation"].includes(t.safetyClass)
  ));
  assert.ok(result.candidateNextEvidence.every(t => t.selectionState === "candidate_unranked"));
  assert.ok(result.candidateNextEvidence.every(t => t.timeCost === "unknown" && t.costLevel === "unknown"));
  assert.ok(!result.candidateNextEvidence.some(t => t.safetyClass === "planned_isolated_inspection"));
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
  assert.equal(Object.hasOwn(result, "probabilities"), false);
  assert.ok(result.hypotheses.every(h => !Object.hasOwn(h, "probability")));
});

test("all case sources resolve to the register and restricted OEM references remain reference-only", () => {
  const result = Casebook.validateCase(lowFlow, { sourceRegistry });
  assert.equal(result.ok, true, result.errors.join("; "));
  const ids = new Set([
    ...sourceRegistry.sources.map(s => s.id),
    ...(sourceRegistry.reference_only_documents || []).map(s => s.id)
  ]);
  for (const source of lowFlow.sources) assert.ok(ids.has(source.sourceId), "unregistered source: " + source.sourceId);
  for (const id of ["ksb-mdx-maintenance-manual-2021-8-01", "ksb-centrifugal-pump-lexicon-operating-point", "ashrae-handbook-2024-chapter-44-centrifugal-pumps"]) {
    const source = sourceRegistry.reference_only_documents.find(s => s.id === id);
    assert.ok(source);
    assert.equal(source.fetchAllowed, false);
    assert.match(source.licenseStatus, /reference-only/i);
  }
});
