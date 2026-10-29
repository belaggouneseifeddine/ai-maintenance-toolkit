const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../bayesian-engine.js");

test("direct supporting keyword evidence raises the internal relative posterior", () => {
  const noEvidence = engine.scoreHypothesis({ id: "generic-a", label: "A", evidenceFor: [], evidenceAgainst: [] });
  const supported = engine.scoreHypothesis({ id: "generic-a", label: "A", evidenceFor: ["noise", "vibration"], evidenceAgainst: [] });
  assert.ok(supported.posterior > noEvidence.posterior);
  assert.equal(supported.method, "naive_bayes_discrete_evidence_unvalidated");
});

test("explicit contrary evidence lowers the internal relative posterior", () => {
  const balanced = engine.scoreHypothesis({ id: "generic-a", label: "A", evidenceFor: ["noise"], evidenceAgainst: [] });
  const contradicted = engine.scoreHypothesis({ id: "generic-a", label: "A", evidenceFor: ["noise"], evidenceAgainst: ["normal vibration", "normal current"] });
  assert.ok(contradicted.posterior < balanced.posterior);
});

test("low suction evidence ranks the supply hypothesis above a flow-path hypothesis", () => {
  const result = engine.enrich({
    machine: "pump",
    symptom: "low_flow",
    observations: "Suction pressure is low."
  }, {
    hypotheses: [
      { id: "pump-flow-path", label: "Possible flow-path restriction", evidenceFor: [], evidenceAgainst: [] },
      { id: "pump-supply-condition", label: "Possible supply or suction issue", evidenceFor: [], evidenceAgainst: [] }
    ],
    confirmedCause: ""
  });
  assert.equal(result.hypotheses[0].id, "pump-supply-condition");
  assert.ok(result.bayesianEvidenceIds.includes("suction_low"));
  assert.equal(result.reasoningModel, "bayesian_network_v2");
  assert.equal(result.calibrationStatus, "uncalibrated-expert-initialization");
  assert.equal(result.confirmedCause, "");
});

test("normal suction evidence lowers supply support compared with low suction evidence", () => {
  const supply = { id: "pump-supply-condition", label: "Supply or suction", evidenceFor: [], evidenceAgainst: [] };
  const low = engine.extractEvidence({ machine: "pump", symptom: "low_flow", observations: "Suction pressure is low." });
  const normal = engine.extractEvidence({ machine: "pump", symptom: "low_flow", observations: "Suction tank level appears normal." });
  assert.ok(engine.scoreHypothesis(supply, 0.2, low, { machine: "pump", symptom: "low_flow" }).posterior >
    engine.scoreHypothesis(supply, 0.2, normal, { machine: "pump", symptom: "low_flow" }).posterior);
});

test("missing pressure readings remain unknown and do not activate a low-suction node", () => {
  const evidence = engine.extractEvidence({
    machine: "pump",
    symptom: "low_flow",
    observations: "No pressure or flow readings are available."
  });
  assert.equal(evidence.some(item => item.id === "suction_low" || item.id === "suction_normal"), false);
  assert.equal(evidence.length, 0);
});

test("duplicate observations do not multiply the same evidence node", () => {
  const evidence = engine.extractEvidence({
    machine: "pump",
    symptom: "low_flow",
    observations: "Suction pressure is low. Suction pressure is low."
  });
  assert.equal(evidence.filter(item => item.id === "suction_low").length, 1);
});

test("unvalidated posterior remains bounded internally and is not exposed in UI-facing hypotheses", () => {
  const result = engine.enrich({
    machine: "pump",
    symptom: "low_flow",
    observations: "Suction pressure is low."
  }, { hypotheses: [{ id: "pump-supply-condition", label: "Supply issue", evidenceFor: [], evidenceAgainst: [] }] });
  assert.ok(result.hypotheses[0].bayesianRank === 1);
  assert.equal("bayesianEstimate" in result.hypotheses[0], false);
  assert.equal("posterior" in result.hypotheses[0], false);
  assert.match(result.reasoningNote, /not calibrated/i);
  assert.doesNotMatch(result.reasoningNote, /%/);
});

test("empty candidate list remains explicitly insufficient", () => {
  const result = engine.enrich({ machine: "pump", symptom: "low_flow", observations: "" }, { hypotheses: [] });
  assert.deepEqual(result.hypotheses, []);
  assert.match(result.reasoningNote, /No candidate hypotheses/i);
});
