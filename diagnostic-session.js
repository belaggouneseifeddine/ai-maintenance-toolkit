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
    "furnace|overheat": {
      equipment:"furnace", symptom:"overheat",
      hypotheses:[
        {id:"temperature_measurement_or_sensor",label:{ar:"خلل في قياس الحرارة أو حساس المنطقة",en:"Temperature measurement or zone sensor fault",fr:"Défaut de mesure ou de sonde de zone"},evidenceFor:["zone-reading-implausible","zone-reading-unstable","zone-reading-disagreement"],evidenceAgainst:["zone-readings-consistent"],checks:[
          {ar:"قارن قراءة كل منطقة مع نقطة الضبط وسجل التشغيل، مع تدوين الوحدة ومكان الحساس. لا تعتمد على رقم منفرد دون معرفة ما إذا كان PV أو SP.",en:"Compare each zone reading with its setpoint and operating log; record units and sensor location. Do not interpret a number until PV versus SP is known.",fr:"Comparez chaque zone à sa consigne et à l’historique; notez l’unité et l’emplacement de la sonde. Ne confondez pas PV et SP."},
          {ar:"بعد العزل والتبريد ووفق إجراء المصنع، اطلب من فني مؤهل فحص الحساس والتوصيلات ومقارنة القياس بأداة معايرة مناسبة.",en:"After isolation and cooldown, have a qualified technician inspect the sensor and wiring and compare against a suitable calibrated instrument.",fr:"Après consignation et refroidissement, faites contrôler la sonde et le câblage par une personne qualifiée avec un instrument étalonné adapté."}
        ]},
        {id:"heater_output_stuck_on",label:{ar:"استمرار خرج التسخين رغم أمر الإيقاف أو بلوغ الضبط",en:"Heating output remains energized despite stop or setpoint",fr:"La chauffe reste alimentée malgré l’arrêt ou la consigne"},evidenceFor:["heat-continues-after-stop","zone-rises-above-setpoint","heater-output-indicated-on"],evidenceAgainst:["heating-cutoff-indicated"],checks:[
          {ar:"راجع سجل الحالة ومؤشر خرج التسخين على HMI فقط؛ لا تفتح لوحة كهربائية حية ولا تختبر الكونتاكتور أو SSR تحت الجهد.",en:"Review event history and the HMI heating-output indication only; do not open a live electrical panel or test a contactor/SSR energized.",fr:"Consultez uniquement l’historique et l’indication de sortie de chauffe sur HMI; n’ouvrez pas une armoire sous tension."},
          {ar:"بعد العزل والتحقق من انعدام الطاقة، يفحص كهربائي مؤهل SSR/Contactor ودائرة التحكم وفق مخطط الطراز.",en:"After isolation and verification of absence of energy, a qualified electrician should inspect the SSR/contactor and control circuit against the model schematic.",fr:"Après consignation et vérification d’absence d’énergie, un électricien qualifié contrôle le SSR/contacteur et la commande selon le schéma du modèle."}
        ]},
        {id:"air_circulation_or_exhaust",label:{ar:"خلل دوران الهواء أو التهوية/العادم",en:"Air circulation or exhaust/ventilation fault",fr:"Défaut de circulation d’air ou d’extraction"},evidenceFor:["circulation-fan-alarm","exhaust-airflow-alarm","airflow-interlock-open"],evidenceAgainst:["airflow-status-normal"],checks:[
          {ar:"راجع حالة مراوح التدوير والعادم وإنذارات تدفق الهواء أو interlocks الظاهرة على الشاشة؛ لا تفتح الأغطية أثناء التشغيل.",en:"Review circulation/exhaust fan status and any airflow or interlock alarms shown on the HMI; do not open covers while running.",fr:"Vérifiez sur l’HMI l’état des ventilateurs, de l’extraction et des alarmes de débit ou interverrouillage; n’ouvrez pas les capots en marche."},
          {ar:"في أفران الطلاء، لا تتجاوز أي interlock للتهوية أو العادم؛ قد تتراكم أبخرة قابلة للاشتعال. اتبع إجراء الطوارئ ومصنع الفرن.",en:"On paint ovens, never bypass ventilation or exhaust interlocks; flammable vapours may accumulate. Follow the oven maker's and site emergency procedures.",fr:"Sur un four de peinture, ne shuntez jamais les interverrouillages de ventilation/extraction; des vapeurs inflammables peuvent s’accumuler."}
        ]}
      ],
      questions:[
        {id:"heating_state",text:{ar:"بحسب مؤشرات الشاشة فقط، ماذا حدث لخرج التسخين بعد ظهور إنذار Over Heat؟",en:"Based only on the display, what happened to the heating output after the Over Heat alarm?",fr:"D’après l’écran uniquement, que montre la sortie de chauffe après l’alarme Over Heat ?"},options:[
          {id:"heat-continues-after-stop",label:{ar:"يظهر أن التسخين مستمر رغم الإنذار/أمر الإيقاف",en:"Heating appears to continue despite alarm/stop command",fr:"La chauffe semble continuer malgré l’alarme/l’arrêt"},evidence:["heat-continues-after-stop"]},
          {id:"heating-cutoff-indicated",label:{ar:"تظهر الشاشة أن التسخين فُصل",en:"Display indicates heating was cut off",fr:"L’écran indique que la chauffe a été coupée"},evidence:["heating-cutoff-indicated"]},
          {id:"heater-state-unknown",label:{ar:"لا يظهر ذلك أو لا أعرف",en:"Not shown / unknown",fr:"Non affiché / inconnu"},evidence:[]}
        ]},
        {id:"zone_temperature_pattern",text:{ar:"ما نمط قراءات المناطق (Zones) مقارنة بنقاط الضبط؟ لا تخمّن إذا لم تكن القيم واضحة.",en:"How do the zone readings compare with their setpoints? Do not guess if the values are unclear.",fr:"Comment les mesures des zones se comparent-elles aux consignes ? Ne devinez pas si les valeurs sont ambiguës."},options:[
          {id:"zone-rises-above-setpoint",label:{ar:"منطقة واحدة أو أكثر أعلى من نقطة الضبط",en:"One or more zones are above setpoint",fr:"Une ou plusieurs zones dépassent la consigne"},evidence:["zone-rises-above-setpoint"]},
          {id:"zone-reading-implausible",label:{ar:"قراءة غير منطقية أو لا تتوافق مع سجل التشغيل",en:"A reading is implausible or conflicts with the operating log",fr:"Une mesure est incohérente ou contredit l’historique"},evidence:["zone-reading-implausible"]},
          {id:"zone-readings-consistent",label:{ar:"القراءات متقاربة ومتسقة مع السجل",en:"Readings are consistent with the log",fr:"Les mesures sont cohérentes avec l’historique"},evidence:["zone-readings-consistent"]},
          {id:"zone-reading-unknown",label:{ar:"لا أعرف؛ أحتاج توضيح PV وSP والوحدات",en:"Unknown; PV, SP, or units need clarification",fr:"Inconnu; PV, SP ou unités à clarifier"},evidence:[]}
        ]},
        {id:"air_system_status",text:{ar:"ما حالة مراوح تدوير الهواء والعادم وإنذارات تدفق الهواء كما تظهر على الشاشة؟",en:"What do the display indicators show for circulation fans, exhaust, and airflow alarms?",fr:"Que montrent les indicateurs des ventilateurs, de l’extraction et du débit d’air ?"},options:[
          {id:"circulation-fan-alarm",label:{ar:"إنذار مروحة تدوير الهواء",en:"Circulation fan alarm",fr:"Alarme ventilateur de circulation"},evidence:["circulation-fan-alarm"]},
          {id:"exhaust-airflow-alarm",label:{ar:"إنذار عادم أو تدفق هواء",en:"Exhaust or airflow alarm",fr:"Alarme d’extraction ou de débit d’air"},evidence:["exhaust-airflow-alarm"]},
          {id:"airflow-status-normal",label:{ar:"الحالة طبيعية حسب المؤشرات",en:"Indicators show normal status",fr:"Les indicateurs montrent un état normal"},evidence:["airflow-status-normal"]},
          {id:"air-status-unknown",label:{ar:"لا توجد معلومات ظاهرة",en:"No status information shown",fr:"Aucune information affichée"},evidence:[]}
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
  function createSession(input) {
    input = input || {};
    const key = String(input.equipment || "") + "|" + String(input.symptom || "");
    const flow = FLOWS[key];
    if (!flow) return {ok:false, code:"flow_not_curated", message:"No curated dynamic flow is available for this equipment/symptom pair. Collect more information or use the general knowledge route; do not guess."};
    const language = ["ar","en","fr"].includes(input.language) ? input.language : "ar";
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
