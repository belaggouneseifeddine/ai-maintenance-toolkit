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
      return { matched: false, message: t.noMatch, reason: t.weakReason, results: [], advisory: t.advisory, language: lang };
    }
    return { matched: true, message: "", reason: "", results, advisory: t.advisory, language: lang };
  }

  /* Exploratory candidates are deliberately limited to known equipment/symptom pairs.
   * They are hypotheses to test, not fault confirmations or manufacturer claims. */
  const EXPLORATORY = {
    "pump|noise": [
      { id:"pump-suction-condition", label:{ar:"ظروف السحب أو احتمال التكهف",fr:"Conditions d’aspiration ou cavitation possible",en:"Suction conditions or possible cavitation"}, why:{ar:"قد يتوافق الضجيج مع اضطراب جهة السحب، لكنه لا يثبت التكهف.",fr:"Le bruit peut correspondre à une aspiration perturbée, sans prouver la cavitation.",en:"Noise can fit disturbed suction conditions, but does not prove cavitation."}, check:{ar:"قارن قراءات السحب ومستوى المصدر والتدفق بخط الأساس ومنحنى الطراز.",fr:"Comparer aspiration, niveau source et débit aux références et à la courbe du modèle.",en:"Compare suction, source level and flow with baseline and the model's pump curve."}, keywords:["suction","aspiration","سحب","ضغط","pressure","débit","تدفق"] },
      { id:"pump-alignment-mounting", label:{ar:"محاذاة أو تثبيت غير مستقر — احتمال",fr:"Désalignement ou support instable — hypothèse",en:"Possible misalignment or unstable mounting"}, why:{ar:"الاهتزاز قد يرتبط بالمحاذاة أو التثبيت؛ يلزم سجل أو فحص مناسب بعد العزل.",fr:"Les vibrations peuvent être liées à l’alignement ou au support; contrôler après isolement.",en:"Vibration may relate to alignment or mounting; use history or qualified inspection after isolation."}, check:{ar:"راجع اتجاهات الاهتزاز وسجل التثبيت والمحاذاة بعد تأمين المعدة.",fr:"Examiner les tendances vibratoires et le support après sécurisation.",en:"Review vibration trends and mounting history after safe isolation."}, keywords:["vibration","اهتزاز","align","محاذاة","bearing","محمل"] }
    ],
    "pump|low_flow": [
      { id:"pump-supply-condition", label:{ar:"تغذية أو ظروف سحب غير كافية — احتمال",fr:"Alimentation ou aspiration insuffisante — hypothèse",en:"Possible insufficient supply or suction"}, why:{ar:"ضعف التدفق قد يرتبط بالتغذية أو ظروف السحب، ويحتاج قراءات موثوقة.",fr:"Un faible débit peut être lié à l’alimentation ou à l’aspiration; des mesures fiables sont nécessaires.",en:"Low flow may relate to supply or suction; reliable readings are needed."}, check:{ar:"قارن ضغط السحب والخروج والتدفق ومستوى المصدر مع خط الأساس، مع الوحدات.",fr:"Comparer aspiration, refoulement, débit et niveau source aux références avec unités.",en:"Compare suction/discharge pressure, flow and source level with baseline, including units."}, keywords:["suction","aspiration","سحب","source","مصدر","pressure","ضغط","flow","débit","تدفق"] },
      { id:"pump-flow-path", label:{ar:"تقييد محتمل في مسار التدفق أو وضع صمام",fr:"Restriction possible du circuit ou position de vanne",en:"Possible flow-path restriction or valve position"}, why:{ar:"قد يحد تقييد المسار أو وضع الصمام من التدفق؛ يجب التحقق من المؤشرات الفعلية.",fr:"Une restriction ou la position d’une vanne peut limiter le débit; vérifier les indicateurs.",en:"A restriction or valve position can limit flow; verify actual indicators."}, check:{ar:"راجع مؤشرات الخط ووضع الصمامات المرئي من مكان آمن؛ لا تفتح خطًا مضغوطًا.",fr:"Examiner les indicateurs et positions visibles à distance sûre; ne pas ouvrir de conduite pressurisée.",en:"Review line indicators and safely visible valve positions; do not open pressurized lines."}, keywords:["valve","vanne","صمام","filter","filtre","مرشح","blockage","انسداد"] }
    ],
    "pump|leak": [
      { id:"pump-leak-location", label:{ar:"مانع تسرب أو وصلة — يعتمد على موضع التسرب",fr:"Garniture ou raccord — selon l’emplacement",en:"Seal or connection — depends on leak location"}, why:{ar:"العَرَض لا يحدد الجزء؛ يلزم تحديد موضع السائل ونوعه من مسافة آمنة.",fr:"Le symptôme ne désigne pas la pièce; identifier le fluide et l’emplacement à distance sûre.",en:"The symptom does not identify the part; identify fluid and location from a safe distance."}, check:{ar:"سجّل موضع التسرب ونوع السائل؛ اعزل وفرّغ الضغط قبل أي تدخل.",fr:"Noter l’emplacement et le fluide; isoler et dépressuriser avant intervention.",en:"Record leak location and fluid; isolate and depressurize before intervention."}, keywords:["seal","garniture","مانع","joint","وصلة","gasket","حشية"] }
    ],
    "motor|overheat": [
      { id:"motor-load-cooling", label:{ar:"حمل أو تبريد/تهوية غير ملائمين — احتمال",fr:"Charge ou refroidissement/ventilation — hypothèse",en:"Possible load or cooling/ventilation issue"}, why:{ar:"ارتفاع الحرارة قد يرتبط بالحمل أو التبريد، ولا يحسم السبب دون قراءات ومواصفات الطراز.",fr:"La surchauffe peut être liée à la charge ou au refroidissement; comparer aux données du modèle.",en:"Overheating may relate to load or cooling; compare readings with model data."}, check:{ar:"راجع اتجاه الحرارة والحمل وفتحات التهوية الخارجية، وقارن بلوحة الاسم ودليل الطراز.",fr:"Examiner tendance thermique, charge et ventilation externe; comparer à la plaque et à la notice.",en:"Review temperature trend, load and external ventilation; compare with nameplate and exact manual."}, keywords:["load","charge","حمل","cooling","refroidissement","تبريد","ventilation","تهوية"] }
    ],
    "motor|noise": [
      { id:"motor-rotating-assembly", label:{ar:"محامل أو محاذاة أو تثبيت — فرضيات بديلة",fr:"Roulements, alignement ou support — hypothèses alternatives",en:"Bearing, alignment or mounting — alternative hypotheses"}, why:{ar:"الضجيج وحده لا يميز بين هذه الأسباب؛ يلزم اتجاه اهتزاز وسياق تشغيل.",fr:"Le bruit seul ne distingue pas ces causes; examiner les tendances et le contexte.",en:"Noise alone cannot distinguish these causes; review vibration trends and operating context."}, check:{ar:"أوقف عند الصوت المفاجئ/الشديد؛ راجع السجل وافحص بعد العزل بواسطة شخص مؤهل.",fr:"Arrêter en cas de bruit soudain/sévère; examiner l’historique après isolement.",en:"Stop for sudden/severe noise; review history and inspect after isolation by a qualified person."}, keywords:["bearing","roulement","محمل","alignment","محاذاة","vibration","اهتزاز"] }
    ],
    "compressor|low_pressure": [
      { id:"compressor-demand-distribution", label:{ar:"الطلب أو شبكة التوزيع أو المرشحات — احتمالات",fr:"Demande, réseau de distribution ou filtres — possibilités",en:"Demand, distribution network or filters — possibilities"}, why:{ar:"قد ينشأ انخفاض الضغط من الشبكة أو الطلب، وليس بالضرورة من الضاغط نفسه.",fr:"La baisse de pression peut venir du réseau ou de la demande, pas nécessairement du compresseur.",en:"Low pressure may come from distribution or demand, not necessarily the compressor itself."}, check:{ar:"قارن قراءات المخرج ونقطة الاستخدام في ظروف متقاربة، وسجّل الإنذارات دون تغيير نقاط الضبط.",fr:"Comparer sortie et point d’utilisation dans des conditions similaires; noter les alarmes.",en:"Compare outlet and point-of-use readings under similar conditions; record alarms without changing setpoints."}, keywords:["filter","filtre","مرشح","leak","fuite","تسرب","demand","demande","طلب","distribution","شبكة"] }
    ],
    "compressor|overheat": [
      { id:"compressor-cooling-load", label:{ar:"تبريد أو حمل أو صيانة — فرضيات",fr:"Refroidissement, charge ou entretien — hypothèses",en:"Cooling, load or maintenance — hypotheses"}, why:{ar:"ارتفاع الحرارة عرض متعدد الأسباب؛ يلزم رمز الإنذار وبيانات الطراز والاتجاهات.",fr:"La surchauffe a plusieurs causes possibles; relever l’alarme, le modèle et les tendances.",en:"Overheating has multiple possible causes; capture alarm, model and trends."}, check:{ar:"سجّل رمز الإنذار والحرارة من المؤشرات المتاحة، وراجع دليل الطراز الدقيق.",fr:"Noter l’alarme et la température disponibles; consulter la notice exacte.",en:"Record available alarm and temperature indicators; consult the exact model manual."}, keywords:["cooling","refroidissement","تبريد","oil","huile","زيت","load","charge","حمل"] }
    ],
    "valve|not_start": [
      { id:"valve-command-permissive", label:{ar:"أمر التشغيل أو شروط السماح أو مصدر طاقة المشغل",fr:"Commande, autorisations ou alimentation de l’actionneur",en:"Start command, permissives or actuator supply"}, why:{ar:"حالة الأمر والإنذار والتغذية تساعد في تضييق الاحتمالات دون تجاوز الحماية.",fr:"Commande, alarmes et alimentation aident à préciser sans contourner les protections.",en:"Command, alarms and supply status help narrow possibilities without bypassing protection."}, check:{ar:"راجع الأمر والموضع والإنذارات ومؤشرات التغذية من الواجهة المصرح بها.",fr:"Examiner commande, position, alarmes et alimentation depuis l’interface autorisée.",en:"Review command, position, alarms and supply indicators from the authorized interface."}, keywords:["command","commande","أمر","supply","alimentation","تغذية","interlock","permissive","سماح"] }
    ],
    "conveyor|noise": [
      { id:"conveyor-drive-tracking", label:{ar:"محمل أو بكرة أو محاذاة — احتمال يحتاج عزلًا",fr:"Roulement, rouleau ou alignement — hypothèse nécessitant isolement",en:"Bearing, roller or alignment — hypothesis requiring isolation"}, why:{ar:"الضجيج لا يحدد الجزء؛ لا تفحص السير أو نقاط السحب أثناء الحركة.",fr:"Le bruit ne désigne pas la pièce; ne pas inspecter le convoyeur en mouvement.",en:"Noise does not identify the part; do not inspect a moving conveyor."}, check:{ar:"سجّل مكان الصوت وتوقيته، ثم اطلب الفحص بعد العزل وتأمين الحركة.",fr:"Noter l’emplacement et le moment du bruit; inspecter après isolement.",en:"Record noise location and timing; inspect only after isolation and motion restraint."}, keywords:["bearing","roulement","محمل","roller","rouleau","بكرة","tracking","align","محاذاة"] }
    ]
  };

  const GENERAL_REFERENCES = {
    pump: [{id:"doe-pump-sourcebook",title:"Improving Pumping System Performance — DOE / Hydraulic Institute (general reference)",url:"https://www.energy.gov/sites/prod/files/2014/05/f16/pump.pdf",status:"general-reference-not-model-specific"}],
    motor: [{id:"abb-motor-troubleshooting",title:"ABB motor maintenance and troubleshooting (check exact motor applicability)",url:"https://library.e.abb.com/public/c553f9f2138646fbbe2321456a02de51/MN404.pdf",status:"manufacturer-reference-scope-needs-model-check"}],
    compressor: [{id:"doe-compressed-air-sourcebook",title:"Improving Compressed Air System Performance — DOE (general reference)",url:"https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/compressed_air_sourcebook.pdf",status:"general-reference-not-model-specific"}],
    safety: [{id:"osha-loto",title:"OSHA 29 CFR 1910.147 — hazardous-energy control (safety context only)",url:"https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147",status:"safety-reference-not-fault-cause"}]
  };

  function analyse(input, library) {
    const value = input || {};
    const language = ["ar","fr","en"].includes(value.language) ? value.language : "ar";
    const equipment = canonicalEquipment(value.machine || value.equipmentType || "");
    const symptom = canonicalSymptom(value.symptom || "");
    const rawSymptom = String(value.symptom || "").toLocaleLowerCase();
    const catalogSymptom = symptom === "noise_vibration"
      ? (/vibration|اهتزاز|رجة/.test(rawSymptom) ? "vibration" : "noise")
      : symptom === "low_flow_pressure"
        ? (/pressure|ضغط/.test(rawSymptom) ? "low_pressure" : "low_flow")
        : symptom;
    const observations = String(value.observations || "");
    const key = equipment + "|" + catalogSymptom;
    const local = diagnose({ equipmentType: value.machine || value.equipmentType, symptom: value.symptom, observations, language }, library);
    const hypotheses = [];
    if (local.matched) {
      for (const result of local.results.slice(0, 3)) {
        for (const cause of (result.causes || []).slice(0, 2)) {
          hypotheses.push({
            id: cause.id,
            label: cause.label || result.title,
            why: cause.matchedKeywords && cause.matchedKeywords.length
              ? (language==="ar" ? "توجد كلمات في الملاحظات تتوافق مع هذه الفرضية، لكنها لا تثبت السبب." : language==="fr" ? "Des mots des observations concordent avec cette hypothèse, sans confirmer la cause." : "Observation keywords fit this hypothesis, but do not confirm the cause.")
              : (language==="ar" ? "توافق نوع المعدة والعَرَض فقط؛ لا يوجد دليل مميز يؤكد هذه الفرضية." : language==="fr" ? "Seuls l’équipement et le symptôme correspondent; aucun indice distinctif ne confirme cette hypothèse." : "Only equipment and symptom match; no distinctive evidence confirms this hypothesis."),
            evidenceFor: cause.matchedKeywords || [],
            evidenceAgainst: cause.matchedKeywords && cause.matchedKeywords.length ? [] : [language==="ar" ? "لا توجد ملاحظة مميزة تؤيد هذا السبب حتى الآن." : language==="fr" ? "Aucune observation distinctive ne soutient encore cette cause." : "No distinctive observation supports this cause yet."],
            nextCheck: (result.safeChecks || [])[0] || (language==="ar" ? "اجمع معلومات آمنة وقارنها بدليل الطراز الدقيق." : language==="fr" ? "Recueillir des informations sûres et consulter la notice exacte." : "Collect safe information and consult the exact model manual."),
            status: "hypothesis_only",
            basis: "local-fault-library-pattern"
          });
          if (hypotheses.length >= 3) break;
        }
        if (hypotheses.length >= 3) break;
      }
    }
    let usedExploratory = false;
    if (!hypotheses.length && EXPLORATORY[key]) {
      usedExploratory = true;
      for (const item of EXPLORATORY[key].slice(0,3)) {
        const evidenceFor = findMatches(observations, item.keywords || []);
        hypotheses.push({
          id: item.id,
          label: item.label[language],
          why: item.why[language],
          evidenceFor,
          evidenceAgainst: evidenceFor.length ? [] : [language==="ar" ? "لا توجد ملاحظة مميزة كافية؛ هذه فرضية استكشافية فقط." : language==="fr" ? "Aucun indice distinctif suffisant; hypothèse exploratoire uniquement." : "No distinctive evidence yet; exploratory hypothesis only."],
          nextCheck: item.check[language],
          status: "hypothesis_only",
          basis: "symptom-pattern-not-source-verified"
        });
      }
    }
    const missing = [];
    if (!value.machine && !value.equipmentType) missing.push(language==="ar" ? "حدّد نوع المعدة بدقة." : language==="fr" ? "Précisez le type d’équipement." : "Identify the equipment type.");
    if (!value.symptom || symptom === "other") missing.push(language==="ar" ? "صف العَرَض بصورة قابلة للملاحظة." : language==="fr" ? "Décrivez le symptôme observable." : "Describe the observable symptom.");
    if (!observations.trim()) missing.push(language==="ar" ? "أضف ملاحظات أو قياسات مسجلة مع الوحدات إن توفرت." : language==="fr" ? "Ajoutez des observations ou mesures enregistrées avec unités si disponibles." : "Add recorded observations or measurements with units if available.");
    const references = (GENERAL_REFERENCES[equipment] || []).slice();
    if (equipment === "pump" && /grundfos/i.test(String(value.manufacturer||"") + " " + String(value.manualRef||"")) && /hydro\s*en/i.test(String(value.model||"") + " " + String(value.manualRef||"")) && /(firefighting|fire protection|sprinkler|مكافحة الحريق|إطفاء)/i.test(String(value.application||"") + " " + String(value.manualRef||""))) {
      references.push({id:"grundfos-hydro-en",title:"Grundfos Hydro EN — section 13 fault-finding headings only; detailed cause table not verified",url:"https://api.grundfos.com/literature/Grundfosliterature-6819528.pdf",status:"scope-gated-heading-only-not-evidence-for-cause"});
    }
    if (equipment === "compressor" && /ingersoll\s*rand/i.test(String(value.manufacturer||"")) && String(value.model||"").trim()) {
      references.push({id:"ingersoll-rand-model-manual-portal",title:"Ingersoll Rand reciprocating compressor documents — select exact model manual",url:"https://www.ingersollrand.com/en-us/resources/knowledge-hub/reciprocating-compressor-documents/",status:"portal-only-exact-manual-not-selected"});
    }
    if (references.length) references.push(...GENERAL_REFERENCES.safety);
    return {
      language,
      equipment,
      symptom,
      matched: local.matched,
      hypotheses: hypotheses.slice(0,3),
      mode: usedExploratory ? "exploratory" : local.matched ? "local-pattern" : "insufficient",
      confirmedCause: "",
      missing,
      references,
      note: language==="ar" ? "الفرضيات ليست أعطالًا مؤكدة. المراجع أدناه نقاط رجوع وليست دليلًا مباشرًا على السبب، ما لم يُذكر خلاف ذلك مع مطابقة الموديل والصفحة." : language==="fr" ? "Les hypothèses ne sont pas des pannes confirmées. Les références ci-dessous sont des pistes, pas une preuve directe, sauf vérification du modèle et de la page." : "Hypotheses are not confirmed faults. References below are lookup leads, not direct proof unless the exact model and page have been verified."
    };
  }

  function renderLocalReasoning(input, result) {
    const doc = root.document;
    if (!doc) return;
    const target = doc.getElementById("diagnosisResult");
    if (!target) return;
    let card = doc.getElementById("localReasoningCard");
    if (card) card.remove();
    card = doc.createElement("section");
    card.id = "localReasoningCard";
    card.className = "result";
    const lang = result.language;
    const title = doc.createElement("h3");
    title.textContent = lang==="ar" ? "فرضيات الاستدلال المحلي" : lang==="fr" ? "Hypothèses du raisonnement local" : "Local reasoning hypotheses";
    card.appendChild(title);
    const intro = doc.createElement("p");
    intro.textContent = lang==="ar" ? "هذا المسار يعمل محليًا. قد يقترح احتمالات، لكنه لا يؤكد السبب ولا يخترع دليل مصنع." : lang==="fr" ? "Ce parcours fonctionne localement. Il propose des possibilités sans confirmer la cause ni inventer une preuve fabricant." : "This path runs locally. It can suggest possibilities, but does not confirm root cause or invent manufacturer evidence.";
    card.appendChild(intro);
    if (!result.hypotheses.length) {
      const empty = doc.createElement("p");
      empty.textContent = lang==="ar" ? "لا توجد فرضيات مناسبة لهذا الزوج من المعدة والعَرَض. أضف تفاصيل أو اختر مرجعًا مطابقًا، ثم صعّد إذا بقي الدليل غير كافٍ." : lang==="fr" ? "Aucune hypothèse adaptée à cette combinaison. Ajoutez des détails ou une référence appropriée; escaladez si les preuves restent insuffisantes." : "No suitable hypothesis for this equipment/symptom pair. Add details or a matching reference; escalate if evidence remains insufficient.";
      card.appendChild(empty);
    }
    for (const hypothesis of result.hypotheses) {
      const block = doc.createElement("article");
      block.className = "record";
      const heading = doc.createElement("h4");
      heading.textContent = hypothesis.label + " — " + (lang==="ar" ? "فرضية فقط" : lang==="fr" ? "hypothèse uniquement" : "hypothesis only");
      block.appendChild(heading);
      const why = doc.createElement("p"); why.textContent = (lang==="ar" ? "لماذا: " : lang==="fr" ? "Pourquoi : " : "Why: ") + hypothesis.why; block.appendChild(why);
      const evidence = doc.createElement("p");
      const supported = (hypothesis.evidenceFor || []).length ? hypothesis.evidenceFor.join(", ") : (lang==="ar" ? "لا توجد كلمات داعمة محددة." : lang==="fr" ? "Aucun mot concordant précis." : "No specific matching terms.");
      evidence.textContent = (lang==="ar" ? "ما يؤيدها في المدخلات: " : lang==="fr" ? "Indices dans les observations : " : "Input evidence: ") + supported;
      block.appendChild(evidence);
      if ((hypothesis.evidenceAgainst || []).length) {
        const against = doc.createElement("p"); against.textContent = (lang==="ar" ? "ما ينقص/يعارض: " : lang==="fr" ? "Limites/éléments manquants : " : "Missing/contrary evidence: ") + hypothesis.evidenceAgainst.join("; "); block.appendChild(against);
      }
      const check = doc.createElement("p"); check.textContent = (lang==="ar" ? "الخطوة التالية الآمنة: " : lang==="fr" ? "Prochaine vérification sûre : " : "Next safe check: ") + hypothesis.nextCheck; block.appendChild(check);
      card.appendChild(block);
    }
    for (const ref of result.references) {
      const p = doc.createElement("p");
      const a = doc.createElement("a");
      a.href = ref.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = ref.title;
      p.appendChild(a);
      const status = doc.createElement("small"); status.textContent = " — " + ref.status; p.appendChild(status);
      card.appendChild(p);
    }
    const note = doc.createElement("p"); note.className = "hint"; note.textContent = result.note; card.appendChild(note);
    target.appendChild(card);
  }

  function initLocalReasoningUI() {
    const doc = root.document;
    if (!doc) return;
    const form = doc.getElementById("diagnosisForm");
    if (!form || form.dataset.localReasoningBound === "true") return;
    form.dataset.localReasoningBound = "true";
    form.addEventListener("submit", function () {
      Promise.resolve().then(function () {
        const checks = Array.from(doc.querySelectorAll("#safetyChecks input[type=checkbox]"));
        const language = doc.getElementById("languageSwitcher")?.value || "ar";
        const target = doc.getElementById("diagnosisResult");
        const priority = doc.getElementById("priority")?.value;
        if (target) { const old = doc.getElementById("localReasoningCard"); if (old) old.remove(); }
        if (priority === "urgent" || !checks.length || checks.some(item => !item.checked)) {
          if (target) {
            const notice = doc.createElement("p");
            notice.id = "localReasoningCard";
            notice.className = "notice";
            notice.textContent = language==="ar" ? "لم تُعرض فرضيات لأن الحالة عاجلة أو لأن قائمة السلامة لم تكتمل. أكمل التحقق الآمن أو صعّد للمسؤول." : language==="fr" ? "Les hypothèses sont masquées car la priorité est urgente ou la liste de sécurité est incomplète." : "Hypotheses are hidden because priority is urgent or the safety checklist is incomplete.";
            target.appendChild(notice);
          }
          return;
        }
        const input = {
          machine: doc.getElementById("machine")?.value || "",
          symptom: doc.getElementById("symptom")?.value || "",
          observations: doc.getElementById("observations")?.value || "",
          language,
          manufacturer: doc.getElementById("manufacturer")?.value || "",
          model: doc.getElementById("model")?.value || "",
          manualRef: doc.getElementById("manualRef")?.value || ""
        };
        renderLocalReasoning(input, analyse(input));
      });
    });
  }

  const api = { normalizeText, canonicalEquipment, canonicalSymptom, diagnose, analyse, renderLocalReasoning, GENERAL_REFERENCES };
  root.MaintenanceDiagnosticEngine = api;
  root.diagnose = diagnose;
  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", initLocalReasoningUI, { once: true });
    else initLocalReasoningUI();
  }
})(typeof window !== "undefined" ? window : globalThis);
