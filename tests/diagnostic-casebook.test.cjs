const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Casebook = require("../diagnostic-casebook.js");
const lowFlow = JSON.parse(fs.readFileSync("knowledge/diagnostic-cases/centrifugal-pump-low-flow.json", "utf8"));
const sourceRegistry = JSON.parse(fs.readFileSync("knowledge/sources.json", "utf8"));

test("low-flow candidate case satisfies the case contract and stays outside runtime", () => {
  const result = Casebook.validateCase(lowFlow, { sourceRegistry });
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(lowFlow.status, "candidate");
  assert.equal(lowFlow.licenseStatus, "reference_only");
  assert.equal(lowFlow.runtimeEligible, false);
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

test("diagnostic tests require explicit time and cost classes, including unknown", () => {
  assert.ok(lowFlow.tests.every(t => t.timeCost === "unknown" && t.costLevel === "unknown"));
  const broken = structuredClone(lowFlow);
  delete broken.tests[0].costLevel;
  assert.equal(Casebook.validateCase(broken, { sourceRegistry }).ok, false);
});

test("reviewed status cannot be claimed without claim-level section or page evidence", () => {
  const broken = structuredClone(lowFlow);
  broken.status = "technically_reviewed";
  broken.sources[0].sectionOrPage = null;
  assert.equal(Casebook.validateCase(broken, { sourceRegistry }).ok, false);
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

test("blank and unknown-provenance readings remain incomplete instead of becoming zero", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Flow rate", value: "", unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value" },
    { name: "Suction pressure", value: "  ", unit: "bar", location: "PT-101", operatingCondition: "stable", sourceType: "direct_measurement" },
    { name: "Discharge pressure", value: false, unit: "bar", location: "PT-102", operatingCondition: "stable", sourceType: "direct_measurement" },
    { name: "Pump speed", value: 1450, unit: "rpm", location: "tachometer", operatingCondition: "stable", sourceType: "unknown" }
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 4);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
});

test("contradictory same-parameter readings are flagged and excluded from the evidence set", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value" },
    { name: "Flow rate", value: 14, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "direct_measurement" }
  ] }, lowFlow, { sourceRegistry });
  assert.deepEqual(result.evidenceQuality.conflictingMeasurementNames, ["flow rate"]);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.ok(result.evidenceQuality.missingMeasurementDefinitions.includes("Flow rate"));
});

test("estimated and incomplete readings retain provenance and are not silently promoted", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Suction pressure", value: 1.2, unit: "bar", location: "", operatingCondition: "unknown", sourceType: "estimated" },
    { name: "Discharge pressure", value: null, unit: "bar", location: "PT-102", operatingCondition: "stable", sourceType: "unknown" }
  ] }, lowFlow, { sourceRegistry });
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 2);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
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
