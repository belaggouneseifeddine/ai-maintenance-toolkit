const test=require("node:test"); const assert=require("node:assert/strict");
const Runtime=require("../local-llm-runtime.js");
test("runtime refuses hosted or ambiguous execution modes",async()=>{
 const runtime=Runtime.createLocalLlmRuntime({bridge:{getCapabilities:async()=>({executionMode:"cloud",localOnly:false})}});
 assert.equal((await runtime.getCapabilities()).available,false);
});
test("runtime validates messages and requires a loaded local model",async()=>{
 const bridge={getCapabilities:async()=>({executionMode:"local",localOnly:true,supportedOperations:["status","load","generate"]}),
 getStatus:async()=>({modelLoaded:false}),loadModel:async()=>({ok:true,executionMode:"local"})};
 const runtime=Runtime.createLocalLlmRuntime({bridge});
 await assert.rejects(()=>runtime.generate({messages:[{role:"user",content:"hello"}]}),/local_model_not_loaded/);
 await assert.rejects(()=>runtime.generate({messages:[{role:"system",content:""}]}),/invalid_message/);
});
test("runtime sends bounded requests only to a local bridge",async()=>{
 let request;
 const bridge={getCapabilities:async()=>({executionMode:"local",localOnly:true}),
 getStatus:async()=>({modelLoaded:true,modelId:"qwen-local"}),generate:async value=>(request=value,{executionMode:"local",text:"{}"})};
 const runtime=Runtime.createLocalLlmRuntime({bridge});
 const result=await runtime.generate({messages:[{role:"user",content:"hello"}],maxOutputTokens:9999});
 assert.equal(result.executionMode,"local"); assert.equal(request.maxOutputTokens,768);
});
