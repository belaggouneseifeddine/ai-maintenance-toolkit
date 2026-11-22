/* Conservative diagnostic knowledge adapter. Candidate knowledge never becomes a confirmed diagnosis. */
(function (root) {
  "use strict";

  const ALLOWED_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated", "unknown"]);
  const SAFE_OBSERVATION_CLASS = "installed_instrument_observation";

  function normalizeMeasurements(input) {
    const values = Array.isArray(input) ? input : [];
    const accepted = [], rejected = [], warnings = [];
    values.forEach((item, index) => {
      const valid = item && typeof item === "object" &&
        typeof item.name === "string" && item.name.trim() &&
        typeof item.unit === "string" && item.unit.trim() &&
        typeof item.location === "string" && item.location.trim() &&
        typeof item.operatingCondition === "string" && item.operatingCondition.trim() &&
        ALLOWED_SOURCE_TYPES.has(item.sourceType) &&
        (item.value === null || item.value === undefined || (typeof item.value === "number" && Number.isFinite(item.value)));
      if (!valid) {
        rejected.push({ index, reason: "incomplete_or_invalid_measurement" });
        return;
      }
      const reading = {
        name: item.name.trim(), value: item.value == null ? null : item.value,
        unit: item.unit.trim(), location: item.location.trim(),
        operatingCondition: item.operatingCondition.trim(),
        sourceType: item.sourceType,
        sensorStatus: item.sensorStatus || "unknown",
        qualityFlag: item.qualityFlag || "unknown",
        timestamp: item.timestamp || ""
      };
      if (reading.sourceType === "estimated") warnings.push({ code: "estimated_not_measured", index });
      if (reading.sourceType === "plc_value" || reading.sourceType === "historian_value") warnings.push({ code: "control_system_value_not_independent", index });
      if (reading.value === null) warnings.push({ code: "value_missing", index });
      if (["suspect", "failed"].includes(reading.sensorStatus)) warnings.push({ code: "sensor_suspect_or_failed", index });
      if (["noisy", "stale", "contradictory"].includes(reading.qualityFlag)) warnings.push({ code: "measurement_quality_warning", index });
      accepted.push(reading);
    });
    const groups = new Map();
    accepted.forEach((item, index) => {
      if (item.value === null) return;
      const key = [item.name.toLowerCase(), item.unit.toLowerCase(), item.location.toLowerCase(), item.timestamp, item.operatingCondition.toLowerCase()].join("|");
      const list = groups.get(key) || [];
      list.push({ value: item.value, index });
      groups.set(key, list);
    });
    const conflicts = [];
    for (const [key, list] of groups) {
      if (new Set(list.map(entry => entry.value)).size > 1) conflicts.push({
        code: "conflicting_readings_same_context", key,
        indexes: list.map(entry => entry.index)
      });
    }
    return { accepted, rejected, warnings, conflicts };
  }

  function runtimeGate(record, validation) {
    if (!validation || validation.ok !== true) return { eligible: false, reason: "case_schema_invalid" };
    if (record.status !== "field_validated") return { eligible: false, reason: "case_not_field_validated" };
    if (record.licenseStatus !== "reuse_permitted") return { eligible: false, reason: "reuse_permission_not_confirmed" };
    if (!Array.isArray(record.sources) || !record.sources.length ||
        record.sources.some(source => source.reviewStatus !== "reviewed" || !source.sectionOrPage)) {
      return { eligible: false, reason: "claim_level_source_review_incomplete" };
    }
    return { eligible: true, reason: "all_case_level_gates_satisfied" };
  }

  function analyze(input, record, dependencies) {
    const casebook = dependencies && dependencies.casebook || root.MaintenanceDiagnosticCasebook;
    if (!casebook || typeof casebook.validateCase !== "function") {
      return { ok: false, status: "dependency_unavailable", hypotheses: [], nextTest: null };
    }
    const validation = casebook.validateCase(record);
    if (!validation.ok) return { ok: false, status: "invalid_case", errors: validation.errors, hypotheses: [], nextTest: null };
    const gate = runtimeGate(record, validation);
    const measurementSet = normalizeMeasurements(input && input.measurements);
    const present = new Set(measurementSet.accepted.filter(item => item.value !== null).map(item => item.name.toLocaleLowerCase()));
    const hypotheses = record.hypotheses.map(item => ({
      id: item.id, cause: item.cause, status: "unresolved",
      supportingEvidenceDefinitions: item.supportingEvidence,
      contradictingEvidenceDefinitions: item.contradictingEvidence,
      confounders: item.confounders
    }));
    const nextTests = (record.tests || []).map(test => {
      const missing = (test.requiredMeasurements || []).filter(name => !present.has(String(name).toLocaleLowerCase()));
      return {
        id: test.id, name: test.name, safetyClass: test.safetyClass,
        missingMeasurements: missing,
        eligibleAsNextTest: test.safetyClass === SAFE_OBSERVATION_CLASS && missing.length > 0,
        discriminates: test.discriminates
      };
    }).filter(test => test.eligibleAsNextTest)
      .sort((a, b) => b.discriminates.length - a.discriminates.length || a.missingMeasurements.length - b.missingMeasurements.length);
    return {
      ok: true,
      status: gate.eligible ? "reviewed_case_assessment" : "candidate_case_assessment",
      runtimeEligible: gate.eligible,
      eligibilityReason: gate.reason,
      caseId: record.caseId,
      equipmentFamily: record.equipmentFamily,
      hypotheses,
      measurements: measurementSet,
      nextTest: nextTests[0] || null,
      nextTestSelection: nextTests.length ? "safe_observation_coverage_heuristic_not_information_gain" : "no_eligible_installed_observation",
      probabilities: null,
      warnings: [
        "All hypotheses remain unresolved until case-specific evidence interpretation is implemented and validated.",
        "No numeric probability or calibrated confidence is produced.",
        "A source URL alone does not verify a claim or establish OEM applicability.",
        "Candidate or source-reviewed records are not eligible for production diagnostic runtime.",
        "Safety procedures, LOTO, OEM limits and qualified-personnel requirements override this engine."
      ]
    };
  }

  const api = Object.freeze({ normalizeMeasurements, runtimeGate, analyze });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceDiagnosticKnowledgeEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
