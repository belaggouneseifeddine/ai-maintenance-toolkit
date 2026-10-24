const test = require("node:test");
const assert = require("node:assert/strict");

require("../normalization.js");
const faults = require("../faults.json");
global.MAINTENANCE_FAULTS = faults;
require("../diagnostic-engine.js");

const diagnose = global.MaintenanceDiagnosticEngine.diagnose;

test("fault library has localized titles and safe guidance", () => {
  assert.ok(Array.isArray(faults.faults));
  assert.ok(faults.faults.length > 0);
  for (const fault of faults.faults) {
    for (const language of ["ar", "fr", "en"]) {
      assert.equal(typeof fault.title?.[language], "string", fault.id + ": title missing for " + language);
      assert.ok((fault.safeChecks || []).some(item => typeof item[language] === "string" && item[language].trim()),
        fault.id + ": safe checks missing for " + language);
      assert.equal(typeof fault.escalation?.[language], "string", fault.id + ": escalation missing for " + language);
    }
  }
});

test("pump symptom with supporting observations returns an advisory match", () => {
  const result = diagnose({
    equipmentType: "pump",
    symptom: "noise",
    observations: "صوت حصى واهتزاز",
    language: "ar"
  }, faults);
  assert.equal(result.matched, true);
  assert.ok(result.results.length > 0);
  assert.equal(result.results[0].thresholdMet, true);
  assert.match(result.advisory, /إرشادية/);
});

test("multilingual aliases match motors, drives and compressors without notes", () => {
  const cases = [
    ["moteur électrique", "ne démarre pas", "fr"],
    ["محرك كهربائي", "لا يبدأ", "ar"],
    ["drive", "trip", "en"],
    ["ضاغط هواء", "ارتفاع الحرارة", "ar"],
    ["compresseur", "surchauffe", "fr"]
  ];
  for (const [equipmentType, symptom, language] of cases) {
    const result = diagnose({ equipmentType, symptom, observations: "", language }, faults);
    assert.equal(result.matched, true, equipmentType + " / " + symptom);
    assert.ok(result.results.length > 0);
    assert.ok(result.results.every(item => item.equipmentMatch && item.symptomMatch));
  }
});

test("wrong equipment and symptom do not produce an unrelated result", () => {
  const result = diagnose({ equipmentType: "motor", symptom: "leak", observations: "air filter", language: "en" }, faults);
  assert.equal(result.matched, false);
  assert.equal(result.results.length, 0);
});

test("local fault library covers motors, VFDs and compressors", () => {
  assert.ok(faults.faults.length >= 10);
  for (const equipmentType of ["motor", "vfd", "compressor"]) {
    assert.ok(faults.faults.some(fault => fault.equipmentType === equipmentType), "missing " + equipmentType);
  }
});

test("insufficient evidence does not invent a fault", () => {
  const result = diagnose({
    equipmentType: "motor",
    symptom: "low_pressure",
    observations: "",
    language: "en"
  }, faults);
  assert.equal(result.matched, false);
  assert.equal(result.results.length, 0);
  assert.match(result.message, /No sufficient match/);
});

test("unsupported language falls back to Arabic and shows a tentative equipment/symptom match", () => {
  const result = diagnose({
    equipmentType: "pump",
    symptom: "noise",
    observations: "",
    language: "xx"
  }, faults);
  assert.equal(result.language, "ar");
  assert.equal(result.matched, true);
  assert.ok(result.results.length > 0);
  assert.match(result.results[0].rankingReason, /مطابقة أولية/);
});

test("missing or malformed fault library fails safely", () => {
  const result = diagnose({ equipmentType: "pump", symptom: "noise", language: "en" }, { faults: "invalid" });
  assert.equal(result.matched, false);
  assert.deepEqual(result.results, []);
  assert.match(result.message, /No sufficient match/);
});


test("equipment aliases cover electric_motor, bearing and the UI's PLC/control category", () => {
  const cases = [
    ["electric_motor", "not_start", "en"],
    ["bearing", "vibration", "en"],
    ["plc", "bad_signal", "en"],
    ["sensor", "bad_signal", "en"]
  ];
  for (const [equipmentType, symptom, language] of cases) {
    const result = diagnose({ equipmentType, symptom, observations: "", language }, faults);
    assert.equal(result.matched, true, equipmentType + " / " + symptom);
    assert.ok(result.results.length > 0);
  }
});

