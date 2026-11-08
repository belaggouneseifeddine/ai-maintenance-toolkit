const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const policy = fs.readFileSync(path.join(__dirname, "..", "SAFETY.md"), "utf8");

test("safety policy restricts PLC forcing to controlled, authorized commissioning", () => {
  assert.match(policy, /forcing PLC inputs\/outputs/i);
  assert.match(policy, /documented risk-assessed test plan/i);
  assert.match(policy, /force\/override states have been cleared/i);
});

test("safety policy does not treat ordinary PLC logic or the app as a safety function", () => {
  assert.match(policy, /ordinary PLC logic, standard I\/O, or this application/i);
  assert.match(policy, /appropriately rated components/i);
  assert.match(policy, /current applicable standards/i);
});
