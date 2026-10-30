const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

const review = fs.readFileSync(require.resolve("../knowledge-review.js"), "utf8");
const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
const sw = fs.readFileSync(require.resolve("../sw.js"), "utf8");
const deploy = fs.readFileSync(require.resolve("../.github/workflows/deploy-pages.yml"), "utf8");
const runtimeMatch = deploy.match(/required_runtime_assets="([^"]+)"/);
assert.ok(runtimeMatch, "Pages deployment must declare runtime assets");
const deployedAssets = new Set(runtimeMatch[1].trim().split(" ").filter(Boolean));

test("local review queue is included in the app shell and Pages deployment", () => {
  assert.match(html, /id="knowledgeReviewCard"/);
  assert.match(html, /id="krRecord"/);
  assert.match(html, /id="krStatus"/);
  assert.match(html, /id="krExportOutput"/);
  assert.match(html, /src="\.\/knowledge-review\.js"/);
  assert.match(sw, /\.\/knowledge-review\.js/);
  assert.match(deploy, /navigation-redesign\.js knowledge-review\.js/);
});

test("knowledge candidate export is local and limited to reviewed records", () => {
  assert.match(review, /maintenance-ai-toolkit-knowledge-review-v1/);
  assert.match(review, /status==="reviewed_for_consideration"/);
  assert.match(review, /reviewer&&String\(v\.notes\|\|""\)\.trim\(\)\.length>=10/);
  assert.match(review, /reviewed_candidates_only_no_automatic_publication/);
  assert.doesNotMatch(review, /fetch\s*\(/);
});

test("reviewed status requires a reviewer and meaningful notes", () => {
  assert.match(review, /status==="reviewed_for_consideration"&&\(!reviewer\|\|notes\.length<10\)/);
  assert.match(review, /reviewed_candidates_only_no_automatic_publication/);
});


test("knowledge review module initializes without browser-side reference errors", () => {
  const document = { readyState: "loading", addEventListener() {} };
  assert.doesNotThrow(() => vm.runInNewContext(review, {
    document,
    window: {},
    console,
    Date,
    JSON,
    Math,
    String,
    Object,
    Array
  }, { filename: "knowledge-review.js" }));
});
