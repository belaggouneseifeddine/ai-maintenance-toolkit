const test = require("node:test");
const assert = require("node:assert/strict");
const { analyse, scopeMatches } = require("../evidence-reasoning.js");

const evidence = [
  {
    id: "OEM-1",
    title: "Pump service manual",
    url: "https://example.com/manual.pdf",
    section: "Troubleshooting",
    page: 12,
    status: "verified",
    scope: { manufacturers: ["acme"], models: ["p-100"] },
    verifiedClaims: ["Low suction pressure can reduce flow."]
  },
  {
    id: "OEM-2",
    title: "Unreviewed source",
    url: "https://example.com/other.pdf",
    status: "review-needed",
    scope: { manufacturers: ["acme"], models: ["p-100"] },
    verifiedClaims: []
  }
];

const hypotheses = [{
  id: "low-suction",
  label: "Possible insufficient suction",
  supportEvidenceIds: ["OEM-1", "OEM-2", "MISSING"],
  contradictionEvidenceIds: [],
  followUps: [{
    id: "suction-reading",
    prompt: "Is the suction pressure within the model's documented range?",
    routes: {
      yes: { nextQuestionId: "flow-check", action: "check-flow", rationale: "Compare simultaneous flow readings." },
      no: { nextQuestionId: "isolation-review", action: "stop-and-review", rationale: "Use the site isolation and manufacturer procedure." }
    }
  }, {
    id: "flow-check",
    prompt: "What is the measured flow and unit?",
    routes: {}
  }]
}];

test("free-text notes cannot activate or validate an OEM reference", () => {
  const result = analyse({
    equipment: { manufacturer: "Acme", model: "P-100" },
    observations: "mentions an OEM manual and sprinkler pump",
    evidence,
    hypotheses
  });
  const refs = result.results[0].supportingEvidence;
  assert.equal(refs[0].applicable, true);
  assert.equal(refs[1].applicable, false);
  assert.equal(refs[2].status, "missing-source");
  assert.equal(result.confirmedFault, null);
});

test("a reference without exact manufacturer and model scope is not applicable", () => {
  const result = analyse({
    equipment: { manufacturer: "Acme", model: "" },
    evidence,
    hypotheses
  });
  assert.equal(result.results[0].evidenceState, "insufficient-verified-evidence");
  assert.equal(result.results[0].supportingEvidence[0].applicable, false);
  assert.equal(scopeMatches(evidence[0], { manufacturer: "Acme", model: "" }), false);
});

test("evidence is traceable and does not overstate the hypothesis", () => {
  const result = analyse({
    equipment: { manufacturer: "Acme", model: "P-100" },
    evidence,
    hypotheses
  });
  const hypothesis = result.results[0];
  assert.equal(hypothesis.status, "exploratory-hypothesis");
  assert.equal(hypothesis.evidenceState, "source-supported-hypothesis");
  assert.equal(hypothesis.supportingEvidence[0].sourceId, "OEM-1");
  assert.equal(hypothesis.supportingEvidence[0].section, "Troubleshooting");
  assert.equal(hypothesis.supportingEvidence[0].page, 12);
  assert.match(hypothesis.limitations[0], /not a confirmed fault/i);
});

test("structured follow-up answer selects a different next step", () => {
  const base = { equipment: { manufacturer: "Acme", model: "P-100" }, evidence, hypotheses };
  const unanswered = analyse(base).results[0].nextStep;
  const answeredYes = analyse({ ...base, answers: { "suction-reading": "yes" } }).results[0].nextStep;
  const answeredNo = analyse({ ...base, answers: { "suction-reading": "no" } }).results[0].nextStep;
  assert.equal(unanswered.questionId, "suction-reading");
  assert.equal(answeredYes.questionId, "flow-check");
  assert.equal(answeredYes.action, "check-flow");
  assert.equal(answeredNo.questionId, "isolation-review");
  assert.equal(answeredNo.action, "stop-and-review");
});

test("duplicate evidence IDs and unrecognized statuses cannot silently replace a record", () => {
  const duplicate = [...evidence, { ...evidence[0], title: "Injected duplicate" }];
  const result = analyse({
    equipment: { manufacturer: "Acme", model: "P-100" },
    evidence: duplicate,
    hypotheses
  });
  assert.equal(result.results[0].supportingEvidence[0].title, "Pump service manual");
  assert.equal(result.results[0].supportingEvidence[0].applicable, true);
});
