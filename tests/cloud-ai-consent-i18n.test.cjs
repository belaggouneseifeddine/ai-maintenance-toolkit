const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const i18nSource = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

test("cloud AI consent and measurement controls are translated in all supported languages", () => {
  const match = i18nSource.match(/const dictionaries=(\{[\s\S]*?\n\});\s*let current=/);
  assert.ok(match, "translation dictionaries must remain parseable");
  const dictionaries = vm.runInNewContext("(" + match[1] + ")");
  for (const language of ["ar", "fr", "en"]) {
    const dictionary = dictionaries[language];
    for (const key of ["cloudConsent", "askCloudAI", "simulateCloudAI", "aiSimulationHint", "aiMeasurementStatus"]) {
      assert.equal(typeof dictionary[key], "string", language + "." + key + " must be a string");
      assert.ok(dictionary[key].trim(), language + "." + key + " must not be empty");
    }
    assert.deepEqual(Object.keys(dictionary.measurementOptions).sort(), ["available", "none", "unknown"]);
    assert.match(dictionary.cloudConsent, /Cloudflare/);
    assert.match(dictionary.cloudConsent, /Google Gemini/);
  }
});

test("language switcher applies translations to the cloud AI consent, buttons and measurement options", () => {
  assert.match(i18nSource, /setText\("#aiCloudConsentText",d\.cloudConsent\)/);
  assert.match(i18nSource, /setText\("#askCloudAI",d\.askCloudAI\)/);
  assert.match(i18nSource, /setText\("#simulateCloudAI",d\.simulateCloudAI\)/);
  assert.match(i18nSource, /setText\("#aiSimulationHint",d\.aiSimulationHint\)/);
  assert.match(i18nSource, /setLabel\("aiMeasurementStatus","aiMeasurementStatus"\)/);
  assert.match(i18nSource, /translateOptions\("aiMeasurementStatus",d\.measurementOptions\)/);
  assert.match(html, /id="aiCloudConsent" type="checkbox"/);
  assert.match(html, /id="aiCloudConsentText"/);
  assert.match(html, /id="aiSimulationHint"/);
  const consentInput = html.match(/<input id="aiCloudConsent" type="checkbox"([^>]*)>/);
  assert.ok(consentInput, "consent checkbox must exist");
  assert.doesNotMatch(consentInput[1], /\bchecked\b/, "consent must remain unchecked by default");
});
