const test = require("node:test");
const assert = require("node:assert/strict");
const UI = require("../diagnostic-session-ui.js");

const question = {
  id: "source_status",
  options: [
    { id: "source-low", label: "منخفض" },
    { id: "source-unstable", label: "غير مستقر" },
    { id: "source-normal", label: "طبيعي حسب خط الأساس" },
    { id: "unknown", label: "لا توجد قراءة موثوقة" }
  ]
};

test("conversational answer mapping accepts exact Arabic and English evidence labels", () => {
  assert.equal(UI.matchAnswerOption(question, "منخفض"), "source-low");
  assert.equal(UI.matchAnswerOption(question, "low"), "source-low");
  assert.equal(UI.matchAnswerOption(question, "غير مستقر"), "source-unstable");
});

test("conversational answer mapping recognizes unknown without manufacturing evidence", () => {
  assert.equal(UI.matchAnswerOption(question, "لا توجد قراءة موثوقة"), "unknown");
  assert.equal(UI.matchAnswerOption(question, "not sure"), "unknown");
});

test("ambiguous free text is not forced into a diagnostic answer", () => {
  assert.equal(UI.matchAnswerOption(question, "منخفض وغير مستقر"), null);
  assert.equal(UI.matchAnswerOption(question, "المضخة تصدر صوتًا غير طبيعي"), null);
});

test("conversational diagnostic layer uses local session actions and approved PDF retrieval", () => {
  const fs = require("node:fs");
  const source = fs.readFileSync(require.resolve("../diagnostic-chat.js"), "utf8");
  assert.match(source, /MaintenanceDiagnosticSessionUI\.answerText/);
  assert.match(source, /MaintenanceDocumentRetrieval/);
  assert.match(source, /forDiagnostics/);
  assert.match(source, /openSourcePage/);
  assert.match(source, /لا تنفّذ اختبارًا/);
  assert.doesNotMatch(source, /fetch\s*\(/, "chat UI must not upload conversation data");
});
