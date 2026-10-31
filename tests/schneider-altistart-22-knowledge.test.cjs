const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const knowledge = require("../knowledge/industrial/schneider-altistart-22.json");

test("ATS22 knowledge has explicit provenance and remains unverified", () => {
  assert.equal(knowledge.schemaVersion, 1);
  assert.equal(knowledge.source.manufacturer, "Schneider Electric");
  assert.equal(knowledge.source.documentNumber, "BBV51330_04");
  assert.equal(knowledge.ingestionStatus.runtimeIntegration, false);
  assert.equal(knowledge.ingestionStatus.approvedForAutomaticRecommendations, false);
  assert.equal(knowledge.ingestionStatus.originalPdfBinaryReviewedInThisChange, false);
  for (const item of knowledge.faultCases) {
    assert.equal(item.evidenceStatus, "review-needed", item.id);
    assert.equal(item.evidence.documentId, knowledge.source.documentId);
    assert.deepEqual(item.evidence.pages, [75, 76]);
    assert.equal(item.exactModelRequired, true);
  }
});

test("ATS22 family wiring limits are not interchangeable", () => {
  assert.equal(knowledge.equipmentScope.modelFamilies["ATS22-Q"].insideDeltaSupported, true);
  assert.equal(knowledge.equipmentScope.modelFamilies["ATS22-S6"].insideDeltaSupported, false);
  assert.equal(knowledge.equipmentScope.modelFamilies["ATS22-S6U"].insideDeltaSupported, false);
  assert.match(knowledge.equipmentScope.scopeWarning, /full ATS22 model code/i);
});

test("critical safety cases cannot be silently downgraded", () => {
  const critical = knowledge.safety.filter(item => item.severity === "critical");
  assert.ok(critical.length >= 2);
  assert.ok(critical.every(item => item.status === "review-needed"));
  assert.ok(knowledge.safety.some(item => item.id === "ats22-short-circuit-stop"));
  assert.ok(knowledge.faultCases.find(item => item.faultCode === "SCF").severity === "critical");
});

test("every fault has a code, model scope, checks, and source trace", () => {
  assert.ok(knowledge.faultCases.length >= 10);
  for (const item of knowledge.faultCases) {
    assert.ok(item.faultCode, "fault code missing");
    assert.ok(item.symptom, item.id);
    assert.ok(item.checks, item.id);
    assert.ok(item.correctiveAction, item.id);
    assert.equal(item.exactModelRequired, true);
    assert.ok(item.evidence.pages.length > 0, item.id);
  }
});
