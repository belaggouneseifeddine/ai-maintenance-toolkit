(function (root, factory) {
  const api = factory(root);
  if (root) root.MaintenanceDocumentRetrieval = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const VERSION = "1.0.0";
  const CONSUMERS = new Set(["research", "study", "diagnostics"]);

  async function retrieveFor(consumer, query, context) {
    if (!CONSUMERS.has(consumer)) {
      return { ok: false, status: "invalid_consumer", consumer: null, results: [] };
    }
    const text = String(query == null ? "" : query).trim();
    if (!text) return { ok: true, status: "empty_query", consumer, results: [] };

    const library = root && root.MaintenanceDocumentLibrary;
    if (!library || typeof library.retrieve !== "function") {
      return { ok: false, status: "document_library_unavailable", consumer, results: [] };
    }

    try {
      const passages = await library.retrieve(text, { consumer, context: context || {} });
      const results = (passages || []).map(item => ({
        text: item.text,
        documentTitle: item.documentTitle,
        citation: item.citation,
        sourceRef: item.sourceRef,
        evidenceRole: item.evidenceRole,
        extractionMethod: item.extractionMethod,
        ocrConfidence: item.ocrConfidence,
        score: item.score
      }));
      const status = results.length
        ? "retrieved"
        : consumer === "diagnostics"
          ? "no_approved_diagnostic_sources"
          : "no_match";
      return { ok: true, status, consumer, results };
    } catch (_) {
      return { ok: false, status: "retrieval_failed", consumer, results: [] };
    }
  }

  return Object.freeze({
    version: VERSION,
    forResearch: query => retrieveFor("research", query),
    forStudy: query => retrieveFor("study", query),
    forDiagnostics: (query, context) => retrieveFor("diagnostics", query, context),
    retrieveFor
  });
});
