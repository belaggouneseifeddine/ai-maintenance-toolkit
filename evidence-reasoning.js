/* Evidence-aware local reasoning primitives.
 * This module is opt-in and does not replace the production diagnostic engine.
 * It never infers source applicability from free-text notes or marks a fault confirmed.
 */
(function (root) {
  "use strict";

  const VERIFIED = "verified";
  const SAFE_STATUSES = new Set(["verified", "review-needed", "source-not-recorded"]);

  function asList(value) {
    return Array.isArray(value) ? value : [];
  }

  function clean(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function indexEvidence(evidence) {
    const map = new Map();
    for (const item of asList(evidence)) {
      if (!item || typeof item !== "object") continue;
      const id = clean(item.id);
      if (!id || map.has(id)) continue;
      if (!SAFE_STATUSES.has(item.status)) continue;
      map.set(id, item);
    }
    return map;
  }

  function scopeMatches(source, equipment) {
    const requestedModel = clean(equipment && equipment.model).toLowerCase();
    const requestedManufacturer = clean(equipment && equipment.manufacturer).toLowerCase();
    const scope = source && source.scope;
    if (!scope || typeof scope !== "object") return false;
    const models = asList(scope.models).map(value => clean(value).toLowerCase());
    const manufacturers = asList(scope.manufacturers).map(value => clean(value).toLowerCase());
    if (!requestedModel || !requestedManufacturer) return false;
    return models.includes(requestedModel) && manufacturers.includes(requestedManufacturer);
  }

  function traceEvidence(ids, evidenceById, equipment) {
    return asList(ids).map(id => {
      const source = evidenceById.get(clean(id));
      if (!source) {
        return { sourceId: clean(id), status: "missing-source", applicable: false, reason: "No matching evidence record." };
      }
      const exactScope = scopeMatches(source, equipment);
      const claimVerified = source.status === VERIFIED &&
        Array.isArray(source.verifiedClaims) &&
        source.verifiedClaims.some(claim => clean(claim) !== "");
      const applicable = exactScope && claimVerified;
      return {
        sourceId: source.id,
        title: clean(source.title),
        url: clean(source.url),
        section: clean(source.section),
        page: Number.isInteger(source.page) && source.page > 0 ? source.page : null,
        status: source.status,
        applicable,
        reason: applicable
          ? "Exact equipment scope and at least one reviewed claim are recorded."
          : !exactScope
            ? "Exact manufacturer and model scope was not established."
            : "The source claim is not recorded as verified."
      };
    });
  }

  function followUpFor(hypothesis, answers) {
    const questions = asList(hypothesis && hypothesis.followUps);
    const answerMap = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
    for (const question of questions) {
      const answer = answerMap[clean(question.id)];
      if (answer == null || answer === "") continue;
      const route = question.routes && question.routes[String(answer)];
      if (route) {
        return {
          questionId: clean(route.nextQuestionId),
          action: clean(route.action),
          rationale: clean(route.rationale),
          basedOnAnswer: String(answer)
        };
      }
    }
    const firstUnanswered = questions.find(question => answerMap[clean(question.id)] == null || answerMap[clean(question.id)] === "");
    return firstUnanswered ? {
      questionId: clean(firstUnanswered.id),
      prompt: clean(firstUnanswered.prompt),
      action: "collect-information",
      rationale: "No structured answer has been recorded for this question."
    } : null;
  }

  function analyse(input) {
    const request = input && typeof input === "object" ? input : {};
    const evidenceById = indexEvidence(request.evidence);
    const equipment = request.equipment && typeof request.equipment === "object" ? request.equipment : {};
    const answers = request.answers && typeof request.answers === "object" ? request.answers : {};
    const hypotheses = asList(request.hypotheses).filter(item => item && typeof item === "object");

    const results = hypotheses.map(hypothesis => {
      const support = traceEvidence(hypothesis.supportEvidenceIds, evidenceById, equipment);
      const contradiction = traceEvidence(hypothesis.contradictionEvidenceIds, evidenceById, equipment);
      const applicableSupport = support.filter(item => item.applicable);
      const applicableContradiction = contradiction.filter(item => item.applicable);
      const evidenceState = applicableSupport.length && applicableContradiction.length
        ? "mixed-evidence"
        : applicableSupport.length
          ? "source-supported-hypothesis"
          : applicableContradiction.length
            ? "contradictory-evidence"
            : "insufficient-verified-evidence";
      return {
        hypothesisId: clean(hypothesis.id),
        label: clean(hypothesis.label),
        status: "exploratory-hypothesis",
        evidenceState,
        supportingEvidence: support,
        contradictingEvidence: contradiction,
        limitations: [
          "This is a preliminary hypothesis, not a confirmed fault.",
          "A source link alone does not establish that it supports this claim."
        ],
        nextStep: followUpFor(hypothesis, answers)
      };
    });

    return {
      status: "preliminary",
      equipment: {
        manufacturer: clean(equipment.manufacturer),
        model: clean(equipment.model)
      },
      results,
      confirmedFault: null,
      evidencePolicy: "Only explicitly verified claims with exact manufacturer and model scope count as source-applicable evidence."
    };
  }

  const api = Object.freeze({ analyse, scopeMatches });
  root.MaintenanceEvidenceReasoning = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
