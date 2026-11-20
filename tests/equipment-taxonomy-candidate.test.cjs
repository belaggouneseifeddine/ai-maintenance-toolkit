const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("equipment expansion roadmap remains candidate-only and covers all requested domains", () => {
  const path = "knowledge/candidates/equipment-taxonomy/equipment-family-expansion-roadmap.json";
  const roadmap = JSON.parse(fs.readFileSync(path, "utf8"));
  assert.equal(roadmap.status, "candidate_taxonomy_roadmap");
  assert.equal(roadmap.runtimeEligible, false);
  const ids = roadmap.domains.map(item => item.id);
  for (const expected of ["rotating_equipment", "fluid_power", "automation_and_controls", "thermal_and_building_systems", "material_handling_and_machining", "process_industries"]) {
    assert.ok(ids.includes(expected), "missing domain: " + expected);
  }
  assert.ok(roadmap.domains.every(item => Array.isArray(item.families) && item.families.length > 0));
});
