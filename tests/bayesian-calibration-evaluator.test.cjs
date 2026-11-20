const test = require("node:test");
const assert = require("node:assert/strict");
const evaluator = require("../bayesian-calibration-evaluator.js");

const labels = ["cavitation", "air_lock"];
const groups = ["pump-A", "pump-B"];

test("evaluates a valid independent holdout without claiming calibration", () => {
  const result = evaluator.evaluateHoldout([
    { id: "case-1", assetGroup: "pump-C", split: "holdout", actual: "cavitation", probabilities: { cavitation: 0.9, air_lock: 0.1 } },
    { id: "case-2", assetGroup: "pump-D", split: "holdout", actual: "air_lock", probabilities: { cavitation: 0.2, air_lock: 0.8 } }
  ], { labels, trainingAssetGroups: groups });
  assert.equal(result.ok, true);
  assert.equal(result.status, "small_sample_warning");
  assert.equal(result.sampleCount, 2);
  assert.equal(result.calibrationEstablished, false);
  assert.ok(result.metrics.multiclassBrierScore >= 0);
  assert.ok(result.metrics.meanLogLoss >= 0);
});

test("rejects asset-level leakage between training and holdout", () => {
  const result = evaluator.evaluateHoldout([
    { id: "case-1", assetGroup: "pump-A", split: "test", actual: "cavitation", probabilities: { cavitation: 0.8, air_lock: 0.2 } }
  ], { labels, trainingAssetGroups: groups });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error === "asset_group_leakage:pump-A"));
});

test("rejects duplicate IDs and records outside the holdout split", () => {
  const result = evaluator.validateDatasetSplit([], [
    { id: "x", assetGroup: "A", split: "train" },
    { id: "x", assetGroup: "B", split: "holdout" }
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.startsWith("duplicate_holdout_id")));
  assert.ok(result.errors.some(error => error.startsWith("record_not_in_holdout_split")));
});

test("rejects malformed probability vectors", () => {
  const result = evaluator.evaluateHoldout([
    { id: "case-1", assetGroup: "pump-C", split: "holdout", actual: "cavitation", probabilities: { cavitation: 0.6, air_lock: 0.6 } }
  ], { labels, trainingAssetGroups: groups });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.startsWith("probabilities_do_not_sum_to_one")));
});

test("rejects missing labels, unknown actual classes and non-finite values", () => {
  const missing = evaluator.evaluateHoldout([
    { id: "case-1", assetGroup: "pump-C", split: "holdout", actual: "cavitation", probabilities: { cavitation: 1 } }
  ], { labels, trainingAssetGroups: groups });
  assert.ok(missing.errors.some(error => error.startsWith("probability_labels_mismatch")));
  const unknown = evaluator.evaluateHoldout([
    { id: "case-2", assetGroup: "pump-D", split: "holdout", actual: "seal_leak", probabilities: { cavitation: 0.5, air_lock: 0.5 } }
  ], { labels, trainingAssetGroups: groups });
  assert.ok(unknown.errors.some(error => error.startsWith("unknown_actual_label")));
});

test("perfect predictions score better than confidently wrong predictions", () => {
  const perfect = evaluator.evaluateHoldout([
    { id: "a", assetGroup: "P1", split: "holdout", actual: "cavitation", probabilities: { cavitation: 0.99, air_lock: 0.01 } }
  ], { labels, trainingAssetGroups: [] });
  const wrong = evaluator.evaluateHoldout([
    { id: "b", assetGroup: "P2", split: "holdout", actual: "cavitation", probabilities: { cavitation: 0.01, air_lock: 0.99 } }
  ], { labels, trainingAssetGroups: [] });
  assert.ok(perfect.metrics.multiclassBrierScore < wrong.metrics.multiclassBrierScore);
  assert.ok(perfect.metrics.meanLogLoss < wrong.metrics.meanLogLoss);
});
