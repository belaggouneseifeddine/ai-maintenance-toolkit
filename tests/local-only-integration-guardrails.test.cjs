const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Android local host cannot invoke the hosted AI endpoint through legacy UI", () => {
  const agentUi = fs.readFileSync("agent-ui.js", "utf8");
  const legacy = fs.readFileSync("app-legacy.js", "utf8");
  const localUi = fs.readFileSync("local-model-ui.js", "utf8");
  assert.match(agentUi, /if \(root\.MaintenanceNativeLLM\) return \{ ok:false, status:"cloud_disabled_in_local_android_host" \}/);
  assert.match(legacy, /if\s*\(window\.MaintenanceNativeLLM\) return;/);
  assert.match(localUi, /local-only-mode/);
  assert.match(localUi, /\["askCloudAI","simulateCloudAI","askAi","aiAnswerTools","aiResult"\]/);
});

test("incomplete safety checklist remains advisory and does not suppress diagnostic hypotheses", () => {
  const engine = fs.readFileSync("diagnostic-engine.js", "utf8");
  assert.match(engine, /const safetyReviewIncomplete = priority === "urgent" \|\| !checks\.length \|\| checks\.some/);
  assert.match(engine, /const localResult = analyse\(input\)/);
  assert.match(engine, /renderLocalReasoning\(input, rankedResult\)/);
  assert.match(engine, /Hypotheses remain visible/);
  assert.doesNotMatch(engine, /Hypotheses are hidden because priority is urgent/);
});
