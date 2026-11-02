const test = require("node:test");
const assert = require("node:assert/strict");
require("../bayesian-engine.js");
const engine = require("../diagnostic-session.js");

test("curated flow starts with a question, not a ready-made diagnosis", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"ar"});
  assert.equal(s.ok,true);
  assert.equal(s.status,"collecting_evidence");
  assert.ok(s.nextQuestion.text);
  assert.equal(s.hypotheses.some(h=>h.status==="supported_by_current_evidence"),false);
  assert.equal(s.limitations.some(x=>x.includes("calibrated probability")),true);
});
test("unknown answer does not support or contradict a hypothesis", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow"});
  const r=engine.answer(s,"unknown");
  assert.equal(r.ok,true);
  assert.ok(r.session.hypotheses.every(h=>h.supportingEvidence.length===0&&h.contradictingEvidence.length===0));
});
test("new evidence updates hypothesis ranking and selects next question", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  const r=engine.answer(s,"source-low");
  assert.equal(r.ok,true);
  assert.equal(r.session.hypotheses[0].id,"supply_or_suction");
  assert.equal(r.session.nextQuestion.id,"flow_path_status");
});
test("session never claims a confirmed cause after all questions", () => {
  let s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  for (const answer of ["source-low","restriction-indicated","demand-changed"]) s=engine.answer(s,answer).session;
  assert.equal(s.status,"evidence_review");
  assert.equal(s.summary.confirmedCause,"");
  assert.equal(s.summary.requiresMoreEvidence,true);
});
test("unsupported equipment/symptom pair refuses to invent a flow", () => {
  const s=engine.createSession({equipment:"robot",symptom:"smoke"});
  assert.equal(s.ok,false);
  assert.equal(s.code,"flow_not_curated");
});
test("invalid answer does not mutate the session", () => {
  const s=engine.createSession({equipment:"motor",symptom:"not_start"});
  const r=engine.answer(s,"random-answer");
  assert.equal(r.ok,false);
  assert.equal(r.code,"invalid_answer");
  assert.deepEqual(s.answeredQuestionIds,[]);
});

test("adaptive selector chooses a question that separates remaining hypotheses", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  const r=engine.answer(s,"source-low");
  assert.equal(r.ok,true);
  // This fixture ties on the expected discrimination score, so the stable tie-break keeps flow_path_status.
  assert.equal(r.session.nextQuestion.id,"flow_path_status");
  assert.equal(r.session.answeredQuestionIds.includes(r.session.nextQuestion.id),false);
});
test("contradictory evidence remains visible and does not confirm a root cause", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  const first=engine.answer(s,"source-normal");
  assert.equal(first.ok,true);
  assert.ok(first.session.hypotheses.some(h=>h.status==="weakened_by_current_evidence"));
  assert.equal(first.session.summary,undefined);
});
test("missing evidence is not treated as normal evidence", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  const r=engine.answer(s,"unknown");
  assert.equal(r.ok,true);
  assert.ok(r.session.hypotheses.every(h=>h.supportingEvidence.length===0&&h.contradictingEvidence.length===0));
});

test("flow contract exposes only curated IDs and evidence options", () => {
  assert.equal(typeof engine.getFlowContract, "function");
  const pump = engine.getFlowContract("pump|low_flow");
  assert.deepEqual(pump.hypothesisIds.sort(), ["flow_path_restriction", "operating_condition", "supply_or_suction"].sort());
  assert.ok(pump.evidenceIds.includes("source-low"));
  assert.ok(!pump.evidenceIds.includes("trip-present"));
  assert.equal(engine.getFlowContract("pump|unknown"), null);
});

test("flow contract is a snapshot and does not expose mutable internal flow definitions", () => {
  const contract = engine.getFlowContract("motor|not_start");
  contract.hypothesisIds.push("invented");
  const again = engine.getFlowContract("motor|not_start");
  assert.ok(!again.hypothesisIds.includes("invented"));
});

