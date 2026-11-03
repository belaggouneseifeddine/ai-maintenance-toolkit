const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../diagnostic-flows.js");
require("../bayesian-engine.js");
const engine = require("../diagnostic-session.js");
const ui = require("../diagnostic-session-ui.js");
const registry = global.MAINTENANCE_DIAGNOSTIC_FLOWS.flows;
const adaptiveKeys = new Set(["pump|low_flow", "motor|not_start"]);
const registryOnlyEntries = Object.entries(registry).filter(([key]) => !adaptiveKeys.has(key));

test("all shared registry keys start a guided session without replacing existing adaptive sessions", () => {
  assert.equal(Object.keys(registry).length, 11);
  for (const key of Object.keys(registry)) {
    const [equipment, symptom] = key.split("|");
    const session = engine.createSession({equipment, symptom, language:"ar"});
    assert.equal(session.ok, true, key);
    assert.equal(session.status, "collecting_evidence", key);
    assert.ok(session.nextQuestion, key);
    if (adaptiveKeys.has(key)) {
      assert.equal(session.flowMode, undefined, "existing adaptive session must remain unchanged: " + key);
      assert.ok(session.hypotheses.length > 0, key);
    } else {
      assert.equal(session.flowMode, "registry_single_step", key);
      assert.equal(session.nextQuestion.id, registry[key].question.id, key);
      assert.equal(session.hypotheses.length, 0, "single-step flow must not invent ranked hypotheses: " + key);
    }
  }
});

test("registry-only answers return curated guidance and never a confirmed cause", () => {
  assert.equal(registryOnlyEntries.length, 9);
  for (const [key, flow] of registryOnlyEntries) {
    const [equipment, symptom] = key.split("|");
    const session = engine.createSession({equipment, symptom, language:"ar"});
    const option = flow.answers[0];
    const result = engine.answer(session, option.id);
    assert.equal(result.ok, true, key);
    assert.equal(result.session.status, "evidence_review", key);
    assert.equal(result.session.nextQuestion, null, key);
    assert.equal(result.session.selectedAnswer.guidance, option.guidance, key);
    assert.equal(result.session.summary.confirmedCause, "", key);
    assert.deepEqual(result.session.evidence[0].evidence, [], "single-step guidance must not fabricate Bayesian evidence: " + key);
  }
});

test("unknown and invalid registry answers do not fabricate evidence or mutate sessions", () => {
  const session = engine.createSession({equipment:"bearing",symptom:"vibration",language:"ar"});
  const invalid = engine.answer(session, "not-a-curated-answer");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.code, "invalid_answer");
  assert.deepEqual(session.answeredQuestionIds, []);
  assert.deepEqual(session.evidence, []);
});

test("unreviewed registry wording is not shown as if translated into French or English", () => {
  for (const language of ["en", "fr"]) {
    const session = engine.createSession({equipment:"pneumatic",symptom:"low_flow",language});
    assert.equal(session.ok, false);
    assert.equal(session.code, "flow_translation_pending");
  }
});

test("all 11 equipment/symptom combinations are resolved from supported language aliases", () => {
  const cases = [
    ["centrifugal pump", "low flow", "pump|low_flow"],
    ["moteur", "ne démarre pas", "motor|not_start"],
    ["VFD", "trip", "vfd|trip"],
    ["compressor", "low pressure", "compressor|low_pressure"],
    ["صمام", "لا يستجيب", "valve|not_start"],
    ["pneumatic system", "low pressure", "pneumatic|low_flow"],
    ["gearbox", "overheat", "gearbox|overheat"],
    ["bearing", "vibration", "bearing|vibration"],
    ["PLC", "not starting", "plc|not_start"],
    ["conveyor", "belt tracking", "conveyor|tracking"],
    ["heat exchanger", "overheat", "thermal|overheat"]
  ];
  for (const [machine, symptom, expected] of cases) {
    assert.equal(ui.resolveInput(machine, symptom), expected, machine + " / " + symptom);
  }
});

test("existing adaptive pump and motor sessions remain available", () => {
  for (const input of [
    {equipment:"pump",symptom:"low_flow"},
    {equipment:"motor",symptom:"not_start"}
  ]) {
    const session = engine.createSession(input);
    assert.equal(session.ok, true);
    assert.equal(session.flowMode, undefined);
    assert.ok(session.hypotheses.length > 0);
    assert.ok(session.nextQuestion);
  }
});
