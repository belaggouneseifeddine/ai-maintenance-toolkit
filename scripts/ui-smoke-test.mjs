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

  const localizedFollowups = [
    { machine: "motor", language: "ar", question: "هل توجد قراءات موثوقة", answer: "يوجد تغير عن خط الأساس" },
    { machine: "motor", language: "en", question: "Are reliable load, current, and temperature readings", answer: "A change from baseline is recorded" },
    { machine: "motor", language: "fr", question: "Dispose-t-on de mesures fiables", answer: "Un écart par rapport à la référence est constaté" },
    { machine: "compressor", language: "ar", question: "ما حالة مؤشرات التبريد والزيت والحمل", answer: "يوجد إنذار تبريد أو تهوية" },
    { machine: "compressor", language: "en", question: "What do the cooling, oil, and load indicators show", answer: "A cooling or ventilation alarm is present" },
    { machine: "compressor", language: "fr", question: "Que montrent les indicateurs de refroidissement", answer: "Une alarme de refroidissement ou de ventilation est présente" }
  ];
  for (const item of localizedFollowups) {
    await page.locator("#machine").selectOption(item.machine);
    await page.locator("#symptom").selectOption("overheat");
    await page.locator("#languageSwitcher").selectOption(item.language);
    await page.waitForFunction(expected => document.querySelector("#followupPrompt")?.textContent.includes(expected), item.question);
    const options = await page.locator("#followupAnswer option").allTextContents();
    assert.ok(options[1]?.includes(item.answer), `${item.machine} follow-up answer must be localized in ${item.language}`);
  }
  await page.locator("#languageSwitcher").selectOption("ar");

  const panels = ["diagnose", "knowledge", "safety", "log", "v03"];
  assert.equal(await page.locator("#homeDashboard").evaluate(el => el.closest("#diagnose") !== null), true, "Dashboard must live inside the Assistant workspace, not be a sixth destination");
  for (const panel of panels) {
    await page.locator(`.tab[data-tab="${panel}"]`).click();
    assert.equal(await page.locator(`#${panel}`).evaluate(el => el.classList.contains("active")), true, `Navigation must open the ${panel} panel`);
  }
  await page.locator('.tab[data-tab="diagnose"]').click();
  await page.locator("#aiForm").waitFor({ state: "visible" });
  await page.locator("#aiMachine").fill("motor");
  await page.locator("#aiSymptom").fill("overheat");
  await page.waitForFunction(() => Boolean(document.querySelector("#dynamicQuestionText")?.textContent.trim()));
  await page.locator("#dynamicAnswer").selectOption("motor-load-high");
  await page.locator("#recordDynamicAnswer").click();
  const firstHypothesis = page.locator("#dynamicHypotheses .hypothesis-card").first();
  await firstHypothesis.waitFor();
  const sourceDetails = firstHypothesis.locator("details.hypothesis-sources");
  await sourceDetails.waitFor({ state: "attached" });
  await sourceDetails.locator("summary").click();
  const sourceText = await sourceDetails.innerText();
  assert.ok(sourceText.includes("Electric motor overheating") || sourceText.includes("EPR"), "Adaptive hypotheses must expose their traceable general source.");
  assert.ok(sourceText.includes("Not an OEM source"), "Adaptive source panel must preserve the non-OEM/model-scope limitation.");
  const hypothesisText = await firstHypothesis.innerText();
  assert.ok(hypothesisText.includes("الحمل أو التيار أعلى من خط الأساس"), "Evidence should be displayed as localized text, not internal evidence IDs.");

  const toggle = page.locator("#themeToggle");
  for (const language of ["ar", "fr", "en"]) {
    await page.locator("#languageSwitcher").selectOption(language);
    assert.equal(await page.locator("html").getAttribute("lang"), language, `Language switch must apply ${language}`);
    const direction = await page.locator("html").getAttribute("dir");
    assert.equal(direction, language === "ar" ? "rtl" : "ltr", `Direction must match ${language}`);
    const startingTheme = await page.locator("html").getAttribute("data-theme");
    const oppositeTheme = startingTheme === "dark" ? "light" : "dark";
    await toggle.click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), oppositeTheme, `${language}: theme toggle must switch themes`);
    assert.equal(await toggle.getAttribute("aria-pressed"), String(oppositeTheme === "dark"), "Theme toggle aria-pressed must match switched theme");
    await toggle.click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), startingTheme, `${language}: theme toggle must switch back`);
    assert.equal(await toggle.getAttribute("aria-pressed"), String(startingTheme === "dark"), "Theme toggle aria-pressed must match restored theme");
    const label = (await toggle.innerText()).trim();
    assert.ok(label.length > 0, `${language}: theme toggle needs a localized label`);
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
  console.log("UI_SMOKE_OK: navigation, localized motor/compressor follow-ups in AR/EN/FR, Arabic/RTL + French/English LTR, theme toggle, ARIA state, 320–1280px overflow, no uncaught page errors.");
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
