import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
const worker = readFileSync("backend/cloudflare-worker.js", "utf8");
const safety = readFileSync("SAFETY.md", "utf8");
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const sw = readFileSync("sw.js", "utf8");

const checks = [
  ["Arabic RTL document", () => assert.match(html, /<html lang="ar" dir="rtl">/)],
  ["Core navigation panels", () => {
    for (const id of ["diagnose", "ai", "knowledge", "safety", "log"]) {
      assert.match(html, new RegExp('id="' + id + '"'));
    }
  }],
  ["Equipment categories include pump, motor, VFD, PLC and gearbox", () => {
    for (const value of ["pump", "motor", "vfd", "electrical_control", "gearbox"]) {
      assert.ok(html.includes('value="' + value + '"'), "Missing equipment category: " + value);
    }
  }],
  ["User-entered maintenance records are HTML-escaped", () => assert.match(html, /function escapeHtml\s*\(/)],
  ["Maintenance records persist locally", () => assert.match(html, /localStorage\.setItem\(KEY/)],
  ["CSV export exists", () => assert.match(html, /maintenance-log\.csv/)],
  ["AI endpoint is configurable without a browser-side provider key", () => {
    assert.match(html, /AI_ENDPOINT_KEY/);
    assert.doesNotMatch(html, /sk-[A-Za-z0-9]{20,}/);
    assert.doesNotMatch(html, /AIza[0-9A-Za-z_-]{30,}/);
  }],
  ["AI backend only accepts POST and validates origin", () => {
    assert.match(worker, /request\.method !== "POST"/);
    assert.match(worker, /origin !== allowedOrigin/);
  }],
  ["AI credentials come from server environment secrets", () => assert.match(worker, /env\.AI_API_KEY/)],
  ["AI backend validates and bounds input lengths", () => {
    assert.match(worker, /machine\.length > 120/);
    assert.match(worker, /observations\.length > 3000/);
  }],
  ["AI instructions prohibit bypassing safety systems", () => {
    assert.match(worker, /Never recommend bypassing guards, interlocks, alarms, or protective devices/);
    assert.match(safety, /lockout\/tagout/i);
  }],
  ["PWA manifest has Arabic RTL metadata and standalone display", () => {
    assert.equal(manifest.lang, "ar");
    assert.equal(manifest.dir, "rtl");
    assert.equal(manifest.display, "standalone");
  }],
  ["Service worker declares app-shell caching", () => assert.match(sw, /APP_SHELL/)]
];

let failed = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log("PASS " + name);
  } catch (error) {
    failed++;
    console.error("FAIL " + name + ": " + error.message);
  }
}
console.log("\n" + (checks.length - failed) + "/" + checks.length + " static quality checks passed.");
if (failed) process.exitCode = 1;
