/* DOM-free projection from local diagnosis and guided answers into the shared session contract. */
(function (root) {
  "use strict";
  let sequence = 0;
  const safe = value => String(value == null ? "" : value).slice(0, 1000);
  const flowKey = value => String(value || "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42) || "guided";
  function add(assistant, collection, record) {
    try { assistant.addDiagnosticRecord(collection, record); return true; }
    catch (error) { console.warn("Diagnostic state record was not stored:", collection, error); return false; }
  }
  function upsert(assistant, collection, record) {
    try { assistant.upsertDiagnosticRecord(collection, record); return true; }
    catch (error) { console.warn("Diagnostic state record was not stored:", collection, error); return false; }
  }
  function syncLocalAssessment(assistant, request, diagnosis) {
    if (!assistant || !diagnosis || typeof assistant.getSession !== "function") return { ok: false, reason: "invalid_projection_input" };
    const now = new Date().toISOString();
    const prefix = "diag-" + Date.now().toString(36) + "-" + (++sequence).toString(36);
    const equipment = request && request.equipment || {};
    const measurements = Array.isArray(request && request.measurements) ? request.measurements : [];
    const observations = Array.isArray(request && request.observations) ? request.observations : [];
    try {
      assistant.updateEquipment({
        type: safe(equipment.type).slice(0, 120),
        manufacturer: safe(equipment.manufacturer).slice(0, 120),
        model: safe(equipment.model).slice(0, 120)
      });
      assistant.updateOperatingContext({
        capturedAt: now, language: request.language || "ar",
        measurementCount: measurements.length
      });
    } catch (error) { console.warn("Diagnostic operating context was not stored.", error); }
    const symptom = safe(request && request.symptom);
    if (symptom) add(assistant, "symptoms", {
      id: prefix + "-symptom", value: symptom, provenance: "user_reported",
      status: "reported", recordedAt: now
    });
    measurements.slice(0, 10).forEach((item, index) => {
      const source = item && item.sourceType;
      const provenance = ["direct_measurement", "plc_value", "historian_value"].includes(source)
        ? "measured" : source === "user_reported" ? "user_reported" : "unknown";
      add(assistant, "measurements", {
        id: prefix + "-measurement-" + index, name: safe(item && item.name),
        value: item && item.value, unit: safe(item && item.unit), sourceType: safe(source),
        timestamp: safe(item && item.timestamp), operatingCondition: safe(item && item.operatingCondition),
        sensorStatus: safe(item && item.sensorStatus || "unknown"),
        qualityFlag: safe(item && item.qualityFlag || "unknown"),
        provenance, recordedAt: now
      });
    });
    observations.slice(0, 10).forEach((value, index) => add(assistant, "evidence", {
      id: prefix + "-observation-" + index, observation: safe(value),
      polarity: "unclassified", provenance: "user_reported", status: "reported", recordedAt: now
    }));
    (Array.isArray(diagnosis.results) ? diagnosis.results : []).slice(0, 20).forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const label = safe(item.label || item.title || item.name || item.fault || item.id);
      const key = safe(item.id || item.code || label).toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || String(index + 1);
      upsert(assistant, "hypotheses", {
        id: "hypothesis-" + key, label, score: Number.isFinite(item.score) ? item.score : null,
        status: "proposed", provenance: "engine_inferred",
        support: Array.isArray(item.support) ? item.support.slice(0, 10).map(safe) : [],
        contradictions: Array.isArray(item.contradictions) ? item.contradictions.slice(0, 10).map(safe) : [],
        recordedAt: now
      });
    });
    (Array.isArray(diagnosis.supportingDocuments) ? diagnosis.supportingDocuments : []).slice(0, 20).forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const ref = item.sourceRef || {};
      add(assistant, "references", {
        id: prefix + "-reference-" + index, title: safe(item.title || item.name || ref.documentId),
        documentId: safe(ref.documentId), page: item.page == null ? "" : safe(item.page),
        provenance: "document_claim", status: "retrieved_not_verified", recordedAt: now
      });
    });
    return { ok: true, session: assistant.getSession() };
  }
  function syncGuidedSession(assistant, guidedSession, payload) {
    if (!assistant || !guidedSession || !payload || !payload.diagnosticFlowId ||
        typeof assistant.upsertDiagnosticRecord !== "function") {
      return { ok: false, reason: "invalid_guided_projection_input" };
    }
    const flowId = String(payload.diagnosticFlowId).slice(0, 120);
    const key = flowKey(flowId), now = new Date().toISOString();
    const answers = Array.isArray(payload.diagnosticAnswers) ? payload.diagnosticAnswers.slice(0, 40) : [];
    const hypotheses = Array.isArray(payload.diagnosticHypotheses) ? payload.diagnosticHypotheses.slice(0, 20) : [];
    const current = assistant.getSession(), operating = current && current.operatingContext || {};
    if (operating.guidedDiagnosticFlowId !== flowId || operating.guidedAnswerCount !== answers.length) {
      try {
        assistant.updateOperatingContext({
          guidedDiagnosticFlowId: flowId,
          guidedDiagnosticFlowMode: String(payload.diagnosticFlowMode || "adaptive_hypothesis"),
          guidedAnswerCount: answers.length, guidedUpdatedAt: now
        });
      } catch (error) { console.warn("Guided diagnostic context was not stored.", error); }
    }
    answers.forEach((entry, index) => {
      if (!entry || typeof entry.questionId !== "string" || typeof entry.answerId !== "string") return;
      const question = flowKey(entry.questionId).slice(0, 32) || String(index + 1);
      upsert(assistant, "evidence", {
        id: "guided-evidence-" + key + "-" + question,
        flowId, questionId: entry.questionId, answerId: entry.answerId,
        evidenceIds: Array.isArray(entry.evidence) ? entry.evidence.slice(0, 20) : [],
        provenance: "user_reported", status: "reported", recordedAt: now
      });
    });
    hypotheses.forEach((item, index) => {
      if (!item || typeof item.id !== "string") return;
      const id = flowKey(item.id).slice(0, 42) || String(index + 1);
      const hypothesisId = "guided-hypothesis-" + key + "-" + id;
      upsert(assistant, "hypotheses", {
        id: hypothesisId, label: String(item.label || item.id).slice(0, 500),
        score: Number.isFinite(item.score) ? item.score : null,
        status: ["proposed", "supported", "weakened", "contradicted", "unresolved", "requires_more_evidence"]
          .includes(String(item.status || "")) ? String(item.status) : "proposed",
        provenance: "engine_inferred",
        knowledgeRecordId: String(item.knowledgeRecordId || "").slice(0, 120),
        sourceRefs: Array.isArray(item.sourceRefs) ? item.sourceRefs.slice(0, 10) : [],
        support: Array.isArray(item.supportingEvidence) ? item.supportingEvidence.slice(0, 10) : [],
        contradictions: Array.isArray(item.contradictingEvidence) ? item.contradictingEvidence.slice(0, 10) : [],
        recordedAt: now
      });
      (Array.isArray(item.checks) ? item.checks : []).slice(0, 10).forEach((check, checkIndex) => {
        const label = String(check || "").slice(0, 500);
        if (!label) return;
        upsert(assistant, "tests", {
          id: "guided-test-" + key + "-" + id + "-" + checkIndex,
          hypothesisId, label, status: "recommended", provenance: "engine_inferred",
          rationale: "Suggested by the curated diagnostic flow; not yet performed.", recordedAt: now
        });
      });
    });
    return { ok: true, session: assistant.getSession() };
  }
  const api = Object.freeze({ syncLocalAssessment, syncGuidedSession });
  root.MaintenanceAssistantDiagnosticProjection = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
