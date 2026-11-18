export function normalizeEvidenceText(value) {
  return globalThis.MaintenanceNormalization
    ? globalThis.MaintenanceNormalization.normalizeText(value)
    : String(value || "").toLocaleLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ـ]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}
export function detectSafetyGate({ machine, symptom, code, observations }) {
  const text = normalizeEvidenceText([machine, symptom, code, observations].filter(Boolean).join(" "));
  const unsafeActions = [
    "bypass", "disable", "defeat", "override", "bridge", "jumper", "short circuit",
    "contourner", "shunter", "desactiver", "neutraliser", "court circuiter", "supprimer",
    "تجاوز", "تعطيل", "الغاء", "تجسير", "قصر", "فصل"
  ];
  const protectiveDevices = [
    "interlock", "interlocks", "safety interlock", "guard", "emergency stop", "e stop",
    "protective device", "safety circuit", "overload protection", "interverrouillage",
    "arret urgence", "securite", "حمايه", "الحمايه", "انترلوك", "الانترلوك",
    "مفتاح الامان", "زر الطوارئ", "قاطع الحمايه"
  ];
  const explicitlyNegated = [
    "do not bypass", "dont bypass", "never bypass", "must not bypass", "should not bypass",
    "ne pas contourner", "ne jamais contourner", "لا تتجاوز", "عدم تجاوز", "يمنع تجاوز",
    "لا تعطل", "عدم تعطيل"
  ].some(phrase => text.includes(normalizeEvidenceText(phrase)));
  const asksToBypassProtection = !explicitlyNegated &&
    unsafeActions.some(action => text.includes(normalizeEvidenceText(action))) &&
    protectiveDevices.some(device => text.includes(normalizeEvidenceText(device)));

  const leakTerms = ["leak", "leaking", "fuite", "fuir", "تسرب", "تهريب", "رشح", "نفث"];
  const highPressureTerms = ["high pressure", "haute pression", "pression elevee", "ضغط عالي", "ضغط مرتفع", "ضغط عال"];
  const hydraulicTerms = ["hydraulic", "hydraulics", "hydraulique", "هيدروليك", "هيدروليكي"];
  const hasLeak = leakTerms.some(term => text.includes(normalizeEvidenceText(term)));
  const highPressureLeak = hasLeak && (
    highPressureTerms.some(term => text.includes(normalizeEvidenceText(term))) ||
    hydraulicTerms.some(term => text.includes(normalizeEvidenceText(term)))
  );

  if (asksToBypassProtection) return "protection_bypass";
  if (highPressureLeak) return "high_pressure_leak";
  return null;
}

export function buildSafetyGateDiagnosis({ trigger, machine, symptom, language }) {
  const copy = {
    ar: {
      bypassWarning: "لا تتجاوز أو تعطّل الإنترلوك أو الحواجز أو أي جهاز حماية.",
      bypassStop: "أوقف العمل إذا كان ذلك آمنًا، ولا تعِد التشغيل أو تختبر المعدة مع حماية معطلة.",
      bypassReason: "طلب تجاوز نظام حماية؛ لا يمكن تقديم خطوات لتجاوزه. يلزم فحص معتمد وفق إجراء الموقع.",
      leakWarning: "ابتعد عن منطقة التسرب؛ لا تستخدم اليد للبحث عنه ولا تلمس نفث السائل.",
      leakStop: "لا تفك الوصلات ولا تفتح نظامًا مضغوطًا ولا تعِد التشغيل؛ اعزل الطاقة والضغط وفق إجراء الموقع وصعّد فورًا.",
      leakReason: "تسرب هيدروليكي أو عالي الضغط محتمل؛ خطر الحقن تحت الجلد لا يمكن استبعاده عن بُعد.",
      danger: "خطر سلامة يتطلب إيقاف العمل والتصعيد."
    },
    fr: {
      bypassWarning: "Ne contournez ni ne désactivez un interverrouillage, un protecteur ou un dispositif de sécurité.",
      bypassStop: "Arrêtez le travail si cela peut être fait en sécurité; ne redémarrez pas avec une protection neutralisée.",
      bypassReason: "La demande vise à contourner une protection. Aucune procédure de contournement ne sera fournie; faites contrôler le système selon la procédure du site.",
      leakWarning: "Éloignez-vous de la fuite; ne cherchez jamais une fuite hydraulique avec la main et ne touchez pas le jet.",
      leakStop: "Ne desserrez aucun raccord, n’ouvrez pas le circuit sous pression et ne redémarrez pas. Isolez selon la procédure du site et escaladez immédiatement.",
      leakReason: "Une fuite hydraulique ou haute pression est possible; un risque d’injection sous-cutanée ne peut pas être exclu à distance.",
      danger: "Risque de sécurité nécessitant l’arrêt du travail et une escalade."
    },
    en: {
      bypassWarning: "Do not bypass or disable an interlock, guard, or any protective device.",
      bypassStop: "Stop work if safe to do so; do not restart or test equipment with protection disabled.",
      bypassReason: "The request concerns bypassing a protective system. No bypass procedure will be provided; have the system assessed under the site procedure.",
      leakWarning: "Move away from the leak; never use a hand to search for a leak or touch a fluid jet.",
      leakStop: "Do not loosen fittings, open a pressurized system, or restart. Isolate energy and pressure under site procedures and escalate immediately.",
      leakReason: "A hydraulic or high-pressure leak may be present; an injection injury hazard cannot be ruled out remotely.",
      danger: "Safety hazard requiring work stoppage and escalation."
    }
  }[language] || null;
  const text = copy || {
    bypassWarning: "لا تتجاوز أو تعطّل أي جهاز حماية.",
    bypassStop: "أوقف العمل واتبع إجراء الموقع.",
    bypassReason: "طلب متعلق بتجاوز الحماية ويتطلب التصعيد.",
    leakWarning: "ابتعد عن التسرب ولا تلمس السائل.",
    leakStop: "لا تفتح نظامًا مضغوطًا؛ اعزل وصعّد وفق إجراء الموقع.",
    leakReason: "خطر تسرب عالي الضغط يتطلب التصعيد.",
    danger: "خطر سلامة يتطلب إيقاف العمل والتصعيد."
  };
  const leak = trigger === "high_pressure_leak";
  const warning = leak ? text.leakWarning : text.bypassWarning;
  const stop = leak ? text.leakStop : text.bypassStop;
  const reason = leak ? text.leakReason : text.bypassReason;
  const diagnosis = {
    status: "escalation_required",
    language,
    safety: { gate_required: true, loto_required_before_intervention: true, warnings: [warning], stop_conditions: [stop] },
    clarifying_questions: [],
    possible_causes: [],
    inspection_steps: [],
    required_tools: [],
    danger_signs: [text.danger],
    escalation: { required: true, reason },
    sources: [],
    unknowns: [],
    session_summary: { equipment: machine, symptom, confirmed_cause: "", work_status: "escalated" }
  };
  return diagnosis;
}
