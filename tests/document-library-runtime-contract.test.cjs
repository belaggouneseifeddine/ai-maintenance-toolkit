  assert.equal(source.includes("https://cdnjs.cloudflare.com"), false, "PDF.js must not depend on a CDN");
  assert.equal(source.includes("https://cdn.jsdelivr.net"), false, "Tesseract must not depend on a CDN");
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
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
  assert.ok(source.includes("./vendor/pdfjs/pdf.min.mjs"), "PDF.js must load from same-origin assets");
  assert.ok(source.includes("./vendor/pdfjs/pdf.worker.min.mjs"), "PDF worker must load from same-origin assets");
  assert.ok(source.includes("./vendor/tesseract/tesseract.min.js"), "Tesseract must load from same-origin assets");
  assert.ok(source.includes("./vendor/tessdata/"), "OCR language data must load from same-origin assets");
});

test("OCR and PDF extraction keep the original one-based PDF page anchor", () => {
  const source = read("document-library.js");
  assert.ok(source.includes("for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++)"));
  assert.ok(source.includes("appendPageChunks(chunks, documentId, pageNumber, pageText"));
  assert.ok(source.includes('viewer.location.replace(url + "#page=" + page)'));
  assert.ok(source.includes("pageNumber: page,"));
  assert.ok(source.includes("printedPageNumber"));
});

test("reviewed diagnostic claims must point to extracted chunks and verified source pages", () => {
  const source = read("document-library.js");
  assert.ok(source.includes("pageEvidence.chunks.map(item => item.id)"));
  assert.ok(source.includes('doc.reviewStatus === "approved"'));
  assert.ok(source.includes('claim.reviewStatus === "approved"'));
  assert.ok(source.includes("doc.eligibleForDiagnosis === true"));
  assert.doesNotMatch(source, /doc\.rightsStatus === "verified"/);
  assert.doesNotMatch(source, /claim\.rightsStatus === "verified"/);
  const reviewUi = read("document-review-workspaces.js");
  assert.doesNotMatch(reviewUi, /reviewRightsVerified|claimRightsVerified|reviewRightsEvidence/);
  assert.match(reviewUi, /يتحمل المستخدم مسؤولية امتلاكه حق استخدام الملف/);
  assert.doesNotMatch(source, /rightsVerified !== true|rightsEvidence\)/);
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
    "document-library-core.js", "document-semantic-search.js", "document-library.js", "document-library.css",
    "document-retrieval-adapter.js", "document-review-workspaces.js", "diagnostic-document-evidence.js"
  ];
  for (const asset of assets) {
    assert.ok(html.includes(asset), "index.html must load " + asset);
    assert.ok(sw.includes('"./' + asset + '"'), "service worker must cache " + asset);
    assert.ok(pages.includes(asset), "GitHub Pages workflow must include " + asset);
    assert.ok(cloudflare.includes(asset), "Cloudflare Pages workflow must include " + asset);
  }
  assert.match(sw, /maintenance-ai-toolkit-v62/);
  assert.ok(sw.includes("vendor/transformers/transformers.min.js"));
  for (const asset of ["vendor/pdfjs/pdf.min.mjs","vendor/pdfjs/pdf.worker.min.mjs","vendor/tesseract/tesseract.min.js","vendor/tesseract/worker.min.js","vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js","vendor/tessdata/ara.traineddata.gz","vendor/tessdata/eng.traineddata.gz","vendor/tessdata/fra.traineddata.gz"]) {
    assert.ok(sw.includes(asset), "service worker must cache " + asset);
  }
  const vendorScript = read("scripts/vendor-document-runtime.sh");
  assert.ok(vendorScript.includes("@huggingface/transformers@3.8.1"));
  assert.ok(vendorScript.includes("pdfjs-dist@4.10.38"));
  assert.ok(vendorScript.includes("tesseract.js@5.1.1"));
  assert.ok(vendorScript.includes("ara eng fra"));
  assert.match(sw, /const OPTIONAL_APP_SHELL = \[/);
});

test("PDF library stays local and does not add Study UI", () => {
  const html = read("index.html");
  assert.ok(html.includes('id="documentLibraryPanel"'));
  assert.ok(html.includes('id="documentOcrEnabled"'));
  assert.ok(html.includes('id="aiModel"'));
  assert.equal(html.includes('data-tab="study"'), false);
});


test("inline JavaScript in the production HTML parses before browser execution", () => {
  const html = read("index.html");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const javascript = scripts.filter(match => {
    const attributes = match[1] || "";
    const type = (attributes.match(/\btype=["']([^"']+)["']/i) || [])[1] || "text/javascript";
    return !/\bsrc=/i.test(attributes) && /^(?:text|application)\/(?:java|ecma)script$|^module$/i.test(type);
  });
  assert.ok(javascript.length > 0, "production HTML should contain its expected inline application scripts");
  javascript.forEach((match, index) => {
    new vm.Script(match[2], { filename: "index.html:inline-script-" + (index + 1) });
  });
});


test("all PDF and diagnostic integration runtime modules parse", () => {
  const files = [
    "document-library-core.js",
    "document-semantic-search.js",
    "document-library.js",
    "document-retrieval-adapter.js",
    "document-review-workspaces.js",
    "diagnostic-document-evidence.js",
    "diagnostic-chat.js"
  ];
  for (const file of files) {
    new vm.Script(read(file), { filename: file });
  }
});

test("semantic PDF search persists local multilingual vectors and keeps lexical fallback", () => {
  const semantic = read("document-semantic-search.js");
  const library = read("document-library.js");
  assert.ok(semantic.includes('const DB_NAME = "maintenance-ai-semantic-index"'));
  assert.ok(semantic.includes('const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2"'));
  assert.ok(semantic.includes('createObjectStore("vectors"'));
  assert.ok(semantic.includes("indexChunks"));
  assert.ok(semantic.includes("cosine(queryVector, row.vector)"));
  assert.ok(semantic.includes("useBrowserCache = true"));
  assert.ok(library.includes("reciprocalRankScore"));
  assert.ok(library.includes("CORE.rankChunks(query, chunks"));
  assert.ok(library.includes("semanticApi.isReady()"));
  assert.ok(library.includes("documentSemanticEnable"));
  assert.ok(library.includes("~118 MB"));
});
