const test = require("node:test");
const assert = require("node:assert/strict");

require("../normalization.js");
const faults = require("../faults.json");
global.MAINTENANCE_FAULTS = faults;
require("../diagnostic-engine.js");

const engine = global.MaintenanceDiagnosticEngine;

test("local reasoning returns bounded exploratory pump hypotheses with reasons and safe checks", () => {
  const result = engine.analyse({ machine: "pump", symptom: "noise", observations: "", language: "en" }, { faults: [] });
  assert.equal(result.mode, "exploratory");
  assert.ok(result.hypotheses.length >= 1 && result.hypotheses.length <= 3);
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
  assert.ok(result.hypotheses.every(item => item.why && item.nextCheck));
  assert.equal(result.confirmedCause, "");
  assert.match(result.note, /not direct proof/i);
});

test("wrong equipment/symptom combinations do not receive unrelated hypotheses", () => {
  const result = engine.analyse({ machine: "motor", symptom: "low_flow", language: "en" }, { faults: [] });
  assert.equal(result.hypotheses.length, 0);
  assert.equal(result.mode, "insufficient");
});

test("local fault-library matches remain hypotheses and never become confirmed causes", () => {
  const result = engine.analyse({ machine: "pump", symptom: "noise", observations: "gravel noise and vibration", language: "en" }, faults);
  assert.ok(result.hypotheses.length > 0);
  assert.equal(result.confirmedCause, "");
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
});

test("manufacturer source is hidden unless exact family context is supplied", () => {
  const generic = engine.analyse({ machine: "pump", symptom: "low_flow", manualRef: "Grundfos Hydro EN", language: "en" }, { faults: [] });
  assert.equal(generic.references.some(item => item.id === "grundfos-hydro-en"), false);
  const matchedFamily = engine.analyse({ machine: "pump", symptom: "low_flow", manufacturer: "Grundfos", model: "Hydro EN", application: "firefighting system", language: "en" }, { faults: [] });
  const source = matchedFamily.references.find(item => item.id === "grundfos-hydro-en");
  assert.ok(source);
  assert.match(source.status, /heading-only-not-evidence/);
});

test("no probabilities, OEM limits, or unverified fault claims are generated", () => {
  const result = engine.analyse({ machine: "compressor", symptom: "low_pressure", language: "en" }, { faults: [] });
  assert.ok(result.hypotheses.length > 0);
  assert.ok(result.hypotheses.every(item => !/%/.test(JSON.stringify(item))));
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
});

test("exploratory library does not claim a source supports the cause", () => {
  const result = engine.analyse({ machine: "motor", symptom: "overheat", language: "en" }, { faults: [] });
  assert.ok(result.hypotheses.length > 0);
  assert.ok(result.hypotheses.every(item => item.basis === "symptom-pattern-not-source-verified"));
});

test("local knowledge retrieval returns relevant excerpts with source scope metadata", () => {
  const result = engine.analyse({ machine: "pump", symptom: "low_flow", observations: "suction pressure low", language: "en" }, { faults: [] });
  assert.ok(result.retrievedKnowledge.some(item => item.id === "kb-pump-low-flow"));
  assert.ok(result.retrievedKnowledge.every(item => item.sourceTitle && item.sourceUrl && item.sourceStatus));
  assert.ok(result.retrievedKnowledge.every(item => item.evidenceClass === "general-knowledge-note-not-OEM-verified"));
});


const localReasoning = require("../local-reasoning.js");

test("separate local reasoning hypotheses are exploratory and do not invent references", () => {
  const result = localReasoning.analyse({machine:"pump",symptom:"noise",language:"en"});
  assert.ok(result.hypotheses.length >= 2);
  assert.ok(result.hypotheses.every(item => item.status === "exploratory_hypothesis"));
  assert.ok(result.hypotheses.every(item => item.evidence.length === 0));
  assert.ok(result.hypotheses.every(item => item.supportStatus === "no_claim_specific_reference"));
});

test("evidence is linked by exact hypothesis and equipment IDs, not by text mentions", () => {
  const source={hypothesisId:"suction-condition",equipmentId:"pump",sourceId:"DOE-PUMP",title:"Pump sourcebook",url:"https://example.org/manual.pdf",status:"review_needed",section:"Troubleshooting"};
  const result=localReasoning.analyse({machine:"pump",symptom:"noise",observations:["Grundfos Hydro EN mentioned in a note"],evidence:[source,{...source,hypothesisId:"unrelated"},{...source,equipmentId:"motor"}],language:"en"});
  assert.equal(result.hypotheses.find(item=>item.id==="suction-condition").evidence.length,1);
  assert.equal(result.hypotheses.find(item=>item.id==="bearing-condition").evidence.length,0);
});

test("verified claim status requires explicit claim, section, exact scope and claim check", () => {
  const source={hypothesisId:"suction-condition",equipmentId:"pump",sourceId:"OEM-1",title:"OEM manual",url:"https://example.org/oem.pdf",status:"verified_claim",claim:"Check suction pressure",section:"Section 7",scopeMatch:true,claimChecked:true};
  const result=localReasoning.analyse({machine:"pump",symptom:"noise",evidence:[source]});
  assert.equal(result.hypotheses.find(item=>item.id==="suction-condition").evidence[0].status,"verified_claim");
  assert.equal(localReasoning.analyse({machine:"pump",symptom:"noise",evidence:[{...source,claimChecked:false}]}).hypotheses[0].evidence.length,0);
});

test("follow-up response changes guidance only through a recognized structured answer ID", () => {
  const first=localReasoning.analyse({machine:"pump",symptom:"low_flow",language:"en"});
  const low=localReasoning.analyse({machine:"pump",symptom:"low_flow",followupAnswerId:"low",language:"en"});
  const normal=localReasoning.analyse({machine:"pump",symptom:"low_flow",followupAnswerId:"normal",language:"en"});
  assert.equal(first.followup.selectedAnswerId,null);
  assert.match(low.followup.answerGuidance,/supply, strainer/i);
  assert.match(normal.followup.answerGuidance,/discharge pressure/i);
  assert.equal(low.followup.nextHypothesisId,"suction-or-source");
  assert.equal(normal.followup.nextHypothesisId,"flow-path");
});

test("unknown equipment and symptom do not borrow hypotheses from other equipment", () => {
  assert.equal(localReasoning.analyse({machine:"conveyor",symptom:"noise"}).hypotheses.length,0);
  assert.equal(localReasoning.analyse({machine:"pump",symptom:"unknown"}).hypotheses.length,0);
});

test("local reasoning HTML escapes user text and warns that hypotheses are not diagnoses", () => {
  const html=localReasoning.renderHTML({machine:"pump",symptom:"noise",observations:["<script>alert(1)</script>"],language:"en"});
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
  assert.match(html,/not a confirmed diagnosis/i);
});
