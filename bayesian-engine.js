/* Qualitative Bayesian network for offline maintenance hypothesis ranking.
 * Network: candidate cause -> grouped observable evidence nodes.
 * The likelihood ratios are conservative engineering heuristics, not learned or
 * calibrated from field-failure datasets. Scores are relative support only.
 * Missing information is UNKNOWN, never negative evidence. Safety/OEM gates
 * remain outside this engine and always take precedence.
 */
(function (root) {
  "use strict";

  const NETWORK_VERSION = "qualitative_bn_v1";
  const DEFAULT_PRIOR = 0.2;
  const SUPPORT_LR = 1.5;
  const CONTRADICTION_LR = 1 / SUPPORT_LR;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const logit = p => Math.log(p / (1 - p));
  const logistic = x => 1 / (1 + Math.exp(-x));

  function normalizeEvidence(value) {
    return String(value == null ? "" : value)
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .trim()
      .replace(/\\s+/g, " ");
  }

  function inferEvidenceGroup(value) {
    const text = normalizeEvidence(value);
    if (/suction|aspiration|pressure|debit|flow|تدفق|ضغط|سحب|مستوى|level/.test(text)) return "hydraulic_process";
    if (/trip|alarm|fault|command|permissive|voltage|current|drive|contactor|plc|إنذار|فصل|أمر|جهد|تيار/.test(text)) return "control_electrical";
    if (/noise|vibration|bearing|alignment|coupling|ضجيج|اهتزاز|محمل|محاذاة/.test(text)) return "mechanical_condition";
    if (/temperature|thermal|heat|overheat|حرارة|سخونة/.test(text)) return "thermal_condition";
    if (/oil|grease|lubric|زيت|شحوم|تشحيم/.test(text)) return "lubrication";
    if (/filter|strainer|blockage|valve|مرشح|مصفاة|انسداد|صمام/.test(text)) return "flow_path";
    return "other:" + text;
  }

  function collectEvidenceNodes(hypothesis) {
    const explicit = Array.isArray(hypothesis && hypothesis.evidenceNodes)
      ? hypothesis.evidenceNodes
      : null;
    if (explicit) {
      return explicit.filter(node =>
        node && typeof node === "object" &&
        ["supports", "contradicts", "unknown"].includes(node.state) &&
        String(node.id || "").trim()
      ).map(node => ({
        id: normalizeEvidence(node.id),
        group: String(node.group || inferEvidenceGroup(node.id)),
        state: node.state
      }));
    }

    // Backward compatibility: matched terms are weak support. Existing
    // evidenceAgainst strings mostly describe missing information, so treat
    // them as unknown unless a caller supplies an explicit contradiction node.
    const supporting = Array.isArray(hypothesis && hypothesis.evidenceFor) ? hypothesis.evidenceFor : [];
    const unknown = Array.isArray(hypothesis && hypothesis.evidenceAgainst) ? hypothesis.evidenceAgainst : [];
    return [
      ...supporting.map(value => ({ id: normalizeEvidence(value), group: inferEvidenceGroup(value), state: "supports" })),
      ...unknown.map(value => ({ id: normalizeEvidence(value), group: inferEvidenceGroup(value), state: "unknown" }))
    ].filter(node => node.id);
  }

  function updatePosterior(prior, nodes) {
    const grouped = new Map();
    const seen = new Set();
    for (const node of nodes) {
      if (!node.id || seen.has(node.id)) continue;
      seen.add(node.id);
      const current = grouped.get(node.group) || { supports: 0, contradicts: 0, unknown: 0 };
      current[node.state] += 1;
      grouped.set(node.group, current);
    }

    // Each evidence family contributes at most one net update. This limits
    // double-counting correlated terms such as pressure + suction + flow.
    let logOdds = logit(clamp(prior, 0.05, 0.5));
    let usedGroups = 0;
    let conflicts = 0;
    let unknownCount = 0;
    for (const counts of grouped.values()) {
      unknownCount += counts.unknown;
      const net = Math.sign(counts.supports - counts.contradicts);
      if (counts.supports && counts.contradicts) conflicts += 1;
      if (!net) continue;
      logOdds += net > 0 ? Math.log(SUPPORT_LR) : Math.log(CONTRADICTION_LR);
      usedGroups += 1;
    }
    return {
      estimate: clamp(logistic(logOdds), 0.0001, 0.9999),
      evidenceGroupsUsed: usedGroups,
      evidenceUnknownCount: unknownCount,
      evidenceConflictCount: conflicts
    };
  }

  function scoreHypothesis(hypothesis, prior = DEFAULT_PRIOR) {
    const nodes = collectEvidenceNodes(hypothesis);
    const result = updatePosterior(Number.isFinite(prior) ? prior : DEFAULT_PRIOR, nodes);
    const estimate = Number(result.estimate.toFixed(4));
    return {
      ...hypothesis,
      relativeSupportScore: estimate,
      supportBand: estimate >= 0.35 ? "higher_relative_support" : estimate >= 0.15 ? "moderate_relative_support" : "lower_relative_support",
      bayesianMethod: NETWORK_VERSION,
      evidenceGroupsUsed: result.evidenceGroupsUsed,
      evidenceUnknownCount: result.evidenceUnknownCount,
      evidenceConflictCount: result.evidenceConflictCount
    };
  }

  function enrich(input, result) {
    if (!result || !Array.isArray(result.hypotheses) || !result.hypotheses.length) {
      return {
        ...(result || {}),
        reasoningModel: NETWORK_VERSION,
        reasoningNote: "Insufficient evidence; no candidate hypotheses are available."
      };
    }
    const ranked = result.hypotheses
      .map(hypothesis => scoreHypothesis(hypothesis, Number.isFinite(hypothesis.prior) ? hypothesis.prior : DEFAULT_PRIOR))
      .sort((a, b) => b.relativeSupportScore - a.relativeSupportScore);
    const gap = ranked.length > 1
      ? Number((ranked[0].relativeSupportScore - ranked[1].relativeSupportScore).toFixed(4))
      : null;
    return {
      ...result,
      hypotheses: ranked,
      reasoningModel: NETWORK_VERSION,
      reasoningNote: "A qualitative cause-to-evidence network ranks relative support. Likelihood assumptions are unvalidated and not calibrated probabilities. Missing readings are unknown, not evidence against a cause; correlated evidence is grouped to reduce double-counting. No cause is confirmed.",
      uncertainty: gap,
      network: {
        version: NETWORK_VERSION,
        structure: "candidate_cause_to_grouped_observation_nodes",
        conditionalIndependenceAssumption: "evidence groups are treated as conditionally independent given each candidate cause",
        calibrated: false
      }
    };
  }

  root.MaintenanceBayesianEngine = {
    NETWORK_VERSION,
    collectEvidenceNodes,
    inferEvidenceGroup,
    updatePosterior,
    scoreHypothesis,
    enrich
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceBayesianEngine;
})(typeof window !== "undefined" ? window : globalThis);
