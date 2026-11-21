const test = require("node:test");
const assert = require("node:assert/strict");
const Session = require("../assistant-session-contract.js");
const Orchestrator = require("../assistant-local-orchestrator.js");
const Registry = require("../assistant-tool-registry.js");

function legacySession() {
  return {
    schemaVersion: "1.0.0",
    sessionId: "legacy-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    language: "ar",
    status: "active",
    equipment: { type: "pump", manufacturer: "Acme", model: "P-10", assetId: "" },
    messages: [{ messageId: "m-1", role: "user", content: "low flow", createdAt: "2026-01-01T00:00:00.000Z" }],
    facts: [],
    toolEvents: [],
    activeHypotheses: [{ id: "h-1", label: "suction issue" }],
    safetyState: { status: "not_assessed", unresolvedHazards: [] }
  };
}

test("new sessions expose the unified diagnostic state contract", () => {
  const session = Session.createSession({ sessionId: "new-1", language: "ar" });
  for (const key of ["operatingContext", "symptoms", "measurements", "evidence", "hypotheses", "tests", "references"]) {
    assert.ok(Array.isArray(session[key]) || (key === "operatingContext" && typeof session[key] === "object"));
  }
  assert.equal(session.revision, 0);
  assert.equal(session.repairOutcome, null);
  assert.equal(Session.validateSession(session).ok, true);
});

test("v1.0 sessions migrate without dropping conversation, facts or hypotheses", () => {
  const old = legacySession();
  const migrated = Session.migrateSession(old);
  assert.equal(migrated.schemaVersion, "1.1.0");
  assert.equal(migrated.messages[0].content, "low flow");
  assert.equal(migrated.equipment.model, "P-10");
  assert.equal(migrated.hypotheses.length, 1);
  assert.equal(migrated.hypotheses[0].id, "h-1");
  assert.equal(migrated.hypotheses[0].provenance, "unknown");
  assert.deepEqual(migrated.measurements, []);
  assert.equal(migrated.revision, 0);
  assert.equal(Session.validateSession(migrated).ok, true, JSON.stringify(Session.validateSession(migrated)));
  assert.equal(old.schemaVersion, "1.0.0");
});

test("orchestrator restores a legacy session through migration", () => {
  const assistant = Orchestrator.createLocalOrchestrator({ toolRegistry: Registry, tools: {} });
  const restored = assistant.restore(legacySession());
  assert.equal(restored.schemaVersion, "1.1.0");
  assert.equal(restored.messages.length, 1);
  assert.equal(restored.hypotheses.length, 1);
});

test("migration rejects unsupported versions and oversized collections", () => {
  assert.throws(() => Session.migrateSession({ schemaVersion: "9.0.0" }), /unsupported_schema_version/);
  const bad = legacySession();
  bad.schemaVersion = "1.1.0";
  bad.measurements = Array(301).fill({});
  assert.throws(() => Session.migrateSession(bad), /session_collection_limit_reached/);
});

test("validation rejects malformed unified diagnostic collections", () => {
  const session = Session.createSession({ sessionId: "bad-1" });
  session.measurements = {};
  assert.equal(Session.validateSession(session).ok, false);
});

test("diagnostic records require provenance but allow reviewed model records to be promoted", () => {
  const session = Session.createSession({ sessionId: "records-1" });
  const first = Session.appendDiagnosticRecord(session, "measurements", {
    id: "suction-pressure-1", value: 1.8, unit: "bar", provenance: "measured"
  });
  assert.equal(first.measurements.length, 1);
  assert.equal(first.revision, 1);
  assert.equal(session.measurements.length, 0);
  assert.throws(() => Session.appendDiagnosticRecord(first, "measurements", {
    id: "suction-pressure-1", value: 1.8, unit: "bar", provenance: "measured"
  }), /duplicate_diagnostic_record_id/);
  const promoted = Session.appendDiagnosticRecord(first, "hypotheses", {
    id: "model-cause", label: "possible restriction", provenance: "llm_suggested",
    status: "confirmed", review: { method: "technician_review", note: "corroborated by field test" }
  });
  assert.equal(promoted.hypotheses[0].status, "confirmed");
  assert.equal(promoted.hypotheses[0].provenance, "llm_suggested");
  assert.throws(() => Session.appendDiagnosticRecord(first, "hypotheses", {
    id: "unreviewed-model-cause", label: "unverified", provenance: "llm_suggested", status: "confirmed"
  }), /model_suggestion_requires_review_record/);
  assert.throws(() => Session.appendDiagnosticRecord(first, "evidence", {
    id: "missing-provenance"
  }), /invalid_diagnostic_record_provenance/);
});

