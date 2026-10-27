const test = require("node:test");
const assert = require("node:assert/strict");
const bayes = require("../bayesian-diagnostic-engine.js");

test("binary inference updates posterior after positive evidence", () => {
  const network = { nodes: [
    { name: "fault", parents: [], pTrue: 0.1 },
    { name: "alarm", parents: ["fault"], cpt: { "0": 0.05, "1": 0.9 } }
  ] };
  const result = bayes.infer(network, { evidence: { alarm: true }, query: ["fault"] });
  assert.equal(result.ok, true);
  assert.ok(Math.abs(result.results[0].probabilityTrue - 0.6666666667) < 1e-8);
});
test("negative evidence lowers posterior", () => {
  const network = { nodes: [
    { name: "fault", parents: [], pTrue: 0.2 },
    { name: "alarm", parents: ["fault"], cpt: { "0": 0.1, "1": 0.8 } }
  ] };
  const result = bayes.infer(network, { evidence: { alarm: false }, query: ["fault"] });
  assert.ok(result.results[0].probabilityTrue < 0.2);
});
test("unknown evidence is omitted rather than interpreted as false", () => {
  const model = bayes.models.pumpLowFlow;
  const prior = bayes.infer(model, { evidence: {}, query: ["suctionRestriction"] });
  const negative = bayes.infer(model, { evidence: { suctionPressureLow: false }, query: ["suctionRestriction"] });
  assert.ok(Math.abs(prior.results[0].probabilityTrue - 0.18) < 1e-10);
  assert.notEqual(negative.results[0].probabilityTrue, prior.results[0].probabilityTrue);
});
test("pump low-flow model ranks four causes with valid probabilities", () => {
  const model = bayes.models.pumpLowFlow;
  const result = bayes.infer(model, { evidence: { suctionPressureLow: true, sourceLevelLow: true }, query: Object.keys(model.causeLabels) });
  assert.equal(result.ok, true);
  assert.equal(result.results.length, 4);
  assert.ok(result.results[0].probabilityTrue > result.results[3].probabilityTrue);
  for (const item of result.results) {
    assert.ok(item.probabilityTrue >= 0 && item.probabilityTrue <= 1);
    assert.ok(Math.abs(item.probabilityTrue + item.probabilityFalse - 1) < 1e-10);
  }
});
test("invalid probabilities and non-topological nodes are rejected", () => {
  assert.throws(() => bayes.validateNetwork({ nodes: [{ name: "fault", parents: [], pTrue: 1.2 }] }), /invalid_root_probability/);
  assert.throws(() => bayes.validateNetwork({ nodes: [
    { name: "child", parents: ["parent"], cpt: { "0": 0.1, "1": 0.9 } },
    { name: "parent", parents: [], pTrue: 0.2 }
  ] }), /topologically_ordered/);
});
test("unknown evidence nodes and non-boolean evidence are rejected", () => {
  const model = bayes.models.pumpLowFlow;
  assert.throws(() => bayes.infer(model, { evidence: { missing: true } }), /unknown_evidence_node/);
  assert.throws(() => bayes.infer(model, { evidence: { sourceLevelLow: "unknown" } }), /evidence_must_be_boolean/);
});
test("impossible evidence returns a stable status", () => {
  const model = { nodes: [{ name: "certain", parents: [], pTrue: 1 }] };
  const result = bayes.infer(model, { evidence: { certain: false }, query: ["certain"] });
  assert.equal(result.ok, false);
  assert.equal(result.status, "impossible_evidence");
});
