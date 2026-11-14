const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("PDF import is local-first, bounded, and records page-level extraction provenance", () => {
  const source = read("document-library.js");
  assert.ok(source.includes('PDFJS_VERSION = "4.10.38"'));
  assert.ok(source.includes('TESSERACT_VERSION = "5.1.1"'));
  assert.ok(source.includes("MAX_FILE_BYTES = 40 * 1024 * 1024"));
  assert.match(source, /MAX_PAGES = 1200/);
  assert.match(source, /MAX_OCR_PAGES = 150/);
  assert.match(source, /pageNumber,/);
  assert.match(source, /extractionMethod/);
  assert.match(source, /ocrConfidence/);
  assert.match(source, /eligibleForDiagnosis: false/);
  assert.equal(source.includes("fetch("), false, "PDF contents must not be uploaded by the document library");
});

test("OCR and PDF extraction keep the original one-based PDF page anchor", () => {
  const source = read("document-library.js");
  assert.ok(source.includes("for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++)"));
  assert.ok(source.includes("appendPageChunks(chunks, documentId, pageNumber, pageText"));
  assert.ok(source.includes('viewer.location.replace(url + "#page=" + page)'));
  assert.ok(source.includes("pageNumber: page,"));
  assert.ok(source.includes("printedPageNumber"));
});

test("reviewed diagnostic claims must point to extracted chunks and verified document rights", () => {
  const source = read("document-library.js");
  assert.ok(source.includes("pageEvidence.chunks.map(item => item.id)"));
  assert.ok(source.includes('doc.reviewStatus === "approved"'));
  assert.ok(source.includes('doc.rightsStatus === "verified"'));
  assert.ok(source.includes('claim.reviewStatus === "approved"'));
  assert.ok(source.includes('claim.rightsStatus === "verified"'));
  assert.ok(source.includes("doc.eligibleForDiagnosis === true"));
  assert.match(source, /CORE\.equipmentFamilyMatches\(family, equipment\)/);
  assert.match(source, /CORE\.modelApplicabilityMatches\(modelScope, model\)/);
  assert.match(source, /claim\.sourcePageVerified !== true/);
  assert.match(source, /claim\.ocrVisuallyVerified !== true/);
  assert.match(source, /claim\.sourcePageVerified === true/);
  assert.match(source, /sourceReviewEligible/);
  assert.match(source, /claim\.documentReviewRevision === Number\(doc\.reviewRevision \|\| 0\)/);
  assert.match(source, /reviewRevision: Number\.isInteger\(doc\.reviewRevision\)/);
  assert.match(source, /documentReviewRevision: Number\(doc\.reviewRevision \|\| 0\)/);
  assert.match(source, /sourcePageVerified: claim\.sourcePageVerified === true/);
  assert.match(source, /pageOcrConfidence: ocrConfidenceValues/);
});

test("document review UI excludes deferred Study and exposes page preview", () => {
  const review = read("document-review-workspaces.js");
  assert.match(review, /getPageEvidence/);
  assert.match(review, /claimPrintedPage/);
  assert.ok(review.includes("عرض النص المستخرج من الصفحة"));
  assert.ok(review.includes("openClaimSourcePage"));
  assert.ok(review.includes("claimOcrVisuallyVerified"));
  assert.ok(review.includes("claimSourcePageVerified"));
  assert.ok(review.includes("claimCriticalTokens"));
  assert.ok(review.includes("openedSourceKey === selectedReviewKey()"));
  assert.ok(review.includes("previewedPageKey !== selectedPageKey()"));
  assert.ok(review.includes("invalidateClaimReview"));
  assert.ok(review.includes("stale — document review changed; re-review required"));
  assert.ok(read("document-library.js").includes("CORE.extractCriticalTokens(pageText)"));
  assert.ok(read("document-library.js").includes("CORE.extractKnowledgeCandidates(pageText"));
  assert.ok(read("document-library.js").includes("sourceChunkIds: chunks.filter"));
  assert.ok(review.includes("claimKnowledgeCandidates"));
  assert.ok(review.includes("استخدام كنص مسودة"));
  assert.ok(review.includes("اعرض نص صفحة PDF المحددة أولًا"));
  assert.doesNotMatch(review, /Study|studyQuery|runDocumentStudy/);
});

test("diagnostic evidence panel uses a separate exact model field and opens cited PDF page", () => {
  const panel = read("diagnostic-document-evidence.js");
  assert.match(panel, /aiModel/);
  assert.ok(panel.includes("forDiagnostics(query, { equipment, model })"));
  assert.ok(panel.includes("openSourcePage(item.sourceRef.documentId, item.sourceRef.pageNumber)"));
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
  assert.match(sw, /maintenance-ai-toolkit-v60/);
  assert.match(sw, /const OPTIONAL_APP_SHELL = \[/);
});

test("PDF library stays local and does not add Study UI", () => {
  const html = read("index.html");
  assert.ok(html.includes('id="documentLibraryPanel"'));
  assert.ok(html.includes('id="documentOcrEnabled"'));
  assert.ok(html.includes('id="aiModel"'));
  assert.equal(html.includes('data-tab="study"'), false);
});
