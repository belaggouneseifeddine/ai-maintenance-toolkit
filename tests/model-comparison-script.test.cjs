const { test } = require("node:test");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

test("Gemini model comparison harness parses as valid JavaScript", () => {
  const script = path.join(__dirname, "..", "scripts", "compare-gemini-models.mjs");
  execFileSync(process.execPath, ["--check", script], { stdio: "pipe" });
});
