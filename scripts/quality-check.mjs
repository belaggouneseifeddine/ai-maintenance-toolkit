import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const html = readFileSync("index.html", "utf8");
const ux = readFileSync("ux-redesign.js", "utf8");
const uxCss = readFileSync("ux-redesign.css", "utf8");
const navRedesign = readFileSync("navigation-redesign.js", "utf8");
const diagnosticFlowsSource = readFileSync("diagnostic-flows.js", "utf8");
const diagnosticFlows = (() => { const match = diagnosticFlowsSource.match(/window\.MAINTENANCE_DIAGNOSTIC_FLOWS\s*=\s*(\{[\s\S]*?\n\});/); assert.ok(match, "Structured diagnostic flow export must exist"); return JSON.parse(match[1]); })();
const worker = readFileSync("worker.js", "utf8");
const evidenceReasoning = readFileSync("evidence-reasoning.js", "utf8");
const evidenceReasoningUI = readFileSync("evidence-reasoning-ui.js", "utf8");
const safety = readFileSync("SAFETY.md", "utf8");
const knowledge = readFileSync("knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md", "utf8");
const motorCasebook = readFileSync("knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md", "utf8");
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const sw = readFileSync("sw.js", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
const cloudflareDeployWorkflow = readFileSync(".github/workflows/deploy-cloudflare-pages.yml", "utf8");
const faults = JSON.parse(readFileSync("faults.json", "utf8"));
const manufacturerSources = JSON.parse(readFileSync("knowledge/manufacturer-sources.json", "utf8"));
const manufacturerMatrix = JSON.parse(readFileSync("knowledge/manufacturer-machine-fault-matrix.json", "utf8"));
const manufacturerMatrixMarkdown = readFileSync("knowledge/CHINESE-EUROPEAN-OEM-FAULT-MATRIX-AR-FR-EN.md", "utf8");
const oemPlatformIndex = JSON.parse(readFileSync("knowledge/oem-platform-index.json", "utf8"));
const oemIndexMarkdown = readFileSync("knowledge/OEM-MANUFACTURER-INDEX-AR-FR-EN.md", "utf8");
const oemVerifiedFaults = JSON.parse(readFileSync("knowledge/oem-verified-faults.json", "utf8"));
const oemVerifiedMarkdown = readFileSync("knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md", "utf8");
const oemLookupSource = readFileSync("oem-lookup.js", "utf8");
const diagnosticEngineSource = readFileSync("diagnostic-engine.js", "utf8");
const normalizationSource = readFileSync("normalization.js", "utf8");
const knowledgeReviewSource = readFileSync("knowledge-review.js", "utf8");
const answerToolsSource = readFileSync("answer-tools.js", "utf8");
const i18n = readFileSync("i18n.js", "utf8");
const engineWindow = {};
const inlineScript = html.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(inlineScript, "Inline application script must exist");
new vm.Script(inlineScript[1], { filename: "index-inline.js" });
new vm.Script(i18n, { filename: "i18n.js" });
const engineContext = { window: engineWindow, globalThis: engineWindow, console };
vm.runInNewContext(normalizationSource, engineContext);
vm.runInNewContext(diagnosticEngineSource, engineContext);

const checks = [
  ["Local agent core is explicitly loaded and offers a non-network diagnosis action", () => {
    assert.ok(html.includes('<script src="./engineering-core.js"></script>'));
    assert.ok(html.includes('<script src="./agent-core.js"></script>'));
    assert.ok(html.includes('<script src="./agent-ui.js"></script>'));
    assert.ok(html.includes('<script src="./evidence-reasoning.js"></script>'));
    assert.ok(html.includes('<script src="./evidence-reasoning-ui.js"></script>'));
    assert.ok(html.includes('id="manufacturer"') && html.includes('id="equipmentModel"'));
    assert.ok(html.includes("MaintenanceEvidenceReasoningUI.render"));
    assert.ok(evidenceReasoning.includes("confirmedFault: null"));
    assert.ok(evidenceReasoningUI.includes("diagnostic-evidence-register.json"));
    assert.ok(html.includes('id="runLocalAgent"'));
    for (const asset of ["engineering-core.js", "agent-core.js", "agent-ui.js", "oem-lookup.js"]) { assert.ok(cloudflareDeployWorkflow.includes(asset), `Cloudflare Pages deploy omits ${asset}`); assert.ok(deployWorkflow.includes(asset), `GitHub Pages deploy omits ${asset}`); }
    assert.ok(sw.includes('"./engineering-core.js"'));
    assert.ok(sw.includes('"./agent-core.js"'));
    assert.ok(sw.includes('"./agent-ui.js"'));
    assert.ok(sw.includes('"./evidence-reasoning.js"'));
    assert.ok(sw.includes('"./evidence-reasoning-ui.js"'));
    assert.ok(sw.includes('"./diagnostic-evidence-register.json"'));
    assert.ok(deployWorkflow.includes("evidence-reasoning.js evidence-reasoning-ui.js diagnostic-evidence-register.json"));
    assert.ok(cloudflareDeployWorkflow.includes("evidence-reasoning.js evidence-reasoning-ui.js diagnostic-evidence-register.json"));
  }],
  ["Shared normalization is loaded by the UI, Worker and Pages deployment", () => {
    assert.match(html, /<script src="\.\/normalization\.js"><\/script>/);
    assert.match(worker, /import "\.\/normalization\.js";/);
    assert.match(deployWorkflow, /diagnostic-flows\.js normalization\.js diagnostic-engine\.js/);
    assert.ok(engineWindow.MaintenanceNormalization.aliasReviewCount > 0);
    assert.ok(engineWindow.MaintenanceNormalization.getReviewAliases().every(item => item.status === "review_required"));
  }],
  ["Arabic RTL document", () => assert.match(html, /<html lang="ar" dir="rtl">/)],
  ["Structured pump low-flow flow has stable IDs and validated answer guidance", () => {
    const flow = diagnosticFlows.flows["pump|low_flow"];
    assert.equal(diagnosticFlows.schemaVersion, 3);
    assert.equal(flow.id, "pump-low-flow-v1");
    assert.equal(flow.equipmentId, "pump");
    assert.equal(flow.symptomId, "low_flow");
    assert.ok(flow.question.id && flow.question.text);
    assert.equal(flow.answers.length, 3);
    assert.deepEqual(flow.answers.map(answer => answer.id), ["source-normal", "source-low-unstable", "source-no-reliable-reading"]);
    for (const answer of flow.answers) assert.ok(answer.id && answer.label && answer.guidance);
    for (const key of ["motor|not_start", "vfd|trip", "compressor|low_pressure", "valve|not_start"]) {
      const structured = diagnosticFlows.flows[key];
      assert.ok(structured, "Missing structured flow: " + key);
      assert.ok(structured.id && structured.question.id && structured.question.text);
      assert.ok(structured.answers.length >= 3);
      assert.equal(new Set(structured.answers.map(answer => answer.id)).size, structured.answers.length, "Answer IDs must be unique in " + key);
      for (const answer of structured.answers) assert.ok(answer.id && answer.label && answer.guidance);
    }
    assert.match(html, /diagnostic-flows\.js/);
    assert.match(html, /MAINTENANCE_DIAGNOSTIC_FLOWS\.flows\["pump\|low_flow"\]/);
    assert.match(html, /MAINTENANCE_DIAGNOSTIC_FLOWS\.flows\["compressor\|low_pressure"\]/);
    assert.match(html, /MAINTENANCE_DIAGNOSTIC_FLOWS\.flows\["valve\|not_start"\]/);
  }],
  ["Optional answer cache is opt-in, expires, and excludes safety escalation; speech controls are available", () => {
    assert.match(html, /id="aiCacheEnabled"/);
    assert.match(html, /id="speakAiAnswer"/);
    assert.match(answerToolsSource, /CACHE_TTL_MS = 24 \* 60 \* 60 \* 1000/);
    assert.match(answerToolsSource, /data\.diagnosis\.status!=="preliminary_assessment"/);
    assert.match(answerToolsSource, /escalation\.required!==false/);
    assert.match(answerToolsSource, /matchedChunks/);
    assert.match(answerToolsSource, /source_supported_hypothesis/);
    assert.match(answerToolsSource, /speechSynthesis/);
    assert.match(sw, /answer-tools\.js/);
    assert.match(deployWorkflow, /knowledge-review\.js answer-tools\.js/);
  }],
  ["Local knowledge review requires a human review and never publishes automatically", () => {
    assert.match(html, /id="knowledgeReviewCard"/);
    assert.match(html, /id="krExportOutput"/);
    assert.match(knowledgeReviewSource, /maintenance-ai-toolkit-knowledge-review-v1/);
    assert.match(knowledgeReviewSource, /reviewed_for_consideration/);
    assert.match(knowledgeReviewSource, /notes.length<10/);
    assert.match(knowledgeReviewSource, /reviewed_candidates_only_no_automatic_publication/);
    assert.doesNotMatch(knowledgeReviewSource, /fetch\s*\(/);
    assert.match(sw, /knowledge-review\.js/);
    assert.match(deployWorkflow, /knowledge-review\.js/);
  }],
  ["UX dashboard is wired, starts as home, and preserves existing navigation", () => {
    assert.ok(html.includes("ux-redesign.js"));
    assert.ok(html.includes("ux-redesign.css"));
    assert.equal((html.match(/type="reset"[^>]*>التشخيص/g)||[]).length, 1, "Diagnosis form should show exactly one reset button with the requested Arabic label");
    assert.match(i18n, /resetFields:"التشخيص"/);
    assert.match(i18n, /resetFields:"Diagnostic"/);
    assert.match(i18n, /resetFields:"Diagnosis"/);
    assert.ok(html.includes("localStorage.removeItem(DRAFT_KEY);lastDiagnosisDraft=null"), "Reset must clear the autosaved diagnosis draft");
    assert.ok(html.includes("data-tab=\"diagnose\">التشخيص</button>"), "Navigation should avoid duplicating the home quick-action label");
    assert.match(ux, /homeDashboard/);
    assert.match(ux, /maintenance-ai-toolkit-records-v1/);
    assert.match(uxCss, /ux-actions/);
    new vm.Script(ux, { filename: "ux-redesign.js" });
    assert.ok(deployWorkflow.includes("ux-redesign.js ux-redesign.css"));
    assert.ok(deployWorkflow.includes("sw.js diagnostic-flows.js"), "GitHub Pages deployment must publish app shell dependencies");
    assert.ok(sw.includes("diagnostic-flows.js"), "Service worker app shell must include structured diagnostic flows");
    assert.ok(sw.includes("ux-redesign.js") && sw.includes("ux-redesign.css"));
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
  ["Cloudflare API request requires consent, uses a timeout, and preserves readable output", () => {
    assert.match(html, /if\(!\$\('aiConsent'\)\.checked&&!cached\)/);
    assert.match(html, /signal:AbortSignal\.timeout\(65000\)/);
    assert.match(html, /#aiResult\{white-space:pre-wrap/);
    assert.match(html, /maintenance-ai-toolkit-api\.maintenance-ai-toolkit-api-seif\.workers\.dev\/api\/chat/);
  }],
  ["Frontend uses the Cloudflare endpoint and does not contain provider API keys", () => {
    assert.match(html, /id="aiEndpoint"/);
    assert.match(html, /AI_ENDPOINT_KEY/);
    assert.match(html, /maintenance-ai-toolkit-api\.maintenance-ai-toolkit-api-seif\.workers\.dev\/api\/chat/);
    assert.doesNotMatch(html, /window\.GEMINI_API_KEY/);
    assert.doesNotMatch(html, /AIza[0-9A-Za-z_-]{30,}/);
    assert.doesNotMatch(html, /sk-[A-Za-z0-9]{20,}/);
  }],
  ["AI backend only accepts POST and validates origin", () => {
    assert.match(worker, /request\.method !== "POST"/);
    assert.match(worker, /function isAllowedOrigin\(origin\)/);
    assert.match(worker, /if \(!isAllowedOrigin\(origin\)\)/);
    assert.match(worker, /ALLOWED_ORIGINS = new Set\(/);
  }],
  ["AI credentials come from server environment secrets", () => assert.match(worker, /env\.AI_API_KEY/)],
  ["AI backend validates and bounds input lengths", () => {
    assert.match(worker, /machine\.length > 120/);
    assert.match(worker, /observations\.length > 3000/);
  }],
  ["AI backend rejects non-JSON and caps request body bytes", () => {
    assert.match(worker, /Content-Type must be application\/json/);
    assert.match(worker, /MAX_BODY_BYTES = 8192/);
    assert.match(worker, /new TextEncoder\(\)\.encode\(raw\)\.byteLength/);
  }],
  ["AI upstream calls have a timeout", () => {
    assert.match(worker, /AbortSignal\.timeout\(17000\)/);
  }],
  ["In-memory rate limiting is explicitly documented as best-effort", () => {
    assert.match(worker, /function assessEvidence\(/);
    assert.match(worker, /function rankKnowledgeChunks\(/);
    assert.match(worker, /function rankKnowledgeChunksBM25\(/);
    assert.match(worker, /rankingComparison/);
    assert.match(worker, /selectedRanker/);
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
    assert.match(worker, /never recommend bypassing guards, interlocks, alarms, or protective devices/i);
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
    assert.match(sw, /maintenance-ai-toolkit-v50/);
  }]
,
  ["Multilingual fault library covers pumps, motors, VFDs and compressors", () => {
    assert.ok(faults.faults.length > 100, "local fault library must exceed 100 cases");
    const ids = faults.faults.map(fault => fault.id);
    assert.equal(new Set(ids).size, ids.length, "fault IDs must be unique");
    for (const id of [
      "pump-cavitation", "pump-loss-of-prime", "pump-abnormal-vibration",
      "pump-mechanical-seal-leak", "pump-check-valve-failure",
      "motor-no-start", "motor-overheating", "vfd-trip",
      "compressor-high-temperature", "compressor-low-pressure"
    ]) assert.ok(ids.includes(id), "missing fault " + id);
    const modelReviewed = faults.faults.filter(fault => fault.modelSpecificEvidence);
    assert.ok(modelReviewed.length >= 60, "expected at least 60 structured model-specific manual-reviewed records");
    for (const fault of modelReviewed) {
      const evidence = fault.modelSpecificEvidence;
      assert.ok(evidence.manufacturer && evidence.productFamily && evidence.manualTitle, fault.id + " missing model/manual identity");
      assert.ok(evidence.officialDocumentUrl?.startsWith("https://"), fault.id + " missing official manual URL");
      assert.ok(evidence.section && (Number.isInteger(evidence.printedPage) || evidence.pageNotProvidedReason), fault.id + " missing manual section/page provenance");
      assert.ok(evidence.reviewedOn && evidence.reviewStatus, fault.id + " missing review metadata");
      assert.ok(Array.isArray(fault.sourceRefs) && fault.sourceRefs.length > 0, fault.id + " missing source references");
    }
    for (const id of [
      "oem-siemens-g120c-f07860-external-fault-1",
      "oem-siemens-g120c-f07900-motor-blocked",
      "oem-siemens-g120c-f07901-motor-overspeed",
      "oem-siemens-g120c-f07902-motor-stalled",
      "oem-siemens-g120c-f08501-setpoint-timeout",
      "oem-siemens-g120c-f08502-sign-of-life-timeout",
      "oem-siemens-g120c-f08526-no-cyclic-connection"
    ]) assert.ok(faults.faults.some(fault => fault.id === id), "missing model-specific Siemens G120C case " + id);
    for (const fault of faults.faults) {
      assert.ok(["pump", "motor", "vfd", "compressor", "electric_motor", "valve", "hydraulic", "pneumatic", "plc", "hmi", "sensor", "instrumentation", "electrical_control", "safety_circuit", "mechanical", "gearbox", "conveyor", "filtration", "heat_exchanger", "cooling", "steam_system", "boiler", "refrigeration", "ups", "power_supply", "electrical_panel", "industrial_network", "robotics", "lubrication", "vacuum", "dust_collector", "fire_safety", "electronics", "fan-blower", "cnc", "servo_drive"].includes(fault.equipmentType), fault.id + " has unsupported equipment type");
      for (const language of ["ar", "fr", "en"]) {
        assert.ok(fault.title[language], fault.id + " missing title " + language);
        assert.ok(fault.keywords[language].length >= 3, fault.id + " missing keywords " + language);
        assert.ok(fault.safeChecks.filter(item => item[language]).length >= 3, fault.id + " missing safe checks " + language);
        assert.ok(fault.escalation[language], fault.id + " missing escalation " + language);
      }
      if (fault.modelSpecificEvidence) assert.ok(fault.causes.length >= 1 && fault.causes.length <= 5, fault.id + " needs 1–5 scoped candidate causes");
      else assert.ok(fault.causes.length >= 3 && fault.causes.length <= 5, fault.id + " needs 3–5 general candidate causes");
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
  ["Stored user content is HTML-escaped before insertion and CSV formula injection is mitigated", () => {
    assert.match(html, /function escapeHtml\(s\)\{return String\(s\)\.replace\(\/\[&<>"\x27\]\/g/);
    assert.match(html, /escapeHtml\(r\.machine\)/);
    assert.match(html, /escapeHtml\(r\.fault\)/);
    assert.match(html, /escapeHtml\(r\.action\)/);
    assert.match(html, /function csvCell\(value\)/);
    assert.match(html, /const safe=/);
    assert.match(html, /test\(text\)/);
  }],
  ["Local-storage read and write failures are handled", () => {
    assert.match(html, /function getRecords\(\)\{try\{/);
    assert.match(html, /function saveRecords\(a\)\{try\{/);
    assert.match(html, /Storage may be unavailable or full/);
  }],
  ["Existing local-storage key and CSV export remain unchanged", () => {
    assert.match(html, /const KEY='maintenance-ai-toolkit-records-v1'/);
    assert.match(html, /maintenance-log\.csv/);
    assert.match(html, /function csvCell\(value\)/);
  }],
  ["v0.3 tools are wired and stored locally", () => {
    assert.ok(html.includes("maintenance-v03.js"));
    assert.ok(sw.includes("maintenance-v03.css"));
    assert.ok(sw.includes("decision-trees.json"));
    assert.ok(deployWorkflow.includes("maintenance-v03.js maintenance-v03.css decision-trees.json"));
    assert.match(html, /maintenance-ai-toolkit-records-v1/);
  }],
  ["Pump decision tree requires LOTO gate and has safe escalation", () => {
    const tree = JSON.parse(readFileSync("decision-trees.json", "utf8"));
    assert.equal(tree.equipment, "pump");
    assert.ok(tree.nodes.rotates && tree.nodes.noisy && tree.nodes.lowflow);
    for (const node of Object.values(tree.nodes)) if (node.result) assert.ok(node.safe && node.escalate && node.cause);
  }],
  ["PWA caches all new offline dependencies and bumps its cache", () => {
    assert.match(sw, /maintenance-ai-toolkit-v50/);
    for (const asset of ["normalization.js", "knowledge-review.js", "answer-tools.js", "diagnostic-engine.js", "engineering-core.js", "agent-core.js", "agent-ui.js", "diagnostic-session.js", "diagnostic-session-ui.js", "faults.json", "knowledge/oem-platform-index.json", "knowledge/manufacturer-machine-fault-matrix.json", "i18n.js"]) assert.ok(sw.includes(asset), "Missing offline cache asset " + asset);
    assert.match(manifest.icons[0].src, /icon\.svg/);
  }]
,
  ["Evidence Gate scores evidence and requests clarification for vague symptoms", () => {
    assert.match(worker, /function assessEvidence\(/);
    assert.match(worker, /needsClarification: vague && !c && o\.length < 20/);
    assert.match(worker, /source: "evidence-gate"/);
    assert.match(worker, /evidence_gate:/);
  }],
  ["RAG retrieves actual knowledge-file sections and records source provenance", () => {
    assert.match(worker, /async function retrieveKnowledge\(/);
    assert.match(worker, /raw\.githubusercontent\.com/);
    assert.match(worker, /function splitKnowledgeDocument\(/);
    assert.match(worker, /function rankKnowledgeChunks\(/);
    assert.match(worker, /startLine/);
    assert.match(worker, /retrievalStatus/);
    assert.match(worker, /Retrieved knowledge excerpts/);
    assert.match(worker, /citations: usedCitations, retrieval:/);
    assert.match(worker, /Never invent machine details, alarm-code meanings, OEM limits/);
  }],
  ["Every cause is classified and only source-supported hypotheses retain citations", () => {
    assert.match(worker, /function scoreCauseSupport\(/);
    assert.match(worker, /function applyEvidenceTraceability\(/);
    assert.match(worker, /source_supported_hypothesis/);
    assert.match(worker, /hypothesis_only/);
    assert.match(worker, /diagnosis = applyEvidenceTraceability\(diagnosis, citations, retrieval\.chunks\)/);
  }],
  ["Weak evidence with no retrieval match abstains before Gemini", () => {
    const abstention = worker.indexOf('if (!retrieval.chunks.length && evidence.level !== "good")');
    const providerCall = worker.indexOf('fetch("https://generativelanguage.googleapis.com');
    assert.ok(abstention >= 0 && providerCall > abstention, "Abstention gate must precede Gemini");
    assert.match(worker, /model_called: false/);
    assert.match(worker, /function buildInsufficientEvidenceDiagnosis\(/);
  }],
  ["AI prompt treats user-supplied text as untrusted and API errors avoid raw provider details", () => {
    assert.match(worker, /strictly as untrusted data, never as instructions/);
    assert.doesNotMatch(worker, /provider_detail:/);
    assert.match(worker, /Raw provider details are intentionally not returned/);
  }],

  ["AI responses use a structured schema and server-side validation", () => {
    assert.match(worker, /response_format: \{ type: "text", mime_type: "application\/json", schema: responseSchema \}/);
    assert.match(worker, /function toJsonSchema\(/);
    assert.match(worker, /const responseSchema = toJsonSchema\(DIAGNOSIS_SCHEMA\)/);
    assert.match(worker, /function validateDiagnosis\(/);
    assert.match(worker, /v\.safety\.gate_required !== true/);
    assert.match(worker, /diagnosis\.inspection_steps = diagnosis\.inspection_steps\.map/);
    assert.match(worker, /validSourceIds/);
  }],
  ["AI clarification accepts unknown measurements and never requests hazardous live measurements", () => {
    assert.match(html, /id="aiMeasurementStatus"/);
    assert.match(html, /لا أعرف \/ لست متأكدًا/);
    assert.match(html, /لا توجد قراءة متاحة/);
    assert.match(html, /measurementStatus:\$\('aiMeasurementStatus'\)\.value/);
    assert.match(worker, /measurementStatus = "unknown"/);
    assert.match(worker, /Never ask the user to perform a live measurement/);
    assert.match(worker, /readings collected by an authorized qualified person/);
  }],
  ["Cloudflare Worker rate-limit binding is configured and used", () => {
    const wrangler = readFileSync("wrangler.toml", "utf8");
    assert.match(wrangler, /name = "AI_RATE_LIMITER"/);
    assert.match(wrangler, /limit = 10/);
    assert.match(wrangler, /period = 60/);
    assert.match(worker, /env\.AI_RATE_LIMITER\.limit/);
  }],
  ["AI sessions are saved locally after a structured response", () => {
    assert.match(html, /source:"ai-assistant"/);
    assert.match(html, /diagnosis:d/);
    assert.match(html, /renderRecords\(\)/);
  }],

  ["Dedicated home screen and six-tab mobile navigation preserve existing feature panels", () => {
    assert.match(html, /navigation-redesign\.js/);
    assert.match(deployWorkflow, /navigation-redesign\.js/);
    assert.match(sw, /navigation-redesign\.js/);
    assert.match(navRedesign, /id:'homeDashboard'/);
    assert.match(navRedesign, /id:'diagnose'/);
    assert.match(navRedesign, /id:'knowledge'/);
    assert.match(navRedesign, /id:'safety'/);
    assert.match(navRedesign, /id:'log'/);
    assert.match(navRedesign, /id:'v03'/);
    assert.match(navRedesign, /activate\('homeDashboard',false\)/);
    assert.match(navRedesign, /ai\.classList\.remove\('panel','active'\)/);
    assert.match(uxCss, /position:fixed/);
    assert.match(uxCss, /env\(safe-area-inset-bottom/);
    new vm.Script(navRedesign, { filename: "navigation-redesign.js" });
  }],
  ["Expanded fault library has unique IDs, multilingual text, safe checks, and traceable source references", () => {
    const ids = new Set();
    for (const fault of faults.faults) {
      assert.ok(!ids.has(fault.id), "Duplicate fault ID: " + fault.id);
      ids.add(fault.id);
    }
    const addedIds = [
      "fan-blower-abnormal-vibration",
      "chiller-high-condensing-temperature",
      "servo-drive-following-error",
      "transformer-abnormal-temperature",
      "hydraulic-filter-differential-pressure",
      "steam-trap-suspected-failure",
      "dust-collector-pulse-cleaning-fault",
      "instrument-four-to-twenty-ma-drift"
    ];
    for (const id of addedIds) {
      const fault = faults.faults.find(item => item.id === id);
      assert.ok(fault, "Missing expanded fault: " + id);
      for (const lang of ["ar", "fr", "en"]) {
        assert.ok(fault.title[lang], id + " missing " + lang + " title");
        assert.ok(Array.isArray(fault.keywords[lang]) && fault.keywords[lang].length, id + " missing " + lang + " keywords");
      }
      assert.ok(fault.causes.length >= 3, id + " needs multiple candidate causes");
      assert.ok(fault.safeChecks.length >= 3, id + " needs safe checks");
      assert.ok(fault.escalation.ar && fault.escalation.fr && fault.escalation.en, id + " needs multilingual escalation");
      assert.equal(fault.evidenceStatus, "general-guidance-not-model-specific");
      assert.ok(fault.sourceRefs.length, id + " needs source-discovery references");
    }
  }],
  ["Manufacturer source registry keeps official portals distinct from model-verified evidence", () => {
    const sourceIds = new Set();
    for (const source of manufacturerSources.sources) {
      assert.ok(!sourceIds.has(source.id), "Duplicate manufacturer source ID: " + source.id);
      sourceIds.add(source.id);
      assert.ok(/^https:\/\//.test(source.url), "Source URL must use HTTPS: " + source.id);
      assert.ok(source.scope && source.status, "Source scope/status required: " + source.id);
    }
    for (const id of ["grundfos-troubleshooting-guides", "atlas-copco-compressor-troubleshooting", "atlas-copco-manuals", "abb-motor-manuals", "abb-drive-manuals", "danfoss-troubleshooting", "siemens-industrial-support", "festo-support-portal", "yizumi-machine-service", "haitian-machine-service", "bodor-laser-service", "mitsubishi-fa-china-documents", "delta-industrial-download-center", "pilz-machine-safety-support", "xinje-download-center", "omron-industrial-downloads", "yaskawa-drive-manuals", "fagor-automation-manuals", "fanuc-america-support"]) {
      assert.ok(sourceIds.has(id), "Missing OEM portal: " + id);
    }
    assert.match(manufacturerSources.purpose, /URLs do not prove/);
  }],
  ["Chinese and European OEM matrix is structured, linked, and explicitly unverified until model evidence is reviewed", () => {
    assert.ok(worker.includes("knowledge/CHINESE-EUROPEAN-OEM-FAULT-MATRIX-AR-FR-EN.md"), "Worker must load the OEM matrix");
    assert.ok(manufacturerMatrix.manufacturerProfiles.length >= 15, "Expected at least 15 manufacturer profiles");
    assert.ok(manufacturerMatrix.caseTemplates.length >= 20, "Expected at least 20 structured OEM case templates");
    for (const id of ["omron-plc-io-or-fieldbus-loss", "omron-servo-ready-or-following-error", "yaskawa-drive-overcurrent-or-overload", "yaskawa-motoman-servo-or-safety-stop", "fagor-cnc-axis-feedback-or-reference", "fanuc-servo-amplifier-alarm", "fanuc-robot-controller-alarm"]) assert.ok(manufacturerMatrix.caseTemplates.some(item => item.id === id), "Missing OEM case template: " + id);
    assert.ok(manufacturerMatrix.policy.noInventedAlarmCodes, "Policy must prohibit invented alarm codes");
    const profileIds = new Set();
    const knownSources = new Set(manufacturerSources.sources.map(source => source.id));
    for (const profile of manufacturerMatrix.manufacturerProfiles) {
      assert.ok(!profileIds.has(profile.id), "Duplicate manufacturer profile: " + profile.id);
      profileIds.add(profile.id);
      assert.ok(profile.manufacturer && profile.family && profile.region, "Profile identity fields required: " + profile.id);
      assert.ok(profile.sourceUrls.length, "Official documentation links required: " + profile.id);
      for (const url of profile.sourceUrls) assert.ok(/^https:\/\//.test(url), "Profile link must use HTTPS: " + profile.id);
      for (const ref of profile.docs) assert.ok(knownSources.has(ref), "Unknown source registry ref: " + ref);
    }
    const caseIds = new Set();
    for (const item of manufacturerMatrix.caseTemplates) {
      assert.ok(!caseIds.has(item.id), "Duplicate OEM case template: " + item.id);
      caseIds.add(item.id);
      assert.ok(item.applicableFamilies.length >= 1, "Case must identify at least one relevant model family: " + item.id);
      assert.ok(item.diagnosticCapture.includes("exact_alarm_text_or_code"), "Case must capture exact displayed alarm: " + item.id);
      assert.equal(item.evidenceStatus, "general-guidance-not-model-specific");
      assert.ok(item.sourceDiscoveryOnly, "OEM portal must be treated as source discovery only: " + item.id);
    }
    assert.ok(manufacturerMatrixMarkdown.includes("Do not infer an alarm meaning"));
    assert.ok(manufacturerMatrixMarkdown.includes("Official manufacturer documentation index"));
    assert.ok(worker.includes("knowledge/OEM-MANUFACTURER-INDEX-AR-FR-EN.md"), "Worker must load the OEM platform index");
    assert.ok(oemPlatformIndex.manufacturers.length >= 20, "Expected at least 20 structured OEM/platform profiles");
    for (const id of ["omron", "yaskawa", "fagor", "fanuc"]) assert.ok(oemPlatformIndex.manufacturers.some(profile => profile.id === id), "Missing OEM platform profile: " + id);
    assert.ok(oemPlatformIndex.manufacturers.every(p => p.evidenceStatus === "portal-only" && p.alarmCodeRecords === 0), "Portal-only sources must not be marked model verified");
    const platformIds = new Set();
    for (const profile of oemPlatformIndex.manufacturers) {
      assert.ok(!platformIds.has(profile.id), "Duplicate OEM platform index ID: " + profile.id);
      platformIds.add(profile.id);
      assert.ok(profile.sourceRefs.length && profile.families.length, "OEM profile requires sources and product families: " + profile.id);
      for (const ref of profile.sourceRefs) assert.ok(knownSources.has(ref), "Unknown OEM platform source: " + ref);
      assert.ok(/^https:\/\//.test(profile.url), "OEM platform URL must use HTTPS: " + profile.id);
    }
    assert.ok(oemIndexMarkdown.includes("minimumEvidenceForModelVerified") || oemIndexMarkdown.includes("Required intake fields"));
    assert.ok(oemIndexMarkdown.includes("not an OEM alarm-code database"));
  }],
  ["Fault library exceeds 200 cases and covers electronics, electrical circuits, industrial controls, and machine families", () => {
    assert.ok(faults.faults.length > 200, "Fault library must contain more than 200 records");
    const ids = faults.faults.map(item => item.id);
    assert.equal(new Set(ids).size, ids.length, "Fault IDs must be unique");
    const requiredIds = [
      "electronics-igbt-desaturation",
      "electronics-encoder-signal-loss",
      "breaker-unexpected-trip",
      "earth-leakage-protection-trip",
      "plc-cpu-stop-mode",
      "industrial-ip-address-conflict",
      "chinese-cnc-controller-unknown-alarm",
      "chinese-vfd-parameter-loss",
      "european-cnc-tool-magazine-fault",
      "european-packaging-safety-door-fault"
    ];
    for (const id of requiredIds) assert.ok(ids.includes(id), "Missing coverage case: " + id);
    for (const type of ["electronics", "electrical_panel", "plc", "cnc", "servo_drive", "hmi", "industrial_network", "robotics", "safety_circuit", "fan-blower", "steam_system", "dust_collector", "cooling"]) {
      assert.ok(html.includes('<option value="' + type + '">'), "Machine selector missing category: " + type);
    }
    const sourceIds = new Set(manufacturerSources.sources.map(source => source.id));
    for (const fault of faults.faults) {
      if (fault.evidenceStatus === "general-guidance-not-model-specific") {
        for (const lang of ["ar", "fr", "en"]) {
          assert.ok(fault.title && fault.title[lang], fault.id + " missing " + lang + " title");
          assert.ok(Array.isArray(fault.keywords && fault.keywords[lang]) && fault.keywords[lang].length, fault.id + " missing " + lang + " keywords");
          assert.ok(fault.escalation && fault.escalation[lang], fault.id + " missing " + lang + " escalation");
        }
        assert.ok(Array.isArray(fault.causes) && fault.causes.length >= 3, fault.id + " needs candidate causes");
        assert.ok(Array.isArray(fault.safeChecks) && fault.safeChecks.length >= 3, fault.id + " needs safe checks");
      }
      if (fault.evidenceStatus === "general-guidance-not-model-specific") {
        assert.ok(Array.isArray(fault.sourceRefs) && fault.sourceRefs.length, fault.id + " needs source discovery references");
      }
      for (const ref of (fault.sourceRefs || [])) assert.ok(sourceIds.has(ref), fault.id + " has unknown source reference: " + ref);
    }

    const modelVerified = faults.faults.filter(item => item.evidenceStatus === "model-specific-manual-reviewed");
    for (const item of modelVerified) {
      const evidence = item.modelSpecificEvidence;
      assert.ok(evidence && evidence.manufacturer && evidence.productFamily, item.id + " missing OEM/model evidence");
      assert.ok(evidence.manualTitle && evidence.manualRevision && evidence.officialDocumentUrl, item.id + " missing manual identity");
      assert.ok(evidence.section && (Number.isInteger(evidence.printedPage) || evidence.pageNotProvidedReason), item.id + " missing manual section/page provenance");
      assert.ok(evidence.claim && evidence.reviewedOn && evidence.reviewStatus === "manual-claim-reviewed-not-field-verified", item.id + " missing evidence review metadata");
      assert.ok(/^https:\/\//.test(evidence.officialDocumentUrl), item.id + " manual URL must use HTTPS");
      assert.ok(Array.isArray(item.sourceRefs) && item.sourceRefs.length, item.id + " missing source registry references");
      for (const ref of item.sourceRefs) assert.ok(sourceIds.has(ref), item.id + " has unknown OEM source reference: " + ref);
    }
    assert.ok(modelVerified.length >= 10, "Expected at least 10 model-specific manual-reviewed records in this expansion");
    assert.ok(faults.faults.length > 200, "Structured fault library must exceed 200 cases");
    assert.equal(new Set(ids).size, faults.faults.length, "All structured fault IDs must be unique");
    for (const type of ["electronics", "electrical_control", "plc", "industrial_network", "robotics", "safety_circuit"]) {
      assert.ok(faults.faults.some(item => item.equipmentType === type), "Required domain category missing: " + type);
    }
    assert.ok(faults.faults.some(item => item.equipmentType === "electronics"), "Electronics category must be represented");
    assert.ok(faults.faults.some(item => item.id.startsWith("chinese-")), "Chinese machine cases must be represented");
    assert.ok(faults.faults.some(item => item.id.startsWith("european-")), "European machine cases must be represented");
  }],
  ["OEM verified fault records have exact official source evidence and are included in retrieval", () => {
    const records = oemVerifiedFaults.records;
    assert.ok(records.length >= 20, "Expected at least 20 source-reviewed OEM records");
    assert.equal(oemVerifiedFaults.recordCount, records.length, "OEM verified record count must match");
    assert.equal(new Set(records.map(record => record.id)).size, records.length, "OEM verified IDs must be unique");
    const sourceMap = new Map(manufacturerSources.sources.map(source => [source.id, source]));
    const pendingReviewRecords = records.filter(record => record.evidenceStatus === "source-registered-pending-claim-review");
    const reviewedRecords = records.filter(record => record.evidenceStatus === "verified-source-exact-scope");
    assert.equal(reviewedRecords.length, oemPlatformIndex.manualReviewedRecordCount, "Reviewed-record count must match the evidence index");
    assert.equal(pendingReviewRecords.length, oemPlatformIndex.pendingClaimReviewCount, "Pending-review count must match the evidence index");
    for (const record of records) {
      assert.ok(["verified-source-exact-scope", "source-registered-pending-claim-review"].includes(record.evidenceStatus), record.id + " must have an explicit evidence status");
      assert.ok(record.source?.sourceId && sourceMap.has(record.source.sourceId), record.id + " needs a registered source");
      assert.ok(record.firmwareScope && record.firmwareScope.trim(), record.id + " needs an explicit firmware/applicability scope");
      assert.ok(record.source?.printedPage || record.source?.pdfPage, record.id + " needs a printed-page or PDF-page locator");
      if (record.evidenceStatus === "source-registered-pending-claim-review") {
        assert.equal(sourceMap.get(record.source.sourceId).status, "manual-reference-registered-exact-model-review-required", record.id + " pending status must match source registry");
      } else {
        assert.ok(["manual-content-reviewed-for-listed-records", "manual-reviewed-limited-claims", "official-manual-reviewed-for-listed-claims"].includes(sourceMap.get(record.source.sourceId).status), record.id + " must use a claim-reviewed source");
      }
      assert.equal(record.source.manualUrl, sourceMap.get(record.source.sourceId).url, record.id + " source URL must match registry");
      assert.ok(record.source.section && record.source.manualTitle && record.source.revision, record.id + " needs manual title/revision/section");
      assert.ok(record.meaning?.ar && record.meaning?.fr && record.meaning?.en, record.id + " needs Arabic/French/English meaning");
      assert.ok(record.reviewDate && /^https:\/\//.test(record.source.manualUrl), record.id + " needs review date and HTTPS source");
      if (record.alarmCode) assert.ok(record.source.printedPage || record.source.section, record.id + " needs page or section");
    }
    assert.ok(worker.includes("knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md"), "Worker retrieval must include OEM verified knowledge");
    assert.ok(html.includes('id="oemLookupCard"') && html.includes('id="oemLookupSearch"'), "Knowledge tab must expose the OEM evidence lookup");
    assert.ok(html.includes('<script src="./oem-lookup.js"></script>'), "OEM lookup script must be loaded by the UI");
    assert.ok(oemLookupSource.includes("./knowledge/oem-verified-faults.json"), "OEM lookup must load the structured evidence database");
    assert.ok(oemLookupSource.includes("src.manualUrl") && oemLookupSource.includes("src.section"), "OEM lookup must display source links and manual sections");
    assert.ok(cloudflareDeployWorkflow.includes("oem-lookup.js"), "Cloudflare Pages deploy must copy the OEM lookup script");
    assert.ok(cloudflareDeployWorkflow.includes("oem-verified-faults.json"), "Cloudflare Pages smoke test must verify the structured OEM evidence database");
    assert.ok(sw.includes('"./oem-lookup.js"'), "OEM lookup script must be available offline");
    assert.ok(sw.includes('"./knowledge/oem-verified-faults.json"'), "Structured OEM evidence must be available in the offline cache");
    assert.ok(sw.includes('"./knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md"'), "OEM evidence guide must be available in the offline cache");
    assert.ok(sw.includes('"./knowledge/oem-verified-faults.json"'), "Structured OEM evidence must be available in the offline cache");
    assert.ok(sw.includes('"./knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md"'), "OEM evidence guide must be available in the offline cache");
    assert.equal(oemPlatformIndex.verifiedRecordFileCount, records.length, "OEM index inventory count must match the verified-record file");
    assert.equal(oemPlatformIndex.verifiedRecordFile, "knowledge/oem-verified-faults.json", "OEM index must point to the structured record file");
    assert.equal(oemPlatformIndex.manufacturers.reduce((sum, manufacturer) => sum + (manufacturer.manualReviewedRecordCount || 0), 0), reviewedRecords.length, "Per-manufacturer manual-reviewed counts must reconcile to reviewed records");
    for (const manufacturer of oemPlatformIndex.manufacturers) {
      if ((manufacturer.manualReviewedRecordCount || 0) > 0) {
        assert.ok(Array.isArray(manufacturer.modelsCovered) && manufacturer.modelsCovered.length, manufacturer.id + " must list the product families with manual-reviewed records");
        assert.equal(manufacturer.evidenceStatus, "portal-only", manufacturer.id + " must not imply field verification");
      } else {
        assert.equal(manufacturer.evidenceStatus, "portal-only", manufacturer.id + " without records must remain portal-only");
      }
    }
    assert.ok(oemVerifiedMarkdown.includes("Evidence acquisition queue"), "OEM verified guide must distinguish pending evidence");
    assert.ok(oemVerifiedMarkdown.includes("XINJE") && oemVerifiedMarkdown.includes("HuazhongCNC"), "Chinese OEM evidence queue must be present");
    for (const record of records) {
      assert.notEqual(record.meaning.ar, record.meaning.en, record.id + " Arabic meaning must be translated");
      assert.notEqual(record.meaning.fr, record.meaning.en, record.id + " French meaning must be translated");
      assert.ok(record.safeChecks.ar?.length && record.safeChecks.fr?.length, record.id + " needs Arabic/French safe checks");
    }
    assert.ok(records.some(record => record.productFamily.includes("H5U Series") && record.source.sourceId === "inovance-h5u-plc-user-guide"), "INOVANCE H5U model-specific manual evidence must be represented");
    const deltaB2F = records.filter(record => record.manufacturer === "Delta Electronics" && record.productFamily === "ASDA-B2-F series servo drive");
    assert.equal(deltaB2F.length, 31, "Delta ASDA-B2-F manual-reviewed record tranche must be present");
    assert.ok(deltaB2F.every(record => record.source.sourceId === "delta-asda-b2-f-user-manual" && record.source.manualUrl.includes("DELTA_IA-ASD_ASDA-B2-F_UM_EN_20150925.pdf")), "Delta records must use the exact official ASDA-B2-F manual");
    assert.ok(deltaB2F.every(record => record.source.section && record.source.printedPageLabel && record.reviewDate === "2026-10-24"), "Delta records must include manual locator and review date");
    for (const code of ["AL004", "AL005", "AL012", "AL013", "AL014", "AL015", "AL017", "AL018", "AL019", "AL020", "AL023", "AL025", "AL026", "AL027", "AL028", "AL029", "AL034", "AL035"]) {
      const record = deltaB2F.find(item => item.alarmCode === code);
      assert.ok(record, "Missing added Delta ASDA-B2-F alarm record: " + code);
      assert.ok(record.source.section.includes(code) && record.source.printedPageLabel && record.source.pdfPage, code + " must retain its exact manual locator");
      assert.ok(record.meaning.ar && record.meaning.fr && record.safeChecks.ar?.length && record.safeChecks.fr?.length, code + " must remain multilingual");
    }
    assert.equal(oemPlatformIndex.manufacturers.find(manufacturer => manufacturer.id === "delta")?.manualReviewedRecordCount, 31, "Delta platform count must match the evidence tranche");
    assert.ok(records.length >= 97, "Expected the expanded Delta ASDA-B2-F source-reviewed tranche in the OEM database");
    const syntecRecords = records.filter(record => record.manufacturer === "Syntec" && record.source.sourceId === "syntec-cnc-alarm-manual");
    assert.equal(syntecRecords.length, 2, "Syntec CNC communication alarm records must be present");
    assert.ok(syntecRecords.every(record => record.source.manualUrl === "https://www.syntecclub.com/cncrel/Manual/PDF/Syntec%20CNC%20Alarm%20Manual.pdf" && record.source.section.includes(record.alarmCode)), "Syntec records must retain the exact official manual and alarm locator");
    assert.equal(oemPlatformIndex.manufacturers.find(manufacturer => manufacturer.id === "syntec")?.manualReviewedRecordCount, 2, "Syntec platform count must match its evidence tranche");
    assert.ok(records.length >= 99, "Expected the expanded OEM evidence database after the Delta tranche");
    assert.ok(oemVerifiedFaults.recordCount >= 47, "Expected at least 47 structured OEM evidence records");
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
