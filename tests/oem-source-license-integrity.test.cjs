const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const oem = JSON.parse(fs.readFileSync("knowledge/oem-verified-faults.json", "utf8"));
const registry = JSON.parse(fs.readFileSync("knowledge/manufacturer-sources.json", "utf8"));
const sourceById = new Map(registry.sources.map(source => [source.id, source]));

test("all OEM manual claims resolve to a registered exact-scope source and explicit reference-only license state", () => {
  assert.equal(oem.recordCount, oem.records.length);
  assert.equal(oem.manualClaimReviewedCount, oem.records.length);
  assert.equal(oem.pendingClaimReviewCount, 0);
  assert.ok(oem.evidencePolicy.notEquivalentTo.includes("Manual claim review is not field validation"));

  for (const record of oem.records) {
    const source = record.source;
    assert.ok(source && source.sourceId, record.id + " missing source ID");
    assert.ok(source.manualTitle && source.manualUrl && source.revision && source.section, record.id + " missing manual locator");
    assert.ok(source.printedPage || source.printedPageLabel || source.pdfPage, record.id + " missing page locator");
    assert.ok(record.modelScope && record.limitations, record.id + " missing scope/limitations");
    assert.equal(record.evidenceStatus, "verified-source-exact-scope", record.id);

    const registered = sourceById.get(source.sourceId);
    assert.ok(registered, record.id + " source ID not in manufacturer-sources.json");
    assert.equal(registered.url, source.manualUrl, record.id + " manual URL differs from source register");
    assert.equal(registered.fetchAllowed, false, record.id + " OEM manual must remain non-fetchable");
    assert.match(registered.licenseStatus, /no open reuse license verified/i);
    assert.match(registered.reuseStatus, /no redistribution rights verified/i);
    assert.equal(record.licenseStatus, "reference_only_no_redistribution");
    assert.equal(source.licenseStatus, "reference_only_no_redistribution");
  }
});

test("manufacturer machine matrix documentation references resolve to registered sources", () => {
  const matrix = JSON.parse(fs.readFileSync("knowledge/manufacturer-machine-fault-matrix.json", "utf8"));
  for (const profile of matrix.manufacturerProfiles) {
    for (const sourceId of profile.docs || []) {
      assert.ok(sourceById.has(sourceId), profile.id + " has unregistered document " + sourceId);
    }
  }
});
