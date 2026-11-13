(function (root) {
  "use strict";
  const $ = id => root.document && root.document.getElementById(id);
  let messages = [];
  let notes = [];
  let initialized = false;
  let started = false;
  let pendingEquipment = "";
  let pendingSymptom = "";
  let retrievalSequence = 0;

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
    { id: "low_flow", label: "تدفق ضعيف", pattern: /low\s*flow|low\s*pressure|weak\s*flow|تدفق\s*(?:ضعيف|منخفض)|ضغط\s*(?:منخفض|ضعيف)|débit\s*(?:faible|bas)|pression\s*(?:basse|faible)/i, canonical: "low flow" },
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
    messages.push({ role, text: String(text || ""), time: new Date().toISOString() });
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
    const names = session.hypotheses.slice(0, 3).map((item, index) => (index + 1) + ". " + item.label).join("\n");
    return copy("الفرضيات الحالية (ترتيب استدلالي أولي، وليس احتمالات معايرة):\n", "Current hypotheses (provisional heuristic ranking, not calibrated probabilities):\n", "Hypothèses actuelles (classement heuristique provisoire, pas des probabilités calibrées) :\n") + names;
  }
  function beginIfReady(initialText) {
    const equipment = pendingEquipment || detectEquipment(initialText);
    const symptom = pendingSymptom || detectSymptom(initialText);
    if (equipment) {
      pendingEquipment = equipment.id;
      setField("aiMachine", equipment.id);
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
      addMessage("assistant", copy("لم أجد مسارًا حواريًا مراجعًا لهذه المجموعة من المعدة والعَرَض. سأحتفظ بوصفك، لكن لن أخترع شجرة تشخيص. يمكنك استخدام التحليل العام أو إضافة حالة موثقة لاحقًا.", "No reviewed conversational flow exists for this equipment/symptom pair. I will retain your description but will not invent a diagnostic tree.", "Aucun parcours conversationnel révisé n’existe pour cet équipement et ce symptôme. Je conserve votre description sans inventer d’arbre de diagnostic."));
      return false;
    }
    addMessage("assistant", session.nextQuestion ? session.nextQuestion.text : session.summary?.message || copy("بدأت جلسة التشخيص المحلية.", "The local diagnostic session has started.", "La session de diagnostic locale a commencé."));
    const summary = renderHypothesisSummary(session);
    if (summary) addMessage("assistant", summary);
    renderReplies();
    return true;
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
    holder.textContent = copy("جارٍ البحث محليًا في الادعاءات المعتمدة…", "Searching locally among approved claims…", "Recherche locale parmi les affirmations approuvées…");
    const session = currentSession();
    const query = [pendingEquipment, pendingSymptom, $("aiCode")?.value, $("aiModel")?.value, ...notes].filter(Boolean).join(" ");
    const result = await api.forDiagnostics(query, { equipment: $("aiMachine")?.value || pendingEquipment, model: $("aiModel")?.value || "" });
    if (sequence !== retrievalSequence) return;
    holder.replaceChildren();
    if (!result.ok || !result.results.length) {
      holder.textContent = copy("لا توجد أدلة PDF معتمدة ومطابقة لهذا النطاق حاليًا. لا تُستخدم المقاطع الخام أو OCR غير المراجع.", "No approved, applicable PDF evidence was found. Raw or unreviewed OCR chunks are excluded.", "Aucune preuve PDF approuvée et applicable n’a été trouvée. Les fragments bruts ou OCR non vérifiés sont exclus.");
      return;
    }
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
  function handleMessage(text) {
    const value = String(text || "").trim();
    if (!value) return;
    addMessage("user", value);
    if (!started) {
      notes.push(value);
      beginIfReady(value);
      return;
    }
    const session = currentSession();
    if (!session || !session.nextQuestion) {
      notes.push(value);
      addMessage("assistant", copy("تم حفظ الملاحظة ضمن سياق المحادثة، لكن جلسة الأسئلة الحالية اكتملت. لا أغيّر التشخيص دون مسار أو دليل جديد.", "The note was retained in this conversation, but the current question flow is complete. I will not change the diagnostic state without a supported path or new evidence.", "La note est conservée dans cette conversation, mais le parcours actuel est terminé. Je ne modifierai pas l’analyse sans parcours pris en charge ou nouvel élément."));
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
    retrievalSequence++;
    const machine = $("aiMachine"); const symptom = $("aiSymptom");
    if (machine) machine.value = "";
    if (symptom) symptom.value = "";
    if (root.MaintenanceDiagnosticSessionUI && root.MaintenanceDiagnosticSessionUI.reset) root.MaintenanceDiagnosticSessionUI.reset();
    addMessage("assistant", copy("ابدأ بوصف المشكلة كما تراها. مثال: مضخة طرد مركزي، التدفق ضعيف والاهتزاز مرتفع.", "Describe the problem in your own words. Example: centrifugal pump, low flow and high vibration.", "Décrivez le problème avec vos mots. Exemple : pompe centrifuge, faible débit et vibrations élevées."));
    renderReplies();
    const evidence = $("diagnosticChatEvidence"); if (evidence) evidence.replaceChildren();
  }
  function init() {
    const anchor = $("dynamicSessionPanel");
    if (!anchor || $("diagnosticChat")) return;
    appendStyles();
    const panel = root.document.createElement("section");
    panel.id = "diagnosticChat";
    panel.setAttribute("aria-label", "Conversational industrial diagnosis");
    panel.innerHTML = `
      <h3>${copy("المحادثة التشخيصية", "Diagnostic conversation", "Conversation de diagnostic")}</h3>
      <p class="hint">${copy("تحدث بحرية. المحرك المحلي يحدّث الفرضيات فقط عندما يستطيع ربط إجابتك بدليل معروف. هذه نسخة حوارية أولية وليست نموذجًا لغويًا توليديًا بعد.", "Describe the issue naturally. The local engine updates hypotheses only when it can map your answer to known evidence. This is an initial conversational layer, not yet a generative language model.", "Décrivez le problème naturellement. Le moteur local ne met à jour les hypothèses que si la réponse correspond à un élément connu. Cette première version n’est pas encore un modèle génératif.")}</p>
      <div id="diagnosticChatMessages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div id="diagnosticChatReplies" aria-label="Suggested replies"></div>
      <form id="diagnosticChatForm">
        <textarea id="diagnosticChatInput" rows="2" maxlength="1500" placeholder="${copy("اكتب وصف المشكلة أو إجابتك هنا…", "Describe the problem or enter your answer…", "Décrivez le problème ou saisissez votre réponse…")}"></textarea>
        <button id="diagnosticChatSend" class="btn" type="submit">${copy("إرسال", "Send", "Envoyer")}</button>
      </form>
      <div id="diagnosticChatEvidence"></div>
      <div class="actions"><button id="diagnosticChatReset" class="btn secondary" type="button">${copy("بدء محادثة جديدة", "Start a new conversation", "Nouvelle conversation")}</button></div>
      <p class="hint">${copy("السلامة مستقلة عن المحادثة: لا تنفّذ اختبارًا أو تفتح نظامًا مضغوطًا أو لوحة كهربائية حية بناءً على الرد. اتبع LOTO وإجراءات الموقع وصعّد عند الخطر.", "Safety is independent of the conversation: do not perform a test, open a pressurized system, or access a live electrical panel based on a chat response. Follow LOTO and site procedures; escalate hazards.", "La sécurité est indépendante de la conversation : n’effectuez aucun essai et n’ouvrez aucun circuit sous pression ou armoire sous tension sur la base d’une réponse. Appliquez la consignation et les procédures du site.")}</p>
    `;
    anchor.insertAdjacentElement("afterend", panel);
    $("diagnosticChatForm").addEventListener("submit", event => {
      event.preventDefault();
      const input = $("diagnosticChatInput");
      const value = input.value;
      input.value = "";
      handleMessage(value);
    });
    $("diagnosticChatReset").addEventListener("click", resetConversation);
    resetConversation();
    initialized = true;
  }
  root.MaintenanceDiagnosticChat = Object.freeze({ init, handleMessage, reset: resetConversation });
  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
