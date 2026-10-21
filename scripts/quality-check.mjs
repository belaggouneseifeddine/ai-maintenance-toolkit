import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const html = readFileSync("index.html", "utf8");
const diagnosticFlowsSource = readFileSync("diagnostic-flows.js", "utf8");
const diagnosticFlows = (() => { const match = diagnosticFlowsSource.match(/window\.MAINTENANCE_DIAGNOSTIC_FLOWS\s*=\s*(\{[\s\S]*?\n\});/); assert.ok(match, "Structured diagnostic flow export must exist"); return JSON.parse(match[1]); })();
const worker = readFileSync("backend/cloudflare-worker.js", "utf8");
const vercelApi = readFileSync("api/chat.js", "utf8");
const safety = readFileSync("SAFETY.md", "utf8");
const knowledge = readFileSync("knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md", "utf8");
const motorCasebook = readFileSync("knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md", "utf8");
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const sw = readFileSync("sw.js", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
const faults = JSON.parse(readFileSync("faults.json", "utf8"));
const diagnosticEngineSource = readFileSync("diagnostic-engine.js", "utf8");
const i18n = readFileSync("i18n.js", "utf8");
const engineWindow = {};\nconst inlineScript = html.match(/<script>\\s*([\\s\\S]*?)<\\/script>/);\nassert.ok(inlineScript, "Inline application script must exist");\nnew vm.Script(inlineScript[1], { filename: "index-inline.js" });\nnew vm.Script(i18n, { filename: "i18n.js" });
vm.runInNewContext(diagnosticEngineSource, { window: engineWindow, console });

const checks = [
  ["Arabic RTL document", () => assert.match(html, /<html lang="ar" dir="rtl">/)],
  ["Structured pump low-flow flow has stable IDs and validated answer guidance", () => {
    const flow = diagnosticFlows.flows["pump|low_flow"];
    assert.equal(diagnosticFlows.schemaVersion, 2);
    assert.equal(flow.id, "pump-low-flow-v1");
    assert.equal(flow.equipmentId, "pump");
    assert.equal(flow.symptomId, "low_flow");
    assert.ok(flow.question.id && flow.question.text);
    assert.equal(flow.answers.length, 3);
    assert.deepEqual(flow.answers.map(answer => answer.id), ["source-normal", "source-low-unstable", "source-no-reliable-reading"]);
    for (const answer of flow.answers) assert.ok(answer.id && answer.label && answer.guidance);
    for (const key of ["motor|not_start", "vfd|trip"]) {
      const structured = diagnosticFlows.flows[key];
      assert.ok(structured, "Missing structured flow: " + key);
      assert.ok(structured.id && structured.question.id && structured.question.text);
      assert.ok(structured.answers.length >= 3);
      assert.equal(new Set(structured.answers.map(answer => answer.id)).size, structured.answers.length, "Answer IDs must be unique in " + key);
      for (const answer of structured.answers) assert.ok(answer.id && answer.label && answer.guidance);
    }
    assert.match(html, /diagnostic-flows\.js/);
    assert.match(html, /MAINTENANCE_DIAGNOSTIC_FLOWS\.flows\["pump\|low_flow"\]/);
  }],
  ["Core navigation panels", () => {
    for (const id of ["diagnose", "ai", "knowledge", "safety", "log"]) {
      assert.match(html, new RegExp('id="' + id + '"'));
    }
  }],
  ["Equipment categories include pump, motor, VFD, PLC and gearbox", () => {
    for (const value of ["pump", "motor", "vfd", "electrical_control", "gearbox"]) {
      assert.ok(html.includes('value="' + value + '"'), "Missing equipment category: " + value);
    }
  }],
  ["User-entered maintenance records are HTML-escaped", () => assert.match(html, /function escapeHtml\s*\(/)],
  ["Maintenance records persist locally", () => assert.match(html, /localStorage\.setItem\(KEY/)],
  ["CSV export exists", () => assert.match(html, /maintenance-log\.csv/)],
  ["CSV export neutralizes spreadsheet formula injection", () => {
    assert.ok(html.includes("function csvCell(value)"));
    assert.ok(html.includes("row.map(csvCell)"));
    assert.match(html, /const safe=/);
  }],
  ["AI requests require explicit user consent before sending maintenance data", () => {
    assert.match(html, /id="aiConsent" type="checkbox" required/);
    assert.match(html, /أوافق على إرسال وصف العطل والقياسات/);
  }],
  ["AI consent is consumed per submission and client request has a timeout", () => {
    assert.match(html, /e\.preventDefault\(\);\$\('aiConsent'\)\.checked=false/);
    assert.match(html, /signal:AbortSignal\.timeout\(25000\)/);
    assert.match(html, /#aiResult\{white-space:pre-wrap/);
  }],
  ["AI endpoint is configurable without a browser-side provider key", () => {
    assert.match(html, /AI_ENDPOINT_KEY/);
    assert.doesNotMatch(html, /sk-[A-Za-z0-9]{20,}/);
    assert.doesNotMatch(html, /AIza[0-9A-Za-z_-]{30,}/);
  }],
  ["AI backend only accepts POST and validates origin", () => {
    assert.match(worker, /request\.method !== "POST"/);
    assert.match(worker, /origin !== allowedOrigin/);
  }],
  ["AI credentials come from server environment secrets", () => assert.match(worker, /env\.AI_API_KEY/)],
  ["AI backend validates and bounds input lengths", () => {
    assert.match(worker, /machine\.length > 120/);
    assert.match(worker, /observations\.length > 3000/);
  }],
  ["AI backend rejects non-JSON and caps request body bytes", () => {
    assert.match(worker, /Content-Type must be application\/json/);
    assert.match(worker, /MAX_BODY_BYTES = 8_192/);
    assert.match(worker, /new TextEncoder\(\)\.encode\(rawBody\)\.byteLength/);
  }],
  ["AI upstream calls have a timeout", () => {
    assert.match(worker, /UPSTREAM_TIMEOUT_MS = 20_000/);
    assert.match(worker, /AbortSignal\.timeout\(UPSTREAM_TIMEOUT_MS\)/);
  }],
  ["In-memory rate limiting is explicitly documented as best-effort", () => {
    assert.match(worker, /Best-effort per-isolate guard only/);
    assert.match(worker, /MAX_TRACKED_IPS = 5_000/);
  }],
  ["Vercel AI endpoint keeps provider credentials server-side", () => {
    assert.match(vercelApi, /process\.env\.AI_API_KEY/);
    assert.doesNotMatch(vercelApi, /AIza[0-9A-Za-z_-]{30,}/);
    assert.doesNotMatch(vercelApi, /sk-[A-Za-z0-9]{20,}/);
  }],
  ["Vercel AI endpoint validates method, origin, content type, and input", () => {
    assert.match(vercelApi, /req\.method !== "POST"/);
    assert.match(vercelApi, /origin !== allowedOrigin/);
    assert.match(vercelApi, /Content-Type must be application\/json/);
    assert.match(vercelApi, /observations\.length > 3000/);
  }],
  ["Vercel AI endpoint uses timeout and bounded output", () => {
    assert.match(vercelApi, /AbortSignal\.timeout\(20_000\)/);
    assert.match(vercelApi, /answer\.slice\(0, 12000\)/);
  }],
  ["Mobile UI includes keyboard focus and reduced-motion support", () => {
    assert.match(html, /:focus-visible/);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /Mobile-first visual polish/);
  }],
  ["Knowledge base includes pump, motor, compressor, hydraulic, valve, instrumentation, conveyor, bearing, PLC and thermal coverage", () => {
    for (const term of [/Centrifugal and other process pumps/i, /Electric motors and driven equipment/i, /Compressors and compressed-air networks/i, /Hydraulic/i, /valve/i, /instrumentation/i, /conveyor/i, /Bearings and lubrication systems/i, /PLC and HMI/i, /Thermal systems/i]) {
      assert.match(knowledge, term);
    }
  }],
  ["Knowledge base includes explicit stop-work triggers, stored-energy isolation, and hydraulic injection warning", () => {
    assert.match(knowledge, /Stop-work triggers/i);
    assert.match(knowledge, /lockout\/tagout/i);
    assert.match(knowledge, /Hydraulic injection warning/i);
    assert.match(knowledge, /Never use a hand to search for a hydraulic leak/i);
  }],
  ["Knowledge base links authoritative source documents and prohibits invented limits", () => {
    assert.match(knowledge, /energy\.gov/);
    assert.match(knowledge, /library\.e\.abb\.com/);
    assert.match(knowledge, /Do not fill unknown values with guesses/i);
    assert.match(knowledge, /Do not use these notes to choose setpoints/i);
  }],
  ["Motor/VFD casebook warns against repeated resets and bypassing protection", () => {
    assert.match(motorCasebook, /Never bridge an overload/i);
    assert.match(motorCasebook, /repeatedly reset/i);
    assert.match(motorCasebook, /DC bus can remain charged/i);
  }],
  ["Follow-up answers generate evidence-specific next steps rather than being only logged", () => {
    assert.match(html, /function followupGuidance\(machine,symptom,answer\)/);
    assert.match(html, /let branchSteps=followupGuidance\(machine,symptom,followup\)/);
    assert.match(html, /خطوة تالية بحسب إجابتك/);
  }],
  ["High-pressure hydraulic leak answer always directs away from contact and to escalation", () => {
    assert.match(html, /hydraulic\|leak/);
    assert.match(html, /خطر حقن سائل عالي الضغط لا يمكن استبعاده/);
    assert.match(html, /لا تستخدم اليد للبحث عن التسرب/);
  }],
  ["High-pressure thermal branch forbids restart and safety-valve adjustment", () => {
    assert.match(html, /thermal\|high_pressure/);
    assert.match(html, /لا تعِد التشغيل ولا تعدّل أو تعزل صمام أمان/);
  }],
  ["Urgent and high report priorities display conservative escalation guidance", () => {
    assert.match(html, /priority==='urgent'\?'<div class="notice" role="alert">/);
    assert.match(html, /لا تبدأ أو تواصل العمل إذا كان الوضع غير آمن/);
    assert.match(html, /لا تتجاوز الحواجز أو interlocks أو أجهزة الحماية/);
    assert.match(html, /نسّق مع مسؤول الصيانة والإنتاج قبل الاختبار/);
  }],
  ["Diagnostic report captures asset context, priority, provenance and printable output", () => {
    for (const id of ["assetId", "priority", "technician", "manualRef"]) assert.match(html, new RegExp('id="' + id + '"'));
    assert.match(html, /Maintenance Inspection Report/);
    assert.match(html, /window\.print\(\)/);
    assert.match(html, /print-only/);
    assert.match(html, /escapeHtml\(assetId\|\|'غير محدد'\)/);
    assert.match(html, /مرجع الدليل الذي أدخله المستخدم/);
    assert.match(html, /لا يمثل هذا التقرير اعتمادًا هندسيًا أو تصريح عمل/);
  }],
  ["Diagnostic branch output escapes generated guidance and retains optional answers", () => {
    assert.match(html, /branchSteps\.map\(s=>'<li>'\+escapeHtml\(s\)/);
    assert.match(html, /إجابة السؤال الموجّه/);
  }],
  ["AI instructions prohibit bypassing safety systems", () => {
    assert.match(worker, /Never recommend bypassing guards, interlocks, alarms, or protective devices/);
    assert.match(safety, /lockout\/tagout/i);
  }],
  ["PWA manifest has Arabic RTL metadata and standalone display", () => {
    assert.equal(manifest.lang, "ar");
    assert.equal(manifest.dir, "rtl");
    assert.equal(manifest.display, "standalone");
    assert.ok(manifest.icons.some(icon => icon.src === "./icon.svg"), "PWA icon must be declared");
  }],
  ["Service worker caches the app shell and icon with a bumped cache version", () => {
    assert.match(sw, /APP_SHELL/);
    assert.match(sw, /\.\/icon\.svg/);
    assert.match(sw, /maintenance-ai-toolkit-v12/);
  }]
,
  ["Pump fault library has the five requested multilingual fault entries", () => {
    assert.equal(faults.faults.length, 5);
    assert.deepEqual(faults.faults.map(fault => fault.id), [
      "pump-cavitation", "pump-loss-of-prime", "pump-abnormal-vibration",
      "pump-mechanical-seal-leak", "pump-check-valve-failure"
    ]);
    for (const fault of faults.faults) {
      assert.equal(fault.equipmentType, "pump");
      for (const language of ["ar", "fr", "en"]) {
        assert.ok(fault.title[language], fault.id + " missing title " + language);
        assert.ok(fault.keywords[language].length >= 3, fault.id + " missing keywords " + language);
        assert.ok(fault.safeChecks.filter(item => item[language]).length >= 3, fault.id + " missing safe checks " + language);
        assert.ok(fault.escalation[language], fault.id + " missing escalation " + language);
      }
      assert.ok(fault.causes.length >= 3 && fault.causes.length <= 5);
      assert.ok(fault.safeChecks.length >= 3 && fault.safeChecks.length <= 5);
      for (const cause of fault.causes) assert.ok(cause.id && cause.keywords.length && cause.label.ar && cause.label.fr && cause.label.en);
    }
  }],
  ["Rule-based engine ranks a supported cavitation case and explains ranking", () => {
    const result = engineWindow.diagnose({ equipmentType: "pump", symptom: "noise", observations: "صوت حصى مع تكهف", language: "ar" }, faults);
    assert.equal(result.matched, true);
    assert.equal(result.results[0].id, "pump-cavitation");
    assert.ok(result.results[0].rankingReason.includes("تطابق"));
    assert.ok(result.results[0].causes[0].reason);
    assert.ok(result.results[0].safeChecks.length >= 3);
    assert.ok(result.results[0].escalation);
  }],
  ["Rule-based engine rejects weak evidence instead of guessing", () => {
    const result = engineWindow.diagnose({ equipmentType: "other", symptom: "other", observations: "xyz unknown", language: "en" }, faults);
    assert.equal(result.matched, false);
    assert.equal(result.message, "No sufficient match; escalate to the supervisor");
    assert.equal(result.results.length, 0);
  }],
  ["Rule-based engine normalizes French accents and ignores case", () => {
    const result = engineWindow.diagnose({ equipmentType: "pump", symptom: "leak", observations: "FUITE DE GARNITURE MÉCANIQUE", language: "fr" }, faults);
    assert.equal(result.matched, true);
    assert.equal(result.results[0].id, "pump-mechanical-seal-leak");
  }],
  ["Safety gate, auto-draft, three-language switch and record filters are wired", () => {
    assert.match(html, /safetyChecks\.some\(box=>!box\.checked\)/);
    assert.match(html, /id="safetyGateNotice"/);
    assert.match(html, /maintenance-ai-toolkit-draft-v1/);
    assert.match(html, /localStorage\.setItem\(DRAFT_KEY/);
    assert.match(html, /id="languageSwitcher"/);
    assert.match(html, /id="recordSearch"/);
    assert.match(html, /id="recordStatusFilter"/);
    assert.match(html, /id="recordDateFilter"/);
    assert.match(i18n, /fr:/);
    assert.match(i18n, /en:/);
    assert.match(i18n, /document\.documentElement\.dir=current==="ar"\?"rtl":"ltr"/);
  }],
  ["Existing local-storage key and CSV export remain unchanged", () => {
    assert.match(html, /const KEY='maintenance-ai-toolkit-records-v1'/);
    assert.match(html, /maintenance-log\.csv/);
    assert.match(html, /function csvCell\(value\)/);
  }],
  ["PWA caches all new offline dependencies and bumps its cache", () => {
    assert.match(sw, /maintenance-ai-toolkit-v12/);
    for (const asset of ["diagnostic-engine.js", "faults.json", "i18n.js"]) assert.ok(sw.includes(asset), "Missing offline cache asset " + asset);
    assert.match(manifest.icons[0].src, /icon\.svg/);
  }]
];

let failed = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log("PASS " + name);
  } catch (error) {
    failed++;
    console.error("FAIL " + name + ": " + error.message);
  }
}
console.log("\n" + (checks.length - failed) + "/" + checks.length + " static quality checks passed.");
if (failed) process.exitCode = 1;
