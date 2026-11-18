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
if (!page.body.includes('id="diagnosisForm"') ||
    !page.body.includes("agent-ui.js") ||
    !page.body.includes("diagnostic-chat.js") ||
    !page.body.includes("diagnostic-session-ui.js")) {
  throw new Error("Published app is missing the local diagnosis form or its runtime script references");
}
const [agentUi, diagnosticChat] = await Promise.all([
  get(new URL("./agent-ui.js", page.finalUrl)),
  get(new URL("./diagnostic-chat.js", page.finalUrl))
]);
if (agentUi.status !== 200 || !agentUi.body.includes("MaintenanceAgentUI") ||
    diagnosticChat.status !== 200 || !diagnosticChat.body.includes("MaintenanceLocalAssistantOrchestrator")) {
  throw new Error("Published local diagnostic-agent runtime scripts are missing or incomplete");
}
if (page.body.includes('id="aiEndpoint"')) {
  throw new Error("Published app unexpectedly exposes the retired cloud-AI endpoint control");
}
console.log(`PAGES_OK HTTP ${page.status} ${page.finalUrl} (local diagnosis UI)`);

console.log(`PAGES_OK HTTP ${page.status} ${page.finalUrl} (local diagnosis UI and runtime assets)`);
