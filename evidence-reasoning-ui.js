/* Connects evidence-reasoning.js to the production diagnosis result panel.
 * Only explicit reviewed claims and exact equipment scope can count as applicable evidence.
 * This adapter never confirms a root cause and safely degrades when the registry is unavailable.
 */
(function (root) {
  "use strict";
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }
  function labelFor(state, lang) {
    const labels = {
      "source-supported-hypothesis": { ar: "فرضية لها دعم موثق ضمن نطاق المعدة", en: "Hypothesis has documented in-scope support", fr: "Hypothèse appuyée par une source dans le périmètre" },
      "mixed-evidence": { ar: "أدلة متعارضة أو مختلطة", en: "Mixed supporting and contradicting evidence", fr: "Éléments contradictoires ou mixtes" },
      "contradictory-evidence": { ar: "توجد أدلة موثقة تناقض الفرضية", en: "Documented evidence contradicts the hypothesis", fr: "Des éléments documentés contredisent l’hypothèse" },
      "insufficient-verified-evidence": { ar: "لا توجد أدلة متحققة كافية لهذا الطراز", en: "Insufficient verified evidence for this model", fr: "Preuves vérifiées insuffisantes pour ce modèle" }
    };
    return (labels[state] && (labels[state][lang] || labels[state].en)) || state;
  }
  async function render(engineResult, equipment, language) {
    const lang = ["ar", "en", "fr"].includes(language) ? language : "ar";
    const t = {
      ar: { title: "مراجعة الاستدلال والأدلة", none: "لم يسجل محرك التشخيص تطابقًا؛ لم تُنشأ فرضية عطل.", source: "المصدر", section: "القسم", page: "الصفحة", noRef: "لا يوجد مرجع قابل للتتبع مسجل لهذا العطل.", next: "الخطوة التالية", noNext: "أكمل تسجيل القياسات والإجابة عن السؤال الموجّه.", note: "فرضية أولية فقط؛ لا يؤكد هذا القسم سبب العطل. يلزم تطابق الشركة المصنّعة والطراز ووجود ادعاء فني تمت مراجعته قبل احتساب المصدر دليلًا." },
      en: { title: "Evidence and reasoning review", none: "The diagnostic engine found no match; no fault hypothesis was created.", source: "Source", section: "Section", page: "Page", noRef: "No traceable reference is recorded for this fault.", next: "Next step", noNext: "Record measured values and answer the guided follow-up.", note: "Exploratory hypothesis only; this section does not confirm root cause. A source counts as evidence only when manufacturer, model, and a reviewed technical claim match." },
      fr: { title: "Revue du raisonnement et des preuves", none: "Aucune correspondance du moteur; aucune hypothèse de panne créée.", source: "Source", section: "Section", page: "Page", noRef: "Aucune référence traçable n’est enregistrée pour cette panne.", next: "Étape suivante", noNext: "Enregistrez les mesures et répondez à la question guidée.", note: "Hypothèse exploratoire uniquement; la cause n’est pas confirmée. Une source n’est retenue que si le fabricant, le modèle et une affirmation technique révisée correspondent." }
    }[lang];
    if (!root.MaintenanceEvidenceReasoning || typeof root.MaintenanceEvidenceReasoning.analyse !== "function") {
      return '<section class="notice" id="evidenceReasoningPanel"><h3>' + esc(t.title) + '</h3><p>' + esc(t.noNext) + '</p></section>';
    }
    let registry = null;
    try {
      const response = await root.fetch("./diagnostic-evidence-register.json", { method: "GET", credentials: "same-origin" });
      if (response && response.ok) registry = await response.json();
    } catch (_) {}
    const records = registry && registry.records && typeof registry.records === "object" ? registry.records : {};
    const faults = engineResult && engineResult.matched && Array.isArray(engineResult.results) ? engineResult.results.slice(0, 3) : [];
    if (!faults.length) {
      return '<section class="notice" id="evidenceReasoningPanel"><h3>' + esc(t.title) + '</h3><p>' + esc(t.none) + '</p><p class="hint">' + esc(t.note) + '</p></section>';
    }
    const evidence = [];
    const hypotheses = faults.map((fault, index) => {
      const record = records[fault.id] || {};
      const refs = Array.isArray(record.references) ? record.references : [];
      const ids = [];
      refs.forEach((ref, refIndex) => {
        if (!ref || typeof ref !== "object") return;
        const id = String(ref.id || (fault.id + "-ref-" + refIndex));
        ids.push(id);
        evidence.push({
          id,
          title: ref.title || ref.name || "",
          url: ref.url || ref.uri || "",
          section: ref.section || "",
          page: Number.isInteger(ref.page) ? ref.page : (Number.isInteger(ref.printedPage) ? ref.printedPage : null),
          claim: typeof ref.claim === "string" ? ref.claim : "",
          verificationLimit: typeof ref.verificationLimit === "string" ? ref.verificationLimit : "",
          status: record.status || "source-not-recorded",
          scope: record.scope || ref.scope || {},
          verifiedClaims: (() => {
            const rawClaims = Array.isArray(ref.verifiedClaims) ? ref.verifiedClaims : (Array.isArray(record.verifiedClaims) ? record.verifiedClaims : (record.status === "verified" && typeof ref.claim === "string" && ref.claim.trim() ? [ref.claim] : []));
            return rawClaims.map(item => {
              if (typeof item === "string") return { hypothesisId: fault.id, claim: item, reviewed: record.status === "verified" && item.trim() !== "" };
              if (!item || typeof item !== "object") return null;
              return {
                hypothesisId: typeof item.hypothesisId === "string" ? item.hypothesisId : fault.id,
                claim: typeof item.claim === "string" ? item.claim : "",
                reviewed: item.reviewed === true && record.status === "verified"
              };
            }).filter(Boolean);
          })()
        });
      });
      return {
        id: fault.id || ("hypothesis-" + index),
        label: (fault.title && (fault.title[lang] || fault.title.en || fault.title.ar)) || fault.id || "Possible fault",
        supportEvidenceIds: ids,
        contradictionEvidenceIds: [],
        followUps: []
      };
    });
    const result = root.MaintenanceEvidenceReasoning.analyse({
      equipment: { manufacturer: equipment.manufacturer || "", model: equipment.model || "" },
      evidence,
      hypotheses
    });
    const items = result.results.map(item => {
      const sources = item.supportingEvidence.length ? item.supportingEvidence.map(source => {
        const details = [source.section ? esc(t.section) + ": " + esc(source.section) : "", source.page ? esc(t.page) + ": " + esc(source.page) : ""].filter(Boolean).join(" · ");
        const claim = typeof source.claim === "string" ? source.claim : "";
        return '<li>' + (source.url ? '<a href="' + esc(source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(source.title || source.sourceId) + '</a>' : esc(source.title || source.sourceId)) +
          (details ? '<div class="hint">' + details + '</div>' : '') + (claim ? '<p>' + esc(claim) + '</p>' : '') + (source.verificationLimit ? '<p class="hint">' + esc(source.verificationLimit) + '</p>' : '') + '<div class="hint">' + esc(source.reason) + '</div></li>';
      }).join("") : '<li>' + esc(t.noRef) + '</li>';
      return '<article class="record"><h4>' + esc(item.label) + '</h4><p><b>' + esc(labelFor(item.evidenceState, lang)) + '</b></p><ul>' + sources + '</ul><p class="hint">' + esc(t.next) + ': ' + esc(item.nextStep && item.nextStep.prompt || t.noNext) + '</p></article>';
    }).join("");
    return '<section class="result" id="evidenceReasoningPanel"><h3>' + esc(t.title) + '</h3>' + items + '<p class="hint">' + esc(t.note) + '</p></section>';
  }
  root.MaintenanceEvidenceReasoningUI = Object.freeze({ render });
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceEvidenceReasoningUI;
})(typeof globalThis !== "undefined" ? globalThis : this);
