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
        .replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
    }

    function expandEquipmentSearchTerms(values) {
      const aliases = {
        pump: ["pump", "مضخ", "pompe"],
        motor: ["motor", "محرك", "moteur"],
        compressor: ["compressor", "ضاغط", "compresseur"],
        vfd: ["vfd", "variator", "variateur", "مغير السرعة"],
        valve: ["valve", "صمام", "vanne"],
        gearbox: ["gearbox", "علبة التروس", "réducteur"],
        bearing: ["bearing", "محمل", "رولمان", "roulement"]
      };
      const terms = [];
      values.map(normalizeRecordText).filter(Boolean).forEach(term => {
        const variants = aliases[term] || [term];
        variants.forEach(variant => { if (!terms.includes(variant)) terms.push(variant); });
      });
      return terms;
    }

    function localDate(date) {
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") +
        "-" + String(date.getDate()).padStart(2, "0");
    }
    function calculatePmDue(task) {
      if (!task || typeof task.last !== "string") return "";
      const parts = task.last.split("-").map(Number);
      if (parts.length !== 3 || !parts.every(Number.isInteger)) return "";
      const [year, month, day] = parts;
      const base = new Date(year, month - 1, day);
      if (month < 1 || month > 12 || day < 1 ||
          base.getFullYear() !== year || base.getMonth() !== month - 1 || base.getDate() !== day) return "";
      if (task.repeat === "monthly") {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const lastDay = new Date(nextYear, nextMonth, 0).getDate();
        return localDate(new Date(nextYear, nextMonth - 1, Math.min(day, lastDay)));
      }
      if (task.repeat !== "days" || !Number.isInteger(Number(task.days)) ||
          Number(task.days) < 1 || Number(task.days) > 3650) return "";
      base.setDate(base.getDate() + Number(task.days));
      return localDate(base);
    }
    function readPreventiveTasks() {
      try {
        if (!root.localStorage || typeof root.localStorage.getItem !== "function") {
          return { ok: false, status: "local_storage_unavailable", tasks: [] };
        }
        const raw = root.localStorage.getItem("maintenance-ai-toolkit-pm-v1");
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return { ok: false, status: "invalid_pm_store", tasks: [] };
        return {
          ok: true,
          tasks: parsed.slice(0, 5000).filter(task => task && typeof task === "object" &&
            typeof task.machine === "string" && typeof task.task === "string" &&
            typeof task.last === "string" && ["monthly", "days"].includes(task.repeat))
        };
      } catch (_) {
        return { ok: false, status: "pm_store_read_failed", tasks: [] };
      }
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
          const terms = expandEquipmentSearchTerms([input.query, equipment.type, equipment.manufacturer, equipment.model]);
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
      getPreventiveMaintenanceSchedule: {
        validate: input => !!input && typeof input === "object" &&
          (input.query == null || (typeof input.query === "string" && input.query.length <= 160)) &&
          (input.limit == null || (Number.isInteger(input.limit) && input.limit >= 1 && input.limit <= 30)),
        execute: async input => {
          const stored = readPreventiveTasks();
          if (!stored.ok) return stored;
          const queries = expandEquipmentSearchTerms([input.query]);
          const today = localDate(new Date());
          const tasks = stored.tasks.filter(task => !queries.length ||
            queries.some(query => normalizeRecordText(task.machine + " " + task.task).includes(query)))
            .slice(0, input.limit || 20).map(task => {
              const dueDate = calculatePmDue(task);
              return {
                machine: task.machine.slice(0, 240),
                task: task.task.slice(0, 300),
                lastPerformed: task.last,
                repeat: task.repeat,
                intervalDays: task.repeat === "days" ? Number(task.days) : null,
                dueDate,
                status: !dueDate ? "invalid_schedule" : dueDate < today ? "overdue" : dueDate === today ? "due_today" : "upcoming",
                notes: typeof task.notes === "string" ? task.notes.slice(0, 500) : ""
              };
            });
          return {
            ok: true,
            status: tasks.length ? "schedule_found" : "no_matching_pm_tasks",
            asOfDate: today,
            count: tasks.length,
            tasks
          };
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
