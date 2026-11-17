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
        const match = Object.entries(aliases).find(([key, variants]) =>
          term === key || term.includes(key) || variants.some(variant => term.includes(normalizeRecordText(variant)))
        );
        const variants = match ? match[1] : [term];
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
        execute: async (input, executionContext) => {
          if (!core || typeof core.executeLocalDiagnosis !== "function" || !engine) {
            throw new Error("local_diagnostic_engine_unavailable");
          }
          const request = requestFrom(input);
          const result = await core.executeLocalDiagnosis({
            ...request,
            intent: "diagnose",
            consent: { sendToAI: false }
          }, engine, await loadFaultLibrary());
          return Object.assign({}, result, executionContext && executionContext.safetyNotice
            ? { safetyWarning: executionContext.safetyNotice } : {});
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
          const typeTerms = expandEquipmentSearchTerms([input.query, equipment.type]);
          const specificTerms = [equipment.manufacturer, equipment.model]
            .map(normalizeRecordText).filter(Boolean);
          const records = stored.records.filter(record => {
            const haystack = normalizeRecordText([record.machine, record.fault, record.action, record.status].join(" "));
            const matchesEquipmentFamily = !typeTerms.length || typeTerms.some(term => haystack.includes(term));
            const matchesSpecificModel = specificTerms.every(term => haystack.includes(term));
            return matchesEquipmentFamily && matchesSpecificModel;
          }).slice(0, input.limit || 10).map(record => ({
            date: record.date.slice(0, 40),
            machine: record.machine.slice(0, 120),
            fault: record.fault.slice(0, 300),
            action: record.action.slice(0, 400),
            status: record.status.slice(0, 50)
          }));
          return { ok: true, status: records.length ? "records_found" : "no_matching_records", count: records.length, records };
        }
      },
      getPreventiveMaintenanceSchedule: {
        validate: input => !!input && typeof input === "object" &&
          (input.query == null || (typeof input.query === "string" && input.query.length <= 160)) &&
          (input.limit == null || (Number.isInteger(input.limit) && input.limit >= 1 && input.limit <= 10)),
        execute: async input => {
          const stored = readPreventiveTasks();
          if (!stored.ok) return stored;
          const queries = expandEquipmentSearchTerms([input.query]);
          const today = localDate(new Date());
          const tasks = stored.tasks.filter(task => !queries.length ||
            queries.some(query => normalizeRecordText(task.machine + " " + task.task).includes(query)))
            .slice(0, input.limit || 8).map(task => {
              const dueDate = calculatePmDue(task);
              return {
                machine: task.machine.slice(0, 120),
                task: task.task.slice(0, 180),
                lastPerformed: task.last,
                repeat: task.repeat,
                intervalDays: task.repeat === "days" ? Number(task.days) : null,
                dueDate,
                status: !dueDate ? "invalid_schedule" : dueDate < today ? "overdue" : dueDate === today ? "due_today" : "upcoming",
                notes: typeof task.notes === "string" ? task.notes.slice(0, 250) : ""
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
      getSafetyChecklistStatus: {
        validate: input => input == null || (typeof input === "object" && !Array.isArray(input)),
        execute: async () => {
          const container = root.document && root.document.querySelector("#safetyChecks");
          if (!container) return { ok: false, status: "safety_checklist_unavailable", items: [] };
          const items = Array.from(container.querySelectorAll("label")).slice(0, 12).map(label => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            return {
              label: String(label.textContent || "").replace(/\s+/g, " ").trim().slice(0, 240),
              checked: !!(checkbox && checkbox.checked)
            };
          }).filter(item => item.label);
          if (!items.length) return { ok: false, status: "safety_checklist_empty", items: [] };
          const checkedCount = items.filter(item => item.checked).length;
          return {
            ok: true,
            status: checkedCount === items.length ? "all_items_checked" : "items_remaining",
            checkedCount,
            total: items.length,
            allChecked: checkedCount === items.length,
            items,
            safetyClearance: false,
            limitation: "Checklist state is user-entered and does not authorize work or replace site procedures, permits, LOTO verification, or competent-person approval."
          };
        }
      },
      createShiftHandoverDraft: {
        validate: input => !!input && typeof input === "object" &&
          ["8", "today", "custom"].includes(input.period || "today") &&
          (input.from == null || (typeof input.from === "string" && input.from.length === 10)) &&
          (input.to == null || (typeof input.to === "string" && input.to.length === 10)) &&
          (input.note == null || (typeof input.note === "string" && input.note.length <= 240)),
        execute: async input => {
          const storedRecords = readMaintenanceRecords();
          if (!storedRecords.ok) return { ok: false, status: storedRecords.status, records: [] };
          const storedTasks = readPreventiveTasks();
          if (!storedTasks.ok) return { ok: false, status: storedTasks.status, records: [] };
          const period = input.period || "today";
          const today = localDate(new Date());
          const from = input.from || "";
          const to = input.to || "";
          const validDate = value => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
            const parts = value.split("-").map(Number);
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.getFullYear() === parts[0] && date.getMonth() === parts[1] - 1 && date.getDate() === parts[2];
          };
          if (period === "custom" && (!validDate(from) || !validDate(to) || from > to)) {
            return { ok: false, status: "invalid_date_range", records: [] };
          }
          const cutoff = Date.now() - 8 * 60 * 60 * 1000;
          const matchingRecords = storedRecords.records.filter(record => {
            if (period === "today") return record.date === today;
            if (period === "custom") return validDate(record.date) && record.date >= from && record.date <= to;
            if (record.createdAt) {
              const timestamp = new Date(record.createdAt).getTime();
              return Number.isFinite(timestamp) && timestamp >= cutoff;
            }
            return record.date === today;
          });
          const selected = matchingRecords.slice(0, 8).map(record => ({
            date: record.date.slice(0, 40),
            machine: record.machine.slice(0, 80),
            fault: record.fault.slice(0, 200),
            action: record.action.slice(0, 220),
            status: record.status.slice(0, 40),
            timestampAvailable: typeof record.createdAt === "string" && Number.isFinite(new Date(record.createdAt).getTime())
          }));
          const pm = storedTasks.tasks.map(task => {
            const dueDate = calculatePmDue(task);
            return {
              machine: task.machine.slice(0, 60),
              task: task.task.slice(0, 100),
              lastPerformed: task.last,
              dueDate,
              status: !dueDate ? "invalid_schedule" : dueDate < today ? "overdue" : dueDate === today ? "due_today" : "upcoming",
              notes: typeof task.notes === "string" ? task.notes.slice(0, 80) : ""
            };
          });
          return {
            ok: true,
            status: "draft_created",
            type: "shift_handover_draft",
            persisted: false,
            generatedAt: new Date().toISOString(),
            period: { type: period, from: period === "custom" ? from : null, to: period === "custom" ? to : null },
            recordCount: selected.length,
            totalMatchingRecords: matchingRecords.length,
            recordsTruncated: matchingRecords.length > selected.length,
            records: selected,
            pmDue: pm.filter(task => task.status === "overdue" || task.status === "due_today").slice(0, 6),
            totalPmDue: pm.filter(task => task.status === "overdue" || task.status === "due_today").length,
            pmDueTruncated: pm.filter(task => task.status === "overdue" || task.status === "due_today") .length > 6,
            invalidPmSchedules: pm.filter(task => task.status === "invalid_schedule").slice(0, 6),
            totalInvalidPmSchedules: pm.filter(task => task.status === "invalid_schedule").length,
            invalidPmSchedulesTruncated: pm.filter(task => task.status === "invalid_schedule").length > 6,
            note: typeof input.note === "string" ? input.note.trim().slice(0, 240) : "",
            limitations: [
              "Draft only; it has not been saved or shared.",
              "Records reflect local user-entered data and are not independently verified.",
              "Legacy records without timestamps are included only when their date is today for the last-8-hours view.",
              "PM due dates use only saved intervals; invalid schedules require review."
            ]
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
