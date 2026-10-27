const test = require("node:test");
const assert = require("node:assert/strict");

require("../normalization.js");
const diagnostic = require("../diagnostic-engine.js");
const evaluation = require("../reasoning-evaluation.js");

const knownFaults = {
  faults: [{
    id: "pump-noise-known-case",
    equipmentType: "pump",
    symptoms: ["noise"],
    title: { ar: "ضجيج المضخة", fr: "Bruit de pompe", en: "Pump noise" },
    keywords: { ar: ["اهتزاز", "محمل"], fr: ["vibration", "roulement"], en: ["vibration", "bearing"] },
    causes: [{
      id: "bearing-wear",
      label: { ar: "تآكل محتمل في المحمل", fr: "Usure possible du roulement", en: "Possible bearing wear" },
      keywords: ["bearing", "vibration", "محمل", "اهتزاز"]
    }],
    safeChecks: [{ ar: "سجّل الاهتزاز من مؤشر متاح؛ افحص بعد العزل.", fr: "Consigner la vibration; inspecter après isolement.", en: "Record available vibration trend; inspect after isolation." }],
    escalation: { ar: "صعّد لفني مختص إذا استمر الاهتزاز.", fr: "Escalader si la vibration persiste.", en: "Escalate to qualified personnel if vibration persists." }
  }]
};

test("known case ranks a hypothesis supported by observations without confirming it", () => {
  const result = diagnostic.analyse({
    machine: "pump",
    symptom: "noise",
    observations: "bearing vibration",
    language: "en"
  }, knownFaults);
  assert.equal(result.mode, "local-pattern");
  assert.ok(result.hypotheses.some(item => item.id === "bearing-wear"));
  assert.equal(result.confirmedCause, "");
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
});

test("insufficient evidence requests more information and leaves cause unconfirmed", () => {
  const result = diagnostic.analyse({
    machine: "pump",
    symptom: "noise",
    observations: "",
    language: "en"
  }, { faults: [] });
  assert.equal(result.confirmedCause, "");
  assert.ok(result.missing.length > 0);
  assert.ok(["exploratory", "insufficient"].includes(result.mode));
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
});

test("safe-check output and evidence limitations are explicit", () => {
  const result = diagnostic.analyse({
    machine: "pump",
    symptom: "noise",
    observations: "bearing vibration",
    language: "en"
  }, knownFaults);
  assert.ok(result.hypotheses[0].nextCheck);
  assert.ok(result.hypotheses[0].evidenceFor.includes("bearing"));
  assert.match(result.note, /not direct proof|not confirmed/i);
});

test("confirmed actual outcome is compared against predicted hypotheses", () => {
  const result = evaluation.createOutcomeRecord({
    mode: "local-pattern",
    hypotheses: [{ id: "bearing-wear" }, { id: "alignment" }]
  }, {
    status: "confirmed",
    actualCauseId: "bearing-wear",
    intervention: "bearing replaced by qualified technician",
    observedResult: "vibration returned to baseline"
  });
  assert.equal(result.ok, true);
  assert.equal(result.record.comparison, "hit");
  assert.equal(result.record.prediction.confirmedCause, "");
});

test("confirmed cause outside the candidate list is scored as a miss", () => {
  const result = evaluation.createOutcomeRecord({
    mode: "local-pattern",
    hypotheses: [{ id: "bearing-wear" }]
  }, { status: "confirmed", actualCauseId: "misalignment" });
  assert.equal(result.record.comparison, "miss");
});

test("unresolved cases are not incorrectly counted as successes or failures", () => {
  const result = evaluation.createOutcomeRecord({
    mode: "insufficient",
    hypotheses: []
  }, { status: "unresolved", notes: "No safe confirmation available yet" });
  assert.equal(result.record.comparison, "indeterminate");
});

test("invalid outcome data is rejected", () => {
  assert.equal(evaluation.createOutcomeRecord({}, { status: "confirmed", actualCauseId: "x" }).ok, false);
  assert.equal(evaluation.createOutcomeRecord({ hypotheses: [] }, { status: "confirmed" }).ok, false);
});
