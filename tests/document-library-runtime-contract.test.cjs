const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("PDF import is local-first, bounded, and records page-level extraction provenance", () => {
  const source = read("document-library.js");
  assert.match(source, /PDFJS_VERSION = "4\\.10\\.38"/);
  assert.match(source, /TESSERACT_VERSION = "5\\.1\\.1"/);
  assert.match(source, /MAX_FILE_BYTES = 40 \\* 1024 \\* 1024/);
  assert.match(source, /MAX_PAGES = 1200/);
  assert.match(source, /MAX_OCR_PAGES = 150/);
  assert.match(source, /pageNumber,/);
  assert.match(source, /extractionMethod/);
  assert.match(source, /ocrConfidence/);
  assert.match(source, /eligibleForDiagnosis: false/);
  assert.doesNotMatch(source, /fetch\\([^)]*(?:upload|api\\/documents)/i);
});

test("OCR and PDF extraction keep the original one-based PDF page anchor", () => {
  const source = read("document-library.js");
  assert.match(source, /for \\(let pageNumber = 1; pageNumber <= pageCount; pageNumber\\+\\+\\)/);
  assert.match(source, /appendPageChunks\\(chunks, documentId, pageNumber, pageText/);
  assert.match(source, /viewer\\.location\\.replace\\(url \\+ "#page=" \\+ page\\)/);
  assert.match(source, /pageNumber: page,/);
  assert.match(source, /printedPageNumber/);
});

test("reviewed diagnostic claims must point to extracted chunks and verified document rights", () => {
  const source = read("document-library.js");
  assert.match(source, /pageEvidence\\.chunks\\.map\\(item => item\\.id\\)/);
  assert.match(source, /doc\\.reviewStatus === "approved"/);
  assert.match(source, /doc\\.rightsStatus === "verified"/);
  assert.match(source, /claim\\.reviewStatus === "approved"/);
  assert.match(source, /claim\\.rightsStatus === "verified"/);
  assert.match(source, /doc\\.eligibleForDiagnosis === true/);
  assert.match(source, /modelMatches/);
});

test("document review UI excludes deferred Study and exposes page preview", () => {
  const review = read("document-review-workspaces.js");
  assert.match(review, /getPageEvidence/);
  assert.match(review, /claimPrintedPage/);
  assert.match(review, /source page/);
  assert.doesNotMatch(review, /Study|studyQuery|runDocumentStudy/);
});

test("diagnostic evidence panel uses a separate exact model field and opens cited PDF page", () => {
  const panel = read("diagnostic-document-evidence.js");
  assert.match(panel, /aiModel/);
  assert.match(panel, /forDiagnostics\\(query, \\{ equipment, model \\}\\)/);
  assert.match(panel, /openSourcePage\\(item\\.sourceRef\\.documentId, item\\.sourceRef\\.pageNumber\\)/);
});

test("all document assets are included in both deployment artifacts and optional offline cache", () => {
  const html = read("index.html");
  const sw = read("sw.js");
  const pages = read(".github/workflows/deploy-pages.yml");
  const cloudflare = read(".github/workflows/deploy-cloudflare-pages.yml");
  const assets = [
    "document-library-core.js", "document-library.js", "document-library.css",
    "document-retrieval-adapter.js", "document-review-workspaces.js", "diagnostic-document-evidence.js"
  ];
  for (const asset of assets) {
    assert.ok(html.includes(asset), "index.html must load " + asset);
    assert.ok(sw.includes('"./' + asset + '"'), "service worker must cache " + asset);
    assert.ok(pages.includes(asset), "GitHub Pages workflow must include " + asset);
    assert.ok(cloudflare.includes(asset), "Cloudflare Pages workflow must include " + asset);
  }
  assert.match(sw, /maintenance-ai-toolkit-v59/);
  assert.match(sw, /const OPTIONAL_APP_SHELL = \[/);
});

test("PDF library stays local and does not add Study UI", () => {
  const html = read("index.html");
  assert.ok(html.includes('id="documentLibraryPanel"'));
  assert.ok(html.includes('id="documentOcrEnabled"'));
  assert.ok(html.includes('id="aiModel"'));
  assert.equal(html.includes('data-tab="study"'), false);
});
