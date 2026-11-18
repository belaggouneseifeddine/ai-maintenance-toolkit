/* Build-time diagnostic casebook validation and deterministic evidence triage.
 * Candidate cases are deliberately excluded from live diagnosis until reviewed.
 * Next-test selection is a transparent coverage heuristic, not expected information gain.
 */
(function (root) {
  "use strict";
  const ALLOWED_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated", "unknown"]);
  const OBSERVATION_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value"]);
  const BAD_QUALITY_STATES = new Set(["bad", "fault", "invalid", "out_of_range", "suspect"]);
  const REQUIRED = ["schemaVersion","caseId","title","equipmentFamily","status","applicability","mechanism","symptoms","requiredContext","hypotheses","measurements","tests","limits","stopConditions","verification","sources","licenseStatus","limitations"];

  function normalizeName(value) {
    return String(value == null ? "" : value).trim().toLocaleLowerCase().replace(/\s+/g, " ");
  }

  function finiteNumber(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  }

  function validateCase(item) {
    const errors = [];
    if (!item || typeof item !== "object" || Array.isArray(item)) return { ok: false, errors: ["case must be an object"] };
    for (const key of REQUIRED) if (!(key in item)) errors.push("missing:" + key);
    if (item.schemaVersion !== 1) errors.push("schemaVersion must be 1");
    if (typeof item.caseId !== "string" || !/^[A-Z]{2,5}-\d{3}$/.test(item.caseId)) errors.push("invalid:caseId");
    if (item.equipmentFamily !== "centrifugal_pump") errors.push("invalid:equipmentFamily");
    if (!["candidate","source_reviewed","technically_reviewed","field_validated","retired"].includes(item.status)) errors.push("invalid:status");

    const hypothesisIds = new Set();
    if (!Array.isArray(item.hypotheses) || item.hypotheses.length < 2) errors.push("at least two competing hypotheses are required");
    else {
      for (const h of item.hypotheses) {
        if (!h || typeof h.id !== "string" || !h.id || hypothesisIds.has(h.id)) errors.push("hypothesis IDs must be present and unique");
        if (h && h.id) hypothesisIds.add(h.id);
        for (const k of ["supportingEvidence","contradictingEvidence","confounders"]) {
          if (!h || !Array.isArray(h[k])) errors.push("hypothesis " + (h && h.id || "unnamed") + " missing " + k);
        }
      }
    }

    const measurementNames = new Set();
    if (!Array.isArray(item.measurements) || item.measurements.length < 2) errors.push("at least two measurement definitions are required");
    else for (const m of item.measurements) {
      for (const k of ["name","unit","location","operatingCondition","sourceTypes"]) {
        if (!m || m[k] === undefined || m[k] === null || m[k] === "") errors.push("measurement missing " + k + ": " + (m && m.name || "unnamed"));
      }
      if (m && m.name) {
        const key = normalizeName(m.name);
        if (measurementNames.has(key)) errors.push("duplicate measurement definition: " + m.name);
        measurementNames.add(key);
      }
      if (!m || !Array.isArray(m.sourceTypes) || !m.sourceTypes.length || m.sourceTypes.some(v => !ALLOWED_SOURCE_TYPES.has(v))) {
        errors.push("invalid measurement sourceTypes: " + (m && m.name || "unnamed"));
      }
    }

    if (!Array.isArray(item.tests) || !item.tests.length) errors.push("at least one discriminating test is required");
    else for (const t of item.tests) {
      for (const k of ["id","name","prerequisites","safetyClass","discriminates","requiredMeasurements","expectedOutcomes","interpretationLimits"]) {
        if (!t || t[k] === undefined) errors.push("test missing " + k + ": " + (t && t.id || "unnamed"));
      }
      if (!t || !["installed_instrument_observation","external_observation","planned_isolated_inspection","qualified_personnel_only","not_permitted"].includes(t.safetyClass)) {
        errors.push("invalid safetyClass: " + (t && t.id || "unnamed"));
      }
      if (!t || !Array.isArray(t.prerequisites)) errors.push("test prerequisites must be an array: " + (t && t.id || "unnamed"));
      if (!t || !Array.isArray(t.discriminates) || t.discriminates.length < 2) errors.push("test must discriminate at least two hypotheses: " + (t && t.id || "unnamed"));
      else for (const id of t.discriminates) if (!hypothesisIds.has(id)) errors.push("test references unknown hypothesis " + id + ": " + t.id);
      if (t && Array.isArray(t.requiredMeasurements)) {
        for (const name of t.requiredMeasurements) if (!measurementNames.has(normalizeName(name))) errors.push("test references unknown measurement " + name + ": " + t.id);
      } else errors.push("test requiredMeasurements must be an array: " + (t && t.id || "unnamed"));
      if (t && t.timeMinutes !== undefined && (!finiteNumber(t.timeMinutes) || Number(t.timeMinutes) < 0)) errors.push("invalid test timeMinutes: " + t.id);
      if (t && t.cost !== undefined && (!finiteNumber(t.cost) || Number(t.cost) < 0)) errors.push("invalid test cost: " + t.id);
    }

    if (!Array.isArray(item.sources)) errors.push("sources must be an array");
    if (item.status !== "candidate" && (!Array.isArray(item.sources) || !item.sources.length || item.sources.some(s => s.reviewStatus !== "reviewed" || !s.sectionOrPage))) {
      errors.push("reviewed status requires reviewed claim-level sources with section/page");
    }
    if (item.status === "field_validated" && (!Array.isArray(item.verification) || !item.verification.length || !Array.isArray(item.limitations) || item.limitations.some(v => /not been performed|not yet been reviewed/i.test(v)))) {
      errors.push("field_validated case cannot retain unresolved validation limitations");
    }
    if (item.licenseStatus !== "reuse_permitted" && item.status === "field_validated") errors.push("field-validated runtime content requires explicit reuse permission");
    if (JSON.stringify(item).match(/\b(?:probability|confidence)\s*:\s*0?\.\d+/i)) errors.push("uncalibrated numeric probability/confidence is not permitted");
    return { ok: errors.length === 0, errors };
  }

  function validateCasebook(book) {
    if (!book || book.schemaVersion !== 1 || !Array.isArray(book.cases)) return { ok: false, errors: ["invalid casebook envelope"], cases: [] };
    const seen = new Set();
    const cases = book.cases.map(item => {
      const result = validateCase(item);
      if (item && item.caseId && seen.has(item.caseId)) result.errors.push("duplicate caseId in casebook");
      if (item && item.caseId) seen.add(item.caseId);
      result.ok = result.errors.length === 0;
      return { caseId: item && item.caseId, ...result };
    });
    return { ok: cases.every(c => c.ok), errors: cases.flatMap(c => c.errors.map(e => c.caseId + ": " + e)), cases };
  }

  function collectMeasurementEvidence(input, caseRecord) {
    const supplied = input && Array.isArray(input.measurements) ? input.measurements : [];
    const complete = [];
    const incomplete = [];
    supplied.forEach((m, index) => {
      const valid = m && typeof m === "object" && !Array.isArray(m) &&
        typeof m.name === "string" && m.name.trim() &&
        finiteNumber(m.value) && typeof m.unit === "string" && m.unit.trim() &&
        typeof m.location === "string" && m.location.trim() &&
        typeof m.operatingCondition === "string" && m.operatingCondition.trim() &&
        ALLOWED_SOURCE_TYPES.has(m.sourceType);
      if (!valid) {
        incomplete.push({ index, name: m && m.name || "", reason: "missing_or_invalid_value_unit_location_condition_or_source" });
        return;
      }
      complete.push({
        index,
        name: String(m.name).trim(),
        key: normalizeName(m.name),
        value: Number(m.value),
        unit: String(m.unit).trim(),
        location: String(m.location).trim(),
        operatingCondition: String(m.operatingCondition).trim(),
        sourceType: m.sourceType,
        timestamp: typeof m.timestamp === "string" && m.timestamp.trim() ? m.timestamp.trim() : null,
        qualityStatus: typeof m.qualityStatus === "string" ? m.qualityStatus.trim().toLocaleLowerCase() : "unspecified"
      });
    });

    const unreliable = complete.filter(m => BAD_QUALITY_STATES.has(m.qualityStatus));
    const usable = complete.filter(m => OBSERVATION_SOURCE_TYPES.has(m.sourceType) && !BAD_QUALITY_STATES.has(m.qualityStatus));
    const estimated = complete.filter(m => m.sourceType === "estimated");
    const unknown = complete.filter(m => m.sourceType === "unknown");
    const sourceTypeCounts = {};
    for (const m of complete) sourceTypeCounts[m.sourceType] = (sourceTypeCounts[m.sourceType] || 0) + 1;

    const byMeasurement = new Map();
    for (const m of complete) {
      if (!byMeasurement.has(m.key)) byMeasurement.set(m.key, []);
      byMeasurement.get(m.key).push(m);
    }
    const measurementStatuses = caseRecord.measurements.map(definition => {
      const readings = byMeasurement.get(normalizeName(definition.name)) || [];
      const observed = readings.filter(m => OBSERVATION_SOURCE_TYPES.has(m.sourceType) && !BAD_QUALITY_STATES.has(m.qualityStatus));
      const estimatedOnly = readings.filter(m => m.sourceType === "estimated");
      const unknownSource = readings.filter(m => m.sourceType === "unknown");
      const unreliableReadings = readings.filter(m => BAD_QUALITY_STATES.has(m.qualityStatus));
      const status = observed.length ? "available_with_provenance"
        : estimatedOnly.length ? "estimated_only"
          : unknownSource.length ? "source_unknown"
            : unreliableReadings.length ? "unreliable"
              : "missing";
      return {
        name: definition.name,
        status,
        sourceTypes: [...new Set(readings.map(m => m.sourceType))],
        readingCount: readings.length
      };
    });

    const timestampGroups = new Map();
    for (const m of usable) {
      if (!m.timestamp) continue;
      const key = [m.key, m.unit, normalizeName(m.location), normalizeName(m.operatingCondition), m.timestamp].join("|");
      if (!timestampGroups.has(key)) timestampGroups.set(key, []);
      timestampGroups.get(key).push(m);
    }
    const conflicts = [];
    const crossSourceDisagreements = [];
    for (const readings of timestampGroups.values()) {
      if (new Set(readings.map(m => m.value)).size < 2) continue;
      const item = {
        name: readings[0].name,
        unit: readings[0].unit,
        location: readings[0].location,
        timestamp: readings[0].timestamp,
        sourceTypes: [...new Set(readings.map(m => m.sourceType))],
        values: readings.map(m => m.value)
      };
      if (item.sourceTypes.length > 1) crossSourceDisagreements.push(item);
      else conflicts.push(item);
    }

    return {
      suppliedCount: supplied.length,
      complete,
      incomplete,
      usable,
      estimated,
      unknown,
      unreliable,
      conflicts,
      crossSourceDisagreements,
      sourceTypeCounts,
      measurementStatuses
    };
  }

  function triageLowFlow(input, caseRecord) {
    const validation = validateCase(caseRecord);
    if (!validation.ok) return { status: "invalid_case", errors: validation.errors, hypotheses: [], nextEvidence: null, candidateTests: [] };

    const evidence = collectMeasurementEvidence(input || {}, caseRecord);
    const usableNames = new Set(evidence.usable.map(m => m.key));
    const statusByName = new Map(evidence.measurementStatuses.map(m => [normalizeName(m.name), m.status]));
    const hypotheses = caseRecord.hypotheses.map(h => ({
      id: h.id,
      cause: h.cause,
      status: "unresolved",
      rationale: "No validated case-specific rule has been applied; review evidence for and against manually."
    }));

    const safetyContext = input && input.safetyContext && typeof input.safetyContext === "object" ? input.safetyContext : {};
    const safetyContextConfirmed =
      safetyContext.siteProcedureAllowsObservation === true &&
      safetyContext.readOnly === true &&
      safetyContext.stopConditionsChecked === true &&
      safetyContext.stopConditionsAbsent === true;
    const confirmedTestIds = new Set(input && Array.isArray(input.confirmedTestIds) ? input.confirmedTestIds : []);
    const constraints = input && input.constraints && typeof input.constraints === "object" ? input.constraints : {};
    const testEstimates = input && input.testEstimates && typeof input.testEstimates === "object" ? input.testEstimates : {};
    const hasMeasurementConflict = evidence.conflicts.length > 0 || evidence.crossSourceDisagreements.length > 0;
    const hasUnreliableReadings = evidence.unreliable.length > 0;
    const totalHypotheses = caseRecord.hypotheses.length;

    const candidateTests = caseRecord.tests.map(t => {
      const required = Array.isArray(t.requiredMeasurements) ? t.requiredMeasurements : [];
      const missingMeasurements = required.filter(name => !usableNames.has(normalizeName(name)));
      const estimatedOnlyMeasurements = required.filter(name => statusByName.get(normalizeName(name)) === "estimated_only");
      const unknownSourceMeasurements = required.filter(name => statusByName.get(normalizeName(name)) === "source_unknown");
      const discriminated = [...new Set((t.discriminates || []).filter(id => caseRecord.hypotheses.some(h => h.id === id)))];
      const estimate = testEstimates[t.id] && typeof testEstimates[t.id] === "object" ? testEstimates[t.id] : {};
      const timeMinutes = finiteNumber(estimate.timeMinutes) ? Number(estimate.timeMinutes)
        : finiteNumber(t.timeMinutes) ? Number(t.timeMinutes) : null;
      const cost = finiteNumber(estimate.cost) ? Number(estimate.cost)
        : finiteNumber(t.cost) ? Number(t.cost) : null;
      const blockedReasons = [];
      if (t.safetyClass !== "installed_instrument_observation") blockedReasons.push("not_an_automatic_read_only_observation");
      if (!safetyContextConfirmed) blockedReasons.push("safety_context_not_confirmed");
      if (!confirmedTestIds.has(t.id)) blockedReasons.push("test_prerequisites_not_confirmed");
      if (hasMeasurementConflict) blockedReasons.push("measurement_conflict_requires_validation");
      if (hasUnreliableReadings) blockedReasons.push("unreliable_sensor_reading_requires_validation");
      if (finiteNumber(constraints.maxTimeMinutes) && (timeMinutes === null || timeMinutes > Number(constraints.maxTimeMinutes))) {
        blockedReasons.push(timeMinutes === null ? "test_time_unknown_under_time_constraint" : "test_exceeds_time_constraint");
      }
      if (finiteNumber(constraints.maxCost) && (cost === null || cost > Number(constraints.maxCost))) {
        blockedReasons.push(cost === null ? "test_cost_unknown_under_cost_constraint" : "test_exceeds_cost_constraint");
      }
      const needsObservation = missingMeasurements.length > 0 || estimatedOnlyMeasurements.length > 0 || unknownSourceMeasurements.length > 0;
      const eligibleAsNextObservation =
        t.safetyClass === "installed_instrument_observation" &&
        safetyContextConfirmed &&
        confirmedTestIds.has(t.id) &&
        !hasMeasurementConflict &&
        !hasUnreliableReadings &&
        needsObservation &&
        !blockedReasons.some(reason => reason.includes("constraint"));
      return {
        id: t.id,
        name: t.name,
        safetyClass: t.safetyClass,
        discriminates: discriminated,
        missingMeasurements,
        estimatedOnlyMeasurements,
        unknownSourceMeasurements,
        hypothesisCoverage: {
          discriminatedCount: discriminated.length,
          totalHypotheses,
          ratio: totalHypotheses ? Number((discriminated.length / totalHypotheses).toFixed(4)) : 0
        },
        planningEstimate: { timeMinutes, cost },
        eligibleAsNextObservation,
        blockedReasons
      };
    });

    const ranked = candidateTests.filter(t => t.eligibleAsNextObservation).sort((a, b) => {
      if (b.hypothesisCoverage.ratio !== a.hypothesisCoverage.ratio) return b.hypothesisCoverage.ratio - a.hypothesisCoverage.ratio;
      if (a.planningEstimate.timeMinutes !== b.planningEstimate.timeMinutes) {
        if (a.planningEstimate.timeMinutes === null) return 1;
        if (b.planningEstimate.timeMinutes === null) return -1;
        return a.planningEstimate.timeMinutes - b.planningEstimate.timeMinutes;
      }
      if (a.planningEstimate.cost !== b.planningEstimate.cost) {
        if (a.planningEstimate.cost === null) return 1;
        if (b.planningEstimate.cost === null) return -1;
        return a.planningEstimate.cost - b.planningEstimate.cost;
      }
      const aMissing = a.missingMeasurements.length + a.estimatedOnlyMeasurements.length + a.unknownSourceMeasurements.length;
      const bMissing = b.missingMeasurements.length + b.estimatedOnlyMeasurements.length + b.unknownSourceMeasurements.length;
      if (aMissing !== bMissing) return aMissing - bMissing;
      return a.id.localeCompare(b.id);
    });

    const next = ranked[0] || null;
    return {
      status: "candidate_triage_only",
      runtimeEligible: false,
      hypotheses,
      evidenceQuality: {
        acceptedMeasurementCount: evidence.usable.length,
        completeReadingCount: evidence.complete.length,
        incompleteMeasurementCount: evidence.incomplete.length,
        estimatedReadingCount: evidence.estimated.length,
        unknownSourceReadingCount: evidence.unknown.length,
        unreliableReadingCount: evidence.unreliable.length,
        conflictingReadingCount: evidence.conflicts.length,
        crossSourceDisagreementCount: evidence.crossSourceDisagreements.length,
        sourceTypeCounts: evidence.sourceTypeCounts,
        missingMeasurementDefinitions: evidence.measurementStatuses.filter(m => m.status === "missing" || m.status === "unreliable").map(m => m.name),
        estimatedOnlyMeasurementDefinitions: evidence.measurementStatuses.filter(m => m.status === "estimated_only").map(m => m.name),
        sourceUnknownMeasurementDefinitions: evidence.measurementStatuses.filter(m => m.status === "source_unknown").map(m => m.name),
        measurementStatuses: evidence.measurementStatuses
      },
      selection: {
        method: "hypothesis_discrimination_coverage_heuristic",
        expectedInformationGainCalculated: false,
        calibratedProbabilityModelUsed: false,
        safetyContextConfirmed
      },
      nextEvidence: next ? {
        ...next,
        informationValue: {
          type: "hypothesis_coverage_heuristic",
          hypothesesCovered: next.hypothesisCoverage.discriminatedCount,
          totalHypotheses,
          coverageRatio: next.hypothesisCoverage.ratio,
          notExpectedInformationGain: true
        }
      } : null,
      candidateTests,
      warnings: [
        "No root cause or probability is inferred.",
        "No expected information gain is calculated because this candidate has no approved, source-backed test-outcome likelihoods.",
        "Direct, PLC and historian readings remain distinct; estimates and unknown-source values do not count as measured observations.",
        "A next observation is withheld until site authorization, read-only access, stop-condition review and test prerequisites are explicitly confirmed.",
        "Conflicting or unreliable readings block test selection until the measurement source is checked.",
        "A candidate case cannot enter live diagnosis until source, license and technical review gates pass."
      ]
    };
  }

  const api = { validateCase, validateCasebook, triageLowFlow };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceDiagnosticCasebook = api;
})(typeof window !== "undefined" ? window : globalThis);
