/* Provider-neutral in-memory vector index. Persistence is intentionally separate. */
(function (root) {
  "use strict";
  const VERSION = "0.1.0";
  const SNAPSHOT_VERSION = 1;
  const DEFAULT_MAX_ITEMS = 50000;
  function fail(code) { const error = new Error(code); error.code = code; return error; }
  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }
  function safeClone(value, depth) {
    if (depth > 8) throw fail("metadata_too_deep");
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (Array.isArray(value)) return value.map(item => safeClone(item, depth + 1));
    if (!isPlainObject(value)) throw fail("invalid_metadata");
    const output = {};
    for (const key of Object.keys(value)) {
      if (key === "__proto__" || key === "prototype" || key === "constructor") throw fail("unsafe_metadata_key");
      output[key] = safeClone(value[key], depth + 1);
    }
    return output;
  }
  function normalizeVector(input, dimensions) {
    const vector = Array.isArray(input) || (input && ArrayBuffer.isView(input)) ? Array.from(input) : null;
    if (!vector || vector.length !== dimensions) throw fail("embedding_dimension_mismatch");
    let normSquared = 0;
    for (const value of vector) {
      if (typeof value !== "number" || !Number.isFinite(value)) throw fail("invalid_embedding_value");
      normSquared += value * value;
    }
    const norm = Math.sqrt(normSquared);
    if (!Number.isFinite(norm) || norm <= 0) throw fail("zero_embedding");
    return vector.map(value => value / norm);
  }
  function dot(a, b) {
    let score = 0;
    for (let i = 0; i < a.length; i++) score += a[i] * b[i];
    return Math.max(-1, Math.min(1, score));
  }
  function matchesFilter(metadata, filter) {
    if (!filter) return true;
    if (!isPlainObject(filter)) throw fail("invalid_filter");
    return Object.keys(filter).every(key => Array.isArray(filter[key])
      ? filter[key].some(value => metadata[key] === value)
      : metadata[key] === filter[key]);
  }
  function createVectorIndex(options) {
    const config = options || {};
    const dimensions = Number(config.dimensions);
    const maxItems = config.maxItems === undefined ? DEFAULT_MAX_ITEMS : Number(config.maxItems);
    if (!Number.isInteger(dimensions) || dimensions < 1) throw fail("invalid_dimensions");
    if (!Number.isInteger(maxItems) || maxItems < 1 || maxItems > DEFAULT_MAX_ITEMS) throw fail("invalid_max_items");
    const records = new Map();
    function normalizeRecord(record) {
      if (!record || typeof record !== "object" || Array.isArray(record)) throw fail("invalid_record");
      if (typeof record.id !== "string" || !record.id.trim() || record.id.length > 200) throw fail("invalid_record_id");
      if (record.text !== undefined && (typeof record.text !== "string" || record.text.length > 12000)) throw fail("invalid_record_text");
      const metadata = record.metadata === undefined ? {} : safeClone(record.metadata, 0);
      if (!isPlainObject(metadata)) throw fail("invalid_metadata");
      return Object.freeze({ id: record.id, vector: normalizeVector(record.vector, dimensions), text: record.text || "", metadata });
    }
    function add(record) {
      const normalized = normalizeRecord(record);
      if (!records.has(normalized.id) && records.size >= maxItems) throw fail("index_capacity_reached");
      records.set(normalized.id, normalized);
      return { ok: true, id: normalized.id, size: records.size };
    }
    function addBatch(batch) {
      if (!Array.isArray(batch) || batch.length === 0 || batch.length > 1000) throw fail("invalid_record_batch");
      const normalized = batch.map(normalizeRecord);
      const ids = new Set();
      for (const record of normalized) {
        if (ids.has(record.id)) throw fail("duplicate_batch_id");
        ids.add(record.id);
      }
      const newIds = normalized.filter(record => !records.has(record.id)).length;
      if (records.size + newIds > maxItems) throw fail("index_capacity_reached");
      for (const record of normalized) records.set(record.id, record);
      return { ok: true, added: normalized.length, size: records.size };
    }
    function search(queryVector, searchOptions) {
      const opts = searchOptions || {};
      const topK = opts.topK === undefined ? 5 : Number(opts.topK);
      const minScore = opts.minScore === undefined ? -1 : Number(opts.minScore);
      if (!Number.isInteger(topK) || topK < 1 || topK > 100) throw fail("invalid_top_k");
      if (!Number.isFinite(minScore) || minScore < -1 || minScore > 1) throw fail("invalid_min_score");
      const query = normalizeVector(queryVector, dimensions);
      const ranked = [];
      for (const record of records.values()) {
        if (!matchesFilter(record.metadata, opts.filter)) continue;
        const score = dot(query, record.vector);
        if (score >= minScore) ranked.push({ id: record.id, score, text: record.text, metadata: safeClone(record.metadata, 0) });
      }
      ranked.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
      return ranked.slice(0, topK);
    }
    function exportSnapshot() {
      return { version: SNAPSHOT_VERSION, dimensions, records: Array.from(records.values()).map(record => ({
        id: record.id, vector: record.vector.slice(), text: record.text, metadata: safeClone(record.metadata, 0)
      })) };
    }
    function importSnapshot(snapshot) {
      if (!snapshot || typeof snapshot !== "object" || snapshot.version !== SNAPSHOT_VERSION ||
          snapshot.dimensions !== dimensions || !Array.isArray(snapshot.records) || snapshot.records.length > maxItems) {
        throw fail("invalid_index_snapshot");
      }
      const normalized = snapshot.records.map(normalizeRecord);
      const ids = new Set();
      for (const record of normalized) {
        if (ids.has(record.id)) throw fail("duplicate_snapshot_id");
        ids.add(record.id);
      }
      records.clear();
      for (const record of normalized) records.set(record.id, record);
      return { ok: true, size: records.size };
    }
    return Object.freeze({
      version: VERSION, dimensions, add, addBatch,
      remove: id => records.delete(id),
      search,
      clear: () => records.clear(),
      size: () => records.size,
      exportSnapshot,
      importSnapshot
    });
  }
  const api = Object.freeze({ version: VERSION, createVectorIndex });
  root.MaintenanceVectorIndex = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
