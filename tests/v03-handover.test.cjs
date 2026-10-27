const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");

const read = (path) => readFileSync(path, "utf8");
const html = read("index.html");
const worker = read("sw.js");
const deploy = read(".github/workflows/deploy-pages.yml");
const v03 = read("maintenance-v03.js");
const tree = JSON.parse(read("decision-trees.json"));

test("v0.3 handover and PM module is wired into the current main UI", () => {
  assert.match(html, /<script src="\.\/maintenance-v03\.js"><\/script>/);
  assert.match(html, /id="v03"/);
  assert.match(v03, /تقرير تسليم النوبة/);
  assert.match(v03, /الصيانة الوقائية/);
  assert.match(v03, /إحصاءات الصيانة/);
});

test("v0.3 static assets are included in offline cache and GitHub Pages artifact", () => {
  for (const asset of ["maintenance-v03.js", "maintenance-v03.css", "decision-trees.json"]) {
    assert.ok(worker.includes(`"./${asset}"`), `Service worker cache is missing ${asset}`);
    assert.ok(deploy.includes(asset), `GitHub Pages artifact is missing ${asset}`);
  }
});

test("handover, PM records, and photos stay local to the browser", () => {
  assert.match(v03, /localStorage/);
  assert.match(v03, /indexedDB\.open/);
  assert.match(v03, /maintenance-ai-toolkit-records-v1/);
  assert.match(v03, /maintenance-ai-toolkit-pm-v1/);
  assert.match(v03, /maintenance-ai-toolkit-photos-v1/);
});

test("pump decision tree is structurally valid and has safe terminal guidance", () => {
  assert.equal(tree.schemaVersion, 1);
  assert.ok(tree.start && tree.nodes && tree.nodes[tree.start], "Start node must exist");

  for (const [id, node] of Object.entries(tree.nodes)) {
    if (node.result === true) {
      assert.ok(node.title, `Terminal node ${id} needs a title`);
      assert.ok(node.cause, `Terminal node ${id} needs a cause statement`);
      assert.ok(node.safe, `Terminal node ${id} needs safe guidance`);
      assert.ok(node.escalate, `Terminal node ${id} needs escalation guidance`);
      continue;
    }

    assert.ok(node.q, `Question node ${id} needs a question`);
    assert.ok(Array.isArray(node.answers) && node.answers.length > 0, `Question node ${id} needs answers`);
    for (const answer of node.answers) {
      assert.ok(answer.label, `Answer in ${id} needs a label`);
      assert.ok(tree.nodes[answer.next], `Answer in ${id} points to missing node ${answer.next}`);
    }
  }

  const visited = new Set();
  const pending = [tree.start];
  while (pending.length) {
    const id = pending.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    const node = tree.nodes[id];
    if (node && node.result !== true) {
      for (const answer of node.answers) pending.push(answer.next);
    }
  }
  assert.equal(visited.size, Object.keys(tree.nodes).length, "Every decision-tree node must be reachable from the start");
});
