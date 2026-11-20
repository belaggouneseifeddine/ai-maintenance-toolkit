const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Android Qwen host records and verifies imported model integrity before load", () => {
  const source = fs.readFileSync("android-local-host/app/src/main/java/com/maintenanceaitoolkit/localhost/MainActivity.kt", "utf8");
  assert.match(source, /MessageDigest\.getInstance\("SHA-256"\)/);
  assert.match(source, /modelHashFile/);
  assert.match(source, /model_integrity_record_missing/);
  assert.match(source, /model_integrity_check_failed/);
  assert.match(source, /sha256_recorded_on_import_not_upstream_authentication/);
  assert.match(source, /Could not install imported model/);
  assert.match(source, /Could not install model integrity record/);
});
