const pageUrl = "https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/";
const knownWorkerBases = [
  "https://maintenance-ai-toolkit-api.maintenance-ai-toolkit-api-seif.workers.dev",
  "https://maintenance-ai-toolkit-api-seif.workers.dev"
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
