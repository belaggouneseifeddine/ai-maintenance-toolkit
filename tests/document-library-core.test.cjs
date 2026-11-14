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
  assert.equal(Core.equipmentFamilyMatches("pompe à engrenages", "gear pump"), true);
  assert.equal(Core.equipmentFamilyMatches("moteur électrique", "electric motor"), true);
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

test("critical-token extraction flags numeric units and equipment/model codes for visual review", () => {
  const tokens = Core.extractCriticalTokens("Pressure 2.5 bar, flow 12 m3/h, motor 1450 rpm, drive ACS580, bearing 6202-2Z.");
  assert.ok(tokens.some(token => /2\.5\s*bar/i.test(token)));
  assert.ok(tokens.some(token => /12\s*m3\/h/i.test(token)));
  assert.ok(tokens.some(token => /1450\s*rpm/i.test(token)));
  assert.ok(tokens.some(token => /ACS580/i.test(token)));
  assert.ok(tokens.some(token => /6202-2Z/i.test(token)));
});

test("BM25-style retrieval ranks Arabic, French and English technical queries", () => {
  const chunks = [
    { id: "ar-pump", pageNumber: 3, text: "انخفاض ضغط السحب في مضخة الطرد المركزي", tokens: Core.tokenize("انخفاض ضغط السحب في مضخة الطرد المركزي") },
    { id: "fr-pump", pageNumber: 4, text: "La pression aspiration diminue lorsque le filtre est obstrué", tokens: Core.tokenize("La pression aspiration diminue lorsque le filtre est obstrué") },
    { id: "en-bearing", pageNumber: 5, text: "Bearing temperature and vibration trend", tokens: Core.tokenize("Bearing temperature and vibration trend") },
    { id: "noise", pageNumber: 6, text: "Motor terminal box connection diagram", tokens: Core.tokenize("Motor terminal box connection diagram") }
  ];
  assert.equal(Core.rankChunks("ضغط السحب", chunks, 4)[0].doc.id, "ar-pump");
  assert.equal(Core.rankChunks("pression aspiration", chunks, 4)[0].doc.id, "fr-pump");
  assert.equal(Core.rankChunks("bearing temperature", chunks, 4)[0].doc.id, "en-bearing");
});

test("knowledge candidate extraction preserves source text, page anchors, and review-only status", () => {
  const source = [
    "Warning: isolate electrical supply before opening the terminal cover.",
    "Maximum operating pressure is 10 bar.",
    "Low suction pressure may cause cavitation at the impeller eye.",
    "Inspect the mechanical seal every 2000 operating hours.",
    "تحذير: افصل التغذية الكهربائية قبل فتح الغطاء."
  ].join("\n");
  const candidates = Core.extractKnowledgeCandidates(source, { pageNumber: 12 });
  assert.ok(candidates.length >= 5);
  const safety = candidates.find(item => item.text.startsWith("Warning:"));
  const specification = candidates.find(item => item.text.includes("10 bar"));
  const fault = candidates.find(item => item.text.includes("Low suction pressure"));
  const maintenance = candidates.find(item => item.text.includes("Inspect the mechanical seal"));
  const arabicSafety = candidates.find(item => item.text.startsWith("تحذير:"));
  assert.ok(safety.tags.includes("safety"));
  assert.ok(specification.tags.includes("specification"));
  assert.ok(specification.criticalTokens.some(token => /10 bar/i.test(token)));
  assert.ok(fault.tags.includes("fault"));
  assert.ok(fault.tags.includes("component"));
  assert.ok(maintenance.tags.includes("maintenance"));
  assert.ok(arabicSafety.tags.includes("safety"));
  assert.equal(safety.pageNumber, 12);
  assert.equal(source.slice(safety.startOffset, safety.endOffset), safety.text);
  assert.match(safety.id, /^p12:line/);
  for (const candidate of candidates) {
    assert.equal(candidate.reviewStatus, "candidate");
    assert.equal(candidate.eligibleForDiagnosis, false);
  }
});

test("knowledge candidate extraction does not invent candidates from generic prose", () => {
  assert.deepEqual(Core.extractKnowledgeCandidates("This paragraph contains only general introductory wording.", { pageNumber: 2 }), []);
});

test("BM25-style ranking rewards query coverage over a single repeated keyword", () => {
  const chunks = [
    { id: "partial", text: "bearing bearing bearing bearing", tokens: ["bearing","bearing","bearing","bearing"] },
    { id: "complete", text: "bearing temperature vibration trend", tokens: ["bearing","temperature","vibration","trend"] }
  ];
  assert.equal(Core.rankChunks("bearing temperature", chunks, 2)[0].doc.id, "complete");
});
