const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "ux-redesign.css"), "utf8");
const engine = readFileSync(join(root, "diagnostic-engine.js"), "utf8");
const agent = readFileSync(join(root, "agent-core.js"), "utf8");

test("the visual refresh stylesheet is loaded by the production HTML", () => {
  assert.match(html, /<link\b[^>]*href=["']\.\/ux-redesign\.css["'][^>]*>/i,
    "index.html must explicitly load ux-redesign.css");
});

test("visual motion honors reduced-motion preferences and touch input", () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/i);
  assert.match(css, /header:before,\s*\.ux-hero:before\s*\{\s*animation\s*:\s*none/i);
  assert.match(css, /@media\s*\(hover\s*:\s*none\)/i,
    "hover-only movement must be disabled on touch-first devices");
});

test("light and dark themes both define the visual components", () => {
  assert.match(css, /:root\[data-theme=["']dark["']\]/);
  for (const selector of [".ux-action", ".ux-stat", ".ux-record", ".ux-safety"]) {
    assert.ok(css.includes(selector), "missing visual style for " + selector);
  }
  assert.match(html, /id=["']themeToggle["']/);
});

test("three-language UI controls remain present without coupling styles to one language", () => {
  assert.match(html, /id=["']languageSwitcher["']/);
  assert.match(html, /<option[^>]*value=["']ar["']/);
  assert.match(html, /<option[^>]*value=["']fr["']/);
  assert.match(html, /<option[^>]*value=["']en["']/);
  assert.doesNotMatch(css, /html\[lang=["'](?:ar|fr|en)["']\]\s*\{[^}]*display\s*:\s*none/i);
});

test("diagnostic engine remains offline and does not call network APIs", () => {
  assert.doesNotMatch(engine, /\bfetch\s*\(/);
  assert.doesNotMatch(engine, /\bXMLHttpRequest\b/);
  assert.doesNotMatch(engine, /\bWebSocket\b/);
});

test("AI adapter failure and timeout keep a stable local fallback path", () => {
  assert.match(agent, /local_diagnostic/);
  assert.match(agent, /aiFallback/);
  assert.match(agent, /tool_timeout/);
  assert.match(agent, /tool_failed/);
  assert.match(agent, /Never return provider\/network exception text/i);
});

const navigation = readFileSync(join(root, "navigation-redesign.js"), "utf8");

test("mobile navigation does not leave a duplicate standalone AI tab", () => {
  assert.match(navigation, /if\(aiTab&&aiTab\.parentNode===nav\)aiTab\.remove\(\)/,
    "the AI assistant is embedded in Diagnose and its old standalone tab must be removed");
  assert.match(navigation, /const tabs=\[\s*\{button:homeTab[\s\S]*?\{button:moreTab/,
    "the bottom navigation must retain the six defined primary destinations");
});
