/* Local UI adapter for MaintenanceAIAgentCore.
 * Never invokes a network/provider adapter. User input stays in the browser.
 */
(function (root) {
  "use strict";

  function localized(value, language) {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      return value[language] || value.ar || value.en || value.fr || "";
    }
    return "";
  }

  function formatResult(result, language) {
    const lang = ["ar", "en", "fr"].includes(language) ? language : "ar";
    const labels = {
      ar: {
        heading: "تقييم محلي أولي — لم تُرسل بيانات إلى خادم خارجي.",
        safety: "توقّف وصعّد الحالة. اتبع إجراء العزل والقفل ووضع بطاقة التحذير (LOTO) وإجراءات الموقع.",
        clarify: "يلزم استكمال المعلومات التالية:",
        noMatch: "لم يجد المحرك تطابقًا كافيًا. أضف معلومات موثوقة أو راجع دليل المصنع.",
        possible: "احتمال للفحص",
        checks: "فحوصات مقترحة",
        escalation: "التصعيد",
        error: "تعذّر إجراء التقييم المحلي. استخدم محرك التشخيص المعتاد وتحقق من ملفات التطبيق."
      },
      en: {
        heading: "Preliminary local assessment — no data was sent to an external server.",
        safety: "Stop and escalate. Follow site isolation, lockout/tagout (LOTO), and safety procedures.",
        clarify: "More information is required:",
        noMatch: "The engine found no sufficient match. Add verified observations or consult the manufacturer manual.",
        possible: "Possible item to check",
        checks: "Suggested checks",
        escalation: "Escalation",
        error: "Local assessment failed. Use the existing diagnostic engine and verify the app assets."
      },
      fr: {
        heading: "Évaluation locale préliminaire — aucune donnée n’a été envoyée à un serveur externe.",
        safety: "Arrêtez et faites remonter le cas. Respectez l’isolement, la consignation (LOTO) et les procédures du site.",
        clarify: "Informations complémentaires requises :",
        noMatch: "Aucune correspondance suffisante. Ajoutez des observations vérifiées ou consultez le manuel du fabricant.",
        possible: "Élément possible à vérifier",
        checks: "Contrôles proposés",
        escalation: "Escalade",
        error: "Échec de l’évaluation locale. Utilisez le moteur de diagnostic existant et vérifiez les fichiers de l’application."
      }
    }[lang];
    if (!result || result.ok !== true) {
      return labels.error + (result && Array.isArray(result.errors) ? "\n" + result.errors.map(x => x.code).join(", ") : "");
    }
    if (result.route === "safety_review" || result.status === "escalation_required") {
      const next = result.data && result.data.nextAction;
      return labels.heading + "\n\n" + labels.safety + (next ? "\n" + next : "");
    }
    if (result.status === "needs_clarification") {
      const missing = result.data && result.data.questionsNeeded;
      return labels.heading + "\n\n" + labels.clarify + "\n" + (Array.isArray(missing) && missing.length ? missing.join("\n") : "equipment and symptom");
    }
    if (result.route !== "local_diagnostic" || result.status !== "preliminary_assessment") {
      return labels.error;
    }
    const diagnosis = result.data && result.data.diagnosis;
    const lines = [labels.heading];
    if (!diagnosis || diagnosis.matched !== true || !Array.isArray(diagnosis.results) || diagnosis.results.length === 0) {
      lines.push("", localized(diagnosis && diagnosis.message, lang) || labels.noMatch);
      if (diagnosis && diagnosis.reason) lines.push(localized(diagnosis.reason, lang));
      return lines.filter(Boolean).join("\n");
    }
    diagnosis.results.slice(0, 3).forEach((item, index) => {
      lines.push("", (index + 1) + ". " + localized(item.title, lang));
      if (item.confidenceLabel) lines.push("   " + localized(item.confidenceLabel, lang));
      if (item.rankingReason) lines.push("   " + localized(item.rankingReason, lang));
      if (Array.isArray(item.causes) && item.causes.length) {
        lines.push("   " + labels.possible + ":");
        item.causes.slice(0, 4).forEach(cause => lines.push("   - " + localized(cause.label, lang) + (cause.reason ? " — " + localized(cause.reason, lang) : "")));
      }
      if (Array.isArray(item.safeChecks) && item.safeChecks.length) {
        lines.push("   " + labels.checks + ":");
        item.safeChecks.slice(0, 5).forEach(check => lines.push("   - " + localized(check, lang)));
      }
      if (item.escalation) lines.push("   " + labels.escalation + ": " + localized(item.escalation, lang));
    });
    lines.push("", labels.noMatch.indexOf("no sufficient") >= 0 ? "A match score is not a probability. The cause is not confirmed." :
      lang === "fr" ? "Un score de correspondance n’est pas une probabilité. La cause n’est pas confirmée." :
      "نقاط المطابقة ليست احتمالًا إحصائيًا، وسبب العطل غير مؤكد.");
    return lines.join("\n");
  }

  async function runLocal() {
    const output = root.document && root.document.getElementById("aiResult");
    const button = root.document && root.document.getElementById("runLocalAgent");
    const machine = root.document && root.document.getElementById("aiMachine");
    const symptom = root.document && root.document.getElementById("aiSymptom");
    const code = root.document && root.document.getElementById("aiCode");
    const observations = root.document && root.document.getElementById("aiObservations");
    const language = root.MaintenanceI18n && typeof root.MaintenanceI18n.getLanguage === "function"
      ? root.MaintenanceI18n.getLanguage()
      : (root.document && root.document.documentElement.lang) || "ar";

    if (!output || !machine || !symptom) return;
    output.hidden = false;
    if (!machine.value.trim() || !symptom.value.trim()) {
      output.textContent = language === "en" ? "Enter equipment and symptom first." :
        language === "fr" ? "Saisissez d’abord l’équipement et le symptôme." :
        "أدخل نوع المعدة والعَرَض أولًا.";
      return;
    }
    if (!root.MaintenanceAIAgentCore || !root.MaintenanceEngineeringCore || !root.MaintenanceDiagnosticEngine) {
      output.textContent = formatResult(null, language);
      return;
    }
    if (button) { button.disabled = true; button.textContent = language === "en" ? "Checking locally…" : language === "fr" ? "Analyse locale…" : "جارٍ التحليل محليًا…"; }
    try {
      // Load the bundled, same-origin fault library on demand. The service worker caches
      // faults.json for offline use; no maintenance form data is sent with this GET.
      let faultLibrary = root.MAINTENANCE_FAULTS;
      if (!faultLibrary || !Array.isArray(faultLibrary.faults)) {
        if (typeof root.fetch !== "function") throw new Error("local_fault_library_unavailable");
        const response = await root.fetch("./faults.json", { method: "GET", credentials: "same-origin" });
        if (!response || !response.ok) throw new Error("local_fault_library_unavailable");
        faultLibrary = await response.json();
      }
      if (!faultLibrary || !Array.isArray(faultLibrary.faults)) throw new Error("invalid_local_fault_library");

      const notes = [];
      if (code && code.value.trim()) notes.push((language === "en" ? "Recorded alarm code: " : language === "fr" ? "Code d’alarme enregistré : " : "رمز الإنذار المسجل: ") + code.value.trim());
      if (observations && observations.value.trim()) notes.push(observations.value.trim());
      const agent = root.MaintenanceAIAgentCore.createAgentCore({
        engineeringCore: root.MaintenanceEngineeringCore,
        diagnosticEngine: root.MaintenanceDiagnosticEngine,
        faultLibrary,
        tools: {}
      });
      const result = await agent.run({
        intent: "diagnose",
        language,
        equipment: { type: machine.value.trim() },
        symptom: symptom.value.trim(),
        observations: notes,
        consent: { sendToAI: false }
      });
      output.textContent = formatResult(result, language);
    } catch (_) {
      output.textContent = formatResult(null, language);
    } finally {
      if (button) { button.disabled = false; button.textContent = language === "en" ? "Local diagnosis — no data sent" : language === "fr" ? "Diagnostic local — aucune donnée envoyée" : "تشخيص محلي دون إرسال البيانات"; }
    }
  }

  function init() {
    const button = root.document && root.document.getElementById("runLocalAgent");
    if (button) button.addEventListener("click", runLocal);
  }

  const api = Object.freeze({ formatResult, runLocal, init });
  root.MaintenanceAgentUI = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root.document) init();
})(typeof globalThis !== "undefined" ? globalThis : this);
