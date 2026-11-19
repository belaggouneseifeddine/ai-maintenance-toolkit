const test=require("node:test");const assert=require("node:assert/strict");
const Engine=require("../diagnostic-measurement-rules.js");
const rule={id:"suction-low",measurementName:"Suction pressure",unit:"bar",operator:"lt",threshold:1.2,operatingCondition:"steady state",modelScope:"Pump-X",
 reviewStatus:"approved",sourceStatus:"verified",sourcePageVerified:true,sourceRef:{documentId:"manual-1",pageNumber:18}};
const reading=(overrides={})=>({name:"Suction pressure",value:0.9,unit:"bar",sourceType:"direct_measurement",sensorStatus:"healthy",qualityFlag:"good",timestamp:"2026-11-19T10:00:00Z",operatingCondition:"steady state",...overrides});
test("verified source-backed numeric rule supports only a direct, quality-accepted, context-matched reading",()=>{
 const result=Engine.evaluateFault({measurementRules:[rule]},[reading()],{model:"Pump-X"});
 assert.equal(result.usedForRanking,true);assert.equal(result.supporting.length,1);assert.equal(result.contradicting.length,0);
});
test("value outside the verified fault condition is explicit contradiction, not exclusion",()=>{
 const result=Engine.evaluateFault({measurementRules:[rule]},[reading({value:2.1})],{model:"Pump-X"});
 assert.equal(result.contradicting.length,1);assert.equal(result.evaluations[0].state,"contradicts");
});
test("unreviewed, wrong-unit, estimated, stale-quality or wrong-context readings remain unknown",()=>{
 const cases=[
  [ {...rule,reviewStatus:"candidate"}, reading(), "source_not_reviewed_and_verified" ],
  [ rule, reading({unit:"kPa"}), "unit_mismatch" ],
  [ rule, reading({sourceType:"estimated"}), "measurement_not_direct" ],
  [ rule, reading({qualityFlag:"stale"}), "measurement_quality_not_accepted" ],
  [ rule, reading({operatingCondition:"startup"}), "operating_condition_mismatch" ],
  [ rule, reading({timestamp:""}), "measurement_timestamp_missing_or_invalid" ],
  [ {...rule,modelScope:"Pump-Y"}, reading(), "model_scope_mismatch" ]
 ];
 for(const [r,m,reason] of cases){const result=Engine.evaluateFault({measurementRules:[r]},[m],{model:r.modelScope==="Pump-Y"?"Pump-X":"Pump-X"});assert.equal(result.unknown[0].reason,reason);}
});
test("missing measurements and unverified source pages never influence ranking",()=>{
 const missing=Engine.evaluateFault({measurementRules:[rule]},[],{model:"Pump-X"});
 assert.equal(missing.usedForRanking,false);assert.equal(missing.unknown[0].reason,"measurement_missing");
 const unverified=Engine.evaluateFault({measurementRules:[{...rule,sourcePageVerified:false}]},[reading()],{});
 assert.equal(unverified.usedForRanking,false);
});
