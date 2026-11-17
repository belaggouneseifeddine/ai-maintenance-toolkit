const test = require("node:test");
const assert = require("node:assert/strict");
require("../diagnostic-session.js");
const UI = require("../diagnostic-session-ui.js");

test("guided diagnostic UI restores only a valid ordered answer sequence", () => {
  const fresh = global.MaintenanceDiagnosticSession.createSession({
    equipment: "pump", symptom: "low_flow", language: "ar"
  });
  assert.equal(fresh.ok, true);
  const firstOption = fresh.nextQuestion.options[0];
  const restored = UI.restore({
    diagnosticFlowId: "pump|low_flow",
    diagnosticAnswers: [{ questionId: fresh.nextQuestion.id, answerId: firstOption.id }]
  });
  assert.equal(restored.ok, true);
  assert.equal(restored.session.evidence.length, 1);
  assert.equal(restored.session.evidence[0].answerId, firstOption.id);
});

test("guided diagnostic UI rejects mismatched or out-of-order saved answers", () => {
  const result = UI.restore({
    diagnosticFlowId: "pump|low_flow",
    diagnosticAnswers: [{ questionId: "not-the-current-question", answerId: "unknown" }]
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "answer_sequence_mismatch");
  const invalid = UI.restore({
    diagnosticFlowId: "pump|low_flow",
    diagnosticAnswers: Array.from({ length: 41 }, () => ({ questionId: "q", answerId: "a" }))
  });
  assert.equal(invalid.code, "invalid_snapshot");
});
