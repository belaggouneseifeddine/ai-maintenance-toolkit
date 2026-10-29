const test = require("node:test");
const assert = require("node:assert/strict");
const ui = require("../agent-ui.js");

test("local UI explicitly states that data was not sent", () => {
  const result = ui.formatResult({
    ok: true,
    status: "preliminary_assessment",
    route: "local_diagnostic",
    data: { diagnosis: { matched: false, message: "No sufficient match", reason: "Need observations", results: [] } }
  }, "en");
  assert.match(result, /no data was sent to an external server/i);
  assert.match(result, /no sufficient match/i);
});

test("safety escalation takes precedence and preserves LOTO warning", () => {
  const result = ui.formatResult({
    ok: true,
    status: "escalation_required",
    route: "safety_review",
    data: { nextAction: "Follow isolation and LOTO." }
  }, "en");
  assert.match(result, /Stop and escalate/i);
  assert.match(result, /LOTO/i);
});

test("local match scores are never presented as probabilities or confirmed causes", () => {
  const result = ui.formatResult({
    ok: true,
    status: "preliminary_assessment",
    route: "local_diagnostic",
    data: { diagnosis: { matched: true, results: [{ title: { en: "Possible suction issue" }, confidenceLabel: "Low", rankingReason: "Matching symptom", causes: [], safeChecks: [], escalation: "" }] } }
  }, "en");
  assert.match(result, /not a probability/i);
  assert.match(result, /not confirmed/i);
});

test("failed or invalid agent results render a bounded generic message", () => {
  const result = ui.formatResult({ ok: false, errors: [{ code: "invalid_request" }] }, "ar");
  assert.match(result, /تعذّر إجراء التقييم المحلي/);
  assert.doesNotMatch(result, /token|secret|https?:/i);
});


test("local diagnosis loads the bundled fault library without sending form data", async () => {
  const previous = {
    document: global.document,
    fetch: global.fetch,
    MaintenanceI18n: global.MaintenanceI18n,
    MaintenanceAIAgentCore: global.MaintenanceAIAgentCore,
    MaintenanceEngineeringCore: global.MaintenanceEngineeringCore,
    MaintenanceDiagnosticEngine: global.MaintenanceDiagnosticEngine,
    MAINTENANCE_FAULTS: global.MAINTENANCE_FAULTS
  };
  const elements = {
    aiResult: { hidden: true, textContent: "" },
    runLocalAgent: { disabled: false, textContent: "", addEventListener() {} },
    aiMachine: { value: "pump" },
    aiSymptom: { value: "low_flow" },
    aiCode: { value: "" },
    aiObservations: { value: "" }
  };
  let requestedUrl = "";
  let requestedOptions;
  let receivedLibrary;
  try {
    global.document = {
      documentElement: { lang: "en" },
      getElementById: id => elements[id] || null
    };
    global.MaintenanceI18n = { getLanguage: () => "en" };
    global.MaintenanceEngineeringCore = {};
    global.MaintenanceDiagnosticEngine = {};
    global.MAINTENANCE_FAULTS = undefined;
    global.fetch = async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return { ok: true, json: async () => ({ faults: [] }) };
    };
    global.MaintenanceAIAgentCore = {
      createAgentCore: options => {
        receivedLibrary = options.faultLibrary;
        return { run: async () => ({
          ok: true, status: "preliminary_assessment", route: "local_diagnostic",
          data: { diagnosis: { matched: false, message: "No sufficient match", results: [] } }
        }) };
      }
    };
    await ui.runLocal();
    assert.equal(requestedUrl, "./faults.json");
    assert.equal(requestedOptions.method, "GET");
    assert.equal(requestedOptions.credentials, "same-origin");
    assert.deepEqual(receivedLibrary, { faults: [] });
    assert.match(elements.aiResult.textContent, /no data was sent to an external server/i);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  }
});


test("OpenAI cloud diagnosis sends only after explicit per-request consent and clears consent afterward", async () => {
  const previous = {
    document: global.document,
    fetch: global.fetch,
    MaintenanceI18n: global.MaintenanceI18n
  };
  const elements = {
    aiResult: { hidden: true, textContent: "" },
    askOpenAI: { disabled: false, textContent: "" },
    aiCloudConsent: { checked: true },
    aiMachine: { value: "centrifugal pump" },
    aiSymptom: { value: "abnormal vibration and low flow" },
    aiCode: { value: "E-12" },
    aiObservations: { value: "Vibration reading already recorded: 6 mm/s" },
    aiMeasurementStatus: { value: "available" }
  };
  let requestUrl = "";
  let requestOptions;
  try {
    global.document = {
      documentElement: { lang: "en" },
      getElementById: id => elements[id] || null
    };
    global.MaintenanceI18n = { getLanguage: () => "en" };
    global.fetch = async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          answer: "SAFETY GATE\\nFollow site LOTO procedures.",
          provider: "openai",
          model: "gpt-4.1-mini",
          citations: [{ id: "S1", source: "knowledge/example.md", section: "Pump checks", startLine: 10, endLine: 14 }]
        })
      };
    };
    await ui.runOpenAI();
    assert.equal(requestUrl, "https://maintenance-ai-toolkit-api.maintenance-ai-toolkit-api-seif.workers.dev/api/chat");
    assert.equal(requestOptions.method, "POST");
    assert.equal(requestOptions.headers["Content-Type"], "application/json");
    const body = JSON.parse(requestOptions.body);
    assert.equal(body.machine, "centrifugal pump");
    assert.equal(body.symptom, "abnormal vibration and low flow");
    assert.equal(body.code, "E-12");
    assert.equal(body.measurementStatus, "available");
    assert.match(elements.aiResult.textContent, /OpenAI-assisted preliminary assessment/);
    assert.match(elements.aiResult.textContent, /knowledge\\/example.md/);
    assert.equal(elements.aiCloudConsent.checked, false);
    assert.equal(elements.askOpenAI.disabled, false);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  }
});

test("OpenAI cloud diagnosis does not send a request without consent", async () => {
  const previous = {
    document: global.document,
    fetch: global.fetch,
    MaintenanceI18n: global.MaintenanceI18n
  };
  const elements = {
    aiResult: { hidden: true, textContent: "" },
    askOpenAI: { disabled: false, textContent: "" },
    aiCloudConsent: { checked: false },
    aiMachine: { value: "pump" },
    aiSymptom: { value: "low flow" }
  };
  let calls = 0;
  try {
    global.document = { documentElement: { lang: "en" }, getElementById: id => elements[id] || null };
    global.MaintenanceI18n = { getLanguage: () => "en" };
    global.fetch = async () => { calls++; throw new Error("must not be called"); };
    await ui.runOpenAI();
    assert.equal(calls, 0);
    assert.match(elements.aiResult.textContent, /Consent is required/i);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  }
});
