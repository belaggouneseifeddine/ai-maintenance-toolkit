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
