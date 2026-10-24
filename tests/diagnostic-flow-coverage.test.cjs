const test = require("node:test");
const assert = require("node:assert/strict");

const library = require("../faults.json");
const coverage = require("../diagnostic-flow-coverage.json");

test("every declared flow has an explicit coverage decision and truthful matching fault IDs", () => {
  const faults = library.faults;
  const flowKeys = Object.keys(coverage.flows);
  assert.ok(flowKeys.length > 0, "flow coverage register must not be empty");

  for (const [key, entry] of Object.entries(coverage.flows)) {
    const [equipmentType, symptomId] = key.split("|");
    assert.ok(equipmentType && symptomId, "invalid flow key: " + key);
    assert.ok(
      ["covered-exact", "gap-needs-review", "covered-reviewed-mapping"].includes(entry.status),
      key + ": missing explicit coverage status"
    );
    assert.ok(Array.isArray(entry.matchingFaultIds), key + ": matchingFaultIds must be an array");

    const actualMatches = faults.filter(fault =>
      fault.equipmentType === equipmentType && fault.symptoms.includes(symptomId)
    );
    if (entry.status === "covered-exact") {
      assert.ok(actualMatches.length > 0, key + ": marked exact-covered without a matching fault");
      for (const id of entry.matchingFaultIds) {
        assert.ok(actualMatches.some(fault => fault.id === id),
          key + ": declared fault ID does not match exact equipment/symptom: " + id);
      }
      assert.ok(entry.matchingFaultIds.length > 0, key + ": exact coverage needs at least one fault ID");
    } else if (entry.status === "gap-needs-review") {
      assert.equal(actualMatches.length, 0, key + ": gap status is stale; review and update coverage");
      assert.ok(typeof entry.note === "string" && entry.note.trim(),
        key + ": gap must explain what needs review");
      assert.equal(entry.matchingFaultIds.length, 0, key + ": unresolved gap cannot claim matching fault IDs");
    } else {
      assert.ok(entry.mapping && entry.mapping.reviewedBy && entry.mapping.reviewedOn && entry.mapping.rationale,
        key + ": reviewed mapping needs reviewer, date, and rationale");
      assert.ok(entry.matchingFaultIds.length > 0, key + ": reviewed mapping needs matching fault IDs");
    }
  }
});

test("coverage register includes every structured diagnostic flow", () => {
  global.window = {};
  require("../diagnostic-flows.js");
  const structuredFlows = global.window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows;
  assert.deepEqual(
    Object.keys(coverage.flows).sort(),
    Object.keys(structuredFlows).sort(),
    "coverage register must stay in sync with diagnostic-flows.js"
  );
});
