const test = require("node:test");
const assert = require("node:assert/strict");
const Bayesian = require("../bayesian-engine.js");

test("missing evidence remains unknown and does not reduce support", () => {
  const result = Bayesian.scoreHypothesis({
    id: "cavitation",
    evidenceNodes: [{ id: "suction-pressure", group: "hydraulic", state: "unknown" }]
  }, 0.2);
  assert.equal(result.relativeSupportScore, 0.2);
  assert.equal(result.evidenceUnknownCount, 1);
});

test("contradictory evidence in one correlated group is reported without net update", () => {
  const result = Bayesian.scoreHypothesis({
    id: "air-lock",
    evidenceNodes: [
      { id: "low-flow", group: "hydraulic", state: "supports" },
      { id: "normal-suction-pressure", group: "hydraulic", state: "contradicts" }
    ]
  }, 0.2);
  assert.equal(result.relativeSupportScore, 0.2);
  assert.equal(result.evidenceConflictCount, 1);
});

test("expected information gain ranks tests only when likelihoods are complete", () => {
  const result = Bayesian.expectedInformationGain({
    hypotheses: [{ id: "A", prior: 0.5 }, { id: "B", prior: 0.5 }],
    tests: [
      {
        id: "discriminating-test",
        reviewStatus: "approved", sourceRef: { url: "https://example.test/likelihoods#table-1" },
        outcomes: [
          { id: "a", likelihoods: { A: 0.9, B: 0.1 } },
          { id: "b", likelihoods: { A: 0.1, B: 0.9 } }
        ],
        cost: 2,
        timeMinutes: 15,
        likelihoodSource: "synthetic-test-fixture"
      },
      {
        id: "uninformative-test",
        reviewStatus: "approved", likelihoodSource: "synthetic-test-fixture", sourceRef: { url: "https://example.test/likelihoods#table-2" },
        outcomes: [
          { id: "yes", likelihoods: { A: 0.5, B: 0.5 } },
          { id: "no", likelihoods: { A: 0.5, B: 0.5 } }
        ]
      },
      {
        id: "missing-likelihood",
        reviewStatus: "approved", likelihoodSource: "synthetic-test-fixture", sourceRef: { url: "https://example.test/likelihoods#table-3" },
        outcomes: [{ id: "yes", likelihoods: { A: 1 } }, { id: "no", likelihoods: { A: 0 } }]
      }
    ]
  }, { resolveSource: () => true });
  assert.equal(result.ok, true);
  assert.equal(result.ranking[0].id, "discriminating-test");
  assert.ok(result.ranking[0].expectedInformationGainBits > 0.5);
  assert.equal(result.ranking[1].id, "uninformative-test");
  assert.equal(result.ranking[1].expectedInformationGainBits, 0);
  assert.equal(result.ranking[2].status, "invalid_or_incomplete_likelihoods");
});

test("hazardous test remains visible with an advisory warning, not silently removed", () => {
  const result = Bayesian.expectedInformationGain({
    hypotheses: [{ id: "A", prior: 0.5 }, { id: "B", prior: 0.5 }],
    tests: [{
      id: "live-measurement",
      reviewStatus: "approved", likelihoodSource: "synthetic-test-fixture", sourceRef: { url: "https://example.test/safety#measurement" },
      hazardous: true,
      safetyWarning: "Qualified electrical work and site isolation procedure required.",
      outcomes: [
        { id: "high", likelihoods: { A: 0.8, B: 0.2 } },
        { id: "low", likelihoods: { A: 0.2, B: 0.8 } }
      ]
    }]
  }, { resolveSource: () => true });
  assert.equal(result.ranking[0].id, "live-measurement");
  assert.match(result.ranking[0].safetyWarning, /Qualified electrical work/);
});

test("unreviewed likelihood provenance is rejected", () => {
  const result = Bayesian.expectedInformationGain({
    hypotheses: [{ id: "A", prior: 0.5 }, { id: "B", prior: 0.5 }],
    tests: [{
      id: "unreviewed-test",
      likelihoodSource: "technician estimate",
      reviewStatus: "candidate",
      sourceRef: { url: "https://example.test/unreviewed" },
      outcomes: [
        { id: "yes", likelihoods: { A: 0.9, B: 0.1 } },
        { id: "no", likelihoods: { A: 0.1, B: 0.9 } }
      ]
    }]
  }, { resolveSource: () => true });
  assert.equal(result.ranking[0].status, "unverified_likelihood_source");
});

test("information gain refuses to trust source metadata without a trusted resolver", () => {
  const result = Bayesian.expectedInformationGain({
    hypotheses: [{ id: "A", prior: 0.5 }, { id: "B", prior: 0.5 }],
    tests: [{
      id: "claimed-source-test",
      reviewStatus: "approved",
      likelihoodSource: "claimed",
      sourceRef: { url: "https://example.test/claimed" },
      outcomes: [
        { id: "yes", likelihoods: { A: 0.9, B: 0.1 } },
        { id: "no", likelihoods: { A: 0.1, B: 0.9 } }
      ]
    }]
  });
  assert.equal(result.ranking[0].status, "source_verification_unavailable");
});
