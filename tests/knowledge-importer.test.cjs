const test = require("node:test");
const assert = require("node:assert/strict");
const Importer = require("../knowledge-importer.js");

const source = {
  sourceId: "test-source", title: "Test source", owner: "Test owner",
  url: "https://example.org/source", version: "1.0",
  sourceType: "dataset", codeLicense: "MIT", dataLicense: "CC-BY-4.0",
  attribution: "Credit Test owner", reuseStatus: "reuse_permitted"
};

test("JSON import is staged and cannot enter runtime", () => {
  const result = Importer.importContent({ format: "json", content: JSON.stringify({ cases: [{ caseId: "CP-001" }] }), source });
  assert.equal(result.ok, true);
  assert.equal(result.status, "staged_only");
  assert.equal(result.runtimeEligible, false);
  assert.equal(result.items[0].reviewStatus, "candidate");
});

test("CSV parser handles quoted commas and escaped quotes", () => {
  const rows = Importer.parseCsv('name,notes\nPump,"seal, bearing"\nMotor,"said ""stop"""');
  assert.equal(rows[0].notes, "seal, bearing");
  assert.equal(rows[1].notes, 'said "stop"');
});

test("duplicate, empty and unsafe CSV headers are rejected", () => {
  assert.throws(() => Importer.parseCsv("name,name\na,b"), /csv_invalid_or_duplicate_headers/);
  assert.throws(() => Importer.parseCsv('name,notes\nA,"unfinished'), /csv_unclosed_quote/);
});

test("missing or ambiguous licensing metadata blocks even staging", () => {
  const result = Importer.importContent({ format: "text", content: "candidate notes", source: { ...source, dataLicense: "" } });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("data_license_or_not_applicable_required"));
});

test("non-HTTPS sources and unknown rights labels are rejected", () => {
  assert.equal(Importer.validateSource({ ...source, url: "http://example.org" }).ok, false);
  assert.equal(Importer.validateSource({ ...source, reuseStatus: "approved" }).ok, false);
});

test("prototype-polluting JSON keys are rejected", () => {
  const result = Importer.importContent({ format: "json", content: '{"__proto__":{"polluted":true}}', source });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("unsafe_json_key"));
});

test("oversized payloads are rejected before parsing", () => {
  const result = Importer.importContent({ format: "text", content: "x".repeat(5 * 1024 * 1024 + 1), source });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("content_exceeds_5_mib_limit"));
});

test("Markdown and text remain raw document candidates, not fault cases", () => {
  const result = Importer.importContent({ format: "markdown", content: "# Pump\nPotential issue", source });
  assert.equal(result.items[0].itemType, "document_candidate");
  assert.deepEqual(result.items[0].raw, { text: "# Pump\nPotential issue" });
});
