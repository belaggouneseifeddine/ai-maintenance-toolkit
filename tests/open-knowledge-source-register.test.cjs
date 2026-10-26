const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const registerPath = path.join(__dirname, "..", "knowledge", "open-knowledge-source-register.json");

test("open knowledge source register is discovery-only and does not claim unverified reuse rights", () => {
  const register = JSON.parse(fs.readFileSync(registerPath, "utf8"));
  assert.equal(register.schemaVersion, 1);
  assert.match(register.purpose, /not an imported fault database/i);
  assert.match(register.policy, /exact license/i);
  assert.match(register.policy, /do not by themselves grant redistribution rights/i);
  assert.ok(Array.isArray(register.sources));
  assert.ok(register.sources.length > 0);
  const ids = new Set();
  for (const source of register.sources) {
    assert.ok(source.id && typeof source.id === "string");
    assert.ok(!ids.has(source.id), `duplicate source id: ${source.id}`);
    ids.add(source.id);
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.title && source.type && source.potentialUse);
    assert.ok(source.licenseStatus && source.decision);
    if (/not-yet-verified|require separate review|unresolved/i.test(source.licenseStatus)) {
      assert.match(source.decision, /do-not-import|ideas-only|discovery-only|review/i);
    }
  }
});
