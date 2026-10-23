const test = require("node:test");
const assert = require("node:assert/strict");
require("../normalization.js");

const normalization = global.MaintenanceNormalization;

test("shared normalization handles French accents and Arabic letter variants", () => {
  assert.equal(normalization.normalizeText("Moteur Électrique"), "moteur electrique");
  assert.equal(normalization.normalizeText("مُضَخَّة"), "مضخه");
  assert.equal(normalization.normalizeText("إِنذار"), "انذار");
});

test("confirmed equipment and symptom aliases map consistently across languages", () => {
  for (const value of ["pump", "pompe", "مضخة", "water pump"]) {
    assert.equal(normalization.canonicalize(value, "equipment").canonical, "pump", value);
  }
  for (const value of ["ne démarre pas", "not starting", "لا يبدأ"]) {
    assert.equal(normalization.canonicalize(value, "symptom").canonical, "not_start", value);
  }
  assert.equal(normalization.canonicalize("bruit", "symptom").canonical, "noise_vibration");
  assert.equal(normalization.canonicalize("faible débit", "symptom").canonical, "low_flow_pressure");
});

test("uncertain colloquial and Arabizi aliases are explicitly marked for review, not auto-mapped", () => {
  for (const value of ["بومبة", "pompa", "ma ydemarrich", "ما يحبش يشعل"]) {
    const domain = value === "بومبة" || value === "pompa" ? "equipment" : "symptom";
    const result = normalization.canonicalize(value, domain);
    assert.equal(result.status, "review_required", value);
    assert.equal(result.canonical, null, value);
  }
  const reviewAliases = normalization.getReviewAliases();
  assert.ok(reviewAliases.length > 0);
  assert.ok(reviewAliases.every(item => item.status === "review_required" && item.alias && item.canonical));
  assert.equal(normalization.aliasReviewCount, reviewAliases.length);
});

test("retrieval expansion improves confirmed aliases without promoting review-only aliases", () => {
  const confirmed = normalization.expandQuery("pompe faible débit");
  assert.ok(confirmed.tokens.includes("pump"));
  assert.ok(confirmed.tokens.includes("low_flow"));
  assert.equal(confirmed.reviewCandidates.length, 0);

  const uncertain = normalization.expandQuery("بومبة");
  assert.ok(uncertain.reviewCandidates.some(item => item.status === "review_required"));
  assert.equal(uncertain.tokens.includes("pump"), false);
});
