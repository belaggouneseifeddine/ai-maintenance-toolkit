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

    function readMaintenanceRecords() {
      try {
        if (!root.localStorage || typeof root.localStorage.getItem !== "function") {
          return { ok: false, status: "local_storage_unavailable", records: [] };
        }
        const raw = root.localStorage.getItem("maintenance-ai-toolkit-records-v1");
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return { ok: false, status: "invalid_local_record_store", records: [] };
        const records = parsed.slice(0, 5000).filter(record =>
          record && typeof record === "object" && !Array.isArray(record) &&
          ["date", "machine", "fault", "action", "status"].every(key => typeof record[key] === "string")
        );
        return { ok: true, records };
      } catch (_) {
        return { ok: false, status: "local_record_read_failed", records: [] };
      }
    }

    function normalizeRecordText(value) {
      return String(value || "").toLocaleLowerCase().normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "").replace(/\\s+/g, " ").trim();
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
      getMaintenanceHistory: {
        validate: input => !!input && typeof input === "object" &&
          (input.query == null || (typeof input.query === "string" && input.query.length <= 160)) &&
          (input.equipment == null || (typeof input.equipment === "object" && !Array.isArray(input.equipment))) &&
          (input.limit == null || (Number.isInteger(input.limit) && input.limit >= 1 && input.limit <= 20)),
        execute: async input => {
          const stored = readMaintenanceRecords();
          if (!stored.ok) return stored;
          const equipment = input.equipment || {};
          const terms = [input.query, equipment.type, equipment.manufacturer, equipment.model]
            .map(normalizeRecordText).filter(Boolean);
          const records = stored.records.filter(record => {
            const haystack = normalizeRecordText([record.machine, record.fault, record.action, record.status].join(" "));
            return !terms.length || terms.some(term => haystack.includes(term));
          }).slice(0, input.limit || 10).map(record => ({
            date: record.date.slice(0, 40),
            machine: record.machine.slice(0, 240),
            fault: record.fault.slice(0, 800),
            action: record.action.slice(0, 1000),
            status: record.status.slice(0, 80)
          }));
          return { ok: true, status: records.length ? "records_found" : "no_matching_records", count: records.length, records };
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
