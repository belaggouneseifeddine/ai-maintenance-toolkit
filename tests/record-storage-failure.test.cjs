const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
const agentUi = fs.readFileSync(require.resolve("../agent-ui.js"), "utf8");

test("saveRecords reports a local-storage write failure instead of claiming success", () => {
  const start = html.indexOf("function saveRecords(a){");
  const end = html.indexOf("function newRecordId()", start);
  assert.ok(start >= 0 && end > start, "saveRecords function must remain extractable for its failure contract");

  const alerts = [];
  const errors = [];
  const context = {
    localStorage: {
      setItem() { throw new Error("QuotaExceededError"); }
    },
    window: {
      MaintenanceI18n: null,
      alert(message) { alerts.push(String(message)); }
    },
    console: {
      error(...args) { errors.push(args); }
    }
  };
  vm.runInNewContext(html.slice(start, end) + "\nglobalThis.__saveRecords = saveRecords;", context);

  assert.equal(context.__saveRecords([]), false);
  assert.equal(alerts.length, 1);
  assert.match(alerts[0], /تعذّر حفظ|Could not save|Impossible/);
  assert.equal(errors.length, 1);
});

test("failed record persistence aborts form reset, draft deletion, list refresh and import success", () => {
  assert.ok(
    html.includes("if(!saveRecords(all))return;renderRecords();lastDiagnosisDraft=null;"),
    "diagnosis draft must remain when saving the generated maintenance record fails"
  );
  assert.ok(
    html.includes("if(!saveRecords(a))return;e.target.reset();"),
    "manual log form must retain entered values when saving fails"
  );
  assert.ok(
    html.includes("x.splice(index,1);if(!saveRecords(x))return;renderRecords();"),
    "delete UI must not refresh as though persistence succeeded"
  );
  assert.ok(
    html.includes("try{if(!saveRecords(current))return;renderRecords();alert('اكتمل الاستيراد."),
    "JSON import must not display success when local persistence fails"
  );
  assert.ok(
    agentUi.includes("if(!saveRecords(records))return false;"),
    "the saved-draft conversion path must also abort on persistence failure"
  );
});
