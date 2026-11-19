const test=require("node:test");const assert=require("node:assert/strict");
const Contract=require("../diagnostic-evidence-contract.js");
test("canonical evidence envelope preserves measurement provenance and unknown state",()=>{
 const result=Contract.build({request:{measurements:[{name:"Suction pressure",value:2.1,unit:"bar",sourceType:"direct_measurement",qualityFlag:"good"}]},
 diagnosis:{matched:true,results:[{id:"cavitation",title:"Possible cavitation",score:9,causes:[]}],measurementEvidence:{usedForNumericThresholdDecision:false}}});
 assert.equal(result.evidence[0].provenance,"measured");assert.equal(result.evidence[0].state,"unknown");
 assert.equal(result.evidence[0].value,2.1);assert.equal(result.hypotheses[0].scoreMeaning,"heuristic_match_score_not_probability");
 assert.ok(result.limitations.includes("numeric_values_not_used_for_fault_threshold_decisions"));
 assert.equal(result.nextTest.method,"not_ranked");
});
test("document claims require exact document and one-based page anchors",()=>{
 const result=Contract.build({diagnosis:{supportingDocuments:[
  {documentTitle:"Manual",citation:"p. 4",text:"Claim",reviewStatus:"approved",eligibleForDiagnosis:true,sourceRef:{documentId:"doc-1",pageNumber:4}},
  {documentTitle:"No anchor",text:"Claim",reviewStatus:"approved",eligibleForDiagnosis:true}
 ]}});
 assert.equal(result.evidence.length,1);assert.equal(result.evidence[0].sourceRef.pageNumber,4);
 assert.equal(result.evidence[0].state,"unknown");assert.equal(result.evidence[0].eligibleForDiagnosis,true);
});
test("estimated or missing measurements never become confirmed support",()=>{
 const result=Contract.build({request:{measurements:[{name:"Flow",value:"unknown",unit:"m3/h",sourceType:"estimated"}]},diagnosis:{}});
 assert.equal(result.evidence[0].value,null);assert.equal(result.evidence[0].provenance,"unknown");assert.equal(result.evidence[0].state,"unknown");
});
