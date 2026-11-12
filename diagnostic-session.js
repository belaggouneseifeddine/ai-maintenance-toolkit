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
    "vfd|trip": {
      equipment:"vfd", symptom:"trip",
      hypotheses:[
        {id:"input_supply_or_dc_bus",label:{ar:"تغذية المغير أو ناقل التيار المستمر (DC bus)",en:"Drive input supply or DC-bus condition",fr:"Alimentation du variateur ou bus continu"},evidenceFor:["input-supply-fault-indicated","input-voltage-alarm","phase-loss-indicated"],evidenceAgainst:["input-supply-indicators-normal"],checks:[{ar:"راجع سجل الأعطال ومؤشرات جهد/فقد الطور من واجهة المغير، وقارنها بدليل الطراز نفسه. لا تفتح لوحة حية أو تقِس داخلها دون عزل وتحقق من تفريغ ناقل DC بواسطة شخص مؤهل.",en:"Review the drive fault log and displayed input-voltage/phase-loss indicators against the exact drive manual. Do not open an energized panel or probe the DC bus; isolation and verified discharge are for qualified personnel.",fr:"Consultez l’historique des défauts et les indicateurs affichés de tension d’entrée/perte de phase avec le manuel exact du variateur. N’ouvrez pas une armoire sous tension et ne mesurez pas le bus continu ; l’isolement et la vérification de décharge relèvent d’un personnel qualifié."}]},
        {id:"motor_cable_or_load",label:{ar:"المحرك أو كابل الخرج أو الحمل",en:"Motor, output cable, or driven load",fr:"Moteur, câble de sortie ou charge entraînée"},evidenceFor:["motor-output-fault-indicated","overcurrent-trip","earth-fault-trip","motor-overload-indicated"],evidenceAgainst:["motor-load-indicators-normal"],checks:[{ar:"احفظ رمز العطل والظروف والحمل قبل أي إعادة ضبط. افحص المؤشرات الخارجية فقط؛ اختبارات الكابل/العزل أو فصل المحرك تتطلب عزلًا كاملاً والتحقق من انعدام الجهد بواسطة شخص مؤهل.",en:"Capture the fault code, operating conditions, and load before any reset. Use external indications only; cable/insulation tests or motor disconnection require full isolation and verified absence of voltage by a qualified person.",fr:"Enregistrez le code défaut, les conditions de fonctionnement et la charge avant toute réinitialisation. Limitez-vous aux indications externes ; les essais de câble/isolement ou la déconnexion du moteur exigent une consignation complète et une vérification d’absence de tension par une personne qualifiée."}]},
        {id:"control_feedback_or_external_fault",label:{ar:"إشارة التحكم أو التغذية الراجعة أو عطل خارجي",en:"Control, feedback, or external fault signal",fr:"Commande, retour d’information ou défaut externe"},evidenceFor:["control-feedback-fault-indicated","external-fault-active","permissive-not-met"],evidenceAgainst:["control-status-normal"],checks:[{ar:"راجع حالة أمر التشغيل وEnable ومرجع السرعة وإشارات interlock/External Fault من واجهة التحكم المصرح بها. لا تتجاوز interlock ولا تغيّر parameters أو إعدادات الحماية.",en:"Review the start command, enable, speed reference, and interlock/external-fault status on the authorized control interface. Do not bypass interlocks or change parameters/protection settings.",fr:"Vérifiez l’ordre de marche, l’activation, la référence de vitesse et l’état des interverrouillages/défauts externes sur l’interface autorisée. Ne contournez aucun interverrouillage et ne modifiez pas les paramètres ou protections."}]}
      ],
      questions:[
        {id:"vfd_fault_category",text:{ar:"ما فئة رمز العطل حسب دليل الشركة المطابقة لطراز المغير؟ لا تخمّن معنى الرمز من طراز آخر.",en:"What fault category does the manual for this exact drive model assign to the code? Do not infer meaning from another model.",fr:"Quelle catégorie le manuel du modèle exact attribue-t-il au code ? N’extrapolez pas à partir d’un autre modèle."},options:[
          {id:"input-supply-category",label:{ar:"الدليل المطابق يصنفه كخلل في دخل التغذية أو DC bus",en:"Exact manual classifies it as an input-supply or DC-bus fault",fr:"Le manuel exact le classe comme défaut d’alimentation d’entrée ou du bus continu"},evidence:["input-supply-fault-indicated"]},
          {id:"motor-output-category",label:{ar:"الدليل المطابق يصنفه كخلل خرج/محرك أو حمل",en:"Exact manual classifies it as an output, motor, or load fault",fr:"Le manuel exact le classe comme défaut de sortie, moteur ou charge"},evidence:["motor-output-fault-indicated"]},
          {id:"control-feedback-category",label:{ar:"الدليل المطابق يصنفه كخلل تحكم أو إشارة خارجية",en:"Exact manual classifies it as a control or external-signal fault",fr:"Le manuel exact le classe comme défaut de commande ou signal externe"},evidence:["control-feedback-fault-indicated"]},
          {id:"unverified-code",label:{ar:"الرمز غير محفوظ أو لم أتحقق من الدليل المطابق",en:"Code not recorded or exact manual not checked",fr:"Code non enregistré ou manuel exact non vérifié"},evidence:[]}
        ]},
        {id:"vfd_control_status",text:{ar:"ماذا تعرض واجهة المغير عن دخل التغذية وأمر التشغيل وEnable وإشارات السماح/العطل الخارجي؟",en:"What does the drive interface show for input supply, run command, enable, permissives, and external-fault status?",fr:"Que montre l’interface du variateur pour l’alimentation d’entrée, l’ordre de marche, l’activation, les autorisations et le défaut externe ?"},options:[
          {id:"input-voltage-alarm",label:{ar:"يوجد إنذار جهد دخل على واجهة المغير",en:"Drive interface shows an input-voltage alarm",fr:"L’interface du variateur affiche une alarme de tension d’entrée"},evidence:["input-voltage-alarm"]},
          {id:"phase-loss-indicated",label:{ar:"يوجد مؤشر فقد طور حسب الواجهة أو الدليل المطابق",en:"Interface or exact manual indicates input phase loss",fr:"L’interface ou le manuel exact indique une perte de phase d’entrée"},evidence:["phase-loss-indicated"]},
          {id:"input-supply-indicators-normal",label:{ar:"مؤشرات دخل التغذية طبيعية حسب خط الأساس",en:"Input-supply indicators are normal against baseline",fr:"Les indicateurs d’alimentation d’entrée sont normaux par rapport à la référence"},evidence:["input-supply-indicators-normal"]},
          {id:"external-fault-active",label:{ar:"إشارة عطل خارجي فعالة",en:"External-fault signal is active",fr:"Le signal de défaut externe est actif"},evidence:["external-fault-active"]},
          {id:"permissive-not-met",label:{ar:"شرط سماح أو Enable غير متحقق",en:"A permissive or enable condition is not satisfied",fr:"Une autorisation ou condition d’activation n’est pas satisfaite"},evidence:["permissive-not-met"]},
          {id:"control-status-normal",label:{ar:"الأمر وEnable وإشارات السماح تبدو طبيعية",en:"Command, enable, and permissive indicators appear normal",fr:"Les indicateurs de commande, d’activation et d’autorisation semblent normaux"},evidence:["control-status-normal"]},
          {id:"control-status-unknown",label:{ar:"الحالة غير معروفة أو لا توجد قراءة موثوقة",en:"Unknown or no reliable indication",fr:"État inconnu ou aucune indication fiable"},evidence:[]}
        ]},
        {id:"vfd_motor_load_indicators",text:{ar:"هل توجد مؤشرات موثوقة على حمل زائد أو حرارة محرك أو خلل خرج؟",en:"Are there reliable indications of motor overload, motor temperature, or an output fault?",fr:"Existe-t-il des indications fiables de surcharge moteur, de température moteur ou de défaut de sortie ?"},options:[
          {id:"motor-overload-indicated",label:{ar:"يوجد مؤشر حمل زائد أو حرارة محرك مرتفعة",en:"Motor overload or high motor-temperature indication is present",fr:"Une indication de surcharge ou de température moteur élevée est présente"},evidence:["motor-overload-indicated"]},
          {id:"overcurrent-indicated",label:{ar:"الدليل المطابق يصنف الرمز كزيادة تيار",en:"Exact manual classifies the code as overcurrent",fr:"Le manuel exact classe le code comme surintensité"},evidence:["overcurrent-trip"]},
          {id:"earth-fault-indicated",label:{ar:"يوجد رمز أرضي/تسرب أرضي وفق الدليل المطابق",en:"Exact manual identifies an earth/ground-fault indication",fr:"Le manuel exact identifie un défaut de terre"},evidence:["earth-fault-trip"]},
          {id:"motor-load-indicators-normal",label:{ar:"المؤشرات المتاحة طبيعية مقارنة بخط الأساس",en:"Available indicators are normal against baseline",fr:"Les indicateurs disponibles sont normaux par rapport à la référence"},evidence:["motor-load-indicators-normal"]},
          {id:"motor-load-unknown",label:{ar:"لا توجد مؤشرات موثوقة",en:"No reliable indicators are available",fr:"Aucun indicateur fiable n’est disponible"},evidence:[]}
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
    },
    "motor|overheat": {
      equipment:"motor", symptom:"overheat",
      hypotheses:[
        {id:"motor_overload_or_application",knowledgeRecordId:"supplement-motor-overheat-general",sourceRefs:["epr-motor-overheating-guide"],label:{ar:"حمل ميكانيكي أو ظروف تشغيل غير مناسبة",en:"Mechanical overload or unsuitable operating conditions",fr:"Surcharge mécanique ou conditions d’exploitation inadaptées"},evidenceFor:["motor-load-high","duty-cycle-exceeded","process-demand-changed"],evidenceAgainst:["motor-load-baseline"],checks:["قارن الحمل والتيار والسرعة ودورة التشغيل بخط الأساس ولوحة البيانات ودليل المحرك؛ لا تغيّر إعدادات الحماية."]},
        {id:"motor_cooling_or_ventilation",knowledgeRecordId:"supplement-motor-overheat-general",sourceRefs:["epr-motor-overheating-guide"],label:{ar:"ضعف التبريد أو انسداد مسار التهوية",en:"Inadequate cooling or restricted ventilation",fr:"Refroidissement insuffisant ou ventilation obstruée"},evidenceFor:["cooling-path-obstructed","fan-fault-indicated","ambient-temperature-high"],evidenceAgainst:["cooling-indicators-normal"],checks:["راجع مؤشرات المروحة وفتحات التهوية وحرارة المحيط من الخارج وفي حالة آمنة؛ لا تزل الحواجز أثناء الدوران."]},
        {id:"motor_bearing_or_electrical",knowledgeRecordId:"supplement-motor-overheat-general",sourceRefs:["epr-motor-overheating-guide","skf-bearing-damage-troubleshooting"],label:{ar:"محامل أو خلل كهربائي محتمل — فحص مؤهل",en:"Possible bearing or electrical condition — qualified inspection",fr:"Défaut possible de roulement ou électrique — contrôle qualifié"},evidenceFor:["bearing-noise-or-vibration","current-imbalance-indicated","bearing-temperature-rise"],evidenceAgainst:["bearing-and-current-trends-normal"],checks:["وثّق اتجاهات الاهتزاز والحرارة والتيار من أنظمة القياس المعتمدة؛ الاختبارات الكهربائية والميكانيكية الداخلية تتطلب عزلًا وتحققًا من انعدام الطاقة بواسطة مختص."]}
      ],
      questions:[
        {id:"motor_heat_load",text:{ar:"هل تغيّر الحمل أو دورة التشغيل أو التيار مقارنة بخط الأساس؟",en:"Have load, duty cycle, or current changed from baseline?",fr:"La charge, le cycle de service ou le courant ont-ils changé par rapport à la référence ?"},options:[
          {id:"motor-load-high",label:{ar:"الحمل أو التيار أعلى من خط الأساس",en:"Load or current is above baseline",fr:"La charge ou le courant dépasse la référence"},evidence:["motor-load-high"]},
          {id:"duty-cycle-exceeded",label:{ar:"دورة التشغيل أو عدد مرات البدء أعلى من المعتاد",en:"Duty cycle or start frequency is higher than usual",fr:"Le cycle de service ou la fréquence de démarrage est supérieur à l’habitude"},evidence:["duty-cycle-exceeded"]},
          {id:"process-demand-changed",label:{ar:"تغيّر طلب العملية أو الحمل المقاد",en:"Process demand or driven load has changed",fr:"La demande du procédé ou la charge entraînée a changé"},evidence:["process-demand-changed"]},
          {id:"motor-load-baseline",label:{ar:"الحمل والتيار ضمن خط الأساس الموثق",en:"Load and current are within documented baseline",fr:"La charge et le courant restent dans la référence documentée"},evidence:["motor-load-baseline"]},
          {id:"unknown",label:{ar:"لا توجد بيانات موثوقة",en:"No reliable data available",fr:"Aucune donnée fiable disponible"},evidence:[]}
        ]},
        {id:"motor_cooling_status",text:{ar:"ما حالة التهوية والتبريد ودرجة حرارة المحيط حسب المؤشرات المتاحة؟",en:"What do available ventilation, cooling, and ambient-temperature indicators show?",fr:"Que montrent les indicateurs disponibles de ventilation, de refroidissement et de température ambiante ?"},options:[
          {id:"cooling-path-obstructed",label:{ar:"يوجد انسداد أو اتساخ ظاهر لمسار التهوية من الخارج",en:"External cooling path appears obstructed or dirty",fr:"Le circuit de refroidissement semble obstrué ou encrassé à l’extérieur"},evidence:["cooling-path-obstructed"]},
          {id:"fan-fault-indicated",label:{ar:"يوجد إنذار مروحة أو تبريد",en:"Fan or cooling alarm is present",fr:"Une alarme de ventilateur ou de refroidissement est présente"},evidence:["fan-fault-indicated"]},
          {id:"ambient-temperature-high",label:{ar:"حرارة المحيط أعلى من ظروف خط الأساس",en:"Ambient temperature is above baseline conditions",fr:"La température ambiante dépasse les conditions de référence"},evidence:["ambient-temperature-high"]},
          {id:"cooling-indicators-normal",label:{ar:"مؤشرات التبريد طبيعية",en:"Cooling indicators appear normal",fr:"Les indicateurs de refroidissement semblent normaux"},evidence:["cooling-indicators-normal"]},
          {id:"unknown",label:{ar:"غير معروف",en:"Unknown",fr:"Inconnu"},evidence:[]}
        ]},
        {id:"motor_bearing_electrical",text:{ar:"هل توجد مؤشرات مسجلة على اهتزاز/ضجيج محامل أو ارتفاع حرارة موضعي أو عدم توازن تيار؟",en:"Are there recorded signs of bearing vibration/noise, localized temperature rise, or current imbalance?",fr:"Existe-t-il des signes enregistrés de vibration/bruit de roulement, de hausse locale de température ou de déséquilibre du courant ?"},options:[
          {id:"bearing-noise-or-vibration",label:{ar:"اهتزاز أو ضجيج غير معتاد",en:"Unusual vibration or noise",fr:"Vibration ou bruit inhabituel"},evidence:["bearing-noise-or-vibration"]},
          {id:"bearing-temperature-rise",label:{ar:"ارتفاع حرارة المحمل مقارنة بخط الأساس",en:"Bearing temperature has risen against baseline",fr:"La température du roulement a augmenté par rapport à la référence"},evidence:["bearing-temperature-rise"]},
          {id:"current-imbalance-indicated",label:{ar:"عدم توازن تيار ظاهر في سجل موثوق",en:"Current imbalance appears in a reliable record",fr:"Un déséquilibre du courant apparaît dans un relevé fiable"},evidence:["current-imbalance-indicated"]},
          {id:"bearing-and-current-trends-normal",label:{ar:"لا توجد هذه المؤشرات في السجلات المتاحة",en:"These indicators are absent from available records",fr:"Ces indicateurs sont absents des relevés disponibles"},evidence:["bearing-and-current-trends-normal"]},
          {id:"unknown",label:{ar:"لا توجد سجلات أو قياسات موثوقة",en:"No reliable records or measurements",fr:"Aucun relevé ni mesure fiable"},evidence:[]}
        ]}
      ]
    },
    "compressor|overheat": {
      equipment:"compressor", symptom:"overheat",
      hypotheses:[
        {id:"compressor_cooling_air_or_water",knowledgeRecordId:"supplement-compressor-overheat-general",sourceRefs:["atlas-copco-compressor-troubleshooting","atlas-copco-compressor-overheating"],label:{ar:"ضعف تبريد الهواء أو ماء التبريد",en:"Insufficient air or cooling-water flow",fr:"Débit d’air ou d’eau de refroidissement insuffisant"},evidenceFor:["cooler-airflow-restricted","cooling-water-flow-low","hot-air-recirculation"],evidenceAgainst:["cooling-system-baseline"],checks:["راجع إنذارات التبريد ومؤشرات تدفق/حرارة ماء التبريد والتهوية من الواجهة أو نقاط القياس المعتمدة؛ لا تفتح مبردًا ساخنًا أو دائرة مضغوطة."]},
        {id:"compressor_oil_or_lubrication",knowledgeRecordId:"supplement-compressor-overheat-general",sourceRefs:["atlas-copco-compressor-overheating"],label:{ar:"مستوى الزيت أو الترشيح أو التزييت",en:"Oil level, filtration, or lubrication condition",fr:"Niveau d’huile, filtration ou lubrification"},evidenceFor:["oil-level-low-indicated","oil-filter-alert","oil-temperature-rise"],evidenceAgainst:["oil-status-baseline"],checks:["راجع مستوى الزيت والإنذارات وسجل الصيانة وفق إجراء المصنع والطراز؛ لا تضف زيتًا قبل التحقق من المواصفة والحالة الآمنة."]},
        {id:"compressor_load_or_operating_environment",knowledgeRecordId:"supplement-compressor-overheat-general",sourceRefs:["atlas-copco-compressor-overheating"],label:{ar:"حمل مرتفع أو ظروف تشغيل/محيط",en:"High load or operating/environmental conditions",fr:"Charge élevée ou conditions d’exploitation/d’environnement"},evidenceFor:["demand-or-load-high","ambient-temperature-high","frequent-cycling"],evidenceAgainst:["load-and-ambient-baseline"],checks:["قارن الطلب ودورات التحميل وحرارة غرفة الضاغط بخط الأساس؛ لا تعدّل الضغط أو صمام الأمان أو حدود الفصل."]}
      ],
      questions:[
        {id:"compressor_cooling",text:{ar:"ماذا تظهر مؤشرات التبريد والتهوية؟",en:"What do cooling and ventilation indicators show?",fr:"Que montrent les indicateurs de refroidissement et de ventilation ?"},options:[
          {id:"cooler-airflow-restricted",label:{ar:"تدفق هواء التبريد ضعيف أو المبرد متسخ/مسدود ظاهريًا",en:"Cooling airflow is low or cooler appears dirty/blocked",fr:"Le débit d’air de refroidissement est faible ou le refroidisseur semble encrassé/obstrué"},evidence:["cooler-airflow-restricted"]},
          {id:"cooling-water-flow-low",label:{ar:"يوجد إنذار/قراءة تدفق ماء تبريد منخفضة",en:"Cooling-water flow alarm or low reading is present",fr:"Une alarme ou une mesure de faible débit d’eau de refroidissement est présente"},evidence:["cooling-water-flow-low"]},
          {id:"hot-air-recirculation",label:{ar:"هواء ساخن يعاد تدويره إلى مدخل التبريد",en:"Hot air appears to recirculate to the cooling inlet",fr:"L’air chaud semble recirculer vers l’entrée de refroidissement"},evidence:["hot-air-recirculation"]},
          {id:"cooling-system-baseline",label:{ar:"مؤشرات التبريد ضمن خط الأساس",en:"Cooling indicators are within baseline",fr:"Les indicateurs de refroidissement sont dans la référence"},evidence:["cooling-system-baseline"]},
          {id:"unknown",label:{ar:"غير معروف",en:"Unknown",fr:"Inconnu"},evidence:[]}
        ]},
        {id:"compressor_oil",text:{ar:"ما حالة مستوى الزيت وإنذارات المرشح ودرجة حرارة الزيت حسب السجلات؟",en:"What do records show for oil level, filter alarms, and oil temperature?",fr:"Que montrent les relevés concernant le niveau d’huile, les alarmes de filtre et la température d’huile ?"},options:[
          {id:"oil-level-low-indicated",label:{ar:"مؤشر مستوى الزيت منخفض",en:"Low oil-level indication",fr:"Indication de niveau d’huile bas"},evidence:["oil-level-low-indicated"]},
          {id:"oil-filter-alert",label:{ar:"إنذار مرشح زيت أو صيانة مستحقة",en:"Oil-filter alarm or service indication",fr:"Alarme de filtre à huile ou entretien requis"},evidence:["oil-filter-alert"]},
          {id:"oil-temperature-rise",label:{ar:"حرارة الزيت ترتفع مقارنة بخط الأساس",en:"Oil temperature is rising against baseline",fr:"La température d’huile augmente par rapport à la référence"},evidence:["oil-temperature-rise"]},
          {id:"oil-status-baseline",label:{ar:"المؤشرات ضمن خط الأساس",en:"Indicators are within baseline",fr:"Les indicateurs sont dans la référence"},evidence:["oil-status-baseline"]},
          {id:"unknown",label:{ar:"لا توجد قراءة موثوقة",en:"No reliable reading",fr:"Aucune mesure fiable"},evidence:[]}
        ]},
        {id:"compressor_load",text:{ar:"هل تغيّر الحمل أو الطلب أو عدد دورات التحميل/التفريغ أو حرارة المحيط؟",en:"Have load, demand, load/unload cycling, or ambient temperature changed?",fr:"La charge, la demande, les cycles charge/décharge ou la température ambiante ont-ils changé ?"},options:[
          {id:"demand-or-load-high",label:{ar:"الطلب أو الحمل أعلى من المعتاد",en:"Demand or load is higher than usual",fr:"La demande ou la charge est supérieure à l’habitude"},evidence:["demand-or-load-high"]},
          {id:"ambient-temperature-high",label:{ar:"حرارة المحيط أعلى من خط الأساس",en:"Ambient temperature is above baseline",fr:"La température ambiante dépasse la référence"},evidence:["ambient-temperature-high"]},
          {id:"frequent-cycling",label:{ar:"تكرار التحميل والتفريغ أعلى من المعتاد",en:"Load/unload cycling is more frequent than usual",fr:"Les cycles charge/décharge sont plus fréquents que d’habitude"},evidence:["frequent-cycling"]},
          {id:"load-and-ambient-baseline",label:{ar:"الحمل والمحيط مستقران",en:"Load and ambient conditions are stable",fr:"La charge et les conditions ambiantes sont stables"},evidence:["load-and-ambient-baseline"]},
          {id:"unknown",label:{ar:"غير معروف",en:"Unknown",fr:"Inconnu"},evidence:[]}
        ]}
      ]
    },
    "bearing|vibration": {
      equipment:"bearing", symptom:"vibration",
      hypotheses:[
        {id:"bearing_lubrication_or_contamination",knowledgeRecordId:"supplement-bearing-vibration-general",sourceRefs:["skf-bearing-damage-troubleshooting","skf-iso-15243-bearing-analysis"],label:{ar:"تزييت غير مناسب أو تلوث",en:"Unsuitable lubrication or contamination",fr:"Lubrification inadaptée ou contamination"},evidenceFor:["lubrication-alert","contamination-indicated","lubricant-change-recent"],evidenceAgainst:["lubrication-record-normal"],checks:["راجع نوع وكمية وفترة التزييت وسجل التلوث وفق مواصفة المصنع؛ لا تخلط شحومًا أو تضف مادة دون التحقق من التوافق."]},
        {id:"bearing_mounting_or_alignment",knowledgeRecordId:"supplement-bearing-vibration-general",sourceRefs:["skf-bearing-damage-troubleshooting","skf-iso-15243-bearing-analysis"],label:{ar:"تركيب أو محاذاة أو تثبيت",en:"Mounting, alignment, or looseness",fr:"Montage, alignement ou desserrage"},evidenceFor:["alignment-deviation-recorded","looseness-indicated","recent-maintenance"],evidenceAgainst:["alignment-and-mounting-verified"],checks:["راجع تقرير المحاذاة والتثبيت وتاريخ الصيانة؛ الفحص الميكانيكي قرب الأجزاء الدوارة يتطلب إيقافًا وعزلًا والتحقق من الطاقة المخزنة."]},
        {id:"bearing_damage_or_external_excitation",knowledgeRecordId:"supplement-bearing-vibration-general",sourceRefs:["skf-bearing-damage-troubleshooting","skf-iso-15243-bearing-analysis"],label:{ar:"تلف محمل أو اهتزاز من المعدة/المصدر المجاور",en:"Bearing damage or vibration transmitted from adjacent equipment",fr:"Dommage du roulement ou vibration transmise par un équipement voisin"},evidenceFor:["bearing-frequency-pattern","bearing-temperature-rise","adjacent-machine-vibration"],evidenceAgainst:["bearing-spectrum-no-fault-pattern"],checks:["قارن طيف الاهتزاز واتجاهاته عند نقاط قياس ثابتة مع خط الأساس؛ لا تشخّص تلف المحمل من قيمة إجمالية واحدة أو من الصوت فقط."]}
      ],
      questions:[
        {id:"bearing_lubrication",text:{ar:"هل توجد تغييرات أو إنذارات في التزييت أو مؤشرات تلوث؟",en:"Are there lubrication changes/alarms or contamination indicators?",fr:"Existe-t-il des changements ou alarmes de lubrification ou des indices de contamination ?"},options:[
          {id:"lubrication-alert",label:{ar:"إنذار تزييت أو نقص موثق",en:"Lubrication alarm or documented shortage",fr:"Alarme de lubrification ou manque documenté"},evidence:["lubrication-alert"]},
          {id:"contamination-indicated",label:{ar:"مؤشر تلوث أو دخول ماء/جسيمات",en:"Contamination or water/particle ingress indicated",fr:"Contamination ou pénétration d’eau/particules indiquée"},evidence:["contamination-indicated"]},
          {id:"lubricant-change-recent",label:{ar:"تم تغيير نوع/دفعة مادة التزييت مؤخرًا",en:"Lubricant type or batch changed recently",fr:"Le type ou le lot de lubrifiant a changé récemment"},evidence:["lubricant-change-recent"]},
          {id:"lubrication-record-normal",label:{ar:"السجل لا يظهر تغيرًا أو إنذارًا",en:"Records show no change or alarm",fr:"Les relevés ne montrent aucun changement ni alarme"},evidence:["lubrication-record-normal"]},
          {id:"unknown",label:{ar:"لا توجد سجلات موثوقة",en:"No reliable records",fr:"Aucun relevé fiable"},evidence:[]}
        ]},
        {id:"bearing_alignment",text:{ar:"هل حدثت صيانة أو محاذاة أو تغيير تثبيت قبل ظهور الاهتزاز؟",en:"Was maintenance, alignment, or mounting changed before vibration appeared?",fr:"Une maintenance, un alignement ou un montage a-t-il été modifié avant l’apparition des vibrations ?"},options:[
          {id:"alignment-deviation-recorded",label:{ar:"تقرير المحاذاة يظهر انحرافًا",en:"Alignment report records a deviation",fr:"Le rapport d’alignement indique un écart"},evidence:["alignment-deviation-recorded"]},
          {id:"looseness-indicated",label:{ar:"يوجد مؤشر موثق على ارتخاء/تثبيت",en:"A documented looseness or mounting issue exists",fr:"Un desserrage ou problème de fixation est documenté"},evidence:["looseness-indicated"]},
          {id:"recent-maintenance",label:{ar:"بدأ الاهتزاز بعد صيانة أو فك/تركيب",en:"Vibration began after maintenance or disassembly/reassembly",fr:"Les vibrations ont commencé après maintenance ou démontage/remontage"},evidence:["recent-maintenance"]},
          {id:"alignment-and-mounting-verified",label:{ar:"المحاذاة والتثبيت موثقان ضمن الحدود المعتمدة",en:"Alignment and mounting are documented within approved limits",fr:"L’alignement et le montage sont documentés dans les limites approuvées"},evidence:["alignment-and-mounting-verified"]},
          {id:"unknown",label:{ar:"غير معروف",en:"Unknown",fr:"Inconnu"},evidence:[]}
        ]},
        {id:"bearing_spectrum",text:{ar:"هل تتوفر قراءة طيف اهتزاز واتجاهات حرارة للمحمل والمعدة المجاورة؟",en:"Are vibration spectra and bearing/adjacent-machine temperature trends available?",fr:"Dispose-t-on de spectres vibratoires et de tendances de température du roulement et de la machine voisine ?"},options:[
          {id:"bearing-frequency-pattern",label:{ar:"الطيف يظهر نمط ترددات مرتبطًا بالمحمل وفق التحليل",en:"Spectrum analysis identifies a bearing-related frequency pattern",fr:"L’analyse spectrale identifie un motif de fréquence lié au roulement"},evidence:["bearing-frequency-pattern"]},
          {id:"bearing-temperature-rise",label:{ar:"حرارة المحمل ترتفع عن خط الأساس",en:"Bearing temperature is rising above baseline",fr:"La température du roulement augmente au-dessus de la référence"},evidence:["bearing-temperature-rise"]},
          {id:"adjacent-machine-vibration",label:{ar:"اهتزاز مماثل موجود في معدة مجاورة",en:"Similar vibration is present on adjacent equipment",fr:"Une vibration similaire est présente sur un équipement voisin"},evidence:["adjacent-machine-vibration"]},
          {id:"bearing-spectrum-no-fault-pattern",label:{ar:"لا يظهر نمط تلف محمل في التحليل المتاح",en:"Available analysis shows no bearing-fault pattern",fr:"L’analyse disponible ne montre aucun motif de défaut de roulement"},evidence:["bearing-spectrum-no-fault-pattern"]},
          {id:"unknown",label:{ar:"لا تتوفر بيانات طيفية",en:"No spectrum data available",fr:"Aucune donnée spectrale disponible"},evidence:[]}
        ]}
      ]
    },
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
    const evidenceLabels = new Map();
    flow.questions.forEach(question => question.options.forEach(option => {
      const label = textFor(option.label, language);
      (Array.isArray(option.evidence) ? option.evidence : []).forEach(id => {
        if (typeof id === "string" && id && !evidenceLabels.has(id)) evidenceLabels.set(id, label);
      });
    }));
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
        supportingEvidenceLabels: support.map(id => evidenceLabels.get(id) || id),
        contradictingEvidenceLabels: contradictions.map(id => evidenceLabels.get(id) || id),
        knowledgeRecordId: h.knowledgeRecordId || "",
        sourceRefs: Array.isArray(h.sourceRefs) ? h.sourceRefs.slice() : [],
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
  function getFlowContract(flowId) {
    const flow = FLOWS[flowId];
    if (!flow) return null;
    return {
      flowId,
      equipment:flow.equipment,
      symptom:flow.symptom,
      hypothesisIds:flow.hypotheses.map(h=>h.id),
      hypothesisKnowledge:flow.hypotheses.map(h=>({
        id:h.id,
        knowledgeRecordId:h.knowledgeRecordId || "",
        sourceRefs:Array.isArray(h.sourceRefs) ? h.sourceRefs.slice() : []
      })),
      evidenceIds:[...new Set([...flow.questions.flatMap(q=>q.options.flatMap(o=>o.evidence||[])),...flow.hypotheses.flatMap(h=>[...(h.evidenceFor||[]),...(h.evidenceAgainst||[])])])]
    };
  }
  root.MaintenanceDiagnosticSession = Object.freeze({version:VERSION,createSession,answer,availableFlows:Object.keys(FLOWS),getFlowContract});
  if(typeof module!=="undefined"&&module.exports) module.exports=root.MaintenanceDiagnosticSession;
})(typeof globalThis!=="undefined"?globalThis:this);
