const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../answer-tools.js"), "utf8");
function setup(){
  const store = new Map();
  const localStorage = {
    getItem:key=>store.has(key)?store.get(key):null,
    setItem:(key,value)=>store.set(key,String(value)),
    removeItem:key=>store.delete(key)
  };
  const window = {localStorage};
  vm.runInNewContext(source,{window,Date,Math,JSON,String,Object,Array,Number,Map});
  return {api:window.MaintenanceAnswerTools,store};
}
const payload={machine:"pump",symptom:"low flow",code:"",observations:"recorded flow low",measurementStatus:"available",language:"en"};
const preliminary={answer:"Preliminary guidance",citations:[{id:"S1"}],diagnosis:{status:"preliminary_assessment",possible_causes:[]}};

test("answer cache is exact-query, local, and returns a stored preliminary answer",()=>{
  const {api,store}=setup();
  assert.equal(api.get(payload,1000),null);
  assert.equal(api.put(payload,preliminary,1000),true);
  const result=api.get(payload,1001);
  assert.equal(result.answer,preliminary.answer);
  assert.equal(result.citations.length,1);
  assert.equal(store.size,1);
  assert.equal(api.get({...payload,symptom:"no flow"},1001),null);
});

test("answer cache expires after 24 hours and never stores escalation or safety-triggered results",()=>{
  const {api,store}=setup();
  assert.equal(api.put(payload,preliminary,1000),true);
  assert.equal(api.get(payload,1000+api.CACHE_TTL_MS),null);
  assert.equal(api.put(payload,{...preliminary,diagnosis:{status:"escalation_required"}},2000),false);
  assert.equal(api.put(payload,{...preliminary,safety_gate:{trigger:"high_pressure_leak"}},2000),false);
  assert.equal(store.size,1);
});

test("answer cache can be cleared and tolerates malformed stored data",()=>{
  const {api,store}=setup();
  assert.equal(api.put(payload,preliminary,1000),true);
  assert.equal(api.clear(),true);
  assert.equal(api.get(payload,1001),null);
  store.set("maintenance-ai-toolkit-answer-cache-v1","{broken");
  assert.equal(api.get(payload,1001),null);
});

test("speech and cache helpers are exposed without requiring browser speech support",()=>{
  const {api}=setup();
  assert.equal(typeof api.stopSpeech,"function");
  assert.equal(typeof api.updateVisibility,"function");
  assert.equal(api.safeToCache(preliminary),true);
  assert.equal(api.safeToCache({answer:"x",diagnosis:{status:"escalation_required"}}),false);
});
