/* Discrete Bayesian network-style ranking for local maintenance hypotheses.
 * Initial conditional likelihoods are expert-elicited assumptions, not field-calibrated
 * probabilities. Numeric posteriors are used internally for ordering only and are never
 * shown to technicians. This module cannot confirm faults or override safety gates.
 */
(function (root) {
  "use strict";

  const MODEL_VERSION = "bayesian_network_v2";
  const CALIBRATION_STATUS = "uncalibrated-expert-initialization";
  const DEFAULT_PRIOR = 0.2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const logit = p => Math.log(p / (1 - p));
  const logistic = x => 1 / (1 + Math.exp(-x));

  const FEATURE_RULES = [
    { id: "suction_low", label: { ar: "ضغط/مستوى السحب منخفض أو غير مستقر", fr: "Pression/niveau d’aspiration bas ou instable", en: "Low or unstable suction pressure/level" }, patterns: [/(?:low|reduced|below(?: normal)?|unstable)\s+(?:suction|inlet)\s+(?:pressure|level)/i, /(?:suction|inlet)\s+(?:pressure|level)\s+(?:is\s+)?(?:low|reduced|unstable)/i, /ضغط السحب منخفض|مستوى السحب منخفض|مستوى المصدر منخفض/i, /pression d['’]aspiration (?:basse|instable)/i] },
    { id: "suction_normal", label: { ar: "مؤشر السحب أو مستوى المصدر طبيعي", fr: "Indicateur d’aspiration ou niveau source normal", en: "Suction indicator or source level appears normal" }, patterns: [/(?:suction|inlet)\s+(?:tank\s+)?(?:pressure|level)\s+(?:appears\s+|is\s+)?normal/i, /normal\s+(?:suction|inlet)\s+(?:pressure|level)/i, /ضغط السحب طبيعي|مستوى (?:الخزان|المصدر) طبيعي/i, /niveau source normal|pression d['’]aspiration normale/i] },
    { id: "restriction_indicated", label: { ar: "مؤشر على انسداد أو تقييد في مسار التدفق", fr: "Indice de restriction ou d’obstruction du circuit", en: "An obstruction or flow-path restriction is indicated" }, patterns: [/(?:blocked|clogged|obstructed)\s+(?:filter|strainer|line|valve|flow|path)/i, /(?:filter|strainer|line|flow path)\s+(?:is\s+)?(?:blocked|clogged|obstructed)/i, /valve\s+(?:is\s+)?closed|restriction indicated|flow.?path restriction/i, /انسداد|مرشح مسدود|صمام مغلق|تقييد مسار التدفق/i, /filtre bouché|vanne fermée|conduite obstruée/i] },
    { id: "flow_path_normal", label: { ar: "لا يظهر تقييد في المسار حسب المؤشرات المتاحة", fr: "Aucune restriction visible selon les indicateurs disponibles", en: "Available indicators show no flow-path restriction" }, patterns: [/no (?:blockage|obstruction|restriction)|filter (?:is )?clean|valves? (?:are )?normal/i, /لا يوجد انسداد|المرشح نظيف|وضع الصمامات طبيعي/i, /aucune obstruction|filtre propre|vannes normales/i] },
    { id: "demand_changed", label: { ar: "تغير في الطلب أو الحمل أو ظروف التشغيل", fr: "Changement de demande, de charge ou de conditions", en: "Demand, load, or operating conditions changed" }, patterns: [/(?:demand|load)\s+(?:has\s+)?(?:increased|changed|is higher)/i, /operating conditions? changed|operating point changed|higher demand/i, /تغير الطلب|زيادة الحمل|تغير ظروف التشغيل/i, /demande augmentée|charge modifiée|conditions de fonctionnement modifiées/i] },
    { id: "demand_unchanged", label: { ar: "لم تُذكر تغييرات حديثة في التشغيل", fr: "Aucun changement récent de fonctionnement signalé", en: "No recent operating changes were reported" }, patterns: [/no recent (?:maintenance or )?operating changes|demand unchanged|load unchanged|no recent changes reported/i, /لا توجد تغييرات حديثة|لم تتغير ظروف التشغيل/i, /aucun changement récent signalé|demande inchangée/i] },
    { id: "command_missing", label: { ar: "أمر التشغيل غير موجود أو غير ظاهر", fr: "Commande de démarrage absente ou non visible", en: "Start command is missing or not shown" }, patterns: [/no start command|start command missing|no command is present/i, /لا يوجد أمر تشغيل|أمر التشغيل غير موجود/i, /aucune commande de démarrage/i] },
    { id: "command_present", label: { ar: "أمر التشغيل ظاهر أو مسجل", fr: "Commande de démarrage présente", en: "Start command is present or reported" }, patterns: [/start command (?:is )?(?:reported )?present|command present/i, /أمر التشغيل موجود|إشارة التشغيل موجودة/i, /commande de démarrage présente/i] },
    { id: "permissive_block", label: { ar: "شرط سماح أو تشابك يمنع البدء", fr: "Autorisation ou interverrouillage bloquant le démarrage", en: "A start permissive or interlock is blocking start" }, patterns: [/permissive (?:is )?(?:blocked|not satisfied|missing)|start inhibited|interlock active/i, /شرط السماح غير محقق|التشابك يمنع التشغيل/i, /autorisation non satisfaite|interverrouillage actif/i] },
    { id: "trip_present", label: { ar: "إنذار فصل أو حماية ظاهر", fr: "Déclenchement ou défaut de protection indiqué", en: "A trip or protection fault is indicated" }, patterns: [/trip (?:is )?(?:active|present|occurred)|overload trip|protection tripped/i, /إنذار فصل|الحماية فصلت|عطل حماية ظاهر/i, /déclenchement actif|défaut de protection/i] },
    { id: "no_trip_indicated", label: { ar: "لا يظهر إنذار فصل وفق الملاحظة", fr: "Aucun déclenchement visible selon l’observation", en: "No trip indication is visible in the observation" }, patterns: [/no trip (?:indication|is shown|is visible)|no fault indication|no alarm visible/i, /لا يظهر إنذار|لا توجد إشارة فصل/i, /aucun déclenchement visible|aucune alarme visible/i] },
    { id: "vibration_increased", label: { ar: "اهتزاز أعلى من المعتاد أو خط الأساس", fr: "Vibration supérieure à l’habitude ou à la référence", en: "Vibration is above normal or baseline" }, patterns: [/increased vibration|vibration (?:is )?(?:high|excessive)|vibration above baseline/i, /اهتزاز (?:مرتفع|شديد)|زيادة الاهتزاز/i, /vibration élevée|vibration excessive/i] },
    { id: "bearing_noise", label: { ar: "ضجيج احتكاك أو محمل مذكور صراحة", fr: "Bruit de roulement ou de frottement explicitement signalé", en: "Bearing or grinding noise explicitly reported" }, patterns: [/bearing noise|grinding noise|rumbling bearing/i, /صوت المحمل|صوت احتكاك/i, /bruit de roulement|bruit de frottement/i] },
    { id: "alignment_issue", label: { ar: "مشكلة محاذاة مذكورة صراحة", fr: "Problème d’alignement explicitement signalé", en: "An alignment issue is explicitly reported" }, patterns: [/misalignment|alignment issue/i, /عدم محاذاة|خلل المحاذاة/i, /désalignement/i] },
    { id: "network_pressure_drop", label: { ar: "انخفاض ضغط في الشبكة أو نقطة الاستخدام", fr: "Baisse de pression dans le réseau ou au point d’utilisation", en: "Pressure drop in the network or at point of use" }, patterns: [/pressure drop in (?:the )?network|outlet normal.{0,60}point.?of.?use low/i, /انخفاض الضغط في الشبكة|ضغط نقطة الاستخدام منخفض/i, /baisse de pression dans le réseau/i] },
    { id: "cooling_issue", label: { ar: "مشكلة تبريد أو تهوية مذكورة", fr: "Problème de refroidissement ou de ventilation signalé", en: "Cooling or ventilation problem reported" }, patterns: [/cooling failure|poor cooling|blocked ventilation|cooling fan failed/i, /تبريد ضعيف|تعطل التبريد|انسداد التهوية/i, /refroidissement insuffisant|ventilation obstruée/i] },
    { id: "load_high", label: { ar: "حمل مرتفع أو زيادة حمل مذكورة", fr: "Charge élevée ou surcharge signalée", en: "High load or overload reported" }, patterns: [/high load|overload|load increased/i, /حمل مرتفع|زيادة الحمل|حمل زائد/i, /charge élevée|surcharge/i] },
    { id: "power_issue", label: { ar: "عطل في دائرة القدرة أو التغذية مذكور", fr: "Défaut d’alimentation ou du circuit de puissance signalé", en: "Power supply or power-circuit fault reported" }, patterns: [/power supply failure|phase loss|power circuit fault/i, /فقدان طور|عطل دائرة القدرة|فشل التغذية الكهربائية/i, /perte de phase|défaut du circuit de puissance/i] },
    { id: "mechanical_issue", label: { ar: "انحشار أو عائق ميكانيكي مذكور", fr: "Blocage ou obstacle mécanique signalé", en: "Mechanical jam or obstruction reported" }, patterns: [/mechanical jam|shaft seized|mechanical load jammed/i, /انحشار ميكانيكي|عمود عالق/i, /blocage mécanique|arbre grippé/i] }
  ];

  // Each pair is [P(feature | cause), P(feature | other causes)].
  // These are conservative, uncalibrated starting assumptions, not empirical failure rates.
  const PROFILES = {
    pumpSupply: { suction_low: [0.78, 0.18], suction_normal: [0.14, 0.62], restriction_indicated: [0.22, 0.38], demand_unchanged: [0.42, 0.55] },
    pumpFlowPath: { restriction_indicated: [0.78, 0.16], flow_path_normal: [0.12, 0.62], suction_low: [0.22, 0.2], suction_normal: [0.42, 0.48] },
    pumpOperating: { demand_changed: [0.76, 0.2], demand_unchanged: [0.16, 0.62], suction_low: [0.2, 0.22], restriction_indicated: [0.18, 0.24] },
    motorCommand: { command_missing: [0.8, 0.12], command_present: [0.16, 0.7], permissive_block: [0.74, 0.12], no_trip_indicated: [0.38, 0.5] },
    motorTrip: { trip_present: [0.8, 0.12], no_trip_indicated: [0.14, 0.62], permissive_block: [0.35, 0.28], command_present: [0.42, 0.55] },
    motorPowerMechanical: { power_issue: [0.72, 0.14], mechanical_issue: [0.68, 0.12], command_present: [0.45, 0.55], trip_present: [0.4, 0.35] },
    motorRotating: { vibration_increased: [0.72, 0.2], bearing_noise: [0.76, 0.12], alignment_issue: [0.7, 0.12] },
    compressorDistribution: { network_pressure_drop: [0.78, 0.15], demand_changed: [0.65, 0.2], restriction_indicated: [0.58, 0.22] },
    compressorCooling: { cooling_issue: [0.78, 0.14], load_high: [0.68, 0.24] },
    generic: { keyword_support: [0.65, 0.35], explicit_contrary: [0.25, 0.55] }
  };

  function normalize(value) {
    return String(value == null ? "" : value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  }

  function extractEvidence(input) {
    const value = input && typeof input === "object" ? input : {};
    const text = normalize([
      value.machine, value.equipmentType, value.symptom,
      value.observations, ...(Array.isArray(value.evidence) ? value.evidence : [])
    ].filter(Boolean).join(" "));
    const seen = new Set();
    const observed = [];
    for (const feature of FEATURE_RULES) {
      if (seen.has(feature.id)) continue;
      if (feature.patterns.some(pattern => pattern.test(text))) {
        seen.add(feature.id);
        observed.push({ id: feature.id, label: feature.label });
      }
    }
    return observed;
  }

  function inferProfile(hypothesis, context) {
    const id = normalize(hypothesis && hypothesis.id);
    const label = normalize(hypothesis && hypothesis.label);
    const combined = id + " " + label;
    const equipment = normalize(context && (context.machine || context.equipmentType));
    const symptom = normalize(context && context.symptom);
    if ((id.includes("pump-supply") || id.includes("pump-suction") || /suction|aspiration|supply|source/.test(combined)) && (equipment.includes("pump") || /low.flow|flow/.test(symptom))) return "pumpSupply";
    if ((id.includes("pump-flow-path") || /flow.path|restriction|valve.position|obstruction|strainer/.test(combined)) && (equipment.includes("pump") || /low.flow|flow/.test(symptom))) return "pumpFlowPath";
    if ((id.includes("pump-operating") || /operating condition|demand/.test(combined)) && equipment.includes("pump")) return "pumpOperating";
    if (/command|permissive|interlock|start command/.test(combined)) return "motorCommand";
    if (/protection|drive trip|overload|trip/.test(combined)) return "motorTrip";
    if (/power circuit|mechanical load|motor blocked/.test(combined)) return "motorPowerMechanical";
    if (/bearing|alignment|rotating|vibration|mounting/.test(combined)) return "motorRotating";
    if (equipment.includes("compressor") && /demand|distribution|filter|network/.test(combined)) return "compressorDistribution";
    if (equipment.includes("compressor") && /cooling|load|overheat|temperature/.test(combined)) return "compressorCooling";
    return "generic";
  }

  function scoreHypothesis(hypothesis, prior = DEFAULT_PRIOR, observedFeatures = [], context = {}) {
    const basePrior = clamp(Number.isFinite(prior) ? prior : DEFAULT_PRIOR, 0.05, 0.5);
    const profileName = inferProfile(hypothesis, context);
    const profile = PROFILES[profileName] || PROFILES.generic;
    const evidence = Array.isArray(observedFeatures) ? observedFeatures : [];
    let logOdds = logit(basePrior);
    const evidenceUsed = [];
    for (const item of evidence) {
      const probabilities = profile[item.id];
      if (!probabilities) continue;
      const pGivenCause = clamp(probabilities[0], 0.01, 0.99);
      const pGivenOther = clamp(probabilities[1], 0.01, 0.99);
      logOdds += Math.log(pGivenCause / pGivenOther);
      evidenceUsed.push(item.id);
    }

    // For hypotheses without a domain-specific conditional table, use at most one
    // generic signal from the existing keyword matcher. Absence is unknown, not contrary.
    if (profileName === "generic" && evidenceUsed.length === 0) {
      const supporting = Array.isArray(hypothesis && hypothesis.evidenceFor) ? hypothesis.evidenceFor : [];
      const opposing = (Array.isArray(hypothesis && hypothesis.evidenceAgainst) ? hypothesis.evidenceAgainst : [])
        .filter(item => !/no distinctive|no specific matching|aucun indice distinctif|aucune observation distinctive|لا توجد ملاحظة مميزة|لا توجد كلمات داعمة/i.test(String(item)));
      if (supporting.length) {
        logOdds += Math.log(PROFILES.generic.keyword_support[0] / PROFILES.generic.keyword_support[1]);
        evidenceUsed.push("keyword_support");
      }
      if (opposing.length) {
        logOdds += Math.log(PROFILES.generic.explicit_contrary[0] / PROFILES.generic.explicit_contrary[1]);
        evidenceUsed.push("explicit_contrary");
      }
    }

    const posterior = logistic(logOdds);
    const relativeChange = posterior > basePrior * 1.2 ? "increased"
      : posterior < basePrior / 1.2 ? "decreased"
        : "unchanged";
    return {
      posterior,
      prior: basePrior,
      profile: profileName,
      evidenceUsed,
      supportShift: relativeChange,
      method: "naive_bayes_discrete_evidence_unvalidated"
    };
  }

  function enrich(input, result) {
    const base = result && typeof result === "object" ? result : {};
    const hypotheses = Array.isArray(base.hypotheses) ? base.hypotheses : [];
    const observed = extractEvidence(input);
    const language = ["ar", "fr", "en"].includes(input && input.language) ? input.language : "ar";
    const note = {
      ar: "ترتيب بايزي محلي أولي باستخدام الإشارات المذكورة صراحةً. معاملات الاحتمال غير معايرة ببيانات أعطال فعلية؛ لا تُعرض نسب رقمية ولا يُؤكَّد أي سبب.",
      fr: "Classement bayésien local préliminaire fondé sur les indices explicitement signalés. Les paramètres ne sont pas calibrés sur des historiques de pannes; aucun pourcentage n’est affiché et aucune cause n’est confirmée.",
      en: "Preliminary local Bayesian ranking uses explicitly reported signals. Likelihood parameters are not calibrated against real failure records; no percentages are shown and no cause is confirmed."
    }[language];

    if (!hypotheses.length) {
      const insufficientNote = {
        ar: "لا توجد فرضيات مرشحة كافية لتحديثها بايزيًا؛ أضف ملاحظات قابلة للتحقق أو صعّد للمختص.",
        fr: "Aucune hypothèse candidate suffisante pour une mise à jour bayésienne; ajoutez des observations vérifiables ou escaladez.",
        en: "No candidate hypotheses are available for a Bayesian update; add verifiable observations or escalate."
      }[language];
      return {
        ...base,
        hypotheses: [],
        reasoningModel: MODEL_VERSION,
        calibrationStatus: CALIBRATION_STATUS,
        reasoningNote: insufficientNote,
        bayesianEvidence: observed.map(item => item.label[language]),
        bayesianEvidenceIds: observed.map(item => item.id),
        bayesianEvidenceCount: observed.length
      };
    }

    const ranked = hypotheses.map((hypothesis, index) => {
      const scored = scoreHypothesis(hypothesis, Number.isFinite(hypothesis && hypothesis.prior) ? hypothesis.prior : DEFAULT_PRIOR, observed, input || {});
      return {
        ...hypothesis,
        bayesianRank: 0,
        bayesianSupportShift: scored.supportShift,
        bayesianEvidenceUsed: scored.evidenceUsed,
        bayesianMethod: scored.method,
        _posterior: scored.posterior,
        _originalIndex: index
      };
    }).sort((a, b) => b._posterior - a._posterior || a._originalIndex - b._originalIndex)
      .map((hypothesis, index) => {
        const { _posterior, _originalIndex, ...visible } = hypothesis;
        return { ...visible, bayesianRank: index + 1 };
      });

    return {
      ...base,
      hypotheses: ranked,
      reasoningModel: MODEL_VERSION,
      calibrationStatus: CALIBRATION_STATUS,
      reasoningNote: note,
      bayesianEvidence: observed.map(item => item.label[language]),
      bayesianEvidenceIds: observed.map(item => item.id),
      bayesianEvidenceCount: observed.length
    };
  }

  const api = Object.freeze({ scoreHypothesis, extractEvidence, enrich, MODEL_VERSION, CALIBRATION_STATUS });
  root.MaintenanceBayesianEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
