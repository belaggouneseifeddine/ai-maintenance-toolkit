/* Offline evidence-grounded reasoning primitives.
 * Opt-in module: does not replace the production diagnostic engine.
 * A link is never evidence by itself; source scope and claim-level review must match.
 */
(function (root) {
  "use strict";
  const ALLOWED_STATUSES = new Set(["verified", "review-needed", "source-not-recorded"]);
  function list(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return typeof value === "string" ? value.trim() : ""; }
  function normalized(value) { return text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

  function indexEvidence(items) {
    const index = new Map();
    for (const item of list(items)) {
      if (!item || typeof item !== "object") continue;
      const id = text(item.id);
      if (!id || index.has(id) || !ALLOWED_STATUSES.has(item.status)) continue;
      index.set(id, item);
    }
    return index;
  }
  function scopeMatches(source, equipment) {
    const scope = source && source.scope;
    if (!scope || typeof scope !== "object") return false;
    const manufacturer = normalized(equipment && equipment.manufacturer);
    const model = normalized(equipment && equipment.model);
    if (!manufacturer || !model) return false;
    return list(scope.manufacturers).some(x => normalized(x) === manufacturer) &&
      list(scope.models).some(x => normalized(x) === model);
  }
  function validHttpsUrl(value) {
    try { const url = new URL(text(value)); return url.protocol === "https:" && Boolean(url.hostname); }
    catch (_) { return false; }
  }
  function traceEvidence(ids, evidenceIndex, equipment, hypothesisId) {
    return list(ids).map(rawId => {
      const id = text(rawId), source = evidenceIndex.get(id);
      if (!source) return { sourceId: id, status: "missing-source", applicable: false, reason: "No matching evidence record." };
      const exactScope = scopeMatches(source, equipment);
      const claim = list(source.verifiedClaims).find(item => item && typeof item === "object" &&
        text(item.hypothesisId) === hypothesisId && item.reviewed === true && text(item.claim) !== "");
      const validSource = validHttpsUrl(source.url) && text(source.title) !== "";
      const applicable = source.status === "verified" && exactScope && Boolean(claim) && validSource;
      let reason = "Source is not verified for this specific hypothesis and equipment.";
      if (!validSource) reason = "Source metadata is incomplete or URL is not HTTPS.";
      else if (!exactScope) reason = "Exact manufacturer and model scope was not established.";
      else if (!claim) reason = "No reviewed claim is linked to this hypothesis.";
      else if (source.status !== "verified") reason = "Source review is not complete.";
      else reason = "Reviewed claim and exact equipment scope are recorded; confirm applicability before maintenance.";
      return {
        sourceId: id, title: text(source.title), url: validHttpsUrl(source.url) ? text(source.url) : "",
        section: text(source.section), page: Number.isInteger(source.page) && source.page > 0 ? source.page : null,
        status: source.status, applicable, claim: claim ? text(claim.claim) : "", reason
      };
    });
  }
  function nextStepFor(hypothesis, answers) {
    const questions = list(hypothesis && hypothesis.followUps);
    const answerMap = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
    for (const question of questions) {
      const id = text(question && question.id);
      if (!id || answerMap[id] == null || answerMap[id] === "") continue;
      const routes = question.routes && typeof question.routes === "object" ? question.routes : {};
      const route = routes[String(answerMap[id])];
      if (route && typeof route === "object") return {
        questionId: text(route.nextQuestionId) || null, action: text(route.action) || "collect-information",
        rationale: text(route.rationale) || "Follow the documented site procedure.", basedOnAnswer: String(answerMap[id])
      };
    }
    const unanswered = questions.find(question => {
      const id = text(question && question.id);
      return id && (answerMap[id] == null || answerMap[id] === "");
    });
    return unanswered ? {
      questionId: text(unanswered.id), prompt: text(unanswered.prompt), action: "collect-information",
      rationale: "No structured answer has been recorded for this question."
    } : null;
  }
  function analyse(input) {
    const request = input && typeof input === "object" ? input : {};
    const equipment = request.equipment && typeof request.equipment === "object" ? request.equipment : {};
    const evidenceIndex = indexEvidence(request.evidence);
    const answers = request.answers && typeof request.answers === "object" ? request.answers : {};
    const hypotheses = list(request.hypotheses).filter(item => item && typeof item === "object");
    const results = hypotheses.map(hypothesis => {
      const id = text(hypothesis.id);
      const supportingEvidence = traceEvidence(hypothesis.supportEvidenceIds, evidenceIndex, equipment, id);
      const contradictingEvidence = traceEvidence(hypothesis.contradictionEvidenceIds, evidenceIndex, equipment, id);
      const supportCount = supportingEvidence.filter(item => item.applicable).length;
      const contradictionCount = contradictingEvidence.filter(item => item.applicable).length;
      const evidenceState = supportCount && contradictionCount ? "mixed-evidence"
        : supportCount ? "source-supported-hypothesis"
        : contradictionCount ? "contradictory-evidence" : "insufficient-verified-evidence";
      return {
        hypothesisId: id, label: text(hypothesis.label), status: "exploratory-hypothesis", evidenceState,
        supportingEvidence, contradictingEvidence, nextStep: nextStepFor(hypothesis, answers),
        limitations: [
          "This is a preliminary hypothesis, not a confirmed fault.",
          "A source URL or a claim about another hypothesis does not count as supporting evidence.",
          "Check the exact equipment model, revision, site procedure and operating conditions."
        ]
      };
    });
    return {
      status: "preliminary",
      equipment: { manufacturer: text(equipment.manufacturer), model: text(equipment.model) },
      results, confirmedFault: null,
      evidencePolicy: "Only reviewed, hypothesis-linked claims from verified HTTPS sources with exact manufacturer and model scope count as applicable evidence."
    };
  }
  const api = Object.freeze({ analyse, scopeMatches });
  root.MaintenanceEvidenceReasoning = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
