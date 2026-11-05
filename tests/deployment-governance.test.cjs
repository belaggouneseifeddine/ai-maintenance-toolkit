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

test("all production deployment workflows are manual-only", () => {
  for (const relativePath of productionWorkflows) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    const triggerStart = source.indexOf("\non:");
    const permissionsStart = source.indexOf("\npermissions:", triggerStart);
    assert.ok(triggerStart >= 0 && permissionsStart > triggerStart, relativePath + " must have a readable trigger block");
    const triggerBlock = source.slice(triggerStart + 1, permissionsStart);
    assert.match(triggerBlock, /^on:\s*$/m, relativePath);
    assert.match(triggerBlock, /^\s+workflow_dispatch:\s*$/m, relativePath);
    assert.doesNotMatch(triggerBlock, /^\s+(?:push|workflow_run):/m,
      relativePath + " must not deploy automatically after a push or workflow run");
  }
});

test("production deployment jobs are restricted to main", () => {
  for (const relativePath of productionWorkflows) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(source, /^\s+if: github\.ref == ['"]refs\/heads\/main['"]\s*$/m, relativePath + " must block deployment from non-main refs");
  }
});

test("Cloudflare Pages and Worker production jobs use the protected production environment", () => {
  for (const relativePath of [
    ".github/workflows/deploy-cloudflare-pages.yml",
    ".github/workflows/deploy-worker.yml"
  ]) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(source, /^\s+environment: production\s*$/m, relativePath + " must use the protected production environment");
  }
});

test("live AI smoke requires manual dispatch, main ref, and explicit boolean confirmation", () => {
  const relativePath = ".github/workflows/live-ai-provider-smoke.yml";
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const triggerStart = source.indexOf("\non:");
  const permissionsStart = source.indexOf("\npermissions:", triggerStart);
  assert.ok(triggerStart >= 0 && permissionsStart > triggerStart, relativePath + " must have a readable trigger block");
  const triggerBlock = source.slice(triggerStart + 1, permissionsStart);
  assert.match(triggerBlock, /^\s+workflow_dispatch:\s*$/m);
  assert.doesNotMatch(triggerBlock, /^\s+(?:push|workflow_run):/m);
  assert.match(triggerBlock, /confirm_live_request:[\s\S]*?required: true[\s\S]*?type: boolean[\s\S]*?default: false/);
  assert.match(source, /^\s+if: github\.ref == ['"]refs\/heads\/main['"] && inputs\.confirm_live_request == true\s*$/m);
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

test("production and primary test workflows use Node 24-compatible first-party actions", () => {
  const runtimeWorkflows = [
    ".github/workflows/deploy-cloudflare-pages.yml",
    ".github/workflows/deploy-pages.yml",
    ".github/workflows/deploy-worker.yml",
    ".github/workflows/test.yml"
  ];
  for (const relativePath of runtimeWorkflows) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(source, /uses:\s*actions\/checkout@v5/, relativePath + " must use checkout v5");
    assert.match(source, /uses:\s*actions\/setup-node@v5/, relativePath + " must use setup-node v5");
  }
});

test("all repository workflows avoid Node 20-era checkout and setup-node v4 releases", () => {
  const workflowFiles = [
    ".github/workflows/deploy-cloudflare-pages.yml",
    ".github/workflows/deploy-pages.yml",
    ".github/workflows/quality-checks.yml",
    ".github/workflows/validate-knowledge.yml",
    ".github/workflows/deploy-worker.yml",
    ".github/workflows/cloudflare-ai-staging.yml",
    ".github/workflows/maintenance-toolkit-quality.yml",
    ".github/workflows/test.yml",
    ".github/workflows/diagnostic-tests.yml",
    ".github/workflows/local-reasoning-tests.yml",
    ".github/workflows/diagnostic-session-tests.yml"
  ];
  for (const relativePath of workflowFiles) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.doesNotMatch(source, /uses:\s*actions\/checkout@v4/, relativePath);
    assert.doesNotMatch(source, /uses:\s*actions\/setup-node@v4/, relativePath);
  }
});
