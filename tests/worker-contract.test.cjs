const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../normalization.js"), "utf8") + "\n" + fs.readFileSync(require.resolve("../worker.js"), "utf8").replace('import "./normalization.js";', "");
let upstreamPayload = null;
let upstreamCalls = 0;
let knowledgeCalls = 0;
const mockKnowledge = "# مضخة طرد مركزي — ضعف التدفق\\n\\nتتضمن هذه الملاحظة الفنية مراجعة القراءات المتاحة ومقارنة الضغط والتدفق بخط الأساس ودليل المصنع. لا تستخدمها كقيمة ضبط ولا كبديل لإجراءات الموقع.";
const context = {
  Request, Response, URL, AbortSignal, TextEncoder, setTimeout, clearTimeout, console,
  fetch: async (url, options = {}) => {
    const target = String(url);
    if (target.includes("raw.githubusercontent.com")) { knowledgeCalls++; return new Response(mockKnowledge, { status: 200, headers: { "content-type": "text/plain" } }); }
    if (target.includes("generativelanguage.googleapis.com")) {
      upstreamCalls++;
      upstreamPayload = JSON.parse(options.body);
      const diagnosis = validDiagnosis();
      diagnosis.session_summary.equipment = "مضخة طرد مركزي";
      diagnosis.session_summary.symptom = "ضعف تدفق الماء أثناء التشغيل";
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(diagnosis) }] } }] }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response("not found", { status: 404 });
  }
};
const executable = source.replace("export default {", "const workerHandler = {") +
  "\nglobalThis.__validateDiagnosis = validateDiagnosis; globalThis.__diagnosisSchema = DIAGNOSIS_SCHEMA; globalThis.__worker = workerHandler; globalThis.__retrievalTerms = retrievalTerms; globalThis.__applyEvidenceTraceability = applyEvidenceTraceability; globalThis.__buildInsufficientEvidenceDiagnosis = buildInsufficientEvidenceDiagnosis; globalThis.__rankLegacy = rankKnowledgeChunks; globalThis.__rankBM25 = rankKnowledgeChunksBM25;";
new vm.Script(executable, { filename: "worker.js" }).runInNewContext(context);

function validDiagnosis() {
  return {
    status: "preliminary_assessment",
    language: "ar",
    safety: {
      gate_required: true,
      loto_required_before_intervention: true,
      warnings: ["اتبع إجراء الموقع."],
      stop_conditions: []
    },
    clarifying_questions: [],
    possible_causes: [{
      id: "cause-1",
      label: "سبب محتمل",
      confidence: "low",
      evidence_for: ["العَرَض متوافق جزئيًا."],
      evidence_against: [],
      source_ids: ["S1"],
      evidence_class: "source_supported_hypothesis",
      next_check: "راجع البيانات المتاحة فقط."
    }],
    inspection_steps: [{
      order: 1,
      action: "راجع سجل الإنذارات المتاح.",
      kind: "observation",
      purpose: "الحصول على دليل دون تدخل.",
      requires_loto: false,
      expected_outcome: "رمز إنذار أو لا توجد قراءة."
    }],
    required_tools: [],
    danger_signs: [],
    escalation: { required: false, reason: "لا توجد أدلة كافية لتحديد التصعيد." },
    sources: ["S1"],
    unknowns: ["الطراز غير معروف."],
    session_summary: {
      equipment: "مضخة",
      symptom: "ضعف التدفق",
      confirmed_cause: "",
      work_status: "open"
    }
  };
}

test("Worker structured response schema requires safety, questions, causes, steps and traceability", () => {
  const schema = context.__diagnosisSchema;
  assert.equal(schema.type, "OBJECT");
  for (const key of ["status", "language", "safety", "clarifying_questions", "possible_causes", "inspection_steps", "escalation", "sources", "unknowns", "session_summary"]) {
    assert.ok(schema.required.includes(key), "missing required schema field " + key);
  }
  const causeSchema = schema.properties.possible_causes.items;
  assert.ok(causeSchema.required.includes("source_ids"));
  assert.ok(causeSchema.required.includes("evidence_class"));
});

test("valid structured diagnosis is accepted", () => {
  assert.equal(context.__validateDiagnosis(validDiagnosis(), "ar", new Set(["S1"])), true);
});

test("response without mandatory safety and LOTO gate is rejected", () => {
  const diagnosis = validDiagnosis();
  diagnosis.safety.loto_required_before_intervention = false;
  assert.equal(context.__validateDiagnosis(diagnosis, "ar", new Set(["S1"])), false);
});

test("more than four clarification questions are rejected", () => {
  const diagnosis = validDiagnosis();
  diagnosis.status = "needs_clarification";
  diagnosis.clarifying_questions = Array.from({ length: 5 }, (_, i) => ({ id: "q" + i, question: "سؤال", reason: "سبب" }));
  assert.equal(context.__validateDiagnosis(diagnosis, "ar", new Set(["S1"])), false);
});

test("citations not returned by retrieval are rejected", () => {
  const diagnosis = validDiagnosis();
  diagnosis.sources = ["S999"];
  assert.equal(context.__validateDiagnosis(diagnosis, "ar", new Set(["S1"])), false);
});

