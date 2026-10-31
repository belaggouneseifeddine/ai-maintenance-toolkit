const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const root = require("node:path").join(__dirname, "..");
const ui = fs.readFileSync(require("node:path").join(root, "diagnostic-session-ui.js"), "utf8");
const html = fs.readFileSync(require("node:path").join(root, "index.html"), "utf8");

test("guided diagnostic session exposes report save only after evidence review", () => {
  assert.match(ui, /const completed = session\.status === "evidence_review"/);
  assert.match(ui, /saveButton\.hidden = !completed/);
  assert.match(ui, /save\(getPayload\(\)\)/);
});

test("guided report preserves answers, evidence, hypotheses, and suggested checks", () => {
  for (const field of ["diagnosticFlowId", "diagnosticAnswers", "diagnosticEvidence", "diagnosticHypotheses"]) {
    assert.ok(html.includes(field), "missing report field " + field);
  }
  assert.match(html, /guidedSession:payload/);
  assert.match(html, /action:lines\.join\('\\n'\)/);
  assert.match(html, /saveRecords\(records\)/);
});

test("guided report is saved through the existing local maintenance log and not a network request", () => {
  const start = html.indexOf("window.saveGuidedDiagnosticReport=function(payload)");
  const end = html.indexOf("$('saveDraft').addEventListener", start);
  assert.ok(start >= 0 && end > start, "report saver must be defined before draft controls");
  const saver = html.slice(start, end);
  assert.match(saver, /getRecords\(\)/);
  assert.match(saver, /renderRecords\(\)/);
  assert.doesNotMatch(saver, /fetch\s*\(|XMLHttpRequest|WebSocket/);
});

test("updated diagnostic session UI parses as JavaScript", () => {
  assert.doesNotThrow(() => new vm.Script(ui));
});
