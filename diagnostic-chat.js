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
    if (!Session || typeof Session.validateSession !== "function" ||
        !Session.validateSession(snapshot.session).ok) return false;
    const chat = snapshot.chat;
    pendingEquipment = typeof chat.pendingEquipment === "string" ? chat.pendingEquipment.slice(0, 120) : "";
    pendingSymptom = typeof chat.pendingSymptom === "string" ? chat.pendingSymptom.slice(0, 120) : "";
    equipmentContext = typeof chat.equipmentContext === "string" ? chat.equipmentContext.slice(0, 160) : "";
    notes = Array.isArray(chat.notes) ? chat.notes.filter(item => typeof item === "string").slice(-30) : [];
    const equipment = snapshot.session.equipment || {};
    setField("aiMachine", equipmentContext || equipment.type || "");
    setField("aiManufacturer", equipment.manufacturer || "");
    setField("aiModel", equipment.model || "");
    setField("aiSymptom", pendingSymptom || "");
    startLocalAssistantSession(snapshot.session);
    if (!localAssistant) return false;
    messages = snapshot.session.messages
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
    if (!diagnosis || diagnosis.matched !== true || !Array.isArray(diagnosis.results) || !diagnosis.results.length) {
      return (diagnosis && diagnosis.message ? diagnosis.message + "\n" : "") +
        (diagnosis && diagnosis.reason ? diagnosis.reason : copy("لم تتوفر مطابقة كافية. أضف قياسات أو راجع الدليل المعتمد.", "No sufficient match. Add measurements or consult an approved manual.", "Correspondance insuffisante. Ajoutez des mesures ou consultez un manuel approuvé."));
    }
    const lines = [copy("تقييم محلي أولي — هذه احتمالات وليست سببًا مؤكدًا.", "Preliminary local assessment — these are possibilities, not a confirmed cause.", "Évaluation locale préliminaire — possibilités, pas une cause confirmée.")];
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
    lines.push("", copy("نقاط المطابقة ليست احتمالات إحصائية. لا تنفذ أي تدخل قبل مراجعة دليل المصنع وإجراءات السلامة.", "Match scores are not statistical probabilities. Verify the OEM manual and safety procedures before intervention.", "Les scores ne sont pas des probabilités statistiques. Vérifiez le manuel constructeur et les procédures de sécurité avant intervention."));
    return lines.join("\n");
  }

  async function runLocalDiagnosticAssessment() {
    if (!localAssistant || typeof localAssistant.invokeTool !== "function") return;
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
      measurements: [],
      consent: { sendToAI: false }
    };
    const result = await localAssistant.invokeTool("diagnose", { request });
    if (result.status === "blocked") {
      addMessage("assistant", copy("بوابة السلامة المحلية أوقفت التشخيص الآلي لهذه المدخلات. أوقف العمل عند وجود خطر، واتبع LOTO وإجراءات الموقع وصعّد للمسؤول المؤهل.", "The local safety gate blocked automated diagnosis for this input. Stop work if a hazard is present, follow LOTO and site procedures, and escalate to qualified personnel.", "La barrière de sécurité locale a bloqué le diagnostic automatique. Arrêtez le travail en cas de danger, appliquez la consignation et faites remonter au personnel qualifié."));
      return;
    }
    if (!result.ok) {
      addMessage("assistant", copy("تعذر تشغيل محرك التشخيص المحلي. بقيت المحادثة وسجلها المحلي متاحين دون إرسال خارجي.", "The local diagnostic engine could not run. The conversation and local history remain available; nothing was sent externally.", "Le moteur de diagnostic local n’a pas pu s’exécuter. La conversation et son historique local restent disponibles ; aucune donnée n’a été envoyée."));
      return;
    }
    addMessage("assistant", formatLocalDiagnosis(result.data));
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
    holder.replaceChildren();
    const button = root.document.createElement("button");
    button.type = "button";
    button.className = "btn secondary";
    button.textContent = copy("استرجاع الأدلة المعتمدة من PDF", "Retrieve approved PDF evidence", "Récupérer les preuves PDF approuvées");
    button.addEventListener("click", retrieveEvidence);
    holder.appendChild(button);
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
    const result = localAssistant && typeof localAssistant.invokeTool === "function"
      ? await localAssistant.invokeTool("searchReviewedDocuments", retrievalInput)
      : await api.forDiagnostics(query, retrievalInput.context);
    if (sequence !== retrievalSequence) return;
    holder.replaceChildren();
    if (!result.ok || !result.results.length) {
      holder.textContent = copy("لا توجد أدلة PDF معتمدة ومطابقة لهذا النطاق حاليًا. لا تُستخدم المقاطع الخام أو OCR غير المراجع.", "No approved, applicable PDF evidence was found. Raw or unreviewed OCR chunks are excluded.", "Aucune preuve PDF approuvée et applicable n’a été trouvée. Les fragments bruts ou OCR non vérifiés sont exclus.");
      return;
    }
    retrievedExcerpts = result.results.slice(0, 3).map(item => ({
      documentTitle: String(item.documentTitle || "PDF").slice(0, 160),
      citation: String(item.citation || "").slice(0, 240),
      text: String(item.text || "").slice(0, 350)
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

  function handleMessage(text) {
    const value = String(text || "").trim();
    if (!value) return;
    clearRetrievedExcerpts();
    addMessage("user", value);
    if (isMaintenanceHistoryRequest(value)) {
      answerMaintenanceHistoryRequest(value).catch(() => {
        addMessage("assistant", copy("حدث خطأ أثناء قراءة السجل المحلي.", "An error occurred while reading the local log.", "Une erreur est survenue lors de la lecture du journal local."));
      });
      return;
    }
    const modelMatch = value.match(/(?:\bmodel\b|موديل|الموديل|طراز|modèle)\s*[:：]\s*([^,،;؛\n]{2,80})/i);
    if (modelMatch) setField("aiModel", modelMatch[1].trim());
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
        await runLocalDiagnosticAssessment();
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
  root.MaintenanceDiagnosticChat = Object.freeze({ init, handleMessage, reset: resetConversation, classifyInput, extractModelDesignation, getApprovedExcerpts, getConversationContext, getTechnicianChatInput, getLocalAssistantSession: () => localAssistant && localAssistant.getSession() || null });
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceDiagnosticChat;
  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
