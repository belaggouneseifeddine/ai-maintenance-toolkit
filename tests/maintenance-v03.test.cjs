const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../maintenance-v03.js"), "utf8");

test("maintenance-v03.js parses as valid JavaScript", () => {
  assert.doesNotThrow(() => new vm.Script(source, { filename: "maintenance-v03.js" }));
});
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const inlineScripts = scripts.filter(match => !/\bsrc\s*=/i.test(match[1]) && match[2].trim());
test("inline JavaScript in index.html parses", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\\S]*?)<\/script>/gi)];
  const inlineScripts = scripts.filter(match => !/\bsrc\s*=/i.test(match[1]) && !/type\s*=\s*["']application\/ld\\+json["']/i.test(match[1]) && match[2].trim());
  assert.ok(inlineScripts.length > 0, "no inline scripts found in index.html");
  inlineScripts.forEach((match, index) => {
    assert.doesNotThrow(() => new vm.Script(match[2], { filename: "index.html inline script " + (index + 1) }));
  });
});

test("actual monthly due-date function clamps month-end dates", () => {
  const match = source.match(/function due\(t\)\{[\s\S]*?\}\nfunction renderPM/);
  assert.ok(match, "could not locate the actual due() implementation");
  const actualFunction = match[0].replace(/\nfunction renderPM$/, "");
  const runDue = new vm.Script(actualFunction + "; due({repeat:'monthly', last: INPUT})");
  const due = input => runDue.runInNewContext({ INPUT: input });
  assert.equal(due("2026-01-31"), "2026-02-28");
  assert.equal(due("2024-01-31"), "2024-02-29");
  assert.equal(due("2026-12-31"), "2027-01-31");
  assert.equal(due("2026-02-31"), "");
  assert.equal(due(""), "");
});
