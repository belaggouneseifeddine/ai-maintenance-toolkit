const test = require("node:test");
const assert = require("node:assert/strict");
const { createEmbeddingAdapter } = require("../semantic-retrieval/embedding-adapter.js");
const { createVectorIndex } = require("../semantic-retrieval/vector-index.js");

test("embedding adapter is injected and normalizes vectors", async () => {
  let calls = 0;
  const adapter = createEmbeddingAdapter({ dimensions: 2, embed: async text => { calls++; assert.equal(text, "pump vibration"); return [3, 4]; } });
  assert.deepEqual(await adapter.embed("pump vibration"), [0.6, 0.8]);
  assert.equal(adapter.getDimensions(), 2);
  assert.equal(calls, 1);
});
test("embedding adapter locks inferred dimensions and rejects dimension drift", async () => {
  let result = [1, 0, 0];
  const adapter = createEmbeddingAdapter({ embed: async () => result });
  assert.deepEqual(await adapter.embed("first"), [1, 0, 0]);
  result = [1, 0];
  await assert.rejects(adapter.embed("second"), { code: "embedding_dimension_mismatch" });
  assert.equal(adapter.getDimensions(), 3);
});
test("embedding adapter supports batches and validates every vector", async () => {
  const adapter = createEmbeddingAdapter({
    embed: async text => text === "a" ? [1, 0] : [0, 1],
    embedBatch: async texts => texts.map(text => text === "a" ? [1, 0] : [0, 1])
  });
  assert.deepEqual(await adapter.embedBatch(["a", "b"]), [[1, 0], [0, 1]]);
  await assert.rejects(adapter.embedBatch([""]), { code: "invalid_embedding_text" });
});
test("embedding adapter rejects missing implementation, zero and non-finite vectors", async () => {
  assert.throws(() => createEmbeddingAdapter({}), { code: "embed_function_required" });
  await assert.rejects(createEmbeddingAdapter({ embed: async () => [0, 0] }).embed("x"), { code: "zero_embedding" });
  await assert.rejects(createEmbeddingAdapter({ embed: async () => [1, NaN] }).embed("x"), { code: "invalid_embedding_value" });
});
test("vector index ranks cosine similarity and returns stable ties", () => {
  const index = createVectorIndex({ dimensions: 2 });
  index.addBatch([
    { id: "parallel", vector: [4, 0], text: "same direction", metadata: { equipment: "pump" } },
    { id: "diagonal", vector: [1, 1], text: "diagonal", metadata: { equipment: "pump" } },
    { id: "opposite", vector: [-1, 0], text: "opposite", metadata: { equipment: "motor" } }
  ]);
  const results = index.search([1, 0], { topK: 3 });
  assert.deepEqual(results.map(item => item.id), ["parallel", "diagonal", "opposite"]);
  assert.equal(results[0].score, 1);
  assert.ok(Math.abs(results[1].score - Math.SQRT1_2) < 1e-12);
});
test("vector index filters metadata and applies score threshold", () => {
  const index = createVectorIndex({ dimensions: 2 });
  index.addBatch([
    { id: "p1", vector: [1, 0], metadata: { equipment: "pump", language: "ar" } },
    { id: "m1", vector: [0.9, 0.1], metadata: { equipment: "motor", language: "ar" } },
    { id: "p2", vector: [0, 1], metadata: { equipment: "pump", language: "fr" } }
  ]);
  const results = index.search([1, 0], { filter: { equipment: "pump", language: ["ar", "en"] }, topK: 4, minScore: 0.5 });
  assert.deepEqual(results.map(item => item.id), ["p1"]);
  assert.throws(() => index.search([1, 0], { topK: 0 }), { code: "invalid_top_k" });
});
test("vector index batch insertion is atomic when a record is invalid", () => {
  const index = createVectorIndex({ dimensions: 2 });
  assert.throws(() => index.addBatch([{ id: "valid", vector: [1, 0] }, { id: "invalid", vector: [1, 0, 0] }]), { code: "embedding_dimension_mismatch" });
  assert.equal(index.size(), 0);
});
test("vector index replaces by id, removes records and enforces capacity", () => {
  const index = createVectorIndex({ dimensions: 2, maxItems: 1 });
  index.add({ id: "a", vector: [1, 0] });
  index.add({ id: "a", vector: [0, 1] });
  assert.equal(index.size(), 1);
  assert.equal(index.search([0, 1])[0].id, "a");
  assert.throws(() => index.add({ id: "b", vector: [1, 0] }), { code: "index_capacity_reached" });
  assert.equal(index.remove("a"), true);
  assert.equal(index.size(), 0);
});
test("vector index snapshots round-trip and reject incompatible snapshots", () => {
  const first = createVectorIndex({ dimensions: 2 });
  first.add({ id: "s1", vector: [1, 2], text: "manual excerpt", metadata: { sourceId: "OEM-1", page: 12 } });
  const snapshot = first.exportSnapshot();
  const second = createVectorIndex({ dimensions: 2 });
  assert.deepEqual(second.importSnapshot(snapshot), { ok: true, size: 1 });
  assert.deepEqual(second.search([1, 2]).map(item => item.id), ["s1"]);
  assert.throws(() => second.importSnapshot({ ...snapshot, dimensions: 3 }), { code: "invalid_index_snapshot" });
});
test("vector index rejects unsafe metadata and malformed query vectors", () => {
  const index = createVectorIndex({ dimensions: 2 });
  const unsafe = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.throws(() => index.add({ id: "unsafe", vector: [1, 0], metadata: unsafe }), { code: "unsafe_metadata_key" });
  assert.throws(() => index.search([0, 0]), { code: "zero_embedding" });
  assert.equal({}.polluted, undefined);
});
test("vector index copies input and output data defensively", () => {
  const index = createVectorIndex({ dimensions: 2 });
  const metadata = { equipment: "pump" };
  const vector = [3, 4];
  index.add({ id: "a", vector, metadata });
  vector[0] = 0;
  metadata.equipment = "motor";
  const result = index.search([0.6, 0.8])[0];
  assert.equal(result.metadata.equipment, "pump");
  result.metadata.equipment = "compressor";
  assert.equal(index.search([0.6, 0.8])[0].metadata.equipment, "pump");
});
test("vector index snapshot import is atomic when duplicate IDs exist", () => {
  const index = createVectorIndex({ dimensions: 2 });
  index.add({ id: "keep", vector: [1, 0] });
  const snapshot = { version: 1, dimensions: 2, records: [{ id: "dup", vector: [1, 0] }, { id: "dup", vector: [0, 1] }] };
  assert.throws(() => index.importSnapshot(snapshot), { code: "duplicate_snapshot_id" });
  assert.deepEqual(index.search([1, 0]).map(item => item.id), ["keep"]);
});
