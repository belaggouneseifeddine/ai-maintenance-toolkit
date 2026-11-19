/* Pure case-context normalization for the local assistant.
 * No DOM, storage, network, or model-runtime access belongs in this module.
 */
(function (root) {
  "use strict";

  const VERSION = "1.0.0";
  const MEASUREMENT_SOURCES = new Set([
    "direct_measurement", "plc_value", "historian_value", "estimated", "user_reported"
  ]);

  function parseMeasurementReadings(raw) {
    const measurements = [];
    const warnings = [];
    String(raw || "").split(/\r?\n/).filter(Boolean).slice(0, 40).forEach((line, index) => {
      const fields = line.split("|").map(value => value.trim());
      if (fields.length < 3 || !fields[0] || !fields[1] || !fields[2]) {
        warnings.push("line_" + (index + 1) + "_missing_name_value_or_unit");
        return;
      }
      const numeric = fields[1].replace(",", ".");
      const value = /^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(numeric) ? Number(numeric) : fields[1];
      const sourceLabel = fields[3] || "user_reported";
      const source = MEASUREMENT_SOURCES.has(sourceLabel) ? sourceLabel : "unverified_source";
      const timestamp = fields[4] && Number.isFinite(Date.parse(fields[4]))
        ? new Date(fields[4]).toISOString() : null;
      if (fields[4] && !timestamp) warnings.push("line_" + (index + 1) + "_invalid_timestamp");
      if (source === "unverified_source") warnings.push("line_" + (index + 1) + "_unrecognized_source");
      measurements.push({
        name: fields[0].slice(0, 100),
        value,
        unit: fields[2].slice(0, 40),
        source,
        sourceLabel: source === "unverified_source" ? sourceLabel.slice(0, 60) : null,
        timestamp,
        operatingConditions: (fields[5] || "").slice(0, 160),
        sensorStatus: (fields[6] || "").slice(0, 60),
        quality: (fields[7] || "").slice(0, 60)
      });
    });
    return { measurements, warnings };
  }

  function createCaseContext(input) {
    const fields = input && typeof input === "object" ? input : {};
    const parsed = parseMeasurementReadings(fields.measurementText);
    const observations = Array.isArray(fields.observations)
      ? fields.observations : String(fields.observations || "").split(/\r?\n/);
    return {
      equipment: {
        type: String(fields.equipmentType || "").trim().slice(0, 120),
        manufacturer: String(fields.manufacturer || "").trim().slice(0, 120),
        model: String(fields.model || "").trim().slice(0, 160),
        assetId: String(fields.assetId || "").trim().slice(0, 80)
      },
      symptom: String(fields.symptom || "").trim().slice(0, 240),
      alarmCode: String(fields.alarmCode || "").trim().slice(0, 300),
      observations: observations.map(item => String(item || "").trim())
        .filter(Boolean).slice(0, 30).map(item => item.slice(0, 1000)),
      measurementStatus: String(fields.measurementStatus || "unknown").slice(0, 30),
      measurements: parsed.measurements,
      measurementWarnings: parsed.warnings,
      guidedDiagnostic: fields.guidedDiagnostic || null
    };
  }

  const api = Object.freeze({ version: VERSION, parseMeasurementReadings, createCaseContext });
  root.MaintenanceAssistantCaseContext = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
