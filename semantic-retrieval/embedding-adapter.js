/* Provider-neutral embedding adapter.
 * The application supplies an embedder; this module never imports or calls Ollama,
 * a network API, model runtime, DOM, or browser storage.
 */
(function (root) {
  "use strict";
  const VERSION = "0.1.0";
  const MAX_TEXT_CHARS = 12000;
  function fail(code) { const error = new Error(code); error.code = code; return error; }
  function normalizeVector(value, expectedDimensions) {
    const vector = Array.isArray(value) || (value && ArrayBuffer.isView(value)) ? Array.from(value) : null;
    if (!vector || vector.length === 0) throw fail("invalid_embedding");
    if (expectedDimensions && vector.length !== expectedDimensions) throw fail("embedding_dimension_mismatch");
    let normSquared = 0;
    for (const item of vector) {
      if (typeof item !== "number" || !Number.isFinite(item)) throw fail("invalid_embedding_value");
      normSquared += item * item;
    }
    const norm = Math.sqrt(normSquared);
    if (!Number.isFinite(norm) || norm <= 0) throw fail("zero_embedding");
    return vector.map(item => item / norm);
  }
  function createEmbeddingAdapter(options) {
    const config = options || {};
    if (typeof config.embed !== "function") throw fail("embed_function_required");
    if (config.embedBatch !== undefined && typeof config.embedBatch !== "function") throw fail("invalid_batch_embed_function");
    const configuredDimensions = config.dimensions === undefined ? null : Number(config.dimensions);
    if (configuredDimensions !== null && (!Number.isInteger(configuredDimensions) || configuredDimensions < 1)) throw fail("invalid_dimensions");
    let dimensions = configuredDimensions;
    function validateText(text) {
      if (typeof text !== "string" || !text.trim()) throw fail("invalid_embedding_text");
      if (text.length > MAX_TEXT_CHARS) throw fail("embedding_text_too_long");
      return text;
    }
    function accept(value) {
      const vector = normalizeVector(value, dimensions);
      if (dimensions === null) dimensions = vector.length;
      return vector;
    }
    async function embed(text, context) {
      const result = await config.embed(validateText(text), context || {});
      return accept(result && !Array.isArray(result) && !ArrayBuffer.isView(result) ? result.embedding : result);
    }
    async function embedBatch(texts, context) {
      if (!Array.isArray(texts) || texts.length === 0 || texts.length > 128) throw fail("invalid_embedding_batch");
      texts.forEach(validateText);
      let results;
      if (typeof config.embedBatch === "function") results = await config.embedBatch(texts.slice(), context || {});
      else {
        results = [];
        for (const text of texts) results.push(await config.embed(text, context || {}));
      }
      if (!Array.isArray(results) || results.length !== texts.length) throw fail("invalid_embedding_batch_result");
      return results.map(result => accept(result && !Array.isArray(result) && !ArrayBuffer.isView(result) ? result.embedding : result));
    }
    return Object.freeze({ version: VERSION, embed, embedBatch, getDimensions: () => dimensions, isConfigured: () => true });
  }
  const api = Object.freeze({ version: VERSION, createEmbeddingAdapter });
  root.MaintenanceEmbeddingAdapter = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