test("wrong response language is rejected", () => {
  assert.equal(context.__validateDiagnosis(validDiagnosis(), "en", new Set(["S1"])), false);
});

test("Worker health endpoint responds without calling Gemini", async () => {
  const response = await context.__worker.fetch(new Request("https://worker.test/health"));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
});

test("Worker rejects a disallowed origin before upstream work", async () => {
  const response = await context.__worker.fetch(new Request("https://worker.test/api/chat", {
    method: "POST",
    headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
    body: JSON.stringify({ machine: "pump", symptom: "low flow" })
  }), { AI_API_KEY: "test-only-placeholder" });
  assert.equal(response.status, 403);
});

test("Worker returns validated structured diagnosis and accepts missing readings", async () => {
  const response = await context.__worker.fetch(new Request("https://worker.test/api/chat", {
    method: "POST",
    headers: { Origin: "https://belaggouneseifeddine.github.io", "Content-Type": "application/json" },
    body: JSON.stringify({
      machine: "مضخة طرد مركزي",
      symptom: "ضعف تدفق الماء أثناء التشغيل",
      code: "",
      observations: "لا توجد قراءة ضغط أو تدفق متاحة حتى الآن",
      measurementStatus: "none",
      language: "ar"
    })
  }), { AI_API_KEY: "test-only-placeholder" });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.diagnosis.status, "preliminary_assessment");
  assert.equal(body.diagnosis.safety.gate_required, true);
  assert.equal(body.diagnosis.safety.loto_required_before_intervention, true);
  assert.match(body.answer, /بوابة السلامة/);
  assert.equal(upstreamPayload.generationConfig.responseMimeType, "application/json");
  assert.equal(upstreamPayload.generationConfig.responseSchema.type, "OBJECT");
  assert.match(upstreamPayload.contents[0].parts[0].text, /no reading available/);
});



