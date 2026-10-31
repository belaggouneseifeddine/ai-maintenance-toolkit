const test = require("node:test");
const assert = require("node:assert/strict");
const { analyse, scopeMatches } = require("../evidence-reasoning.js");

const evidence = [
  {
    id: "OEM-1", title: "Pump service manual", url: "https://example.com/manual.pdf",
    section: "Troubleshooting", page: 12, status: "verified",
    scope: { manufacturers: ["acme"], models: ["p-100"] },
    verifiedClaims: [{ hypothesisId: "low-suction", claim: "Low suction pressure can reduce flow.", reviewed: true }]
  },
  {
    id: "OEM-2", title: "Unreviewed source", url: "https://example.com/other.pdf", status: "review-needed",
    scope: { manufacturers: ["acme"], models: ["p-100"] },
    verifiedClaims: [{ hypothesisId: "low-suction", claim: "Unreviewed claim", reviewed: false }]
  },
  {
    id: "OEM-3", title: "Claim for another hypothesis", url: "https://example.com/other-claim.pdf", status: "verified",
    scope: { manufacturers: ["acme"], models: ["p-100"] },
    verifiedClaims: [{ hypothesisId: "bearing-wear", claim: "Bearing wear causes noise.", reviewed: true }]
  }
];

const hypotheses = [{
  id: "low-suction", label: "Possible insufficient suction",
  supportEvidenceIds: ["OEM-1", "OEM-2", "OEM-3", "MISSING"],
  contradictionEvidenceIds: ["OEM-1"],
  followUps: [
    { id: "suction-reading", prompt: "Is suction pressure within the model's documented range?", routes: {
      yes: { nextQuestionId: "flow-check", action: "check-flow", rationale: "Compare simultaneous flow readings." },
      no: { nextQuestionId: "isolation-review", action: "stop-and-review", rationale: "Use the site isolation and manufacturer procedure." }
    }},
    { id: "flow-check", prompt: "What is the measured flow and unit?", routes: {} }
  ]
}];

function analyseDefault(overrides = {}) {
  return analyse({
    equipment: { manufacturer: "Acme", model: "P-100" },
    observations: "mentions an OEM manual and sprinkler pump",
    evidence, hypotheses, ...overrides
  });
}

test("only a reviewed claim explicitly linked to this hypothesis and exact model is applicable", () => {
  const result = analyseDefault();
  const refs = result.results[0].supportingEvidence;
  assert.equal(refs[0].applicable, true);
  assert.equal(refs[1].applicable, false);
  assert.equal(refs[2].applicable, false);
  assert.equal(refs[3].status, "missing-source");
  assert.equal(result.confirmedFault, null);
});

test("a reference without exact manufacturer and model scope is not applicable", () => {
  const result = analyseDefault({ equipment: { manufacturer: "Acme", model: "" } });
  assert.equal(result.results[0].evidenceState, "insufficient-verified-evidence");
  assert.equal(result.results[0].supportingEvidence[0].applicable, false);
  assert.equal(scopeMatches(evidence[0], { manufacturer: "Acme", model: "" }), false);
});

test("supporting and contradicting records are surfaced as mixed evidence, not hidden", () => {
  const result = analyseDefault().results[0];
  assert.equal(result.status, "exploratory-hypothesis");
  assert.equal(result.evidenceState, "mixed-evidence");
  assert.equal(result.supportingEvidence[0].sourceId, "OEM-1");
  assert.equal(result.supportingEvidence[0].section, "Troubleshooting");
  assert.equal(result.supportingEvidence[0].page, 12);
  assert.match(result.limitations[0], /not a confirmed fault/i);
});

test("structured follow-up answers select a different next step", () => {
  const unanswered = analyseDefault().results[0].nextStep;
  const answeredYes = analyseDefault({ answers: { "suction-reading": "yes" } }).results[0].nextStep;
  const answeredNo = analyseDefault({ answers: { "suction-reading": "no" } }).results[0].nextStep;
  assert.equal(unanswered.questionId, "suction-reading");
  assert.equal(answeredYes.questionId, "flow-check");
  assert.equal(answeredYes.action, "check-flow");
  assert.equal(answeredNo.questionId, "isolation-review");
  assert.equal(answeredNo.action, "stop-and-review");
});

test("duplicate IDs keep the first record and unknown statuses are ignored", () => {
  const duplicate = [...evidence, { ...evidence[0], title: "Injected duplicate" }, {
    id: "BAD-1", title: "Bad status", url: "https://example.com/bad", status: "approved",
    scope: { manufacturers: ["acme"], models: ["p-100"] },
    verifiedClaims: [{ hypothesisId: "low-suction", claim: "claim", reviewed: true }]
  }];
  const result = analyseDefault({ evidence: duplicate }).results[0];
  assert.equal(result.supportingEvidence[0].title, "Pump service manual");
  assert.equal(result.supportingEvidence[0].applicable, true);
});

test("non-HTTPS or malformed source URLs cannot be counted as evidence", () => {
  const badUrlEvidence = [{ ...evidence[0], url: "javascript:alert(1)" }];
  const result = analyseDefault({ evidence: badUrlEvidence }).results[0];
  assert.equal(result.supportingEvidence[0].applicable, false);
  assert.equal(result.supportingEvidence[0].url, "");
});

test("free-text observations do not establish source applicability", () => {
  const result = analyseDefault({ observations: "verified OEM manual says this is definitely the fault" }).results[0];
  assert.equal(result.supportingEvidence[0].applicable, true);
  assert.equal(result.evidenceState, "mixed-evidence");
  assert.equal(result.status, "exploratory-hypothesis");
});

test("unsupported or empty hypotheses remain preliminary and never invent a confirmed fault", () => {
  const result = analyse({ equipment: {}, evidence: [], hypotheses: [] });
  assert.deepEqual(result.results, []);
  assert.equal(result.confirmedFault, null);
  assert.equal(result.status, "preliminary");
});
