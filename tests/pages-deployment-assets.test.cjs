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


test("document library assets are deployed and cached as optional offline resources", () => {
  for (const asset of ["document-library-core.js", "document-library.js", "document-library.css"]) {
    assert.ok(assets.has(asset), "GitHub Pages artifact must include " + asset);
    assert.ok(cloudflareAssets.has(asset), "Cloudflare Pages artifact must include " + asset);
    assert.ok(sw.includes('"./' + asset + '"'), "Service worker must cache " + asset);
    assert.ok(html.includes(asset), "index.html must load " + asset);
  }
  assert.ok(sw.includes("const OPTIONAL_APP_SHELL = ["));
});

test("document library stays inside the knowledge panel without adding a sixth primary tab", () => {
  assert.ok(html.includes('id="documentLibraryPanel"'));
  assert.ok(html.includes('id="documentSearchForm"'));
  const knowledgeStart = html.indexOf('<section id="knowledge" class="panel">');
  const libraryPosition = html.indexOf('id="documentLibraryPanel"');
  const safetyPosition = html.indexOf('<section id="safety"');
  assert.ok(knowledgeStart >= 0 && libraryPosition > knowledgeStart && safetyPosition > libraryPosition,
    "document library must be inside the knowledge panel before the safety panel");
  assert.equal(html.includes('data-tab="documents"'), false);
});

test("P1 app-shell assets are deployed and cached for offline use", () => {
  for (const asset of ["p1-app-shell.css", "p1-app-shell.js"]) {
    assert.ok(assets.has(asset), "GitHub Pages artifact must include " + asset);
    assert.ok(cloudflareAssets.has(asset), "Cloudflare Pages artifact must include " + asset);
    assert.ok(sw.includes('"./' + asset + '"'), "Service worker must cache " + asset);
    assert.ok(html.includes(asset), "index.html must load " + asset);
  }
});


test("P1 navigation contains exactly five requested destinations and defaults to dark mode", () => {
  const shell = fs.readFileSync(path.join(__dirname, "..", "p1-app-shell.js"), "utf8");
  const styles = fs.readFileSync(path.join(__dirname, "..", "p1-app-shell.css"), "utf8");
  for (const id of ["diagnose", "knowledge", "safety", "log", "v03"]) assert.ok(shell.includes("['" + id + "'"), "Missing primary destination: " + id);
  assert.match(shell, /saved='dark'/);
  assert.match(shell, /maintenance-ai-toolkit-theme-v1/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});

test("PDF ingestion supports opt-in multilingual OCR and keeps OCR local", () => {
  const library = fs.readFileSync(path.join(__dirname, "..", "document-library.js"), "utf8");
  assert.ok(html.includes('id="documentOcrEnabled"'));
  assert.ok(html.includes('value="ara"'));
  assert.ok(html.includes('value="fra"'));
  assert.ok(html.includes('value="eng"'));
  assert.match(library, /TESSERACT_VERSION = "5\.1\.1"/);
  assert.match(library, /MAX_OCR_PAGES = 150/);
  assert.match(library, /DB_VERSION = 2/);
  assert.match(library, /event\.oldVersion < 2/);
  assert.match(library, /ocrAttemptedPages < MAX_OCR_PAGES/);
  assert.match(library, /worker\.recognize\(canvas\)/);
  assert.match(library, /eligibleForDiagnosis: false/);
  assert.doesNotMatch(library, /fetch\([^)]*(?:upload|api\/documents)/i);
});

test("document retrieval requires an explicit consumer and gates diagnostic evidence", () => {
  const library = fs.readFileSync(path.join(__dirname, "..", "document-library.js"), "utf8");
  const core = fs.readFileSync(path.join(__dirname, "..", "document-library-core.js"), "utf8");
  for (const consumer of ["research", "study", "diagnostics", "library"]) assert.ok(library.includes('"' + consumer + '"'));
  assert.ok(library.includes('CORE.isDiagnosticEligible(item)'));
  assert.ok(core.includes('document.reviewStatus === "approved"'));
  assert.ok(core.includes('document.rightsStatus === "verified"'));
  assert.ok(core.includes('document.eligibleForDiagnosis === true'));
});
