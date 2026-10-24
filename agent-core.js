/* Maintenance AI Agent Core v1.
 * Deterministic orchestration only: adapters are injected, never discovered dynamically.
 * This module does not access DOM, network, storage, provider keys, or equipment controls.
 */
(function (root) {
  "use strict";

  const VERSION = "0.1.0";
  const MAX_TOOL_OUTPUT_CHARS = 12000;
  const TOOL_NAMES = new Set(["aiAssist", "searchKnowledge", "calculate", "analyzeDocument"]);

  function safeError(code, route) {
    return {
      ok: false,
      status: "unavailable",
      route,
      error: { code },
      fallback: "Use the local diagnostic engine, verified manuals, and site procedures."
    };
  }

  function boundedResult(value) {
    let text;
    try { text = JSON.stringify(value); } catch { return { truncated: true, value: null }; }
    if (typeof text !== "string" || text.length > MAX_TOOL_OUTPUT_CHARS) {
      return { truncated: true, value: null };
    }
    return value;
  }

  function makeReport(request) {
    return {
      type: "maintenance_fault_report",
      status: "draft",
      language: request.language,
      equipment: {
        type: request.equipment.type,
        manufacturer: request.equipment.manufacturer,
        model: request.equipment.model
      },
      symptom: request.symptom,
      observations: request.observations.slice(),
      measurements: request.measurements.map(item => ({ ...item })),
      confirmedCause: "",
      suggestedActions: [],
      sourceReferences: [],
      limitations: [
        "This report contains user-provided information only.",
        "No root cause is confirmed by report generation.",
        "Review the applicable manufacturer manual and site safety procedures."
      ]
    };
  }

  function createAgentCore(options) {
    const config = options || {};
    const engineeringCore = config.engineeringCore || root.MaintenanceEngineeringCore;
    const diagnosticEngine = config.diagnosticEngine || root.MaintenanceDiagnosticEngine;
    const faultLibrary = config.faultLibrary || root.MAINTENANCE_FAULTS || {};
    const tools = config.tools || {};

    function availableTool(name) {
      return TOOL_NAMES.has(name) && typeof tools[name] === "function";
    }

    async function invokeTool(name, payload, route) {
      if (!availableTool(name)) return safeError("tool_not_configured", route);
      try {
        const output = await tools[name](payload);
        const bounded = boundedResult(output);
        if (bounded && bounded.truncated) return safeError("tool_output_too_large", route);
        return { ok: true, status: "completed", route, data: bounded };
      } catch (_) {
        // Never return provider/network exception text to the UI or logs by default.
        return safeError("tool_failed", route);
      }
    }

    async function run(input) {
      if (!engineeringCore || typeof engineeringCore.routeRequest !== "function" ||
          typeof engineeringCore.normalizeRequest !== "function") {
        return safeError("engineering_core_unavailable", "router");
      }

      const routed = engineeringCore.routeRequest(input);
      if (!routed || routed.ok !== true) {
        return { ok: false, status: "invalid_request", route: "validation", errors: routed && routed.errors ? routed.errors : [{ code: "invalid_request" }] };
      }
      const normalized = engineeringCore.normalizeRequest(input);
      if (!normalized || normalized.ok !== true) {
        return { ok: false, status: "invalid_request", route: "validation", errors: normalized && normalized.errors ? normalized.errors : [{ code: "invalid_request" }] };
      }
      const request = normalized.value;
      const decision = routed.decision;

      // Safety decisions always win. No model or tool may override this branch.
      if (decision.route === "safety_review" || decision.safetyReviewRequired) {
        return {
          ok: true,
          status: "escalation_required",
          route: "safety_review",
          decision,
          data: {
            confirmedCause: "",
            modelCalled: false,
            toolsCalled: [],
            nextAction: "Stop the affected work if safe, follow site isolation/LOTO procedures, and escalate to qualified personnel."
          }
        };
      }

      if (decision.route === "clarify") {
        return { ok: true, status: "needs_clarification", route: "clarify", decision, data: { questionsNeeded: decision.missingInformation || [] } };
      }

      if (decision.route === "local_diagnostic") {
        const local = engineeringCore.executeLocalDiagnosis(input, diagnosticEngine, faultLibrary);
        if (!local || local.ok !== true) return safeError("local_diagnostic_failed", "local_diagnostic");
        const result = {
          ok: true,
          status: "preliminary_assessment",
          route: "local_diagnostic",
          decision,
          data: { diagnosis: local.diagnosis, confirmedCause: "", source: local.source, modelEnhanced: false }
        };

        // The model may explain local findings only after explicit consent; local diagnosis remains available on failure.
        if (request.consent.sendToAI && availableTool("aiAssist")) {
          const enhanced = await invokeTool("aiAssist", {
            task: "explain_local_diagnosis",
            request,
            localDiagnosis: local.diagnosis,
            policy: {
              doNotConfirmRootCauseWithoutEvidence: true,
              doNotInventSpecificationsOrCitations: true,
              preserveSafetyGate: true
            }
          }, "ai_assist");
          if (enhanced.ok) {
            result.data.aiExplanation = enhanced.data;
            result.data.modelEnhanced = true;
          } else {
            result.data.aiFallback = enhanced.error.code;
          }
        }
        return result;
      }

      if (decision.route === "ai_assist") {
        if (!request.consent.sendToAI) {
          return { ok: true, status: "needs_consent", route: "clarify", decision, data: { consentRequired: true } };
        }
        return invokeTool("aiAssist", { task: "answer", request }, "ai_assist");
      }

      if (decision.route === "knowledge_lookup") {
        return invokeTool("searchKnowledge", { request, requireProvenance: true }, "knowledge_lookup");
      }

      if (decision.route === "engineering_tool_pending") {
        return invokeTool("calculate", { request, requireUnits: true, doNotInventInputs: true }, "engineering_tool");
      }

      if (decision.route === "document_analysis_pending") {
        // Attachment metadata is not file content. Never upload or claim to analyze a file here.
        return {
          ok: true,
          status: "awaiting_document_adapter",
          route: "document_analysis",
          decision,
          data: { fileUploaded: false, analysisPerformed: false, note: "Attachment metadata alone is not document content." }
        };
      }

      if (decision.route === "report") {
        return { ok: true, status: "draft_created", route: "report", decision, data: makeReport(request) };
      }

      return { ok: true, status: "needs_clarification", route: "clarify", decision, data: { questionsNeeded: [] } };
    }

    return Object.freeze({ version: VERSION, run });
  }

  const api = Object.freeze({ version: VERSION, createAgentCore });
  root.MaintenanceAIAgentCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
