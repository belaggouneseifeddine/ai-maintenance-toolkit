/* Local, dependency-free evaluation records for internal reasoning.
 * This module does not persist data or confirm a root cause; callers must save records explicitly.
 */
(function (root) {
  "use strict";

  function normalizeId(value) {
    return typeof value === "string" ? value.trim().slice(0, 120) : "";
  }

  function createOutcomeRecord(prediction, outcome) {
    if (!prediction || typeof prediction !== "object" || !Array.isArray(prediction.hypotheses)) {
      return { ok: false, errors: [{ code: "invalid_prediction" }] };
    }
    if (!outcome || typeof outcome !== "object") {
      return { ok: false, errors: [{ code: "invalid_outcome" }] };
    }

    const actualStatus = outcome.status;
    if (!["confirmed", "unresolved", "inconclusive"].includes(actualStatus)) {
      return { ok: false, errors: [{ code: "invalid_outcome_status" }] };
    }
    const actualCauseId = normalizeId(outcome.actualCauseId);
    if (actualStatus === "confirmed" && !actualCauseId) {
      return { ok: false, errors: [{ code: "confirmed_cause_required" }] };
    }

    const predictedIds = prediction.hypotheses
      .map(item => normalizeId(item && item.id))
      .filter(Boolean);
    const matched = actualStatus === "confirmed" && predictedIds.includes(actualCauseId);
    const comparison = actualStatus !== "confirmed"
      ? "indeterminate"
      : matched ? "hit" : "miss";

    return {
      ok: true,
      record: {
        schemaVersion: 1,
        recordType: "reasoning_outcome",
        prediction: {
          mode: normalizeId(prediction.mode) || "unknown",
          hypothesisIds: predictedIds.slice(0, 10),
          confirmedCause: ""
        },
        outcome: {
          status: actualStatus,
          actualCauseId: actualStatus === "confirmed" ? actualCauseId : "",
          intervention: normalizeId(outcome.intervention),
          observedResult: normalizeId(outcome.observedResult),
          notes: normalizeId(outcome.notes)
        },
        comparison,
        evaluationNote: comparison === "hit"
          ? "The confirmed cause was among the predicted hypotheses; this does not establish that the ranking was optimal."
          : comparison === "miss"
            ? "The confirmed cause was not among the predicted hypotheses; review the case and update the test set only after verification."
            : "No confirmed cause was supplied; do not score this case as a hit or miss."
      }
    };
  }

  const api = Object.freeze({ version: "0.1.0", createOutcomeRecord });
  root.MaintenanceReasoningEvaluation = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
