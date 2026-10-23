#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
global.window = global;
vm.runInThisContext(fs.readFileSync("diagnostic-engine.js", "utf8"), { filename: "diagnostic-engine.js" });
const library = JSON.parse(fs.readFileSync("faults.json", "utf8"));
assert.equal(library.faults.length >= 10, true, "fault library should cover more than pumps");
const engine = global.MaintenanceDiagnosticEngine;
function diagnose(equipmentType, symptom, observations = "", language = "ar") {
  return engine.diagnose({ equipmentType, symptom, observations, language }, library);
}
const motorAr = diagnose("motor", "not_start");
assert.equal(motorAr.matched, true, "motor no-start should match without notes");
assert.equal(motorAr.results[0].id, "motor-no-start");
assert.equal(diagnose("moteur électrique", "ne démarre pas", "", "fr").matched, true, "French aliases should match");
assert.equal(diagnose("VFD", "trip", "", "en").results[0].id, "vfd-trip", "VFD alias should match");
assert.equal(diagnose("compressor", "overheating", "", "en").matched, true, "compressor overheating should match");
assert.equal(diagnose("motor", "low_pressure").matched, false, "unrelated equipment/symptom pair must not match");
const lowEvidence = diagnose("motor", "not_start", "", "en");
assert.equal(lowEvidence.results[0].score, 7, "equipment + symptom gives preliminary score, no notes required");
assert.match(lowEvidence.results[0].rankingReason, /Preliminary match only|Equipment type match|Type d’équipement correspondant|تطابق نوع المعدة/);
console.log("PASS: local diagnostic matching tests");
