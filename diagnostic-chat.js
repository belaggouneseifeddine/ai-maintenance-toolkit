(function (root) {
  "use strict";
  const $ = id => root.document && root.document.getElementById(id);
  let messages = [];
  let notes = [];
  let initialized = false;
  let started = false;
  let pendingEquipment = "";
  let pendingSymptom = "";
  let equipmentContext = "";
  let retrievalSequence = 0;
  let lastEvidenceQuery = "";
  let retrievedExcerpts = [];
  let retrievedContext = null;
  let localAssistant = null;
  let assistantFactCounter = 0;

  const LOCAL_SESSION_STORAGE_KEY = "maintenance-assistant-session-v1";

  function persistLocalAssistantSession() {
    if (!localAssistant || typeof localAssistant.getSession !== "function" || !root.localStorage) return false;
    try {
      const snapshot = {
        schema: "maintenance-assistant-local-session",
        version: 1,
        savedAt: new Date().toISOString(),
        session: localAssistant.getSession(),
        chat: {
          messages: messages.slice(-100),
          notes: notes.slice(-30),
          started,
          pendingEquipment,
          pendingSymptom,
          equipmentContext
        },
        guidedDiagnostic: root.MaintenanceDiagnosticSessionUI &&
          typeof root.MaintenanceDiagnosticSessionUI.getPayload === "function"
          ? root.MaintenanceDiagnosticSessionUI.getPayload() : {}
      };
      const serialized = JSON.stringify(snapshot);
      if (serialized.length > 240000) return false;
      root.localStorage.setItem(LOCAL_SESSION_STORAGE_KEY, serialized);
      return true;
    } catch (_) {
      return false;
    }
  }

  function restoreLocalAssistantSession() {
    if (!root.localStorage) return false;
    let snapshot;
    try {
      const raw = root.localStorage.getItem(LOCAL_SESSION_STORAGE_KEY);
      if (!raw || raw.length > 240000) return false;
      snapshot = JSON.parse(raw);
    } catch (_) {
      return false;
    }
    if (!snapshot || snapshot.schema !== "maintenance-assistant-local-session" ||
        snapshot.version !== 1 || !snapshot.session || !snapshot.chat) return false;
    const Session = root.MaintenanceAssistantSession;
    if (!Session || typeof Session.validateSession !== "function") return false;
    let restoredSession;
    try {
      restoredSession = typeof Session.migrateSession === "function"
        ? Session.migrateSession(snapshot.session)
        : snapshot.session;
    } catch (_) {
      return false;
    }
    if (!Session.validateSession(restoredSession).ok) return false;
    const chat = snapshot.chat;
    pendingEquipment = typeof chat.pendingEquipment === "string" ? chat.pendingEquipment.slice(0, 120) : "";
    pendingSymptom = typeof chat.pendingSymptom === "string" ? chat.pendingSymptom.slice(0, 120) : "";
    equipmentContext = typeof chat.equipmentContext === "string" ? chat.equipmentContext.slice(0, 160) : "";
    notes = Array.isArray(chat.notes) ? chat.notes.filter(item => typeof item === "string").slice(-30) : [];
    const equipment = restoredSession.equipment || {};
    setField("aiMachine", equipmentContext || equipment.type || "");
    setField("aiManufacturer", equipment.manufacturer || "");
    setField("aiModel", equipment.model || "");
    setField("aiSymptom", pendingSymptom || "");
    startLocalAssistantSession(restoredSession);
    if (!localAssistant) return false;
    messages = restoredSession.messages
      .filter(item => item && (item.role === "user" || item.role === "assistant"))
      .slice(-100)
      .map(item => ({ role: item.role, text: item.content, time: item.createdAt || "" }));
    let guidedRestored = false;
    if (snapshot.guidedDiagnostic && snapshot.guidedDiagnostic.diagnosticFlowId &&
        root.MaintenanceDiagnosticSessionUI && typeof root.MaintenanceDiagnosticSessionUI.restore === "function") {
      const result = root.MaintenanceDiagnosticSessionUI.restore(snapshot.guidedDiagnostic);
      guidedRestored = !!(result && result.ok);
    }
    started = !!(chat.started && guidedRestored);
    renderMessages();
    renderReplies();
    renderEvidenceButton();
    persistLocalAssistantSession();
    return messages.length > 0;
  }

  function startLocalAssistantSession(existingSession) {
    const api = root.MaintenanceLocalAssistantOrchestrator;
    if (!api || typeof api.createLocalOrchestrator !== "function") {
      localAssistant = null;
      return;
    }
    try {
      const toolApi = root.MaintenanceLocalAssistantTools;
      const localTools = toolApi && typeof toolApi.createLocalTools === "function"
        ? toolApi.createLocalTools({
            getGuidedContext: () => root.MaintenanceDiagnosticSessionUI &&
              typeof root.MaintenanceDiagnosticSessionUI.getPayload === "function"
              ? root.MaintenanceDiagnosticSessionUI.getPayload() : null
          })
        : { tools: {}, safetyGate: null };
      localAssistant = api.createLocalOrchestrator({
        tools: localTools.tools,
        safetyGate: localTools.safetyGate
      });
      if (existingSession && typeof localAssistant.restore === "function") {
        localAssistant.restore(existingSession);
      } else {
        localAssistant.start({
          sessionId: "chat-" + Date.now().toString(36),
          language: language(),
          equipment: {
            type: String($("aiMachine")?.value || "").trim(),
            manufacturer: String($("aiManufacturer")?.value || "").trim(),
            model: String($("aiModel")?.value || "").trim()
          }
        });
      }
      assistantFactCounter = localAssistant.getSession().messages.length;
    } catch (_) {
      localAssistant = null;
    }
  }

  function syncLocalAssistantMessage(role, content) {
    if (!localAssistant || !content) return;
    const messageId = "chat-msg-" + Date.now().toString(36) + "-" + (++assistantFactCounter).toString(36);
    try {
      localAssistant.addMessage(role, content, messageId);
      if (role === "user") {
        localAssistant.addFact({
          factId: "user-note-" + assistantFactCounter.toString(36),
          value: String(content).slice(0, 4000),
          provenance: "user_reported",
          status: "accepted",
          sourceRef: { type: "conversation_message", messageId }
        });
      }
      persistLocalAssistantSession();
    } catch (_) {
      // The visible conversation remains usable if local history recording fails.
    }
  }

  function clearRetrievedExcerpts() {
    retrievedExcerpts = [];
    retrievedContext = null;
  }

  function getApprovedExcerpts() {
    if (!retrievedContext) return [];
    const current = {
      machine: String($("aiMachine")?.value || "").trim(),
      model: String($("aiModel")?.value || "").trim(),
      symptom: String($("aiSymptom")?.value || "").trim(),
      code: String($("aiCode")?.value || "").trim(),
      observations: String($("aiObservations")?.value || "").trim(),
      technicianInput: getTechnicianChatInput()
    };
    if (current.machine !== retrievedContext.machine ||
        current.model !== retrievedContext.model ||
        current.symptom !== retrievedContext.symptom ||
        current.code !== retrievedContext.code ||
        current.observations !== retrievedContext.observations ||
        current.technicianInput !== retrievedContext.technicianInput) return [];
    return retrievedExcerpts.map(item => ({ ...item }));
  }

  const EQUIPMENT = [
    { id: "pump", label: "مضخة", pattern: /\b(?:pump|pumps)\b|مضخ|pompe/i },
    { id: "motor", label: "محرك كهربائي", pattern: /\b(?:motor|motors)\b|محرك|moteur/i },
    { id: "compressor", label: "ضاغط", pattern: /\bcompressor\b|ضاغط|compresseur/i },
    { id: "vfd", label: "مغير سرعة VFD", pattern: /\bvfd\b|variator|variateur|مغير السرعة|مغيّر السرعة/i },
    { id: "bearing", label: "محمل", pattern: /\bbearing\b|محمل|رولمان|roulement/i },
    { id: "valve", label: "صمام", pattern: /\bvalve\b|صمام|vanne/i },
    { id: "gearbox", label: "علبة تروس", pattern: /\bgearbox\b|علبة التروس|réducteur/i }
  ];
  const SYMPTOMS = [
    { id: "low_flow", label: "تدفق ضعيف", pattern: /low\s*flow|weak\s*flow|no\s*flow|تدفق\s*(?:ضعيف|منخفض)|لا\s*(?:يوجد|يوجد أي)\s*تدفق|débit\s*(?:faible|bas|nul)/i, canonical: "low flow" },
    { id: "low_pressure", label: "ضغط منخفض", pattern: /low\s*(?:suction\s*|discharge\s*|outlet\s*)?pressure|(?:suction|discharge|outlet)\s*pressure\s*(?:is\s*)?(?:low|below)|ضغط\s*(?:(?:السحب|الطرد|الخروج)\s*)?(?:منخفض|ضعيف)|pression\s*(?:(?:d. aspiration|de refoulement|de sortie)\s*)?(?:basse|faible)/i, canonical: "low pressure" },
    { id: "not_start", label: "لا تبدأ", pattern: /not\s*start|won.?t\s*start|doesn.?t\s*start|لا\s*(?:تعمل|يعمل|تبدأ|يبدأ)|ne\s*démarre\s*pas/i, canonical: "not start" },
    { id: "trip", label: "فصل أو إنذار", pattern: /\btrip\b|overload|فصل|إنذار|déclenchement|défaut/i, canonical: "trip" },
    { id: "overheat", label: "ارتفاع الحرارة", pattern: /overheat|high\s*temperature|ارتفاع\s*الحرارة|حرارة\s*مرتفعة|surchauffe/i, canonical: "overheat" },
    { id: "vibration", label: "اهتزاز", pattern: /vibration|اهتزاز|vibrations/i, canonical: "vibration" },
    { id: "leak", label: "تسرب", pattern: /leak|leakage|تسرب|fuite/i, canonical: "leak" }
  ];

  function language() {
    const value = root.MaintenanceI18n && root.MaintenanceI18n.getLanguage ? root.MaintenanceI18n.getLanguage() : "ar";
    return ["ar", "en", "fr"].includes(value) ? value : "ar";
  }
  function copy(ar, en, fr) { const l = language(); return l === "en" ? en : l === "fr" ? fr : ar; }
  function addMessage(role, text) {
    const content = String(text || "");
    messages.push({ role, text: content, time: new Date().toISOString() });
    syncLocalAssistantMessage(role, content);
    renderMessages();
  }
  function renderMessages() {
    const log = $("diagnosticChatMessages");
    if (!log) return;
    log.replaceChildren();
    messages.forEach(message => {
      const bubble = root.document.createElement("article");
      bubble.className = "diagnostic-chat-message " + (message.role === "user" ? "is-user" : "is-assistant");
      bubble.setAttribute("dir", "auto");
      const label = root.document.createElement("strong");
      label.textContent = message.role === "user" ? copy("الفني", "Technician", "Technicien") : "Maintenance AI";
      const body = root.document.createElement("p");
      body.textContent = message.text;
      bubble.append(label, body);
      log.appendChild(bubble);
    });
    log.scrollTop = log.scrollHeight;
  }
  function appendStyles() {
    if ($("diagnosticChatStyles")) return;
    const style = root.document.createElement("style");
    style.id = "diagnosticChatStyles";
    style.textContent = `
      #dynamicSessionPanel { display:none !important; }
      #diagnosticChat { margin: 14px 0; border: 1px solid var(--line, #d5e0e4); border-radius: 16px; padding: 14px; background: var(--card, #fff); }
      #diagnosticChatMessages { display:flex; flex-direction:column; gap:10px; max-height:420px; overflow:auto; padding:4px 2px 12px; }
      .diagnostic-chat-message { max-width:92%; padding:10px 12px; border-radius:14px; border:1px solid var(--line, #d5e0e4); background:var(--surface, #f7fafb); overflow-wrap:anywhere; }
      .diagnostic-chat-message p { margin:5px 0 0; white-space:pre-wrap; }
      .diagnostic-chat-message.is-user { align-self:flex-end; background:var(--accent-soft, #e8f5f7); }
      .diagnostic-chat-message.is-assistant { align-self:flex-start; }
      #diagnosticChatReplies { display:flex; flex-wrap:wrap; gap:8px; margin:10px 0; }
      #diagnosticChatReplies button { border:1px solid var(--line, #cbd5e1); border-radius:999px; padding:8px 12px; background:transparent; color:inherit; font:inherit; cursor:pointer; }
      #diagnosticChatForm { display:flex; gap:8px; align-items:flex-end; }
      #diagnosticChatInput { flex:1; min-width:0; min-height:48px; resize:vertical; }
      #diagnosticChatEvidence { margin-top:10px; }
      #diagnosticChatEvidence article { border-top:1px solid var(--line, #d5e0e4); padding:8px 0; }
      @media(max-width:520px){ #diagnosticChatForm { flex-direction:column; align-items:stretch; } #diagnosticChatSend { width:100%; } }
    `;
    root.document.head.appendChild(style);
  }
  function detectEquipment(text) { return EQUIPMENT.find(item => item.pattern.test(text)) || null; }
  function detectSymptom(text) { return SYMPTOMS.find(item => item.pattern.test(text)) || null; }
  function extractModelDesignation(text) {
    const match = String(text || "").match(/(?:\bmodel\b|موديل|الموديل|طراز|modèle)\s*[:：]\s*([^,،;؛\n]{2,80})/i);
    return match ? match[1].trim() : "";
  }
  function classifyInput(text) {
    const equipment = detectEquipment(text);
    const symptom = detectSymptom(text);
    return { equipment: equipment ? equipment.id : "", symptom: symptom ? symptom.id : "", equipmentContext: resolveEquipmentContext(text, equipment) };
  }
  function resolveEquipmentContext(text, equipment) {
    const value = String(text || "");
    if (equipment && equipment.id === "pump") {
      if (/centrifugal|centrifuge|طرد\s*مركزي/i.test(value)) return "centrifugal pump";
      if (/gear\s*pump|engrenages|تروس|مسنن/i.test(value)) return "gear pump";
      if (/screw\s*pump|pompe\s*à\s*vis|لولبي/i.test(value)) return "screw pump";
    }
    return equipment ? equipment.id : "";
  }
  function setField(id, value) {
    const field = $(id);
    if (!field) return;
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function syncLocalAssistantEquipmentContext() {
    if (!localAssistant || typeof localAssistant.updateEquipment !== "function") return;
    const values = {
      type: equipmentContext || pendingEquipment || String($("aiMachine")?.value || "").trim(),
      manufacturer: String($("aiManufacturer")?.value || "").trim(),
      model: String($("aiModel")?.value || "").trim()
    };
    Object.keys(values).forEach(key => { if (!values[key]) delete values[key]; });
    if (!Object.keys(values).length) return;
    try {
      localAssistant.updateEquipment(values);
      persistLocalAssistantSession();
    } catch (_) {
      // Equipment context is advisory; do not interrupt the visible chat.
    }
  }

  function currentSession() {
    return root.MaintenanceDiagnosticSessionUI && root.MaintenanceDiagnosticSessionUI.getSession
      ? root.MaintenanceDiagnosticSessionUI.getSession() : null;
  }
  function renderReplies() {
    const holder = $("diagnosticChatReplies");
    if (!holder) return;
    holder.replaceChildren();
    const session = currentSession();
    if (!session || !session.nextQuestion || !Array.isArray(session.nextQuestion.options)) return;
    session.nextQuestion.options.forEach(option => {
      const button = root.document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", () => submitKnownAnswer(option.id, option.label));
      holder.appendChild(button);
    });
  }
  function renderHypothesisSummary(session) {
    if (!session || !Array.isArray(session.hypotheses) || !session.hypotheses.length) return "";
    const names = session.hypotheses.slice(0, 3).map((item, index) => {
      const lines = [(index + 1) + ". " + item.label];
      if (item.status) lines.push(copy("الحالة الاستدلالية: ", "Evidence status: ", "Statut des éléments : ") + item.status);
      if (Array.isArray(item.supportingEvidenceLabels) && item.supportingEvidenceLabels.length) {
        lines.push(copy("ما يدعمها: ", "Supporting evidence: ", "Éléments favorables : ") + item.supportingEvidenceLabels.slice(0, 2).join("، "));
      }
      if (Array.isArray(item.contradictingEvidenceLabels) && item.contradictingEvidenceLabels.length) {
        lines.push(copy("ما يضعفها: ", "Contradicting evidence: ", "Éléments défavorables : ") + item.contradictingEvidenceLabels.slice(0, 2).join("، "));
      }
      if (Array.isArray(item.sourceRefs) && item.sourceRefs.length) {
        lines.push(copy("مراجع المعرفة: ", "Knowledge references: ", "Références de connaissance : ") + item.sourceRefs.slice(0, 2).join(", "));
      }
      if (Array.isArray(item.checks) && item.checks.length) lines.push(copy("الخطوة الآمنة التالية: ", "Next safe check: ", "Prochaine vérification sûre : ") + item.checks[0]);
      return lines.join("\n");
    }).join("\n\n");
    return copy("الفرضيات الحالية (ترتيب استدلالي أولي، وليس احتمالات معايرة):\n", "Current hypotheses (provisional heuristic ranking, not calibrated probabilities):\n", "Hypothèses actuelles (classement heuristique provisoire, pas des probabilités calibrées) :\n") + names;
  }
  function beginIfReady(initialText) {
    const equipment = pendingEquipment || detectEquipment(initialText);
    const symptom = pendingSymptom || detectSymptom(initialText);
    if (equipment) {
      pendingEquipment = equipment.id;
      equipmentContext = resolveEquipmentContext(initialText, equipment);
      setField("aiMachine", equipmentContext || equipment.id);
    }
    if (symptom) {
      pendingSymptom = symptom.id;
      setField("aiSymptom", symptom.canonical);
    }
    if (!pendingEquipment) {
      addMessage("assistant", copy("ما نوع المعدة؟ يمكنك كتابة مثلًا: مضخة، محرك كهربائي، ضاغط أو VFD.", "What equipment is involved? For example: pump, electric motor, compressor, or VFD.", "De quel équipement s’agit-il ? Par exemple : pompe, moteur électrique, compresseur ou variateur."));
      return false;
    }
    if (!pendingSymptom) {
      addMessage("assistant", copy("ما العرض الرئيسي؟ صف ما يحدث، مثل: تدفق ضعيف، لا تبدأ، فصل أو اهتزاز.", "What is the main symptom? For example: low flow, failure to start, trip, or vibration.", "Quel est le symptôme principal ? Par exemple : faible débit, non-démarrage, déclenchement ou vibration."));
      return false;
    }
    syncLocalAssistantEquipmentContext();
    started = true;
    const session = currentSession();
    if (!session) {
      addMessage("assistant", copy("لا يوجد مسار موجّه مراجع لهذه المجموعة. سأستخدم محرك التشخيص المحلي العام لعرض احتمالات أولية، دون اختراع شجرة أسئلة.", "No reviewed guided flow matches this equipment/symptom pair. I will use the general local diagnostic engine to show preliminary possibilities without inventing a question tree.", "Aucun parcours guidé révisé ne correspond. J’utiliserai le moteur local général pour présenter des possibilités préliminaires sans inventer d’arbre de questions."));
      runLocalDiagnosticAssessment();
      return false;
    }
    addMessage("assistant", session.nextQuestion ? session.nextQuestion.text : session.summary?.message || copy("بدأت جلسة التشخيص المحلية.", "The local diagnostic session has started.", "La session de diagnostic locale a commencé."));
    const summary = renderHypothesisSummary(session);
    if (summary) addMessage("assistant", summary);
    renderReplies();
    renderEvidenceButton();
    return true;
  }
  function formatLocalDiagnosis(result) {
    const diagnosis = result && result.diagnosis;
    const lines = [copy("تقييم محلي أولي — هذه احتمالات وليست سببًا مؤكدًا.", "Preliminary local assessment — these are possibilities, not a confirmed cause.", "Évaluation locale préliminaire — possibilités, pas une cause confirmée.")];
    if (diagnosis && diagnosis.safetyWarning && diagnosis.safetyWarning.message) lines.push("", "⚠ " + diagnosis.safetyWarning.message);
    const evidence = diagnosis && diagnosis.measurementEvidence;
    if (evidence && Array.isArray(evidence.readings) && evidence.readings.length) {
      lines.push("", copy("القراءات المدخلة ومصدرها:", "Entered readings and their provenance:", "Mesures saisies et leur provenance :"));
      const sourceLabels = {
        direct_measurement: "قياس مباشر",
        plc_value: "قراءة PLC",
        historian_value: "قراءة Historian",
        estimated: "قيمة تقديرية",
        user_reported: "إبلاغ الفني",
        unknown: "مصدر غير محدد"
      };
      evidence.readings.slice(0, 12).forEach(item => {
        const value = item.value == null ? "غير متاح" : String(item.value);
        lines.push("   • " + item.name + ": " + value + (item.unit ? " " + item.unit : "") + " — " + (sourceLabels[item.sourceType] || sourceLabels.unknown));
      });
      const warningLabels = {
        measurement_missing: "قياس غير متاح",
        estimated_value_not_measured: "قيمة تقديرية وليست قياسًا فعليًا",
        control_system_value_not_independent_measurement: "قراءة PLC/Historian ليست قياسًا مستقلًا",
        sensor_status_warning: "حالة الحساس مشكوك فيها أو فاشلة",
        measurement_quality_warning: "جودة القراءة تحتاج مراجعة",
        conflicting_readings_same_context: "قراءات متعارضة لنفس ظروف التشغيل"
      };
      if (Array.isArray(evidence.warnings) && evidence.warnings.length) {
        lines.push(copy("تنبيهات جودة البيانات:", "Data-quality warnings:", "Alertes de qualité des données :"));
        evidence.warnings.slice(0, 8).forEach(item => lines.push("   ⚠ " + (warningLabels[item.code] || item.code)));
      }
    }
    if (diagnosis && Array.isArray(diagnosis.supportingDocuments) && diagnosis.supportingDocuments.length) {
      lines.push("", copy("مراجع PDF المعتمدة المرتبطة بالسياق:", "Approved PDF references relevant to this context:", "Références PDF approuvées pour ce contexte :"));
      diagnosis.supportingDocuments.forEach(item => {
        lines.push("   • " + (item.documentTitle || "PDF") + " — " + (item.citation || ""));
        if (item.text) lines.push("     " + item.text);
        if (item.reviewStatus !== "approved" || item.evidenceRole !== "approved-page-claim") {
          lines.push("     ⚠ " + copy("هذه المعلومة غير مؤهلة للاستخدام التشخيصي.", "This information is not eligible for diagnostic use.", "Cette information n'est pas admissible comme preuve diagnostique."));
        }
      });
    }
    if (!diagnosis || diagnosis.matched !== true || !Array.isArray(diagnosis.results) || !diagnosis.results.length) {
      lines.push("", (diagnosis && diagnosis.message ? diagnosis.message + "\n" : "") +
        (diagnosis && diagnosis.reason ? diagnosis.reason : copy("لم تتوفر مطابقة كافية. أضف قياسات أو راجع الدليل المعتمد.", "No sufficient match. Add measurements or consult an approved manual.", "Correspondance insuffisante. Ajoutez des mesures ou consultez un manuel approuvé.")));
      return lines.join("\n");
    }
    diagnosis.results.slice(0, 3).forEach((item, index) => {
      lines.push("", (index + 1) + ". " + (item.title || item.id));
      if (item.confidenceLabel) lines.push("   " + item.confidenceLabel);
      if (item.rankingReason) lines.push("   " + item.rankingReason);
      (Array.isArray(item.causes) ? item.causes : []).slice(0, 3).forEach(cause => {
        if (cause.label) lines.push("   - " + cause.label);
      });
      (Array.isArray(item.safeChecks) ? item.safeChecks : []).slice(0, 3).forEach(check => {
        if (check) lines.push("   • " + check);
      });
    });
    lines.push("", copy("نقاط المطابقة ليست احتمالات إحصائية. راجع مصدر القياس وحالة الحساس وظروف التشغيل قبل تفسيره. لا تنفذ أي تدخل قبل مراجعة دليل المصنع وإجراءات الموقع.", "Match scores are not statistical probabilities. Check measurement source, sensor status and operating conditions before interpretation. Verify OEM and site procedures before intervention.", "Les scores ne sont pas des probabilités statistiques. Vérifiez la source de mesure, l'état du capteur et les conditions de fonctionnement avant interprétation."));
    return lines.join("\n");
  }

  function collectMeasurementReadings() {
    const raw = String($("aiMeasurementReadings")?.value || "");
    const rows = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const measurements = [];
    const invalidLines = [];
    const sourceMap = {
      direct_measurement: "direct_measurement", direct: "direct_measurement", actual: "direct_measurement", "قياس مباشر": "direct_measurement",
      plc_value: "plc_value", plc: "plc_value",
      historian_value: "historian_value", historian: "historian_value",
      estimated: "estimated", estimate: "estimated", "تقديري": "estimated",
      user_reported: "user_reported", reported: "user_reported", "مبلغ عنه": "user_reported"
    };
    const allowedSensor = new Set(["normal", "suspect", "failed", "unknown"]);
    const allowedQuality = new Set(["normal", "noisy", "stale", "contradictory", "unknown"]);
    rows.forEach((line, index) => {
      if (measurements.length >= 10) { invalidLines.push(index + 1); return; }
      const fields = line.split("|").map(value => value.trim());
      if (fields.length < 4 || !fields[0] || !fields[2]) {
        invalidLines.push(index + 1);
        return;
      }
      const valueText = fields[1];
      const value = valueText ? Number(valueText.replace(",", ".")) : null;
      if (valueText && !Number.isFinite(value)) {
        invalidLines.push(index + 1);
        return;
      }
      const sourceKey = String(fields[3] || "unknown").toLowerCase();
      const sensorStatus = allowedSensor.has(String(fields[6] || "unknown").toLowerCase()) ? String(fields[6] || "unknown").toLowerCase() : "unknown";
      const qualityFlag = allowedQuality.has(String(fields[7] || "unknown").toLowerCase()) ? String(fields[7] || "unknown").toLowerCase() : "unknown";
      measurements.push({
        name: fields[0], value, unit: fields[2],
        sourceType: sourceMap[sourceKey] || "unknown",
        timestamp: fields[4] || "",
        operatingCondition: fields[5] || "",
        sensorStatus, qualityFlag
      });
    });
    return { measurements, invalidLines };
  }

  function syncDiagnosticState(request, diagnosis) {
    if (!localAssistant || !diagnosis) return;
    const now = new Date().toISOString();
    const prefix = "diag-" + Date.now().toString(36);
    const safe = value => String(value == null ? "" : value).slice(0, 1000);
    const add = (collection, record) => {
      try { localAssistant.addDiagnosticRecord(collection, record); }
      catch (error) { console.warn("Diagnostic state record was not stored:", collection, error); }
    };
    try {
      localAssistant.updateEquipment({
        type: safe(request.equipment && request.equipment.type).slice(0, 120),
        manufacturer: safe(request.equipment && request.equipment.manufacturer).slice(0, 120),
        model: safe(request.equipment && request.equipment.model).slice(0, 120)
      });
      localAssistant.updateOperatingContext({
        capturedAt: now,
        language: request.language || "ar",
        measurementCount: Array.isArray(request.measurements) ? request.measurements.length : 0
      });
    } catch (error) {
      console.warn("Diagnostic operating context was not stored.", error);
    }
    const symptom = safe(request.symptom);
    if (symptom) add("symptoms", {
      id: prefix + "-symptom", value: symptom, provenance: "user_reported",
      status: "reported", recordedAt: now
    });
    (Array.isArray(request.measurements) ? request.measurements : []).slice(0, 10).forEach((item, index) => {
      const source = item && item.sourceType;
      const provenance = source === "direct_measurement" || source === "plc_value" || source === "historian_value"
        ? "measured" : source === "user_reported" ? "user_reported" : source === "estimated" ? "unknown" : "unknown";
      add("measurements", {
        id: prefix + "-measurement-" + index,
        name: safe(item && item.name), value: item && item.value,
        unit: safe(item && item.unit), sourceType: safe(source),
        timestamp: safe(item && item.timestamp),
        operatingCondition: safe(item && item.operatingCondition),
        sensorStatus: safe(item && item.sensorStatus || "unknown"),
        qualityFlag: safe(item && item.qualityFlag || "unknown"),
        provenance, recordedAt: now
      });
    });
    (Array.isArray(request.observations) ? request.observations : []).slice(0, 10).forEach((value, index) => {
      add("evidence", {
        id: prefix + "-observation-" + index, observation: safe(value),
        polarity: "unclassified", provenance: "user_reported",
        status: "reported", recordedAt: now
      });
    });
    const hypotheses = Array.isArray(diagnosis.results) ? diagnosis.results : [];
    hypotheses.slice(0, 20).forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const label = safe(item.label || item.title || item.name || item.fault || item.id);
      const stableKey = safe(item.id || item.code || label).toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || String(index + 1);
      const record = {
        id: "hypothesis-" + stableKey,
        label,
        score: Number.isFinite(item.score) ? item.score : null,
        status: "proposed",
        provenance: "engine_inferred",
        support: Array.isArray(item.support) ? item.support.slice(0, 10).map(safe) : [],
        contradictions: Array.isArray(item.contradictions) ? item.contradictions.slice(0, 10).map(safe) : [],
        recordedAt: now
      };
      try { localAssistant.upsertDiagnosticRecord("hypotheses", record); }
      catch (error) { console.warn("Diagnostic hypothesis was not stored.", error); }
    });
    const references = Array.isArray(diagnosis.supportingDocuments) ? diagnosis.supportingDocuments : [];
    references.slice(0, 20).forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const ref = item.sourceRef || {};
      add("references", {
        id: prefix + "-reference-" + index,
        title: safe(item.title || item.name || ref.documentId),
        documentId: safe(ref.documentId),
        page: item.page == null ? "" : safe(item.page),
        provenance: "document_claim",
        status: "retrieved_not_verified",
        recordedAt: now
      });
    });
    persistLocalAssistantSession();
  }

  async function runLocalDiagnosticAssessment() {
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") return;
    const parsedMeasurements = collectMeasurementReadings();
    if (parsedMeasurements.invalidLines.length) {
      addMessage("assistant", copy(
        "لم أستطع قراءة أسطر القياس " + parsedMeasurements.invalidLines.join(", ") + ". استخدم الفاصل | وبنية الحقول الموضحة، أو اترك السطر كملاحظة نصية.",
        "I could not parse measurement lines " + parsedMeasurements.invalidLines.join(", ") + ". Use the | separators and documented fields, or keep the line as a text observation.",
        "Impossible de lire les lignes de mesure " + parsedMeasurements.invalidLines.join(", ") + ". Utilisez les séparateurs | et les champs indiqués, ou conservez la ligne comme observation."
      ));
    }
    const request = {
      intent: "diagnose",
      language: language(),
      equipment: {
        type: equipmentContext || pendingEquipment,
        manufacturer: String($("aiManufacturer")?.value || "").trim(),
        model: String($("aiModel")?.value || "").trim()
      },
      symptom: String($("aiSymptom")?.value || pendingSymptom).trim(),
      observations: [
        ...notes.slice(-8),
        String($("aiObservations")?.value || "").trim()
      ].filter(Boolean).slice(0, 10),
      measurements: parsedMeasurements.measurements,
      consent: { sendToAI: false }
    };
    const result = await localAssistant.invokeTool("diagnose", { request });
    if (!result.ok) {
      addMessage("assistant", copy("تعذر تشغيل محرك التشخيص المحلي. بقيت المحادثة وسجلها المحلي متاحين دون إرسال خارجي.", "The local diagnostic engine could not run. The conversation and local history remain available; nothing was sent externally.", "Le moteur de diagnostic local n’a pas pu s’exécuter. La conversation et son historique local restent disponibles ; aucune donnée n’a été envoyée."));
      return;
    }
    addMessage("assistant", formatLocalDiagnosis(result.data));
    const diagnosis = result.data && result.data.diagnosis ? result.data.diagnosis : result.data;
    syncDiagnosticState(request, diagnosis);
    if (root.MaintenanceLearningMemory && diagnosis) {
      try {
        const memory = await root.MaintenanceLearningMemory.recordDiagnostic({
          equipmentFamily: String(request.equipment.type || "").slice(0, 100),
          hypotheses: Array.isArray(diagnosis.results) ? diagnosis.results : [],
          measurementSources: request.measurements.map(item => item.sourceType),
          qualityWarnings: diagnosis.measurementEvidence && Array.isArray(diagnosis.measurementEvidence.warnings)
            ? diagnosis.measurementEvidence.warnings.map(item => item.code) : [],
          evidenceDocumentIds: Array.isArray(diagnosis.supportingDocuments)
            ? diagnosis.supportingDocuments.map(item => item.sourceRef && item.sourceRef.documentId).filter(Boolean) : []
        });
        if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") {
          root.dispatchEvent(new root.CustomEvent("maintenance-diagnostic-learning-case", {
            detail: { caseId: memory.caseId, diagnosis }
          }));
        }
      } catch (error) {
        console.warn("Local diagnostic learning record was not saved.", error);
      }
    }
  }

  function submitKnownAnswer(answerId, label) {
    const session = currentSession();
    if (!session || !root.MaintenanceDiagnosticSessionUI || !root.MaintenanceDiagnosticSessionUI.answerById) return;
    addMessage("user", label || answerId);
    const result = root.MaintenanceDiagnosticSessionUI.answerById(answerId);
    if (!result || !result.ok) {
      addMessage("assistant", copy("تعذر تسجيل الإجابة. لم تتغير الفرضيات.", "The answer could not be recorded. Hypotheses were not changed.", "La réponse n’a pas pu être enregistrée. Les hypothèses n’ont pas changé."));
      return;
    }
    const updated = currentSession();
    if (updated && updated.nextQuestion) {
      addMessage("assistant", updated.nextQuestion.text);
    } else if (updated && updated.summary) {
      addMessage("assistant", updated.summary.message);
    }
    const summary = renderHypothesisSummary(updated);
    if (summary) addMessage("assistant", summary);
    renderReplies();
    renderEvidenceButton();
  }
  function renderEvidenceButton() {
    const holder = $("diagnosticChatEvidence");
    if (!holder) return;
    const queryKey = [
      pendingEquipment, pendingSymptom,
      String($("aiModel")?.value || ""),
      String($("aiCode")?.value || ""),
      String($("aiObservations")?.value || ""),
      ...notes,
      ...messages.map(message => message.text)
    ].filter(Boolean).join(" ").slice(0, 3000);
    if (!queryKey) {
      holder.textContent = copy("ستظهر مراجع PDF المعتمدة تلقائيًا عند بدء التشخيص.", "Approved PDF references will appear automatically when diagnosis starts.", "Les références PDF approuvées apparaîtront automatiquement au début du diagnostic.");
      return;
    }
    if (queryKey === lastEvidenceQuery) return;
    lastEvidenceQuery = queryKey;
    holder.textContent = copy("جارٍ استرجاع الأدلة المعتمدة محليًا…", "Retrieving approved evidence locally…", "Récupération locale des preuves approuvées…");
    retrieveEvidence().catch(() => {
      holder.textContent = copy("تعذر استرجاع المراجع الآن؛ يستمر التشخيص المحلي دونها.", "References could not be retrieved now; local diagnosis continues without them.", "Impossible de récupérer les références ; le diagnostic local continue sans elles.");
    });
  }
  function normalizeLocalToolResult(response) {
    if (response && response.ok === true && response.data &&
        typeof response.data === "object" && !Array.isArray(response.data)) {
      return response.data;
    }
    return response;
  }

  async function retrieveEvidence() {
    const holder = $("diagnosticChatEvidence");
    const api = root.MaintenanceDocumentRetrieval;
    if (!holder || !api || typeof api.forDiagnostics !== "function") {
      if (holder) holder.textContent = copy("طبقة استرجاع الوثائق غير متاحة.", "Document retrieval is unavailable.", "La recherche documentaire est indisponible.");
      return;
    }
    const sequence = ++retrievalSequence;
    clearRetrievedExcerpts();
    holder.textContent = copy("جارٍ البحث محليًا في الادعاءات المعتمدة…", "Searching locally among approved claims…", "Recherche locale parmi les affirmations approuvées…");
    const session = currentSession();
    const retrievalContext = {
      machine: String($("aiMachine")?.value || "").trim(),
      model: String($("aiModel")?.value || "").trim(),
      symptom: String($("aiSymptom")?.value || "").trim(),
      code: String($("aiCode")?.value || "").trim(),
      observations: String($("aiObservations")?.value || "").trim(),
      technicianInput: getTechnicianChatInput()
    };
    const query = [pendingEquipment, pendingSymptom, retrievalContext.code, retrievalContext.model, retrievalContext.observations, ...notes, ...messages.map(message => message.text)].filter(Boolean).join(" ");
    const retrievalInput = {
      query,
      context: { equipment: equipmentContext || retrievalContext.machine || pendingEquipment, model: retrievalContext.model }
    };
    const toolResponse = localAssistant && typeof localAssistant.invokeTool === "function"
      ? await localAssistant.invokeTool("searchReviewedDocuments", retrievalInput)
      : await api.forDiagnostics(query, retrievalInput.context);
    const result = normalizeLocalToolResult(toolResponse);
    if (sequence !== retrievalSequence) return;
    holder.replaceChildren();
    if (!result || result.ok !== true || !Array.isArray(result.results) || !result.results.length) {
      holder.textContent = copy("لا توجد أدلة PDF معتمدة ومطابقة لهذا النطاق حاليًا. لا تُستخدم المقاطع الخام أو OCR غير المراجع.", "No approved, applicable PDF evidence was found. Raw or unreviewed OCR chunks are excluded.", "Aucune preuve PDF approuvée et applicable n’a été trouvée. Les fragments bruts ou OCR non vérifiés sont exclus.");
      return;
    }
    retrievedExcerpts = result.results.slice(0, 3).map(item => ({
      documentTitle: String(item.documentTitle || "PDF").slice(0, 160),
      citation: String(item.citation || "").slice(0, 240),
      text: String(item.text || "").slice(0, 350),
      sourceRef: item.sourceRef || null,
      reviewStatus: item.reviewStatus || "unknown",
      rightsStatus: item.rightsStatus || "unknown",
      evidenceRole: item.evidenceRole || "unknown"
    })).filter(item => item.text);
    retrievedContext = retrievalContext;
    result.results.forEach(item => {
      const article = root.document.createElement("article");
      const title = root.document.createElement("strong");
      title.textContent = (item.documentTitle || "PDF") + " — " + (item.citation || "");
      const excerpt = root.document.createElement("p");
      excerpt.textContent = item.text || "";
      const source = root.document.createElement("button");
      source.type = "button";
      source.className = "btn secondary";
      source.textContent = copy("فتح صفحة PDF الأصلية", "Open original PDF page", "Ouvrir la page PDF originale");
      source.addEventListener("click", () => {
        const ref = item.sourceRef || {};
        if (root.MaintenanceDocumentLibrary && ref.documentId && ref.pageNumber) root.MaintenanceDocumentLibrary.openSourcePage(ref.documentId, ref.pageNumber);
      });
      article.append(title, excerpt, source);
      holder.appendChild(article);
    });
  }
  async function askGenerative() {
    const consent = $("diagnosticChatCloudConsent");
    const workerConsent = $("aiCloudConsent");
    const button = $("diagnosticChatAskGenerative");
    if (!consent || !consent.checked) {
      addMessage("assistant", copy("لم يتم إرسال أي شيء. فعّل موافقة الإرسال ثم اضغط زر التحليل إذا أردت استخدام المزود الخارجي.", "Nothing was sent. Enable the sharing consent and press the analysis button if you want to use the external provider.", "Aucune donnée n’a été envoyée. Activez le consentement puis cliquez sur le bouton d’analyse pour utiliser le fournisseur externe."));
      return;
    }
    await retrieveEvidence();
    if (!$("aiMachine")?.value.trim() || !$("aiSymptom")?.value.trim()) {
      addMessage("assistant", copy("أكمل تحديد المعدة والعَرَض أولًا حتى لا نرسل طلبًا ناقصًا.", "Identify the equipment and symptom first so an incomplete request is not sent.", "Identifiez d’abord l’équipement et le symptôme afin de ne pas envoyer une demande incomplète."));
      return;
    }
    if (!root.MaintenanceAgentUI || typeof root.MaintenanceAgentUI.runCloudAI !== "function" || !workerConsent) {
      addMessage("assistant", copy("طبقة الذكاء التوليدي غير متاحة في هذه النسخة.", "The generative AI adapter is unavailable in this build.", "L’adaptateur d’IA générative n’est pas disponible dans cette version."));
      return;
    }

    workerConsent.checked = true;
    consent.checked = false;
    if (button) {
      button.disabled = true;
      button.textContent = copy("جارٍ التحليل…", "Generating analysis…", "Analyse en cours…");
    }
    addMessage("assistant", copy("أرسل ملخص الحالة إلى مزود الذكاء الاصطناعي بعد موافقتك. سأعرض الرد بوصفه تقييمًا أوليًا، لا تشخيصًا مؤكدًا.", "Sending the case summary to the configured AI provider with your consent. The response will remain a preliminary assessment, not a confirmed diagnosis.", "Envoi du résumé au fournisseur d’IA configuré avec votre accord. La réponse restera une évaluation préliminaire, pas un diagnostic confirmé."));
    try {
      await root.MaintenanceAgentUI.runCloudAI();
      const output = $("aiResult");
      const answer = output && String(output.textContent || "").trim();
      addMessage("assistant", answer || copy("لم تُرجع الخدمة نصًا قابلًا للعرض. بقي التشخيص المحلي متاحًا.", "The service returned no displayable text. Local diagnosis remains available.", "Le service n’a renvoyé aucun texte affichable. Le diagnostic local reste disponible."));
    } catch (_) {
      addMessage("assistant", copy("تعذر استدعاء المزود. لم تتغير أدلة الجلسة المحلية.", "The provider could not be reached. Local session evidence was not changed.", "Le fournisseur est inaccessible. Les éléments de la session locale n’ont pas été modifiés."));
    } finally {
      workerConsent.checked = false;
      if (consent) consent.checked = false;
      if (button) {
        button.disabled = false;
        button.textContent = copy("اطلب تحليلًا توليديًا", "Request generative analysis", "Demander une analyse générative");
      }
    }
  }

  function getTechnicianChatInput() {
    return messages.filter(message => message.role === "user").slice(-8)
      .map(message => message.text).join("\n").slice(-1200);
  }

  function getConversationContext() {
    const guided = root.MaintenanceDiagnosticSessionUI && typeof root.MaintenanceDiagnosticSessionUI.getPayload === "function"
      ? root.MaintenanceDiagnosticSessionUI.getPayload() : {};
    const localSnapshot = JSON.stringify({
      flowId: guided.diagnosticFlowId || "",
      answers: (Array.isArray(guided.diagnosticAnswers) ? guided.diagnosticAnswers : []).slice(0, 8)
        .map(item => ({ questionId: item.questionId, answerId: item.answerId, evidence: item.evidence })),
      hypotheses: (Array.isArray(guided.diagnosticHypotheses) ? guided.diagnosticHypotheses : []).slice(0, 5)
        .map(item => ({ id: item.id, label: item.label, status: item.status }))
    });
    const transcript = messages.slice(-12).map(message =>
      (message.role === "user" ? "Technician: " : "Assistant: ") + message.text
    ).join("\n");
    return [
      "Local diagnostic snapshot (client-side heuristic; provisional and unverified, not ground truth):",
      localSnapshot,
      "Conversation transcript (assistant text is not independent evidence):",
      transcript
    ].join("\n\n").slice(-1200);
  }

  function openSafetyChecklistPanel() {
    const tab = root.document && root.document.querySelector('.tab[data-tab="safety"]');
    if (tab && typeof tab.click === "function") tab.click();
  }

  function isSafetyChecklistRequest(value) {
    return /(?:قائمة\s*(?:تحقق\s*)?السلامة|تحقق\s*السلامة|فحص\s*السلامة|هل\s*أبدأ\s*(?:التدخل|الصيانة)|safety\s*checklist|pre[- ]job\s*safety|before\s*(?:maintenance|intervention)|liste\s*(?:de\s*)?sécurité|checklist\s*(?:de\s*)?sécurité)/i.test(String(value || ""));
  }

  async function answerSafetyChecklistRequest() {
    openSafetyChecklistPanel();
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") {
      addMessage("assistant", copy("فتحت قائمة السلامة إن كانت متاحة، لكن تعذر قراءة حالتها. لا تبدأ التدخل قبل التحقق يدويًا من جميع البنود وفق إجراء الموقع.", "I opened the safety checklist if available, but could not read its state. Do not begin until every item is verified under site procedures.", "La liste de sécurité a été ouverte si disponible, mais son état n’a pas pu être lu. Ne commencez pas avant d’avoir vérifié chaque point selon la procédure du site."));
      return;
    }
    const result = await localAssistant.invokeTool("getSafetyChecklistStatus", {});
    if (!result.ok || !result.data || result.data.ok !== true) {
      addMessage("assistant", copy("تعذر قراءة قائمة السلامة. لا أستطيع تأكيد جاهزية التدخل؛ راجع البنود يدويًا وصعّد أي بند غير مؤكد.", "The safety checklist could not be read. I cannot confirm readiness; review each item manually and escalate any uncertainty.", "Impossible de lire la liste de sécurité. Je ne peux pas confirmer l’aptitude à intervenir ; vérifiez chaque point et escaladez toute incertitude."));
      return;
    }
    const data = result.data;
    const lines = [copy("حالة قائمة التحقق المحلية:", "Local checklist status:", "État de la liste locale :"),
      data.checkedCount + " / " + data.total + " " + copy("بنود محددة", "items checked", "points cochés")];
    data.items.forEach((item, index) => lines.push((item.checked ? "[✓] " : "[ ] ") + (index + 1) + ". " + item.label));
    lines.push("", data.allChecked
      ? copy("كل مربعات القائمة محددة، لكن هذا ليس تصريح عمل أو إثباتًا مستقلًا للعزل أو انعدام الطاقة. يجب تطبيق إجراءات الموقع والتحقق بواسطة الشخص المؤهل.", "All boxes are checked, but this is not a work permit or independent proof of isolation/zero energy. Site procedures and competent-person verification still apply.", "Toutes les cases sont cochées, mais cela ne constitue ni un permis de travail ni une preuve indépendante d’isolement/absence d’énergie. Les procédures du site et la vérification par une personne compétente restent obligatoires.")
      : copy("توجد بنود غير محددة. لا تبدأ التدخل إذا بقي أي بند غير مؤكد؛ أكمل التحقق أو صعّد للمسؤول.", "Some items remain unchecked. Do not begin if any item is uncertain; complete verification or escalate.", "Certains points ne sont pas cochés. Ne commencez pas si un point reste incertain ; terminez la vérification ou escaladez."));
    addMessage("assistant", lines.join("\n"));
  }

  function isEquipmentContextRequest(value) {
    return /(?:بيانات\s*(?:المعدة|الآلة)|معلومات\s*(?:المعدة|الآلة)|سياق\s*المعدة|equipment\s*(?:context|details)|machine\s*(?:context|details)|informations\s*(?:de\s*)?l’équipement|contexte\s*(?:de\s*)?l’équipement)/i.test(String(value || ""));
  }

  async function answerEquipmentContextRequest() {
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") {
      addMessage("assistant", copy("أداة سياق المعدة غير متاحة في هذه الجلسة.", "The equipment-context tool is unavailable in this session.", "L’outil de contexte équipement est indisponible."));
      return;
    }
    const result = await localAssistant.invokeTool("getEquipmentContext", { equipment: {
      type: equipmentContext || pendingEquipment || String($("aiMachine")?.value || "").trim(),
      manufacturer: String($("aiManufacturer")?.value || "").trim(),
      model: String($("aiModel")?.value || "").trim()
    }});
    if (!result.ok || !result.data || !result.data.equipment) {
      addMessage("assistant", copy("تعذر قراءة سياق المعدة المحلي.", "The local equipment context could not be read.", "Impossible de lire le contexte équipement local."));
      return;
    }
    const equipment = result.data.equipment;
    addMessage("assistant", [
      copy("بيانات المعدة المعروفة في هذه الجلسة:", "Equipment details known in this session:", "Données équipement connues dans cette session :"),
      copy("النوع: ", "Type: ", "Type : ") + (equipment.type || copy("غير محدد", "Not specified", "Non spécifié")),
      copy("الشركة المصنّعة: ", "Manufacturer: ", "Fabricant : ") + (equipment.manufacturer || copy("غير محددة", "Not specified", "Non spécifié")),
      copy("الموديل: ", "Model: ", "Modèle : ") + (equipment.model || copy("غير محدد", "Not specified", "Non spécifié")),
      copy("هذه بيانات السياق المسجلة فقط؛ لا أستنتج موديلًا أو مواصفات غير مدخلة.", "These are recorded context fields only; no model or specification is inferred.", "Ces champs reflètent uniquement le contexte enregistré ; aucun modèle ni aucune spécification ne sont déduits.")
    ].join("\n"));
  }

  function isShiftHandoverRequest(value) {
    return /(?:تقرير\s*(?:تسليم|استلام)\s*(?:النوبة|الوردية)|تسليم\s*(?:النوبة|الوردية)|shift\s*handover|handover\s*report|rapport\s*(?:de\s*)?relève|passation\s*(?:de\s*)?consignes)/i.test(String(value || ""));
  }

  async function answerShiftHandoverRequest(value) {
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") {
      addMessage("assistant", copy("أداة تقرير تسليم النوبة المحلي غير متاحة.", "The local shift-handover tool is unavailable.", "L’outil local de relève est indisponible."));
      return;
    }
    const requestedPeriod = /(?:آخر\s*8\s*ساعات|last\s*8\s*hours|8\s*dernières\s*heures)/i.test(value) ? "8"
      : /(?:مخصص|فترة\s*محددة|custom\s*period|période\s*personnalisée)/i.test(value) ? "custom" : "today";
    const dates = value.match(/(\d{4}-\d{2}-\d{2})[^\d]+(\d{4}-\d{2}-\d{2})/);
    const period = dates ? "custom" : requestedPeriod;
    const result = await localAssistant.invokeTool("createShiftHandoverDraft", {
      period,
      from: dates ? dates[1] : undefined,
      to: dates ? dates[2] : undefined,
      note: value.slice(0, 240)
    });
    if (!result.ok || !result.data || result.data.ok !== true) {
      const reason = result.data && result.data.status === "invalid_date_range"
        ? copy("الفترة المخصصة تحتاج تاريخ بداية ونهاية صالحين؛ لم أنشئ التقرير.", "A custom period requires valid start and end dates; no report was created.", "Une période personnalisée nécessite des dates valides ; aucun rapport n’a été créé.")
        : copy("تعذر إعداد مسودة تسليم النوبة من البيانات المحلية. لم يتم تعديل أي سجل.", "The local shift-handover draft could not be prepared. No records were changed.", "Impossible de préparer la relève à partir des données locales. Aucun enregistrement n’a été modifié.");
      addMessage("assistant", reason);
      return;
    }
    const draft = result.data;
    const lines = [
      copy("مسودة تقرير تسليم النوبة — غير محفوظة", "Shift-handover report draft — not saved", "Brouillon de rapport de relève — non enregistré"),
      copy("وقت الإنشاء: ", "Generated: ", "Généré : ") + new Date(draft.generatedAt).toLocaleString(),
      copy("الفترة: ", "Period: ", "Période : ") + (draft.period.type === "8" ? copy("آخر 8 ساعات", "Last 8 hours", "8 dernières heures") : draft.period.type === "today" ? copy("اليوم", "Today", "Aujourd’hui") : draft.period.from + " → " + draft.period.to),
      copy("عدد سجلات التدخل المطابقة: ", "Matching maintenance records: ", "Enregistrements correspondants : ") + draft.recordCount
    ];
    if (draft.records.length) draft.records.forEach((record, index) => {
      lines.push("", (index + 1) + ". " + record.date + " — " + record.machine + " [" + record.status + "]");
      lines.push(copy("العطل/الملاحظة: ", "Fault/observation: ", "Panne/observation : ") + record.fault);
      lines.push(copy("الإجراء المسجل: ", "Recorded action: ", "Action enregistrée : ") + record.action);
    });
    else lines.push("", copy("لا توجد سجلات مطابقة للفترة المحددة.", "No matching records for the selected period.", "Aucun enregistrement pour la période sélectionnée."));
    if (draft.recordsTruncated) lines.push(copy("تم عرض أول 8 سجلات فقط من أصل ", "Showing the first 8 records out of ", "Affichage des 8 premiers enregistrements sur ") + draft.totalMatchingRecords + ".");
    lines.push("", copy("المهام الوقائية المتأخرة أو المستحقة اليوم:", "Overdue or due-today PM tasks:", "Tâches préventives en retard ou dues aujourd’hui :"));
    if (draft.pmDue.length) draft.pmDue.forEach(task => lines.push("• " + task.machine + " — " + task.task + " | " + task.status + " | " + (task.dueDate || "—")));
    else lines.push(copy("لا توجد مهام مسجلة متأخرة أو مستحقة اليوم.", "No saved tasks are overdue or due today.", "Aucune tâche enregistrée n’est en retard ou due aujourd’hui."));
    if (draft.pmDueTruncated) lines.push(copy("تم اختصار قائمة المهام المستحقة؛ العدد الكلي: ", "Due-task list was shortened; total: ", "Liste des tâches échues réduite ; total : ") + draft.totalPmDue + ".");
    if (draft.invalidPmSchedules.length) {
      lines.push("", copy("جداول تحتاج مراجعة (تاريخ/فترة غير صالحة):", "Schedules requiring review (invalid date/interval):", "Programmes à vérifier (date/intervalle invalide) :"));
      draft.invalidPmSchedules.forEach(task => lines.push("• " + task.machine + " — " + task.task));
      if (draft.invalidPmSchedulesTruncated) lines.push(copy("تم اختصار القائمة؛ العدد الكلي: ", "List shortened; total: ", "Liste réduite ; total : ") + draft.totalInvalidPmSchedules + ".");
    }
    if (draft.note) lines.push("", copy("ملاحظة الطلب: ", "Request note: ", "Note de demande : ") + draft.note);
    lines.push("", copy("تنبيه: هذه مسودة من سجلات محلية أدخلها المستخدمون، وليست تحققًا مستقلًا من تنفيذ الأعمال. لم تُحفظ أو تُشارك.", "Notice: this draft uses locally entered records and does not independently verify work completion. It has not been saved or shared.", "Attention : ce brouillon utilise des saisies locales et ne vérifie pas indépendamment les travaux. Il n’a été ni enregistré ni partagé."));
    addMessage("assistant", lines.join("\n"));
  }

  function isMaintenanceHistoryRequest(value) {
    return /(?:سجل\s*(?:الصيانة|التدخلات)|تاريخ\s*(?:الصيانة|الأعطال)|الأعطال\s*(?:السابقة|الماضية)|التدخلات\s*(?:السابقة|الماضية)|maintenance\s*history|service\s*history|previous\s*(?:faults|repairs)|past\s*(?:maintenance|repairs)|historique\s*(?:de\s*)?(?:maintenance|interventions|pannes)|interventions\s*précédentes)/i.test(String(value || ""));
  }

  async function answerMaintenanceHistoryRequest(value) {
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") {
      addMessage("assistant", copy("أداة سجل الصيانة المحلي غير متاحة في هذه الجلسة.", "The local maintenance-history tool is unavailable in this session.", "L’outil local d’historique de maintenance est indisponible dans cette session."));
      return;
    }
    const detected = detectEquipment(value);
    const equipment = {
      type: equipmentContext || (detected && detected.id) || String($("aiMachine")?.value || "").trim(),
      manufacturer: String($("aiManufacturer")?.value || "").trim(),
      model: String($("aiModel")?.value || "").trim()
    };
    const result = await localAssistant.invokeTool("getMaintenanceHistory", {
      query: detected ? detected.id : "",
      equipment,
      limit: 10
    });
    if (!result.ok || !result.data || result.data.ok !== true) {
      addMessage("assistant", copy("تعذر قراءة سجل الصيانة المحلي. لم يتم تغيير أي سجل.", "The local maintenance log could not be read. No records were changed.", "Impossible de lire le journal local. Aucun enregistrement n’a été modifié."));
      return;
    }
    const records = Array.isArray(result.data.records) ? result.data.records : [];
    if (!records.length) {
      addMessage("assistant", copy("لا توجد سجلات صيانة مطابقة في هذا الجهاز. لم أستنتج وجود أعطال سابقة.", "No matching maintenance records were found on this device. I have not inferred any previous faults.", "Aucun historique de maintenance correspondant n’a été trouvé sur cet appareil. Je n’ai déduit aucune panne antérieure."));
      return;
    }
    const lines = [copy("السجلات المحلية المطابقة (الأحدث أولًا):", "Matching local records (newest first):", "Enregistrements locaux correspondants (du plus récent au plus ancien) :")];
    records.forEach((record, index) => {
      lines.push("", (index + 1) + ". " + record.date + " — " + record.machine);
      lines.push(copy("العطل: ", "Fault: ", "Panne : ") + record.fault);
      lines.push(copy("الإجراء المسجل: ", "Recorded action: ", "Action enregistrée : ") + record.action);
      lines.push(copy("الحالة: ", "Status: ", "Statut : ") + record.status);
    });
    lines.push("", copy("هذه بيانات السجل كما أدخلها المستخدمون على هذا الجهاز؛ لا تمثل تحققًا مستقلًا من الإصلاح أو السبب الجذري.", "These are records entered on this device; they are not independent verification of the repair or root cause.", "Ces données proviennent des saisies enregistrées sur cet appareil ; elles ne constituent pas une vérification indépendante de la réparation ou de la cause racine."));
    addMessage("assistant", lines.join("\n"));
  }

  function isPreventiveMaintenanceRequest(value) {
    return /الصيانة\s*الوقائية|مهام\s*الصيانة|المهام\s*(?:المستحقة|المتأخرة)|pm\s*schedule|preventive\s*maintenance|maintenance\s*schedule|maintenance\s*due|maintenance\s*plan|maintenance\s*préventive|échéancier\s*(?:de\s*)?maintenance/i.test(String(value || ""));
  }

  async function answerPreventiveMaintenanceRequest(value) {
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") {
      addMessage("assistant", copy("أداة خطة الصيانة الوقائية المحلية غير متاحة.", "The local preventive-maintenance tool is unavailable.", "L’outil local de maintenance préventive est indisponible."));
      return;
    }
    const detected = detectEquipment(value);
    const query = detected ? detected.id : (equipmentContext || pendingEquipment || "");
    const result = await localAssistant.invokeTool("getPreventiveMaintenanceSchedule", { query, limit: 10 });
    if (!result.ok || !result.data || result.data.ok !== true) {
      addMessage("assistant", copy("تعذر قراءة خطة الصيانة الوقائية المحلية. لم يتم تعديل أي مهمة.", "The local preventive-maintenance plan could not be read. No task was changed.", "Impossible de lire le plan local de maintenance préventive. Aucune tâche n’a été modifiée."));
      return;
    }
    const tasks = Array.isArray(result.data.tasks) ? result.data.tasks : [];
    if (!tasks.length) {
      addMessage("assistant", copy("لا توجد مهام وقائية مطابقة محفوظة على هذا الجهاز. لم أفترض أي فترات صيانة.", "No matching preventive tasks are stored on this device. I have not assumed any maintenance intervals.", "Aucune tâche préventive correspondante n’est enregistrée sur cet appareil. Aucun intervalle n’a été supposé."));
      return;
    }
    const lines = [copy("خطة الصيانة الوقائية المحلية — حسب البيانات المسجلة:", "Local preventive-maintenance plan — based on saved data:", "Plan local de maintenance préventive — selon les données enregistrées :")];
    tasks.forEach((task, index) => {
      const status = task.status === "overdue" ? copy("متأخرة", "Overdue", "En retard")
        : task.status === "due_today" ? copy("مستحقة اليوم", "Due today", "À effectuer aujourd’hui")
        : task.status === "upcoming" ? copy("لاحقة", "Upcoming", "À venir")
        : copy("جدول غير صالح؛ راجع الخطة", "Invalid schedule; review the plan", "Plan invalide ; vérifier le programme");
      lines.push("", (index + 1) + ". " + task.machine + " — " + task.task);
      lines.push(copy("آخر تنفيذ: ", "Last performed: ", "Dernière exécution : ") + task.lastPerformed);
      lines.push(copy("الاستحقاق التالي: ", "Next due: ", "Prochaine échéance : ") + (task.dueDate || "—") + " (" + status + ")");
      if (task.repeat === "days") lines.push(copy("الفاصل المسجل: ", "Saved interval: ", "Intervalle enregistré : ") + task.intervalDays + copy(" يومًا", " days", " jours"));
      else if (task.repeat === "monthly") lines.push(copy("التكرار المسجل: شهري", "Saved recurrence: monthly", "Récurrence enregistrée : mensuelle"));
      if (task.notes) lines.push(copy("ملاحظة: ", "Note: ", "Note : ") + task.notes);
    });
    lines.push("", copy("المواعيد محسوبة من الفترات التي أدخلها المستخدم فقط. تحقق من خطة المصنع والموقع قبل تنفيذ المهمة.", "Due dates are calculated only from user-entered intervals. Verify the OEM and site plan before performing the task.", "Les échéances sont calculées uniquement à partir des intervalles saisis. Vérifiez le plan constructeur et le plan du site avant toute intervention."));
    addMessage("assistant", lines.join("\n"));
  }

  function handleMessage(text) {
    const value = String(text || "").trim();
    if (!value) return;
    clearRetrievedExcerpts();
    addMessage("user", value);
    if (isSafetyChecklistRequest(value)) {
      answerSafetyChecklistRequest().catch(() => {
        addMessage("assistant", copy("تعذر فتح أو قراءة قائمة السلامة.", "The safety checklist could not be opened or read.", "Impossible d’ouvrir ou de lire la liste de sécurité."));
      });
      return;
    }
    if (isEquipmentContextRequest(value)) {
      answerEquipmentContextRequest().catch(() => {
        addMessage("assistant", copy("حدث خطأ أثناء قراءة سياق المعدة المحلي.", "An error occurred while reading local equipment context.", "Une erreur est survenue lors de la lecture du contexte équipement local."));
      });
      return;
    }
    if (isShiftHandoverRequest(value)) {
      answerShiftHandoverRequest(value).catch(() => {
        addMessage("assistant", copy("حدث خطأ أثناء إعداد مسودة تسليم النوبة المحلية.", "An error occurred while preparing the local shift-handover draft.", "Une erreur est survenue lors de la préparation du brouillon de relève."));
      });
      return;
    }
    if (isMaintenanceHistoryRequest(value)) {
      answerMaintenanceHistoryRequest(value).catch(() => {
        addMessage("assistant", copy("حدث خطأ أثناء قراءة السجل المحلي.", "An error occurred while reading the local log.", "Une erreur est survenue lors de la lecture du journal local."));
      });
      return;
    }
    if (isPreventiveMaintenanceRequest(value)) {
      answerPreventiveMaintenanceRequest(value).catch(() => {
        addMessage("assistant", copy("حدث خطأ أثناء قراءة خطة الصيانة الوقائية.", "An error occurred while reading the preventive-maintenance plan.", "Une erreur est survenue lors de la lecture du plan de maintenance préventive."));
      });
      return;
    }
    const modelMatch = value.match(/(?:\bmodel\b|موديل|الموديل|طراز|modèle)\s*[:：]\s*([^,،;؛\n]{2,80})/i);
    if (modelMatch) setField("aiModel", modelMatch[1].trim());
    syncLocalAssistantEquipmentContext();
    if (!started) {
      notes.push(value);
      beginIfReady(value);
      return;
    }
    const session = currentSession();
    if (!session || !session.nextQuestion) {
      notes.push(value);
      if (!session) {
        addMessage("assistant", copy("أضفت الملاحظة إلى الحالة. سأعيد تشغيل التقييم المحلي على كامل الملاحظات المتاحة، مع إبقاء النتائج أولية.", "I added the note to the case. I will rerun the local assessment using the available observations; results remain preliminary.", "J’ai ajouté cette note au dossier. Je relance l’évaluation locale avec les observations disponibles ; les résultats restent préliminaires."));
        runLocalDiagnosticAssessment().catch(() => {
          addMessage("assistant", copy("تعذر تحديث التقييم المحلي بهذه الملاحظة.", "The local assessment could not be updated with this observation.", "L’évaluation locale n’a pas pu être mise à jour avec cette observation."));
        });
        renderEvidenceButton();
        return;
      }
      addMessage("assistant", copy("تم حفظ الملاحظة ضمن سياق المحادثة، لكن مسار الأسئلة الموجّه اكتمل. لا أغيّر فرضياته دون مسار أو دليل جديد قابل للتقييم.", "The note was retained, but the guided question flow is complete. I will not change its hypotheses without a supported path or new assessable evidence.", "La note est conservée, mais le parcours guidé est terminé. Je ne modifierai pas ses hypothèses sans parcours pris en charge ou nouvel élément évaluable."));
      renderEvidenceButton();
      return;
    }
    const result = root.MaintenanceDiagnosticSessionUI.answerText(value);
    if (!result || !result.ok) {
      notes.push(value);
      addMessage("assistant", copy("احتفظت بملاحظتك، لكنها لا تطابق إجابة محددة بما يكفي لتحديث الفرضيات بأمان. اختر أحد الردود المقترحة أدناه، أو أعد صياغة المعلومة.", "I retained your note, but it does not map clearly enough to a known answer to update the hypotheses safely. Choose one of the suggested replies or rephrase the observation.", "Votre note est conservée, mais elle ne correspond pas assez clairement à une réponse connue pour mettre à jour les hypothèses en toute sécurité. Choisissez une réponse proposée ou reformulez l’observation."));
      renderReplies();
      return;
    }
    const updated = currentSession();
    if (updated && updated.nextQuestion) addMessage("assistant", updated.nextQuestion.text);
    else if (updated && updated.summary) addMessage("assistant", updated.summary.message);
    const summary = renderHypothesisSummary(updated);
    if (summary) addMessage("assistant", summary);
    renderReplies();
    renderEvidenceButton();
  }
  function resetConversation() {
    messages = [];
    notes = [];
    started = false;
    pendingEquipment = "";
    pendingSymptom = "";
    equipmentContext = "";
    retrievalSequence++;
    clearRetrievedExcerpts();
    ["aiMachine", "aiModel", "aiSymptom", "aiCode", "aiObservations"].forEach(id => {
      const field = $(id);
      if (field) field.value = "";
    });
    const measurement = $("aiMeasurementStatus");
    if (measurement) measurement.value = "unknown";
    const result = $("aiResult");
    if (result) { result.textContent = ""; result.hidden = true; }
    const cloudConsent = $("aiCloudConsent");
    if (cloudConsent) cloudConsent.checked = false;
    const chatConsent = $("diagnosticChatCloudConsent");
    if (chatConsent) chatConsent.checked = false;
    if (root.MaintenanceDiagnosticSessionUI && root.MaintenanceDiagnosticSessionUI.reset) root.MaintenanceDiagnosticSessionUI.reset();
    startLocalAssistantSession();
    addMessage("assistant", copy("ابدأ بوصف المشكلة كما تراها. مثال: مضخة طرد مركزي، التدفق ضعيف والاهتزاز مرتفع.", "Describe the problem in your own words. Example: centrifugal pump, low flow and high vibration.", "Décrivez le problème avec vos mots. Exemple : pompe centrifuge, faible débit et vibrations élevées."));
    renderReplies();
    const evidence = $("diagnosticChatEvidence"); if (evidence) evidence.replaceChildren();
  }
  function init() {
    const anchor = $("dynamicSessionPanel");
    const hostForm = $("aiForm");
    if (!anchor || !hostForm || $("diagnosticChat")) return;
    appendStyles();
    const panel = root.document.createElement("section");
    panel.id = "diagnosticChat";
    panel.setAttribute("aria-label", "Conversational industrial diagnosis");
    panel.innerHTML = `
      <h3>${copy("المحادثة التشخيصية", "Diagnostic conversation", "Conversation de diagnostic")}</h3>
      <p class="hint">${copy("تحدث بحرية. المحرك المحلي يحدّث الفرضيات من الأدلة المعروفة، ويمكنك طلب تقييم توليدي اختياري بعد الموافقة. النموذج يشرح ويرتب الاحتمالات ولا يؤكد السبب الجذري دون دليل.", "Describe the issue naturally. The local engine updates hypotheses from known evidence, and you can request an optional generative assessment after consenting. The model explains and ranks possibilities; it does not confirm root cause without evidence.", "Décrivez le problème naturellement. Le moteur local met à jour les hypothèses à partir d’éléments connus. Une évaluation générative facultative est disponible après consentement ; le modèle n’établit pas la cause racine sans preuve.")}</p>
      <div id="diagnosticChatMessages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div id="diagnosticChatReplies" aria-label="Suggested replies"></div>
      <form id="diagnosticChatForm">
        <textarea id="diagnosticChatInput" rows="2" maxlength="1500" placeholder="${copy("اكتب وصف المشكلة أو إجابتك هنا…", "Describe the problem or enter your answer…", "Décrivez le problème ou saisissez votre réponse…")}"></textarea>
        <button id="diagnosticChatSend" class="btn" type="submit">${copy("إرسال", "Send", "Envoyer")}</button>
      </form>
      <div id="diagnosticChatEvidence"></div>
      <div id="diagnosticChatLearningFeedback"></div>
      <label class="check" for="diagnosticChatCloudConsent"><input id="diagnosticChatCloudConsent" type="checkbox"> ${copy("أوافق على إرسال مقتطف من المحادثة وملخص حالة التشخيص المحلي ونوع المعدة والموديل والعَرَض والرمز والقراءات ومعرّفات الأدلة والمقاطع النصية المعتمدة التي طلبت استرجاعها إلى مزود الذكاء الاصطناعي المهيأ عبر الخادم. لا تُرسل ملفات PDF كاملة أو أسرارًا أو بيانات حساسة.", "I consent to sending a bounded conversation excerpt and local diagnostic snapshot, equipment type, model, symptom, alarm code, readings, evidence IDs, and approved text excerpts that I requested to retrieve to the configured AI provider through the server. Full PDF files are not sent. Do not send secrets or sensitive data.", "J’autorise l’envoi d’un extrait limité de la conversation et d’un instantané du diagnostic local, du type d’équipement, du modèle, du symptôme, du code d’alarme, des mesures, des identifiants de preuve et des extraits textuels approuvés que j’ai demandé à récupérer au fournisseur d’IA configuré via le serveur. Les fichiers PDF complets ne sont pas envoyés. N’envoyez aucune donnée sensible.")}</label>
      <div class="actions"><button id="diagnosticChatAskGenerative" class="btn" type="button">${copy("اطلب تحليلًا توليديًا", "Request generative analysis", "Demander une analyse générative")}</button></div>
      <p class="hint">${copy("لا يتم الإرسال بمجرد كتابة الرسائل. يلزم تفعيل الموافقة والضغط على زر التحليل لكل طلب.", "Typing messages does not send them. Consent and a button press are required for each request.", "La saisie des messages n’envoie rien. Un consentement et un clic sont requis pour chaque demande.")}</p>
      <div class="actions"><button id="diagnosticChatReset" class="btn secondary" type="button">${copy("بدء محادثة جديدة", "Start a new conversation", "Nouvelle conversation")}</button></div>
      <p class="hint">${copy("السلامة مستقلة عن المحادثة: لا تنفّذ اختبارًا أو تفتح نظامًا مضغوطًا أو لوحة كهربائية حية بناءً على الرد. اتبع LOTO وإجراءات الموقع وصعّد عند الخطر.", "Safety is independent of the conversation: do not perform a test, open a pressurized system, or access a live electrical panel based on a chat response. Follow LOTO and site procedures; escalate hazards.", "La sécurité est indépendante de la conversation : n’effectuez aucun essai et n’ouvrez aucun circuit sous pression ou armoire sous tension sur la base d’une réponse. Appliquez la consignation et les procédures du site.")}</p>
    `;
    hostForm.insertAdjacentElement("beforebegin", panel);
    $("diagnosticChatForm").addEventListener("submit", event => {
      event.preventDefault();
      const input = $("diagnosticChatInput");
      const value = input.value;
      input.value = "";
      handleMessage(value);
    });
    $("diagnosticChatReset").addEventListener("click", resetConversation);
    $("diagnosticChatAskGenerative").addEventListener("click", askGenerative);
    if (!restoreLocalAssistantSession()) resetConversation();
    initialized = true;
  }
  root.MaintenanceDiagnosticChat = Object.freeze({ init, handleMessage, reset: resetConversation, classifyInput, extractModelDesignation, normalizeLocalToolResult, getApprovedExcerpts, getConversationContext, getTechnicianChatInput, getLocalAssistantSession: () => localAssistant && localAssistant.getSession() || null });
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceDiagnosticChat;
  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
