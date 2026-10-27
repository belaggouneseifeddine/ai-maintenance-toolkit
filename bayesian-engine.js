/* Transparent Bayesian-style reranking for offline maintenance hypotheses.
 * Likelihood ratios are conservative heuristics, not calibrated field probabilities.
 * Never use this score to override deterministic safety gates or OEM limits.
 */
(function (root) {
  "use strict";
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function logit(p) { return Math.log(p / (1 - p)); }
  function logistic(x) { return 1 / (1 + Math.exp(-x)); }

  function scoreHypothesis(hypothesis, prior = 0.2) {
    const supporting = Array.isArray(hypothesis && hypothesis.evidenceFor) ? hypothesis.evidenceFor : [];
    const opposing = Array.isArray(hypothesis && hypothesis.evidenceAgainst) ? hypothesis.evidenceAgainst : [];
    // Weak evidence increments only: repeated/more detailed notes must not create certainty.
    const supportLR = Math.pow(1.8, Math.min(supporting.length, 4));
    const opposeLR = Math.pow(1.7, Math.min(opposing.length, 4));
    const posterior = logistic(logit(clamp(prior, 0.05, 0.5)) + Math.log(supportLR) - Math.log(opposeLR));
    return {
      ...hypothesis,
      bayesianEstimate: Number(posterior.toFixed(3)),
      bayesianBand: posterior >= 0.65 ? "higher_relative_support" : posterior >= 0.35 ? "moderate_relative_support" : "lower_relative_support",
      bayesianMethod: "heuristic_likelihood_ratio_unvalidated"
    };
  }

  function enrich(input, result) {
    if (!result || !Array.isArray(result.hypotheses) || !result.hypotheses.length) {
      return { ...(result || {}), reasoningModel: "bayesian_style_local_v1", reasoningNote: "No candidate hypotheses; insufficient evidence." };
    }
    const ranked = result.hypotheses.map(h => scoreHypothesis(h, Number.isFinite(h.prior) ? h.prior : 0.2))
      .sort((a, b) => b.bayesianEstimate - a.bayesianEstimate);
    return {
      ...result,
      hypotheses: ranked,
      reasoningModel: "bayesian_style_local_v1",
      reasoningNote: "Relative estimates use unvalidated heuristic likelihood ratios; they are not calibrated probabilities and do not confirm a root cause.",
      uncertainty: ranked.length > 1 ? Number((ranked[0].bayesianEstimate - ranked[1].bayesianEstimate).toFixed(3)) : null
    };
  }

  root.MaintenanceBayesianEngine = { scoreHypothesis, enrich };
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceBayesianEngine;
})(typeof window !== "undefined" ? window : globalThis);
