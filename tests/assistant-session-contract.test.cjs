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
  assert.deepEqual(migrated.hypotheses, old.activeHypotheses);
  assert.deepEqual(migrated.measurements, []);
  assert.equal(migrated.revision, 0);
  assert.equal(Session.validateSession(migrated).ok, true);
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
