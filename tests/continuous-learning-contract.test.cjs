const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("local learning memory stores metadata and requires contributor-confirmed evidence for evaluation candidates", () => {
  const source = read("learning-memory.js");
  assert.ok(source.includes('eventType: "document_ingested"'));
  assert.ok(source.includes('eventType: "diagnostic_prediction"'));
  assert.ok(source.includes('eventType: "diagnostic_outcome"'));
  assert.ok(source.includes('outcomeStatus: "unknown"'));
  assert.ok(source.includes('contributorConfirmed === true'));
  assert.ok(source.includes("candidate-requires-technical-review"));
  assert.ok(source.includes("conflicting-outcomes-requires-review"));
  assert.ok(source.includes("prediction.hypothesisIds || []"));
  assert.ok(source.includes("async function removeDocument(documentId)"));
  assert.ok(source.includes("MAX_EVENTS = 5000"));
  assert.ok(source.includes("heuristic-not-calibrated-probability"));
  assert.equal(source.includes("fetch("), false);
  assert.equal(source.includes("navigator.sendBeacon"), false);
});

test("image ingestion is local OCR only and remains unreviewed and ineligible for diagnosis", () => {
  const library = read("document-library.js");
  const html = read("index.html");
  assert.ok(library.includes("async function importImage(file)"));
  assert.ok(library.includes('"image/jpeg", "image/png", "image/webp"'));
  assert.ok(library.includes("createImageBitmap(file, { resizeWidth: 2048, resizeHeight: 2048, resizeQuality: \"high\" })"));
  assert.ok(library.includes('appendPageChunks(chunks, id, 1, text, "image-ocr", confidence)'));
  assert.ok(library.includes('sourceType: "image"'));
  assert.ok(library.includes('reviewStatus: "unreviewed", eligibleForDiagnosis: false'));
  assert.ok(library.includes('doc.sourceType === "image" ? url'));
  assert.ok(html.includes("image/jpeg,image/png,image/webp"));
  assert.ok(library.includes("recordDocumentIngested"));
});

test("technician feedback is explicit and does not automatically train or mutate the diagnostic engine", () => {
  const ui = read("learning-feedback-ui.js");
  const chat = read("diagnostic-chat.js");
  const index = read("index.html");
  assert.ok(chat.includes("recordDiagnostic"));
  assert.ok(chat.includes("maintenance-diagnostic-learning-case"));
  assert.ok(ui.includes("recordOutcome"));
  assert.ok(ui.includes("evidenceSummary"));
  assert.ok(ui.includes("contributorConfirmed:true"));
  assert.ok(ui.includes("لا تدرب النموذج تلقائيًا"));
  assert.ok(index.includes("learning-memory.js"));
  assert.ok(index.includes("learning-feedback-ui.js"));
  assert.ok(read("sw.js").includes('"./learning-memory.js"'));
  assert.ok(read("sw.js").includes('"./learning-feedback-ui.js"'));
});
