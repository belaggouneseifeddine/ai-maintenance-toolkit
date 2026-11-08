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

test("motor overheating adaptive flow ranks load, cooling and bearing/electrical hypotheses", () => {
  const s=engine.createSession({equipment:"motor",symptom:"overheat",language:"en"});
  assert.equal(s.ok,true);
  assert.equal(s.nextQuestion.id,"motor_heat_load");
  const r=engine.answer(s,"motor-load-high");
  assert.equal(r.ok,true);
  assert.equal(r.session.hypotheses[0].id,"motor_overload_or_application");
  assert.ok(r.session.nextQuestion);
  assert.equal(r.session.summary,undefined);
});

test("compressor overheating flow separates cooling, lubrication and operating conditions", () => {
  const s=engine.createSession({equipment:"compressor",symptom:"overheat",language:"fr"});
  assert.equal(s.ok,true);
  assert.equal(s.nextQuestion.id,"compressor_cooling");
  const r=engine.answer(s,"cooler-airflow-restricted");
  assert.equal(r.ok,true);
  assert.equal(r.session.hypotheses[0].id,"compressor_cooling_air_or_water");
});

test("bearing vibration flow distinguishes lubrication, mounting and bearing/external vibration", () => {
  const s=engine.createSession({equipment:"bearing",symptom:"vibration",language:"ar"});
  assert.equal(s.ok,true);
  assert.equal(s.nextQuestion.id,"bearing_lubrication");
  const r=engine.answer(s,"contamination-indicated");
  assert.equal(r.ok,true);
  assert.equal(r.session.hypotheses[0].id,"bearing_lubrication_or_contamination");
});

test("new adaptive flows preserve unknown evidence and never confirm a cause", () => {
  for (const [equipment,symptom] of [
    ["motor","overheat"],
    ["compressor","overheat"],
    ["bearing","vibration"]
  ]) {
    let session=engine.createSession({equipment,symptom,language:"en"});
    const baseline=session.hypotheses.map(h=>[h.id,h.score]);
    while (session.nextQuestion) {
      const unknown=session.nextQuestion.options.find(option=>option.id==="unknown");
      assert.ok(unknown, equipment+" / "+symptom+" must provide an explicit unknown option");
      const result=engine.answer(session,unknown.id);
      assert.equal(result.ok,true);
      session=result.session;
      assert.deepEqual(session.hypotheses.map(h=>[h.id,h.score]),baseline);
    }
    assert.equal(session.status,"evidence_review");
    assert.equal(session.summary.confirmedCause,"");
    assert.equal(session.summary.requiresMoreEvidence,true);
  }
});

test("new adaptive flow contracts expose bounded evidence identifiers", () => {
  for (const key of ["motor|overheat","compressor|overheat","bearing|vibration"]) {
    const contract=engine.getFlowContract(key);
    assert.ok(contract);
    assert.equal(contract.hypothesisIds.length,3);
    assert.ok(contract.evidenceIds.length>=8);
  }
});


test("adaptive hypotheses expose source mappings without promoting general references to model-verified evidence", () => {
  const supplement = require("../knowledge/faults-supplement.json");
  const registry = require("../diagnostic-evidence-register.json");
  const expected = [
    ["motor|overheat","motor_overload_or_application","supplement-motor-overheat-general","motor-overload-duty"],
    ["motor|overheat","motor_cooling_or_ventilation","supplement-motor-overheat-general","motor-cooling-restriction"],
    ["motor|overheat","motor_bearing_or_electrical","supplement-motor-overheat-general","motor-bearing-electrical"],
    ["compressor|overheat","compressor_cooling_air_or_water","supplement-compressor-overheat-general","compressor-cooling"],
    ["compressor|overheat","compressor_oil_or_lubrication","supplement-compressor-overheat-general","compressor-oil-filtration"],
    ["compressor|overheat","compressor_load_or_operating_environment","supplement-compressor-overheat-general","compressor-load-ambient"],
    ["bearing|vibration","bearing_lubrication_or_contamination","supplement-bearing-vibration-general","bearing-lubrication-contamination"],
    ["bearing|vibration","bearing_mounting_or_alignment","supplement-bearing-vibration-general","bearing-mounting-alignment"],
    ["bearing|vibration","bearing_damage_or_external_excitation","supplement-bearing-vibration-general","bearing-damage-transmitted"]
  ];
  for (const [flowId,hypothesisId,recordId,causeId] of expected) {
    const contract = engine.getFlowContract(flowId);
    const mapping = contract.hypothesisKnowledge.find(item => item.id === hypothesisId);
    const record = registry.records[recordId];
    const fault = supplement.faults.find(item => item.id === recordId);
    const cause = fault.causes.find(item => item.id === causeId);
    assert.ok(mapping, flowId + " / " + hypothesisId);
    assert.equal(mapping.knowledgeRecordId, recordId);
    assert.deepEqual(mapping.sourceRefs, cause.sourceRefs);
    assert.equal(record.status, "review-needed");
    assert.equal(record.scope.scopeType, "general-reference");
    assert.ok(mapping.sourceRefs.every(id => record.references.some(ref => ref.id === id)));
    assert.ok(record.references.filter(ref => mapping.sourceRefs.includes(ref.id)).every(ref => Array.isArray(ref.verifiedClaims) && ref.verifiedClaims.length === 0));
  }
});

test("adaptive evidence keeps stable IDs while returning localized labels for the UI", () => {
  const english = engine.createSession({equipment:"motor",symptom:"overheat",language:"en"});
  const enResult = engine.answer(english,"motor-load-high");
  const enHypothesis = enResult.session.hypotheses.find(item => item.id === "motor_overload_or_application");
  assert.ok(enHypothesis.supportingEvidence.includes("motor-load-high"));
  assert.ok(enHypothesis.supportingEvidenceLabels.includes("Load or current is above baseline"));

  const arabic = engine.createSession({equipment:"motor",symptom:"overheat",language:"ar"});
  const arResult = engine.answer(arabic,"motor-load-high");
  const arHypothesis = arResult.session.hypotheses.find(item => item.id === "motor_overload_or_application");
  assert.ok(arHypothesis.supportingEvidence.includes("motor-load-high"));
  assert.ok(arHypothesis.supportingEvidenceLabels.includes("الحمل أو التيار أعلى من خط الأساس"));
});

test("completed diagnostic-session summaries stay in the selected Arabic, French, or English language", () => {
  const cases = [
    { language: "ar", expected: "هذه فرضيات مرتبة حسب الأدلة المسجلة" },
    { language: "fr", expected: "Ces hypothèses sont classées selon les éléments enregistrés" },
    { language: "en", expected: "These are hypotheses ranked against recorded evidence" }
  ];
  for (const item of cases) {
    let session = engine.createSession({ equipment: "pump", symptom: "low_flow", language: item.language });
    for (const answer of ["source-low", "restriction-indicated", "demand-changed"]) {
      const result = engine.answer(session, answer);
      assert.equal(result.ok, true);
      session = result.session;
    }
    assert.equal(session.status, "evidence_review");
    assert.match(session.summary.message, new RegExp(item.expected));
    assert.equal(session.summary.confirmedCause, "");
    assert.equal(session.summary.requiresMoreEvidence, true);
  }
});
