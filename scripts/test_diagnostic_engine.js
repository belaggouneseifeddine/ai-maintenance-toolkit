#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
global.window = global;
vm.runInThisContext(fs.readFileSync("normalization.js", "utf8"), { filename: "normalization.js" });
vm.runInThisContext(fs.readFileSync("diagnostic-engine.js", "utf8"), { filename: "diagnostic-engine.js" });
const library = JSON.parse(fs.readFileSync("faults.json", "utf8"));
assert.equal(library.faults.length > 100, true, "expanded local fault library must contain more than 100 cases");
assert.equal(new Set(library.faults.map(f => f.id)).size, library.faults.length, "fault IDs must be unique");
for (const fault of library.faults) {
  assert.ok(fault.title && fault.title.ar && fault.title.fr && fault.title.en, `trilingual title missing: ${fault.id}`);
  assert.ok(fault.keywords && fault.keywords.ar?.length && fault.keywords.fr?.length && fault.keywords.en?.length, `trilingual keywords missing: ${fault.id}`);
  assert.ok(Array.isArray(fault.causes) && fault.causes.length >= 2, `cause hypotheses missing: ${fault.id}`);
  assert.ok(Array.isArray(fault.safeChecks) && fault.safeChecks.length >= 3, `safe checks missing: ${fault.id}`);
}
const engine = global.MaintenanceDiagnosticEngine;
function diagnose(equipmentType, symptom, observations = "", language = "ar") {
  return engine.diagnose({ equipmentType, symptom, observations, language }, library);
}
const motorAr = diagnose("motor", "not_start");
assert.equal(motorAr.matched, true, "motor no-start should match without notes");
assert.equal(motorAr.results.some(item => item.id === "motor-no-start"), true, "baseline motor no-start case remains available among candidates");
assert.equal(diagnose("moteur électrique", "ne démarre pas", "", "fr").matched, true, "French aliases should match");
assert.equal(diagnose("VFD", "trip", "", "en").results.some(item => item.id === "vfd-trip"), true, "VFD trip case should remain available among matching results");
assert.equal(diagnose("compressor", "overheating", "", "en").matched, true, "compressor overheating should match");
assert.equal(diagnose("motor", "low_pressure").matched, false, "unrelated equipment/symptom pair must not match");
assert.equal(diagnose("motor", "trip", "", "en").matched, true, "expanded motor trip case should match");
assert.equal(diagnose("VFD", "trip", "", "en").matched, true, "expanded VFD trip cases should match");
assert.equal(diagnose("compressor", "overheating", "", "en").matched, true, "expanded compressor temperature cases should match");
assert.equal(diagnose("pump", "low_flow", "", "en").matched, true, "expanded pump flow cases should match");
const lowEvidence = diagnose("motor", "not_start", "", "en");
assert.equal(lowEvidence.results[0].score, 7, "equipment + symptom gives preliminary score, no notes required");
assert.match(lowEvidence.results[0].rankingReason, /Preliminary match only|Equipment type match|Type d’équipement correspondant|تطابق نوع المعدة/);
console.log("PASS: local diagnostic matching tests");
