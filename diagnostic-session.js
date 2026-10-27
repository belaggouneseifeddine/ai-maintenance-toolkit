/* Dynamic, evidence-led diagnostic sessions. Offline-first; no calibrated probabilities. */
(function (root) {
  "use strict";
  const VERSION = "0.2.0";
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
          {id:"trip-present",label:{ar:"أمر موجود مع إنذار أو فصل",en:"Command present with alarm/trip",fr:"Ordre présent avec alarme/déclenchement"},evidence:["trip-present","command-present"]},
          {id:"command-present",label:{ar:"أمر موجود ولا يظهر إنذار",en:"Command present, no alarm shown",fr:"Ordre présent, aucune alarme affichée"},evidence:["command-present","no-trip-indicated"]},
          {id:"unknown",label:{ar:"غير معروف",en:"Unknown",fr:"Inconnu"},evidence:[]}
        ]}
      ]
    }
  };
  function textFor(value, language) { return value && (value[language] || value.en || value.ar) || ""; }
  // Select the next question by expected hypothesis discrimination, not source order.
  // This is a heuristic information-gain proxy, not a calibrated probability.
  function chooseNextQuestion(flow, evidence, answered, language) {
    const candidates = flow.questions.filter(q => !answered.includes(q.id));
    if (!candidates.length) return null;
    const currentIds = new Set(evidence.flatMap(e => e.evidence || []));
    const entropy = counts => {
      const total = counts.reduce((a, b) => a + b, 0);
      if (!total) return 0;
      return -counts.reduce((sum, n) => {
        if (!n) return sum;
        const p = n / total;
        return sum + p * Math.log2(p);
      }, 0);
    };
    const classify = ids => flow.hypotheses.map(h => {
      const s = (h.evidenceFor || []).filter(x => ids.has(x)).length;
      const a = (h.evidenceAgainst || []).filter(x => ids.has(x)).length;
      return s > a ? 1 : a > s ? 2 : 0;
    });
    const counts = buckets => buckets.reduce((result, bucket) => { result[bucket]++; return result; }, [0, 0, 0]);
    // Expected entropy across answer outcomes is a heuristic proxy for discrimination.
    return candidates.map((question, index) => {
      const outcomeEntropies = question.options.map(option => {
        if (!option.evidence || !option.evidence.length) return 0;
        const ids = new Set([...currentIds, ...option.evidence]);
        return entropy(counts(classify(ids)));
      });
      return { question, score: outcomeEntropies.reduce((a, b) => a + b, 0) / Math.max(1, outcomeEntropies.length), index };
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
    const ids = new Set(evidence.flatMap(e=>e.evidence || []));
    return flow.hypotheses.map(h=>{
      const support=(h.evidenceFor||[]).filter(x=>ids.has(x));
      const contradictions=(h.evidenceAgainst||[]).filter(x=>ids.has(x));
      return {id:h.id,label:textFor(h.label,language),supportingEvidence:support,contradictingEvidence:contradictions,checks:h.checks,score:support.length-contradictions.length,status:support.length===0&&contradictions.length===0?"unresolved":support.length>contradictions.length?"supported_by_current_evidence":contradictions.length>support.length?"weakened_by_current_evidence":"mixed_evidence"};
    }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
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
  function getFlowContract(flowId) { const flow = FLOWS[flowId]; if (!flow) return null; return { flowId, equipment:flow.equipment, symptom:flow.symptom, hypothesisIds:flow.hypotheses.map(h=>h.id), evidenceIds:[...new Set(flow.questions.flatMap(q=>q.options.flatMap(o=>o.evidence||[])))] }; }
  root.MaintenanceDiagnosticSession = Object.freeze({version:VERSION,createSession,answer,availableFlows:Object.keys(FLOWS),getFlowContract});
  if(typeof module!=="undefined"&&module.exports) module.exports=root.MaintenanceDiagnosticSession;
})(typeof globalThis!=="undefined"?globalThis:this);
