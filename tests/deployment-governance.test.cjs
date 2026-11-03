const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const productionWorkflows = [
  ".github/workflows/deploy-cloudflare-pages.yml",
  ".github/workflows/deploy-pages.yml",
  ".github/workflows/deploy-worker.yml"
];

test("production deployment workflows are manual-only", () => {
  for (const relativePath of productionWorkflows) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    const triggerStart = source.indexOf("\non:");
    const permissionsStart = source.indexOf("\npermissions:", triggerStart);
    assert.ok(triggerStart >= 0 && permissionsStart > triggerStart, relativePath + " must have a readable trigger block");
    const triggerBlock = source.slice(triggerStart + 1, permissionsStart);
    assert.match(triggerBlock, /^on:\s*$/m, relativePath);
    assert.match(triggerBlock, /^\s+workflow_dispatch:\s*$/m, relativePath);
    assert.doesNotMatch(triggerBlock, /^\s+(?:push|workflow_run):/m, relativePath);
  }
});

test("live AI provider smoke test requires a manual run", () => {
  const relativePath = ".github/workflows/live-ai-provider-smoke.yml";
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const triggerStart = source.indexOf("\non:");
  const permissionsStart = source.indexOf("\npermissions:", triggerStart);
  assert.ok(triggerStart >= 0 && permissionsStart > triggerStart, relativePath + " must have a readable trigger block");
  const triggerBlock = source.slice(triggerStart + 1, permissionsStart);
  assert.match(triggerBlock, /^\s+workflow_dispatch:\s*$/m);
  assert.doesNotMatch(triggerBlock, /^\s+(?:push|workflow_run):/m);
});

test("deployment and primary test workflows do not use the end-of-life Node.js 20 line", () => {
  const runtimeWorkflows = [
    ".github/workflows/deploy-cloudflare-pages.yml",
    ".github/workflows/deploy-pages.yml",
    ".github/workflows/deploy-worker.yml",
    ".github/workflows/test.yml"
  ];
  for (const relativePath of runtimeWorkflows) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(source, /node-version:\s*["']?24["']?/, relativePath + " must use Node.js 24");
    assert.doesNotMatch(source, /node-version:\s*["']?20["']?/, relativePath + " must not use end-of-life Node.js 20");
  }
});
