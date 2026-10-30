const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const workflow = fs.readFileSync(path.join(__dirname, "..", ".github/workflows/deploy-pages.yml"), "utf8");
const match = workflow.match(/required_runtime_assets="([^"]+)"/);
assert.ok(match, "GitHub Pages workflow must declare required runtime assets");
const assets = new Set(match[1].trim().split(" ").filter(Boolean));

test("every local JavaScript entrypoint referenced by index.html is included in GitHub Pages artifact", () => {
  const scripts = html.split('<script src="./').slice(1).map(item => item.split('"')[0]);
  assert.ok(scripts.length > 0, "index.html must have local script entrypoints");
  for (const script of scripts) {
    assert.ok(assets.has(script), "GitHub Pages artifact is missing script " + script);
  }
});

test("every declared runtime asset exists in the repository", () => {
  for (const asset of assets) {
    assert.ok(fs.existsSync(path.join(__dirname, "..", asset)), "missing runtime asset " + asset);
  }
});

test("Bayesian and interactive diagnostic session scripts are deployed", () => {
  for (const asset of ["bayesian-engine.js", "diagnostic-session.js", "diagnostic-session-ui.js"]) {
    assert.ok(assets.has(asset), "GitHub Pages artifact must include " + asset);
  }
});
