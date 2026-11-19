(function (root) {
  "use strict";
  const MODEL_ID = "qwen3.5-0.8b-int8-cpu";
  const $ = id => root.document && root.document.getElementById(id);
  const copy = {
    ar: {title:"مساعد الصيانة المحلي — Qwen",sub:"يعمل على الهاتف دون إرسال المحادثة إلى خادم خارجي.",pick:"استيراد ملف النموذج",load:"تحميل النموذج",fresh:"جلسة جديدة",send:"إرسال إلى Qwen المحلي",placeholder:"صف العطل أو أضف القياسات المتاحة…",ready:"النموذج المحلي جاهز • CPU",missing:"افتح التطبيق من نسخة Android المحلية لاستخدام LiteRT-LM.",notLoaded:"استورد ملف .litertlm ثم حمّل النموذج.",busy:"جارٍ التحليل على الهاتف…",empty:"اكتب وصف العطل أولًا.",error:"تعذّر إكمال الطلب المحلي: ",tools:"الأدوات المحلية مسموحة عبر القائمة المقيدة فقط."},
    en: {title:"Local maintenance assistant — Qwen",sub:"Runs on this phone. Conversation data is not sent to a hosted model.",pick:"Import model file",load:"Load model",fresh:"New session",send:"Send to local Qwen",placeholder:"Describe the fault or add available readings…",ready:"Local model ready • CPU",missing:"Open the Android host app to use LiteRT-LM.",notLoaded:"Import a .litertlm file, then load the model.",busy:"Analyzing on this phone…",empty:"Enter a fault description first.",error:"Local request failed: ",tools:"Only allow-listed local tools can be called."},
    fr: {title:"Assistant de maintenance local — Qwen",sub:"Fonctionne sur ce téléphone. Aucune conversation n'est envoyée à un modèle hébergé.",pick:"Importer le modèle",load:"Charger le modèle",fresh:"Nouvelle session",send:"Envoyer à Qwen local",placeholder:"Décrivez la panne ou ajoutez les mesures disponibles…",ready:"Modèle local prêt • CPU",missing:"Ouvrez l'application hôte Android pour utiliser LiteRT-LM.",notLoaded:"Importez un fichier .litertlm puis chargez le modèle.",busy:"Analyse sur le téléphone…",empty:"Saisissez d'abord la panne.",error:"Échec de la requête locale : ",tools:"Seuls les outils locaux autorisés sont appelables."}
  };

  function language() {
    const value = root.MaintenanceI18n && root.MaintenanceI18n.getLanguage
      ? root.MaintenanceI18n.getLanguage() : (root.document.documentElement.lang || "ar");
    return copy[value] ? value : "ar";
  }
  function caseContext() {
    const api = root.MaintenanceAssistantCaseContext;
    if (!api || typeof api.createCaseContext !== "function") {
      throw new Error("assistant_case_context_unavailable");
    }
    const value = id => String(($(id) && $(id).value) || "").trim();
    const selectedLabel = id => {
      const element = $(id);
      return element && element.options && element.selectedIndex >= 0
        ? String(element.options[element.selectedIndex].text || "").trim() : "";
    };
    return api.createCaseContext({
      equipmentType: value("aiMachine") || selectedLabel("machine") || value("machine"),
      manufacturer: value("aiManufacturer") || value("manufacturer"),
      model: value("equipmentModel") || value("aiModel"),
      assetId: value("assetId"),
      symptom: value("aiSymptom") || selectedLabel("symptom"),
      alarmCode: value("aiCode") || value("code"),
      observations: value("aiObservations") || value("observations"),
      measurementStatus: value("aiMeasurementStatus") || "unknown",
      measurementText: value("aiMeasurementReadings"),
      guidedDiagnostic: root.MaintenanceDiagnosticSessionUI &&
        typeof root.MaintenanceDiagnosticSessionUI.getPayload === "function"
        ? root.MaintenanceDiagnosticSessionUI.getPayload() : null
    });
  }

  function mount() {
    const target = $("ai");
    if (!target || $("localModelAssistant")) return;
    const lang = language();
    const t = copy[lang];
    const panel = root.document.createElement("section");
    panel.className = "card";
    panel.id = "localModelAssistant";
    target.classList.add("local-only-mode");
    panel.innerHTML = '<h2></h2><p class="hint" id="localModelSub"></p>' +
      '<div class="actions"><button type="button" class="btn secondary" id="localModelPick"></button>' +
      '<button type="button" class="btn" id="localModelLoad" disabled></button>' +
      '<button type="button" class="btn secondary" id="localModelNew"></button></div>' +
      '<p class="hint" id="localModelStatus" role="status" aria-live="polite"></p>' +
      '<div id="localModelMessages" class="result" aria-live="polite" style="white-space:pre-wrap;max-height:360px;overflow:auto"></div>' +
      '<label for="localModelInput">Message</label><textarea id="localModelInput" rows="4" maxlength="4000"></textarea>' +
      '<div class="actions"><button type="button" class="btn" id="localModelSend" disabled></button></div>' +
      '<p class="hint"></p>';
    const heading = panel.querySelector("h2");
    heading.textContent = t.title;
    panel.querySelector("#localModelSub").textContent = t.sub;
    panel.querySelector("#localModelPick").textContent = t.pick;
    panel.querySelector("#localModelLoad").textContent = t.load;
    panel.querySelector("#localModelNew").textContent = t.fresh;
    panel.querySelector("#localModelSend").textContent = t.send;
    panel.querySelector("#localModelInput").placeholder = t.placeholder;
    panel.querySelector("p.hint:last-child").textContent = t.tools;
    target.insertBefore(panel, target.firstChild);

    // This branch is local-only: remove hosted-provider actions and copy.
    const intro = target.querySelector("#aiForm > p.hint");
    if (intro) intro.textContent = lang === "en"
      ? "Qwen and the diagnostic tools run on this device. Case data is not sent to a hosted model."
      : lang === "fr"
        ? "Qwen et les outils de diagnostic fonctionnent sur cet appareil. Aucune donnée n’est envoyée à un modèle hébergé."
        : "يعمل Qwen وأدوات التشخيص على هذا الجهاز. لا تُرسل بيانات الحالة إلى نموذج مستضاف.";
    const navLink = root.document.querySelector('[data-go="ai"]');
    if (navLink) {
      const label = navLink.querySelector("b");
      const hint = navLink.querySelector("small");
      if (label) label.textContent = lang === "en" ? "Local assistant" : lang === "fr" ? "Assistant local" : "المساعد المحلي";
      if (hint) hint.textContent = lang === "en" ? "On-device Qwen and diagnostic tools" : lang === "fr" ? "Qwen et outils locaux sur l’appareil" : "Qwen ومحرك التشخيص على الهاتف";
    }
    root.document.querySelectorAll('[data-ux-key="howAI"]').forEach(node => {
      node.textContent = lang === "en"
        ? "Qwen interprets the case and invokes allow-listed local diagnostic tools; no cloud provider is used."
        : lang === "fr"
          ? "Qwen interprète le cas et appelle les outils locaux autorisés ; aucun fournisseur cloud n’est utilisé."
          : "يفهم Qwen الحالة ويستدعي أدوات التشخيص المحلية المسموحة؛ لا يُستخدم أي مزود سحابي.";
    });
    const consent = $("aiCloudConsent");
    if (consent) { consent.checked = false; consent.disabled = true; const label = consent.closest("label"); if (label) label.hidden = true; }
    ["askCloudAI","simulateCloudAI","askAi","aiAnswerTools","aiResult"].forEach(id => { if ($(id)) { $(id).hidden = true; if ("disabled" in $(id)) $(id).disabled = true; } });

    let runtime = null;
    let orchestrator = null;
    let agent = null;
    let busy = false;

    function createAgent() {
      const toolApi = root.MaintenanceLocalAssistantTools;
      const orchestratorApi = root.MaintenanceLocalAssistantOrchestrator;
      if (!toolApi || !orchestratorApi || !root.MaintenanceLocalModelAgent) {
        throw new Error("local_assistant_modules_unavailable");
      }
      const localTools = toolApi.createLocalTools({
        getGuidedContext: () => caseContext().guidedDiagnostic
      });
      orchestrator = orchestratorApi.createLocalOrchestrator({
        tools: localTools.tools,
        safetyGate: localTools.safetyGate,
        timeoutMs: 20000
      });
      const context = caseContext();
      orchestrator.start({
        sessionId:"qwen-" + Date.now().toString(36),
        language:lang,
        equipment:{type:context.equipment.type,manufacturer:context.equipment.manufacturer,model:context.equipment.model}
      });
      const catalog = [
        {name:"diagnose",description:"Run the deterministic local industrial diagnostic engine. Input: {equipment:{type,manufacturer?,model?}, symptom, language, intent:'diagnose', observations:string[], measurements:[{name,value,unit}]}. Include only readings explicitly supplied by the technician; omit unknown measurements. Returns ranked preliminary hypotheses, evidence and advisory safety notices.",inputSchema:{type:"object",required:["equipment","symptom"],properties:{equipment:{type:"object",required:["type"],properties:{type:{type:"string"},manufacturer:{type:"string"},model:{type:"string"}}},symptom:{type:"string"},language:{enum:["ar","fr","en"]},intent:{const:"diagnose"},observations:{type:"array",items:{type:"string"}},measurements:{type:"array",items:{type:"object",required:["name","value","unit"],properties:{name:{type:"string"},value:{type:["number","string"]},unit:{type:"string"},source:{type:"string"},sourceLabel:{type:["string","null"]},timestamp:{type:["string","null"]},operatingConditions:{type:"string"},sensorStatus:{type:"string"},quality:{type:"string"}}}}}}},
        {name:"searchReviewedDocuments",description:"Search locally stored PDF/manual text and page references. Input: {query:string, context?:object}. Results include reviewStatus and eligibility: use only approved excerpts with eligibleForDiagnosis=true as verified diagnostic evidence; label other passages as unreviewed candidates.",inputSchema:{type:"object",required:["query"],properties:{query:{type:"string"},context:{type:"object"}}}},
        {name:"getMaintenanceHistory",description:"Read matching maintenance records stored locally. Input: {query?:string,equipment?:object,limit?:number}.",inputSchema:{type:"object",properties:{query:{type:"string"},equipment:{type:"object"},limit:{type:"integer",minimum:1,maximum:20}}}}
      ];
      agent = root.MaintenanceLocalModelAgent.createLocalModelAgent({
        runtime, orchestrator, tools:catalog,
        getContext: async () => caseContext(),
        systemInstruction: lang === "en"
          ? "You are a local industrial maintenance assistant. Answer in the user's language. Separate confirmed observations and measurements from hypotheses and unknowns. Never invent readings, page numbers, OEM references or numerical probabilities. Use only the supplied allow-listed local tools. Treat only approved excerpts with eligibleForDiagnosis=true as verified diagnostic evidence; label unreviewed passages as candidates. Ask one high-value diagnostic question when evidence is insufficient. Do not rule out faults solely because vibration is absent or motor speed is stable. Safety notices are advisory; never imply that the app verified isolation or authorized work. Return exactly one JSON object: {\"type\":\"final\",\"text\":\"...\"} or {\"type\":\"tool_call\",\"name\":\"...\",\"input\":{...}}."
          : lang === "fr"
          ? "Vous êtes un assistant local de maintenance industrielle. Répondez dans la langue de l'utilisateur. Distinguez les observations et mesures confirmées des hypothèses et inconnues. N'inventez jamais de mesures, pages, références constructeur ou probabilités numériques. Utilisez uniquement les outils locaux autorisés. Considérez uniquement les extraits approuvés avec eligibleForDiagnosis=true comme preuves diagnostiques vérifiées; signalez les autres passages comme non vérifiés. Posez une question de diagnostic à forte valeur lorsque les preuves sont insuffisantes. N'écartez pas une panne uniquement parce qu'il n'y a pas de vibration ou que la vitesse moteur est stable. Les avertissements de sécurité sont consultatifs; ne prétendez jamais que l'application a vérifié la consignation ou autorisé le travail. Retournez exactement un objet JSON : {\"type\":\"final\",\"text\":\"...\"} ou {\"type\":\"tool_call\",\"name\":\"...\",\"input\":{...}}."
          : "أنت مساعد صيانة صناعية يعمل محليًا. أجب بلغة المستخدم. افصل القياسات والملاحظات المؤكدة عن الفرضيات والمعلومات المجهولة. لا تخترع قيمًا أو صفحات أو مراجع مصنع أو احتمالات رقمية. استخدم الأدوات المحلية المسموحة فقط. لا تعتبر دليلاً تشخيصيًا موثقًا إلا المقتطفات المعتمدة ذات eligibleForDiagnosis=true؛ وصنّف المقاطع غير المعتمدة كمادة مرشحة غير متحققة. واطلب معلومة واحدة ذات قيمة تشخيصية عندما لا تكفي البيانات. لا تستبعد عطلًا بسبب غياب الاهتزاز أو ثبات السرعة. تحذيرات السلامة استشارية؛ لا توحِ بأن التطبيق تحقق من العزل أو منح تصريح عمل. أعد كائن JSON واحدًا فقط: {\"type\":\"final\",\"text\":\"...\"} أو {\"type\":\"tool_call\",\"name\":\"...\",\"input\":{...}}."
      });
    }

    function showHistory() {
      const box = $("localModelMessages");
      if (!box || !orchestrator) return;
      const session = orchestrator.getSession();
      box.textContent = (session.messages || []).filter(m => m.role === "user" || m.role === "assistant" || m.role === "tool")
        .map(m => (m.role === "user" ? "أنت: " : m.role === "tool" ? "نتيجة أداة محلية: " : "Qwen: ") + m.content).join("\n\n");
      box.scrollTop = box.scrollHeight;
    }

    async function refreshStatus() {
      const status = $("localModelStatus");
      const load = $("localModelLoad");
      const send = $("localModelSend");
      try {
        const state = await runtime.getStatus();
        if (!state.available) {
          status.textContent = t.missing;
          load.disabled = true; send.disabled = true;
        } else if (state.modelLoaded) {
          status.textContent = t.ready;
          load.disabled = false; send.disabled = false;
        } else {
          status.textContent = t.notLoaded;
          load.disabled = false; send.disabled = true;
        }
      } catch (_) {
        status.textContent = t.missing;
        load.disabled = true; send.disabled = true;
      }
    }

    $("localModelPick").addEventListener("click", async () => {
      try {
        if (!root.MaintenanceNativeLLM || typeof root.MaintenanceNativeLLM.pickModel !== "function")
          throw new Error("android_local_host_required");
        $("localModelStatus").textContent = "اختر ملف Qwen .litertlm من ذاكرة الهاتف.";
        await root.MaintenanceNativeLLM.pickModel();
        $("localModelStatus").textContent = "تم استيراد الملف. اضغط تحميل النموذج.";
        $("localModelLoad").disabled = false;
      } catch (error) {
        $("localModelStatus").textContent = t.error + (error.code || error.message || "unknown");
      }
    });
    $("localModelLoad").addEventListener("click", async () => {
      $("localModelLoad").disabled = true;
      $("localModelStatus").textContent = "جارٍ التحقق وتحميل Qwen على CPU…";
      try {
        await runtime.loadModel(MODEL_ID, {backend:"CPU"});
        createAgent();
        $("localModelStatus").textContent = t.ready;
        $("localModelSend").disabled = false;
        showHistory();
      } catch (error) {
        $("localModelStatus").textContent = t.error + (error.code || error.message || "unknown");
        $("localModelLoad").disabled = false;
      }
    });
    $("localModelNew").addEventListener("click", () => {
      try { createAgent(); showHistory(); $("localModelSend").disabled = false; }
      catch (error) { $("localModelStatus").textContent = t.error + (error.message || "unknown"); }
    });
    async function send() {
      const input = $("localModelInput");
      const message = input.value.trim();
      if (!message) { $("localModelStatus").textContent = t.empty; return; }
      if (busy || !agent) return;
      busy = true;
      $("localModelSend").disabled = true;
      $("localModelStatus").textContent = t.busy;
      try {
        const result = await agent.runTurn({message});
        showHistory();
        if (!result || result.ok !== true) {
          $("localModelStatus").textContent = t.error + (result && result.error || result && result.status || "unknown");
        } else {
          $("localModelStatus").textContent = t.ready;
          input.value = "";
        }
      } catch (error) {
        $("localModelStatus").textContent = t.error + (error.code || error.message || "unknown");
      } finally {
        busy = false;
        $("localModelSend").disabled = false;
      }
    }
    $("localModelSend").addEventListener("click", send);
    $("localModelInput").addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); }
    });

    try {
      if (!root.MaintenanceLocalLlmRuntime) throw new Error("local_runtime_adapter_unavailable");
      runtime = root.MaintenanceLocalLlmRuntime.createLocalLlmRuntime();
      createAgent();
      refreshStatus();
    } catch (error) {
      $("localModelStatus").textContent = t.missing;
      $("localModelLoad").disabled = true;
      $("localModelSend").disabled = true;
    }
  }

  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", mount, {once:true});
    else mount();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
