/* Build-time diagnostic casebook validation and deterministic evidence triage.
 * Candidate cases are deliberately excluded from live diagnosis until reviewed.
 */
(function (root) {
  "use strict";
  const ALLOWED_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated", "unknown"]);
  const REQUIRED = ["schemaVersion","caseId","title","equipmentFamily","status","applicability","mechanism","symptoms","requiredContext","hypotheses","measurements","tests","limits","stopConditions","verification","sources","licenseStatus","limitations"];
  function validateCase(item) {
    const errors = [];
    if (!item || typeof item !== "object" || Array.isArray(item)) return { ok: false, errors: ["case must be an object"] };
    for (const key of REQUIRED) if (!(key in item)) errors.push("missing:" + key);
    if (item.schemaVersion !== 1) errors.push("schemaVersion must be 1");
    if (typeof item.caseId !== "string" || !/^[A-Z]{2,5}-\d{3}$/.test(item.caseId)) errors.push("invalid:caseId");
    if (item.equipmentFamily !== "centrifugal_pump") errors.push("invalid:equipmentFamily");
    if (!["candidate","source_reviewed","technically_reviewed","field_validated","retired"].includes(item.status)) errors.push("invalid:status");
    if (!Array.isArray(item.hypotheses) || item.hypotheses.length < 2) errors.push("at least two competing hypotheses are required");
    else {
      const ids = new Set();
      for (const h of item.hypotheses) {
        if (!h.id || ids.has(h.id)) errors.push("hypothesis IDs must be present and unique");
        ids.add(h.id);
        for (const k of ["supportingEvidence","contradictingEvidence","confounders"]) if (!Array.isArray(h[k])) errors.push("hypothesis " + h.id + " missing " + k);
      }
    }
    if (!Array.isArray(item.measurements) || item.measurements.length < 2) errors.push("at least two measurement definitions are required");
    else for (const m of item.measurements) {
      for (const k of ["name","unit","location","operatingCondition","sourceTypes"]) if (m[k] === undefined || m[k] === null || m[k] === "") errors.push("measurement missing " + k + ": " + (m.name || "unnamed"));
      if (!Array.isArray(m.sourceTypes) || !m.sourceTypes.length || m.sourceTypes.some(v => !ALLOWED_SOURCE_TYPES.has(v))) errors.push("invalid measurement sourceTypes: " + (m.name || "unnamed"));
    }
    if (!Array.isArray(item.tests) || !item.tests.length) errors.push("at least one discriminating test is required");
    else for (const t of item.tests) {
      for (const k of ["id","name","prerequisites","safetyClass","discriminates","requiredMeasurements","expectedOutcomes","interpretationLimits"]) if (t[k] === undefined) errors.push("test missing " + k + ": " + (t.id || "unnamed"));
      if (!["installed_instrument_observation","external_observation","planned_isolated_inspection","qualified_personnel_only","not_permitted"].includes(t.safetyClass)) errors.push("invalid safetyClass: " + t.id);
      if (!Array.isArray(t.discriminates) || t.discriminates.length < 2) errors.push("test must discriminate at least two hypotheses: " + t.id);
    }
    if (!Array.isArray(item.sources)) errors.push("sources must be an array");
    if (item.status !== "candidate" && (!Array.isArray(item.sources) || !item.sources.length || item.sources.some(s => s.reviewStatus !== "reviewed" || !s.sectionOrPage))) errors.push("reviewed status requires reviewed claim-level sources with section/page");
    if (item.status === "field_validated" && (!item.verification.length || item.limitations.some(v => /not been performed|not yet been reviewed/i.test(v)))) errors.push("field_validated case cannot retain unresolved validation limitations");
    if (item.licenseStatus !== "reuse_permitted" && item.status === "field_validated") errors.push("field-validated runtime content requires explicit reuse permission");
    if (JSON.stringify(item).match(/\b(?:probability|confidence)\s*:\s*0?\.\d+/i)) errors.push("uncalibrated numeric probability/confidence is not permitted");
    return { ok: errors.length === 0, errors };
  }
  function validateCasebook(book) {
    if (!book || book.schemaVersion !== 1 || !Array.isArray(book.cases)) return { ok: false, errors: ["invalid casebook envelope"], cases: [] };
    const cases = book.cases.map(item => ({ caseId: item.caseId, ...validateCase(item) }));
    return { ok: cases.every(c => c.ok), errors: cases.flatMap(c => c.errors.map(e => c.caseId + ": " + e)), cases };
  }
  function triageLowFlow(input, caseRecord) {
    const validation = validateCase(caseRecord);
    if (!validation.ok) return { status: "invalid_case", errors: validation.errors, hypotheses: [], nextEvidence: null };
    const supplied = input && Array.isArray(input.measurements) ? input.measurements : [];
    const valid = supplied.filter(m => m && m.name && m.value !== null && m.value !== undefined && Number.isFinite(Number(m.value)) && m.unit && m.location && m.operatingCondition && ALLOWED_SOURCE_TYPES.has(m.sourceType));
    const incomplete = supplied.filter(m => !valid.includes(m));
    const known = new Set(valid.map(m => String(m.name).toLowerCase()));
    const missing = caseRecord.measurements.filter(m => !known.has(m.name.toLowerCase()));
    const hypotheses = caseRecord.hypotheses.map(h => ({ id: h.id, cause: h.cause, status: "unresolved", rationale: "No validated case-specific rule has been applied; review evidence for and against manually." }));
    const tests = caseRecord.tests.map(t => ({
      id: t.id, name: t.name, safetyClass: t.safetyClass,
      discriminates: t.discriminates,
      missingDiscriminators: t.discriminates.filter(id => !known.has(id)),
      eligibleAsNextObservation: t.safetyClass === "installed_instrument_observation" && t.discriminates.some(id => hypotheses.some(h => h.id === id))
    })).filter(t => t.eligibleAsNextObservation).sort((a,b) => b.missingMeasurements.length-a.missingMeasurements.length);
    return {
      status: "candidate_triage_only",
      runtimeEligible: false,
      hypotheses,
      evidenceQuality: { acceptedMeasurementCount: valid.length, incompleteMeasurementCount: incomplete.length, missingMeasurementDefinitions: missing.map(m => m.name) },
      nextEvidence: tests[0] || null,
      warnings: ["No root cause or probability is inferred.", "PLC, historian, estimated and direct measurements remain distinct.", "A candidate case cannot enter live diagnosis until source and technical review gates pass."]
    };
  }
  const api = { validateCase, validateCasebook, triageLowFlow };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceDiagnosticCasebook = api;
})(typeof window !== "undefined" ? window : globalThis);
