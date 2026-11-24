const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const registerPath = path.join(__dirname, "..", "knowledge", "open-knowledge-source-register.json");

test("open knowledge source register is discovery-only and does not claim unverified reuse rights", () => {
  const register = JSON.parse(fs.readFileSync(registerPath, "utf8"));
  assert.match(register.purpose, /not an imported fault database/i);
  assert.match(register.policy, /exact license/i);
  assert.match(register.policy, /do not by themselves grant redistribution rights/i);
  assert.ok(Array.isArray(register.sources));
  assert.ok(register.sources.length > 0);
  assert.equal(register.schemaVersion, 2);
  const allUrls = register.sources.map(source => (source.url.endsWith("/") ? source.url.slice(0, -1) : source.url).toLowerCase());
  assert.equal(new Set(allUrls).size, allUrls.length, "upstream repository URLs must be unique");
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
  const upstream = register.sources.filter(source =>
    source.url.includes("github.com/yilin-2511/industrial-ops-rag-agent") ||
    source.url.includes("github.com/PlantCraft/PlantCraft") ||
    source.url.includes("github.com/bbartling/open-fdd")
  );
  const canonicalUrls = new Set(upstream.map(source => source.url.replace(/\/$/, "").toLowerCase()));
  assert.equal(canonicalUrls.size, upstream.length, "one canonical record per upstream repository URL");
  const plantcraft = register.sources.find(source => source.id === "plantcraft");
  assert.equal(plantcraft.owner, "PlantCraft");
  assert.equal(plantcraft.url, "https://github.com/PlantCraft/PlantCraft");
  assert.match(plantcraft.codeLicense, /Apache-2.0/);
  assert.match(plantcraft.dataLicense, /not separately verified/i);
  const openFdd = register.sources.find(source => source.id === "open-fdd");
  assert.ok(openFdd, "Open-FDD must be tracked");
  assert.equal(openFdd.owner, "bbartling");
  assert.match(openFdd.codeLicense, /MIT/);
  assert.match(openFdd.dataLicense, /not separately verified/i);
  assert.match(openFdd.decision, /reference-only|pending/i);
});


test("2026-11-24 discovered repositories remain quarantined with separate code/data rights", () => {
  const auditRegister = JSON.parse(fs.readFileSync(registerPath, "utf8"));
  const ids = [
    "scada-mv-ids",
    "ics-telemetry-dataset",
    "pivot-anomaly-detection-cps",
    "mfarthas-pump-maintenance",
    "awesome-bearing-dataset",
    "fsbrick",
    "designmukesh-hydraulic-condition-monitoring"
  ];
  for (const id of ids) {
    const source = auditRegister.sources.find(item => item.id === id);
    assert.ok(source, "missing audit record: " + id);
    assert.equal(source.reviewStatus, "reviewed-2026-11-24");
    assert.equal(source.runtimeImport, false);
    assert.ok(source.owner && source.lastUpdated && source.lastPushed);
    assert.ok(source.codeLicense && source.dataLicense);
    assert.ok(Array.isArray(source.filesReviewed) && source.filesReviewed.length > 0);
    assert.ok(source.contentsReviewed && source.originalDataSource);
    assert.ok(source.reuseConditions && source.androidWorkerCompatibility);
    assert.match(source.decision, /discovery-only|reference-only|benchmark-only|research-reference-only/);
  }
  assert.match(auditRegister.sources.find(item => item.id === "scada-mv-ids").dataLicense, /CC BY 4.0 claimed by README only/);
  assert.match(auditRegister.sources.find(item => item.id === "pivot-anomaly-detection-cps").codeLicense, /All Rights Reserved/);
  assert.match(auditRegister.sources.find(item => item.id === "mfarthas-pump-maintenance").codeLicense, /not declared/);
  assert.match(auditRegister.sources.find(item => item.id === "awesome-bearing-dataset").dataLicense, /Per-dataset/);
  assert.match(auditRegister.sources.find(item => item.id === "designmukesh-hydraulic-condition-monitoring").codeLicense, /not declared/);
});
