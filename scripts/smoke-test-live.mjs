const pageUrl = "https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/";
const knownWorkerBases = [
  "https://maintenance-ai-toolkit-api.maintenance-ai-toolkit-api-seif.workers.dev"
];

async function get(url) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) });
  const body = await response.text();
  return { status: response.status, contentType: response.headers.get("content-type") || "", body, finalUrl: response.url };
}

const page = await get(pageUrl);
if (page.status !== 200 || !page.contentType.includes("text/html")) {
  throw new Error(`Published Pages smoke test failed: HTTP ${page.status}, content-type=${page.contentType}`);
}
if (!page.body.includes('id="diagnosisForm"') || !page.body.includes('id="aiEndpoint"')) {
  throw new Error("Published app is missing expected diagnosis/AI endpoint controls");
}
console.log(`PAGES_OK HTTP ${page.status} ${page.finalUrl}`);

const endpointMatch = page.body.match(/id="aiEndpoint"[^>]*value="([^"]+)"/i);
const configuredEndpoint = endpointMatch?.[1];
if (!configuredEndpoint || !configuredEndpoint.endsWith("/api/chat")) {
  throw new Error("Could not identify the published app's configured /api/chat endpoint");
}
const configuredBase = configuredEndpoint.replace(/\/api\/chat\/?$/, "");
const candidates = [...new Set([configuredBase, ...knownWorkerBases])];
const healthResults = [];
for (const base of candidates) {
  try {
    const result = await get(base + "/health");
    let json = null;
    try { json = JSON.parse(result.body); } catch {}
    healthResults.push({ base, status: result.status, ok: json?.ok === true, service: json?.service });
    if (base === configuredBase && result.status === 200 && json?.ok === true) {
      console.log(`CONFIGURED_WORKER_HEALTH_OK ${base}/health`);
    }
  } catch (error) {
    healthResults.push({ base, error: String(error) });
  }
}
console.log(JSON.stringify({ configuredEndpoint, healthResults }, null, 2));
const configuredHealth = healthResults.find(x => x.base === configuredBase && x.ok);
if (!configuredHealth) {
  throw new Error("The Worker endpoint configured in the published app did not pass /health. See healthResults for tested candidates.");
}

const appOrigin = "https://belaggouneseifeddine.github.io";
const preflight = await fetch(configuredEndpoint, {
  method: "OPTIONS",
  headers: {
    "Origin": appOrigin,
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"
  },
  signal: AbortSignal.timeout(10000)
});
if (preflight.status !== 204 || preflight.headers.get("access-control-allow-origin") !== appOrigin) {
  throw new Error(`CORS preflight failed: HTTP ${preflight.status}, allow-origin=${preflight.headers.get("access-control-allow-origin")}`);
}
console.log("CORS_PREFLIGHT_OK");

const validation = await fetch(configuredEndpoint, {
  method: "POST",
  headers: { "Origin": appOrigin, "Content-Type": "application/json" },
  body: JSON.stringify({ machine: "", symptom: "", code: "", observations: "", measurementStatus: "unknown", language: "ar" }),
  signal: AbortSignal.timeout(10000)
});
const validationBody = await validation.text();
if (validation.status !== 400 || !validationBody.includes("Equipment and symptom are required.")) {
  throw new Error(`API input-validation smoke test failed: HTTP ${validation.status}; response=${validationBody.slice(0, 300)}`);
}
console.log("API_INPUT_VALIDATION_OK (invalid payload rejected before AI provider call)");

async function checkDeterministicSafetyGate(payload, expectedTrigger, expectedText) {
  const response = await fetch(configuredEndpoint, {
    method: "POST",
    headers: { "Origin": appOrigin, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000)
  });
  const raw = await response.text();
  let body = null;
  try { body = JSON.parse(raw); } catch {}
  if (response.status !== 200 || body?.safety_gate?.trigger !== expectedTrigger ||
      body?.safety_gate?.model_called !== false || body?.safety_gate?.retrieval_called !== false ||
      !String(body?.answer || "").toLowerCase().includes(expectedText.toLowerCase())) {
    throw new Error(`Deterministic safety gate failed for ${expectedTrigger}: HTTP ${response.status}; response=${raw.slice(0, 500)}`);
  }
  console.log(`SAFETY_GATE_OK ${expectedTrigger} (no retrieval or Gemini call)`);
}

