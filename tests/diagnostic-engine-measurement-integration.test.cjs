const test=require("node:test");const assert=require("node:assert/strict");
require("../diagnostic-measurement-rules.js");
require("../diagnostic-engine.js");
const Engine=global.MaintenanceDiagnosticEngine;
const verifiedRule={id:"suction-low",measurementName:"Suction pressure",unit:"bar",operator:"lt",threshold:1.2,operatingCondition:"steady state",
 reviewStatus:"approved",sourceStatus:"verified",sourcePageVerified:true,sourceRef:{documentId:"manual-1",pageNumber:18}};
function library(withRule){return {faults:[
 {id:"fault-a",equipmentType:"pump",symptoms:["low_flow"],title:{en:"Candidate A"},keywords:{},causes:[],measurementRules:withRule?[verifiedRule]:[]},
 {id:"fault-b",equipmentType:"pump",symptoms:["low_flow"],title:{en:"Candidate B"},keywords:{},causes:[]}
]};}
const input=value=>({equipmentType:"pump",symptom:"low_flow",language:"en",measurements:[
 {name:"Suction pressure",value,unit:"bar",sourceType:"direct_measurement",sensorStatus:"healthy",qualityFlag:"good",operatingCondition:"steady state",timestamp:"2026-11-19T10:00:00Z"}
]});
test("verified measurement evidence breaks otherwise equal diagnostic candidate scores",()=>{
 const low=Engine.diagnose(input(0.9),library(true));
 assert.equal(low.results[0].id,"fault-a");
 assert.equal(low.measurementEvidence.usedForNumericThresholdDecision,true);
 assert.equal(low.results[0].measurementRuleEvidence.supporting.length,1);
 const normal=Engine.diagnose(input(2.1),library(true));
 assert.equal(normal.results[0].id,"fault-b");
 assert.equal(normal.results.find(x=>x.id==="fault-a").measurementRuleEvidence.contradicting.length,1);
});
test("no reviewed measurement rule means numeric values do not change the ranking",()=>{
 const low=Engine.diagnose(input(0.9),library(false));
 const high=Engine.diagnose(input(2.1),library(false));
 assert.deepEqual(low.results.map(x=>x.id),high.results.map(x=>x.id));
 assert.equal(low.measurementEvidence.usedForNumericThresholdDecision,false);
});
