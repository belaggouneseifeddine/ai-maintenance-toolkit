/* Local speech readout for the AI diagnosis result. No audio or text is sent to a service. */
(function (root) {
  "use strict";

  function init(doc, win) {
    const result = doc.getElementById("aiResult");
    const controls = doc.getElementById("aiSpeechControls");
    const speakButton = doc.getElementById("readAiAnswer");
    const stopButton = doc.getElementById("stopAiReading");
    const status = doc.getElementById("aiSpeechStatus");
    if (!result || !controls || !speakButton || !stopButton || !status) return;

    const i18n = win.MaintenanceI18n;
    let activeUtterance = null;
    const language = () => {
      const current = i18n && typeof i18n.getLanguage === "function" ? i18n.getLanguage() : doc.documentElement.lang;
      return ["ar", "fr", "en"].includes(current) ? current : "ar";
    };
    const text = key => i18n && typeof i18n.t === "function" ? i18n.t(key) : key;

    function updateLabels() {
      speakButton.textContent = text("readAIAnswer");
      speakButton.setAttribute("aria-label", text("readAIAnswer"));
      stopButton.textContent = text("stopAIReading");
      stopButton.setAttribute("aria-label", text("stopAIReading"));
      if (controls.hidden) return;
      status.textContent = text("speechReady");
    }

    function stop(showStatus = true) {
      if (win.speechSynthesis && typeof win.speechSynthesis.cancel === "function") {
        win.speechSynthesis.cancel();
      }
      activeUtterance = null;
      speakButton.disabled = false;
      stopButton.disabled = true;
      if (showStatus && !controls.hidden) status.textContent = text("speechStopped");
    }

    function speak() {
      const answer = String(result.textContent || "").trim();
      if (!answer) return;
      if (!win.speechSynthesis || typeof win.speechSynthesis.speak !== "function" ||
          typeof win.SpeechSynthesisUtterance !== "function") {
        status.textContent = text("speechUnsupported");
        return;
      }
      stop(false);
      activeUtterance = new win.SpeechSynthesisUtterance(answer);
      activeUtterance.lang = language() === "fr" ? "fr-FR" : language() === "en" ? "en-US" : "ar";
      activeUtterance.rate = 1;
      activeUtterance.onstart = () => {
        speakButton.disabled = true;
        stopButton.disabled = false;
        status.textContent = text("speechReading");
      };
      activeUtterance.onend = () => {
        activeUtterance = null;
        speakButton.disabled = false;
        stopButton.disabled = true;
        status.textContent = text("speechReady");
      };
      activeUtterance.onerror = () => {
        activeUtterance = null;
        speakButton.disabled = false;
        stopButton.disabled = true;
        status.textContent = text("speechError");
      };
      speakButton.disabled = false;
      stopButton.disabled = false;
      win.speechSynthesis.speak(activeUtterance);
    }

    speakButton.addEventListener("click", speak);
    stopButton.addEventListener("click", () => stop(true));
    doc.addEventListener("maintenance-ai-answer-ready", () => {
      controls.hidden = false;
      status.hidden = false;
      updateLabels();
    });
    doc.addEventListener("maintenance-ai-answer-cleared", () => {
      stop(false);
      controls.hidden = true;
      status.hidden = true;
      status.textContent = "";
    });
    doc.addEventListener("maintenance-language-changed", () => {
      if (activeUtterance) stop(false);
      updateLabels();
    });
    updateLabels();
  }

  root.MaintenanceSpeechReadout = { init };
  if (root.document) {
    if (root.document.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", () => init(root.document, root));
    } else {
      init(root.document, root);
    }
  }
})(window);
