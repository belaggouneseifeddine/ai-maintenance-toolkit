const test = require("node:test");
const assert = require("node:assert/strict");
const ui = require("../agent-ui.js");

test("local UI explicitly states that data was not sent", () => {
  const result = ui.formatResult({
    ok: true,
    status: "preliminary_assessment",
    route: "local_diagnostic",
    data: { diagnosis: { matched: false, message: "No sufficient match", reason: "Need observations", results: [] } }
  }, "en");
  assert.match(result, /no data was sent to an external server/i);
  assert.match(result, /no sufficient match/i);
});

test("safety escalation takes precedence and preserves LOTO warning", () => {
  const result = ui.formatResult({
    ok: true,
    status: "escalation_required",
    route: "safety_review",
    data: { nextAction: "Follow isolation and LOTO." }
  }, "en");
  assert.match(result, /Stop and escalate/i);
  assert.match(result, /LOTO/i);
});

test("local match scores are never presented as probabilities or confirmed causes", () => {
  const result = ui.formatResult({
    ok: true,
    status: "preliminary_assessment",
    route: "local_diagnostic",
    data: { diagnosis: { matched: true, results: [{ title: { en: "Possible suction issue" }, confidenceLabel: "Low", rankingReason: "Matching symptom", causes: [], safeChecks: [], escalation: "" }] } }
  }, "en");
  assert.match(result, /not a probability/i);
  assert.match(result, /not confirmed/i);
});

test("failed or invalid agent results render a bounded generic message", () => {
  const result = ui.formatResult({ ok: false, errors: [{ code: "invalid_request" }] }, "ar");
  assert.match(result, /تعذّر إجراء التقييم المحلي/);
  assert.doesNotMatch(result, /token|secret|https?:/i);
});
