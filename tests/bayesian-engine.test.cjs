const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../bayesian-engine.js");

test("supporting evidence raises relative posterior estimate", () => {
  const noEvidence = engine.scoreHypothesis({ label: "A", evidenceFor: [], evidenceAgainst: [] });
  const supported = engine.scoreHypothesis({ label: "A", evidenceFor: ["noise", "vibration"], evidenceAgainst: [] });
  assert.ok(supported.bayesianEstimate > noEvidence.bayesianEstimate);
});

test("contrary evidence lowers relative posterior estimate", () => {
  const balanced = engine.scoreHypothesis({ label: "A", evidenceFor: ["noise"], evidenceAgainst: [] });
  const contradicted = engine.scoreHypothesis({ label: "A", evidenceFor: ["noise"], evidenceAgainst: ["normal vibration", "normal current"] });
  assert.ok(contradicted.bayesianEstimate < balanced.bayesianEstimate);
});

test("scores remain bounded and explicitly marked unvalidated", () => {
  const result = engine.scoreHypothesis({ label: "A", evidenceFor: Array(100).fill("x"), evidenceAgainst: [] }, 0.99);
  assert.ok(result.bayesianEstimate > 0 && result.bayesianEstimate < 1);
  assert.equal(result.bayesianMethod, "heuristic_likelihood_ratio_unvalidated");
});

test("enrich ranks candidates and preserves uncertainty caveat", () => {
  const result = engine.enrich({}, { hypotheses: [
    { label: "weak", evidenceFor: [], evidenceAgainst: ["contrary"] },
    { label: "stronger", evidenceFor: ["noise", "heat"], evidenceAgainst: [] }
  ] });
  assert.equal(result.hypotheses[0].label, "stronger");
  assert.match(result.reasoningNote, /not calibrated probabilities/i);
  assert.equal(result.reasoningModel, "bayesian_style_local_v1");
});

test("empty candidate list remains safely empty", () => {
  const result = engine.enrich({}, { hypotheses: [] });
  assert.deepEqual(result.hypotheses, []);
  assert.match(result.reasoningNote, /insufficient evidence/i);
});