test("interactive diagnostic sessions use Bayesian relative support ranking", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  const r=engine.answer(s,"source-low");
  assert.equal(r.ok,true);
  assert.equal(r.session.hypotheses[0].id,"supply_or_suction");
  assert.equal(r.session.hypotheses[0].reasoningModel,"qualitative_bn_v1");
  assert.ok(r.session.hypotheses[0].score > 0.2);
});

test("unknown interactive answers leave Bayesian ranking unchanged", () => {
  const s=engine.createSession({equipment:"pump",symptom:"low_flow",language:"en"});
  const baseline=s.hypotheses.map(h=>[h.id,h.score]);
  const r=engine.answer(s,"unknown");
  assert.equal(r.ok,true);
  assert.deepEqual(r.session.hypotheses.map(h=>[h.id,h.score]),baseline);
  assert.ok(r.session.hypotheses.every(h=>h.reasoningModel==="qualitative_bn_v1"));
});

test("multiple signals from one answer are grouped as one observation node", () => {
  const s=engine.createSession({equipment:"motor",symptom:"not_start",language:"en"});
  const r=engine.answer(s,"trip-present");
  assert.equal(r.ok,true);
  const protection=r.session.hypotheses.find(h=>h.id==="protection_or_drive_trip");
  const power=r.session.hypotheses.find(h=>h.id==="power_or_mechanical");
  assert.equal(protection.evidenceGroupsUsed,1);
  assert.equal(power.evidenceGroupsUsed,1);
  assert.equal(protection.score,power.score);
});


test("paint-furnace overheat flow is curated, localized, and starts with evidence collection", () => {
  assert.ok(engine.availableFlows.includes("furnace|overheat"));
  const s = engine.createSession({equipment:"furnace",symptom:"overheat",language:"en"});
  assert.equal(s.ok,true);
  assert.equal(s.status,"collecting_evidence");
  assert.equal(s.nextQuestion.id,"heating_state");
  assert.equal(s.hypotheses.length,3);
  assert.ok(s.hypotheses.every(h=>h.reasoningModel==="qualitative_bn_v1"));
  const fr = engine.createSession({equipment:"furnace",symptom:"overheat",language:"fr"});
  assert.match(fr.nextQuestion.text,/sortie de chauffe/i);
});

test("paint-furnace overheat session updates Bayesian relative support but never confirms cause", () => {
  let s = engine.createSession({equipment:"furnace",symptom:"overheat",language:"en"});
  let r = engine.answer(s,"heat-continues-after-stop");
  assert.equal(r.ok,true);
  s = r.session;
  assert.equal(s.hypotheses[0].id,"heater_output_stuck_on");
  assert.equal(s.hypotheses[0].reasoningModel,"qualitative_bn_v1");

  const answers = {
    zone_temperature_pattern:"zone-rises-above-setpoint",
    air_system_status:"airflow-status-normal"
  };
  while (s.nextQuestion) {
    const answerId = answers[s.nextQuestion.id];
    assert.ok(answerId, "unexpected follow-up question: " + s.nextQuestion.id);
    r = engine.answer(s,answerId);
    assert.equal(r.ok,true);
    s = r.session;
  }
  assert.equal(s.status,"evidence_review");
  assert.equal(s.summary.confirmedCause,"");
  assert.equal(s.summary.requiresMoreEvidence,true);
});

test("unknown furnace observations do not change relative support scores", () => {
  let s = engine.createSession({equipment:"furnace",symptom:"overheat",language:"ar"});
  const baseline = s.hypotheses.map(h=>[h.id,h.score]);
  for (const answerId of ["heater-state-unknown","zone-reading-unknown","air-status-unknown"]) {
    const r = engine.answer(s,answerId);
    assert.equal(r.ok,true);
    s = r.session;
  }
  assert.deepEqual(s.hypotheses.map(h=>[h.id,h.score]),baseline);
  assert.equal(s.summary.confirmedCause,"");
});

test("unsupported furnace symptoms do not invent a diagnostic flow", () => {
  const s = engine.createSession({equipment:"furnace",symptom:"vibration",language:"en"});
  assert.equal(s.ok,false);
  assert.equal(s.code,"flow_not_curated");
});
