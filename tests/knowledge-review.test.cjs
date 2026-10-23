const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const review = fs.readFileSync(require.resolve("../knowledge-review.js"), "utf8");
const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
const sw = fs.readFileSync(require.resolve("../sw.js"), "utf8");
const deploy = fs.readFileSync(require.resolve("../.github/workflows/deploy-pages.yml"), "utf8");

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
  assert.match(review, /لم يُنشر أي سجل/);
});
