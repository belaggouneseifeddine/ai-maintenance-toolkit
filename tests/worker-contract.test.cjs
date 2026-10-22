const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../worker.js"), "utf8");
let upstreamPayload = null;
const mockKnowledge = "# مضخة طرد مركزي — ضعف التدفق\\n\\nتتضمن هذه الملاحظة الفنية مراجعة القراءات المتاحة ومقارنة الضغط والتدفق بخط الأساس ودليل المصنع. لا تستخدمها كقيمة ضبط ولا كبديل لإجراءات الموقع.";
const context = {
  Request, Response, URL, AbortSignal, TextEncoder, setTimeout, clearTimeout, console,
  fetch: async (url, options = {}) => {
    const target = String(url);
    if (target.includes("raw.githubusercontent.com")) return new Response(mockKnowledge, { status: 200, headers: { "content-type": "text/plain" } });
    if (target.includes("generativelanguage.googleapis.com")) {
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
  "\nglobalThis.__validateDiagnosis = validateDiagnosis; globalThis.__diagnosisSchema = DIAGNOSIS_SCHEMA; globalThis.__worker = workerHandler;";
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

