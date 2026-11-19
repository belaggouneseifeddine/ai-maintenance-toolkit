(function (root) {
  "use strict";

  const SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated", "unknown"]);
  const SENSOR_STATES = new Set(["normal", "suspect", "failed", "unknown"]);
  const QUALITY_FLAGS = new Set(["normal", "noisy", "stale", "contradictory", "unknown"]);
  const COST_LEVELS = new Set(["low", "medium", "high", "unknown"]);
  const REQUIRED = [
    "schemaVersion", "caseId", "title", "equipmentFamily", "status", "applicability",
    "mechanism", "symptoms", "requiredContext", "hypotheses", "measurements", "tests",
    "limits", "stopConditions", "verification", "sources", "licenseStatus", "limitations"
  ];
  const ROOT_KEYS = new Set(REQUIRED);

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function normalizeUnit(value) {
    return String(value || "").trim().toLowerCase().replace(/³/g, "3").replace(/\s+/g, "");
  }

  function validateCase(item, sourceRegistry) {
    const errors = [];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ok: false, errors: ["case must be an object"] };
    }

    for (const key of REQUIRED) {
      if (!(key in item)) errors.push("missing:" + key);
    }
    for (const key of Object.keys(item)) {
      if (!ROOT_KEYS.has(key)) errors.push("unexpected:" + key);
    }

    if (item.schemaVersion !== 1) errors.push("schemaVersion must be 1");
    if (typeof item.caseId !== "string" || !/^[A-Z]{2,5}-\d{3}$/.test(item.caseId)) {
      errors.push("invalid:caseId");
    }
    if (item.equipmentFamily !== "centrifugal_pump") errors.push("invalid:equipmentFamily");
    if (!["candidate", "source_reviewed", "technically_reviewed", "field_validated", "retired"].includes(item.status)) {
      errors.push("invalid:status");
    }

    if (!Array.isArray(item.hypotheses) || item.hypotheses.length < 2) {
      errors.push("at least two competing hypotheses are required");
    } else {
      const ids = new Set();
      for (const hypothesis of item.hypotheses) {
        if (!hypothesis.id || ids.has(hypothesis.id)) errors.push("hypothesis IDs must be present and unique");
        ids.add(hypothesis.id);
        for (const key of ["supportingEvidence", "contradictingEvidence", "confounders"]) {
          if (!Array.isArray(hypothesis[key])) errors.push("hypothesis " + hypothesis.id + " missing " + key);
        }
      }
    }

    if (!Array.isArray(item.measurements) || item.measurements.length < 2) {
      errors.push("at least two measurement definitions are required");
    } else {
      for (const measurement of item.measurements) {
        for (const key of ["name", "unit", "location", "operatingCondition", "sourceTypes", "allowedUnits"]) {
          if (measurement[key] === undefined || measurement[key] === null || measurement[key] === "") {
            errors.push("measurement missing " + key + ": " + (measurement.name || "unnamed"));
          }
        }
        if (!Array.isArray(measurement.sourceTypes) || !measurement.sourceTypes.length ||
            measurement.sourceTypes.some(value => !SOURCE_TYPES.has(value))) {
          errors.push("invalid measurement sourceTypes: " + (measurement.name || "unnamed"));
        }
        if (!Array.isArray(measurement.allowedUnits) || !measurement.allowedUnits.length ||
            measurement.allowedUnits.some(value => typeof value !== "string" || !value.trim())) {
          errors.push("invalid measurement allowedUnits: " + (measurement.name || "unnamed"));
        }
      }
    }

    if (!Array.isArray(item.tests) || !item.tests.length) {
      errors.push("at least one discriminating test is required");
    } else {
      for (const test of item.tests) {
        for (const key of ["id", "name", "prerequisites", "safetyClass", "discriminates",
          "requiredMeasurements", "expectedOutcomes", "interpretationLimits"]) {
          if (test[key] === undefined) errors.push("test missing " + key + ": " + (test.id || "unnamed"));
        }
        if (!["installed_instrument_observation", "external_observation", "planned_isolated_inspection",
          "qualified_personnel_only", "not_permitted"].includes(test.safetyClass)) {
          errors.push("invalid safetyClass: " + test.id);
        }
        if (!Array.isArray(test.discriminates) || test.discriminates.length < 2) {
          errors.push("test must discriminate at least two hypotheses: " + test.id);
        }
        if (test.timeCost !== undefined && !COST_LEVELS.has(test.timeCost)) errors.push("invalid timeCost: " + test.id);
        if (test.resourceCost !== undefined && !COST_LEVELS.has(test.resourceCost)) errors.push("invalid resourceCost: " + test.id);
      }
    }

    if (!Array.isArray(item.sources)) errors.push("sources must be an array");
    if (item.status !== "candidate" &&
        (!Array.isArray(item.sources) || !item.sources.length ||
         item.sources.some(source => source.reviewStatus !== "reviewed" || !source.sectionOrPage))) {
      errors.push("reviewed status requires reviewed claim-level sources with section/page");
    }
    if (item.status === "field_validated" &&
        (!Array.isArray(item.verification) || !item.verification.length ||
         !Array.isArray(item.limitations) ||
         item.limitations.some(value => /not been performed|not yet been reviewed/i.test(value)))) {
      errors.push("field_validated case cannot retain unresolved validation limitations");
    }
    if (item.status === "field_validated" && item.licenseStatus !== "reuse_permitted") {
      errors.push("field-validated runtime content requires explicit reuse permission");
    }

    if (sourceRegistry) {
      const records = [
        ...(Array.isArray(sourceRegistry.sources) ? sourceRegistry.sources : []),
        ...(Array.isArray(sourceRegistry.reference_only_documents) ? sourceRegistry.reference_only_documents : [])
      ];
      const byId = new Map(records.map(record => [record.id, record]));

      for (const source of Array.isArray(item.sources) ? item.sources : []) {
        const record = byId.get(source.sourceId);
        if (!record) {
          errors.push("unregistered source: " + source.sourceId);
          continue;
        }

        const licence = [
          record.licenseStatus, record.dataLicense, record.reuseStatus, record.reuseConditions
        ].filter(Boolean).join(" ").toLowerCase();
        const referenceOnly = record.fetchAllowed === false ||
          /reference[-_ ]only|copyrighted|no redistribution|not verified|pending primary/i.test(licence);
        const reusable = /cc[-_ ]?by|cc0|apache[-_ ]?2\.0|mit|public domain|reuse permitted/i.test(licence);

        if (item.status === "field_validated" && (referenceOnly || !reusable)) {
          errors.push("field_validated source is not cleared for reuse: " + source.sourceId);
        }
      }
    }

    if (/\b(?:probability|confidence)\s*:\s*0?\.\d+/i.test(JSON.stringify(item))) {
      errors.push("uncalibrated numeric probability/confidence is not permitted");
    }
    return { ok: errors.length === 0, errors };
  }

  function validateCasebook(book, sourceRegistry) {
    if (!book || book.schemaVersion !== 1 || !Array.isArray(book.cases)) {
      return { ok: false, errors: ["invalid casebook envelope"], cases: [] };
    }
    const cases = book.cases.map(item => ({ caseId: item.caseId, ...validateCase(item, sourceRegistry) }));
    return {
      ok: cases.every(item => item.ok),
      errors: cases.flatMap(item => item.errors.map(error => item.caseId + ": " + error)),
      cases
    };
  }

  function triageLowFlow(input, caseRecord, sourceRegistry) {
    const validation = validateCase(caseRecord, sourceRegistry);
    if (!validation.ok) {
      return { status: "invalid_case", errors: validation.errors, hypotheses: [], nextEvidence: null };
    }

    const supplied = input && Array.isArray(input.measurements) ? input.measurements : [];
    const definitions = new Map(caseRecord.measurements.map(item => [normalizeName(item.name), item]));
    const incomplete = [];
    const rejected = [];
    const candidates = [];

    for (const measurement of supplied) {
      if (!measurement || typeof measurement !== "object" || Array.isArray(measurement)) {
        incomplete.push({ name: null, reason: "measurement_not_an_object" });
        continue;
      }

      const name = normalizeName(measurement.name);
      if (!name) {
        incomplete.push({ name: null, reason: "missing_measurement_name" });
        continue;
      }

      const definition = definitions.get(name);
      if (!definition) {
        rejected.push({ name: measurement.name, reason: "unknown_measurement" });
        continue;
      }

      const rawValue = measurement.value;
      const numericValue = typeof rawValue === "number" ||
        (typeof rawValue === "string" && rawValue.trim() !== "") ? Number(rawValue) : NaN;
      if (!Number.isFinite(numericValue)) {
        incomplete.push({ name: measurement.name, reason: "missing_or_non_numeric_value" });
        continue;
      }

      const unit = normalizeUnit(measurement.unit);
      const allowedUnits = new Set((definition.allowedUnits || []).map(normalizeUnit));
      if (!unit || !allowedUnits.has(unit)) {
        rejected.push({ name: measurement.name, reason: "unit_mismatch", suppliedUnit: measurement.unit || null });
        continue;
      }

      if (typeof measurement.location !== "string" || !measurement.location.trim() ||
          typeof measurement.operatingCondition !== "string" || !measurement.operatingCondition.trim()) {
        incomplete.push({ name: measurement.name, reason: "missing_location_or_operating_condition" });
        continue;
      }

      const sourceType = measurement.sourceType === undefined ? "unknown" : measurement.sourceType;
      if (!SOURCE_TYPES.has(sourceType) || !definition.sourceTypes.includes(sourceType)) {
        rejected.push({ name: measurement.name, reason: "invalid_or_disallowed_source_type" });
        continue;
      }

      const sensorStatus = measurement.sensorStatus === undefined ? "unknown" : measurement.sensorStatus;
      if (!SENSOR_STATES.has(sensorStatus)) {
        rejected.push({ name: measurement.name, reason: "invalid_sensor_status" });
        continue;
      }
      if (sensorStatus === "failed" || sensorStatus === "suspect") {
        rejected.push({ name: measurement.name, reason: "sensor_status_" + sensorStatus });
        continue;
      }

      const qualityFlag = measurement.qualityFlag === undefined ? "unknown" : measurement.qualityFlag;
      if (!QUALITY_FLAGS.has(qualityFlag)) {
        rejected.push({ name: measurement.name, reason: "invalid_quality_flag" });
        continue;
      }
      if (["noisy", "stale", "contradictory"].includes(qualityFlag)) {
        rejected.push({ name: measurement.name, reason: "quality_flag_" + qualityFlag });
        continue;
      }

      if (measurement.timestamp !== undefined && measurement.timestamp !== null &&
          (typeof measurement.timestamp !== "string" || !Number.isFinite(Date.parse(measurement.timestamp)))) {
        rejected.push({ name: measurement.name, reason: "invalid_timestamp" });
        continue;
      }

      candidates.push({
        name,
        sourceType,
        sensorStatus,
        qualityFlag,
        value: numericValue,
        unit: measurement.unit,
        timestamp: measurement.timestamp || null
      });
    }

    const grouped = new Map();
    for (const measurement of candidates) {
      if (!grouped.has(measurement.name)) grouped.set(measurement.name, []);
      grouped.get(measurement.name).push(measurement);
    }

    const duplicateMeasurementNames = [];
    const valid = [];
    for (const [name, group] of grouped.entries()) {
      if (group.length > 1) {
        duplicateMeasurementNames.push(name);
        for (const measurement of group) {
          rejected.push({ name, reason: "duplicate_measurement_name_requires_reconciliation" });
        }
      } else {
        valid.push(group[0]);
      }
    }

    const known = new Set(valid.map(item => item.name));
    const missing = caseRecord.measurements.filter(item => !known.has(normalizeName(item.name)));
    const costRank = { low: 0, medium: 1, high: 2, unknown: 3 };
    const eligibleTests = caseRecord.tests.map(test => {
      const missingMeasurements = (test.requiredMeasurements || [])
        .filter(name => !known.has(normalizeName(name)));
      return {
        id: test.id,
        name: test.name,
        safetyClass: test.safetyClass,
        discriminates: test.discriminates,
        missingMeasurements,
        timeCost: test.timeCost || "unknown",
        resourceCost: test.resourceCost || "unknown",
        eligibleAsNextObservation: test.safetyClass === "installed_instrument_observation" &&
          missingMeasurements.length > 0
      };
    }).filter(test => test.eligibleAsNextObservation).sort((a, b) =>
      b.discriminates.length - a.discriminates.length ||
      costRank[a.timeCost] - costRank[b.timeCost] ||
      costRank[a.resourceCost] - costRank[b.resourceCost] ||
      b.missingMeasurements.length - a.missingMeasurements.length
    );

    const hypotheses = caseRecord.hypotheses.map(item => ({
      id: item.id,
      cause: item.cause,
      status: "unresolved",
      rationale: "No validated case-specific rule has been applied; review evidence for and against manually."
    }));
    const nextEvidence = eligibleTests[0] ? {
      ...eligibleTests[0],
      selectionMethod: "coverage_heuristic_not_information_gain",
      reason: "Chosen from safe installed observations by hypothesis coverage and qualitative time/resource cost; no approved likelihood table exists."
    } : null;

    return {
      status: "candidate_triage_only",
      runtimeEligible: false,
      selectionMethod: "coverage_heuristic_not_information_gain",
      informationGainAvailable: false,
      hypotheses,
      evidenceQuality: {
        acceptedMeasurementCount: valid.length,
        incompleteMeasurementCount: incomplete.length,
        rejectedMeasurementCount: rejected.length,
        qualityUnknownCount: valid.filter(item =>
          item.sensorStatus === "unknown" || item.qualityFlag === "unknown").length,
        estimatedOrUnknownCount: valid.filter(item =>
          item.sourceType === "estimated" || item.sourceType === "unknown").length,
        missingMeasurementDefinitions: missing.map(item => item.name),
        duplicateMeasurementNames,
        incompleteMeasurements: incomplete,
        rejectedMeasurements: rejected
      },
      nextEvidence,
      warnings: [
        "No root cause or probability is inferred.",
        "Direct, PLC, historian, estimated and unknown provenance remain distinct.",
        "Noisy, stale, contradictory, suspect and failed-sensor readings are excluded from accepted evidence.",
        "Next-observation selection is a coverage heuristic, not expected information gain; approved likelihood sources are not available.",
        "A candidate case cannot enter live diagnosis until source and technical review gates pass."
      ]
    };
  }

  const api = {
    validateCase,
    validateCasebook,
    triageLowFlow,
    contract: { required: REQUIRED.slice() }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceDiagnosticCasebook = api;
})(typeof window !== "undefined" ? window : globalThis);
