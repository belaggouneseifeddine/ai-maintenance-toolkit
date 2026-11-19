const test=require("node:test");const assert=require("node:assert/strict");
const Adapter=require("../document-retrieval-adapter.js");
test("diagnostic PDF retrieval preserves exact document, PDF page, printed page and review metadata",async()=>{
 const previous=global.MaintenanceDocumentLibrary;let received=null;
 global.MaintenanceDocumentLibrary={retrieve:async(query,options)=>{
  received={query,options};
  return [{text:"PACO VL/VLS troubleshooting claim",documentTitle:"PACO VL/VLS Manual",citation:"PACO VL/VLS Manual, p. 15",
   sourceRef:{documentId:"doc-paco",pageNumber:15,printedPageNumber:"15",chunkId:"doc-paco:p15:c0"},
   evidenceRole:"approved-page-claim",reviewStatus:"approved",rightsStatus:"user-responsibility",eligibleForDiagnosis:true,evidenceClass:"oem_manual",retrievalMethods:["bm25","semantic"]}];
 }};
 try{
  const result=await Adapter.forDiagnostics("insufficient flow",{equipment:"centrifugal pump",model:"PACO VL"});
  assert.equal(received.query,"insufficient flow");assert.equal(received.options.context.model,"PACO VL");
  assert.equal(result.status,"approved_claims_retrieved");
  assert.equal(result.results[0].sourceRef.documentId,"doc-paco");
  assert.equal(result.results[0].sourceRef.pageNumber,15);
  assert.equal(result.results[0].sourceRef.printedPageNumber,"15");
  assert.equal(result.results[0].reviewStatus,"approved");
  assert.equal(result.results[0].eligibleForDiagnosis,true);
  assert.deepEqual(result.results[0].retrievalMethods,["bm25","semantic"]);
 }finally{if(previous===undefined)delete global.MaintenanceDocumentLibrary;else global.MaintenanceDocumentLibrary=previous;}
});
test("empty PDF search query returns no arbitrary document claims",async()=>{
 const result=await Adapter.forDiagnostics("   ");
 assert.equal(result.status,"empty_query");assert.deepEqual(result.results,[]);
});
test("retrieval failure is explicit and does not fabricate citations",async()=>{
 const previous=global.MaintenanceDocumentLibrary;
 global.MaintenanceDocumentLibrary={retrieve:async()=>{throw Error("offline");}};
 try{const result=await Adapter.forDiagnostics("pump seal");assert.equal(result.ok,false);assert.equal(result.status,"retrieval_failed");assert.deepEqual(result.results,[]);}
 finally{if(previous===undefined)delete global.MaintenanceDocumentLibrary;else global.MaintenanceDocumentLibrary=previous;}
});
