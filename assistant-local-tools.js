/* App-specific adapters for local Maintenance Assistant tools.
 * Document retrieval is delegated only to the reviewed local document library.
 * Fault data is loaded from the same-origin bundled faults.json when needed.
 */
(function (root) {
  "use strict";

  function createLocalTools(options) {
    const config = options || {};
    const core = config.engineeringCore || root.MaintenanceEngineeringCore;
    const engine = config.diagnosticEngine || root.MaintenanceDiagnosticEngine;
    const retrieval = config.documentRetrieval || root.MaintenanceDocumentRetrieval;
    const getGuidedContext = typeof config.getGuidedContext === "function"
      ? config.getGuidedContext : () => null;

    async function loadFaultLibrary() {
      if (config.faultLibrary && Array.isArray(config.faultLibrary.faults)) return config.faultLibrary;
      if (root.MAINTENANCE_FAULTS && Array.isArray(root.MAINTENANCE_FAULTS.faults)) return root.MAINTENANCE_FAULTS;
      if (typeof config.loadFaultLibrary === "function") {
        const library = await config.loadFaultLibrary();
        if (library && Array.isArray(library.faults)) return library;
        throw new Error("invalid_local_fault_library");
      }
      if (typeof root.fetch !== "function") throw new Error("local_fault_library_unavailable");
      const response = await root.fetch("./faults.json", { method: "GET", credentials: "same-origin" });
      if (!response || !response.ok) throw new Error("local_fault_library_unavailable");
      const library = await response.json();
      if (!library || !Array.isArray(library.faults)) throw new Error("invalid_local_fault_library");
      return library;
    }

    function requestFrom(input) {
      return input && input.request && typeof input.request === "object" ? input.request : input || {};
    }
    function validDiagnosticInput(input) {
      const request = requestFrom(input);
      return !!request && typeof request === "object" &&
        request.equipment && typeof request.equipment.type === "string" &&
        typeof request.symptom === "string" &&
        [undefined, "ar", "en", "fr"].includes(request.language) &&
        [undefined, "diagnose"].includes(request.intent) &&
        (request.observations == null || Array.isArray(request.observations));
    }
    function safetyGate({ toolName, input }) {
      if (toolName !== "diagnose") return { allowed: true, reason: "not_a_diagnostic_intervention" };
      if (!core || typeof core.routeRequest !== "function" || !validDiagnosticInput(input)) {
        return { allowed: false, reason: "diagnostic_request_invalid_or_safety_core_unavailable" };
      }
      const request = requestFrom(input);
      const routed = core.routeRequest({
        ...request,
        intent: "diagnose",
        consent: { sendToAI: false }
      });
      if (!routed || routed.ok !== true) return { allowed: false, reason: "safety_router_rejected_request" };
      if (routed.decision && (routed.decision.route === "safety_review" || routed.decision.safetyReviewRequired)) {
        return { allowed: false, reason: "deterministic_safety_review_required", decision: routed.decision };
      }
      return { allowed: true, reason: "no_deterministic_safety_trigger_detected" };
    }

    const tools = {
      diagnose: {
        safetySensitive: true,
        validate: validDiagnosticInput,
        execute: async input => {
          if (!core || typeof core.executeLocalDiagnosis !== "function" || !engine) {
            throw new Error("local_diagnostic_engine_unavailable");
          }
          const request = requestFrom(input);
          return core.executeLocalDiagnosis({
            ...request,
            intent: "diagnose",
            consent: { sendToAI: false }
          }, engine, await loadFaultLibrary());
        }
      },
      searchReviewedDocuments: {
        validate: input => !!input && typeof input.query === "string" &&
          input.query.trim().length > 0 && input.query.length <= 1000 &&
          (input.context == null || (typeof input.context === "object" && !Array.isArray(input.context))),
        execute: async input => {
          if (!retrieval || typeof retrieval.forDiagnostics !== "function") {
            return { ok: false, status: "document_library_unavailable", results: [] };
          }
          return retrieval.forDiagnostics(input.query, input.context || {});
        }
      },
      getEquipmentContext: {
        validate: input => !!input && typeof input === "object" &&
          (input.equipment == null || (typeof input.equipment === "object" && !Array.isArray(input.equipment))),
        execute: async (input, context) => ({
          equipment: input.equipment || context.equipment || {},
          guidedDiagnostic: getGuidedContext()
        })
      },
      checkSafety: {
        validate: validDiagnosticInput,
        execute: async input => {
          if (!core || typeof core.routeRequest !== "function") return { ok: false, status: "safety_core_unavailable" };
          const routed = core.routeRequest({ ...requestFrom(input), intent: "diagnose", consent: { sendToAI: false } });
          if (!routed || routed.ok !== true) return { ok: false, status: "invalid_safety_request" };
          return {
            ok: true,
            status: routed.decision && routed.decision.safetyReviewRequired ? "review_required" : "no_trigger_detected",
            decision: routed.decision
          };
        }
      },
      createDraftReport: {
        validate: input => !!input && typeof input === "object" &&
          typeof input.language === "string" &&
          (input.equipment == null || typeof input.equipment === "object"),
        execute: async input => ({
          type: "maintenance_fault_report",
          status: "draft",
          language: input.language,
          equipment: input.equipment || {},
          observations: Array.isArray(input.observations) ? input.observations.slice(0, 20) : [],
          confirmedCause: "",
          limitations: ["Draft contains supplied information only.", "No root cause is confirmed."]
        })
      }
    };

    return Object.freeze({ tools: Object.freeze(tools), safetyGate });
  }

  const api = Object.freeze({ createLocalTools });
  root.MaintenanceLocalAssistantTools = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
