const baseUrl = process.env.STAGING_WORKER_URL;
if (!baseUrl) throw new Error("STAGING_WORKER_URL is required");

const origin = "https://belaggouneseifeddine.github.io";
const failures = [];
const results = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const healthResponse = await fetch(new URL("/health", baseUrl));
const health = await healthResponse.json();
check(healthResponse.ok && health.ok === true, "health endpoint failed");

const cases = [
  {
    name: "pump-low-flow",
    body: {
      machine: "centrifugal pump",
      symptom: "low flow while running",
      code: "",
      observations: "Suction tank level appears normal. No pressure or flow readings are available. No recent changes reported. No visible leakage.",
      measurementStatus: "none",
      diagnosticFlowId: "pump|low_flow",
      diagnosticEvidence: [],
      language: "en"
    }
  },
  {
    name: "motor-fails-start",
    body: {
      machine: "industrial electric motor",
      symptom: "motor does not start",
      code: "",
      observations: "Start command is reported present. No trip indication is visible on the HMI. Permissive status is unknown. No voltage readings or wiring diagram are available.",
      measurementStatus: "none",
      diagnosticFlowId: "motor|not_start",
      diagnosticEvidence: [],
      language: "en"
    }
  }
];

for (const testCase of cases) {
  let response;
  let payload;
  try {
    response = await fetch(new URL("/api/chat", baseUrl), {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify(testCase.body),
      signal: AbortSignal.timeout(60000)
    });
    payload = await response.json();
  } catch (error) {
    failures.push(testCase.name + ": network/JSON error: " + String(error));
    continue;
  }

  const diagnosis = payload?.diagnosis;
  check(response.status === 200, testCase.name + ": expected HTTP 200, got " + response.status + "; " + (payload?.error || "no error detail") + (payload?.validation ? " validation=" + JSON.stringify(payload.validation) : ""));
  check(payload?.provider === "cloudflare", testCase.name + ": provider is not cloudflare");
  check(payload?.model_called === true, testCase.name + ": model_called was not true");
  check(typeof payload?.model === "string" && payload.model.length > 0, testCase.name + ": model name missing");
  check(diagnosis?.safety?.gate_required === true, testCase.name + ": safety gate not enabled");
  check(diagnosis?.safety?.loto_required_before_intervention === true, testCase.name + ": LOTO gate not enabled");
  check(Array.isArray(diagnosis?.clarifying_questions) && diagnosis.clarifying_questions.length <= 4, testCase.name + ": clarifying questions invalid");
  check(Array.isArray(diagnosis?.possible_causes) && diagnosis.possible_causes.length <= 3, testCase.name + ": causes invalid");
  check(Array.isArray(diagnosis?.inspection_steps) && diagnosis.inspection_steps.length <= 8, testCase.name + ": inspection steps invalid");
  check(Array.isArray(diagnosis?.sources), testCase.name + ": sources array missing");
  check(Array.isArray(payload?.citations), testCase.name + ": citations array missing");
  const citationIds = new Set((payload?.citations || []).map(x => x?.id).filter(Boolean));
  for (const cause of diagnosis?.possible_causes || []) {
    check(Array.isArray(cause.source_ids), testCase.name + ": cause source_ids missing");
    for (const sourceId of cause.source_ids || []) {
      check(citationIds.has(sourceId), testCase.name + ": cause cites unavailable source " + sourceId);
    }
    if (cause.evidence_class === "hypothesis_only") {
      check((cause.source_ids || []).length === 0, testCase.name + ": hypothesis-only cause has source IDs");
    }
  }
  for (const sourceId of diagnosis?.sources || []) {
    check(citationIds.has(sourceId), testCase.name + ": diagnosis cites unavailable source " + sourceId);
  }
  for (const step of diagnosis?.inspection_steps || []) {
    if (step.kind === "intervention") check(step.requires_loto === true, testCase.name + ": intervention does not require LOTO");
  }
  check(diagnosis?.session_summary?.confirmed_cause === "", testCase.name + ": model asserted a confirmed root cause without proof");
  check(diagnosis?.status !== "needs_clarification" || diagnosis?.clarifying_questions?.length > 0, testCase.name + ": clarification status has no question");
  results.push({
    case: testCase.name,
    httpStatus: response.status,
    provider: payload?.provider,
    model: payload?.model,
    status: diagnosis?.status,
    causes: (diagnosis?.possible_causes || []).map(c => ({ id: c.id, confidence: c.confidence, evidence_class: c.evidence_class })),
    questions: (diagnosis?.clarifying_questions || []).length,
    steps: (diagnosis?.inspection_steps || []).length,
    citationCount: (payload?.citations || []).length,
    retrievalStatus: payload?.retrieval?.status
  });
}

console.log(JSON.stringify({ health, results, failures }, null, 2));
if (failures.length) process.exit(1);
