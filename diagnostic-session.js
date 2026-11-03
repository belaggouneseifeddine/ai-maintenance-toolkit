/* Dynamic, evidence-led diagnostic sessions. Offline-first; no calibrated probabilities. */
(function (root) {
  "use strict";
  const VERSION = "0.3.0";
  const FLOWS = {
    "pump|low_flow": {
      equipment: "pump", symptom: "low_flow",
      hypotheses: [
        { id:"supply_or_suction", label:{ar:"تغذية المصدر أو ظروف السحب",en:"Supply or suction conditions",fr:"Alimentation ou conditions d’aspiration"}, evidenceFor:["source-low","source-unstable"], evidenceAgainst:["source-normal"], checks:["راجع مستوى المصدر وقراءات السحب المتاحة مقارنة بخط الأساس؛ لا تفتح خطًا مضغوطًا."] },
        { id:"flow_path_restriction", label:{ar:"تقييد في مسار التدفق أو وضع صمام",en:"Flow-path restriction or valve position",fr:"Restriction du circuit ou position de vanne"}, evidenceFor:["restriction-indicated","valve-position-abnormal"], evidenceAgainst:["path-indicators-normal"], checks:["راجع مؤشرات الخط ووضع الصمامات من مكان آمن؛ لا تغيّر الوضع دون تصريح."] },
        { id:"operating_condition", label:{ar:"ظروف تشغيل أو طلب غير معتاد",en:"Unusual operating condition or demand",fr:"Condition de fonctionnement ou demande inhabituelle"}, evidenceFor:["demand-changed","operating-point-changed"], evidenceAgainst:["demand-unchanged"], checks:["قارن ظروف التشغيل والطلب بقراءات سابقة في ظروف متقاربة وبمنحنى المضخة الصحيح."] }
      ],
      questions: [
        { id:"source_status", text:{ar:"ما حالة مستوى المصدر أو ضغط السحب حسب المؤشرات المتاحة؟",en:"What do available source-level or suction-pressure indicators show?",fr:"Que montrent les indicateurs disponibles du niveau source ou de la pression d’aspiration ?"}, options:[
          {id:"source-low",label:{ar:"منخفض",en:"Low",fr:"Bas"}, evidence:["source-low"]},
          {id:"source-unstable",label:{ar:"غير مستقر",en:"Unstable",fr:"Instable"},evidence:["source-unstable"]},
          {id:"source-normal",label:{ar:"طبيعي حسب خط الأساس",en:"Normal against baseline",fr:"Normal par rapport à la référence"},evidence:["source-normal"]},
          {id:"unknown",label:{ar:"لا توجد قراءة موثوقة",en:"No reliable reading available",fr:"Aucune mesure fiable disponible"},evidence:[]}
        ]},
        {id:"flow_path_status",text:{ar:"ماذا تُظهر مؤشرات مسار التدفق ووضع الصمامات من مكان آمن؟",en:"What do safe, available flow-path and valve-position indicators show?",fr:"Que montrent les indicateurs disponibles du circuit et des positions de vannes, depuis un endroit sûr ?"},options:[
          {id:"restriction-indicated",label:{ar:"يوجد مؤشر على تقييد أو وضع غير طبيعي",en:"Restriction or abnormal position indicated",fr:"Restriction ou position anormale indiquée"},evidence:["restriction-indicated"]},
          {id:"path-indicators-normal",label:{ar:"المؤشرات طبيعية",en:"Indicators appear normal",fr:"Indicateurs apparemment normaux"},evidence:["path-indicators-normal"]},
          {id:"unknown",label:{ar:"غير معروف / لا توجد مؤشرات",en:"Unknown / no indicators",fr:"Inconnu / aucun indicateur"},evidence:[]}
        ]},
        {id:"operating_context",text:{ar:"هل تغيّر الطلب أو ظروف التشغيل مقارنة بالفترة التي كان فيها التدفق طبيعيًا؟",en:"Has demand or operating context changed since flow was normal?",fr:"La demande ou les conditions ont-elles changé depuis que le débit était normal ?"},options:[
          {id:"demand-changed",label:{ar:"نعم، تغيّر",en:"Yes, changed",fr:"Oui, changé"},evidence:["demand-changed"]},
          {id:"demand-unchanged",label:{ar:"لا، لم يتغير بوضوح",en:"No clear change",fr:"Aucun changement évident"},evidence:["demand-unchanged"]},
          {id:"unknown",label:{ar:"لا أعرف",en:"Not known",fr:"Inconnu"},evidence:[]}
        ]}
      ]
    },
    "motor|not_start": {
      equipment:"motor", symptom:"not_start",
      hypotheses:[
        {id:"command_or_permissive",label:{ar:"أمر تشغيل أو شرط سماح غير متحقق",en:"Start command or permissive not satisfied",fr:"Commande ou autorisation de démarrage absente"},evidenceFor:["no-start-command","permissive-block"],evidenceAgainst:["command-present"],checks:["راجع حالة الأمر والإنذارات من واجهة التحكم المصرح بها؛ لا تتجاوز دوائر السماح."]},
        {id:"protection_or_drive_trip",label:{ar:"إنذار أو فصل في الحماية/المغير",en:"Protection or drive trip",fr:"Déclenchement de protection ou variateur"},evidenceFor:["trip-present"],evidenceAgainst:["no-trip-indicated"],checks:["احفظ رمز الإنذار وسجل الأحداث وطراز المغير قبل أي إعادة ضبط؛ لا تكرر محاولات التشغيل دون معرفة السبب."]},
        {id:"power_or_mechanical",label:{ar:"دائرة قدرة أو حمل ميكانيكي — يحتاج فحصًا مؤهلًا",en:"Power circuit or mechanical load — qualified inspection needed",fr:"Circuit de puissance ou charge mécanique — contrôle qualifié requis"},evidenceFor:["command-present","no-trip-indicated"],evidenceAgainst:[],checks:["اطلب فحصًا من شخص مؤهل وفق العزل والتحقق من الطاقة؛ لا تفتح لوحة حية أو تحاول تدوير المعدة يدويًا."]}
      ],
      questions:[
        {id:"control_state",text:{ar:"ماذا تظهر واجهة التحكم بشأن أمر التشغيل والإنذار؟",en:"What does the control interface show about the start command and alarm?",fr:"Que montre l’interface de commande concernant l’ordre de marche et l’alarme ?"},options:[
          {id:"no-start-command",label:{ar:"لا يوجد أمر تشغيل",en:"No start command",fr:"Aucun ordre de marche"},evidence:["no-start-command"]},
          {id:"permissive-block",label:{ar:"أمر التشغيل مطلوب لكن شرط السماح غير متحقق",en:"Start requested but a permissive is not satisfied",fr:"Démarrage demandé mais une autorisation manque"},evidence:["permissive-block"]},
          {id:"trip-present",label:{ar:"أمر موجود مع إنذار أو فصل",en:"Command present with alarm/trip",fr:"Ordre présent avec alarme/déclenchement"},evidence:["trip-present","command-present"]},
          {id:"command-present",label:{ar:"أمر موجود ولا يظهر إنذار",en:"Command present, no alarm shown",fr:"Ordre présent, aucune alarme affichée"},evidence:["command-present","no-trip-indicated"]},
          {id:"unknown",label:{ar:"غير معروف",en:"Unknown",fr:"Inconnu"},evidence:[]}
        ]}
      ]
    },
    "compressor|low_pressure": {
      equipment:"compressor", symptom:"low_pressure",
      hypotheses:[
        {id:"compressor_capacity_or_control",label:{ar:"أداء الضاغط أو حالة التحكم/الحماية",en:"Compressor capacity or control/protection state",fr:"Capacité du compresseur ou état de commande/protection"},evidenceFor:["compressor-outlet-low","unloaded-or-trip","compressor-control-abnormal"],evidenceAgainst:["outlet-normal","loaded-no-trip"],checks:["راجع سجل الضغط والإنذارات وحالة التحميل من المؤشرات المتاحة؛ لا تغيّر نقاط الضبط أو وسائل الحماية. أي فحص داخلي أو كهربائي يتطلب عزلًا وشخصًا مؤهلًا."]},
        {id:"distribution_leak_or_demand",label:{ar:"شبكة التوزيع أو تسرب أو تغير الطلب",en:"Distribution network, leakage, or changed demand",fr:"Réseau de distribution, fuite ou variation de la demande"},evidenceFor:["outlet-normal-point-low","demand-high","leak-indicated"],evidenceAgainst:["pressures-similar","demand-baseline"],checks:["قارن الضغط عند نقاط قياس معتمدة وفي ظروف حمل متقاربة؛ وثّق مؤشرات التسرب من الخارج فقط. لا تفك خطوطًا أو وصلات مضغوطة."]},
        {id:"air_treatment_restriction",label:{ar:"تقييد في المرشحات أو معالجة الهواء",en:"Filter or air-treatment restriction",fr:"Restriction des filtres ou du traitement d’air"},evidenceFor:["treatment-dp-high","filter-alert","dryer-restriction"],evidenceAgainst:["treatment-indicators-normal"],checks:["راجع مؤشرات فرق الضغط والإنذارات وسجل الصيانة للمرشحات والمجفف؛ لا تفتح أوعية الضغط أو تصرّف المكثفات إلا وفق إجراء المصنع والعزل."]}
      ],
      questions:[
        {id:"compressor_pressure_comparison",text:{ar:"أين تظهر قراءة الضغط المنخفض مقارنة بقراءات موثوقة في ظروف حمل متقاربة؟",en:"Where is low pressure observed compared with reliable readings under similar load conditions?",fr:"Où la basse pression est-elle observée par rapport à des mesures fiables sous une charge comparable ?"},options:[
          {id:"compressor-outlet-low",label:{ar:"ضغط مخرج الضاغط منخفض",en:"Compressor outlet pressure is low",fr:"La pression de sortie du compresseur est basse"},evidence:["compressor-outlet-low"]},
          {id:"outlet-normal-point-low",label:{ar:"ضغط المخرج طبيعي لكن نقطة الاستخدام منخفضة",en:"Outlet pressure is normal but point-of-use pressure is low",fr:"La pression de sortie est normale mais celle au point d’utilisation est basse"},evidence:["outlet-normal-point-low"]},
          {id:"pressures-similar",label:{ar:"القراءات متقاربة ولا يظهر فرق واضح",en:"Readings are similar; no clear pressure drop is observed",fr:"Les mesures sont similaires, sans chute nette observée"},evidence:["pressures-similar"]},
          {id:"unknown",label:{ar:"لا توجد قراءات مقارنة موثوقة",en:"No reliable comparative readings are available",fr:"Aucune mesure comparative fiable n’est disponible"},evidence:[]}
        ]},
        {id:"compressor_operating_state",text:{ar:"ماذا تُظهر واجهة الضاغط عن حالة التحميل والإنذارات؟",en:"What does the compressor interface show about load state and alarms?",fr:"Que montre l’interface du compresseur concernant la charge et les alarmes ?"},options:[
          {id:"unloaded-or-trip",label:{ar:"الضاغط غير محمّل أو يوجد فصل/إنذار",en:"Compressor is unloaded or a trip/alarm is present",fr:"Le compresseur est déchargé ou une alarme/un déclenchement est présent"},evidence:["unloaded-or-trip"]},
          {id:"compressor-control-abnormal",label:{ar:"حالة التحكم أو التسلسل غير طبيعية",en:"Control state or sequencing appears abnormal",fr:"L’état de commande ou la séquence semble anormal"},evidence:["compressor-control-abnormal"]},
          {id:"loaded-no-trip",label:{ar:"الضاغط محمّل ولا يظهر إنذار",en:"Compressor is loaded and no alarm is shown",fr:"Le compresseur est en charge et aucune alarme n’est affichée"},evidence:["loaded-no-trip"]},
          {id:"unknown",label:{ar:"الحالة غير معروفة",en:"State is unknown",fr:"État inconnu"},evidence:[]}
        ]},
        {id:"air_treatment_indicators",text:{ar:"ما حالة مؤشرات المرشحات والمجفف ومعالجة الهواء؟",en:"What do the available filter, dryer, and air-treatment indicators show?",fr:"Que montrent les indicateurs disponibles des filtres, du sécheur et du traitement d’air ?"},options:[
          {id:"treatment-dp-high",label:{ar:"فرق الضغط أعلى من خط الأساس",en:"Differential pressure is above baseline",fr:"La pression différentielle dépasse la référence"},evidence:["treatment-dp-high"]},
          {id:"filter-alert",label:{ar:"يوجد إنذار مرشح أو صيانة مستحقة",en:"A filter alarm or maintenance indication is present",fr:"Une alarme de filtre ou une indication de maintenance est présente"},evidence:["filter-alert"]},
          {id:"dryer-restriction",label:{ar:"يوجد مؤشر غير طبيعي في المجفف",en:"An abnormal dryer indication is present",fr:"Une indication anormale du sécheur est présente"},evidence:["dryer-restriction"]},
          {id:"treatment-indicators-normal",label:{ar:"المؤشرات طبيعية حسب خط الأساس",en:"Indicators are normal against baseline",fr:"Les indicateurs sont normaux par rapport à la référence"},evidence:["treatment-indicators-normal"]},
          {id:"unknown",label:{ar:"لا توجد مؤشرات موثوقة",en:"No reliable indicators are available",fr:"Aucun indicateur fiable n’est disponible"},evidence:[]}
        ]}
      ]
    }
  };
  function textFor(value, language) { return value && (value[language] || value.en || value.ar) || ""; }
  // Rank unanswered questions by pairwise hypothesis separation.
  // This is an equal-outcome heuristic, not Bayesian expected information gain:
  // no empirical answer frequencies are available for these curated flows.
  function chooseNextQuestion(flow, evidence, answered, language) {
    const candidates = flow.questions.filter(q => !answered.includes(q.id));
    if (!candidates.length) return null;
    const currentIds = new Set(evidence.flatMap(entry =>
      Array.isArray(entry.evidence) ? entry.evidence : []
    ));
    const classify = ids => flow.hypotheses.map(hypothesis => {
      const support = (hypothesis.evidenceFor || []).some(id => ids.has(id));
      const contradiction = (hypothesis.evidenceAgainst || []).some(id => ids.has(id));
      if (support && !contradiction) return "supports";
      if (contradiction && !support) return "contradicts";
      if (support && contradiction) return "mixed";
      return "unresolved";
    });
    const pairwiseSeparation = states => {
      let separated = 0;
      let comparable = 0;
      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          comparable++;
          if (states[i] !== states[j]) separated++;
        }
      }
      return comparable ? separated / comparable : 0;
    };
    return candidates.map((question, index) => {
      const outcomeScores = question.options.map(option => {
        const added = Array.isArray(option.evidence) ? option.evidence : [];
        if (!added.length) return 0; // unknown/no reading adds no discrimination
        const ids = new Set([...currentIds, ...added]);
        return pairwiseSeparation(classify(ids));
      });
      const score = outcomeScores.reduce((sum, value) => sum + value, 0) /
        Math.max(1, outcomeScores.length);
      return { question, score, index };
    }).sort((a, b) => b.score - a.score || a.index - b.index)[0].question;
  }
  function createRegistrySession(key, flow, language) {
    if (!flow || !flow.question || !flow.question.id || typeof flow.question.text !== "string" ||
        !Array.isArray(flow.answers) || flow.answers.length < 2 ||
        flow.answers.some(answer => !answer || !answer.id || typeof answer.label !== "string" || typeof answer.guidance !== "string")) {
      return {ok:false, code:"invalid_registry_flow", message:"The curated flow definition is incomplete."};
    }
    return {
      ok:true, version:VERSION, flowId:key, flowMode:"registry_single_step",
      equipment:flow.equipmentId, symptom:flow.symptomId, language,
      evidence:[], answeredQuestionIds:[], status:"collecting_evidence",
      nextQuestion:{id:flow.question.id,text:flow.question.text,options:flow.answers.map(answer=>({id:answer.id,label:answer.label}))},
      hypotheses:[],
      limitations:["This is a single-step curated check, not a ranked hypothesis model.","No likelihoods or calibrated probabilities are inferred.","The selected guidance does not confirm a root cause."]
    };
  }

  function createSession(input) {
    input = input || {};
    const key = String(input.equipment || "") + "|" + String(input.symptom || "");
    const language = ["ar","en","fr"].includes(input.language) ? input.language : "ar";
    const flow = FLOWS[key];
    if (!flow) {
      const registryFlow = root.MAINTENANCE_DIAGNOSTIC_FLOWS &&
        root.MAINTENANCE_DIAGNOSTIC_FLOWS.flows &&
        root.MAINTENANCE_DIAGNOSTIC_FLOWS.flows[key];
      if (!registryFlow) return {ok:false, code:"flow_not_curated", message:"No curated dynamic flow is available for this equipment/symptom pair. Collect more information or use the general knowledge route; do not guess."};
      if (language !== "ar") return {ok:false, code:"flow_translation_pending", message:"This curated check is currently available in Arabic only. Switch to Arabic rather than relying on an unreviewed translation."};
      return createRegistrySession(key, registryFlow, language);
    }
    return {ok:true, version:VERSION, flowId:key, equipment:flow.equipment, symptom:flow.symptom, language, evidence:[], answeredQuestionIds:[], status:"collecting_evidence", nextQuestion:questionView(flow.questions[0],language), hypotheses:rank(flow,[],language), limitations:["This is a heuristic evidence ranking, not a calibrated probability.","Unknown answers do not count for or against a hypothesis.","No cause is confirmed by this session alone."]};
  }
  function questionView(question, language) {
    return {id:question.id,text:textFor(question.text,language),options:question.options.map(o=>({id:o.id,label:textFor(o.label,language)}))};
  }
  function rank(flow, evidence, language) {
    const observedGroups = new Map();
    for (const entry of evidence) {
      const group = "question:" + String(entry.questionId || "unknown");
      for (const id of Array.isArray(entry.evidence) ? entry.evidence : []) {
        if (typeof id === "string" && id) observedGroups.set(id, group);
      }
    }
    return flow.hypotheses.map(h => {
      const support = (h.evidenceFor || []).filter(id => observedGroups.has(id));
      const contradictions = (h.evidenceAgainst || []).filter(id => observedGroups.has(id));
      const evidenceNodes = [
        ...support.map(id => ({ id, group: observedGroups.get(id), state: "supports" })),
        ...contradictions.map(id => ({ id, group: observedGroups.get(id), state: "contradicts" }))
      ];
      const bayesian = root.MaintenanceBayesianEngine &&
        typeof root.MaintenanceBayesianEngine.scoreHypothesis === "function"
        ? root.MaintenanceBayesianEngine.scoreHypothesis({ id: h.id, evidenceNodes }, 0.2)
        : null;
      const score = bayesian ? bayesian.relativeSupportScore : support.length - contradictions.length;
      const status = support.length === 0 && contradictions.length === 0
        ? "unresolved"
        : support.length > contradictions.length
          ? "supported_by_current_evidence"
          : contradictions.length > support.length
            ? "weakened_by_current_evidence"
            : "mixed_evidence";
      return {
        id: h.id,
        label: textFor(h.label, language),
        supportingEvidence: support,
        contradictingEvidence: contradictions,
        checks: h.checks,
        score,
        supportBand: bayesian ? bayesian.supportBand : "unscored",
        reasoningModel: bayesian ? bayesian.bayesianMethod : "legacy_evidence_count",
        evidenceGroupsUsed: bayesian ? bayesian.evidenceGroupsUsed : evidenceNodes.length,
        status
      };
    }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }
  function answer(session, answerId) {
    if (!session || session.ok !== true || session.status !== "collecting_evidence") return {ok:false,code:"invalid_session"};
    if (session.flowMode === "registry_single_step") {
      const flow = root.MAINTENANCE_DIAGNOSTIC_FLOWS &&
        root.MAINTENANCE_DIAGNOSTIC_FLOWS.flows &&
        root.MAINTENANCE_DIAGNOSTIC_FLOWS.flows[session.flowId];
      if (!flow || !session.nextQuestion || session.nextQuestion.id !== flow.question.id) return {ok:false,code:"flow_not_curated"};
      const option = flow.answers.find(answer => answer.id === answerId);
      if (!option) return {ok:false,code:"invalid_answer"};
      const evidence = session.evidence.concat([{questionId:flow.question.id,answerId:option.id,evidence:[]}]);
      const updated = {
        ...session, evidence, answeredQuestionIds:session.answeredQuestionIds.concat([flow.question.id]),
        status:"evidence_review", nextQuestion:null,
        selectedAnswer:{id:option.id,label:option.label,guidance:option.guidance},
        summary:{message:"تم تسجيل الملاحظة. الإرشاد التالي مرتبط بالإجابة المختارة فقط ولا يثبت سبب العطل.",confirmedCause:"",requiresMoreEvidence:true}
      };
      return {ok:true,session:updated};
    }
    const flow=FLOWS[session.flowId]; if(!flow) return {ok:false,code:"flow_not_curated"};
    const next=session.nextQuestion ? flow.questions.find(q=>q.id===session.nextQuestion.id) : null;
    if(!next) return {ok:false,code:"no_question_pending"};
    const option=next.options.find(o=>o.id===answerId); if(!option) return {ok:false,code:"invalid_answer"};
    const evidence=session.evidence.concat([{questionId:next.id,answerId:option.id,evidence:option.evidence.slice()}]);
    const answered=session.answeredQuestionIds.concat([next.id]);
    const following=chooseNextQuestion(flow,evidence,answered,session.language);
    const updated={...session,evidence,answeredQuestionIds:answered,status:following?"collecting_evidence":"evidence_review",nextQuestion:following?questionView(following,session.language):null,hypotheses:rank(flow,evidence,session.language)};
    if(!following) updated.summary={message:session.language==="ar"?"هذه فرضيات مرتبة حسب الأدلة المسجلة، وليست سببًا مؤكدًا. إذا كانت الأدلة غير كافية، اجمع قياسات موثوقة أو صعّد لفني مؤهل.":"These are hypotheses ranked against recorded evidence, not a confirmed cause. If evidence is insufficient, collect reliable measurements or escalate to a qualified technician.",confirmedCause:"",requiresMoreEvidence:true};
    return {ok:true,session:updated};
  }
  function getFlowContract(flowId) { const flow = FLOWS[flowId]; if (!flow) return null; return { flowId, equipment:flow.equipment, symptom:flow.symptom, hypothesisIds:flow.hypotheses.map(h=>h.id), evidenceIds:[...new Set([...flow.questions.flatMap(q=>q.options.flatMap(o=>o.evidence||[])),...flow.hypotheses.flatMap(h=>[...(h.evidenceFor||[]),...(h.evidenceAgainst||[])])])] }; }
  root.MaintenanceDiagnosticSession = Object.freeze({version:VERSION,createSession,answer,availableFlows:Object.keys(FLOWS),getFlowContract});
  if(typeof module!=="undefined"&&module.exports) module.exports=root.MaintenanceDiagnosticSession;
})(typeof globalThis!=="undefined"?globalThis:this);
