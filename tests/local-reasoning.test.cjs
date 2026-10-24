const test = require("node:test");
const assert = require("node:assert/strict");
const { analyse } = require("../local-reasoning.js");

test("pump vibration returns exploratory hypotheses and a relevant follow-up", () => {
  const result = analyse({machine:"pump",symptom:"noise",language:"ar"});
  assert.ok(result.hypotheses.length >= 2);
  assert.match(result.hypotheses[0].status,/exploratory/);
  assert.ok(result.followup.question.length > 5);
  assert.ok(result.missing.length);
});

test("Grundfos Hydro EN reference is gated by explicit application context", () => {
  assert.equal(analyse({machine:"pump",symptom:"low_flow",observations:"low flow"}).source,null);
  const result = analyse({machine:"pump",symptom:"low_flow",manualRef:"Grundfos Hydro EN fire sprinkler"});
  assert.equal(result.source.section,"13 Fault finding");
  assert.equal(result.source.page,32);
  assert.match(result.source.status,/heading-index-only/);
});

test("engine does not apply pump hypotheses to unrelated equipment", () => {
  const result = analyse({machine:"conveyor",symptom:"noise",language:"en"});
  assert.equal(result.hypotheses.length,0);
  assert.equal(result.source,null);
});

test("follow-up advances after an answer is supplied", () => {
  const first=analyse({machine:"pump",symptom:"low_flow",language:"en"});
  const second=analyse({machine:"pump",symptom:"low_flow",followup:"suction pressure normal",language:"en"});
  assert.notEqual(first.followup.question,second.followup.question);
});

test("rendered output escapes user-supplied text", () => {
  const result=require("../local-reasoning.js").renderHTML({machine:"pump",symptom:"noise",observations:"<script>alert(1)</script>",language:"ar"});
  assert.equal(result.includes("<script>alert(1)</script>"),false);
  assert.match(result,/exploratory/i);
});
