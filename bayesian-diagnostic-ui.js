/* UI adapter for the experimental Bayesian network. Unknown inputs are omitted from evidence. */
(function (root) {
  "use strict";
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const translations = {
    ar: { title:"استدلال بايزي تجريبي — مضخة / ضعف التدفق", intro:"أدخل فقط القراءات أو الملاحظات التي تحققت منها. «غير معروف» لا يُعامل كأنه «لا».", unknown:"غير معروف / لم يُقَس", yes:"نعم", no:"لا", run:"تحديث ترتيب الفرضيات", results:"النتائج الحسابية (ليست احتمالات معايرة)", base:"الافتراضات", note:"قيم افتراضية لتقييم الخوارزمية وليست بيانات ميدانية أو احتمالات معايرة. لا تستخدم النسب لاتخاذ قرار تشغيل أو سلامة. تحقق من الوحدات وخط الأساس ودليل طراز المضخة.", missing:"أدخل قراءة واحدة على الأقل لعرض تحديث مبني على الأدلة.", noResult:"تعذر حساب النتيجة بسبب تعارض أو نقص في نموذج الشبكة.", caveat:"الترتيب يعتمد على النموذج والافتراضات الحالية فقط." },
    en: { title:"Experimental Bayesian reasoning — pump / low flow", intro:"Enter only readings or observations actually checked. Unknown is not treated as no.", unknown:"Unknown / not measured", yes:"Yes", no:"No", run:"Update hypothesis ranking", results:"Calculated results (not calibrated probabilities)", base:"Assumptions", note:"Provisional values for algorithm evaluation, not field data or calibrated probabilities. Do not use percentages for operational or safety decisions. Check units, baseline, and the exact pump model manual.", missing:"Enter at least one checked observation to update the ranking.", noResult:"Could not calculate a result because the model or evidence is inconsistent.", caveat:"Ranking follows only the current model and assumptions." },
    fr: { title:"Raisonnement bayésien expérimental — pompe / faible débit", intro:"Saisissez uniquement des mesures ou observations réellement vérifiées. Inconnu ne signifie pas non.", unknown:"Inconnu / non mesuré", yes:"Oui", no:"Non", run:"Actualiser le classement", results:"Résultats calculés (probabilités non calibrées)", base:"Hypothèses", note:"Valeurs provisoires pour tester l’algorithme, non des données terrain calibrées. Ne les utilisez pas pour des décisions opérationnelles ou de sécurité. Vérifiez les unités, la référence et le manuel du modèle exact.", missing:"Saisissez au moins une observation vérifiée.", noResult:"Calcul impossible en raison d’un modèle ou d’éléments incohérents.", caveat:"Le classement dépend uniquement du modèle et de ses hypothèses." }
  };
  function render(language) {
    const lang = translations[language] ? language : "ar", t = translations[lang];
    const model = root.MaintenanceBayesianDiagnostic && root.MaintenanceBayesianDiagnostic.models.pumpLowFlow;
    if (!model) return "";
    const fields = Object.keys(model.evidenceLabels).map(name => '<label class="bayes-field" for="bayes-' + esc(name) + '"><span>' +
      esc(model.evidenceLabels[name][lang]) + '</span><select id="bayes-' + esc(name) + '" data-bayes-evidence="' + esc(name) + '">' +
      '<option value="unknown">' + esc(t.unknown) + '</option><option value="true">' + esc(t.yes) +
      '</option><option value="false">' + esc(t.no) + '</option></select></label>').join("");
    return '<section class="result" id="bayesianDiagnosticPanel" data-language="' + lang + '"><h3>' + esc(t.title) +
      '</h3><p>' + esc(t.intro) + '</p><div class="bayes-fields">' + fields + '</div><button class="btn" type="button" id="bayesRun">' +
      esc(t.run) + '</button><div id="bayesOutput" aria-live="polite"><p class="hint">' + esc(t.missing) + '</p></div>' +
      '<details><summary>' + esc(t.base) + '</summary><p class="hint">' + esc(model.assumptions.join(" ")) +
      '</p></details><p class="hint">' + esc(t.note) + '</p></section>';
  }
  function attach(container, equipment, symptom, language) {
    if (!container || !root.MaintenanceBayesianDiagnostic) return;
    const machine = String(equipment || "").toLowerCase(), fault = String(symptom || "").toLowerCase();
    const existing = container.querySelector("#bayesianDiagnosticPanel");
    if (existing) existing.remove();
    if (!(machine === "pump" && (fault === "low_flow" || fault === "low flow"))) return;
    container.insertAdjacentHTML("beforeend", render(language));
    const panel = container.querySelector("#bayesianDiagnosticPanel"), output = panel.querySelector("#bayesOutput");
    const model = root.MaintenanceBayesianDiagnostic.models.pumpLowFlow;
    const t = translations[translations[language] ? language : "ar"];
    panel.querySelector("#bayesRun").addEventListener("click", () => {
      const evidence = {};
      panel.querySelectorAll("[data-bayes-evidence]").forEach(select => {
        if (select.value === "true" || select.value === "false") evidence[select.dataset.bayesEvidence] = select.value === "true";
      });
      if (!Object.keys(evidence).length) { output.innerHTML = '<p class="hint">' + esc(t.missing) + '</p>'; return; }
      const result = root.MaintenanceBayesianDiagnostic.infer(model, { evidence, query: Object.keys(model.causeLabels) });
      if (!result.ok) { output.innerHTML = '<p class="notice">' + esc(t.noResult) + '</p>'; return; }
      output.innerHTML = '<h4>' + esc(t.results) + '</h4><ol>' + result.results.map(item =>
        '<li><b>' + esc(model.causeLabels[item.node][translations[language] ? language : "ar"]) +
        '</b> — ' + (item.probabilityTrue * 100).toFixed(1) + '%</li>').join("") +
        '</ol><p class="hint">' + esc(t.caveat) + '</p>';
    });
  }
  root.MaintenanceBayesianDiagnosticUI = Object.freeze({ attach, render });
}(typeof window !== "undefined" ? window : globalThis));
