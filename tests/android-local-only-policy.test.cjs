const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Android local host has no network permission or remote embedding model fallback", () => {
  const manifest = fs.readFileSync("android-local-host/app/src/main/AndroidManifest.xml", "utf8");
  const semantic = fs.readFileSync("document-semantic-search.js", "utf8");
  const activity = fs.readFileSync("android-local-host/app/src/main/java/com/maintenanceaitoolkit/localhost/MainActivity.kt", "utf8");
  const documents = fs.readFileSync("document-library.js", "utf8");
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.match(semantic, /const nativeLocalHost = Boolean\(root\.MaintenanceNativeLLM\)/);
  assert.match(semantic, /library\.env\.allowRemoteModels = !nativeLocalHost/);
  assert.match(semantic, /library\.env\.allowLocalModels = true/);
  assert.match(activity, /appassets\.androidplatform\.net/);
  assert.match(activity, /"pickModel"|"loadModel"|"unloadModel"|"generate"/);
  assert.doesNotMatch(activity, /Runtime\.getRuntime|ProcessBuilder|eval\(/);
});
