/* Structured, model-independent diagnostic flow data. Unknown values remain unknown. */
window.MAINTENANCE_DIAGNOSTIC_FLOWS = {
    "schemaVersion": 3,
    "flows": {
      "pump|low_flow": {
        "id": "pump-low-flow-v1",
        "equipmentId": "pump",
        "symptomId": "low_flow",
        "question": {
          "id": "pump-low-flow-suction-source-status",
          "text": "هل ضغط السحب/مستوى المصدر طبيعي حسب المؤشرات المتاحة؟"
        },
        "answers": [
          {
            "id": "source-normal",
            "label": "نعم، طبيعي",
            "guidance": "إذا كانت قراءة السحب والمصدر طبيعية، قارن ضغط الخروج والتدفق بخط الأساس ومنحنى المضخة؛ لا تفترض انسداد السحب."
          },
          {
            "id": "source-low-unstable",
            "label": "منخفض أو غير مستقر",
            "guidance": "انخفاض/عدم استقرار السحب قد يساهم في ضعف التدفق. أوقف وصعّد إذا ظهرت مؤشرات تشغيل ضار، وراجع المصدر وخط السحب وفق إجراء الموقع."
          },
          {
            "id": "source-no-reliable-reading",
            "label": "لا توجد قراءة موثوقة",
            "guidance": "لا تستنتج السبب دون قياس موثوق؛ اجمع قراءات معتمدة من نقاط القياس المحددة في دليل المعدة."
          }
        ]
      },
      "motor|not_start": {
        "id": "motor-no-start-v1",
        "equipmentId": "motor",
        "symptomId": "not_start",
        "question": { "id": "motor-no-start-control-state", "text": "ماذا يظهر في واجهة التحكم؟" },
        "answers": [
          { "id": "no-start-command", "label": "لا يوجد أمر تشغيل", "guidance": "اتبع مخطط التحكم المعتمد للتحقق من مصدر الأمر وشروط السماح من واجهة التحكم؛ لا تجسّر دوائر أو تتجاوز interlocks." },
          { "id": "command-with-trip", "label": "أمر موجود مع إنذار/فصل", "guidance": "احفظ رمز الإنذار وسجل الأحداث، وابحث عن السبب وفق دليل الموديل قبل أي إعادة ضبط." },
          { "id": "command-no-alarm", "label": "أمر موجود ولا يظهر إنذار", "guidance": "لا تكرر محاولات البدء؛ اطلب من شخص مؤهل التحقق من دائرة القدرة والحمل الميكانيكي وفق إجراءات العزل." },
          { "id": "state-unknown", "label": "غير معروف", "guidance": "لا تفترض وجود أمر أو غيابه؛ وثّق حالة الواجهة كما تظهر واطلب التحقق وفق مخطط التحكم المعتمد." }
        ]
      },
      "vfd|trip": {
        "id": "vfd-trip-v1",
        "equipmentId": "vfd",
        "symptomId": "trip",
        "question": { "id": "vfd-trip-event-log", "text": "هل سجل المغير رمز العطل قبل إعادة الضبط؟" },
        "answers": [
          { "id": "fault-code-saved", "label": "نعم، الرمز محفوظ", "guidance": "استخدم رمز العطل الكامل مع موديل المغير ودليل المصنع المطابق؛ لا تنقل معنى الرمز من موديل آخر." },
          { "id": "no-event-log", "label": "لا، لا يوجد سجل متاح", "guidance": "وثّق الرمز والظروف عند ظهور العطل قبل أي إعادة ضبط لاحقة؛ لا تكرر التشغيل إذا كان سبب الفصل مجهولًا." },
          { "id": "already-reset", "label": "تمت إعادة الضبط بالفعل", "guidance": "سجّل الظروف قبل/بعد إعادة الضبط، ولا تكررها إذا عاد العطل؛ افحص السبب وفق دليل الموديل." }
        ]
      },
      "compressor|low_pressure": {
        "id": "compressor-low-pressure-v1",
        "equipmentId": "compressor",
        "symptomId": "low_pressure",
        "question": { "id": "compressor-pressure-location", "text": "أين تظهر قراءة الضغط المنخفض مقارنة بقراءات موجودة وموثوقة؟" },
        "answers": [
          { "id": "compressor-output-low", "label": "ضغط مخرج الضاغط منخفض", "guidance": "راجع سجل الضاغط والإنذارات والقراءات المسجلة، ثم حالة المرشحات/المجفف وفق دليل الموديل؛ لا تغيّر نقاط الضبط أو صمام الأمان." },
          { "id": "network-pressure-drop", "label": "المخرج طبيعي ونقطة الاستخدام منخفضة", "guidance": "قارن القراءات من نقاط معتمدة وفي ظروف حمل متقاربة؛ راجع الشبكة والتسربات والمرشحات بالطريقة المعتمدة." },
          { "id": "pressure-reading-unknown", "label": "لا توجد قراءات مقارنة موثوقة", "guidance": "لا تستنتج السبب؛ اجمع قراءات ضغط معتمدة مع الوحدات ومواقع القياس قبل التمييز بين الضاغط والشبكة." }
        ]
      },
      "valve|not_start": {
        "id": "valve-no-response-v1",
        "equipmentId": "valve",
        "symptomId": "not_start",
        "question": { "id": "valve-command-and-position", "text": "ماذا يظهر من حالة الأمر والإنذار والموضع على واجهة التحكم المتاحة؟" },
        "answers": [
          { "id": "valve-command-missing", "label": "الأمر أو شرط السماح غير ظاهر", "guidance": "راجع حالة الأمر والإنذارات من واجهة التحكم ومخطط التحكم المعتمد؛ لا تتجاوز interlocks أو وسائل الحماية." },
          { "id": "valve-command-no-movement", "label": "الأمر ظاهر لكن الموضع لا يتغير", "guidance": "وثّق مؤشر الموضع والإنذار المتاح؛ اطلب فحص المشغل والتغذية بواسطة شخص مؤهل وفق إجراء العزل." },
          { "id": "valve-state-unknown", "label": "الحالة غير معروفة", "guidance": "احفظ حالة واجهة التحكم والإنذار قبل أي إعادة ضبط؛ لا تفتح اللوحة أو تفك الوصلات." }
        ]
      },
      "pneumatic|low_flow": {
        "id": "pneumatic-low-flow-v1",
        "equipmentId": "pneumatic",
        "symptomId": "low_flow",
        "question": { "id": "pneumatic-low-flow-pressure-status", "text": "ما حالة قراءة ضغط التغذية المتاحة مقارنة بخط الأساس المعتمد؟" },
        "answers": [
          { "id": "pneumatic-pressure-low", "label": "الضغط منخفض أو غير مستقر", "guidance": "وثّق القراءة والوحدة ونقطة القياس؛ افحص مؤشرات التسرب من الخارج فقط، واعزل الطاقة والضغط قبل أي تدخل وفق إجراء الموقع." },
          { "id": "pneumatic-pressure-normal", "label": "الضغط طبيعي حسب المؤشر", "guidance": "قارن زمن الدورة وحالة المشغل مع خط الأساس؛ لا تفترض أن الصمام أو الأسطوانة معطوبان دون دليل." },
          { "id": "pneumatic-pressure-unknown", "label": "لا توجد قراءة موثوقة", "guidance": "لا تستنتج السبب من الحركة وحدها؛ اطلب قراءة معتمدة قبل أي تدخل، ولا تفك الوصلات تحت الضغط." }
        ]
      },
      "gearbox|overheat": {
        "id": "gearbox-overheat-v1",
        "equipmentId": "gearbox",
        "symptomId": "overheat",
        "question": { "id": "gearbox-overheat-evidence", "text": "ما الأدلة المتاحة دون فتح المعدة أو لمس أسطح ساخنة؟" },
        "answers": [
          { "id": "gearbox-temp-trend-high", "label": "اتجاه الحرارة أعلى من خط الأساس", "guidance": "سجّل القراءة والوحدة ومكان القياس والحمل؛ قارنها بحدود دليل الطراز. أوقف وصعّد وفق إجراء الموقع إذا ظهرت علامات خطر." },
          { "id": "gearbox-leak-or-level-alert", "label": "يوجد تسرب ظاهر أو إنذار مستوى", "guidance": "وثّق التسرب والإنذار من موضع آمن؛ لا تفتح غطاء الزيت أو تضف زيتًا قبل العزل والتحقق من نوع الزيت وإجراء المصنع." },
          { "id": "gearbox-no-reliable-reading", "label": "لا توجد قراءة موثوقة", "guidance": "لا تحكم على درجة الحرارة باللمس؛ استخدم وسيلة قياس معتمدة بواسطة شخص مؤهل وقارنها بدليل الطراز." }
        ]
      },
      "bearing|vibration": {
        "id": "bearing-vibration-v1",
        "equipmentId": "bearing",
        "symptomId": "vibration",
        "question": { "id": "bearing-vibration-trend", "text": "هل توجد قراءة اهتزاز مسجلة يمكن مقارنتها بخط الأساس؟" },
        "answers": [
          { "id": "bearing-vibration-rising", "label": "الاهتزاز أعلى من خط الأساس", "guidance": "وثّق القيمة والوحدة وموقع واتجاه القياس وظروف الحمل؛ صعّد وفق حدود المصنع ولا تقترب من الأجزاء الدوارة." },
          { "id": "bearing-vibration-stable", "label": "القراءة مستقرة ضمن السجل المتاح", "guidance": "قارن الضوضاء ودرجة الحرارة وسجل التشحيم دون لمس الأجزاء؛ لا تعتبر الاستقرار وحده دليلًا على سلامة المحمل." },
          { "id": "bearing-vibration-unknown", "label": "لا توجد قراءة قابلة للمقارنة", "guidance": "لا تصنّف شدة الاهتزاز بالانطباع فقط؛ اطلب قياسًا موحدًا بواسطة شخص مؤهل وفق إجراء الموقع." }
        ]
      },
      "plc|not_start": {
        "id": "plc-no-start-v1",
        "equipmentId": "plc",
        "symptomId": "not_start",
        "question": { "id": "plc-no-start-status", "text": "ما الحالة الظاهرة للأمر وشروط السماح والإنذارات في HMI؟" },
        "answers": [
          { "id": "plc-command-not-present", "label": "أمر التشغيل غير ظاهر", "guidance": "سجّل حالة الأمر والإنذارات الظاهرة واتبع مخطط التحكم المعتمد؛ لا تجسّر المداخل أو تتجاوز interlocks." },
          { "id": "plc-interlock-or-trip", "label": "شرط سماح غير متحقق أو فصل ظاهر", "guidance": "احفظ رمز الإنذار وتسلسل الأحداث وراجع منطق التشغيل المعتمد؛ لا تفرض خرجًا ولا تعطّل حماية." },
          { "id": "plc-state-unknown", "label": "الحالة غير واضحة", "guidance": "التقط وصف الحالة الظاهر فقط وصعّد إلى شخص مؤهل؛ لا تغيّر البرنامج أو القيم أثناء التشخيص." }
        ]
      },
      "conveyor|tracking": {
        "id": "conveyor-tracking-v1",
        "equipmentId": "conveyor",
        "symptomId": "tracking",
        "question": { "id": "conveyor-tracking-observation", "text": "ما الذي يمكن ملاحظته من خارج منطقة الخطر أثناء التشغيل أو بعد التوقف الآمن؟" },
        "answers": [
          { "id": "conveyor-belt-offset", "label": "السير منحرف عن المسار", "guidance": "لا تقترب من السير المتحرك أو تحاول ضبطه أثناء التشغيل؛ أوقف وصعّد وفق إجراء العزل قبل الفحص." },
          { "id": "conveyor-material-build-up", "label": "تراكم مادة ظاهر من موضع آمن", "guidance": "وثّق الموقع والصورة إن كان ذلك آمنًا؛ لا تنظف قرب الأجزاء المتحركة، وطبّق العزل والتحقق من الطاقة قبل الإزالة." },
          { "id": "conveyor-tracking-unknown", "label": "لا يمكن تحديد الحالة بأمان", "guidance": "لا تدخل منطقة السير ولا تزل الحواجز؛ أوقف وصعّد للمسؤول إذا تعذر الفحص من موضع آمن." }
        ]
      },

      "motor|overheat": {
        "id": "motor-overheat-v1",
        "equipmentId": "motor",
        "symptomId": "overheat",
        "question": {
          "id": "motor-overheat-baseline",
          "text": "هل توجد قراءات موثوقة للحمل والتيار والحرارة مقارنة بخط الأساس؟",
          "translations": {
            "ar": "هل توجد قراءات موثوقة للحمل والتيار والحرارة مقارنة بخط الأساس؟",
            "en": "Are reliable load, current, and temperature readings available for comparison with the baseline?",
            "fr": "Dispose-t-on de mesures fiables de charge, de courant et de température à comparer à la référence ?"
          }
        },
        "answers": [
          {
            "id": "motor-overheat-change",
            "label": "يوجد تغير عن خط الأساس",
            "labelTranslations": {
              "ar": "يوجد تغير عن خط الأساس",
              "en": "A change from baseline is recorded",
              "fr": "Un écart par rapport à la référence est constaté"
            },
            "guidance": "سجّل الحمل والتيار والحرارة ومكان القياس وقارنها ببيانات المصنع؛ لا تغيّر إعدادات الحماية.",
            "guidanceTranslations": {
              "ar": "سجّل الحمل والتيار والحرارة ومكان القياس وقارنها ببيانات المصنع؛ لا تغيّر إعدادات الحماية.",
              "en": "Record load, current, temperature, and measurement location; compare them with manufacturer data. Do not change protection settings.",
              "fr": "Consignez la charge, le courant, la température et le point de mesure, puis comparez-les aux données du fabricant. Ne modifiez pas les réglages de protection."
            }
          },
          {
            "id": "motor-overheat-no-change",
            "label": "لا يظهر تغير واضح",
            "labelTranslations": {
              "ar": "لا يظهر تغير واضح",
              "en": "No clear change is indicated",
              "fr": "Aucun changement net n’est indiqué"
            },
            "guidance": "راجع مؤشرات التبريد وسجل المحامل من مصادر معتمدة؛ لا تفتح لوحة حية.",
            "guidanceTranslations": {
              "ar": "راجع مؤشرات التبريد وسجل المحامل من مصادر معتمدة؛ لا تفتح لوحة حية.",
              "en": "Review cooling indicators and bearing history from approved sources; do not open an energized panel.",
              "fr": "Consultez les indicateurs de refroidissement et l’historique des roulements à partir de sources approuvées ; n’ouvrez pas une armoire sous tension."
            }
          },
          {
            "id": "motor-overheat-unknown",
            "label": "لا توجد بيانات موثوقة",
            "labelTranslations": {
              "ar": "لا توجد بيانات موثوقة",
              "en": "No reliable data is available",
              "fr": "Aucune donnée fiable n’est disponible"
            },
            "guidance": "لا تستنتج السبب دون قياس موثوق؛ اطلب فحصًا مؤهلًا عند الحاجة.",
            "guidanceTranslations": {
              "ar": "لا تستنتج السبب دون قياس موثوق؛ اطلب فحصًا مؤهلًا عند الحاجة.",
              "en": "Do not infer a cause without reliable measurements; request a qualified inspection when needed.",
              "fr": "Ne déduisez pas de cause sans mesures fiables ; demandez une inspection par une personne qualifiée si nécessaire."
            }
          }
        ],
        "uiText": {
          "answerPlaceholder": {
            "ar": "اختر الإجابة إن كانت معلومة",
            "en": "Select an answer if known",
            "fr": "Sélectionnez une réponse si elle est connue"
          },
          "emptyMessage": {
            "ar": "لا يوجد سؤال متخصص لهذا الاختيار بعد؛ سجّل القياسات والإنذار كما هي.",
            "en": "No dedicated follow-up is available for this selection yet; record readings and alarms as observed.",
            "fr": "Aucune question de suivi dédiée n’est encore disponible pour ce choix ; consignez les mesures et alarmes telles qu’observées."
          }
        }
      },
      "compressor|overheat": {
        "id": "compressor-overheat-v1",
        "equipmentId": "compressor",
        "symptomId": "overheat",
        "question": {
          "id": "compressor-overheat-indicators",
          "text": "ما حالة مؤشرات التبريد والزيت والحمل؟",
          "translations": {
            "ar": "ما حالة مؤشرات التبريد والزيت والحمل؟",
            "en": "What do the cooling, oil, and load indicators show?",
            "fr": "Que montrent les indicateurs de refroidissement, d’huile et de charge ?"
          }
        },
        "answers": [
          {
            "id": "compressor-overheat-cooling",
            "label": "يوجد إنذار تبريد أو تهوية",
            "labelTranslations": {
              "ar": "يوجد إنذار تبريد أو تهوية",
              "en": "A cooling or ventilation alarm is present",
              "fr": "Une alarme de refroidissement ou de ventilation est présente"
            },
            "guidance": "راجع مؤشرات التبريد والتهوية من الواجهة؛ لا تفتح دائرة ساخنة أو مضغوطة.",
            "guidanceTranslations": {
              "ar": "راجع مؤشرات التبريد والتهوية من الواجهة؛ لا تفتح دائرة ساخنة أو مضغوطة.",
              "en": "Review cooling and ventilation indicators on the interface; do not open a hot or pressurized circuit.",
              "fr": "Consultez les indicateurs de refroidissement et de ventilation sur l’interface ; n’ouvrez pas un circuit chaud ou sous pression."
            }
          },
          {
            "id": "compressor-overheat-oil",
            "label": "يوجد إنذار زيت أو مرشح",
            "labelTranslations": {
              "ar": "يوجد إنذار زيت أو مرشح",
              "en": "An oil or filter alarm is present",
              "fr": "Une alarme d’huile ou de filtre est présente"
            },
            "guidance": "راجع مستوى الزيت والمرشح وسجل الصيانة وفق دليل الطراز.",
            "guidanceTranslations": {
              "ar": "راجع مستوى الزيت والمرشح وسجل الصيانة وفق دليل الطراز.",
              "en": "Review oil level, filter status, and maintenance history against the exact model manual.",
              "fr": "Vérifiez le niveau d’huile, l’état du filtre et l’historique d’entretien selon le manuel du modèle exact."
            }
          },
          {
            "id": "compressor-overheat-unknown",
            "label": "لا توجد مؤشرات موثوقة",
            "labelTranslations": {
              "ar": "لا توجد مؤشرات موثوقة",
              "en": "No reliable indicators are available",
              "fr": "Aucun indicateur fiable n’est disponible"
            },
            "guidance": "لا تخمّن السبب؛ احفظ الإنذار والقراءات واطلب فحصًا مؤهلًا.",
            "guidanceTranslations": {
              "ar": "لا تخمّن السبب؛ احفظ الإنذار والقراءات واطلب فحصًا مؤهلًا.",
              "en": "Do not guess the cause; save the alarm and readings and request a qualified inspection.",
              "fr": "Ne devinez pas la cause ; enregistrez l’alarme et les mesures et demandez une inspection qualifiée."
            }
          }
        ],
        "uiText": {
          "answerPlaceholder": {
            "ar": "اختر الإجابة إن كانت معلومة",
            "en": "Select an answer if known",
            "fr": "Sélectionnez une réponse si elle est connue"
          },
          "emptyMessage": {
            "ar": "لا يوجد سؤال متخصص لهذا الاختيار بعد؛ سجّل القياسات والإنذار كما هي.",
            "en": "No dedicated follow-up is available for this selection yet; record readings and alarms as observed.",
            "fr": "Aucune question de suivi dédiée n’est encore disponible pour ce choix ; consignez les mesures et alarmes telles qu’observées."
          }
        }
      },
      "thermal|overheat": {
        "id": "thermal-overheat-v1",
        "equipmentId": "thermal",
        "symptomId": "overheat",
        "question": { "id": "thermal-overheat-reading", "text": "هل توجد قراءة حرارة موثوقة مع وحدة ومكان قياس محددين؟" },
        "answers": [
          { "id": "thermal-reading-above-baseline", "label": "القراءة أعلى من خط الأساس", "guidance": "سجّل القراءة والوحدة والحمل وقارنها بحدود دليل الطراز؛ صعّد عند تجاوز الحدود أو ظهور إنذار، ولا تغيّر نقاط الضبط." },
          { "id": "thermal-flow-or-fan-alert", "label": "يوجد إنذار تدفق أو مروحة", "guidance": "وثّق الإنذار من الواجهة؛ لا تفتح أغطية ولا تلمس أسطحًا ساخنة، واطلب الفحص بعد العزل والتبريد وفق إجراء الموقع." },
          { "id": "thermal-reading-unknown", "label": "لا توجد قراءة موثوقة", "guidance": "لا تعتمد على اللمس أو التخمين؛ اطلب قياسًا معتمدًا بواسطة شخص مؤهل قبل استنتاج السبب." }
        ]
      }
    }
};

