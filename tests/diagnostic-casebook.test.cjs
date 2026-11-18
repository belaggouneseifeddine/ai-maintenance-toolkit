const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Casebook = require("../diagnostic-casebook.js");
const lowFlow = JSON.parse(fs.readFileSync("knowledge/diagnostic-cases/centrifugal-pump-low-flow.json", "utf8"));
const sourceRegistry = JSON.parse(fs.readFileSync("knowledge/sources.json", "utf8"));

const safeContext = {
  siteProcedureAllowsObservation: true,
  readOnly: true,
  stopConditionsChecked: true,
  stopConditionsAbsent: true
};

function safeInput(overrides = {}) {
  return {
    measurements: [],
    safetyContext: safeContext,
    confirmedTestIds: ["compare-flow-pressure-speed"],
    ...overrides
  };
}

test("low-flow candidate case satisfies the case contract", () => {
  const result = Casebook.validateCase(lowFlow);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(lowFlow.status, "candidate");
  assert.equal(lowFlow.licenseStatus, "reference_only");
});

test("measurements preserve units, location, operating condition and source provenance", () => {
  for (const m of lowFlow.measurements) {
    assert.ok(m.unit && m.location && m.operatingCondition);
    assert.ok(m.sourceTypes.includes("plc_value"));
    assert.ok(m.sourceTypes.includes("direct_measurement"));
  }
  const broken = structuredClone(lowFlow);
  delete broken.measurements[0].location;
  assert.equal(Casebook.validateCase(broken).ok, false);
});

test("case validation rejects unknown hypothesis and measurement references", () => {
  const broken = structuredClone(lowFlow);
  broken.tests[0].discriminates.push("invented-hypothesis");
  broken.tests[0].requiredMeasurements.push("Unregistered sensor");
  const result = Casebook.validateCase(broken);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes("unknown hypothesis")));
  assert.ok(result.errors.some(error => error.includes("unknown measurement")));
});

test("candidate status cannot be promoted without claim-level reviewed sources", () => {
  const broken = structuredClone(lowFlow);
  broken.status = "technically_reviewed";
  broken.sources[0].sectionOrPage = null;
  assert.equal(Casebook.validateCase(broken).ok, false);
});

test("triage keeps all hypotheses unresolved and never emits probabilities", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value" }
  ] }, lowFlow);
  assert.equal(result.status, "candidate_triage_only");
  assert.equal(result.runtimeEligible, false);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
  assert.equal(Object.hasOwn(result, "probabilities"), false);
  assert.ok(result.hypotheses.every(h => !Object.hasOwn(h, "probability")));
  assert.equal(result.selection.expectedInformationGainCalculated, false);
  assert.equal(result.nextEvidence, null, "no test may be selected before explicit safety confirmation");
});

test("missing, estimated and incomplete readings are not silently promoted to measured evidence", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Suction pressure", value: 1.2, unit: "bar", location: "", operatingCondition: "unknown", sourceType: "estimated" },
    { name: "Discharge pressure", value: null, unit: "bar", location: "PT-102", operatingCondition: "stable", sourceType: "unknown" }
  ] }, lowFlow);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 2);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
});

test("boolean and non-finite readings are rejected as invalid measurements", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Flow rate", value: true, unit: "m3/h", location: "FT-101", operatingCondition: "steady", sourceType: "direct_measurement" },
    { name: "Suction pressure", value: "NaN", unit: "bar(g)", location: "PT-101", operatingCondition: "steady", sourceType: "plc_value" }
  ] }, lowFlow);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 2);
});

test("direct, PLC, historian, estimated and unknown readings retain separate provenance", () => {
  const readings = [
    { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "steady", sourceType: "direct_measurement" },
    { name: "Suction pressure", value: 1.1, unit: "bar(g)", location: "PT-101", operatingCondition: "steady", sourceType: "plc_value" },
    { name: "Discharge pressure", value: 3.2, unit: "bar(g)", location: "PT-102", operatingCondition: "steady", sourceType: "historian_value" },
    { name: "Pump speed", value: 1450, unit: "rpm", location: "VFD feedback", operatingCondition: "steady", sourceType: "estimated" },
    { name: "Source liquid level", value: 2, unit: "m", location: "LT-01", operatingCondition: "steady", sourceType: "unknown" }
  ];
  const result = Casebook.triageLowFlow({ measurements: readings }, lowFlow);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 3);
  assert.equal(result.evidenceQuality.estimatedReadingCount, 1);
  assert.equal(result.evidenceQuality.unknownSourceReadingCount, 1);
  assert.equal(result.evidenceQuality.sourceTypeCounts.direct_measurement, 1);
  assert.equal(result.evidenceQuality.sourceTypeCounts.plc_value, 1);
  assert.equal(result.evidenceQuality.sourceTypeCounts.historian_value, 1);
  assert.equal(result.evidenceQuality.sourceTypeCounts.estimated, 1);
  assert.equal(result.evidenceQuality.sourceTypeCounts.unknown, 1);
  assert.ok(result.evidenceQuality.estimatedOnlyMeasurementDefinitions.includes("Pump speed"));
  assert.ok(result.evidenceQuality.sourceUnknownMeasurementDefinitions.includes("Source liquid level"));
});

