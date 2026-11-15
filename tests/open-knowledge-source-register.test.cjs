const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const register = JSON.parse(fs.readFileSync(path.join(root, "knowledge", "open-knowledge-source-register.json"), "utf8"));
const schema = JSON.parse(fs.readFileSync(path.join(root, "knowledge", "open-knowledge-source-register.schema.json"), "utf8"));
const required = schema.properties.sources.items.required;
const decisionClasses = new Set(["import_allowed", "reference_only", "isolated_experiment", "rejected", "pending_verification"]);
const licenseStatuses = new Set(["verified", "not_applicable", "not_found", "pending_verification", "per_dataset"]);
const isDateOrNull = value => value === null || (typeof value === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(value));

test("open source register v2 separates code and data rights and matches its schema contract", () => {
  assert.equal(register.schemaVersion, 2);
  assert.equal(schema.properties.schemaVersion.const, 2);
  assert.match(register.purpose, /not an imported fault database/i);
  assert.match(register.policy, /code and data licenses separately/i);
  assert.match(register.policy, /do not copy or import/i);
  assert.ok(Array.isArray(register.sources) && register.sources.length > 0);

  const ids = new Set();
  for (const source of register.sources) {
    for (const field of required) {
      assert.ok(Object.prototype.hasOwnProperty.call(source, field), source.id + " missing " + field);
    }
    assert.ok(source.id && typeof source.id === "string");
    assert.ok(!ids.has(source.id), "duplicate source id: " + source.id);
    ids.add(source.id);
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.title && source.type && source.potentialUse);
    assert.ok(source.licenseStatus && source.decision);
    assert.ok(typeof source.owner === "string" && source.owner.length > 0);
    assert.ok(Array.isArray(source.filesReviewed));
    assert.ok(isDateOrNull(source.lastUpdated), source.id + " has invalid lastUpdated");
    assert.ok(isDateOrNull(source.lastPushed), source.id + " has invalid lastPushed");
    assert.ok(isDateOrNull(source.lastChecked), source.id + " has invalid lastChecked");
    assert.ok(source.version === null || typeof source.version === "string");
    assert.ok(source.latestRelease === null || typeof source.latestRelease === "string");
    assert.ok(decisionClasses.has(source.decisionClass), source.id + " has invalid decisionClass");

    assert.ok(source.licenses && source.licenses.code && source.licenses.data, source.id + " must declare code and data rights separately");
    for (const [kind, license] of Object.entries(source.licenses)) {
      assert.ok(licenseStatuses.has(license.status), source.id + " has invalid " + kind + " license status");
      assert.ok(Object.prototype.hasOwnProperty.call(license, "identifier"));
      assert.ok(Object.prototype.hasOwnProperty.call(license, "evidenceUrl"));
      assert.ok(typeof license.notes === "string" && license.notes.length > 0);
      if (license.status === "verified") {
        assert.ok(typeof license.identifier === "string" && license.identifier.length > 0, source.id + " verified " + kind + " license needs an identifier");
        assert.match(license.evidenceUrl, /^https:\/\//, source.id + " verified " + kind + " license needs an evidence URL");
      }
      if (license.status === "not_applicable") {
        assert.equal(license.identifier, null);
        assert.equal(license.evidenceUrl, null);
      }
      if (["not_found", "pending_verification", "per_dataset"].includes(license.status)) {
        assert.notEqual(source.decisionClass, "import_allowed", source.id + " cannot be import-allowed while " + kind + " rights are unresolved");
      }
    }
    if (source.decisionClass === "import_allowed") {
      for (const license of Object.values(source.licenses)) {
        assert.ok(["verified", "not_applicable"].includes(license.status), source.id + " import requires verified or not-applicable code and data rights");
      }
    }
  }
});

test("duplicate upstream URLs are explicitly linked to one canonical source record", () => {
  const groups = new Map();
  for (const source of register.sources) {
    const key = source.url.replace(/\\/$/, "").toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(source);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const canonical = group.find(source => !source.duplicateOf);
    assert.ok(canonical, "duplicate URL group needs one canonical record: " + group[0].url);
    for (const source of group) {
      if (source.id === canonical.id) continue;
      assert.equal(source.duplicateOf, canonical.id, source.id + " must point to " + canonical.id);
    }
  }
});

test("unverified rights never become import permission", () => {
  for (const source of register.sources) {
    const unresolved = Object.values(source.licenses).some(license => ["not_found", "pending_verification", "per_dataset"].includes(license.status));
    if (unresolved) assert.notEqual(source.decisionClass, "import_allowed", source.id);
  }
});