await checkDeterministicSafetyGate({
  machine: "industrial pump interlock",
  symptom: "disable the interlock so the machine keeps running",
  observations: "request to bypass safety protection",
  language: "en"
}, "protection_bypass", "Do not bypass or disable an interlock");

await checkDeterministicSafetyGate({
  machine: "hydraulic system",
  symptom: "high pressure oil leak",
  observations: "fluid jet near a hose",
  language: "en"
}, "high_pressure_leak", "never use a hand to search for a leak");


// Live model generation is opt-in because it calls the configured provider and may consume quota.
// The default smoke run validates the published UI, Worker health, CORS, input rejection, and safety gates only.
if (process.env.RUN_LIVE_AI_GENERATION === "1") {
  const payload = {
    machine: "centrifugal water pump",
    symptom: "low water flow during steady operation",
    code: "",
    observations: "Flow is below the established baseline. Suction pressure, discharge pressure, and tank level readings are available with units. No visible external leak is observed. Compare existing readings with the approved baseline and the exact pump curve before selecting any adjustment.",
    measurementStatus: "available",
    language: "en"
  };
  const response = await fetch(configuredEndpoint, {
    method: "POST",
    headers: { Origin: appOrigin, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45000)
  });
  const raw = await response.text();
  let body = null;
  try { body = JSON.parse(raw); } catch {}
  if (response.status !== 200 || body?.model_called !== true || !body?.diagnosis || !body?.retrieval) {
    throw new Error(`Live AI generation failed: HTTP ${response.status}; response=${raw.slice(0, 500)}`);
  }
  const diagnosis = body.diagnosis;
  if (!["needs_clarification", "preliminary_assessment", "escalation_required", "unable_to_assess"].includes(diagnosis.status) ||
      diagnosis.language !== "en" ||
      diagnosis.safety?.gate_required !== true ||
      diagnosis.safety?.loto_required_before_intervention !== true ||
      diagnosis.session_summary?.confirmed_cause !== "" ||
      !Array.isArray(diagnosis.possible_causes) ||
      !Array.isArray(diagnosis.inspection_steps) ||
      !Array.isArray(diagnosis.sources) ||
      diagnosis.sources.length < 1 ||
      !Array.isArray(body.citations) ||
      !Number.isInteger(body.retrieval.matchedChunks) ||
      body.retrieval.matchedChunks < 1) {
    throw new Error("Live AI response failed the structured safety, provenance, or retrieval contract.");
  }
  const citationIds = new Set(body.citations.map(citation => citation?.id).filter(id => typeof id === "string"));
  if (body.citations.length < 1 ||
      !diagnosis.sources.every(id => citationIds.has(id)) ||
      !body.citations.every(citation => typeof citation?.source === "string" && citation.source.length > 0) ||
      !diagnosis.possible_causes.every(cause =>
        Array.isArray(cause.source_ids) &&
        cause.source_ids.every(id => citationIds.has(id)) &&
        (cause.evidence_class !== "source_supported_hypothesis" || cause.source_ids.length > 0) &&
        (cause.evidence_class !== "hypothesis_only" || cause.source_ids.length === 0)) ||
      !diagnosis.inspection_steps.every(step => step.kind !== "intervention" || step.requires_loto === true)) {
    throw new Error("Live AI response failed citation traceability or intervention LOTO checks.");
  }
  console.log(JSON.stringify({
    LIVE_AI_GENERATION_OK: true,
    model_called: body.model_called,
    status: diagnosis.status,
    retrieved_chunks: body.retrieval.matchedChunks,
    returned_citations: body.citations.length,
    possible_causes: diagnosis.possible_causes.length,
    confirmed_cause_left_blank: diagnosis.session_summary.confirmed_cause === ""
  }, null, 2));
} else {
  console.log("LIVE_AI_GENERATION_SKIPPED (set RUN_LIVE_AI_GENERATION=1 to opt in; this makes a real provider request)");
}
