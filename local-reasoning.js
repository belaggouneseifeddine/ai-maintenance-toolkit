/* Evidence-aware local reasoning. Hypotheses are exploratory; references are attached only by explicit IDs. */
(function(root){
  "use strict";
  const LANGS=new Set(["ar","en","fr"]);
  const HYPOTHESES={
    "pump|noise":[
      {id:"suction-condition",label:{ar:"اضطراب محتمل في ظروف السحب",en:"Possible suction-condition issue",fr:"Problème possible côté aspiration"},why:{ar:"الضجيج أو الاهتزاز قد يتوافق مع ظروف سحب غير مستقرة، لكنه لا يثبت التكهف.",en:"Noise or vibration may fit unstable suction conditions, but does not prove cavitation.",fr:"Le bruit ou les vibrations peuvent correspondre à une aspiration instable, sans prouver la cavitation."},checks:{ar:"قارن ضغط السحب ومستوى المصدر والتدفق بخط الأساس ومنحنى المضخة.",en:"Compare suction pressure, source level and flow with baseline and the pump curve.",fr:"Comparer la pression d’aspiration, le niveau source et le débit aux valeurs de référence et à la courbe."},evidenceClass:"symptom_pattern"},
      {id:"alignment-support",label:{ar:"احتمال عدم محاذاة أو تثبيت غير مستقر",en:"Possible misalignment or unstable mounting",fr:"Désalignement ou support instable possible"},why:{ar:"قد ينتج الاهتزاز عن المحاذاة أو التثبيت؛ يلزم فحص وقياس مناسب.",en:"Vibration can arise from alignment or mounting issues; inspection and measurement are needed.",fr:"Les vibrations peuvent provenir de l’alignement ou du support; une inspection et des mesures sont nécessaires."},checks:{ar:"راجع سجل الاهتزاز والتثبيت والمحاذاة وفق إجراءات العزل والمصنع.",en:"Review vibration history, mounting and alignment under isolation and manufacturer procedures.",fr:"Examiner l’historique vibratoire, le support et l’alignement selon les procédures d’isolement et du fabricant."},evidenceClass:"symptom_pattern"},
      {id:"bearing-condition",label:{ar:"حالة المحامل — فرضية تحتاج تحققًا",en:"Bearing condition — hypothesis to verify",fr:"État des roulements — hypothèse à vérifier"},why:{ar:"قد تترافق الأصوات غير الطبيعية مع المحامل، لكن العرض وحده غير كافٍ.",en:"Abnormal noise can accompany bearing issues, but the symptom alone is insufficient.",fr:"Un bruit anormal peut accompagner un problème de roulement, mais le symptôme seul ne suffit pas."},checks:{ar:"راجع اتجاهات الحرارة والاهتزاز والتشحيم؛ لا تلمس الأجزاء أثناء الدوران.",en:"Review temperature/vibration trends and lubrication history; never touch rotating parts.",fr:"Examiner les tendances de température/vibration et la lubrification; ne jamais toucher les pièces en rotation."},evidenceClass:"symptom_pattern"}
    ],
    "pump|low_flow":[
      {id:"suction-or-source",label:{ar:"ضغط السحب أو مستوى المصدر غير كافٍ — احتمال",en:"Insufficient suction pressure or source level — possible",fr:"Pression d’aspiration ou niveau source insuffisant — possible"},why:{ar:"قد يرتبط التدفق المنخفض بظروف التغذية؛ يلزم قياس موثوق.",en:"Low flow may relate to supply conditions; reliable measurements are required.",fr:"Un faible débit peut être lié à l’alimentation; des mesures fiables sont nécessaires."},checks:{ar:"سجّل ضغط السحب ومستوى المصدر والضغط الخارج والتدفق مع الوحدات.",en:"Record suction pressure, discharge pressure, source level and flow with units.",fr:"Relever la pression d’aspiration, la pression de refoulement, le niveau source et le débit avec unités."},evidenceClass:"symptom_pattern"},
      {id:"flow-path",label:{ar:"تقييد محتمل في مسار التدفق أو وضع صمام",en:"Possible flow-path restriction or valve position",fr:"Restriction possible du circuit ou position de vanne"},why:{ar:"قد يحدّ مسار التدفق أو وضع الصمام من التدفق؛ تحقّق من الحالة الفعلية.",en:"A restricted flow path or valve position may limit flow; verify actual conditions.",fr:"Une restriction du circuit ou la position d’une vanne peut limiter le débit; vérifier la situation réelle."},checks:{ar:"افحص المؤشرات ووضع الصمامات المسموح فحصها بصريًا؛ لا تفك خطوطًا مضغوطة.",en:"Check indicators and safely visible valve positions; do not open pressurized lines.",fr:"Vérifier les indicateurs et les positions visibles des vannes; ne pas ouvrir de conduite sous pression."},evidenceClass:"symptom_pattern"}
    ],
    "pump|not_start":[
      {id:"control-or-protection",label:{ar:"حالة التحكم أو الحماية تحتاج فحصًا",en:"Control or protection status needs checking",fr:"État de commande ou de protection à vérifier"},why:{ar:"عدم البدء قد ينتج عن أمر تحكم أو حماية نشطة؛ لا تتجاوز الحماية.",en:"Failure to start may relate to a control command or active protection; never bypass protection.",fr:"L’absence de démarrage peut être liée à une commande ou une protection active; ne jamais contourner la protection."},checks:{ar:"سجّل رمز الإنذار وسجل الأحداث قبل إعادة الضبط، واتبع إجراء الموقع.",en:"Record the alarm code and event history before reset; follow site procedure.",fr:"Relever le code d’alarme et l’historique avant réinitialisation; suivre la procédure du site."},evidenceClass:"symptom_pattern"}
    ]
  };
  const FOLLOWUPS={
    "pump|low_flow":[
      {id:"source-pressure",question:{ar:"هل ضغط السحب ومستوى المصدر ضمن النطاق المعتاد؟",en:"Are suction pressure and source level within their normal range?",fr:"La pression d’aspiration et le niveau source sont-ils dans leur plage normale?"},
       answers:{normal:{ar:"قارن ضغط الطرد ووضع الصمامات ونقطة التشغيل بمنحنى المضخة.",en:"Compare discharge pressure, valve position and operating point with the pump curve.",fr:"Comparer la pression de refoulement, les vannes et le point de fonctionnement à la courbe."},low:{ar:"تحقق من التغذية والمرشح والصمام قبل أي استنتاج؛ لا تفتح خطًا مضغوطًا.",en:"Check supply, strainer and permitted valve indicators before concluding; do not open pressurized lines.",fr:"Vérifier l’alimentation, le filtre et les indicateurs de vanne autorisés; ne pas ouvrir de conduite sous pression."},unknown:{ar:"اجمع قراءة موثوقة بوحدة واضحة قبل اختيار سبب.",en:"Obtain a reliable reading with units before selecting a cause.",fr:"Obtenir une mesure fiable avec unités avant de choisir une cause."}},
       next:{normal:"flow-path",low:"suction-or-source",unknown:null}}
    ],
    "pump|noise":[
      {id:"noise-context",question:{ar:"هل الضجيج مصحوب باهتزاز غير معتاد أو تغيّر في التدفق؟",en:"Is the noise accompanied by unusual vibration or a flow change?",fr:"Le bruit s’accompagne-t-il de vibrations inhabituelles ou d’un changement de débit?"},
       answers:{vibration:{ar:"راجع اتجاهات الاهتزاز والمحاذاة والتثبيت مع الالتزام بالعزل.",en:"Review vibration trends, alignment and mounting under proper isolation.",fr:"Examiner les tendances vibratoires, l’alignement et le support après isolement approprié."},flow:{ar:"قارن ظروف السحب والتدفق والقراءات بخط الأساس ومنحنى المضخة.",en:"Compare suction conditions, flow and readings with baseline and the pump curve.",fr:"Comparer l’aspiration, le débit et les mesures aux valeurs de référence et à la courbe."},unknown:{ar:"سجّل وقت ظهور الصوت ومكانه وقراءات الاهتزاز إن توفرت.",en:"Record when and where the noise occurs and vibration readings if available.",fr:"Noter quand et où le bruit apparaît et les mesures vibratoires disponibles."}},
       next:{vibration:"alignment-support",flow:"suction-condition",unknown:null}}
    ],
    "pump|not_start":[
      {id:"control-status",question:{ar:"هل تظهر إشارة أمر التشغيل أو إنذار/فصل على لوحة التحكم؟",en:"Does the panel show a start command or an alarm/trip?",fr:"Le panneau affiche-t-il une commande de démarrage ou une alarme/déclenchement?"},
       answers:{alarm:{ar:"احتفظ برمز الإنذار وسجل الأحداث واتبع تعليمات المصنع؛ لا تتجاوز الحماية.",en:"Record the alarm code and event history; follow OEM instructions and never bypass protection.",fr:"Relever le code et l’historique; suivre le fabricant sans contourner la protection."},command:{ar:"اطلب من شخص مؤهل التحقق من دائرة التحكم والتغذية وفق إجراءات العزل.",en:"Have a qualified person check the control circuit and supply under isolation procedures.",fr:"Faire vérifier la commande et l’alimentation par une personne qualifiée selon les procédures d’isolement."},unknown:{ar:"تحقق بصريًا من مؤشرات اللوحة دون فتح الأغطية أو لمس أجزاء مكهربة.",en:"Check panel indicators visually without opening covers or touching energized parts.",fr:"Observer les indicateurs sans ouvrir les capots ni toucher des éléments sous tension."}},
       next:{alarm:"control-or-protection",command:"control-or-protection",unknown:null}}
    ]
  };
  function langOf(value){return LANGS.has(value)?value:"ar";}
  function normalize(value){return String(value==null?"":value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
  function localized(value,lang){return value&&value[lang]||value&&value.en||"";}
  function cleanEvidence(items,hypothesisId,equipmentId){
    if(!Array.isArray(items))return [];
    return items.filter(item=>item&&item.hypothesisId===hypothesisId&&item.equipmentId===equipmentId&&
      typeof item.sourceId==="string"&&item.sourceId.trim()&&typeof item.title==="string"&&item.title.trim()&&
      typeof item.url==="string"&&/^https:\/\//i.test(item.url)&&
      ["verified_claim","review_needed","reference_only"].includes(item.status)&&
      (item.status!=="verified_claim"||(typeof item.claim==="string"&&item.claim.trim()&&typeof item.section==="string"&&item.section.trim()&&item.scopeMatch===true&&item.claimChecked===true)));
  }
  function analyse(input){
    input=input&&typeof input==="object"?input:{};
    const lang=langOf(input.language),equipmentId=String(input.equipmentId||input.machine||""),symptomId=String(input.symptomId||input.symptom||"");
    const key=equipmentId+"|"+symptomId;
    const definitions=HYPOTHESES[key]||[];
    const evidence=Array.isArray(input.evidence)?input.evidence:[];
    const hypotheses=definitions.map(def=>{
      const refs=cleanEvidence(evidence,def.id,equipmentId).map(ref=>({
        sourceId:ref.sourceId,title:ref.title,url:ref.url,status:ref.status,
        ...(ref.section?{section:ref.section}:{}),...(Number.isInteger(ref.page)&&ref.page>0?{page:ref.page}:{}),
        ...(ref.claim?{claim:ref.claim}:{}),
        note:ref.status==="verified_claim"?"Claim-level source check supplied; verify it remains applicable to the exact model.":"This source is not verified as support for this specific claim."
      }));
      return {id:def.id,label:localized(def.label,lang),why:localized(def.why,lang),nextCheck:localized(def.checks,lang),
        status:"exploratory_hypothesis",evidenceClass:def.evidenceClass,evidence:refs,
        supportStatus:refs.some(r=>r.status==="verified_claim")?"claim_reference_supplied":refs.length?"unverified_reference_only":"no_claim_specific_reference"};
    });
    const flow=(FOLLOWUPS[key]||[])[0]||null;
    const answerId=flow&&flow.answers&&Object.prototype.hasOwnProperty.call(flow.answers,String(input.followupAnswerId||""))?String(input.followupAnswerId):"";
    const answerGuidance=answerId?localized(flow.answers[answerId],lang):"";
    const nextId=answerId?flow.next[answerId]:null;
    const followup=flow?{
      id:flow.id,question:localized(flow.question,lang),
      acceptedAnswerIds:Object.keys(flow.answers),
      selectedAnswerId:answerId||null,
      answerGuidance:answerGuidance||null,
      nextHypothesisId:nextId||null,
      requiresStructuredAnswer:true
    }:null;
    const observations=Array.isArray(input.observations)?input.observations.filter(x=>typeof x==="string"&&x.trim()).slice(0,10):[];
    const missing=[];
    if(!input.assetId&&!input.model)missing.push(lang==="ar"?"رقم الأصل أو طراز المعدة":"asset ID or equipment model");
    if(!observations.length)missing.push(lang==="ar"?"ملاحظات تشغيل موثقة":"recorded operating observations");
    if(!Array.isArray(input.measurements)||!input.measurements.some(m=>m&&typeof m.name==="string"&&typeof m.unit==="string"&&Number.isFinite(m.value)))missing.push(lang==="ar"?"قياسات موثوقة مع الوحدات":"reliable measurements with units");
    return {language:lang,equipmentId,symptomId,hypotheses,followup,missing,
      safetyNote:lang==="ar"?"الفرضيات ليست تشخيصًا مؤكدًا. اتبع العزل وإجراءات الموقع ودليل الطراز؛ لا تتجاوز وسائل الحماية.":lang==="fr"?"Les hypothèses ne sont pas un diagnostic confirmé. Respecter l’isolement, les procédures du site et le manuel du modèle; ne jamais contourner les protections.":"Hypotheses are not confirmed diagnoses. Follow isolation, site procedures and the model manual; never bypass protections."};
  }
  function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function renderHTML(input){
    const result=analyse(input),lang=result.language;
    const title=lang==="ar"?"استدلال محلي — فرضيات وأدلة":lang==="fr"?"Raisonnement local — hypothèses et preuves":"Local reasoning — hypotheses and evidence";
    let html='<section class="record local-reasoning"><h3>'+title+'</h3><p>'+escapeHtml(result.safetyNote)+'</p>';
    if(result.hypotheses.length){html+="<ol>"+result.hypotheses.map(h=>"<li><b>"+escapeHtml(h.label)+"</b><p>"+escapeHtml(h.why)+"</p><p>"+escapeHtml(h.nextCheck)+"</p><p><b>"+escapeHtml(h.status)+"</b> — "+escapeHtml(h.supportStatus)+"</p>"+(h.evidence.length?"<ul>"+h.evidence.map(e=>"<li><a href=\""+escapeHtml(e.url)+"\" target=\"_blank\" rel=\"noopener noreferrer\">"+escapeHtml(e.title)+"</a> — "+escapeHtml(e.status)+(e.section?"; "+escapeHtml(e.section):"")+(e.page?"; p. "+e.page:"")+"<p>"+escapeHtml(e.note)+"</p></li>").join("")+"</ul>":"<p>"+(lang==="ar"?"لا يوجد مرجع محدد لهذه الفرضية.":"No claim-specific reference supplied for this hypothesis.")+"</p>")+"</li>").join("")+"</ol>";}
    if(result.followup){html+="<h4>"+escapeHtml(result.followup.question)+"</h4>";if(result.followup.answerGuidance)html+="<p>"+escapeHtml(result.followup.answerGuidance)+"</p>";}
    if(result.missing.length)html+="<h4>"+(lang==="ar"?"معلومات ناقصة":"Missing information")+"</h4><ul>"+result.missing.map(x=>"<li>"+escapeHtml(x)+"</li>").join("")+"</ul>";
    html+="<p>"+escapeHtml(result.safetyNote)+"</p></section>";
    return html;
  }
  const api={analyse,renderHTML};
  root.MaintenanceLocalReasoning=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
