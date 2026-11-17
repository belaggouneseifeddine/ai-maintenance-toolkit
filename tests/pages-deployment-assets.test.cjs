const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const sw = fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8");
const workflow = fs.readFileSync(path.join(__dirname, "..", ".github/workflows/deploy-pages.yml"), "utf8");
const cloudflareWorkflow = fs.readFileSync(path.join(__dirname, "..", ".github/workflows/deploy-cloudflare-pages.yml"), "utf8");
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

const cloudflareCopy = cloudflareWorkflow.match(/cp index\.html ([^\n]+)/);
assert.ok(cloudflareCopy, "Cloudflare workflow must declare the static runtime asset copy list");
const cloudflareAssets = new Set(cloudflareCopy[1].trim().split(/\s+/).filter(Boolean));

test("every local JavaScript entrypoint referenced by index.html is included in Cloudflare Pages artifact", () => {
  const scripts = html.split('<script src="./').slice(1).map(item => item.split('"')[0]);
  assert.ok(scripts.length > 0, "index.html must have local script entrypoints");
  for (const script of scripts) {
    assert.ok(cloudflareAssets.has(script), "Cloudflare Pages artifact is missing script " + script);
  }
});

test("Cloudflare Pages validates the guided diagnostic runtime assets before deployment", () => {
  for (const asset of ["bayesian-engine.js", "diagnostic-session.js", "diagnostic-session-ui.js"]) {
    assert.ok(cloudflareAssets.has(asset), "Cloudflare Pages copy list must include " + asset);
    assert.match(cloudflareWorkflow, new RegExp("test -s _site/" + asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(cloudflareWorkflow.includes("/" + asset), "Cloudflare production smoke test must request " + asset);
  }
  assert.match(cloudflareWorkflow, /MaintenanceBayesianEngine/);
  assert.match(cloudflareWorkflow, /MaintenanceDiagnosticSession/);
  assert.match(cloudflareWorkflow, /MaintenanceDiagnosticSessionUI/);
});


test("P1 app-shell assets are deployed and cached for offline use", () => {
  for (const asset of ["p1-app-shell.css", "p1-app-shell.js"]) {
    assert.ok(assets.has(asset), "GitHub Pages artifact must include " + asset);
    assert.ok(cloudflareAssets.has(asset), "Cloudflare Pages artifact must include " + asset);
    assert.ok(sw.includes('"./' + asset + '"'), "Service worker must cache " + asset);
    assert.ok(html.includes(asset), "index.html must load " + asset);
  }
});


test("navigation uses five destinations and nests home and optional AI under diagnosis", () => {
  const navigation = fs.readFileSync(path.join(__dirname, "..", "navigation-redesign.js"), "utf8");
  const shell = fs.readFileSync(path.join(__dirname, "..", "p1-app-shell.js"), "utf8");
  const styles = fs.readFileSync(path.join(__dirname, "..", "p1-app-shell.css"), "utf8");
  const design = fs.readFileSync(path.join(__dirname, "..", "design-system.css"), "utf8");
  for (const id of ["diagnose", "knowledge", "safety", "log", "v03"]) assert.ok(html.includes('data-tab="' + id + '"'));
  assert.equal(html.includes('data-tab="homeDashboard"'), false);
  assert.equal(html.includes('data-tab="ai"'), false);
  const diagnosisStart = html.indexOf('<section id="diagnose"');
  const homeStart = html.indexOf('<section id="homeDashboard"');
  const formStart = html.indexOf('<form id="diagnosisForm"');
  assert.ok(diagnosisStart >= 0 && homeStart > diagnosisStart && formStart > homeStart);
  assert.ok(navigation.includes("home.classList.remove('panel','active')"));
  assert.ok(navigation.includes("diagnose.insertBefore(home,diagnose.firstChild)"));
  assert.ok(navigation.includes("diagnose.appendChild(ai)"));
  assert.match(navigation, /const tabs=\[/);
  assert.match(navigation, /nav\.classList\.add\('bottom-navigation'\)/);
  for (const destination of ["diagnose", "knowledge", "safety", "log", "v03", "ai"]) assert.ok(html.includes('data-go="' + destination + '"'), "Missing home shortcut: " + destination);
  assert.match(shell, /saved='dark'/);
  assert.match(shell, /maintenance-ai-toolkit-theme-v1/);
  assert.doesNotMatch(shell, /homeTab|moreTab|aiTab|nav\.addEventListener/);
  assert.match(styles, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(design, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
});
