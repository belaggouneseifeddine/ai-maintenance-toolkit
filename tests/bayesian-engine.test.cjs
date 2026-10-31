// Bayesian network regression coverage for relative evidence ranking and uncertainty.
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../bayesian-engine.js");

test("supporting evidence raises relative support above the prior", () => {
  const noEvidence = engine.scoreHypothesis({ label: "A", evidenceFor: [], evidenceAgainst: [] });
  const supported = engine.scoreHypothesis({ label: "A", evidenceFor: ["noise"], evidenceAgainst: [] });
  assert.ok(supported.relativeSupportScore > noEvidence.relativeSupportScore);
  assert.equal(supported.bayesianMethod, engine.NETWORK_VERSION);
});

test("legacy missing-information notes are unknown, not negative evidence", () => {
  const baseline = engine.scoreHypothesis({ label: "A", evidenceFor: [], evidenceAgainst: [] });
  const missing = engine.scoreHypothesis({ label: "A", evidenceFor: [], evidenceAgainst: ["No reliable pressure reading"] });
  assert.equal(missing.relativeSupportScore, baseline.relativeSupportScore);
  assert.equal(missing.evidenceUnknownCount, 1);
});

test("only explicit contradictory evidence lowers relative support", () => {
  const supported = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [{ id: "recorded trip", group: "control", state: "supports" }]
  });
  const contradicted = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [{ id: "recorded trip absent with verified log", group: "control", state: "contradicts" }]
  });
  assert.ok(contradicted.relativeSupportScore < supported.relativeSupportScore);
});

test("correlated evidence in one explicit network node group is not counted repeatedly", () => {
  const one = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [{ id: "suction pressure", group: "hydraulic_process", state: "supports" }]
  });
  const correlated = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [
      { id: "suction pressure", group: "hydraulic_process", state: "supports" },
      { id: "flow", group: "hydraulic_process", state: "supports" },
      { id: "discharge pressure", group: "hydraulic_process", state: "supports" }
    ]
  });
  assert.equal(correlated.relativeSupportScore, one.relativeSupportScore);
  assert.equal(correlated.evidenceGroupsUsed, 1);
});

test("known correlated hydraulic terms map to one evidence family", () => {
  const groups = ["suction pressure", "flow", "discharge pressure"].map(engine.inferEvidenceGroup);
  assert.deepEqual(groups, ["hydraulic_process", "hydraulic_process", "hydraulic_process"]);
});

test("independent evidence groups contribute separately and duplicates are ignored", () => {
  const single = engine.scoreHypothesis({ label: "A", evidenceFor: ["suction pressure"] });
  const independent = engine.scoreHypothesis({ label: "A", evidenceFor: ["suction pressure", "bearing vibration", "temperature trend"] });
  const duplicated = engine.scoreHypothesis({ label: "A", evidenceFor: ["suction pressure", "suction pressure", "suction pressure"] });
  assert.ok(independent.relativeSupportScore > single.relativeSupportScore);
  assert.equal(duplicated.relativeSupportScore, single.relativeSupportScore);
});

test("conflicting evidence within one group is reported and does not create a net update", () => {
  const baseline = engine.scoreHypothesis({ label: "A", evidenceFor: [] });
  const conflict = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [
      { id: "pressure low", group: "hydraulic", state: "supports" },
      { id: "pressure normal", group: "hydraulic", state: "contradicts" }
    ]
  });
  assert.equal(conflict.relativeSupportScore, baseline.relativeSupportScore);
  assert.equal(conflict.evidenceConflictCount, 1);
});

test("enrich ranks candidates and exposes network assumptions", () => {
  const result = engine.enrich({}, { hypotheses: [
    { label: "unknown", evidenceFor: [], evidenceAgainst: ["missing reading"] },
    { label: "supported", evidenceFor: ["noise", "temperature trend"], evidenceAgainst: [] }
  ] });
  assert.equal(result.hypotheses[0].label, "supported");
  assert.match(result.reasoningNote, /not calibrated probabilities/i);
  assert.equal(result.reasoningModel, "qualitative_bn_v1");
  assert.equal(result.network.calibrated, false);
  assert.match(result.network.conditionalIndependenceAssumption, /conditionally independent/i);
  assert.equal(result.hypotheses[0].supportBand, "higher_relative_support");
});

test("empty candidate list remains safely empty", () => {
  const result = engine.enrich({}, { hypotheses: [] });
  assert.deepEqual(result.hypotheses, []);
  assert.match(result.reasoningNote, /insufficient evidence/i);
});

test("posterior estimates remain finite and bounded for extreme evidence counts", () => {
  const result = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: Array.from({ length: 100 }, (_, index) => ({
      id: "node-" + index,
      group: "independent-" + index,
      state: "supports"
    }))
  }, 0.99);
  assert.ok(Number.isFinite(result.relativeSupportScore));
  assert.ok(result.relativeSupportScore > 0 && result.relativeSupportScore < 1);
});

test("evidence order does not change the relative support score", () => {
  const nodes = [
    { id: "suction pressure", group: "hydraulic", state: "supports" },
    { id: "bearing vibration", group: "mechanical", state: "supports" },
    { id: "verified command absent", group: "control", state: "contradicts" }
  ];
  const forward = engine.scoreHypothesis({ label: "A", evidenceNodes: nodes });
  const reversed = engine.scoreHypothesis({ label: "A", evidenceNodes: [...nodes].reverse() });
  assert.equal(forward.relativeSupportScore, reversed.relativeSupportScore);
  assert.equal(forward.evidenceGroupsUsed, reversed.evidenceGroupsUsed);
});

test("explicit unknown observations do not move the relative support score", () => {
  const baseline = engine.scoreHypothesis({ label: "A", evidenceNodes: [] });
  const withUnknown = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [
      { id: "pressure unavailable", group: "hydraulic", state: "unknown" },
      { id: "no reliable alarm history", group: "control", state: "unknown" }
    ]
  });
  assert.equal(withUnknown.relativeSupportScore, baseline.relativeSupportScore);
  assert.equal(withUnknown.evidenceGroupsUsed, 0);
  assert.equal(withUnknown.evidenceUnknownCount, 2);
});

test("invalid evidence states are ignored rather than treated as support", () => {
  const baseline = engine.scoreHypothesis({ label: "A", evidenceNodes: [] });
  const invalid = engine.scoreHypothesis({
    label: "A",
    evidenceNodes: [{ id: "untrusted label", group: "other", state: "confirmed" }]
  });
  assert.equal(invalid.relativeSupportScore, baseline.relativeSupportScore);
  assert.equal(invalid.evidenceGroupsUsed, 0);
});
