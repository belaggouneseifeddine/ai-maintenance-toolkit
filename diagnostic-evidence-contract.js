/* Canonical, provenance-preserving envelope for local diagnostic evidence and hypotheses. */
(function(root){
 "use strict";
 const VERSION="1.0.0";
 const PROVENANCE=new Set(["user_reported","measured","document_claim","case_history","engine_inferred","llm_suggested","unknown"]);
 const STATES=new Set(["supports","contradicts","unknown"]);
 const clean=(v,n)=>typeof v==="string"?v.trim().slice(0,n||240):"";
 const plain=v=>!!v&&typeof v==="object"&&!Array.isArray(v);
 function provenanceForMeasurement(item){
  if(item.provenance&&PROVENANCE.has(item.provenance))return item.provenance;
  if(item.sourceType==="direct_measurement")return "measured";
  if(item.sourceType==="user_reported")return "user_reported";
  if(item.sourceType==="plc_value"||item.sourceType==="historian_value")return "measured";
  if(item.sourceType==="estimated")return "unknown";
  return "unknown";
 }
 function normalizeMeasurement(item,index){
  const row=plain(item)?item:{};
  const value=typeof row.value==="number"&&Number.isFinite(row.value)?row.value:null;
  return {
   evidenceId:"measurement-"+(index+1),kind:"measurement",name:clean(row.name,120),
   value,unit:clean(row.unit,40),provenance:provenanceForMeasurement(row),
   state:STATES.has(row.state)?row.state:"unknown",
   sourceType:clean(row.sourceType,40)||"unknown",sensorStatus:clean(row.sensorStatus,40)||"unknown",
   qualityFlag:clean(row.qualityFlag,40)||"unknown",timestamp:clean(row.timestamp,60),
   operatingCondition:clean(row.operatingCondition,240),
   note:value===null?"No valid numeric value supplied.":"Numeric value retained; no fault threshold is inferred by this contract."
  };
 }
 function normalizeDocument(item,index){
  const row=plain(item)?item:{}, ref=plain(row.sourceRef)?row.sourceRef:{};
  if(!clean(ref.documentId,160)||!Number.isInteger(ref.pageNumber)||ref.pageNumber<1||!clean(row.text,1800))return null;
  return {
   evidenceId:"document-claim-"+(index+1),kind:"document_claim",provenance:"document_claim",
   state:STATES.has(row.state)?row.state:"unknown",text:clean(row.text,1800),
   documentTitle:clean(row.documentTitle,160),citation:clean(row.citation,240),
   reviewStatus:clean(row.reviewStatus,40)||"unknown",eligibleForDiagnosis:row.eligibleForDiagnosis===true,
   sourceRef:{documentId:clean(ref.documentId,160),pageNumber:ref.pageNumber,claimId:clean(ref.claimId,120)}
  };
 }
 function build(input){
  const data=plain(input)?input:{}, request=plain(data.request)?data.request:{};
  const diagnosis=plain(data.diagnosis)?data.diagnosis:{};
  const measurements=Array.isArray(request.measurements)?request.measurements.slice(0,20).map(normalizeMeasurement):[];
  const docs=Array.isArray(diagnosis.supportingDocuments)?diagnosis.supportingDocuments.slice(0,5).map(normalizeDocument).filter(Boolean):[];
  const hypotheses=Array.isArray(diagnosis.results)?diagnosis.results.slice(0,20).filter(plain).map((item,index)=>({
   hypothesisId:clean(item.id,120)||"candidate-"+(index+1),
   title:clean(item.title,240),rank:index+1,
   score:typeof item.score==="number"&&Number.isFinite(item.score)?item.score:null,
   scoreMeaning:"heuristic_match_score_not_probability",
   relativeSupportScore:typeof item.relativeSupportScore==="number"&&Number.isFinite(item.relativeSupportScore)?item.relativeSupportScore:null,
   supportScoreMeaning:item.relativeSupportScore==null?"not_supplied":"uncalibrated_relative_support_not_probability",
   causes:Array.isArray(item.causes)?item.causes.slice(0,8).filter(plain).map(c=>({id:clean(c.id,120),label:clean(c.label,240),matchedKeywords:Array.isArray(c.matchedKeywords)?c.matchedKeywords.slice(0,8).map(x=>clean(x,80)):[]})):[],
   sourceRefs:Array.isArray(item.sourceRefs)?item.sourceRefs.slice(0,8).map(x=>clean(x,160)).filter(Boolean):[]
  })):[],
  limitations=[];
  if(diagnosis.measurementEvidence&&diagnosis.measurementEvidence.usedForNumericThresholdDecision===false)
   limitations.push("numeric_values_not_used_for_fault_threshold_decisions");
  if(hypotheses.some(h=>h.supportScoreMeaning==="uncalibrated_relative_support_not_probability"))
   limitations.push("relative_support_scores_are_not_calibrated_probabilities");
  if(!docs.length)limitations.push("no_eligible_page_claims_attached");
  return {schemaVersion:VERSION,engineStatus:diagnosis.matched===true?"candidates_found":"no_sufficient_match",
   evidence:[...measurements,...docs],hypotheses,limitations,
   nextTest:{method:"not_ranked",reason:"No source-verified outcome distributions were supplied in this result."}};
 }
 const api=Object.freeze({version:VERSION,build});
 root.MaintenanceDiagnosticEvidenceContract=api;
 if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
