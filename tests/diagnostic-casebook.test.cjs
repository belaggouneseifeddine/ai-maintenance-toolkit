const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Casebook = require("../diagnostic-casebook.js");
const lowFlow = JSON.parse(fs.readFileSync("knowledge/diagnostic-cases/centrifugal-pump-low-flow.json", "utf8"));
const sourceRegistry = JSON.parse(fs.readFileSync("knowledge/sources.json", "utf8"));

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

test("unsafe and invasive inspections are not selected as the next automatic observation", () => {
  const result = Casebook.triageLowFlow({ measurements: [] }, lowFlow);
  assert.ok(result.nextEvidence);
  assert.equal(result.nextEvidence.safetyClass, "installed_instrument_observation");
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

test("PACO VL/VLS low-flow case is source-bounded and remains candidate-only", () => {
  const paco = JSON.parse(fs.readFileSync("knowledge/diagnostic-cases/paco-vl-vls-insufficient-flow.json", "utf8"));
  const result = Casebook.validateCase(paco);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(paco.caseId, "CP-005");
  assert.equal(paco.status, "candidate");
  assert.equal(paco.licenseStatus, "reference_only");
  assert.ok(paco.applicability.some(value => /PACO VL and VLS/i.test(value)));
  assert.ok(paco.hypotheses.length >= 2);
  assert.ok(paco.measurements.every(item => item.location && item.operatingCondition && item.sourceTypes.includes("unknown")));
  assert.ok(paco.limits.some(value => /universal numeric/i.test(value)));
  assert.ok(paco.sources.some(source => source.sourceId === "grundfos-paco-vl-vls-manual-5104627" && source.sectionOrPage.includes("printed page 15")));
  const registered = sourceRegistry.reference_only_documents.find(source => source.id === "grundfos-paco-vl-vls-manual-5104627");
  assert.ok(registered);
  assert.equal(registered.fetchAllowed, false);
  assert.match(registered.licenseStatus, /reference-only/i);
});
