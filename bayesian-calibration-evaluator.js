/* Offline evaluation helpers for multiclass diagnostic probabilities.
 * This module evaluates already-produced probabilities; it does not fit a model,
 * create priors, or turn heuristic scores into probabilities.
 */
(function (root) {
  "use strict";

  const EPSILON = 1e-15;
  const MIN_RECOMMENDED_SAMPLES = 30;

  function fail(status, errors) {
    return { ok: false, status, errors: errors || [] };
  }

  function validateDatasetSplit(trainingAssetGroups, holdoutRecords) {
    if (!Array.isArray(trainingAssetGroups) || !Array.isArray(holdoutRecords)) {
      return fail("invalid_split_inputs", ["trainingAssetGroups and holdoutRecords must be arrays"]);
    }
    const training = new Set(trainingAssetGroups.map(value => String(value || "").trim()).filter(Boolean));
    if (training.size !== trainingAssetGroups.length) {
      return fail("duplicate_training_asset_group", []);
    }
    const errors = [];
    const holdoutIds = new Set();
    for (const row of holdoutRecords) {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        errors.push("holdout_record_must_be_object");
        continue;
      }
      const id = String(row.id || "").trim();
      const group = String(row.assetGroup || "").trim();
      if (!id) errors.push("holdout_record_missing_id");
      else if (holdoutIds.has(id)) errors.push("duplicate_holdout_id:" + id);
      else holdoutIds.add(id);
      if (!group) errors.push("holdout_record_missing_asset_group:" + (id || "unknown"));
      else if (training.has(group)) errors.push("asset_group_leakage:" + group);
      if (row.split !== "holdout" && row.split !== "test") {
        errors.push("record_not_in_holdout_split:" + (id || "unknown"));
      }
    }
    return errors.length ? fail("invalid_or_leaking_split", errors) : { ok: true, status: "valid_split", count: holdoutRecords.length };
  }

  function evaluateHoldout(records, options) {
    if (!Array.isArray(records) || !records.length) return fail("empty_holdout", []);
    const config = options || {};
    const labels = Array.isArray(config.labels) ? config.labels.map(String) : [];
    if (labels.length < 2 || new Set(labels).size !== labels.length || labels.some(label => !label.trim())) {
      return fail("invalid_label_set", ["At least two unique labels are required"]);
    }
    if (!Array.isArray(config.trainingAssetGroups)) {
      return fail("training_groups_required", ["Supply asset groups used for training to detect leakage"]);
    }
    const split = validateDatasetSplit(config.trainingAssetGroups, records);
    if (!split.ok) return split;

    const errors = [];
    let brierTotal = 0;
    let logLossTotal = 0;
    const bins = Array.from({ length: 10 }, (_, index) => ({
      lower: index / 10, upper: (index + 1) / 10,
      count: 0, confidenceTotal: 0, accuracyTotal: 0
    }));

    for (const row of records) {
      if (!labels.includes(row.actual)) {
        errors.push("unknown_actual_label:" + row.id);
        continue;
      }
      const probabilities = row.probabilities;
      if (!probabilities || typeof probabilities !== "object" || Array.isArray(probabilities)) {
        errors.push("missing_probability_vector:" + row.id);
        continue;
      }
      const keys = Object.keys(probabilities).sort();
      if (keys.join("|") !== labels.slice().sort().join("|")) {
        errors.push("probability_labels_mismatch:" + row.id);
        continue;
      }
      const values = labels.map(label => Number(probabilities[label]));
      if (values.some(value => !Number.isFinite(value) || value < 0 || value > 1)) {
        errors.push("invalid_probability_value:" + row.id);
        continue;
      }
      const total = values.reduce((sum, value) => sum + value, 0);
      if (Math.abs(total - 1) > 1e-6) {
        errors.push("probabilities_do_not_sum_to_one:" + row.id);
        continue;
      }

      const actualIndex = labels.indexOf(row.actual);
      brierTotal += values.reduce((sum, value, index) =>
        sum + Math.pow(value - (index === actualIndex ? 1 : 0), 2), 0);
      logLossTotal += -Math.log(Math.max(EPSILON, values[actualIndex]));

      let bestIndex = 0;
      for (let index = 1; index < values.length; index += 1) {
        if (values[index] > values[bestIndex]) bestIndex = index;
      }
      const confidence = values[bestIndex];
      const binIndex = Math.min(9, Math.floor(confidence * 10));
      bins[binIndex].count += 1;
      bins[binIndex].confidenceTotal += confidence;
      bins[binIndex].accuracyTotal += bestIndex === actualIndex ? 1 : 0;
    }

    if (errors.length) return fail("invalid_holdout_records", errors);
    const count = records.length;
    const reliabilityBins = bins.filter(bin => bin.count > 0).map(bin => ({
      lower: bin.lower,
      upper: bin.upper,
      count: bin.count,
      meanConfidence: Number((bin.confidenceTotal / bin.count).toFixed(6)),
      accuracy: Number((bin.accuracyTotal / bin.count).toFixed(6))
    }));
    const ece = bins.reduce((sum, bin) => {
      if (!bin.count) return sum;
      return sum + (bin.count / count) * Math.abs(bin.confidenceTotal / bin.count - bin.accuracyTotal / bin.count);
    }, 0);

    return {
      ok: true,
      status: count >= MIN_RECOMMENDED_SAMPLES ? "evaluated_holdout" : "small_sample_warning",
      sampleCount: count,
      metrics: {
        multiclassBrierScore: Number((brierTotal / count).toFixed(6)),
        meanLogLoss: Number((logLossTotal / count).toFixed(6)),
        topLabelExpectedCalibrationError: Number(ece.toFixed(6))
      },
      reliabilityBins,
      calibrationEstablished: false,
      note: "Evaluation only. These metrics do not calibrate or validate the model by themselves. Review class balance, asset-level split, operating regime, uncertainty and external validation before describing probabilities as calibrated."
    };
  }

  const api = Object.freeze({ validateDatasetSplit, evaluateHoldout });
  root.MaintenanceBayesianCalibrationEvaluator = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
