const test = require("node:test");
const assert = require("node:assert/strict");

const library = require("../faults.json");
const supplement = require("../knowledge/faults-supplement.json");
const evidence = require("../diagnostic-evidence-register.json");
const reasoning = require("../evidence-reasoning.js");

test("evidence register covers every fault without silently claiming verification", () => {
  assert.equal(evidence.schemaVersion, 1);
  assert.ok(evidence.records && typeof evidence.records === "object");
  const faultIds = new Set([...library.faults, ...supplement.faults].map(fault => fault.id));
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

test("supplemental general cases expose references without treating them as model-verified", () => {
  for (const fault of supplement.faults) {
    const record = evidence.records[fault.id];
    assert.ok(record, "missing evidence record for supplemental fault: " + fault.id);
    assert.equal(record.status, "review-needed");
    assert.equal(record.scope.scopeType, "general-reference");
    assert.deepEqual(record.scope.manufacturers, []);
    assert.deepEqual(record.scope.models, []);
    assert.deepEqual(
      record.references.map(ref => ref.id).sort(),
      fault.sourceRefs.slice().sort(),
      fault.id + ": evidence panel references must match the fault sourceRefs"
    );
    const evidenceItems = record.references.map(ref => ({
      ...ref,
      status: record.status,
      scope: record.scope || ref.scope || {},
      verifiedClaims: ref.verifiedClaims || []
    }));
    const result = reasoning.analyse({
      equipment: {
        manufacturer: record.scope.manufacturers[0] || "Unverified manufacturer",
        model: "unverified-model"
      },
      evidence: evidenceItems,
      hypotheses: [{
        id: fault.id,
        label: fault.id,
        supportEvidenceIds: evidenceItems.map(ref => ref.id)
      }]
    });
    assert.equal(result.results[0].evidenceState, "insufficient-verified-evidence");
    assert.ok(result.results[0].supportingEvidence.every(ref => !ref.applicable));
  }
});

test("current evidence gaps are explicit rather than silently marked verified", () => {
  for (const [id, record] of Object.entries(evidence.records)) {
    if (record.references.length === 0) {
      assert.notEqual(record.status, "verified", id + ": cannot be verified without a reference");
    }
  }
});
