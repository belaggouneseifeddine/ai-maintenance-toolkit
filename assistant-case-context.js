/* Pure case-context normalization for the local assistant.
 * No DOM, storage, network, or model-runtime access belongs in this module.
 */
(function (root) {
  "use strict";

  const VERSION = "1.0.0";
  const MEASUREMENT_SOURCES = new Set([
    "direct_measurement", "plc_value", "historian_value", "estimated", "user_reported", "unknown"
  ]);
  const SENSOR_STATES = new Set(["normal", "suspect", "failed", "unknown"]);
  const QUALITY_FLAGS = new Set(["normal", "noisy", "stale", "contradictory", "unknown"]);

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
      if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(numeric) || !Number.isFinite(Number(numeric))) {
        warnings.push("line_" + (index + 1) + "_non_numeric_measurement");
        return;
      }
      const sourceLabel = fields[3] || "unknown";
      const sourceType = MEASUREMENT_SOURCES.has(sourceLabel) ? sourceLabel : "unknown";
      const timestamp = fields[4] && Number.isFinite(Date.parse(fields[4]))
        ? new Date(fields[4]).toISOString() : null;
      const sensorLabel = fields[6] || "unknown";
      const qualityLabel = fields[7] || "unknown";
      const sensorStatus = SENSOR_STATES.has(sensorLabel) ? sensorLabel : "unknown";
      const qualityFlag = QUALITY_FLAGS.has(qualityLabel) ? qualityLabel : "unknown";
      if (fields[4] && !timestamp) warnings.push("line_" + (index + 1) + "_invalid_timestamp");
      if (!MEASUREMENT_SOURCES.has(sourceLabel)) warnings.push("line_" + (index + 1) + "_unrecognized_source");
      if (!SENSOR_STATES.has(sensorLabel)) warnings.push("line_" + (index + 1) + "_unrecognized_sensor_status");
      if (!QUALITY_FLAGS.has(qualityLabel)) warnings.push("line_" + (index + 1) + "_unrecognized_quality");
      measurements.push({
        name: fields[0].slice(0, 100),
        value: Number(numeric),
        unit: fields[2].slice(0, 24),
        sourceType,
        timestamp,
        operatingCondition: (fields[5] || "").slice(0, 200),
        sensorStatus,
        qualityFlag
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
        .filter(Boolean).slice(0, 10).map(item => item.slice(0, 800)),
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
