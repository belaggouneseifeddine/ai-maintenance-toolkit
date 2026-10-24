/* Offline deterministic diagnostic ranking. No network calls and no invented technical limits. */
(function (root) {
  "use strict";

  function normalizeText(value) {
    return root.MaintenanceNormalization
      ? root.MaintenanceNormalization.normalizeText(value)
      : String(value == null ? "" : value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ");
  }
  function canonicalEquipment(value) {
    const result = root.MaintenanceNormalization && root.MaintenanceNormalization.canonicalize(value, "equipment");
    return result ? (result.status === "confirmed" ? result.canonical : result.normalized) : normalizeText(value);
  }
  function canonicalSymptom(value) {
    const result = root.MaintenanceNormalization && root.MaintenanceNormalization.canonicalize(value, "symptom");
    return result ? (result.status === "confirmed" ? result.canonical : result.normalized) : normalizeText(value);
  }

  function reviewAliasHint(value, domain, language) {
    if (!root.MaintenanceNormalization || typeof root.MaintenanceNormalization.canonicalize !== "function") return "";
    const result = root.MaintenanceNormalization.canonicalize(value, domain);
    if (!result || result.status !== "review_required") return "";
    const term = result.normalized || String(value == null ? "" : value);
    const suggestion = result.suggestedCanonical || "";
    const templates = {
      ar: "المدخل «" + term + "» مرادف يحتاج إلى مراجعة، ولم يُحوَّل تلقائيًا. اختر نوع المعدة أو العَرَض القياسي من القائمة لتجنب مطابقة خاطئة." + (suggestion ? " المعرّف القياسي المقترح: " + suggestion + "." : ""),
      fr: "Le terme «" + term + "» est un alias à vérifier et n’a pas été converti automatiquement. Choisissez l’équipement ou le symptôme standard dans la liste pour éviter une correspondance erronée." + (suggestion ? " Identifiant standard suggéré : " + suggestion + "." : ""),
      en: "The term '" + term + "' is an alias awaiting review and was not mapped automatically. Choose the standard equipment or symptom from the list to avoid a false match." + (suggestion ? " Suggested standard ID: " + suggestion + "." : "")
    };
    return templates[language] || templates.ar;
  }

  function findMatches(text, terms) {
    const normalized = normalizeText(text);
    const matches = [];
    for (const term of terms || []) {
      const needle = normalizeText(term);
      if (needle.length >= 3 && (" " + normalized + " ").includes(" " + needle + " ") && !matches.some(item => normalizeText(item) === needle)) {
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
        weakReason: "لم يُعثر على تطابق دقيق بين نوع المعدة والعَرَض. أضف الملاحظات أو نص الإنذار أو القياسات لتحسين المطابقة.",
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
        weakReason: "Aucune combinaison exacte équipement-symptôme n’a été trouvée. Ajoutez des observations, le texte d’alarme ou des mesures pour améliorer la correspondance.",
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
        weakReason: "No exact equipment-and-symptom pair was found. Add observations, alarm text, or measurements to improve matching.",
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

    const equipment = canonicalEquipment(input && input.equipmentType);
    const symptom = canonicalSymptom(input && input.symptom);
    const notes = normalizeText(input && input.observations);
    const results = data.faults.map(fault => {
      const equipmentMatch = canonicalEquipment(fault.equipmentType) === equipment;
      const symptomMatch = (fault.symptoms || []).some(item => { const candidate = canonicalSymptom(item); return candidate === symptom || (symptom === "noise_vibration" && ["noise","vibration"].includes(candidate)) || (symptom === "low_flow_pressure" && ["low_flow","low_pressure"].includes(candidate)); });
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
      else if (equipmentMatch && symptomMatch) reasons.push(lang === "ar"
        ? "مطابقة أولية فقط؛ أضف ملاحظات لتضييق الاحتمالات."
        : lang === "fr"
          ? "Correspondance initiale seulement; ajoutez des observations pour préciser les possibilités."
          : "Preliminary match only; add observations to narrow the possibilities.");
      const confidence = keywordMatches.length >= 2 ? "medium" : "low";
      return {
        id: fault.id,
        title: (fault.title && fault.title[lang]) || fault.id,
        confidence,
        confidenceLabel: ({ ar: { low: "منخفضة — مطابقة أولية", medium: "متوسطة — توجد كلمات داعمة" }, fr: { low: "Faible — correspondance initiale", medium: "Moyenne — mots concordants" }, en: { low: "Low — preliminary match", medium: "Medium — supporting keywords found" } })[lang][confidence],
        score,
        equipmentMatch,
        symptomMatch,
        matchedKeywords: keywordMatches,
        rankingReason: reasons.join(" + "),
        causes,
        safeChecks: (fault.safeChecks || []).map(item => item[lang]).filter(Boolean),
        escalation: fault.escalation && fault.escalation[lang] || "",
        // Equipment + symptom is enough to show tentative candidates. Observation keywords improve ranking but must not hide all candidates.
      thresholdMet: equipmentMatch && symptomMatch && score >= 7
      };
    }).filter(item => item.thresholdMet)
      .sort((a, b) => b.score - a.score || b.matchedKeywords.length - a.matchedKeywords.length || a.title.localeCompare(b.title));

    if (!results.length) {
      const aliasHints = [
        reviewAliasHint(input && input.equipmentType, "equipment", lang),
        reviewAliasHint(input && input.symptom, "symptom", lang)
      ].filter(Boolean);
      return {
        matched: false,
        message: t.noMatch,
        reason: [t.weakReason, ...aliasHints].join(" "),
        normalizationReview: aliasHints,
        results: [],
        advisory: t.advisory,
        language: lang
      };
    }
    return { matched: true, message: "", reason: "", results, advisory: t.advisory, language: lang };
  }

  root.MaintenanceDiagnosticEngine = { normalizeText, canonicalEquipment, canonicalSymptom, diagnose };
  root.diagnose = diagnose;
})(typeof window !== "undefined" ? window : globalThis);
