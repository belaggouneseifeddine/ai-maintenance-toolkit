/* Local-first knowledge import boundary. Parsing only; never publishes or executes imported content. */
(function (root) {
  "use strict";

  const MAX_BYTES = 5 * 1024 * 1024;
  const MAX_ROWS = 5000;
  const RIGHTS = new Set(["reuse_permitted", "reference_only", "unknown", "prohibited"]);
  const FORMATS = new Set(["json", "csv", "markdown", "text"]);
  const SOURCE_TYPES = new Set(["technical_document", "dataset", "fault_case", "telemetry", "simulation", "ontology", "model", "procedure", "unknown"]);

  function byteLength(value) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value).length;
    return unescape(encodeURIComponent(value)).length;
  }
  function safeText(value, max) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= max;
  }
  function validateSource(source) {
    const errors = [];
    if (!source || typeof source !== "object" || Array.isArray(source)) return { ok: false, errors: ["source_metadata_required"] };
    if (!safeText(source.sourceId, 120)) errors.push("sourceId_required");
    if (!safeText(source.title, 300)) errors.push("source_title_required");
    if (!safeText(source.owner, 160)) errors.push("source_owner_required");
    if (!safeText(source.url, 2048) || !/^https:\/\//i.test(source.url)) errors.push("https_source_url_required");
    if (!safeText(source.version, 120)) errors.push("source_version_or_edition_required");
    if (!safeText(source.sourceType, 80) || !SOURCE_TYPES.has(source.sourceType)) errors.push("invalid_source_type");
    if (!safeText(source.codeLicense, 160)) errors.push("code_license_or_not_applicable_required");
    if (!safeText(source.dataLicense, 160)) errors.push("data_license_or_not_applicable_required");
    if (!safeText(source.attribution, 1000)) errors.push("attribution_or_not_applicable_required");
    if (!RIGHTS.has(source.reuseStatus)) errors.push("invalid_reuse_status");
    if (source.sourceDate != null && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(source.sourceDate))) errors.push("invalid_source_date");
    return { ok: errors.length === 0, errors };
  }
  function parseCsv(text) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"' && cell.length === 0) quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i += 1;
        row.push(cell); cell = "";
        if (row.some(value => value.trim() !== "")) rows.push(row);
        row = [];
      } else cell += ch;
    }
    if (quoted) throw new Error("csv_unclosed_quote");
    row.push(cell);
    if (row.some(value => value.trim() !== "")) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map(value => value.trim());
    if (headers.some(value => !value) || new Set(headers).size !== headers.length) throw new Error("csv_invalid_or_duplicate_headers");
    if (headers.some(value => ["__proto__", "prototype", "constructor"].includes(value))) throw new Error("csv_unsafe_header");
    if (rows.length > MAX_ROWS) throw new Error("csv_row_limit_exceeded");
    return rows.map((values, index) => {
      const item = { _row: index + 2 };
      headers.forEach((header, column) => { item[header] = values[column] == null ? "" : values[column]; });
      return item;
    });
  }
  function rejectDangerousKeys(value, depth) {
    if (depth > 40) throw new Error("json_nesting_limit_exceeded");
    if (!value || typeof value !== "object") return;
    for (const key of Object.keys(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key)) throw new Error("unsafe_json_key");
      rejectDangerousKeys(value[key], depth + 1);
    }
  }
  function parsePayload(content, format) {
    if (format === "json") {
      const parsed = JSON.parse(content);
      rejectDangerousKeys(parsed, 0);
      const items = Array.isArray(parsed) ? parsed :
        (parsed && Array.isArray(parsed.cases) ? parsed.cases :
          (parsed && Array.isArray(parsed.records) ? parsed.records : [parsed]));
      if (items.length > MAX_ROWS) throw new Error("json_record_limit_exceeded");
      return { items, originalEnvelope: !Array.isArray(parsed) && !parsed.cases && !parsed.records ? parsed : null };
    }
    if (format === "csv") return { items: parseCsv(content), originalEnvelope: null };
    if (format === "markdown" || format === "text") return { items: [{ text: content }], originalEnvelope: null };
    throw new Error("unsupported_import_format");
  }
  function importContent(input) {
    const errors = [];
    if (!input || typeof input !== "object") return { ok: false, errors: ["import_request_required"] };
    const format = String(input.format || "").toLowerCase();
    if (!FORMATS.has(format)) errors.push("unsupported_import_format");
    if (!safeText(input.content, MAX_BYTES * 2)) errors.push("content_required_or_too_large");
    else if (byteLength(input.content) > MAX_BYTES) errors.push("content_exceeds_5_mib_limit");
    const sourceCheck = validateSource(input.source);
    errors.push(...sourceCheck.errors);
    if (errors.length) return { ok: false, errors: [...new Set(errors)] };
    try {
      const parsed = parsePayload(input.content, format);
      const items = parsed.items.map((raw, index) => ({
        candidateId: String(input.source.sourceId) + ":" + format + ":" + String(index + 1),
        itemType: format === "json" ? "structured_candidate" : format === "csv" ? "tabular_candidate" : "document_candidate",
        reviewStatus: "candidate",
        runtimeEligible: false,
        raw
      }));
      return {
        ok: true,
        status: "staged_only",
        stagingOnly: true,
        runtimeEligible: false,
        source: Object.assign({}, input.source),
        format,
        itemCount: items.length,
        items,
        warnings: [
          "Imported content is untrusted candidate data and is not executable.",
          "No automatic technical validation, license adjudication, source verification or runtime publication was performed.",
          "CSV rows and document text are not diagnostic cases until explicitly mapped and reviewed.",
          "PDF extraction and page-level review remain in the separate local document-library workflow."
        ]
      };
    } catch (error) {
      return { ok: false, errors: [String(error && error.message || "parse_failed")] };
    }
  }

  const api = Object.freeze({ MAX_BYTES, validateSource, parseCsv, importContent });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceKnowledgeImporter = api;
})(typeof window !== "undefined" ? window : globalThis);
