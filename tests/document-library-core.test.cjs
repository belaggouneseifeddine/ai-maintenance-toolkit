const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../document-library-core.js");

test("tokenizer normalizes Arabic diacritics and keeps English/French technical terms", () => {
  const tokens = Core.tokenize("مُضَخَّة Cavitation NPSH pression aspiration");
  assert.ok(tokens.includes("مضخة"));
  assert.ok(tokens.includes("cavitation"));
  assert.ok(tokens.includes("npsh"));
  assert.ok(tokens.includes("pression"));
  assert.ok(tokens.includes("aspiration"));
});

test("page chunking preserves bounded chunks and text offsets", () => {
  const source = ("Pump suction pressure and flow measurement.\n").repeat(90);
  const chunks = Core.chunkPage(source, { maxChars: 500, overlap: 70 });
  assert.ok(chunks.length > 2);
  assert.ok(chunks.every(chunk => chunk.text.length <= 501));
  assert.ok(chunks.every(chunk => chunk.start >= 0 && chunk.end > chunk.start));
  assert.ok(chunks.some(chunk => chunk.text.includes("flow measurement")));
});

test("lexical search ranks the matching page and returns stable citations", () => {
  const chunks = [
    { id: "a", pageNumber: 2, text: "Cavitation occurs when pressure falls below vapour pressure at the impeller eye.", tokens: Core.tokenize("Cavitation occurs when pressure falls below vapour pressure at the impeller eye.") },
    { id: "b", pageNumber: 8, text: "The electric motor terminal box contains the connection links.", tokens: Core.tokenize("The electric motor terminal box contains the connection links.") }
  ];
  const results = Core.rankChunks("cavitation impeller pressure", chunks, 5);
  assert.equal(results[0].doc.id, "a");
  assert.equal(Core.makeCitation({ title: "Pump Manual" }, 2), "Pump Manual, p. 2");
});

test("empty or stop-word-only queries do not return arbitrary content", () => {
  assert.deepEqual(Core.rankChunks("the and من في", [{ id: "x", text: "pump fault", tokens: ["pump", "fault"] }]), []);
});

test("diagnostic eligibility requires explicit document approval and verified rights", () => {
  const approved = { eligibleForDiagnosis: true, reviewStatus: "approved", rightsStatus: "verified" };
  assert.equal(Core.isDiagnosticEligible(approved), true);
  assert.equal(Core.isDiagnosticEligible({ ...approved, rightsStatus: "unknown" }), false);
  assert.equal(Core.isDiagnosticEligible({ ...approved, reviewStatus: "candidate" }), false);
  assert.equal(Core.isDiagnosticEligible({ ...approved, eligibleForDiagnosis: false }), false);
});

test("source references retain PDF page, printed page, chunk and OCR provenance", () => {
  const ref = Core.makeSourceRef(
    { id: "doc-a", fileName: "manual.pdf", sha256: "abc", reviewStatus: "approved", rightsStatus: "verified", evidenceClass: "oem_manual", extractionStatus: "text-extracted" },
    { id: "doc-a:p9:c0", documentId: "doc-a", pageNumber: 9, printedPageNumber: "37", extractionMethod: "ocr", ocrConfidence: 94.2 }
  );
  assert.equal(ref.documentId, "doc-a");
  assert.equal(ref.pageNumber, 9);
  assert.equal(ref.printedPageNumber, "37");
  assert.equal(ref.chunkId, "doc-a:p9:c0");
  assert.equal(ref.extractionMethod, "ocr");
  assert.equal(ref.ocrConfidence, 94.2);
  assert.equal(ref.sha256, "abc");
});

test("equipment family matching does not confuse pump subtypes", () => {
  assert.equal(Core.equipmentFamilyMatches("centrifugal pump", "centrifugal pump"), true);
  assert.equal(Core.equipmentFamilyMatches("pompe centrifuge", "centrifugal pump"), true);
  assert.equal(Core.equipmentFamilyMatches("مضخة طرد مركزي", "centrifugal pump"), true);
  assert.equal(Core.equipmentFamilyMatches("centrifugal pump", "gear pump"), false);
  assert.equal(Core.equipmentFamilyMatches("gear pump", "centrifugal pump"), false);
  assert.equal(Core.equipmentFamilyMatches("pump", "centrifugal pump"), true);
  assert.equal(Core.equipmentFamilyMatches("centrifugal pump", "pump"), false);
  assert.equal(Core.equipmentFamilyMatches("electric motor", "centrifugal pump"), false);
});

test("model applicability requires the complete designation, not a shared token", () => {
  assert.equal(Core.modelApplicabilityMatches("Grundfos CR 10", "Grundfos CR 10"), true);
  assert.equal(Core.modelApplicabilityMatches("Grundfos CR 10", "grundfos cr-10"), true);
  assert.equal(Core.modelApplicabilityMatches("Grundfos CR 15", "Grundfos CR 10"), false);
  assert.equal(Core.modelApplicabilityMatches("ABB ACS580", "ABB ACS480"), false);
  assert.equal(Core.modelApplicabilityMatches("Grundfos CR 10-4", "Grundfos CR 10"), false);
  assert.equal(Core.modelApplicabilityMatches("Grundfos CR 10", ""), false);
});

test("explicit generic model scope is the only model-free fallback", () => {
  assert.equal(Core.modelApplicabilityMatches("generic", ""), true);
  assert.equal(Core.modelApplicabilityMatches("family-wide", ""), true);
  assert.equal(Core.modelApplicabilityMatches("all models", "Unknown Model X"), true);
  assert.equal(Core.modelApplicabilityMatches("Grundfos CR 10", ""), false);
});
