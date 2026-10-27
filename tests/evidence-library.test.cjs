const test = require("node:test");
const assert = require("node:assert/strict");
const evidence = require("../evidence-library.js");

test("registry exposes stable source IDs and provenance fields", () => {
  const sources = evidence.listSources();
  assert.ok(sources.length >= 2);
  for (const source of sources) {
    assert.ok(source.id);
    assert.ok(source.title);
    assert.ok(source.publisher);
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.scope);
    assert.ok(source.limitation);
  }
});

test("pump query returns DOE source with explicit limitations", () => {
  const result = evidence.searchSources({
    equipmentType: "pump",
    symptom: "low flow",
    query: "pump curve system performance"
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "sources_found");
  assert.ok(result.results.some(item => item.citationId === "doe-pump-sourcebook"));
  const source = result.results.find(item => item.citationId === "doe-pump-sourcebook");
  assert.match(source.source.url, /^https:\/\//);
  assert.match(source.limitation, /manufacturer's manual/i);
  assert.match(source.interpretation, /does not independently confirm/i);
});

test("LOTO query returns jurisdiction-specific safety reference", () => {
  const result = evidence.searchSources({ query: "lockout tagout hazardous energy maintenance" });
  assert.equal(result.status, "sources_found");
  const source = result.results.find(item => item.citationId === "osha-loto-1910-147");
  assert.ok(source);
  assert.match(source.limitation, /Algerian law/i);
});

test("unmatched query returns no fabricated citation", () => {
  const result = evidence.searchSources({ query: "ultraviolet gearbox lubricant spectral calibration" });
  assert.equal(result.status, "no_matching_sources");
  assert.deepEqual(result.results, []);
});

test("empty, non-string-only, and oversized queries are rejected", () => {
  assert.equal(evidence.searchSources({}).status, "invalid_query");
  assert.equal(evidence.searchSources({ query: 42 }).status, "invalid_query");
  assert.equal(evidence.searchSources({ query: "x".repeat(1201) }).status, "invalid_query");
});

test("results contain only registered source IDs and are capped", () => {
  const known = new Set(evidence.listSources().map(source => source.id));
  const result = evidence.searchSources({
    query: "pump maintenance flow system energy lockout tagout hazardous energy"
  });
  assert.ok(result.results.length <= 5);
  for (const item of result.results) assert.ok(known.has(item.citationId));
});
