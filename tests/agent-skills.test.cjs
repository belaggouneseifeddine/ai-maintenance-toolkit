const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const skills = [
  { dir: "maintenance-rag-retrieval", required: ["provenance", "source", "lexical", "relevance"] },
  { dir: "maintenance-agent-orchestration", required: ["safety", "deterministic", "retrieval", "hypothesis"] },
  { dir: "maintenance-evaluation", required: ["regression", "citation", "safety", "uncertainty"] },
  { dir: "maintenance-safety-grounding", required: ["lockout", "hypothesis", "unknown", "escalate"] }
];

test("adapted maintenance skills have valid frontmatter and matching names", () => {
  for (const skill of skills) {
    const file = path.join(root, "agent-skills", skill.dir, "SKILL.md");
    assert.ok(fs.existsSync(file), "missing skill file: " + skill.dir);
    const text = fs.readFileSync(file, "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    assert.ok(match, "missing YAML frontmatter: " + skill.dir);
    assert.match(match[1], new RegExp("^name:\\s*" + skill.dir + "\\s*$", "m"));
    assert.match(match[1], /^description:\s*\S/m);
    assert.match(text, /^# .+/m, "missing title: " + skill.dir);
    assert.match(text, /^## .+/m, "missing sections: " + skill.dir);
    const lower = text.toLocaleLowerCase();
    for (const term of skill.required) {
      assert.ok(lower.includes(term), skill.dir + " is missing required concept: " + term);
    }
  }
});

test("retrieval skill does not claim semantic/vector search is already implemented", () => {
  const text = fs.readFileSync(path.join(root, "agent-skills/maintenance-rag-retrieval/SKILL.md"), "utf8");
  assert.match(text, /Do not describe the current retrieval as embedding\/vector\/semantic search unless that capability has been implemented and verified/i);
});

test("safety-grounding skill forbids bypassing protective systems", () => {
  const text = fs.readFileSync(path.join(root, "agent-skills/maintenance-safety-grounding/SKILL.md"), "utf8");
  assert.match(text, /Never advise bypassing guards, emergency stops, interlocks/i);
  assert.match(text, /Do not invent voltage, pressure, temperature/i);
});
