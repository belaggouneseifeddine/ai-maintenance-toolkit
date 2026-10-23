import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { chromium } from "playwright";

const root = resolve(".");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json"
};

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = resolve(root, relative);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

const errors = [];
let browser;
try {
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: "networkidle" });
  await page.locator("#themeToggle").waitFor();

  assert.equal(await page.locator("html").getAttribute("lang"), "ar", "Arabic must remain the default language");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl", "Arabic must remain RTL");
  assert.equal(await page.locator("#languageSwitcher option").count(), 3, "The three language choices must remain available");

  await page.locator('.tab[data-tab="diagnose"]').click();
  await page.locator("#diagnosisForm").waitFor({ state: "visible" });

  const panels = ["diagnose", "ai", "knowledge", "safety", "log"];
  for (const panel of panels) {
    await page.locator(`.tab[data-tab="${panel}"]`).click();
    assert.equal(await page.locator(`#${panel}`).evaluate(el => el.classList.contains("active")), true, `Navigation must open the ${panel} panel`);
  }

  const toggle = page.locator("#themeToggle");
  for (const language of ["ar", "fr", "en"]) {
    await page.locator("#languageSwitcher").selectOption(language);
    assert.equal(await page.locator("html").getAttribute("lang"), language, `Language switch must apply ${language}`);
    const direction = await page.locator("html").getAttribute("dir");
    assert.equal(direction, language === "ar" ? "rtl" : "ltr", `Direction must match ${language}`);
    for (const expectedTheme of ["dark", "light"]) {
      await page.evaluate(theme => {
        document.documentElement.dataset.theme = theme === "dark" ? "light" : "dark";
      }, expectedTheme);
      await toggle.click();
      assert.equal(await page.locator("html").getAttribute("data-theme"), expectedTheme, `${language}: theme toggle must apply ${expectedTheme}`);
      assert.equal(await toggle.getAttribute("aria-pressed"), String(expectedTheme === "dark"), "Theme toggle aria-pressed must match theme state");
      const label = (await toggle.innerText()).trim();
      assert.ok(label.length > 0, `${language}: theme toggle needs a localized label`);
    }
  }

  for (const width of [320, 390, 560, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(50);
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    assert.ok(metrics.document <= metrics.viewport + 1 && metrics.body <= metrics.viewport + 1,
      `Horizontal overflow at ${width}px: ${JSON.stringify(metrics)}`);
  }

  assert.deepEqual(errors, [], `Unexpected uncaught browser errors: ${errors.join("; ")}`);
  console.log("UI_SMOKE_OK: navigation, Arabic/RTL + French/English LTR, theme toggle, ARIA state, 320–1280px overflow, no uncaught page errors.");
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
