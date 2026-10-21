/* Offline deterministic diagnostic ranking. No network calls and no invented technical limits. */
(function (root) {
  "use strict";

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[ـ]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function findMatches(text, terms) {
    const normalized = normalizeText(text);
    const matches = [];
    for (const term of terms || []) {
      const needle = normalizeText(term);
      if (needle.length >= 3 && normalized.includes(needle) && !matches.some(item => normalizeText(item) === needle)) {
        matches.push(term);
      }
    }
    return matches;
  }

  function diagnose(input, library) {
    const data = library || root.MAINTENANCE_FAULTS;
    const lang = ["ar", "fr", "en"].includes(input && input.language) ? input.language : "ar";
    const t = {
      ar: {
        noMatch: "لا يوجد تطابق كافٍ، صعّد للمسؤول",
        weakReason: "لم يتحقق الحد الأدنى المطلوب من الأدلة؛ لم يتم اقتراح عطل.",
        rankedBy: "سبب الترتيب",
        equipment: "تطابق نوع المعدة",
        symptom: "تطابق العَرَض",
        keywords: "كلمات ملاحظة مطابقة",
        causeMatched: "رُتّب أعلى لوجود كلمات مرتبطة به في الملاحظات.",
        causeDefault: "لا توجد كلمات مميزة لهذا السبب؛ الترتيب افتراضي وليس إثباتًا.",
        score: "نقاط المطابقة",
        advisory: "هذه النتيجة إرشادية وليست تشخيصًا مؤكدًا. راجع دليل الشركة المصنّعة."
      },
      fr: {
        noMatch: "Correspondance insuffisante, escaladez au responsable",
        weakReason: "Le seuil minimal de preuves n’est pas atteint; aucune panne n’est proposée.",
        rankedBy: "Raison du classement",
        equipment: "Type d’équipement correspondant",
        symptom: "Symptôme correspondant",
        keywords: "Mots des observations correspondants",
        causeMatched: "Classée plus haut car les observations contiennent des mots associés.",
        causeDefault: "Aucun mot distinctif trouvé pour cette cause; ordre indicatif, sans preuve.",
        score: "Points de correspondance",
        advisory: "Résultat indicatif, pas un diagnostic confirmé. Consultez le manuel du fabricant."
      },
      en: {
        noMatch: "No sufficient match; escalate to the supervisor",
        weakReason: "The minimum evidence threshold was not met; no fault was suggested.",
        rankedBy: "Ranking reason",
        equipment: "Equipment type match",
        symptom: "Symptom match",
        keywords: "Matching observation keywords",
        causeMatched: "Ranked higher because the notes contain related keywords.",
        causeDefault: "No distinctive keyword found for this cause; order is tentative, not proof.",
        score: "Match score",
        advisory: "This result is advisory, not a confirmed diagnosis. Consult the manufacturer manual."
      }
    }[lang];

    if (!data || !Array.isArray(data.faults)) {
      return { matched: false, message: t.noMatch, reason: t.weakReason, results: [], advisory: t.advisory, language: lang };
    }

    const equipment = normalizeText(input && input.equipmentType);
    const symptom = normalizeText(input && input.symptom);
    const notes = normalizeText([input && input.observations, input && input.errorCode].filter(Boolean).join(" "));
    const results = data.faults.map(fault => {
      const equipmentMatch = normalizeText(fault.equipmentType) === equipment;
      const symptomMatch = (fault.symptoms || []).some(item => normalizeText(item) === symptom);
      const allKeywords = Object.values(fault.keywords || {}).flat();
      const keywordMatches = findMatches(notes, allKeywords);
      const distinctHits = Math.min(keywordMatches.length, 3);
      const score = (equipmentMatch ? 4 : 0) + (symptomMatch ? 3 : 0) + distinctHits * 2;
      const causes = (fault.causes || []).map(cause => {
        const causeMatches = findMatches(notes, cause.keywords || []);
        return {
          id: cause.id,
          label: (cause.label && cause.label[lang]) || "",
          score: causeMatches.length,
          reason: causeMatches.length ? t.causeMatched : t.causeDefault,
          matchedKeywords: causeMatches
        };
      }).sort((a, b) => b.score - a.score);
      const reasons = [];
      if (equipmentMatch) reasons.push(t.equipment);
      if (symptomMatch) reasons.push(t.symptom);
      if (keywordMatches.length) reasons.push(t.keywords + ": " + keywordMatches.join(", "));
      return {
        id: fault.id,
        title: (fault.title && fault.title[lang]) || fault.id,
        score,
        equipmentMatch,
        symptomMatch,
        matchedKeywords: keywordMatches,
        rankingReason: reasons.join(" + "),
        causes,
        safeChecks: (fault.safeChecks || []).map(item => item[lang]).filter(Boolean),
        escalation: fault.escalation && fault.escalation[lang] || "",
        thresholdMet: equipmentMatch && symptomMatch && keywordMatches.length > 0 && score >= 9
      };
    }).filter(item => item.thresholdMet)
      .sort((a, b) => b.score - a.score || b.matchedKeywords.length - a.matchedKeywords.length || a.title.localeCompare(b.title));

    if (!results.length) {
      return { matched: false, message: t.noMatch, reason: t.weakReason, results: [], advisory: t.advisory, language: lang };
    }
    return { matched: true, message: "", reason: "", results, advisory: t.advisory, language: lang };
  }

  root.MaintenanceDiagnosticEngine = { normalizeText, diagnose };
  root.diagnose = diagnose;
})(typeof window !== "undefined" ? window : globalThis);
