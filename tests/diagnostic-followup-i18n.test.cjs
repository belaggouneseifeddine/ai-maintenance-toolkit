const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "diagnostic-flows.js"), "utf8"), context);
const registry = context.window.MAINTENANCE_DIAGNOSTIC_FLOWS;

test("motor and compressor overheat follow-ups provide complete AR/EN/FR copy", () => {
  for (const key of ["motor|overheat", "compressor|overheat"]) {
    const flow = registry.flows[key];
    assert.ok(flow, key + " must exist");
    for (const language of ["ar", "en", "fr"]) {
      const localized = registry.getLocalizedFollowup(key, language);
      assert.ok(localized.question.trim(), key + " question missing for " + language);
      assert.equal(localized.answers.length, 3, key + " answer count changed");
      assert.ok(localized.answers.every(answer => answer.label.trim()), key + " answer label missing for " + language);
      assert.ok(localized.answers.every(answer => answer.guidance.trim()), key + " guidance missing for " + language);
      assert.ok(localized.placeholder.trim(), key + " placeholder missing for " + language);
    }
  }
});

test("English and French copy are not silently replaced by the Arabic fallback", () => {
  for (const key of ["motor|overheat", "compressor|overheat"]) {
    const arabic = registry.getLocalizedFollowup(key, "ar");
    const english = registry.getLocalizedFollowup(key, "en");
    const french = registry.getLocalizedFollowup(key, "fr");
    assert.notEqual(english.question, arabic.question);
    assert.notEqual(french.question, arabic.question);
    assert.notEqual(english.answers[0].label, arabic.answers[0].label);
    assert.notEqual(french.answers[0].label, arabic.answers[0].label);
  }
});

test("unsupported languages fall back to Arabic and unknown flow keys return null", () => {
  const arabic = registry.getLocalizedFollowup("motor|overheat", "ar");
  const unsupported = registry.getLocalizedFollowup("motor|overheat", "de");
  assert.equal(unsupported.question, arabic.question);
  assert.equal(unsupported.answers[0].label, arabic.answers[0].label);
  assert.equal(registry.getLocalizedFollowup("unknown|symptom", "en"), null);
});

test("main follow-up UI re-renders on language change and uses the localized resolver", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /getLocalizedFollowup\?\./);
  assert.match(html, /maintenance-language-changed/);
  assert.match(html, /sel\.replaceChildren\(\)/);
});
