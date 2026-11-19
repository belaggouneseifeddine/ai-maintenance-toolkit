const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Android packages an explicit local runtime allow-list, not the whole repository", () => {
  const gradle = fs.readFileSync("android-local-host/app/build.gradle.kts", "utf8");
  assert.match(gradle, /tasks\.register<Sync>\("syncMaintenanceWebAssets"\)/);
  assert.match(gradle, /include\([\s\S]*"index\.html"[\s\S]*"assistant-case-context\.js"[\s\S]*"assistant-model-agent\.js"/);
  assert.match(gradle, /exclude\([\s\S]*"knowledge\/candidates\/\*\*"/);
  assert.match(gradle, /environment\("MAINTENANCE_SKIP_EMBEDDINGS", "1"\)/);
  assert.doesNotMatch(gradle, /include\("\*\*\/\*\.js"/);
  assert.doesNotMatch(gradle, /onlyIf\s*\{/);
});

test("Android vendor build keeps PDF/OCR assets but skips unused embedding runtime", () => {
  const script = fs.readFileSync("scripts/vendor-document-runtime.sh", "utf8");
  assert.match(script, /MAINTENANCE_SKIP_EMBEDDINGS/);
  assert.match(script, /pdfjs-dist@4\.10\.38/);
  assert.match(script, /tesseract\.js@5\.1\.1/);
  assert.match(script, /NPM_PACKAGES\+=\("@huggingface\/transformers@3\.8\.1"\)/);
  assert.match(script, /if \[\[ "\$\{MAINTENANCE_SKIP_EMBEDDINGS:-0\}" != "1" \]\]/);
});

test("new assistant case-context module is loaded before local UI and cached offline", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const sw = fs.readFileSync("sw.js", "utf8");
  assert.ok(html.indexOf('src="./assistant-case-context.js"') < html.indexOf('src="./local-model-ui.js"'));
  assert.match(sw, /"\.\/assistant-case-context\.js"/);
});
