const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "knowledge", "schemas", "diagnostic-case.schema.json");

test("diagnostic case schema is valid JSON and remains a draft contract", () => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.properties.schemaVersion.const, "1.0-draft");
  assert.equal(schema.additionalProperties, false);
});

test("publishable case contract requires evidence, tests, safety and verification", () => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  for (const key of [
    "equipment", "applicability", "mechanism", "symptoms", "hypotheses",
    "measurements", "tests", "safety", "sourceClaims", "verification", "limitations"
  ]) {
    assert.ok(schema.required.includes(key), `missing required root field: ${key}`);
  }
});

test("measurement provenance distinguishes physical, PLC, estimated and unknown values", () => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const measurement = schema.properties.measurements.items;
  assert.deepEqual(measurement.properties.quality.enum, [
    "measured", "plc_indicated", "estimated", "unknown"
  ]);
  assert.deepEqual(measurement.properties.value.type, ["number", "null"]);
  for (const key of ["unit", "location", "operatingCondition"]) {
    assert.ok(measurement.required.includes(key));
  }
});

test("test records require explicit stop conditions and expected outcomes", () => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const testCase = schema.properties.tests.items;
  assert.ok(testCase.required.includes("stopConditions"));
  assert.ok(testCase.required.includes("expectedOutcomes"));
  assert.equal(testCase.properties.stopConditions.minItems, 1);
});

test("source claims keep technical review, license and reuse decisions separate", () => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const source = schema.properties.sourceClaims.items.properties;
  assert.ok(source.reviewStatus.enum.includes("passage_reviewed"));
  assert.ok(source.licenseStatus.enum.includes("not_declared"));
  assert.ok(source.reuseDecision.enum.includes("pending"));
  assert.ok(source.evidenceClass.enum.includes("oem_model_specific"));
  assert.ok(source.evidenceClass.enum.includes("industry_technical_reference"));
});

test("draft schema is not wired into production runtime", () => {
  for (const file of ["index.html", "worker.js", "service-worker.js"]) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, "utf8");
    assert.equal(source.includes("diagnostic-case.schema.json"), false, `${file} must not load the draft schema`);
  }
});

test("centrifugal-pump candidate pack has consistent IDs and references", () => {
  const packPath = path.join(root, "knowledge", "candidates", "centrifugal-pump-diagnostic-cases-v1.json");
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));

  assert.equal(pack.status, "candidate-only-not-runtime");
  assert.equal(pack.runtimeEligible, false);
  assert.equal(pack.caseCount, pack.cases.length);

  const caseIds = pack.cases.map(item => item.caseId);
  assert.equal(new Set(caseIds).size, caseIds.length, "case IDs must be unique");

  for (const item of pack.cases) {
    const hypothesisIds = item.hypotheses.map(hypothesis => hypothesis.hypothesisId);
    const sourceClaimIds = item.sourceClaims.map(source => source.claimId);
    assert.equal(new Set(hypothesisIds).size, hypothesisIds.length, item.caseId + ": duplicate hypothesis ID");
    assert.equal(new Set(sourceClaimIds).size, sourceClaimIds.length, item.caseId + ": duplicate source claim ID");

    for (const diagnosticTest of item.tests) {
      for (const outcome of diagnosticTest.expectedOutcomes) {
        assert.ok(hypothesisIds.includes(outcome.hypothesisId),
          item.caseId + "/" + diagnosticTest.testId + ": unknown expected-outcome hypothesis " + outcome.hypothesisId);
      }
      for (const sourceClaimId of diagnosticTest.sourceClaimIds || []) {
        assert.ok(sourceClaimIds.includes(sourceClaimId),
          item.caseId + "/" + diagnosticTest.testId + ": unknown source claim " + sourceClaimId);
      }
    }
  }
});

test("CP-001 links the reviewed Hydraulic Institute NPSH passage as reference-only", () => {
  const packPath = path.join(root, "knowledge", "candidates", "centrifugal-pump-diagnostic-cases-v1.json");
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  const cp001 = pack.cases.find(item => item.caseId === "CP-001");
  const claim = cp001.sourceClaims.find(item => item.claimId === "hydraulic-institute-npsh-cavitation");

  assert.ok(claim, "CP-001 must retain its NPSH source claim");
  assert.equal(claim.reviewStatus, "passage_reviewed");
  assert.equal(claim.licenseStatus, "reference_only");
  assert.equal(claim.reuseDecision, "summary_and_link_only");
  assert.equal(claim.evidenceClass, "industry_technical_reference");
});
