(function (root) {
  "use strict";
  async function forDiagnostics(query, context) {
    const text = String(query == null ? "" : query).trim();
    if (!text) return { ok: true, status: "empty_query", results: [] };
    const library = root && root.MaintenanceDocumentLibrary;
    if (!library || typeof library.retrieve !== "function") {
      return { ok: false, status: "document_library_unavailable", results: [] };
    }
    try {
      const results = await library.retrieve(text, { consumer: "diagnostics", context: context || {} });
      return {
        ok: true,
        status: results.length ? "approved_claims_retrieved" : "no_approved_diagnostic_sources",
        results: (results || []).map(item => ({
          text: item.text, documentTitle: item.documentTitle, citation: item.citation,
          sourceRef: item.sourceRef, evidenceRole: item.evidenceRole, score: item.score
        }))
      };
    } catch (_) {
      return { ok: false, status: "retrieval_failed", results: [] };
    }
  }
  const api = Object.freeze({ version: "1.1.0", forDiagnostics });
  if (root) root.MaintenanceDocumentRetrieval = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
