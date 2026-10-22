/* Five-tab navigation while preserving the existing feature panels and IDs. */
(function () {
  "use strict";
  const nav = document.querySelector(".nav");
  const main = document.querySelector("main");
  const panel = id => document.getElementById(id);
  if (!nav || !main) return;

  const byTab = id => nav.querySelector('.tab[data-tab="' + id + '"]');
  const diagnoseTab = byTab("diagnose");
  const aiTab = byTab("ai");
  const knowledgeTab = byTab("knowledge");
  const safetyTab = byTab("safety");
  const logTab = byTab("log");
  if (![diagnoseTab, aiTab, knowledgeTab, safetyTab, logTab].every(Boolean)) return;

  const homeTab = byTab("homeDashboard");
  if (homeTab) homeTab.remove();

  const home = panel("homeDashboard");
  const diagnose = panel("diagnose");
  const ai = panel("ai");
  if (home && diagnose) {
    home.classList.remove("panel", "active");
    home.setAttribute("aria-label", "Maintenance assistant home");
    diagnose.prepend(home);
  }
  if (ai && diagnose) {
    ai.classList.remove("panel", "active");
    ai.setAttribute("aria-label", "AI maintenance assistant");
    diagnose.appendChild(ai);
  }

  diagnoseTab.textContent = "المساعد";
  diagnoseTab.dataset.tab = "diagnose";
  aiTab.textContent = "الأعطال";
  aiTab.dataset.tab = "knowledge";
  knowledgeTab.textContent = "السلامة";
  knowledgeTab.dataset.tab = "safety";
  safetyTab.textContent = "السجل";
  safetyTab.dataset.tab = "log";
  logTab.textContent = "المزيد";
  logTab.dataset.tab = "v03";

  const tabs = [diagnoseTab, aiTab, knowledgeTab, safetyTab, logTab];
  const icons = ["◉", "⌕", "⬡", "▤", "⋯"];
  const names = {
    ar: ["المساعد", "الأعطال", "السلامة", "السجل", "المزيد"],
    fr: ["Assistant", "Pannes", "Sécurité", "Historique", "Plus"],
    en: ["Assistant", "Faults", "Safety", "History", "More"]
  };
  tabs.forEach((button, i) => {
    button.classList.add("bottom-tab");
    button.innerHTML = '<span class="bottom-tab-icon" aria-hidden="true">' + icons[i] + '</span><span class="bottom-tab-label"></span>';
  });
  function applyNavLanguage() {
    const language = (document.getElementById("languageSwitcher") || {}).value || document.documentElement.lang || "ar";
    const labels = names[language] || names.ar;
    tabs.forEach((button, i) => {
      const label = button.querySelector(".bottom-tab-label");
      if (label) label.textContent = labels[i];
      button.setAttribute("aria-label", labels[i]);
    });
  }
  function applyMeasurementLanguage() {
    const language = (document.getElementById("languageSwitcher") || {}).value || document.documentElement.lang || "ar";
    const copy = {
      ar: { label: "حالة القياسات المتاحة", unknown: "لا أعرف / لست متأكدًا", none: "لا توجد قراءة متاحة", available: "توجد قراءات مسجلة بالفعل", hint: "لا تنفّذ قياسًا حيًا أو تلمس معدات خطرة لمجرد الإجابة. استخدم فقط المعلومات والقراءات المتاحة بالفعل." },
      en: { label: "Measurement availability", unknown: "I don't know / not sure", none: "No reading available", available: "Existing readings are available", hint: "Do not perform a live measurement or touch hazardous equipment just to answer. Use only information and readings already available." },
      fr: { label: "Disponibilité des mesures", unknown: "Je ne sais pas / incertain", none: "Aucune mesure disponible", available: "Des mesures déjà relevées sont disponibles", hint: "N’effectuez pas de mesure en direct et ne touchez pas un équipement dangereux pour répondre. Utilisez uniquement les informations déjà disponibles." }
    };
    const c = copy[language] || copy.ar;
    const label = document.querySelector('label[for="aiMeasurementStatus"]');
    const select = document.getElementById("aiMeasurementStatus");
    const hint = document.getElementById("aiMeasurementHint");
    if (label) label.textContent = c.label;
    if (select) {
      select.options[0].textContent = c.unknown;
      select.options[1].textContent = c.none;
      select.options[2].textContent = c.available;
    }
    if (hint) hint.textContent = c.hint;
  }
  applyNavLanguage();
  applyMeasurementLanguage();
  const languageSwitcher = document.getElementById("languageSwitcher");
  if (languageSwitcher) languageSwitcher.addEventListener("change", () => { applyNavLanguage(); applyMeasurementLanguage(); });

  nav.setAttribute("aria-label", "التنقل الرئيسي");
  nav.classList.add("bottom-navigation");

  document.addEventListener("click", event => {
    const goButton = event.target.closest("[data-go='ai']");
    if (!goButton) return;
    event.preventDefault();
    const target = document.getElementById("ai");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = document.getElementById("aiSymptom");
      if (input) input.focus({ preventScroll: true });
    }
  });

  if (diagnose) diagnose.classList.add("active");
  [diagnoseTab, aiTab, knowledgeTab, safetyTab, logTab].forEach(button => button.classList.toggle("active", button === diagnoseTab));
})();
