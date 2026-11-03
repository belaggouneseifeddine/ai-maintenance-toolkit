const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../diagnostic-flows.js");
require("../bayesian-engine.js");
const engine = require("../diagnostic-session.js");

test("compressor low-pressure session starts as an adaptive three-question local workflow", () => {
  for (const language of ["ar", "en", "fr"]) {
    const session = engine.createSession({equipment:"compressor",symptom:"low_pressure",language});
    assert.equal(session.ok, true);
    assert.equal(session.flowMode, undefined);
    assert.equal(session.status, "collecting_evidence");
    assert.equal(session.nextQuestion.id, "compressor_pressure_comparison");
    assert.ok(session.nextQuestion.text.length > 0);
    assert.equal(session.hypotheses.length, 3);
    assert.ok(session.hypotheses.every(h => h.status === "unresolved"));
  }
});

test("compressor flow keeps unknown readings neutral and rejects invalid answers", () => {
  const session = engine.createSession({equipment:"compressor",symptom:"low_pressure",language:"en"});
  const baseline = session.hypotheses.map(h => [h.id,h.score,h.status]);
  const invalid = engine.answer(session,"invented-answer");
  assert.equal(invalid.ok,false);
  assert.equal(invalid.code,"invalid_answer");
  assert.deepEqual(session.hypotheses.map(h => [h.id,h.score,h.status]),baseline);

  const unknown = engine.answer(session,"unknown");
  assert.equal(unknown.ok,true);
  assert.equal(unknown.session.evidence.length,1);
  assert.deepEqual(unknown.session.evidence[0].evidence,[]);
  assert.ok(unknown.session.hypotheses.every(h => h.status === "unresolved"));
  assert.ok(unknown.session.nextQuestion);
  assert.ok(!unknown.session.answeredQuestionIds.includes(unknown.session.nextQuestion.id));
});

test("compressor outlet evidence distinguishes compressor-side from distribution-side hypotheses", () => {
  const session = engine.createSession({equipment:"compressor",symptom:"low_pressure",language:"en"});
  const result = engine.answer(session,"outlet-normal-point-low");
  assert.equal(result.ok,true);
  assert.equal(result.session.hypotheses[0].id,"distribution_leak_or_demand");
  assert.ok(result.session.hypotheses[0].supportingEvidence.includes("outlet-normal-point-low"));
  assert.ok(result.session.nextQuestion);
});

test("compressor multi-step session records evidence and never confirms a root cause", () => {
  let session = engine.createSession({equipment:"compressor",symptom:"low_pressure",language:"ar"});
  const answers = ["outlet-normal-point-low","loaded-no-trip","treatment-dp-high"];
  for (const answer of answers) {
    const result = engine.answer(session,answer);
    assert.equal(result.ok,true);
    session = result.session;
  }
  assert.equal(session.status,"evidence_review");
  assert.equal(session.nextQuestion,null);
  assert.equal(session.evidence.length,3);
  assert.equal(session.summary.confirmedCause,"");
  assert.equal(session.summary.requiresMoreEvidence,true);
  assert.ok(session.hypotheses.every(h => h.reasoningModel === "qualitative_bn_v1"));
  assert.ok(session.hypotheses.some(h => h.supportingEvidence.length > 0));
});

test("compressor flow contract exposes only curated hypotheses and evidence identifiers", () => {
  const contract = engine.getFlowContract("compressor|low_pressure");
  assert.ok(contract);
  assert.deepEqual(contract.hypothesisIds.sort(),[
    "air_treatment_restriction",
    "compressor_capacity_or_control",
    "distribution_leak_or_demand"
  ].sort());
  assert.ok(contract.evidenceIds.includes("compressor-outlet-low"));
  assert.ok(contract.evidenceIds.includes("treatment-dp-high"));
});
