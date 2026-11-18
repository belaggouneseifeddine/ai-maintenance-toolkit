/* Build-time diagnostic casebook validation and deterministic evidence triage.
 * Candidate cases are deliberately excluded from live diagnosis until reviewed.
 */
(function (root) {
  "use strict";
  const ALLOWED_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated", "unknown"]);
  const EVIDENCE_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value"]);
  const SENSOR_STATUSES = new Set(["verified", "suspect", "failed", "unknown"]);
  const QUALITY_FLAGS = new Set(["good", "noisy", "stale", "contradictory", "unknown"]);
  const SIGNAL_ROLES = new Set(["physical_measurement", "controller_feedback", "controller_command", "historian_derived", "estimate", "unknown"]);
  const EVIDENCE_CLASSES = new Set(["source_supported_bounded", "source_context_only", "engineering_hypothesis", "design_proposal", "measurement_quality_policy", "site_safety_requirement", "field_observation_definition", "scope_limitation", "validation_plan"]);
  const TIME_COST_LEVELS = new Set(["low", "medium", "high", "unknown"]);
  const COST_LEVELS = new Set(["low", "medium", "high", "unknown"]);
  const SAFE_OBSERVATION_CLASSES = new Set(["installed_instrument_observation", "external_observation"]);
  const REQUIRED = ["schemaVersion","caseId","title","equipmentFamily","status","applicability","mechanism","symptoms","requiredContext","hypotheses","measurements","measurementQualityPolicy","tests","limits","stopConditions","verification","sources","claimTraceability","licenseStatus","limitations"];

  function registeredSources(options) {
    const registry = options && options.sourceRegistry;
    if (!registry || typeof registry !== "object") return null;
    const entries = [
      ...(Array.isArray(registry.sources) ? registry.sources : []),
      ...(Array.isArray(registry.reference_only_documents) ? registry.reference_only_documents : [])
    ];
    return new Map(entries.filter(source => source && source.id).map(source => [source.id, source]));
  }

  function sourceIsRestricted(source, caseSource) {
    const terms = [
      source && source.licenseStatus,
      source && source.dataLicense,
      source && source.license,
      source && source.reuseConditions,
      caseSource && caseSource.reuseStatus
    ].join(" ").toLowerCase();
    return /reference[- ]only|not verified|unresolved|not declared|no clear license|non[- ]commercial|pending review|unknown license/.test(terms);
  }

  function normalizeName(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
  }

  function slugify(value) {
    return normalizeName(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function expectedClaimTargets(item) {
    const targets = ["mechanism"];
    for (const key of ["applicability", "symptoms", "requiredContext", "limits", "stopConditions", "verification", "limitations"]) {
      if (Array.isArray(item[key])) item[key].forEach((_, index) => targets.push(key + "/" + index));
    }
    if (Array.isArray(item.hypotheses)) item.hypotheses.forEach(h => targets.push("hypotheses/" + h.id));
    if (Array.isArray(item.measurements)) item.measurements.forEach(m => targets.push("measurements/" + slugify(m.name)));
    if (Array.isArray(item.tests)) item.tests.forEach(t => targets.push("tests/" + t.id));
    return targets;
  }

  function validateMeasurementQualityPolicy(policy, errors) {
    if (!policy || typeof policy !== "object") {
      errors.push("measurementQualityPolicy is required");
      return;
    }
    if (policy.timestampRequired !== true) errors.push("measurementQualityPolicy.timestampRequired must be true");
    if (!Array.isArray(policy.sensorStatusAllowedForEvidence) || !policy.sensorStatusAllowedForEvidence.includes("verified")) errors.push("evidence requires verified sensor status");
    if (!Array.isArray(policy.qualityFlagsAllowedForEvidence) || !policy.qualityFlagsAllowedForEvidence.includes("good")) errors.push("evidence requires good quality flag");
    if (!Array.isArray(policy.evidenceSourceTypes) || !policy.evidenceSourceTypes.length || policy.evidenceSourceTypes.some(v => !EVIDENCE_SOURCE_TYPES.has(v))) errors.push("evidenceSourceTypes may contain only direct, PLC feedback or historian values");
    if (!Array.isArray(policy.independentSourceTypes) || !policy.independentSourceTypes.includes("direct_measurement")) errors.push("direct measurements must remain identifiable as independent evidence");
    if (!Array.isArray(policy.controlSystemSourceTypes) || !policy.controlSystemSourceTypes.includes("plc_value") || !policy.controlSystemSourceTypes.includes("historian_value")) errors.push("PLC and historian values must remain separate from independent measurements");
    if (!Array.isArray(policy.estimatedSourceTypes) || !policy.estimatedSourceTypes.includes("estimated")) errors.push("estimated values must remain explicitly classified");
    if (!Array.isArray(policy.excludedSignalRoles) || !["controller_command", "estimate", "unknown"].every(v => policy.excludedSignalRoles.includes(v))) errors.push("controller commands, estimates and unknown signal roles must be excluded from evidence");
    if (policy.unitHandling !== "preserve_exact_units_no_automatic_conversion") errors.push("unit handling must preserve reported units without automatic conversion");
  }

  function validateClaimTraceability(item, sourceMap, errors) {
    if (!Array.isArray(item.claimTraceability) || !item.claimTraceability.length) {
      errors.push("claimTraceability must map every technical claim target");
      return;
    }
    const expected = new Set(expectedClaimTargets(item));
    const seenTargets = new Set();
    const seenIds = new Set();
    const itemSources = new Map((Array.isArray(item.sources) ? item.sources : []).map(source => [source.sourceId, source]));
    for (const row of item.claimTraceability) {
      if (!row || typeof row !== "object") {
        errors.push("claimTraceability entries must be objects");
        continue;
      }
      for (const key of ["claimId", "target", "claimText", "evidenceClass", "reviewStatus", "licenseStatus", "reuseStatus", "note"]) {
        if (row[key] === undefined || row[key] === null || row[key] === "") errors.push("claimTraceability entry missing " + key);
      }
      if (seenIds.has(row.claimId)) errors.push("duplicate claimId: " + row.claimId);
      seenIds.add(row.claimId);
      if (!expected.has(row.target)) errors.push("unexpected claimTraceability target: " + row.target);
      if (seenTargets.has(row.target)) errors.push("duplicate claimTraceability target: " + row.target);
      seenTargets.add(row.target);
      if (!EVIDENCE_CLASSES.has(row.evidenceClass)) errors.push("invalid evidenceClass for " + row.target);
      if (row.sourceId) {
        const itemSource = itemSources.get(row.sourceId);
        if (!itemSource) errors.push("claimTraceability source is not attached to case: " + row.sourceId);
        if (sourceMap && !sourceMap.has(row.sourceId)) errors.push("claimTraceability source is unregistered: " + row.sourceId);
        if (row.reviewStatus !== "reviewed" || !row.sectionOrPage) errors.push("source-backed claim requires reviewed section/page: " + row.target);
        if (!["source_supported_bounded", "source_context_only"].includes(row.evidenceClass)) errors.push("source-backed claim must declare bounded support or context-only: " + row.target);
        if (row.licenseStatus !== "reference_only" && row.licenseStatus !== "reuse_permitted") errors.push("source-backed claim requires explicit license status: " + row.target);
        if (itemSource && row.sectionOrPage !== itemSource.sectionOrPage) errors.push("claim section/page must match case source record: " + row.target);
      } else {
        if (row.sectionOrPage !== null) errors.push("source-gap claim must not invent a section/page: " + row.target);
        if (row.reviewStatus !== "not_reviewed" || row.licenseStatus !== "source_gap") errors.push("unreferenced claim must remain explicitly unreviewed/source-gap: " + row.target);
      }
    }
    for (const target of expected) if (!seenTargets.has(target)) errors.push("missing claimTraceability target: " + target);
    if (item.status !== "candidate" && item.claimTraceability.some(row => row.reviewStatus !== "reviewed" || !row.sourceId)) {
      errors.push("reviewed case status requires every claim target to have a reviewed source");
    }
  }

  function validateCase(item, options) {
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
    validateMeasurementQualityPolicy(item.measurementQualityPolicy, errors);
    if (!Array.isArray(item.tests) || !item.tests.length) errors.push("at least one discriminating test is required");
    else for (const t of item.tests) {
      for (const k of ["id","name","prerequisites","safetyClass","discriminates","requiredMeasurements","expectedOutcomes","interpretationLimits","timeCost","costLevel"]) {
        if (t[k] === undefined) errors.push("test missing " + k + ": " + (t.id || "unnamed"));
      }
      if (!["installed_instrument_observation","external_observation","planned_isolated_inspection","qualified_personnel_only","not_permitted"].includes(t.safetyClass)) errors.push("invalid safetyClass: " + t.id);
      if (!Array.isArray(t.discriminates) || t.discriminates.length < 2) errors.push("test must discriminate at least two hypotheses: " + t.id);
      if (!TIME_COST_LEVELS.has(t.timeCost)) errors.push("invalid timeCost: " + t.id);
      if (!COST_LEVELS.has(t.costLevel)) errors.push("invalid costLevel: " + t.id);
    }
    if (!Array.isArray(item.sources)) errors.push("sources must be an array");
    else for (const source of item.sources) {
      if (!source || !source.sourceId || !source.claimScope || !["not_reviewed","reviewed","rejected"].includes(source.reviewStatus)) {
        errors.push("source requires sourceId, claimScope and valid reviewStatus");
      } else if (source.reviewStatus === "reviewed" && !source.sectionOrPage) {
        errors.push("reviewed source requires sectionOrPage: " + source.sourceId);
      }
    }
    const sourceMap = registeredSources(options);
    if (sourceMap && Array.isArray(item.sources)) {
      for (const source of item.sources) {
        const registered = sourceMap.get(source.sourceId);
        if (!registered) errors.push("unregistered source: " + source.sourceId);
        else if (item.licenseStatus === "reuse_permitted" && sourceIsRestricted(registered, source)) {
          errors.push("reuse_permitted conflicts with restricted or unverified source: " + source.sourceId);
        }
      }
    }
    validateClaimTraceability(item, sourceMap, errors);
    if (item.status !== "candidate" && (!Array.isArray(item.sources) || !item.sources.length || item.sources.some(s => s.reviewStatus !== "reviewed" || !s.sectionOrPage))) errors.push("reviewed status requires reviewed claim-level sources with section/page");
    if (item.status === "field_validated" && (!Array.isArray(item.verification) || !item.verification.length || !Array.isArray(item.limitations) || item.limitations.some(v => /not been performed|not yet been reviewed/i.test(v)))) errors.push("field_validated case cannot retain unresolved validation limitations");
    if (item.licenseStatus !== "reuse_permitted" && item.status === "field_validated") errors.push("field-validated runtime content requires explicit reuse permission");
    if (JSON.stringify(item).match(/\b(?:probability|confidence)\s*:\s*0?\.\d+/i)) errors.push("uncalibrated numeric probability/confidence is not permitted");
    return { ok: errors.length === 0, errors };
  }

  function validateCasebook(book, options) {
    if (!book || book.schemaVersion !== 1 || !Array.isArray(book.cases)) return { ok: false, errors: ["invalid casebook envelope"], cases: [] };
    const cases = book.cases.map(item => ({ caseId: item.caseId, ...validateCase(item, options) }));
    return { ok: cases.every(c => c.ok), errors: cases.flatMap(c => c.errors.map(e => c.caseId + ": " + e)), cases };
  }

  function parseNumericValue(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseTimestamp(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function triageLowFlow(input, caseRecord, options) {
    const validation = validateCase(caseRecord, options);
    if (!validation.ok) return { status: "invalid_case", errors: validation.errors, hypotheses: [], nextEvidence: null, candidateNextEvidence: [] };

    const supplied = input && Array.isArray(input.measurements) ? input.measurements : [];
    const definitions = new Map(caseRecord.measurements.map(item => [normalizeName(item.name), item]));
    const policy = caseRecord.measurementQualityPolicy;
    const parsed = supplied.map((measurement, index) => {
      const value = measurement && parseNumericValue(measurement.value);
      const name = normalizeName(measurement && measurement.name);
      const unit = typeof (measurement && measurement.unit) === "string" ? measurement.unit.trim() : "";
      const location = typeof (measurement && measurement.location) === "string" ? measurement.location.trim() : "";
      const operatingCondition = typeof (measurement && measurement.operatingCondition) === "string" ? measurement.operatingCondition.trim() : "";
      const sourceType = measurement && measurement.sourceType;
      const timestamp = parseTimestamp(measurement && measurement.timestamp);
      const sensorStatus = measurement && SENSOR_STATUSES.has(measurement.sensorStatus) ? measurement.sensorStatus : "unknown";
      const qualityFlag = measurement && QUALITY_FLAGS.has(measurement.qualityFlag) ? measurement.qualityFlag : "unknown";
      const signalRole = measurement && SIGNAL_ROLES.has(measurement.signalRole) ? measurement.signalRole : "unknown";
      const definition = definitions.get(name);
      const roleCompatible =
        (sourceType === "direct_measurement" && signalRole === "physical_measurement") ||
        (sourceType === "plc_value" && ["controller_feedback", "controller_command"].includes(signalRole)) ||
        (sourceType === "historian_value" && signalRole === "historian_derived") ||
        (sourceType === "estimated" && signalRole === "estimate") ||
        (sourceType === "unknown" && signalRole === "unknown");
      const structurallyValid = Boolean(
        name && definition && value !== null && unit && location && operatingCondition &&
        ALLOWED_SOURCE_TYPES.has(sourceType) && timestamp !== null &&
        SENSOR_STATUSES.has(sensorStatus) && QUALITY_FLAGS.has(qualityFlag) &&
        SIGNAL_ROLES.has(signalRole) && roleCompatible &&
        Array.isArray(definition.sourceTypes) && definition.sourceTypes.includes(sourceType)
      );
      const evidenceEligible = Boolean(
        structurallyValid &&
        policy.evidenceSourceTypes.includes(sourceType) &&
        policy.sensorStatusAllowedForEvidence.includes(sensorStatus) &&
        policy.qualityFlagsAllowedForEvidence.includes(qualityFlag) &&
        !policy.excludedSignalRoles.includes(signalRole)
      );
      return { index, name, value, unit, location, operatingCondition, sourceType, timestamp, sensorStatus, qualityFlag, signalRole, structurallyValid, evidenceEligible };
    });

    const evidenceReadings = parsed.filter(item => item.evidenceEligible);
    const unitConflicts = new Set();
    const unitsByName = new Map();
    for (const reading of evidenceReadings) {
      if (!unitsByName.has(reading.name)) unitsByName.set(reading.name, new Set());
      unitsByName.get(reading.name).add(reading.unit.toLowerCase());
    }
    for (const [name, units] of unitsByName) if (units.size > 1) unitConflicts.add(name);

    const valueGroups = new Map();
    for (const reading of evidenceReadings) {
      const key = [reading.name, reading.unit.toLowerCase(), reading.location.toLowerCase(), reading.operatingCondition.toLowerCase(), reading.timestamp].join("|");
      if (!valueGroups.has(key)) valueGroups.set(key, { name: reading.name, values: new Set() });
      valueGroups.get(key).values.add(reading.value);
    }
    const valueConflicts = new Set(Array.from(valueGroups.values()).filter(group => group.values.size > 1).map(group => group.name));
    const conflicts = new Set([...unitConflicts, ...valueConflicts]);
    const accepted = evidenceReadings.filter(item => !conflicts.has(item.name));
    const known = new Set(accepted.map(item => item.name));
    const missing = caseRecord.measurements.filter(item => !known.has(normalizeName(item.name)));
    const unknownMeasurementNames = [...new Set(parsed.filter(item => item.name && !definitions.has(item.name)).map(item => item.name))];
    const hypotheses = caseRecord.hypotheses.map(h => ({
      id: h.id,
      cause: h.cause,
      status: "unresolved",
      rationale: "No validated case-specific rule or calibrated likelihood model has been applied; review evidence for and against manually."
    }));

    const candidateNextEvidence = caseRecord.tests
      .filter(test => SAFE_OBSERVATION_CLASSES.has(test.safetyClass))
      .map(test => {
        const missingMeasurements = (test.requiredMeasurements || []).filter(name => !known.has(normalizeName(name)));
        return {
          id: test.id,
          name: test.name,
          safetyClass: test.safetyClass,
          discriminates: test.discriminates,
          missingMeasurements,
          timeCost: test.timeCost,
          costLevel: test.costLevel,
          selectionState: "candidate_unranked"
        };
      })
      .filter(test => test.missingMeasurements.length > 0);

    const selectionBlockedReasons = [
      "No source-reviewed per-outcome likelihood model and validated prior distribution is attached to this candidate case.",
      "Time and cost estimates are unknown; no ranking can apply the requested time/cost constraints."
    ];
    const sourceCounts = Object.fromEntries(Array.from(ALLOWED_SOURCE_TYPES, type => [type, parsed.filter(item => item.sourceType === type).length]));
    const qualityRejected = parsed.filter(item => !item.evidenceEligible);
    const warnings = [
      "No root cause or probability is inferred.",
      "Only timestamped readings with verified sensor status, good quality and a compatible source role count as evidence.",
      "Estimated and unknown-provenance readings are retained as context but cannot satisfy required evidence.",
      "PLC command values are not treated as actual measured speed; PLC feedback and historian values remain separate from independent measurements.",
      "Units are compared exactly as reported; no automatic conversion is performed.",
      "Conflicting same-parameter readings at the same location, operating condition and timestamp are excluded until reconciled.",
      "No next test is ranked until source-reviewed likelihoods, validated priors, and reviewed time/cost estimates are available.",
      "A candidate case cannot enter live diagnosis until source and technical review gates pass."
    ];
    if (qualityRejected.length) warnings.push("One or more readings were excluded because provenance, timestamp, sensor status, quality flag or signal role was incomplete or not eligible.");
    if (unknownMeasurementNames.length) warnings.push("Unrecognized measurement names were not used as evidence.");
    if (conflicts.size) warnings.push("Unit or same-time value conflicts were detected; affected parameters remain unresolved.");

    return {
      status: "candidate_triage_only",
      runtimeEligible: false,
      hypotheses,
      evidenceQuality: {
        recordedMeasurementCount: parsed.filter(item => item.structurallyValid).length,
        acceptedMeasurementCount: accepted.length,
        incompleteMeasurementCount: supplied.length - accepted.length,
        independentMeasurementCount: accepted.filter(item => item.sourceType === "direct_measurement").length,
        controlSystemValueCount: accepted.filter(item => ["plc_value", "historian_value"].includes(item.sourceType)).length,
        estimatedMeasurementCount: parsed.filter(item => item.sourceType === "estimated").length,
        unknownProvenanceCount: parsed.filter(item => item.sourceType === "unknown" || !ALLOWED_SOURCE_TYPES.has(item.sourceType)).length,
        controllerCommandCount: parsed.filter(item => item.signalRole === "controller_command").length,
        qualityRejectedCount: qualityRejected.length,
        noisyMeasurementCount: parsed.filter(item => item.qualityFlag === "noisy").length,
        staleMeasurementCount: parsed.filter(item => item.qualityFlag === "stale").length,
        failedSensorCount: parsed.filter(item => item.sensorStatus === "failed").length,
        suspectSensorCount: parsed.filter(item => item.sensorStatus === "suspect").length,
        unknownTimestampCount: parsed.filter(item => item.timestamp === null).length,
        unknownMeasurementNames,
        unitConflictNames: Array.from(unitConflicts),
        conflictingMeasurementNames: Array.from(valueConflicts),
        sourceCounts,
        missingMeasurementDefinitions: missing.map(item => item.name)
      },
      candidateNextEvidence,
      nextEvidence: null,
      selection: {
        status: "blocked_unvalidated_information_model",
        method: "not_selected",
        blockedReasons: selectionBlockedReasons,
        safetyPolicy: "Only installed-instrument and external observations are listed; invasive or qualified-personnel-only tests are never auto-selected."
      },
      warnings
    };
  }

  const api = { validateCase, validateCasebook, triageLowFlow, parseNumericValue, parseTimestamp, expectedClaimTargets };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceDiagnosticCasebook = api;
})(typeof window !== "undefined" ? window : globalThis);