test("interlock-bypass requests are stopped deterministically before retrieval or Gemini", async () => {
  const before = { upstreamCalls, knowledgeCalls };
  const response = await context.__worker.fetch(new Request("https://worker.test/api/chat", {
    method: "POST",
    headers: { Origin: "https://belaggouneseifeddine.github.io", "Content-Type": "application/json" },
    body: JSON.stringify({
      machine: "pump interlock",
      symptom: "disable the interlock so the machine keeps running",
      observations: "request to bypass safety protection",
      language: "en"
    })
  }), {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.diagnosis.status, "escalation_required");
  assert.equal(body.safety_gate.trigger, "protection_bypass");
  assert.equal(body.safety_gate.model_called, false);
  assert.equal(body.safety_gate.retrieval_called, false);
  assert.equal(body.diagnosis.escalation.required, true);
  assert.match(body.answer, /Do not bypass or disable an interlock/i);
  assert.deepEqual({ upstreamCalls, knowledgeCalls }, before);
});

test("hydraulic high-pressure leak is escalated without retrieval or Gemini", async () => {
  const before = { upstreamCalls, knowledgeCalls };
  const response = await context.__worker.fetch(new Request("https://worker.test/api/chat", {
    method: "POST",
    headers: { Origin: "https://belaggouneseifeddine.github.io", "Content-Type": "application/json" },
    body: JSON.stringify({
      machine: "hydraulic system",
      symptom: "high pressure oil leak",
      observations: "fluid jet near a hose",
      language: "en"
    })
  }), {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.diagnosis.status, "escalation_required");
  assert.equal(body.safety_gate.trigger, "high_pressure_leak");
  assert.equal(body.safety_gate.model_called, false);
  assert.equal(body.safety_gate.retrieval_called, false);
  assert.match(body.answer, /never use a hand to search for a leak/i);
  assert.match(body.answer, /Do not loosen fittings/i);
  assert.deepEqual({ upstreamCalls, knowledgeCalls }, before);
});

test("Arabic interlock-bypass wording activates the same independent safety gate", async () => {
  const before = { upstreamCalls, knowledgeCalls };
  const response = await context.__worker.fetch(new Request("https://worker.test/api/chat", {
    method: "POST",
    headers: { Origin: "https://belaggouneseifeddine.github.io", "Content-Type": "application/json" },
    body: JSON.stringify({
      machine: "مضخة صناعية",
      symptom: "تجاوز الانترلوك لتعطيل الحماية",
      observations: "المعدة تستمر في العمل",
      language: "ar"
    })
  }), {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.diagnosis.status, "escalation_required");
  assert.equal(body.safety_gate.trigger, "protection_bypass");
  assert.match(body.answer, /لا تتجاوز أو تعطّل الإنترلوك/);
  assert.deepEqual({ upstreamCalls, knowledgeCalls }, before);
});


test("Worker retrieval expands confirmed aliases but does not promote review-only aliases", () => {
  const confirmed = context.__retrievalTerms("pompe faible débit");
  assert.ok(confirmed.includes("pump"));
  assert.ok(confirmed.includes("low_flow"));
  const uncertain = context.__retrievalTerms("بومبة");
  assert.equal(uncertain.includes("pump"), false);
});


test("BM25 ranking is benchmarked against legacy lexical ranking without top-1 regression", () => {
  const longDistractor = "pump low flow " + Array.from({ length: 80 }, () => "routine maintenance note").join(" ");
  const chunks = [
    { source: "knowledge/overview.md", heading: "Pump low flow overview", startLine: 1, endLine: 90, text: longDistractor },
    { source: "knowledge/pump.md", heading: "Pump diagnostics", startLine: 20, endLine: 28, text: "Pump has low flow. Review existing suction pressure, discharge pressure, strainer history, and compare readings with the approved baseline." },
    { source: "knowledge/pump.md", heading: "Pump cavitation and abnormal noise", startLine: 50, endLine: 58, text: "Cavitation may produce gravel-like noise and vibration. Review existing suction conditions and compare readings with manufacturer guidance." },
    { source: "knowledge/compressor.md", heading: "Compressor low pressure", startLine: 10, endLine: 18, text: "Review existing discharge pressure, alarm history, and compare the recorded value with the model-specific manual." }
  ];
  const queries = [
    { query: "pump low flow", expected: "knowledge/pump.md:20" },
    { query: "compressor low pressure", expected: "knowledge/compressor.md:10" },
    { query: "pump cavitation noise", expected: "knowledge/pump.md:50" }
  ];
  let legacyTop1 = 0;
  let bm25Top1 = 0;
  let overlapAt4 = 0;
  for (const item of queries) {
    const legacy = context.__rankLegacy(chunks, item.query);
    const bm25 = context.__rankBM25(chunks, item.query);
    const id = chunk => chunk.source + ":" + chunk.startLine;
    if (legacy[0] && id(legacy[0]) === item.expected) legacyTop1++;
    if (bm25[0] && id(bm25[0]) === item.expected) bm25Top1++;
    overlapAt4 += bm25.filter(chunk => legacy.some(old => id(old) === id(chunk))).length;
  }
  console.log("BM25 comparison: legacy top-1 " + legacyTop1 + "/" + queries.length +
    ", BM25 top-1 " + bm25Top1 + "/" + queries.length +
    ", cumulative overlap@4 " + overlapAt4 + "/" + (queries.length * 4));
  assert.ok(bm25Top1 >= legacyTop1, "BM25 top-1 accuracy must not regress versus legacy ranking");
  assert.equal(bm25Top1, queries.length, "BM25 must rank each expected relevant chunk first in the fixed synthetic benchmark");
});


test("cause traceability links only excerpts that lexically support the stated evidence", () => {
  const diagnosis = {
    sources: ["S1", "S2"],
    possible_causes: [
      { id: "supported", label: "low flow pressure", confidence: "high", evidence_for: ["Low flow pressure is compared against the recorded baseline"], evidence_against: [], source_ids: ["S1"], evidence_class: "source_supported_hypothesis", next_check: "Review recorded values." },
      { id: "unsupported", label: "bearing damage", confidence: "high", evidence_for: ["Bearing damage explains a high bearing temperature"], evidence_against: [], source_ids: ["S1"], evidence_class: "source_supported_hypothesis", next_check: "Review existing inspection records." }
    ]
  };
  const citations = [
    { id: "S1", source: "knowledge/pump.md", section: "Pump flow", startLine: 1, endLine: 8 },
    { id: "S2", source: "knowledge/motor.md", section: "Motor bearings", startLine: 10, endLine: 20 }
  ];
  const chunks = [
    { source: "knowledge/pump.md", heading: "Pump flow", text: "Compare low flow pressure readings with the approved baseline.", startLine: 1, endLine: 8 },
    { source: "knowledge/motor.md", heading: "Motor bearings", text: "Review alarm history and discharge pressure; no temperature details are available.", startLine: 10, endLine: 20 }
  ];
  const result = context.__applyEvidenceTraceability(diagnosis, citations, chunks);
  assert.equal(result.possible_causes[0].evidence_class, "source_supported_hypothesis");
  assert.deepEqual(result.possible_causes[0].source_ids, ["S1"]);
  assert.equal(result.possible_causes[0].confidence, "medium");
  assert.equal(result.possible_causes[1].evidence_class, "hypothesis_only");
  assert.deepEqual(result.possible_causes[1].source_ids, []);
  assert.equal(result.possible_causes[1].confidence, "low");
  assert.equal(Array.from(result.sources).join(","), "S1");
});

test("weak evidence plus no relevant retrieval abstains before Gemini", async () => {
  const before = upstreamCalls;
  const response = await context.__worker.fetch(new Request("https://worker.test/api/chat", {
    method: "POST",
    headers: { Origin: "https://belaggouneseifeddine.github.io", "Content-Type": "application/json" },
    body: JSON.stringify({
      machine: "unknown machine",
      symptom: "the system behaves strangely",
      observations: "",
      code: "",
      language: "en"
    })
  }), { AI_API_KEY: "test-only-placeholder" });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.diagnosis.status, "unable_to_assess");
  assert.equal(body.model_called, false);
  assert.equal(body.retrieval.status, "no-match");
  assert.equal(upstreamCalls, before);
  assert.match(body.answer, /Evidence is insufficient/i);
});
