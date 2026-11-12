const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("PDF import retains the original one-based PDF page index for text and OCR", () => {
  const source = read("document-library.js");
  assert.match(source, /for \(let pageNumber = 1; pageNumber <= pageCount; pageNumber\+\+\)/);
  assert.match(source, /appendPageChunks\(chunks, documentId, pageNumber, pageText/);
  assert.match(source, /pdfPageNumber: pageNumber/);
  assert.match(source, /extractionMethod/);
  assert.match(source, /ocrConfidence/);
  assert.match(source, /eligibleForDiagnosis: false/);
});

test("source PDF tab opens synchronously before IndexedDB awaits and targets the exact page", () => {
  const source = read("document-library.js");
  const start = source.indexOf("async function openSourcePage");
  const end = source.indexOf("async function deleteDocument", start);
  assert.ok(start >= 0 && end > start);
  const method = source.slice(start, end);
  assert.ok(method.indexOf('window.open("about:blank", "_blank")') < method.indexOf("await getAll(\"documents\")"));
  assert.ok(method.includes('viewer.location.replace(url + "#page=" + targetPage)'));
  assert.ok(method.includes("CORE.normalizePageNumber(pageNumber, doc.pageCount)"));
});

test("page preview returns only chunks from the selected original PDF page", () => {
  const source = read("document-library.js");
  assert.ok(source.includes("getPageEvidence: async (documentId, pageNumber)"));
  assert.ok(source.includes('objectStore("chunks").index("documentId").getAll(documentId)'));
  assert.ok(source.includes("(item.pdfPageNumber || item.pageNumber) === targetPage"));
  assert.ok(source.includes("extractionMethods:"));
  assert.ok(source.includes("ocrConfidence:"));
});

test("document review UI previews extracted page text before saving a claim", () => {
  const review = read("document-review-workspaces.js");
  assert.ok(review.includes('id="previewClaimPage"'));
  assert.ok(review.includes('id="claimPagePreview"'));
  assert.ok(review.includes("library().getPageEvidence"));
  assert.ok(review.includes('$("claimText").value=evidence.text'));
  assert.ok(review.includes("printedPageNumber"));
});

test("Study workspace remains deferred while local research can draft a human-reviewed claim", () => {
  const review = read("document-review-workspaces.js");
  assert.doesNotMatch(review, /documentStudyWorkspace|runDocumentStudy|studyQuery/);
  assert.ok(review.includes("data-claim-draft"));
  assert.ok(review.includes("راجع النص والسياق والوحدات والموديل والحقوق يدويًا"));
});

test("Android PDF acceptance remains explicitly pending until a physical device test", () => {
  const checklist = read("docs/ANDROID-PDF-ACCEPTANCE-TESTS.md");
  assert.match(checklist, /manual validation required — not yet performed/);
  assert.match(checklist, /physical Android test/);
  assert.match(checklist, /printed page label/);
});
