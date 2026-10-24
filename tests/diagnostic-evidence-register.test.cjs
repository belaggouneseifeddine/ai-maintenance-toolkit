const test = require("node:test");
const assert = require("node:assert/strict");

const library = require("../faults.json");
const evidence = require("../diagnostic-evidence-register.json");

test("evidence register covers every fault without silently claiming verification", () => {
  assert.equal(evidence.schemaVersion, 1);
  assert.ok(evidence.records && typeof evidence.records === "object");
  const faultIds = new Set(library.faults.map(fault => fault.id));
  const registerIds = new Set(Object.keys(evidence.records));

  for (const id of faultIds) {
    assert.ok(evidence.records[id], "evidence status missing for fault: " + id);
    const record = evidence.records[id];
    assert.ok(
      ["source-not-recorded", "review-needed", "verified"].includes(record.status),
      id + ": invalid evidence status"
    );
    assert.ok(Array.isArray(record.references), id + ": references must be an array");
    if (record.status === "verified") {
      assert.ok(record.references.length > 0, id + ": verified status requires traceable references");
    }
  }

  for (const id of registerIds) {
    assert.ok(faultIds.has(id), "orphan evidence entry for unknown fault: " + id);
  }
  assert.equal(registerIds.size, faultIds.size, "register and fault library must stay in sync");
});

test("current evidence gaps are explicit rather than silently marked verified", () => {
  for (const [id, record] of Object.entries(evidence.records)) {
    if (record.references.length === 0) {
      assert.notEqual(record.status, "verified", id + ": cannot be verified without a reference");
    }
  }
});
