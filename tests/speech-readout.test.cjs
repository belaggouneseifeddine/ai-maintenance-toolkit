const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../speech-readout.js"), "utf8");

class Element {
  constructor() {
    this.hidden = true;
    this.disabled = false;
    this.textContent = "";
    this.attributes = {};
    this.listeners = {};
  }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  setAttribute(name, value) { this.attributes[name] = value; }
  click() { for (const callback of this.listeners.click || []) callback(); }
}

function setup({ language = "ar", supported = true } = {}) {
  const ids = ["aiResult", "aiSpeechControls", "readAiAnswer", "stopAiReading", "aiSpeechStatus"];
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  elements.aiResult.textContent = "Answer with safety guidance";
  const docListeners = {};
  const document = {
    readyState: "complete",
    documentElement: { lang: language },
    getElementById: id => elements[id] || null,
    addEventListener(type, callback) { (docListeners[type] ||= []).push(callback); },
    dispatchEvent(event) { for (const callback of docListeners[event.type] || []) callback(event); }
  };
  let currentLanguage = language;
  const dictionary = {
    ar: { readAIAnswer: "اقرأ الإجابة صوتيًا", stopAIReading: "إيقاف القراءة", speechUnsupported: "غير مدعوم", speechReady: "جاهز", speechReading: "جارٍ القراءة", speechStopped: "توقفت", speechError: "خطأ" },
    fr: { readAIAnswer: "Lire la réponse", stopAIReading: "Arrêter la lecture", speechUnsupported: "Non pris en charge", speechReady: "Prêt", speechReading: "Lecture", speechStopped: "Arrêtée", speechError: "Erreur" },
    en: { readAIAnswer: "Read answer aloud", stopAIReading: "Stop reading", speechUnsupported: "Not supported", speechReady: "Ready", speechReading: "Reading", speechStopped: "Stopped", speechError: "Error" }
  };
  const win = {
    document,
    MaintenanceI18n: { getLanguage: () => currentLanguage, t: key => dictionary[currentLanguage][key] || key }
  };
  const spoken = [];
  const speech = { cancelCalls: 0, cancel() { this.cancelCalls++; }, speak(utterance) { spoken.push(utterance); if (utterance.onstart) utterance.onstart(); } };
  if (supported) {
    win.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; this.lang = ""; this.rate = 1; }
    };
    win.speechSynthesis = speech;
  }
  vm.runInNewContext(source, { window: win }, { filename: "speech-readout.js" });
  return { document, elements, win, speech, spoken, setLanguage(value) { currentLanguage = value; }, dispatch(type) { document.dispatchEvent({ type }); } };
}

test("speech controls stay hidden until an AI answer is ready", () => {
  const app = setup();
  assert.equal(app.elements.aiSpeechControls.hidden, true);
  app.dispatch("maintenance-ai-answer-ready");
  assert.equal(app.elements.aiSpeechControls.hidden, false);
  assert.equal(app.elements.aiSpeechStatus.hidden, false);
  assert.equal(app.elements.readAiAnswer.textContent, "اقرأ الإجابة صوتيًا");
});

test("read aloud uses the current response text and selected language, then restores controls", () => {
  const app = setup({ language: "fr" });
  app.dispatch("maintenance-ai-answer-ready");
  app.elements.readAiAnswer.click();
  assert.equal(app.spoken.length, 1);
  assert.equal(app.spoken[0].text, "Answer with safety guidance");
  assert.equal(app.spoken[0].lang, "fr-FR");
  assert.equal(app.elements.stopAiReading.disabled, false);
  assert.equal(app.elements.aiSpeechStatus.textContent, "Lecture");
  app.spoken[0].onend();
  assert.equal(app.elements.readAiAnswer.disabled, false);
  assert.equal(app.elements.stopAiReading.disabled, true);
  assert.equal(app.elements.aiSpeechStatus.textContent, "Prêt");
});

test("stop reading cancels device speech without network calls", () => {
  const app = setup();
  app.dispatch("maintenance-ai-answer-ready");
  app.elements.readAiAnswer.click();
  app.elements.stopAiReading.click();
  assert.ok(app.speech.cancelCalls >= 2);
  assert.equal(app.elements.stopAiReading.disabled, true);
  assert.equal(app.elements.aiSpeechStatus.textContent, "توقفت");
});

test("unsupported browsers show a message and do not throw", () => {
  const app = setup({ supported: false });
  app.dispatch("maintenance-ai-answer-ready");
  assert.doesNotThrow(() => app.elements.readAiAnswer.click());
  assert.equal(app.elements.aiSpeechStatus.textContent, "غير مدعوم");
});

test("clearing the AI result hides controls and cancels any active speech", () => {
  const app = setup();
  app.dispatch("maintenance-ai-answer-ready");
  app.elements.readAiAnswer.click();
  app.dispatch("maintenance-ai-answer-cleared");
  assert.equal(app.elements.aiSpeechControls.hidden, true);
  assert.equal(app.elements.aiSpeechStatus.hidden, true);
  assert.equal(app.elements.stopAiReading.disabled, true);
  assert.ok(app.speech.cancelCalls >= 2);
});

test("language changes stop current speech and update accessible labels", () => {
  const app = setup();
  app.dispatch("maintenance-ai-answer-ready");
  app.elements.readAiAnswer.click();
  app.setLanguage("en");
  app.dispatch("maintenance-language-changed");
  assert.equal(app.elements.readAiAnswer.textContent, "Read answer aloud");
  assert.equal(app.elements.stopAiReading.textContent, "Stop reading");
  assert.equal(app.elements.stopAiReading.disabled, true);
});
