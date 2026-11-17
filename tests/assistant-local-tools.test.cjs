const test = require("node:test");
const assert = require("node:assert/strict");
const LocalTools = require("../assistant-local-tools.js");
const Registry = require("../assistant-tool-registry.js");

test("diagnostic tool is blocked by deterministic safety review before execution", async () => {
  let executed = 0;
  const tools = LocalTools.createLocalTools({
    engineeringCore: {
      routeRequest: () => ({ ok: true, decision: { route: "safety_review", safetyReviewRequired: true } }),
      executeLocalDiagnosis: () => { executed++; return { ok: true }; }
    },
    diagnosticEngine: { diagnose() {} },
    faultLibrary: { faults: [] }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const result = await registry.call("diagnose", {
    request: { intent: "diagnose", language: "ar", equipment: { type: "pump" }, symptom: "leak" }
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.error, "safety_review_required");
  assert.equal(executed, 0);
});

test("diagnostic tool invokes only the injected local engine after safety passes", async () => {
  let loaded = 0;
  let diagnosed = 0;
  const tools = LocalTools.createLocalTools({
    engineeringCore: {
      routeRequest: () => ({ ok: true, decision: { route: "local_diagnostic", safetyReviewRequired: false } }),
      executeLocalDiagnosis: (request, engine, library) => {
        diagnosed++;
        assert.equal(request.consent.sendToAI, false);
        assert.equal(library.faults.length, 1);
        return { ok: true, diagnosis: engine.diagnose(request) };
      }
    },
    diagnosticEngine: { diagnose: () => "local-only" },
    loadFaultLibrary: async () => { loaded++; return { faults: [{}] }; }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const result = await registry.call("diagnose", {
    request: { intent: "diagnose", language: "ar", equipment: { type: "pump" }, symptom: "low flow", observations: [] }
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.diagnosis, "local-only");
  assert.equal(loaded, 1);
  assert.equal(diagnosed, 1);
});

test("document search delegates only to the reviewed local retrieval adapter", async () => {
  let received = "";
  const tools = LocalTools.createLocalTools({
    documentRetrieval: {
      forDiagnostics: async query => {
        received = query;
        return { ok: true, status: "approved_claims_retrieved", results: [{ citation: "p. 12" }] };
      }
    }
  });
  const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
  const result = await registry.call("searchReviewedDocuments", { query: "pump cavitation" });
  assert.equal(received, "pump cavitation");
  assert.equal(result.data.results[0].citation, "p. 12");
  assert.equal((await registry.call("searchReviewedDocuments", { query: " " })).status, "invalid_input");
});

test("maintenance history tool reads only validated local records and filters by equipment", async () => {
  const previousStorage = global.localStorage;
  const data = [{
    date: "2026-11-16", machine: "Pump P-101 KSB", fault: "Low flow",
    action: "Cleaned suction strainer", status: "Repaired"
  }, {
    date: "2026-11-14", machine: "Pump P-102 Grundfos", fault: "Leak",
    action: "Seal inspection", status: "In progress"
  }, {
    date: "2026-11-15", machine: "Motor M-22", fault: "High temperature",
    action: "Checked cooling fan", status: "In progress"
  }, {
    date: 7, machine: "invalid", fault: "invalid", action: "invalid", status: "invalid"
  }];
  global.localStorage = { getItem: key => key === "maintenance-ai-toolkit-records-v1" ? JSON.stringify(data) : null };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools, safetyGate: tools.safetyGate });
    const result = await registry.call("getMaintenanceHistory", {
      equipment: { type: "pump", manufacturer: "KSB" }, limit: 5
    });
    assert.equal(result.ok, true);
    assert.equal(result.data.count, 1);
    assert.equal(result.data.records[0].machine, "Pump P-101 KSB");
    assert.equal(result.data.records[0].fault, "Low flow");
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test("maintenance history tool returns a bounded recent list and fails safely on malformed storage", async () => {
  const previousStorage = global.localStorage;
  try {
    global.localStorage = { getItem: () => JSON.stringify(Array.from({ length: 25 }, (_, i) => ({
      date: "2026-11-" + String(i + 1).padStart(2, "0"),
      machine: "Pump " + i, fault: "Low flow", action: "Inspection", status: "In progress"
    }))) };
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("getMaintenanceHistory", { limit: 20 });
    assert.equal(result.data.count, 20);
    assert.equal(result.data.records.length, 20);
    global.localStorage = { getItem: () => "{bad json" };
    const malformed = await registry.call("getMaintenanceHistory", {});
    assert.equal(malformed.ok, true);
    assert.equal(malformed.data.status, "local_record_read_failed");
    assert.deepEqual(malformed.data.records, []);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test("preventive-maintenance tool reads local plans and calculates monthly due dates without inventing intervals", async () => {
  const previousStorage = global.localStorage;
  global.localStorage = {
    getItem: key => key === "maintenance-ai-toolkit-pm-v1" ? JSON.stringify([
      { machine: "Pump P-101", task: "Inspect seal", last: "2024-01-31", repeat: "monthly", days: null, notes: "OEM plan" },
      { machine: "مضخة P-202", task: "فحص الختم", last: "2026-11-01", repeat: "days", days: 30, notes: "" },
      { machine: "Motor M-22", task: "Check cooling fan", last: "2026-11-01", repeat: "days", days: 14, notes: "" },
      { machine: "Unknown", task: "No interval", last: "2026-11-01", repeat: "days", days: 0 }
    ]) : null
  };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("getPreventiveMaintenanceSchedule", { query: "pump", limit: 10 });
    assert.equal(result.ok, true);
    assert.equal(result.data.count, 2);
    assert.equal(result.data.tasks[0].dueDate, "2024-02-29");
    assert.equal(result.data.tasks[1].machine, "مضخة P-202");
    assert.equal(result.data.tasks[0].status, "overdue");
    assert.equal(result.data.tasks[0].repeat, "monthly");
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test("preventive-maintenance tool marks invalid plans rather than assigning a default interval", async () => {
  const previousStorage = global.localStorage;
  global.localStorage = {
    getItem: () => JSON.stringify([
      { machine: "Pump P-101", task: "Inspect", last: "2026-11-01", repeat: "days", days: 0 }
    ])
  };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("getPreventiveMaintenanceSchedule", {});
    assert.equal(result.data.tasks[0].status, "invalid_schedule");
    assert.equal(result.data.tasks[0].dueDate, "");
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});


test("shift handover tool builds a local draft from matching records and due PM tasks without persisting", async () => {
  const previousStorage = global.localStorage;
  const now = new Date();
  const date = value => value.getFullYear() + "-" + String(value.getMonth() + 1).padStart(2, "0") + "-" + String(value.getDate()).padStart(2, "0");
  const today = date(now);
  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterday = date(yesterdayDate);
  const data = {
    "maintenance-ai-toolkit-records-v1": [
      { date: today, machine: "Pump P-101", fault: "Low flow", action: "Inspected strainer", status: "In progress" },
      { date: yesterday, machine: "Motor M-1", fault: "Noise", action: "Inspection pending", status: "In progress" }
    ],
    "maintenance-ai-toolkit-pm-v1": [
      { machine: "Pump P-101", task: "Inspect seal", last: yesterday, repeat: "days", days: 1, notes: "Site plan" },
      { machine: "Motor M-1", task: "Check bearing", last: today, repeat: "monthly", days: null }
    ]
  };
  const writes = [];
  global.localStorage = {
    getItem: key => Object.prototype.hasOwnProperty.call(data, key) ? JSON.stringify(data[key]) : null,
    setItem: (...args) => writes.push(args)
  };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("createShiftHandoverDraft", { period: "today", note: "handover" });
    assert.equal(result.ok, true);
    assert.equal(result.data.status, "draft_created");
    assert.equal(result.data.persisted, false);
    assert.equal(result.data.recordCount, 1);
    assert.equal(result.data.records[0].machine, "Pump P-101");
    assert.equal(result.data.pmDue.length, 1);
    assert.equal(result.data.pmDue[0].status, "due_today");
    assert.equal(result.data.note, "handover");
    assert.deepEqual(writes, []);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test("shift handover tool validates custom date ranges and never fabricates a report", async () => {
  const previousStorage = global.localStorage;
  global.localStorage = { getItem: () => "[]" };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("createShiftHandoverDraft", {
      period: "custom", from: "2026-11-20", to: "2026-11-19"
    });
    assert.equal(result.ok, true);
    assert.equal(result.data.ok, false);
    assert.equal(result.data.status, "invalid_date_range");
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});

test("shift handover tool fails closed when local maintenance storage is malformed", async () => {
  const previousStorage = global.localStorage;
  global.localStorage = { getItem: key => key === "maintenance-ai-toolkit-records-v1" ? "{bad json" : "[]" };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("createShiftHandoverDraft", { period: "today" });
    assert.equal(result.ok, true);
    assert.equal(result.data.ok, false);
    assert.equal(result.data.status, "local_record_read_failed");
    assert.deepEqual(result.data.records, []);
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
  }
});


test("safety checklist tool reads user-entered checkbox state without granting safety clearance", async () => {
  const previousDocument = global.document;
  global.document = {
    querySelector: selector => selector === "#safetyChecks" ? {
      querySelectorAll: () => [
        { textContent: "Energy isolated", querySelector: () => ({ checked: true }) },
        { textContent: "Zero energy verified", querySelector: () => ({ checked: false }) }
      ]
    } : null
  };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("getSafetyChecklistStatus", {});
    assert.equal(result.ok, true);
    assert.equal(result.data.ok, true);
    assert.equal(result.data.checkedCount, 1);
    assert.equal(result.data.total, 2);
    assert.equal(result.data.status, "items_remaining");
    assert.equal(result.data.safetyClearance, false);
    assert.equal(result.data.items[1].checked, false);
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});

test("safety checklist tool never turns all checked boxes into authorization to work", async () => {
  const previousDocument = global.document;
  global.document = {
    querySelector: () => ({
      querySelectorAll: () => [
        { textContent: "Stop machine", querySelector: () => ({ checked: true }) },
        { textContent: "Apply LOTO", querySelector: () => ({ checked: true }) }
      ]
    })
  };
  try {
    const tools = LocalTools.createLocalTools();
    const registry = Registry.createToolRegistry({ tools: tools.tools });
    const result = await registry.call("getSafetyChecklistStatus", {});
    assert.equal(result.data.allChecked, true);
    assert.equal(result.data.safetyClearance, false);
    assert.match(result.data.limitation, /does not authorize work/);
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});
