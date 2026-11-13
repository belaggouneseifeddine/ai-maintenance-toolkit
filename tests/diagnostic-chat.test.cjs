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
  assert.match(source, /if \(!consent \|\| !consent.checked\)/);
  assert.match(source, /MaintenanceAgentUI\.runCloudAI/);
  assert.match(source, /forDiagnostics/);
  assert.match(source, /openSourcePage/);
  const agentUI = fs.readFileSync(require.resolve("../agent-ui.js"), "utf8");
  assert.match(agentUI, /diagnosticFlowId/);
  assert.match(agentUI, /diagnosticEvidence/);
  assert.match(source, /لا تنفّذ اختبارًا/);
  assert.doesNotMatch(source, /fetch\s*\(/, "chat UI must not upload conversation data");
});

test("chat is loaded after the local session UI and included in offline and deployment assets", () => {
  const fs = require("node:fs");
  const root = require("node:path").resolve(__dirname, "..");
  const html = fs.readFileSync(require("node:path").join(root, "index.html"), "utf8");
  const sw = fs.readFileSync(require("node:path").join(root, "sw.js"), "utf8");
  const pages = fs.readFileSync(require("node:path").join(root, ".github/workflows/deploy-pages.yml"), "utf8");
  const cloudflare = fs.readFileSync(require("node:path").join(root, ".github/workflows/deploy-cloudflare-pages.yml"), "utf8");
  assert.ok(html.indexOf('diagnostic-session-ui.js') < html.indexOf('diagnostic-chat.js'));
  assert.ok(sw.includes('"./diagnostic-chat.js"'));
  assert.ok(pages.includes("diagnostic-chat.js"));
  assert.ok(cloudflare.includes("diagnostic-chat.js"));
});