test("unsafe or invasive inspections are never selected automatically", () => {
  const result = Casebook.triageLowFlow(safeInput({
    confirmedTestIds: ["plan-isolated-inspection"]
  }), lowFlow);
  assert.equal(result.nextEvidence, null);
  const invasive = result.candidateTests.find(item => item.id === "plan-isolated-inspection");
  assert.equal(invasive.eligibleAsNextObservation, false);
  assert.ok(invasive.blockedReasons.includes("not_an_automatic_read_only_observation"));
});

test("read-only observation requires site safety context and explicit prerequisite confirmation", () => {
  const noContext = Casebook.triageLowFlow({
    measurements: [],
    confirmedTestIds: ["compare-flow-pressure-speed"]
  }, lowFlow);
  assert.equal(noContext.nextEvidence, null);

  const noPrerequisiteConfirmation = Casebook.triageLowFlow({
    measurements: [],
    safetyContext: safeContext,
    confirmedTestIds: []
  }, lowFlow);
  assert.equal(noPrerequisiteConfirmation.nextEvidence, null);

  const allowed = Casebook.triageLowFlow(safeInput(), lowFlow);
  assert.equal(allowed.nextEvidence.id, "compare-flow-pressure-speed");
  assert.equal(allowed.nextEvidence.safetyClass, "installed_instrument_observation");
  assert.equal(allowed.nextEvidence.informationValue.notExpectedInformationGain, true);
});

test("contradictory same-time readings block next-test selection", () => {
  const result = Casebook.triageLowFlow(safeInput({
    measurements: [
      { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "steady", timestamp: "2026-11-18T10:00:00Z", sourceType: "direct_measurement" },
      { name: "Flow rate", value: 18, unit: "m3/h", location: "FT-101", operatingCondition: "steady", timestamp: "2026-11-18T10:00:00Z", sourceType: "direct_measurement" }
    ]
  }), lowFlow);
  assert.equal(result.evidenceQuality.conflictingReadingCount, 1);
  assert.equal(result.nextEvidence, null);
  assert.ok(result.candidateTests.every(item => item.blockedReasons.includes("measurement_conflict_requires_validation")));
});

test("same-time PLC and direct disagreement is not silently averaged", () => {
  const result = Casebook.triageLowFlow(safeInput({
    measurements: [
      { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "steady", timestamp: "2026-11-18T10:00:00Z", sourceType: "direct_measurement" },
      { name: "Flow rate", value: 18, unit: "m3/h", location: "FT-101", operatingCondition: "steady", timestamp: "2026-11-18T10:00:00Z", sourceType: "plc_value" }
    ]
  }), lowFlow);
  assert.equal(result.evidenceQuality.crossSourceDisagreementCount, 1);
  assert.equal(result.nextEvidence, null);
});

test("bad sensor quality blocks readings and test selection", () => {
  const result = Casebook.triageLowFlow(safeInput({
    measurements: [
      { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "steady", sourceType: "plc_value", qualityStatus: "bad" }
    ]
  }), lowFlow);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.unreliableReadingCount, 1);
  assert.equal(result.nextEvidence, null);
});

test("test ranking uses explicit hypothesis coverage and respects time/cost constraints", () => {
  const caseRecord = structuredClone(lowFlow);
  caseRecord.tests.push({
    id: "narrow-fast-observation",
    name: "Narrow installed-instrument observation",
    prerequisites: ["Read-only authorized observation"],
    safetyClass: "installed_instrument_observation",
    discriminates: ["suction-restriction", "discharge-system-resistance"],
    requiredMeasurements: ["Flow rate"],
    expectedOutcomes: {},
    interpretationLimits: ["Candidate planning estimate only"]
  });
  const result = Casebook.triageLowFlow(safeInput({
    confirmedTestIds: ["compare-flow-pressure-speed", "review-source-and-valve-state", "narrow-fast-observation"],
    testEstimates: {
      "compare-flow-pressure-speed": { timeMinutes: 15, cost: 10 },
      "review-source-and-valve-state": { timeMinutes: 5, cost: 2 },
      "narrow-fast-observation": { timeMinutes: 2, cost: 1 }
    },
    constraints: { maxTimeMinutes: 10, maxCost: 5 }
  }), caseRecord);
  assert.equal(result.nextEvidence.id, "review-source-and-valve-state");
  assert.ok(result.candidateTests.find(item => item.id === "compare-flow-pressure-speed").blockedReasons.includes("test_exceeds_time_constraint"));
  assert.equal(result.selection.method, "hypothesis_discrimination_coverage_heuristic");
  assert.equal(result.selection.expectedInformationGainCalculated, false);
});

test("every cited source is registered and reuse-restricted sources remain reference-only", () => {
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
