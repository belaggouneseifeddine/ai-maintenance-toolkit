/* Build-time diagnostic casebook validation and deterministic evidence triage.
 * Candidate cases are deliberately excluded from live diagnosis until reviewed.
 */
(function (root) {
  "use strict";
  const ALLOWED_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated", "unknown"]);
  const EVIDENCE_SOURCE_TYPES = new Set(["direct_measurement", "plc_value", "historian_value", "estimated"]);
  const TIME_COST_LEVELS = new Set(["low", "medium", "high", "unknown"]);
  const COST_LEVELS = new Set(["low", "medium", "high", "unknown"]);
  const SAFE_OBSERVATION_CLASSES = new Set(["installed_instrument_observation", "external_observation"]);
  const REQUIRED = ["schemaVersion","caseId","title","equipmentFamily","status","applicability","mechanism","symptoms","requiredContext","hypotheses","measurements","tests","limits","stopConditions","verification","sources","licenseStatus","limitations"];

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

  function normalizeName(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
  }

  function parseNumericValue(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function triageLowFlow(input, caseRecord, options) {
    const validation = validateCase(caseRecord, options);
    if (!validation.ok) return { status: "invalid_case", errors: validation.errors, hypotheses: [], nextEvidence: null, candidateNextEvidence: [] };

    const supplied = input && Array.isArray(input.measurements) ? input.measurements : [];
    const parsed = supplied.map((measurement, index) => {
      const value = measurement && parseNumericValue(measurement.value);
      const name = normalizeName(measurement && measurement.name);
      const unit = typeof (measurement && measurement.unit) === "string" ? measurement.unit.trim() : "";
      const location = typeof (measurement && measurement.location) === "string" ? measurement.location.trim() : "";
      const operatingCondition = typeof (measurement && measurement.operatingCondition) === "string" ? measurement.operatingCondition.trim() : "";
      const sourceType = measurement && measurement.sourceType;
      const valid = Boolean(name && value !== null && unit && location && operatingCondition && EVIDENCE_SOURCE_TYPES.has(sourceType));
      return { index, name, value, unit, location, operatingCondition, sourceType, valid };
    });

    const byName = new Map();
    for (const measurement of parsed.filter(item => item.valid)) {
      if (!byName.has(measurement.name)) byName.set(measurement.name, []);
      byName.get(measurement.name).push(measurement);
    }
    const conflicts = new Set();
    for (const [name, readings] of byName) {
      const units = new Set(readings.map(item => item.unit.toLowerCase()));
      if (units.size > 1) {
        conflicts.add(name);
        continue;
      }
      const byCondition = new Map();
      for (const reading of readings) {
        const condition = reading.operatingCondition.toLowerCase();
        if (!byCondition.has(condition)) byCondition.set(condition, new Set());
        byCondition.get(condition).add(reading.value);
      }
      if (Array.from(byCondition.values()).some(values => values.size > 1)) conflicts.add(name);
    }

    const accepted = parsed.filter(item => item.valid && !conflicts.has(item.name));
    const incompleteCount = supplied.length - accepted.length;
    const known = new Set(accepted.map(item => item.name));
    const missing = caseRecord.measurements.filter(item => !known.has(normalizeName(item.name)));
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

    return {
      status: "candidate_triage_only",
      runtimeEligible: false,
      hypotheses,
      evidenceQuality: {
        acceptedMeasurementCount: accepted.length,
        incompleteMeasurementCount: incompleteCount,
        estimatedMeasurementCount: accepted.filter(item => item.sourceType === "estimated").length,
        sourceCounts: Object.fromEntries(Array.from(EVIDENCE_SOURCE_TYPES, type => [type, accepted.filter(item => item.sourceType === type).length])),
        conflictingMeasurementNames: Array.from(conflicts),
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
      warnings: [
        "No root cause or probability is inferred.",
        "Blank, non-numeric, boolean and unknown-provenance readings are not accepted as evidence.",
        "Conflicting same-parameter readings under the same operating condition are excluded until reconciled.",
        "PLC, historian, estimated and direct measurements remain distinct.",
        "No next test is ranked until source-reviewed likelihoods, validated priors, and reviewed time/cost estimates are available.",
        "A candidate case cannot enter live diagnosis until source and technical review gates pass."
      ]
    };
  }

  const api = { validateCase, validateCasebook, triageLowFlow, parseNumericValue };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceDiagnosticCasebook = api;
})(typeof window !== "undefined" ? window : globalThis);
