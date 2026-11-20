const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("candidate knowledge is excluded from both production static-site artifacts", () => {
  const pages = fs.readFileSync(".github/workflows/deploy-pages.yml", "utf8");
  const cloudflare = fs.readFileSync(".github/workflows/deploy-cloudflare-pages.yml", "utf8");
  for (const [name, workflow] of [["GitHub Pages", pages], ["Cloudflare Pages", cloudflare]]) {
    assert.match(workflow, /rsync -a --exclude=['"]candidates\//, name + " must exclude candidate knowledge");
    assert.doesNotMatch(workflow, /cp -R knowledge _site\//, name + " must not copy the entire knowledge tree");
  }
});
