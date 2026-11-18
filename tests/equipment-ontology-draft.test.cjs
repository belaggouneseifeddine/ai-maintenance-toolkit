const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

test("equipment ontology draft covers requested families but is excluded from runtime", () => {
  const file = path.join(root, "knowledge/experimental/equipment-ontology-draft.json");
  const ontology = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.equal(ontology.status, "experimental-not-runtime");
  assert.equal(ontology.runtimeEligible, false);
  const ids = new Set(ontology.families.map(item => item.id));
  for (const id of [
    "centrifugal-pumps", "electric-motors", "bearings", "gearboxes", "compressors",
    "industrial-fans", "hydraulic-systems", "pneumatic-systems", "industrial-valves",
    "plc", "hmi", "scada", "sensors-and-instrumentation", "actuators", "hvac",
    "refrigeration", "boilers", "heat-exchangers", "conveyors", "industrial-robots",
    "cnc-machines", "chemical-process", "oil-and-gas", "power-generation", "water-and-wastewater"
  ]) assert.ok(ids.has(id), "missing equipment family: " + id);
  assert.ok(ontology.families.every(item => Array.isArray(item.components) && item.components.length > 0));
  assert.equal(ontology.families.some(item => Object.prototype.hasOwnProperty.call(item, "faults")), false);
  const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  assert.equal(serviceWorker.includes("equipment-ontology-draft.json"), false);
});
