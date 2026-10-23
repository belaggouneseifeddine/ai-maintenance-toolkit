const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engineering-core.js");

test("valid request normalizes without mutating the caller object", () => {
  const input = {
    intent: "diagnose",
    language: "fr",
    equipment: { type: "pompe", manufacturer: "OEM", model: "P-100" },
    symptom: "Débit faible",
    observations: ["Pression instable"],
    measurements: [{ name: "pressure", value: 2.5, unit: "bar" }],
    consent: { sendToAI: false }
  };
  const before = JSON.stringify(input);
  const result = core.normalizeRequest(input);
  assert.equal(result.ok, true);
  assert.equal(result.value.language, "fr");
  assert.equal(result.value.measurements[0].value, 2.5);
  assert.equal(JSON.stringify(input), before);
});

test("rejects unsupported language and intent instead of silently guessing", () => {
  const result = core.normalizeRequest({ language: "xx", intent: "execute_machine" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "unsupported_language"));
  assert.ok(result.errors.some(e => e.code === "unsupported_intent"));
});

test("rejects oversized lists, invalid measurement values and missing units", () => {
  const result = core.normalizeRequest({
    intent: "diagnose",
    measurements: [{ name: "pressure", value: Infinity, unit: "" }],
    observations: Array.from({ length: 11 }, () => "x")
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "invalid_list" && e.field === "observations"));
  assert.ok(result.errors.some(e => e.code === "invalid_measurement"));
  assert.ok(result.errors.some(e => e.code === "required" && e.field === "measurements[0].unit"));
});

test("clear diagnosis routes to the existing local diagnostic engine first", () => {
  const result = core.routeRequest({
    intent: "diagnose",
    language: "ar",
    equipment: { type: "pump" },
    symptom: "low flow",
    consent: { sendToAI: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.decision.route, "local_diagnostic");
  assert.equal(result.decision.requiresNetwork, false);
});

test("diagnosis missing equipment or symptom asks for clarification", () => {
  const result = core.routeRequest({ intent: "diagnose", equipment: { type: "pump" } });
  assert.equal(result.ok, true);
  assert.equal(result.decision.route, "clarify");
  assert.deepEqual(result.decision.missingInformation, ["symptom"]);
});

test("AI explanation requires explicit consent before any network route", () => {
  const noConsent = core.routeRequest({ intent: "explain", symptom: "Why is a pump noisy?", consent: { sendToAI: false } });
  const withConsent = core.routeRequest({ intent: "explain", symptom: "Why is a pump noisy?", consent: { sendToAI: true } });
  assert.equal(noConsent.decision.route, "clarify");
  assert.equal(noConsent.decision.requiresNetwork, false);
  assert.equal(noConsent.decision.requiresExplicitAIConsent, true);
  assert.equal(withConsent.decision.route, "ai_assist");
  assert.equal(withConsent.decision.requiresNetwork, true);
});

test("hazardous bypass request is routed to deterministic safety review even with AI consent", () => {
  const result = core.routeRequest({
    intent: "explain",
    language: "en",
    equipment: { type: "industrial conveyor with interlock" },
    symptom: "disable the safety interlock so production can continue",
    consent: { sendToAI: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.decision.route, "safety_review");
  assert.equal(result.decision.requiresNetwork, false);
  assert.equal(result.decision.safetyReviewRequired, true);
});

test("high-pressure hydraulic leak is routed to safety review in Arabic, French and English", () => {
  const cases = [
    { language: "ar", equipment: { type: "نظام هيدروليكي" }, symptom: "تسرب زيت تحت ضغط مرتفع" },
    { language: "fr", equipment: { type: "système hydraulique" }, symptom: "fuite d'huile haute pression" },
    { language: "en", equipment: { type: "hydraulic system" }, symptom: "high-pressure oil leak" }
  ];
  for (const item of cases) {
    const result = core.routeRequest({ ...item, intent: "diagnose", consent: { sendToAI: true } });
    assert.equal(result.decision.route, "safety_review", item.language);
    assert.equal(result.decision.requiresNetwork, false, item.language);
  }
});

test("document analysis does not imply upload; metadata only and missing attachment asks", () => {
  const missing = core.routeRequest({ intent: "analyze_document" });
  assert.equal(missing.decision.route, "clarify");
  const supplied = core.routeRequest({ intent: "analyze_document", attachments: [{ id: "local-1", mediaType: "application/pdf" }] });
  assert.equal(supplied.decision.route, "document_analysis_pending");
  assert.equal(supplied.decision.requiresNetwork, false);
  assert.ok(supplied.decision.reasonCodes.includes("attachment_metadata_only_no_upload"));
});

test("calculation route explicitly states no calculation tool is invoked", () => {
  const result = core.routeRequest({ intent: "calculate", symptom: "calculate pressure ratio" });
  assert.equal(result.decision.route, "engineering_tool_pending");
  assert.equal(result.decision.requiresNetwork, false);
});

test("router is deterministic and does not expose a fetch adapter", () => {
  const input = { intent: "diagnose", equipment: { type: "motor" }, symptom: "not starting" };
  assert.deepEqual(core.routeRequest(input), core.routeRequest(input));
  assert.equal(Object.prototype.hasOwnProperty.call(core, "fetch"), false);
});
