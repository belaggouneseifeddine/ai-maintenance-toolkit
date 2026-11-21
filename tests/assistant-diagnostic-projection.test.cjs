const test = require("node:test");
const assert = require("node:assert/strict");
const Session = require("../assistant-session-contract.js");
const Registry = require("../assistant-tool-registry.js");
const Orchestrator = require("../assistant-local-orchestrator.js");
const Projection = require("../assistant-diagnostic-projection.js");

function assistant() {
  const instance = Orchestrator.createLocalOrchestrator({ toolRegistry: Registry, tools: {} });
  instance.start({ sessionId: "projection-test-001" });
  return instance;
}

test("local assessment projection preserves source classes and provisional hypotheses", () => {
  const local = assistant();
  const result = Projection.syncLocalAssessment(local, {
    language: "en",
    equipment: { type: "centrifugal pump", manufacturer: "KSB", model: "Etanorm" },
    symptom: "low discharge pressure",
    observations: ["No abnormal noise reported"],
    measurements: [
      { name: "discharge pressure", value: 1.4, unit: "bar", sourceType: "direct_measurement" },
      { name: "motor load", value: 72, unit: "%", sourceType: "plc_value" },
      { name: "flow estimate", value: 8, unit: "m3/h", sourceType: "estimated" }
    ]
  }, {
    results: [
      { id: "suction-restriction", label: "Suction restriction", score: 0.42, support: ["low pressure"] }
    ],
    supportingDocuments: [
      { title: "Pump manual", page: 12, sourceRef: { documentId: "manual-ksb" } }
    ]
  });
  assert.equal(result.ok, true);
  const session = result.session;
  assert.equal(session.equipment.manufacturer, "KSB");
  assert.equal(session.symptoms[0].provenance, "user_reported");
  assert.equal(session.measurements[0].provenance, "measured");
  assert.equal(session.measurements[1].provenance, "measured");
  assert.equal(session.measurements[2].provenance, "unknown");
  assert.equal(session.evidence[0].provenance, "user_reported");
  assert.equal(session.hypotheses[0].provenance, "engine_inferred");
  assert.equal(session.hypotheses[0].status, "proposed");
  assert.equal(session.references[0].provenance, "document_claim");
  assert.equal(session.references[0].status, "retrieved_not_verified");
  assert.equal(Session.validateSession(session).ok, true);
});

test("guided answers, hypotheses and recommended checks map into the same session", () => {
  const local = assistant();
  const guided = { flowId: "pump|low_flow", hypotheses: [] };
  const payload = {
    diagnosticFlowId: "pump|low_flow",
    diagnosticFlowMode: "adaptive_hypothesis",
    diagnosticAnswers: [
      { questionId: "q-suction", answerId: "a-restricted", evidence: ["suction_restriction"] }
    ],
    diagnosticHypotheses: [
      {
        id: "suction_restriction", label: "Suction restriction", status: "supported",
        score: 0.6, supportingEvidence: ["suction_restriction"], checks: ["Inspect strainer differential pressure"]
      }
    ]
  };
  const first = Projection.syncGuidedSession(local, guided, payload);
  assert.equal(first.ok, true);
  assert.equal(first.session.evidence[0].provenance, "user_reported");
  assert.equal(first.session.hypotheses[0].provenance, "engine_inferred");
  assert.equal(first.session.hypotheses[0].status, "supported");
  assert.equal(first.session.tests[0].status, "recommended");
  assert.equal(first.session.tests[0].provenance, "engine_inferred");
  const revision = first.session.revision;
  const repeated = Projection.syncGuidedSession(local, guided, payload);
  assert.equal(repeated.session.evidence.length, 1);
  assert.equal(repeated.session.hypotheses.length, 1);
  assert.equal(repeated.session.tests.length, 1);
  assert.equal(repeated.session.revision, revision);
  assert.equal(Session.validateSession(repeated.session).ok, true);
});
