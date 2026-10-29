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

  function formatGuidedEvidence(guided, language) {
    if (!guided || !guided.diagnosticFlowId || !Array.isArray(guided.diagnosticHypotheses) || !guided.diagnosticHypotheses.length) return "";
    const labels = {
      ar: {title:"\n\nترتيب الفرضيات من الأدلة المسجلة:",support:"أدلة مؤيدة",against:"أدلة معارضة",none:"لا توجد أدلة تمييزية مسجلة.",checks:"فحوص آمنة للمراجعة",status:{supported_by_current_evidence:"تدعمها الأدلة الحالية",weakened_by_current_evidence:"تضعفها الأدلة الحالية",mixed_evidence:"أدلة مختلطة",unresolved:"غير محسومة"}},
      en: {title:"\n\nGuided hypotheses ranked against recorded evidence:",support:"Supporting evidence",against:"Contradicting evidence",none:"No discriminating evidence recorded.",checks:"Safe checks to review",status:{supported_by_current_evidence:"supported by current evidence",weakened_by_current_evidence:"weakened by current evidence",mixed_evidence:"mixed evidence",unresolved:"unresolved"}},
      fr: {title:"\n\nHypothèses guidées classées selon les éléments enregistrés :",support:"Éléments favorables",against:"Éléments contradictoires",none:"Aucun élément discriminant enregistré.",checks:"Contrôles sûrs à examiner",status:{supported_by_current_evidence:"étayée par les éléments actuels",weakened_by_current_evidence:"affaiblie par les éléments actuels",mixed_evidence:"éléments mixtes",unresolved:"non résolue"}}
    }[language] || null;
    const t = labels || {title:"",support:"",against:"",none:"",checks:"",status:{}};
    const lines = [t.title, language==="ar"?"هذه نتائج جلسة محلية مستقلة؛ لا تؤكد سبب العطل.":language==="fr"?"Cette analyse locale reste provisoire et ne confirme pas la cause.":"This separate local ranking is provisional and does not confirm the cause."];
    guided.diagnosticHypotheses.slice(0,3).forEach((h,i)=>{
      lines.push("",(i+1)+". "+(h.label||h.id)+" — "+(t.status[h.status]||h.status||"unresolved"));
      if(h.supportingEvidence&&h.supportingEvidence.length) lines.push("   "+t.support+": "+h.supportingEvidence.join(", "));
      if(h.contradictingEvidence&&h.contradictingEvidence.length) lines.push("   "+t.against+": "+h.contradictingEvidence.join(", "));
      if((!h.supportingEvidence||!h.supportingEvidence.length)&&(!h.contradictingEvidence||!h.contradictingEvidence.length)) lines.push("   "+t.none);
      if(Array.isArray(h.checks)&&h.checks.length) lines.push("   "+t.checks+": "+h.checks.join("; "));
    });
    lines.push("",language==="ar"?"الأدلة هنا إجابات المستخدم داخل مسار إرشادي، وليست مراجع مصنع موثقة.":language==="fr"?"Ces éléments sont des réponses utilisateur dans un parcours guidé, pas des références constructeur vérifiées.":"These are user answers in a guided flow, not verified manufacturer references.");
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
      const guided = root.MaintenanceDiagnosticSessionUI && typeof root.MaintenanceDiagnosticSessionUI.getPayload === 'function' ? root.MaintenanceDiagnosticSessionUI.getPayload() : {};
      const evidenceIds = Array.isArray(guided.diagnosticEvidence) ? guided.diagnosticEvidence : [];
      if (evidenceIds.length) notes.push((language === 'en' ? 'Guided diagnostic evidence IDs: ' : language === 'fr' ? 'Identifiants de preuves guidées : ' : 'معرّفات أدلة التشخيص الموجّه: ') + evidenceIds.join(', '));
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
      const baseOutput = formatResult(result, language);
      const guidedOutput = result && result.route !== "safety_review" && result.status !== "escalation_required" ? formatGuidedEvidence(guided, language) : "";
      output.textContent = baseOutput + guidedOutput;
    } catch (_) {
      output.textContent = formatResult(null, language);
    } finally {
      if (button) { button.disabled = false; button.textContent = language === "en" ? "Local diagnosis — no data sent" : language === "fr" ? "Diagnostic local — aucune donnée envoyée" : "تشخيص محلي دون إرسال البيانات"; }
    }
  }

  const OPENAI_WORKER_ENDPOINT = "https://maintenance-ai-toolkit-api.maintenance-ai-toolkit-api-seif.workers.dev/api/chat";

  async function runOpenAI() {
    const output = root.document && root.document.getElementById("aiResult");
    const button = root.document && root.document.getElementById("askOpenAI");
    const consent = root.document && root.document.getElementById("aiCloudConsent");
    const machine = root.document && root.document.getElementById("aiMachine");
    const symptom = root.document && root.document.getElementById("aiSymptom");
    const code = root.document && root.document.getElementById("aiCode");
    const observations = root.document && root.document.getElementById("aiObservations");
    const measurement = root.document && root.document.getElementById("aiMeasurementStatus");
    const language = root.MaintenanceI18n && typeof root.MaintenanceI18n.getLanguage === "function"
      ? root.MaintenanceI18n.getLanguage()
      : (root.document && root.document.documentElement.lang) || "ar";
    if (!output || !machine || !symptom || !consent) return;
    output.hidden = false;
    if (!machine.value.trim() || !symptom.value.trim()) {
      output.textContent = language === "en" ? "Enter equipment and symptom first."
        : language === "fr" ? "Saisissez d’abord l’équipement et le symptôme."
        : "أدخل نوع المعدة والعَرَض أولًا.";
      return;
    }
    if (!consent.checked) {
      output.textContent = language === "en" ? "Consent is required before sending this case to OpenAI."
        : language === "fr" ? "Votre accord est requis avant l’envoi du cas à OpenAI."
        : "يجب الموافقة قبل إرسال بيانات الحالة إلى OpenAI.";
      return;
    }
    if (button) {
      button.disabled = true;
      button.textContent = language === "en" ? "Contacting OpenAI…"
        : language === "fr" ? "Connexion à OpenAI…"
        : "جارٍ الاتصال بـ OpenAI…";
    }
    try {
      const payload = {
        machine: machine.value.trim(),
        symptom: symptom.value.trim(),
        code: code ? code.value.trim() : "",
        observations: observations ? observations.value.trim() : "",
        measurementStatus: measurement ? measurement.value : "unknown",
        language: ["ar", "en", "fr"].includes(language) ? language : "ar"
      };
      const response = await root.fetch(OPENAI_WORKER_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      let data;
      try { data = await response.json(); }
      catch { throw new Error("invalid_server_response"); }
      if (!response.ok) {
        const status = Number.isInteger(data.provider_status) ? " (provider HTTP " + data.provider_status + ")" : "";
        const message = typeof data.error === "string" ? data.error : "The AI service request failed.";
        output.textContent = (language === "en" ? "OpenAI diagnosis failed: " : language === "fr" ? "Échec du diagnostic OpenAI : " : "فشل تشخيص OpenAI: ") + message + status;
        return;
      }
      if (typeof data.answer !== "string" || !data.answer.trim()) {
        output.textContent = language === "en" ? "The service returned no validated diagnosis."
          : language === "fr" ? "Le service n’a renvoyé aucun diagnostic validé."
          : "لم تُرجع الخدمة تشخيصًا صالحًا للتحقق.";
        return;
      }
      const lines = [
        language === "en" ? "OpenAI-assisted preliminary assessment — not a confirmed diagnosis."
          : language === "fr" ? "Évaluation préliminaire assistée par OpenAI — diagnostic non confirmé."
          : "تقييم أولي بمساعدة OpenAI — ليس تشخيصًا مؤكدًا.",
        "",
        data.answer
      ];
      if (Array.isArray(data.citations) && data.citations.length) {
        lines.push("", language === "en" ? "Retrieved source excerpts:" : language === "fr" ? "Extraits de sources retrouvés :" : "مقاطع المصادر المسترجعة:");
        data.citations.slice(0, 4).forEach(c => {
          if (!c || typeof c.source !== "string") return;
          lines.push("- " + c.source + (c.section ? " — " + c.section : "") +
            (Number.isInteger(c.startLine) && Number.isInteger(c.endLine) ? " (lines " + c.startLine + "-" + c.endLine + ")" : ""));
        });
      }
      if (data.provider && data.model) lines.push("", "Provider: " + data.provider + " | Model: " + data.model);
      output.textContent = lines.join("\n");
    } catch (_) {
      output.textContent = language === "en"
        ? "Could not reach the AI service. Check the connection and Worker deployment, or use local diagnosis."
        : language === "fr"
          ? "Service IA inaccessible. Vérifiez la connexion et le déploiement du Worker, ou utilisez le diagnostic local."
          : "تعذر الوصول إلى خدمة الذكاء الاصطناعي. تحقق من الاتصال ونشر الخادم، أو استخدم التشخيص المحلي.";
    } finally {
      consent.checked = false;
      if (button) {
        button.disabled = false;
        button.textContent = language === "en" ? "Diagnose with OpenAI"
          : language === "fr" ? "Diagnostiquer avec OpenAI"
          : "التشخيص باستخدام OpenAI";
      }
    }
  }

  function init() {
    const button = root.document && root.document.getElementById("runLocalAgent");
    if (button) button.addEventListener("click", runLocal);
    const cloudButton = root.document && root.document.getElementById("askOpenAI");
    if (cloudButton) cloudButton.addEventListener("click", runOpenAI);
  }

  const api = Object.freeze({ formatResult, formatGuidedEvidence, runLocal, runOpenAI, init });
  root.MaintenanceAgentUI = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root.document) init();
})(typeof globalThis !== "undefined" ? globalThis : this);
