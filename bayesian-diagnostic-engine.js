/* Exact inference for small binary Bayesian networks.
 * Pure JavaScript: no DOM, network, storage, or external dependencies.
 * Probabilities are only as defensible as the supplied CPTs; this engine does not calibrate them.
 */
(function (root) {
  "use strict";
  const MAX_NODES = 20, EPSILON = 1e-12;
  const isProbability = value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

  function validateNetwork(network) {
    if (!network || !Array.isArray(network.nodes) || !network.nodes.length) throw new TypeError("network_nodes_required");
    if (network.nodes.length > MAX_NODES) throw new RangeError("network_too_large");
    const byName = new Map();
    for (const node of network.nodes) {
      if (!node || typeof node.name !== "string" || !node.name || byName.has(node.name)) throw new TypeError("invalid_or_duplicate_node");
      if (!Array.isArray(node.parents)) throw new TypeError("node_parents_required:" + node.name);
      byName.set(node.name, node);
    }
    const ordered = [], seen = new Set();
    for (const node of network.nodes) {
      for (const parent of node.parents) {
        if (!byName.has(parent)) throw new TypeError("unknown_parent:" + parent);
        if (parent === node.name) throw new TypeError("self_parent:" + node.name);
      }
      if (node.parents.some(parent => !seen.has(parent))) throw new TypeError("nodes_must_be_topologically_ordered:" + node.name);
      if (node.parents.length > 10) throw new RangeError("too_many_parents:" + node.name);
      if (!node.parents.length) {
        if (!isProbability(node.pTrue)) throw new TypeError("invalid_root_probability:" + node.name);
      } else {
        if (!node.cpt || typeof node.cpt !== "object") throw new TypeError("conditional_table_required:" + node.name);
        if (Object.keys(node.cpt).length !== 2 ** node.parents.length) throw new TypeError("incomplete_conditional_table:" + node.name);
        for (const probability of Object.values(node.cpt)) if (!isProbability(probability)) throw new TypeError("invalid_conditional_probability:" + node.name);
        for (let mask = 0; mask < 2 ** node.parents.length; mask++) {
          const key = node.parents.map((_, index) => Boolean(mask & (1 << (node.parents.length - index - 1))) ? "1" : "0").join(",");
          if (!Object.prototype.hasOwnProperty.call(node.cpt, key)) throw new TypeError("missing_conditional_row:" + node.name + ":" + key);
        }
      }
      seen.add(node.name); ordered.push(node);
    }
    return { ordered, byName };
  }
  function probabilityTrue(node, assignment) {
    if (!node.parents.length) return node.pTrue;
    return node.cpt[node.parents.map(parent => assignment[parent] ? "1" : "0").join(",")];
  }
  function enumerate(index, ordered, assignment, evidence, weight, totals, queryNames) {
    if (index === ordered.length) {
      for (const name of queryNames) totals[name][assignment[name] ? "1" : "0"] += weight;
      totals.mass += weight; return;
    }
    const node = ordered[index], pTrue = probabilityTrue(node, assignment);
    const fixed = Object.prototype.hasOwnProperty.call(evidence, node.name) ? evidence[node.name] : undefined;
    for (const value of typeof fixed === "boolean" ? [fixed] : [false, true]) {
      assignment[node.name] = value;
      const factor = value ? pTrue : 1 - pTrue;
      if (factor > 0) enumerate(index + 1, ordered, assignment, evidence, weight * factor, totals, queryNames);
    }
    delete assignment[node.name];
  }
  function infer(network, options) {
    const config = options || {}, validated = validateNetwork(network), evidence = config.evidence || {};
    if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) throw new TypeError("invalid_evidence");
    for (const [name, value] of Object.entries(evidence)) {
      if (!validated.byName.has(name)) throw new TypeError("unknown_evidence_node:" + name);
      if (typeof value !== "boolean") throw new TypeError("evidence_must_be_boolean:" + name);
    }
    const queryNames = config.query && config.query.length ? Array.from(new Set(config.query)) :
      validated.ordered.filter(node => !node.parents.length).map(node => node.name);
    for (const name of queryNames) if (!validated.byName.has(name)) throw new TypeError("unknown_query_node:" + name);
    const totals = { mass: 0 };
    queryNames.forEach(name => { totals[name] = { "0": 0, "1": 0 }; });
    enumerate(0, validated.ordered, {}, evidence, 1, totals, queryNames);
    if (totals.mass <= EPSILON) return { ok: false, status: "impossible_evidence", evidence: { ...evidence }, results: [] };
    return {
      ok: true, status: "inference_completed", evidence: { ...evidence }, evidenceMass: totals.mass,
      results: queryNames.map(name => ({ node: name, probabilityTrue: totals[name]["1"] / totals.mass,
        probabilityFalse: totals[name]["0"] / totals.mass })).sort((a, b) => b.probabilityTrue - a.probabilityTrue)
    };
  }
  function buildCpt(parents, likelihood) {
    const table = {};
    for (let mask = 0; mask < 2 ** parents.length; mask++) {
      const values = parents.map((_, index) => Boolean(mask & (1 << (parents.length - index - 1))));
      const assignment = {}; parents.forEach((name, index) => { assignment[name] = values[index]; });
      table[values.map(value => value ? "1" : "0").join(",")] = likelihood(assignment);
    }
    return table;
  }
  const PUMP_LOW_FLOW_MODEL = (function () {
    const nodes = [
      { name: "suctionRestriction", parents: [], pTrue: 0.18 },
      { name: "downstreamRestriction", parents: [], pTrue: 0.15 },
      { name: "insufficientSupply", parents: [], pTrue: 0.16 },
      { name: "measurementFault", parents: [], pTrue: 0.05 }
    ];
    const observation = (name, parents, base, effects) => nodes.push({ name, parents, cpt: buildCpt(parents, assignment => {
      let complement = 1 - base;
      for (const parent of parents) if (assignment[parent]) complement *= 1 - (effects[parent] || 0);
      return 1 - complement;
    }) });
    observation("suctionPressureLow", ["suctionRestriction", "insufficientSupply"], 0.08, { suctionRestriction: 0.78, insufficientSupply: 0.62 });
    observation("dischargePressureHigh", ["downstreamRestriction", "suctionRestriction", "insufficientSupply"], 0.07, { downstreamRestriction: 0.78, suctionRestriction: 0.04, insufficientSupply: 0.03 });
    observation("sourceLevelLow", ["insufficientSupply", "suctionRestriction"], 0.06, { insufficientSupply: 0.76, suctionRestriction: 0.12 });
    observation("flowMeterUnreliable", ["measurementFault"], 0.05, { measurementFault: 0.84 });
    return Object.freeze({
      id: "pump-low-flow-v1", equipment: "pump", symptom: "low_flow",
      probabilityBasis: "provisional_engineering_elicitation_not_empirical",
      assumptions: [
        "Root priors are provisional starting assumptions conditioned on the pump-low-flow scenario.",
        "Observation likelihoods are provisional assumptions and have not been calibrated against field outcomes.",
        "Observations are treated as conditionally independent given their listed parent causes.",
        "An unknown observation must be omitted from evidence; unknown is not the same as false."
      ],
      causeLabels: {
        suctionRestriction: { ar: "تقييد محتمل في السحب", en: "Possible suction restriction", fr: "Restriction possible à l’aspiration" },
        downstreamRestriction: { ar: "تقييد محتمل بعد المضخة", en: "Possible downstream restriction", fr: "Restriction possible en aval" },
        insufficientSupply: { ar: "تغذية أو مستوى مصدر غير كافٍ", en: "Possible insufficient supply/source level", fr: "Alimentation ou niveau de source insuffisant" },
        measurementFault: { ar: "خلل محتمل في قياس التدفق", en: "Possible flow-measurement fault", fr: "Défaut possible de mesure du débit" }
      },
      evidenceLabels: {
        suctionPressureLow: { ar: "ضغط السحب منخفض", en: "Suction pressure is low", fr: "Pression d’aspiration basse" },
        dischargePressureHigh: { ar: "ضغط الخروج مرتفع", en: "Discharge pressure is high", fr: "Pression de refoulement élevée" },
        sourceLevelLow: { ar: "مستوى المصدر منخفض", en: "Source level is low", fr: "Niveau de la source bas" },
        flowMeterUnreliable: { ar: "قراءة مقياس التدفق غير موثوقة", en: "Flow-meter reading is unreliable", fr: "Mesure du débit non fiable" }
      }, nodes
    });
  }());
  root.MaintenanceBayesianDiagnostic = Object.freeze({ version: "0.1.0", infer, validateNetwork,
    models: Object.freeze({ pumpLowFlow: PUMP_LOW_FLOW_MODEL }) });
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceBayesianDiagnostic;
}(typeof globalThis !== "undefined" ? globalThis : this));
