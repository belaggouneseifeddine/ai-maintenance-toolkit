const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("maintenance-v03.js parses as valid JavaScript", () => {
  const source = fs.readFileSync(require.resolve("../maintenance-v03.js"), "utf8");
  assert.doesNotThrow(() => new vm.Script(source, { filename: "maintenance-v03.js" }));
});

test("monthly due-date logic clamps month-end dates instead of rolling over", () => {
  function due(last) {
    const parts = String(last || "").split("-").map(Number);
    if (parts.length !== 3 || !parts.every(Number.isInteger)) return "";
    const y = parts[0], m = parts[1], day = parts[2];
    if (m < 1 || m > 12 || day < 1 || day > 31) return "";
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    const lastDay = new Date(nextYear, nextMonth, 0).getDate();
    return nextYear + "-" + String(nextMonth).padStart(2, "0") + "-" + String(Math.min(day, lastDay)).padStart(2, "0");
  }
  assert.equal(due("2026-01-31"), "2026-02-28");
  assert.equal(due("2024-01-31"), "2024-02-29");
  assert.equal(due("2026-12-31"), "2027-01-31");
});