test("operating context updates are immutable and revisioned", () => {
  const session = Session.createSession({ sessionId: "context-1" });
  const next = Session.updateOperatingContext(session, { duty: "continuous", load: "75%" });
  assert.equal(next.operatingContext.duty, "continuous");
  assert.equal(next.revision, 1);
  assert.deepEqual(session.operatingContext, {});
  assert.throws(() => Session.updateOperatingContext(next, []), /invalid_operating_context_patch/);
});

test("orchestrator routes diagnostic records and operating context through the session contract", () => {
  const assistant = Orchestrator.createLocalOrchestrator({ toolRegistry: Registry, tools: {} });
  assistant.start({ sessionId: "orchestrated-state-1" });
  const withContext = assistant.updateOperatingContext({ duty: "continuous", speedRpm: 1480 });
  assert.equal(withContext.operatingContext.speedRpm, 1480);
  const withMeasurement = assistant.addDiagnosticRecord("measurements", {
    id: "discharge-pressure", value: 2.4, unit: "bar", provenance: "measured"
  });
  assert.equal(withMeasurement.measurements[0].value, 2.4);
  assert.equal(withMeasurement.revision, 2);
});

test("equipment updates are immutable and increment the shared revision", () => {
  const session = Session.createSession({ sessionId: "equipment-contract-1" });
  const next = Session.updateEquipment(session, { type: "pump", manufacturer: "KSB" });
  assert.equal(next.equipment.type, "pump");
  assert.equal(next.equipment.manufacturer, "KSB");
  assert.equal(next.revision, 1);
  assert.equal(session.equipment.type, "");
  assert.throws(() => Session.updateEquipment(next, { serialNumber: "not-allowed" }), /invalid_equipment_context_field/);
});

test("restored diagnostic collections reject missing provenance and duplicate record ids", () => {
  const session = Session.createSession({ sessionId: "record-validation-1" });
  session.measurements = [
    { id: "pressure-1", value: 2.1, unit: "bar" }
  ];
  assert.equal(Session.validateSession(session).ok, false);
  session.measurements = [
    { id: "pressure-1", value: 2.1, unit: "bar", provenance: "measured" },
    { id: "pressure-1", value: 2.2, unit: "bar", provenance: "measured" }
  ];
  assert.equal(Session.validateSession(session).ok, false);
  session.measurements = [
    { id: "pressure-1", value: 2.1, unit: "bar", provenance: "measured" }
  ];
  assert.equal(Session.validateSession(session).ok, true);
});

test("hypothesis upsert keeps stable identity and records prior assessment history", () => {
  const session = Session.createSession({ sessionId: "hypothesis-upsert-1" });
  const first = Session.upsertDiagnosticRecord(session, "hypotheses", {
    id: "hypothesis-low-flow", label: "restriction", score: 0.35,
    status: "proposed", provenance: "engine_inferred"
  });
  const second = Session.upsertDiagnosticRecord(first, "hypotheses", {
    id: "hypothesis-low-flow", label: "restriction", score: 0.62,
    status: "proposed", provenance: "engine_inferred"
  });
  assert.equal(second.hypotheses.length, 1);
  assert.equal(second.hypotheses[0].score, 0.62);
  assert.equal(second.hypotheses[0].history.length, 1);
  assert.equal(second.hypotheses[0].history[0].score, 0.35);
  assert.equal(Session.validateSession(second).ok, true);
});

test("hypothesis upsert does not downgrade a reviewed confirmation", () => {
  const session = Session.createSession({ sessionId: "hypothesis-review-preservation-1" });
  const reviewed = Session.upsertDiagnosticRecord(session, "hypotheses", {
    id: "hypothesis-confirmed", label: "verified cause", score: 0.9,
    status: "confirmed", provenance: "llm_suggested",
    review: { method: "technician_review", note: "confirmed by independent field measurement" }
  });
  const refreshed = Session.upsertDiagnosticRecord(reviewed, "hypotheses", {
    id: "hypothesis-confirmed", label: "verified cause", score: 0.95,
    status: "proposed", provenance: "engine_inferred"
  });
  assert.equal(refreshed.hypotheses[0].status, "confirmed");
  assert.equal(refreshed.hypotheses[0].provenance, "llm_suggested");
  assert.equal(refreshed.hypotheses[0].review.method, "technician_review");
  assert.equal(refreshed.hypotheses[0].history[0].status, "confirmed");
  assert.equal(Session.validateSession(refreshed).ok, true);
});
