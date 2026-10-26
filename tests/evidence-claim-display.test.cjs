const test = require("node:test");
const assert = require("node:assert/strict");
require("../evidence-reasoning.js");
const ui = require("../evidence-reasoning-ui.js");

test("verified claim is shown but is not treated as applicable without exact structured equipment scope", async () => {
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({
    records: {
      "drive-alarm": {
        status: "verified",
        references: [{
          id: "manual-err02",
          title: "MD200 User Guide",
          url: "https://example.com/manual.pdf",
          section: "Fault list",
          printedPage: 32,
          claim: "Err02 denotes overcurrent during acceleration.",
          scope: "MD200 series AC drive",
          verificationLimit: "This does not establish the installed machine's root cause."
        }]
      }
    }
  }) });
  try {
    const html = await ui.render({
      matched: true,
      results: [{ id: "drive-alarm", title: { en: "Possible drive alarm" } }]
    }, { manufacturer: "Inovance", model: "MD200" }, "en");
    assert.match(html, /Err02 denotes overcurrent during acceleration/);
    assert.match(html, /MD200 User Guide/);
    assert.match(html, /Insufficient verified evidence for this model/);
    assert.match(html, /exact manufacturer and model scope was not established/i);
    assert.match(html, /does not establish the installed machine&#39;s root cause/);
  } finally {
    global.fetch = previousFetch;
  }
});
