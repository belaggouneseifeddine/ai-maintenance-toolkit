const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");
const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
test("single diagnostic chat exposes optional local Qwen import and load controls",()=>{
 const html=read("index.html"),chat=read("diagnostic-chat.js");
 for(const id of ["diagnosticChatImportModel","diagnosticChatLoadModel","diagnosticChatLocalModelStatus"])assert.ok(chat.includes(id));
 assert.ok(chat.includes("MaintenanceNativeLLM.pickModel"));
 assert.ok(chat.includes("localRuntime.loadModel"));
 assert.ok(chat.includes("state.modelAvailable"));
 assert.ok(read("android-local-host/app/src/main/java/com/maintenanceaitoolkit/localhost/MainActivity.kt").includes("modelAvailable"));
 assert.ok(chat.includes("MaintenanceLocalModelAgent.createLocalModelAgent"));
 assert.ok(html.indexOf('src="./native-local-llm-bridge.js"')<html.indexOf('src="./diagnostic-chat.js"'));
 assert.ok(html.indexOf('src="./assistant-model-agent.js"')<html.indexOf('src="./diagnostic-chat.js"'));
});
test("Qwen path uses the existing local orchestrator and does not call a hosted provider",()=>{
 const chat=read("diagnostic-chat.js");
 assert.match(chat,/orchestrator:localAssistant/);
 assert.match(chat,/localModelAgent\.runTurn\(\{message:value\}\)/);
 assert.match(chat,/No hosted provider was used/);
});
test("deployment and offline cache include the runtime modules used by the chat",()=>{
 const sw=read("sw.js"),pages=read(".github/workflows/deploy-pages.yml"),cf=read(".github/workflows/deploy-cloudflare-pages.yml");
 for(const file of ["local-llm-runtime.js","native-local-llm-bridge.js","assistant-model-agent.js","diagnostic-evidence-contract.js","diagnostic-measurement-rules.js"]){
  assert.ok(sw.includes('"./'+file+'"'),"service worker missing "+file);
  assert.ok(pages.includes(file),"Pages artifact missing "+file);
  assert.ok(cf.includes(file),"Cloudflare artifact missing "+file);
 }
});
