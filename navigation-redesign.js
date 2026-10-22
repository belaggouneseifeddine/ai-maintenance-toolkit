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
  applyNavLanguage();
  const languageSwitcher = document.getElementById("languageSwitcher");
  if (languageSwitcher) languageSwitcher.addEventListener("change", applyNavLanguage);

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