/**
 * Returns a backwards-compatible, language-resolved view of a legacy follow-up flow.
 * Existing string fields remain intact for older consumers.
 */
window.MAINTENANCE_DIAGNOSTIC_FLOWS.getLocalizedFollowup = function (key, language) {
  const flow = this.flows && this.flows[key];
  if (!flow) return null;
  const lang = ["ar", "en", "fr"].includes(language) ? language : "ar";
  const resolve = (translations, fallback) => {
    if (translations && typeof translations === "object" && !Array.isArray(translations)) {
      return translations[lang] || translations.ar || translations.en || fallback || "";
    }
    return typeof fallback === "string" ? fallback : "";
  };
  const question = flow.question || {};
  const uiText = flow.uiText || {};
  return {
    question: resolve(question.translations, question.text),
    answers: Array.isArray(flow.answers) ? flow.answers.map(answer => ({
      ...answer,
      label: resolve(answer && answer.labelTranslations, answer && answer.label),
      guidance: resolve(answer && answer.guidanceTranslations, answer && answer.guidance)
    })) : [],
    placeholder: resolve(uiText.answerPlaceholder, lang === "en"
      ? "Select an answer if known"
      : lang === "fr" ? "Sélectionnez une réponse si elle est connue" : "اختر الإجابة إن كانت معلومة"),
    emptyMessage: resolve(uiText.emptyMessage, lang === "en"
      ? "No dedicated follow-up is available for this selection yet; record readings and alarms as observed."
      : lang === "fr" ? "Aucune question de suivi dédiée n’est encore disponible pour ce choix ; consignez les mesures et alarmes telles qu’observées."
      : "لا يوجد سؤال متخصص لهذا الاختيار بعد؛ سجّل القياسات والإنذار كما هي.")
  };
};
