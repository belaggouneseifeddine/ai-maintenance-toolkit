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
    const value = id => ($(id) && $(id).value || "").trim().slice(0, 3000);
    return {
      equipment: { type:value("aiMachine"), manufacturer:value("aiManufacturer"), model:value("aiModel") },
      symptom:value("aiSymptom"), alarmCode:value("aiCode"),
      observations:value("aiObservations"), measurementStatus:value("aiMeasurementStatus"),
      measurements:value("aiMeasurementReadings"),
      guidedDiagnostic: root.MaintenanceDiagnosticSessionUI &&
        typeof root.MaintenanceDiagnosticSessionUI.getPayload === "function"
        ? root.MaintenanceDiagnosticSessionUI.getPayload() : null
    };
  }

  function mount() {
    const target = $("ai");
    if (!target || $("localModelAssistant")) return;
    const lang = language();
    const t = copy[lang];
    const panel = root.document.createElement("section");
    panel.className = "card";
    panel.id = "localModelAssistant";
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

    // This branch is local-only: hide the legacy hosted-provider controls.
    const consent = $("aiCloudConsent");
    if (consent) { consent.checked = false; consent.disabled = true; const label = consent.closest("label"); if (label) label.hidden = true; }
    ["askCloudAI","simulateCloudAI"].forEach(id => { if ($(id)) { $(id).hidden = true; $(id).disabled = true; } });

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
        {name:"diagnose",description:"Run the deterministic local industrial diagnostic engine. Input: {equipment:{type,manufacturer?,model?}, symptom, language, intent:'diagnose', observations:string[], measurements?:array}. Returns ranked preliminary hypotheses, evidence and safety notices.",inputSchema:{type:"object",required:["equipment","symptom"],properties:{equipment:{type:"object",required:["type"]},symptom:{type:"string"},language:{enum:["ar","fr","en"]},intent:{const:"diagnose"},observations:{type:"array",items:{type:"string"}},measurements:{type:"array"}}}},
        {name:"searchReviewedDocuments",description:"Search only locally stored reviewed PDF/manual evidence. Input: {query:string, context?:object}. Use when a manual reference or page evidence could answer the question.",inputSchema:{type:"object",required:["query"],properties:{query:{type:"string"},context:{type:"object"}}}},
        {name:"rankNextDiagnosticTests",description:"Rank candidate measurements by expected information gain. Input: {hypotheses:[...], tests:[...]}. Do not invent likelihood sources.",inputSchema:{type:"object",required:["hypotheses","tests"],properties:{hypotheses:{type:"array"},tests:{type:"array"}}}},
        {name:"getMaintenanceHistory",description:"Read matching maintenance records stored locally. Input: {query?:string,equipment?:object,limit?:number}.",inputSchema:{type:"object",properties:{query:{type:"string"},equipment:{type:"object"},limit:{type:"integer",minimum:1,maximum:20}}}}
      ];
      agent = root.MaintenanceLocalModelAgent.createLocalModelAgent({
        runtime, orchestrator, tools:catalog,
        getContext: async () => caseContext(),
        systemInstruction:"أنت مساعد صيانة صناعية يعمل محليًا. أجب بلغة المستخدم. افصل القياسات والملاحظات المؤكدة عن الفرضيات والمعلومات المجهولة. لا تخترع قيمًا أو صفحات أو مراجع مصنع أو احتمالات رقمية. استخدم الأدوات المحلية المسموحة عند الحاجة، واطلب معلومة واحدة ذات قيمة تشخيصية عندما لا تكفي البيانات. لا تعتبر غياب الاهتزاز أو ثبات السرعة دليل استبعاد قاطع. تحذيرات السلامة استشارية ولا تمنع عرض المعلومات التشخيصية؛ لا توحِ بأن التطبيق منح تصريح عمل أو تحقق من العزل. أعد كائن JSON واحدًا فقط: {\"type\":\"final\",\"text\":\"...\"} أو {\"type\":\"tool_call\",\"name\":\"...\",\"input\":{...}}."
      });
    }

    function showHistory() {
      const box = $("localModelMessages");
      if (!box || !orchestrator) return;
      const session = orchestrator.getSession();
      box.textContent = (session.messages || []).filter(m => m.role === "user" || m.role === "assistant")
        .map(m => (m.role === "user" ? "أنت: " : "Qwen: ") + m.content).join("\n\n");
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
