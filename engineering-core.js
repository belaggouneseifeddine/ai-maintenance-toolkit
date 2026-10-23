/* Pure request normalization and conservative routing for Maintenance AI.
 * No DOM, network, storage, provider, or secret access. Not wired into production UI yet.
 */
(function (root) {
  "use strict";

  const ALLOWED_LANGUAGES = new Set(["ar", "fr", "en"]);
  const ALLOWED_INTENTS = new Set([
    "diagnose", "explain", "calculate", "search_knowledge",
    "analyze_document", "create_report", "unknown"
  ]);
  const LIMITS = Object.freeze({
    equipment: 160,
    manufacturer: 120,
    model: 120,
    symptom: 600,
    observations: 10,
    observationLength: 800,
    measurements: 10,
    measurementName: 100,
    unit: 24,
    attachmentCount: 5,
    attachmentName: 180,
    attachmentType: 120
  });

  const HAZARD_PATTERNS = [
    /\b(bypass|disable|defeat|override)\b/i,
    /\b(interlock|guard|safety trip|relief valve)\b.{0,60}\b(bypass|disable|defeat|override)\b/i,
    /\b(high[- ]pressure|pressurized|pressure jet|fluid injection)\b.{0,80}\b(leak|jet|hose|fitting|oil)\b/i,
    /\b(energized|live electrical|electric shock|arc flash)\b/i,
    /\b(تجاوز|تعطيل|إلغاء)\b.{0,50}\b(حماية|قفل|إنترلوك|حاجز|إنذار)\b/i,
    /\b(تسرب|نفث)\b.{0,70}\b(ضغط عال|ضغط مرتفع|هيدروليك|زيت)\b/i,
    /\b(contourner|désactiver|neutraliser)\b.{0,60}\b(verrouillage|interverrouillage|protection|carter)\b/i,
    /\b(fuite|jet)\b.{0,70}\b(haute pression|hydraulique|huile)\b/i
  ];

  function boundedString(value, max, field, errors, required) {
    if (value == null) value = "";
    if (typeof value !== "string") {
      errors.push({ code: "invalid_type", field });
      return "";
    }
    const result = value.trim();
    if (required && !result) errors.push({ code: "required", field });
    if (result.length > max) errors.push({ code: "too_long", field, max });
    return result.slice(0, max);
  }

  function normalizeRequest(input) {
    const errors = [];
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { ok: false, errors: [{ code: "invalid_request", field: "request" }] };
    }

    const language = input.language == null ? "ar" : input.language;
    if (typeof language !== "string" || !ALLOWED_LANGUAGES.has(language)) {
      errors.push({ code: "unsupported_language", field: "language" });
    }

    const intent = input.intent == null ? "unknown" : input.intent;
    if (typeof intent !== "string" || !ALLOWED_INTENTS.has(intent)) {
      errors.push({ code: "unsupported_intent", field: "intent" });
    }

    const equipmentInput = input.equipment == null ? {} : input.equipment;
    if (!equipmentInput || typeof equipmentInput !== "object" || Array.isArray(equipmentInput)) {
      errors.push({ code: "invalid_type", field: "equipment" });
    }
    const equipment = {
      type: boundedString(equipmentInput && equipmentInput.type, LIMITS.equipment, "equipment.type", errors, false),
      manufacturer: boundedString(equipmentInput && equipmentInput.manufacturer, LIMITS.manufacturer, "equipment.manufacturer", errors, false),
      model: boundedString(equipmentInput && equipmentInput.model, LIMITS.model, "equipment.model", errors, false)
    };

    const symptom = boundedString(input.symptom, LIMITS.symptom, "symptom", errors, false);
    let observations = [];
    if (input.observations != null) {
      if (!Array.isArray(input.observations) || input.observations.length > LIMITS.observations) {
        errors.push({ code: "invalid_list", field: "observations", max: LIMITS.observations });
      } else {
        observations = input.observations.map((v, i) =>
          boundedString(v, LIMITS.observationLength, "observations[" + i + "]", errors, false)
        );
      }
    }

    let measurements = [];
    if (input.measurements != null) {
      if (!Array.isArray(input.measurements) || input.measurements.length > LIMITS.measurements) {
        errors.push({ code: "invalid_list", field: "measurements", max: LIMITS.measurements });
      } else {
        measurements = input.measurements.map((item, i) => {
          if (!item || typeof item !== "object" || Array.isArray(item)) {
            errors.push({ code: "invalid_type", field: "measurements[" + i + "]" });
            return { name: "", value: null, unit: "" };
          }
          const name = boundedString(item.name, LIMITS.measurementName, "measurements[" + i + "].name", errors, true);
          const unit = boundedString(item.unit, LIMITS.unit, "measurements[" + i + "].unit", errors, true);
          if (typeof item.value !== "number" || !Number.isFinite(item.value)) {
            errors.push({ code: "invalid_measurement", field: "measurements[" + i + "].value" });
          }
          return {
            name,
            value: typeof item.value === "number" && Number.isFinite(item.value) ? item.value : null,
            unit,
            ...(typeof item.timestamp === "string" && item.timestamp.length <= 40 ? { timestamp: item.timestamp } : {})
          };
        });
      }
    }

    let attachments = [];
    if (input.attachments != null) {
      if (!Array.isArray(input.attachments) || input.attachments.length > LIMITS.attachmentCount) {
        errors.push({ code: "invalid_list", field: "attachments", max: LIMITS.attachmentCount });
      } else {
        attachments = input.attachments.map((item, i) => {
          if (!item || typeof item !== "object" || Array.isArray(item)) {
            errors.push({ code: "invalid_type", field: "attachments[" + i + "]" });
            return { id: "", mediaType: "" };
          }
          return {
            id: boundedString(item.id, 120, "attachments[" + i + "].id", errors, true),
            mediaType: boundedString(item.mediaType, LIMITS.attachmentType, "attachments[" + i + "].mediaType", errors, true),
            ...(typeof item.name === "string" ? { name: boundedString(item.name, LIMITS.attachmentName, "attachments[" + i + "].name", errors, false) } : {})
          };
        });
      }
    }

    const consentInput = input.consent == null ? {} : input.consent;
    if (!consentInput || typeof consentInput !== "object" || Array.isArray(consentInput)) {
      errors.push({ code: "invalid_type", field: "consent" });
    }
    const sendToAI = !!(consentInput && consentInput.sendToAI === true);
    const contextInput = input.context == null ? {} : input.context;
    if (!contextInput || typeof contextInput !== "object" || Array.isArray(contextInput)) {
      errors.push({ code: "invalid_type", field: "context" });
    }

    if (errors.length) return { ok: false, errors };

    return {
      ok: true,
      value: {
        intent,
        language,
        equipment,
        symptom,
        observations,
        measurements,
        attachments,
        consent: { sendToAI },
        context: {
          ...(typeof contextInput.sessionId === "string" && contextInput.sessionId.length <= 120 ? { sessionId: contextInput.sessionId } : {}),
          ...(typeof contextInput.assetId === "string" && contextInput.assetId.length <= 120 ? { assetId: contextInput.assetId } : {})
        }
      }
    };
  }

  function requestText(request) {
    return [
      request.symptom,
      ...request.observations,
      ...request.measurements.map(m => m.name + " " + m.value + " " + m.unit)
    ].filter(Boolean).join(" ");
  }

  function hasSafetyTrigger(request) {
    const text = [
      request.equipment.type,
      request.symptom,
      ...request.observations
    ].join(" ");
    return HAZARD_PATTERNS.some(pattern => pattern.test(text));
  }

  function inferIntent(request) {
    if (request.intent !== "unknown") return request.intent;
    const text = requestText(request);
    if (!text.trim()) return "unknown";
    if (request.attachments.length) return "analyze_document";
    if (/\b(calculate|compute|convert|formula|calculate the|احسب|حساب|حوّل|calculer|convertir|formule)\b/i.test(text)) return "calculate";
    if (/\b(why|explain|meaning|what is|اشرح|ما معنى|لماذا|expliquer|signification|pourquoi)\b/i.test(text)) return "explain";
    if (/\b(manual|datasheet|source|document|كتيب|دليل المصنع|مصدر|وثيقة|manuel|fiche technique|document)\b/i.test(text)) return "search_knowledge";
    if (request.symptom || request.measurements.length || request.observations.length) return "diagnose";
    return "unknown";
  }

  function routeRequest(input) {
    const normalized = normalizeRequest(input);
    if (!normalized.ok) {
      return { ok: false, errors: normalized.errors };
    }

    const request = normalized.value;
    const intent = inferIntent(request);
    const safetyReviewRequired = hasSafetyTrigger(request);

    if (safetyReviewRequired) {
      return {
        ok: true,
        decision: {
          intent,
          route: "safety_review",
          requiresNetwork: false,
          requiresExplicitAIConsent: false,
          safetyReviewRequired: true,
          missingInformation: [],
          reasonCodes: ["hazard_language_detected", "deterministic_safety_first"]
        }
      };
    }

    const base = {
      intent,
      requiresNetwork: false,
      requiresExplicitAIConsent: false,
      safetyReviewRequired: false,
      missingInformation: [],
      reasonCodes: []
    };

    if (intent === "diagnose") {
      if (!request.equipment.type || !request.symptom) {
        return { ok: true, decision: { ...base, route: "clarify", missingInformation: [!request.equipment.type ? "equipment.type" : null, !request.symptom ? "symptom" : null].filter(Boolean), reasonCodes: ["diagnosis_requires_equipment_and_symptom"] } };
      }
      return { ok: true, decision: { ...base, route: "local_diagnostic", reasonCodes: ["deterministic_diagnosis_first"] } };
    }

    if (intent === "explain") {
      return { ok: true, decision: { ...base, route: request.consent.sendToAI ? "ai_assist" : "clarify", requiresNetwork: request.consent.sendToAI, requiresExplicitAIConsent: true, reasonCodes: [request.consent.sendToAI ? "explicit_ai_consent_present" : "ai_consent_required"] } };
    }

    if (intent === "search_knowledge") {
      return { ok: true, decision: { ...base, route: "knowledge_lookup", requiresNetwork: false, reasonCodes: ["knowledge_lookup_may_be_local_or_remote"] } };
    }

    if (intent === "analyze_document") {
      if (!request.attachments.length) {
        return { ok: true, decision: { ...base, route: "clarify", missingInformation: ["attachments"], reasonCodes: ["document_required"] } };
      }
      return { ok: true, decision: { ...base, route: "document_analysis_pending", requiresNetwork: false, reasonCodes: ["attachment_metadata_only_no_upload"] } };
    }

    if (intent === "calculate") {
      return { ok: true, decision: { ...base, route: "engineering_tool_pending", reasonCodes: ["no_calculation_tool_invoked_by_router"] } };
    }

    if (intent === "create_report") {
      return { ok: true, decision: { ...base, route: "report", reasonCodes: ["report_from_provided_data_only"] } };
    }

    return { ok: true, decision: { ...base, route: "clarify", reasonCodes: ["intent_unclear"] } };
  }

  const api = Object.freeze({
    version: "0.1.0",
    normalizeRequest,
    inferIntent,
    hasSafetyTrigger,
    routeRequest
  });
  root.MaintenanceEngineeringCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
