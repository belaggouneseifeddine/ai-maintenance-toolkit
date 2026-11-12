const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../document-library-core.js");

test("tokenizer normalizes Arabic diacritics and keeps Latin technical terms", () => {
  const tokens = Core.tokenize("مُضَخَّة Cavitation NPSH ضغط");
  assert.ok(tokens.includes("مضخة"));
  assert.ok(tokens.includes("cavitation"));
  assert.ok(tokens.includes("npsh"));
  assert.ok(tokens.includes("ضغط"));
});

test("page chunking preserves page text with bounded overlap", () => {
  const source = ("Pump suction pressure and flow measurement.\n").repeat(90);
  const chunks = Core.chunkPage(source, { maxChars: 500, overlap: 70 });
  assert.ok(chunks.length > 2);
  assert.ok(chunks.every(chunk => chunk.text.length <= 501));
  assert.ok(chunks[0].text.length > 0);
  assert.ok(chunks[chunks.length - 1].text.length > 0);
  assert.ok(chunks.some(chunk => chunk.text.includes("flow measurement")));
});

test("search ranks relevant chunks and returns stable page citations", () => {
  const chunks = [
    { id: "a", pageNumber: 2, text: "Cavitation occurs when pressure falls below vapour pressure at the impeller eye.", tokens: Core.tokenize("Cavitation occurs when pressure falls below vapour pressure at the impeller eye.") },
    { id: "b", pageNumber: 8, text: "The electric motor terminal box contains the connection links.", tokens: Core.tokenize("The electric motor terminal box contains the connection links.") }
  ];
  const results = Core.rankChunks("cavitation impeller pressure", chunks, 5);
  assert.equal(results[0].doc.id, "a");
  assert.ok(results[0].score > results[1]?.score || results.length === 1);
  assert.equal(Core.makeCitation({ title: "Pump Manual" }, 2), "Pump Manual, PDF p. 2");
});

test("empty or stop-word-only queries do not return arbitrary content", () => {
  assert.deepEqual(Core.rankChunks("the and من في", [{ id: "x", text: "pump fault", tokens: ["pump", "fault"] }]), []);
});

test("diagnostic retrieval requires explicit approval and verified rights", () => {
  const approved = { eligibleForDiagnosis: true, reviewStatus: "approved", rightsStatus: "verified" };
  assert.equal(Core.isDiagnosticEligible(approved), true);
  assert.equal(Core.isDiagnosticEligible({ ...approved, rightsStatus: "unknown" }), false);
  assert.equal(Core.isDiagnosticEligible({ ...approved, reviewStatus: "candidate" }), false);
  assert.equal(Core.isDiagnosticEligible({ ...approved, eligibleForDiagnosis: false }), false);
});

test("source references retain document hash, original page, chunk and review provenance", () => {
  const ref = Core.makeSourceRef(
    { id: "doc-a", fileName: "manual.pdf", sha256: "abc", reviewStatus: "approved", rightsStatus: "verified", evidenceClass: "oem_manual", extractionStatus: "text-extracted" },
    { id: "doc-a:p9:c0", documentId: "doc-a", pageNumber: 9, extractionMethod: "ocr", ocrConfidence: 94.2 }
  );
  assert.equal(ref.documentId, "doc-a");
  assert.equal(ref.pageNumber, 9);
  assert.equal(ref.chunkId, "doc-a:p9:c0");
  assert.equal(ref.extractionMethod, "ocr");
  assert.equal(ref.ocrConfidence, 94.2);
  assert.equal(ref.sha256, "abc");
  assert.equal(ref.rightsStatus, "verified");
});


test("page anchors accept only valid one-based PDF page numbers", () => {
  assert.equal(Core.normalizePageNumber("7", 20), 7);
  assert.equal(Core.normalizePageNumber(1, 20), 1);
  assert.equal(Core.normalizePageNumber(0, 20), null);
  assert.equal(Core.normalizePageNumber(-1, 20), null);
  assert.equal(Core.normalizePageNumber("1.5", 20), null);
  assert.equal(Core.normalizePageNumber(21, 20), null);
});

test("source links must be HTTPS and must not contain embedded credentials", () => {
  assert.equal(Core.isHttpsUrl("https://manufacturer.example/manual.pdf"), true);
  assert.equal(Core.isHttpsUrl("http://manufacturer.example/manual.pdf"), false);
  assert.equal(Core.isHttpsUrl("javascript:alert(1)"), false);
  assert.equal(Core.isHttpsUrl("https://user:pass@manufacturer.example/manual.pdf"), false);
});

test("equipment scope matching and generic model scope are explicit", () => {
  assert.equal(Core.scopeMatches("Centrifugal pump", "Grundfos centrifugal pump CR"), true);
  assert.equal(Core.scopeMatches("hydraulic power unit", "centrifugal pump"), false);
  assert.equal(Core.isGenericModelScope("family-wide / جميع الموديلات"), true);
  assert.equal(Core.isGenericModelScope("Grundfos CR 10"), false);
});

test("source refs keep PDF page and printed page separate", () => {
  const ref = Core.makeSourceRef(
    { id: "doc-b", fileName: "manual.pdf", manufacturer: "Grundfos", modelApplicability: "CR 10", sourceOrigin: "Original OEM manual" },
    { id: "doc-b:p42:c0", documentId: "doc-b", pageNumber: 42, pdfPageNumber: 42, printedPageNumber: "37" }
  );
  assert.equal(ref.pageNumber, 42);
  assert.equal(ref.pdfPageNumber, 42);
  assert.equal(ref.printedPageNumber, "37");
  assert.equal(ref.modelApplicability, "CR 10");
  assert.equal(ref.sourceOrigin, "Original OEM manual");
});


test("model applicability does not match a different numeric model variant", () => {
  assert.equal(Core.modelScopeMatches("Grundfos CR 10", "Grundfos CR 10"), true);
  assert.equal(Core.modelScopeMatches("Grundfos CR 10", "Grundfos CR10"), true);
  assert.equal(Core.modelScopeMatches("Grundfos CR 10", "Grundfos CR 20"), false);
  assert.equal(Core.modelScopeMatches("Siemens G120C", "Siemens G120C"), true);
  assert.equal(Core.modelScopeMatches("Siemens G120C", "Siemens G120"), false);
  assert.equal(Core.modelScopeMatches("all models", ""), true);
});
