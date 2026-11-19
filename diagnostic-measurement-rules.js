/* Source-gated numeric evidence evaluation. No unit conversion or generic thresholds. */
(function(root){
 "use strict";
 const normalize=v=>String(v==null?"":v).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
 const validSource=rule=>rule&&rule.reviewStatus==="approved"&&rule.sourceStatus==="verified"&&
  rule.sourcePageVerified===true&&rule.sourceRef&&typeof rule.sourceRef.documentId==="string"&&
  rule.sourceRef.documentId.trim()&&Number.isInteger(rule.sourceRef.pageNumber)&&rule.sourceRef.pageNumber>0;
 function matches(value,operator,threshold,upper){
  if(operator==="lt")return value<threshold;
  if(operator==="lte")return value<=threshold;
  if(operator==="gt")return value>threshold;
  if(operator==="gte")return value>=threshold;
  if(operator==="between")return Number.isFinite(upper)&&value>=threshold&&value<=upper;
  return null;
 }
 function evaluateFault(fault,measurements,context){
  const rules=Array.isArray(fault&&fault.measurementRules)?fault.measurementRules.slice(0,20):[];
  const rows=Array.isArray(measurements)?measurements:[];
  const evaluations=rules.map(rule=>{
   const base={ruleId:String(rule&&rule.id||""),measurementName:String(rule&&rule.measurementName||""),
    sourceRef:rule&&rule.sourceRef?{documentId:String(rule.sourceRef.documentId||""),pageNumber:rule.sourceRef.pageNumber}:null};
   if(!validSource(rule))return {...base,state:"unknown",reason:"source_not_reviewed_and_verified"};
   if(typeof rule.measurementName!=="string"||!rule.measurementName.trim()||typeof rule.unit!=="string"||!rule.unit.trim()||
    typeof rule.operatingCondition!=="string"||!rule.operatingCondition.trim()||
    typeof rule.modelScope!=="string"||!rule.modelScope.trim()||
    !["lt","lte","gt","gte","between"].includes(rule.operator)||!Number.isFinite(rule.threshold)||
    (rule.operator==="between"&&(!Number.isFinite(rule.upperThreshold)||rule.upperThreshold<rule.threshold)))
    return {...base,state:"unknown",reason:"measurement_rule_schema_invalid"};
   if(normalize(rule.modelScope)!==normalize(context&&context.model))
    return {...base,state:"unknown",reason:"model_scope_mismatch"};
   const candidates=rows.filter(row=>normalize(row&&row.name)===normalize(rule.measurementName));
   if(!candidates.length)return {...base,state:"unknown",reason:"measurement_missing"};
   if(candidates.length!==1)return {...base,state:"unknown",reason:"multiple_matching_measurements"};
   const row=candidates[0];
   if(normalize(row.unit)!==normalize(rule.unit))return {...base,state:"unknown",reason:"unit_mismatch"};
   if(row.sourceType!=="direct_measurement")return {...base,state:"unknown",reason:"measurement_not_direct"};
   if(typeof row.timestamp!=="string"||!Number.isFinite(Date.parse(row.timestamp)))
    return {...base,state:"unknown",reason:"measurement_timestamp_missing_or_invalid"};
   if(!["healthy","ok"].includes(String(row.sensorStatus||"").toLowerCase())||row.qualityFlag!=="good")
    return {...base,state:"unknown",reason:"measurement_quality_not_accepted"};
   if(normalize(row.operatingCondition)!==normalize(rule.operatingCondition))
    return {...base,state:"unknown",reason:"operating_condition_mismatch"};
   if(typeof row.value!=="number"||!Number.isFinite(row.value))
    return {...base,state:"unknown",reason:"numeric_value_missing"};
   const match=matches(row.value,rule.operator,rule.threshold,rule.upperThreshold);
   if(match===null)return {...base,state:"unknown",reason:"unsupported_operator"};
   return {...base,state:match?"supports":"contradicts",reason:match?"verified_rule_condition_met":"verified_rule_condition_not_met",
    value:row.value,unit:row.unit,operator:rule.operator,threshold:rule.threshold,
    upperThreshold:Number.isFinite(rule.upperThreshold)?rule.upperThreshold:null};
  });
  return {
   evaluations,
   supporting:evaluations.filter(item=>item.state==="supports"),
   contradicting:evaluations.filter(item=>item.state==="contradicts"),
   unknown:evaluations.filter(item=>item.state==="unknown"),
   usedForRanking:evaluations.some(item=>item.state==="supports"||item.state==="contradicts")
  };
 }
 const api=Object.freeze({version:"1.0.0",evaluateFault});
 root.MaintenanceMeasurementRuleEngine=api;
 if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
