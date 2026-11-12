const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../diagnostic-flows.js");
require("../bayesian-engine.js");
const engine = require("../diagnostic-session.js");

test("VFD trip session starts as an adaptive three-question workflow in Arabic, English, and French", () => {
  for (const language of ["ar", "en", "fr"]) {
    const session = engine.createSession({equipment:"vfd",symptom:"trip",language});
    assert.equal(session.ok,true);
    assert.equal(session.flowMode,undefined);
    assert.equal(session.status,"collecting_evidence");
    assert.equal(session.hypotheses.length,3);
    assert.ok(session.hypotheses.every(h => h.status === "unresolved"));
    assert.ok(session.nextQuestion.text.length > 0);
    const supplyChecks = session.hypotheses.find(h => h.id === "input_supply_or_dc_bus").checks[0];
    const localizedCheck = typeof supplyChecks === "string" ? supplyChecks : supplyChecks && supplyChecks[language];
    assert.equal(typeof localizedCheck,"string");
    assert.ok(localizedCheck.length > 0);
    assert.match(localizedCheck,language === "ar" ? /راجع/ : language === "fr" ? /Consultez/ : /Review/);
  }
});

test("VFD unverified trip code remains neutral and invalid answers do not mutate evidence", () => {
  const session=engine.createSession({equipment:"vfd",symptom:"trip",language:"en"});
  const before=session.hypotheses.map(h=>[h.id,h.score,h.status]);
  const invalid=engine.answer(session,"invented-trip-code");
  assert.equal(invalid.ok,false);
  assert.equal(invalid.code,"invalid_answer");
  assert.deepEqual(session.hypotheses.map(h=>[h.id,h.score,h.status]),before);
  const unknown=engine.answer(session,"unverified-code");
  assert.equal(unknown.ok,true);
  assert.deepEqual(unknown.session.evidence[0].evidence,[]);
  assert.ok(unknown.session.hypotheses.every(h=>h.status==="unresolved"));
  assert.ok(unknown.session.nextQuestion);
});

test("verified input-supply classification supports only the matching supply hypothesis", () => {
  const session=engine.createSession({equipment:"vfd",symptom:"trip",language:"en"});
  const result=engine.answer(session,"input-supply-category");
  assert.equal(result.ok,true);
  assert.equal(result.session.hypotheses[0].id,"input_supply_or_dc_bus");
  assert.ok(result.session.hypotheses[0].supportingEvidence.includes("input-supply-fault-indicated"));
});

test("VFD adaptive flow follows selected questions, records evidence, and never confirms a cause", () => {
  let session=engine.createSession({equipment:"vfd",symptom:"trip",language:"ar"});
  const answerByQuestion={
    vfd_fault_category:"motor-output-category",
    vfd_control_status:"control-status-normal",
    vfd_motor_load_indicators:"motor-overload-indicated"
  };
  for(let i=0;i<3;i++){
    const questionId=session.nextQuestion.id;
    const answerId=answerByQuestion[questionId];
    assert.ok(answerId,"unexpected or repeated question: "+questionId);
    const result=engine.answer(session,answerId);
    assert.equal(result.ok,true,questionId);
    session=result.session;
  }
  assert.equal(session.status,"evidence_review");
  assert.equal(session.nextQuestion,null);
  assert.equal(session.evidence.length,3);
  assert.equal(session.summary.confirmedCause,"");
  assert.equal(session.summary.requiresMoreEvidence,true);
  assert.ok(session.hypotheses.every(h=>h.reasoningModel==="qualitative_bn_v1"));
});

test("VFD flow contract exposes only its curated hypotheses and evidence identifiers",()=>{
  const contract=engine.getFlowContract("vfd|trip");
  assert.ok(contract);
  assert.deepEqual(contract.hypothesisIds.sort(),[
    "control_feedback_or_external_fault",
    "input_supply_or_dc_bus",
    "motor_cable_or_load"
  ].sort());
  assert.ok(contract.evidenceIds.includes("input-supply-fault-indicated"));
  assert.ok(contract.evidenceIds.includes("external-fault-active"));
  assert.ok(contract.evidenceIds.includes("motor-overload-indicated"));
});
