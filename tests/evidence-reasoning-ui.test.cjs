const test = require("node:test");
const assert = require("node:assert/strict");
require("../evidence-reasoning.js");
const ui = require("../evidence-reasoning-ui.js");

test("reasoning panel safely reports no-match without inventing a hypothesis", async () => {
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ records: {} }) });
  try {
    const html = await ui.render({ matched: false, results: [] }, { manufacturer: "Acme", model: "P-100" }, "en");
    assert.match(html, /no match/i);
    assert.match(html, /does not confirm root cause/i);
  } finally {
    global.fetch = previousFetch;
  }
});

test("unreviewed or absent evidence remains insufficient, even with a model entered", async () => {
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({
    records: { "pump-cavitation": { status: "source-not-recorded", references: [] } }
  }) });
  try {
    const html = await ui.render({
      matched: true,
      results: [{ id: "pump-cavitation", title: { en: "Possible cavitation" } }]
    }, { manufacturer: "Acme", model: "P-100" }, "en");
    assert.match(html, /Insufficient verified evidence for this model/);
    assert.match(html, /No traceable reference is recorded/);
    assert.match(html, /does not confirm root cause/i);
  } finally {
    global.fetch = previousFetch;
  }
});

test("only exact model scope and explicit reviewed claims can support a hypothesis", async () => {
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({
    records: {
      "pump-cavitation": {
        status: "verified",
        references: [{
          id: "manual-1", title: "OEM manual", url: "https://example.com/manual",
          section: "Troubleshooting", page: 12,
          scope: { manufacturers: ["Acme"], models: ["P-100"] },
          verifiedClaims: ["The documented symptom is consistent with cavitation."]
        }]
      }
    }
  }) });
  try {
    const result = await ui.render({
      matched: true,
      results: [{ id: "pump-cavitation", title: { en: "Possible cavitation" } }]
    }, { manufacturer: "Acme", model: "P-100" }, "en");
    assert.match(result, /Hypothesis has documented in-scope support/);
    assert.match(result, /OEM manual/);
    const wrongModel = await ui.render({
      matched: true,
      results: [{ id: "pump-cavitation", title: { en: "Possible cavitation" } }]
    }, { manufacturer: "Acme", model: "P-200" }, "en");
    assert.match(wrongModel, /Insufficient verified evidence for this model/);
  } finally {
    global.fetch = previousFetch;
  }
});