test("combined UI symptoms match related fault-library symptom IDs", () => {
  for (const [equipmentType, symptom] of [
    ["pump", "noise"],
    ["pump", "low_flow"],
    ["motor", "overheat"]
  ]) {
    const result = diagnose({ equipmentType, symptom, observations: "", language: "en" }, faults);
    assert.equal(result.matched, true, equipmentType + " / " + symptom);
  }
});

test("local matches report low or medium advisory confidence, never confirmed diagnosis", () => {
  const result = diagnose({ equipmentType: "pump", symptom: "noise", observations: "gravel noise and vibration", language: "en" }, faults);
  assert.equal(result.matched, true);
  for (const fault of result.results) {
    assert.ok(["low", "medium"].includes(fault.confidence));
    assert.match(fault.confidenceLabel, /Low|Medium/);
  }
});

test("fault library has no structured OEM alarm-code index yet", () => {
  assert.ok(faults.faults.every(fault => !Array.isArray(fault.alarmCodes) && !Array.isArray(fault.errorCodes)),
    "Do not claim OEM alarm-code matching until sourced code fields are added");
});


test("local keyword matching respects whole-word and phrase boundaries", () => {
  const customLibrary = {
    faults: [{
      id: "motor-oil-leak",
      equipmentType: "motor",
      symptoms: ["trip"],
      title: { ar: "تسرب زيت", fr: "Fuite d'huile", en: "Oil leak" },
      keywords: { ar: ["زيت"], fr: ["huile"], en: ["oil"] },
      causes: [{
        id: "oil-related",
        label: { ar: "سبب مرتبط بالزيت", fr: "Cause liée à l'huile", en: "Oil-related cause" },
        keywords: ["oil", "huile", "زيت"]
      }],
      safeChecks: [{ ar: "فحص آمن", fr: "Contrôle sûr", en: "Safe check" }],
      escalation: { ar: "صعّد عند الحاجة", fr: "Escalader si nécessaire", en: "Escalate if needed" }
    }]
  };

  const unrelated = diagnose({
    equipmentType: "motor",
    symptom: "trip",
    observations: "The motor is boiling",
    language: "en"
  }, customLibrary);
  assert.equal(unrelated.matched, true);
  assert.deepEqual(unrelated.results[0].matchedKeywords, []);
  assert.deepEqual(unrelated.results[0].causes[0].matchedKeywords, []);
  assert.equal(unrelated.results[0].score, 7);

  const related = diagnose({
    equipmentType: "motor",
    symptom: "trip",
    observations: "Oil leak near the motor",
    language: "en"
  }, customLibrary);
  assert.equal(related.matched, true);
  assert.deepEqual(related.results[0].matchedKeywords, ["oil"]);
  assert.deepEqual(related.results[0].causes[0].matchedKeywords, ["oil"]);
  assert.equal(related.results[0].score, 9);
});

test("local phrase matching tolerates punctuation and repeated whitespace without partial-word matches", () => {
  const customLibrary = {
    faults: [{
      id: "pump-low-flow",
      equipmentType: "pump",
      symptoms: ["low_flow"],
      title: { ar: "تدفق منخفض", fr: "Débit faible", en: "Low flow" },
      keywords: { ar: ["ضعف التدفق"], fr: ["debit faible"], en: ["low flow"] },
      causes: [{
        id: "restricted-flow",
        label: { ar: "تقييد محتمل", fr: "Restriction possible", en: "Possible restriction" },
        keywords: ["low flow"]
      }],
      safeChecks: [{ ar: "فحص آمن", fr: "Contrôle sûr", en: "Safe check" }],
      escalation: { ar: "صعّد عند الحاجة", fr: "Escalader si nécessaire", en: "Escalate if needed" }
    }]
  };
  const result = diagnose({
    equipmentType: "pump",
    symptom: "low_flow",
    observations: "Observed: very   low, flow is reduced.",
    language: "en"
  }, customLibrary);
  assert.equal(result.matched, true);
  assert.deepEqual(result.results[0].matchedKeywords, ["low flow"]);
});
