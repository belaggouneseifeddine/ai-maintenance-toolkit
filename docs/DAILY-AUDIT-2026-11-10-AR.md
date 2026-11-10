# تقرير التدقيق اليومي — 2026-11-10

## 1. الحالة الفعلية للمستودع

- **main:** آخر commit تمت مقارنته هو `220aa3ff6c0ee05d94cfdfe213dfa00e07357534`.
- **العمل السابق:** PR #132 بعنوان متطلبات/بحث المصادر، ما يزال Draft ومفتوحًا وغير مدمج. فرعه `docs/master-requirements-open-source-research-2026-11-09` عند `b63a439a584398353083ab498943d0638dd92529`، متقدم 33 commit عن main ومتأخر 0، ويضم 23 ملفًا متغيرًا (+2,505 / -29).
- **فرع هذا التدقيق:** `research/daily-audit-2026-11-10`، أُنشئ من رأس PR #132. كل التعديلات في هذا الفرع وثائق وسجل مصادر فقط. لم يتغير runtime، ولم يحدث merge أو Production deploy.
- **حالة CI على رأس PR #132 بتاريخ 2026-11-09 19:35 UTC:** جميع workflows الأخيرة نجحت:
  - 240/240 اختبار Node في مجموعة Maintenance Toolkit.
  - 67/67 اختبارًا لـ diagnostic session وWorker contract.
  - 6/6 اختبارات CORS.
  - 20 اختبار Python للتحقق من المعرفة واستخراج المصادر.
  - نجحت فحوص HTTPS للمصادر المسموح بها، وفحص صحة التطبيق المنشور وWorker كما نفّذته CI.
- كان هناك فشل على commit وسيط `af792fb5...` بسبب اختلاف في اختبار URMA بين ادعاء الترخيص في manifest وترخيص المصدر الأصلي غير المتحقق. رأس PR النهائي يميز الآن بينهما ونجح الاختبار. لا أعدّ فشل commit الوسيط فشلًا للحالة الحالية.
- التحذير `failedOptionalAssets: 1/7` في اختبار Offline مقصود: ملف الاختبار يحاكي 404 اختياريًا لـ `oem-platform-index.json` ويتحقق من أن فشل مرجع اختياري لا يمنع تثبيت Core App Shell. ليس دليلًا على عطل حي في التطبيق.
- **غير مثبت بعد:** اختبار فعلي على هاتف Android في وضع الطيران، قياس الأداء على جهاز منخفض المواصفات، جودة استدلال نموذج حي، واختبار ميداني مع فنيين.

## 2. التغييرات المنفذة في فرع هذا التدقيق

1. تحديث `knowledge/open-knowledge-source-register.json`:
   - تحديث فهرس awesome-industrial-datasets من 199 إلى 297 مدخلًا وفق README الحالي.
   - إضافة awesome-bearing-dataset وluciaparvaz/hydraulic-predictive-maintenance وBrick Schema.
   - توسيع مراجعة JonMuel، وPlantCraft، وNASA ProgPy.
   - إعادة فحص شروط UCI 447 وLBNL FDD وMIMII.
   - إبقاء URMA-CRTI معلّقًا حتى التحقق من صفحة Zenodo الأصلية.
2. إضافة مراجعة أدلة runtime إلى `docs/DIAGNOSTIC-KNOWLEDGE-CASEBOOK-CENTRIFUGAL-PUMP-PILOT.md`.
3. تحديث `docs/DIAGNOSTIC-ARCHITECTURE-ROADMAP.md` بأولويات 2026-11-10 وبوابات قبول المعرفة.
4. إنشاء هذا التقرير.
5. لم تُنسخ بيانات telemetry أو نصوص معايير أو كتيبات OEM أو كود من المستودعات المرشحة. لم تتغير ملفات faults runtime أو Worker أو واجهة المستخدم.

## 3. التدقيق الصارم للتطبيق

### البنية وجودة الكود

التطبيق ما يزال PWA خفيفًا يعتمد HTML/CSS/JavaScript دون طبقة build أو TypeScript أو حزم domain واضحة. هذا يخدم التشغيل المحلي وسهولة النشر، لكنه يزيد صعوبة الصيانة كلما اتسعت قاعدة المعرفة.

أحجام الملفات الحالية من Git tree:
- `index.html`: 97,402 bytes.
- `diagnostic-engine.js`: 45,214 bytes.
- `diagnostic-session.js`: 45,377 bytes.
- `diagnostic-flows.js`: 16,192 bytes.
- `bayesian-engine.js`: 6,777 bytes.
- `worker.js`: 70,676 bytes.
- `faults.json`: 1,128,130 bytes.
- `knowledge/oem-verified-faults.json`: 410,157 bytes.
- `diagnostic-evidence-register.json`: 122,168 bytes.
- `knowledge/manufacturer-machine-fault-matrix.json`: 59,742 bytes.
- `knowledge/faults-supplement.json`: 20,443 bytes.

الملفات ليست ضخمة بمعايير الخادم، لكنها تمثل حملًا ملموسًا على أول تحميل وذاكرة الهاتف. لا يوجد benchmark موثق لزمن parse/search أو استهلاك الذاكرة على Android.

### محرك التشخيص والاستدلال

- المحرك المحلي العام ما يزال keyword/rule matching مع aliases وأوزان ثابتة. درجة التطابق ليست احتمالًا إحصائيًا، ولا تثبت السبب الجذري.
- توجد 13 تدفقة equipment/symptom؛ 6 جلسات تكيفية و7 إدخالات single-step. تدفق المضخة الحالي يركز على `pump|low_flow` ويجمع الأسباب في ثلاث فرضيات واسعة: مصدر/سحب، تقييد مسار التدفق/وضع الصمام، وظروف التشغيل.
- طبقة Bayesian الحالية تستخدم prior ثابتًا 0.2 وlikelihood ratio ثابتًا 1.5 في log-odds. لا يوجد تعلم priors/CPDs من بيانات ميدانية، ولا calibration موثق، ولا Brier/ECE على مجموعة اختبار مستقلة. لذلك لا يصح تسميتها Bayesian Network معايرة.
- اختيار السؤال التالي يعتمد على فصل الفرضيات بحسب اختلاف نتائج الإجابات (pairwise separation)، وليس حساب posterior entropy وExpected Information Gain الحقيقي. كما لا يوازن حاليًا بين قيمة المعلومات والسلامة والوقت والتكلفة.
- Worker retrieval يستخدم BM25 lexical ranking مع fallback قديم. يجلب Markdown من مسار raw الخاص بفرع `main` ويخزنه مؤقتًا داخل isolate. لا توجد Embeddings أو Vector DB، كما أن المصدر ليس مثبتًا إلى commit مراجَع؛ وقد تتغير المعرفة المسترجعة دون إصدار knowledge bundle محدد.

### المعرفة والأدلة

تمت قراءة ملف faults.json كاملًا عبر Git blob، وليس الاعتماد على README:
- 284 سجلًا أساسيًا، 37 equipment labels، و17 سجل مضخة.
- سجلات المضخة السبعة عشر كلها بلا sourceRefs؛ كما تظهر في evidence register بحالة source-not-recorded وصفر مراجع.
- يوجد تداخل واضح بين `pump-mechanical-seal-leak` و`pump-seal-leak`.
- السجل `pump-excessive-flow` يحمل symptom `low_flow`؛ هذا تعارض تصنيفي يحتاج مراجعة قبل أي إصلاح للبيانات.
- `diagnostic-evidence-register.json`: 287 سجلًا؛ 171 source-not-recorded، و56 review-needed، و60 verified. كلمة verified تعني أن الادعاء راجع مصدره ونطاقه؛ لا تعني أنه validated ميدانيًا.
- `knowledge/oem-verified-faults.json`: 99 سجلًا ولا يوجد بينها سجل مضخة.
- `knowledge/manufacturer-machine-fault-matrix.json`: 28 manufacturer profiles و38 case templates؛ قوالب إرشادية عامة وليست تعريفات أعطال موثقة لطراز محدد.
- `knowledge/faults-supplement.json`: ثلاثة سجلات عامة (motor overheating، compressor overheating، bearing vibration)، ولا يحتوي حالات مضخة.
- `knowledge/sources.json`: مصدران بحثيان مفتوحان تمت مراجعتهما للـ pilot، وخمسة OEM/support portals مرجعية فقط.

النتيجة: حجم قاعدة الأعطال لا يساوي جودة المعرفة. أكبر نقص حالي هو غياب traceability للمضخة، والتكرار/التناقض، وعدم وجود اختبارات تفريقية لكل حالة.

### السلامة والأمن

إيجابيات مثبتة في Worker:
- CORS allowlist لأصول التطبيق المعروفة.
- حد لحجم الطلب 8 KiB.
- rate limiter مضبوط في wrangler على 10 طلبات لكل 60 ثانية.
- validation للمدخلات ومخرجات النموذج، مع schema محدود.
- deterministic safety gate قبل استدعاء النموذج في الحالات الخطرة.
- مفاتيح المزود تُقرأ من environment bindings، ولا تظهر في client source.
- توجد اختبارات CORS وعقود Worker واختبارات لرفض بعض طلبات تجاوز الحماية.

القيود:
- CORS ليس Authentication؛ يمكن لعميل غير متصفح إرسال طلب HTTP مباشرة. rate limiting والمراقبة ضروريان.
- وجود checkbox أو إقرار LOTO ليس إثباتًا للعزل الفعلي.
- يجب توحيد safety gate في التشخيص المحلي والجلسات الموجهة ومسار AI؛ لا يكفي أن يكون موجودًا في Worker وحده.
- لا يوجد اختبار اختراق مستقل أو إثبات أمني ميداني.
- Worker يسترجع وثائق من GitHub raw main؛ يلزم تثبيت الإصدار والتحقق من hash ومنع تغير المصدر غير المراجع.

### سهولة الاستخدام والعمل دون اتصال

- التطبيق يوفر واجهات تشخيص، مساعد AI، قاعدة أعطال، سلامة وسجل صيانة، مع العربية/الفرنسية/الإنجليزية.
- كثرة المسارات والحقول تجعل الفني ينتقل بين إدخال الأعراض، المحادثة، قاعدة الأعطال، السلامة والسجل. ينقصه مسار حالة تشخيص واحد يعرض التقدم والفرضيات والأدلة والاختبار التالي في شاشة مترابطة.
- النموذج الحالي يمرر القراءات غالبًا كنص حر مع measurementStatus عام؛ لا يحفظ بصورة typed: قيمة، وحدة، نقطة قياس، جهاز، calibration، وقت، حالة تشغيل، ومصدر القراءة.
- سجلات الصيانة والمسودات في localStorage، والصور في IndexedDB؛ لا يوجد مزامنة متعددة الأجهزة أو حل تعارضات. التصدير اليدوي ليس Backup/Restore مختبرًا.
- Service Worker يخزن الأصول الأساسية والمراجع الاختيارية. التشخيص المحلي يمكن أن يعمل بعد التخزين، لكن AI cloud يتطلب اتصالًا، ولا يوجد نموذج محلي ولا Semantic Search محلي.

### التعاون والتوسع

لا يوجد حاليًا نظام مكتمل للمساهمات يتضمن هوية، صلاحيات، مراجعة فنية، سجل تدقيق، خلافات، إصدارات للمعرفة ومزامنة آمنة. لا أوصي بفتح الكتابة العامة قبل بناء هذا المسار.

## 4. مراجعة Pilot مضخة الطرد المركزي

ملف الحالة الحالي جيد كوثيقة تصميم: يحدد خريطة مكونات، حقول قياس، حدود التفسير، اختبارات قبول، ومبدأ عدم إدخال thresholds عامة. لكنه ليس بعد ست حالات تشخيص مكتملة قابلة للتشغيل.

المصدران اللذان تمت مراجعتهما:
1. Ahmad et al. (2021)، PMCID PMC8747656، DOI 10.3390/s22010179، CC BY 4.0. تجربة واحدة على مضخة PMT-4008 متعددة المراحل، محرك 5.5 kW، سرعة 1733 rpm، ماء، أربعة accelerometers، وحالات معطوبة مزروعة تخص ثقب/خدش mechanical seal وimpeller defect. الورقة لا تثبت cavitation أو air lock أو suction blockage أو low-flow ميدانيًا؛ وتذكر cavitation كعمل مستقبلي.
2. Irfan et al. (2021)، PMCID PMC8234243، DOI 10.3390/s21124225، CC BY 4.0. تجربة مخبرية على محرك 2 HP ومحمل 6202-2z، عيبين مزروعين، وميزات current/voltage/instantaneous power مع 640 عينة عبر ثلاثة أحمال وتقسيم 70/30. لا توفر الورقة بيانات خامًا، ولا تحدد حدودًا ميدانية لمحامل مضخات مختلفة.

| الحالة | القرار الحالي | الفجوة |
|---|---|---|
| Cavitation | Candidate فقط | لا يوجد مصدر reviewed يثبت آلية/اختبارات/حدودًا ضمن نطاق تشغيل محدد |
| Air Lock | بانتظار مصدر | لا يوجد فصل موثق عن air ingress أو low suction level أو priming failure |
| Suction Blockage | بانتظار مصدر | يلزم فصل suction-side restriction عن discharge restriction وair lock |
| Low Flow | عرض عام فقط | يلزم pump curve وduty point وقراءات موثقة، ولا يجوز تحويل العرض إلى سبب |
| Mechanical Seal Leakage | مرجع بحثي محدود | التجربة المزروعة لا تحدد leakage rate أو إجراء فحص ميداني آمنًا |
| Bearing Degradation | مرجع بحثي محدود | لا توجد حدود vibration/temperature عامة أو تحقق ميداني للطراز |

لا تُضاف أي من الحالات إلى runtime الآن. بيانات UCI عن internal pump leakage هي labels لظروف منصة اختبار، وليست حالة cavitation أو تعليمات إصلاح. بيانات MIMII الصوتية لاكتشاف anomaly، ولا تكشف السبب الجذري بمفردها.

## 5. جرد المستودعات والبيانات — ما تمت مراجعته فعليًا

| المصدر | التحديث/الإصدار | ترخيص الكود | ترخيص البيانات/المحتوى | الملفات/المواضع التي تمت مراجعتها | القرار |
|---|---|---|---|---|---|
| [industrial-ops-rag-agent](https://github.com/yilin-2511/industrial-ops-rag-agent) | آخر push ظاهر 2026-06-02؛ بلا release | MIT في LICENSE | لا يوجد ترخيص منفصل واضح لـ knowledge_base أو CSV | README، LICENSE، knowledge_base.json، fault_cases.json، pump CSV، requirements.txt | استخدام مرجعي/استخراج معزول فقط؛ لا استيراد بيانات |
| [BearingDatasets](https://github.com/VictorBauler/BearingDatasets) | v0.3.0؛ updated 2026-11-04؛ 70 dataset.yaml manifests (منها private example) | MIT في pyproject/LICENSE | لكل dataset ترخيصها المستقل | README، LICENSE، pyproject، URMA dataset.yaml وfiles.lock | Metadata فقط؛ URMA بانتظار تحقق Zenodo |
| [awesome-industrial-datasets](https://github.com/jonathanwvd/awesome-industrial-datasets) | updated/pushed 2026-11-10؛ 297 مدخلًا في README | لا يفترض وجود كود لإعادة الاستخدام | CC BY-NC 4.0 لفهرس المحتوى؛ datasets لها تراخيص مستقلة | README، LICENSE، روابط UCI/3W/DAMADICS | Discovery فقط؛ لا تنسخ وصف الفهرس تجاريًا |
| [awesome-bearing-dataset](https://github.com/VictorBauler/awesome-bearing-dataset) | updated 2026-11-02؛ لا release | MIT | كل dataset مرتبط له شروطه | README، LICENSE، docs/datasets.md | Discovery فقط |
| [AAS metamodel](https://github.com/admin-shell-io/aas-specs-metamodel) | v3.2.0؛ updated 2026-10-28 | محتوى specification/schema | CC BY 4.0 | README، LICENSE.txt، schemas/json README وaas.json | مرجع لنموذج الأصل والخصائص، وليس fault ontology |
| [Brick Schema](https://github.com/BrickSchema/Brick) | v1.5.0؛ updated 2026-11-09 | BSD-3-Clause | BSD-3-Clause للملفات المراجعة | README، LICENSE، bricksrc/ontology.py، chiller-plant.ttl | مرجع ontology لـ HVAC؛ لا fault rules |
| [MIMII baseline](https://github.com/MIMII-hitachi/mimii_baseline) | code push 2022-12-27؛ لا release حديث | لا يوجد LICENSE؛ header يقول all rights reserved | Dataset منفصل CC BY-SA 4.0 | readme، requirements، baseline.py، Zenodo record | Dataset benchmark فقط؛ ممنوع نسخ baseline code |
| [MIMII public 1.0](https://zenodo.org/records/3384388) | public 1.0؛ 100.2 GB | لا ينطبق | CC BY-SA 4.0 | صفحة Zenodo، أنواع المعدات، حجم الملفات، الشروط | Benchmark anomaly صوتي فقط؛ لا تنزيل |
| [NASA ProgPy](https://github.com/NASA/progpy) | v1.9.0؛ updated 2026-11-05 | NASA-1.3 حسب pyproject؛ PDFs موجودة ولم تُراجع بنودها كاملة | لا ترخيص dataset مستقل تمت مراجعته | README، pyproject، root listing للـ license PDFs | مرجع بحثي فقط حتى مراجعة شروط NOSA |
| [pgmpy](https://github.com/pgmpy/pgmpy) | v1.1.2؛ updated 2026-11-09 | MIT | لا dataset مرفق | README، LICENSE، pyproject | تجربة Bayesian offline فقط؛ لا Python runtime في Android/Worker |
| [PlantCraft](https://github.com/PlantCraft/PlantCraft) | v0.6.0؛ updated 2026-11-09 | Apache-2.0 | لا ترخيص مستقل للبيانات التجريبية تم التحقق منه | README، LICENSE، how-it-works، security-guide، requirements، stack، SPEC، install-offline، simulator README | مرجع معماري/محاكاة؛ متطلبات multi-service لا تناسب Android/Worker |
| [UCI hydraulic dataset 447](https://archive.ics.uci.edu/dataset/447/condition+monitoring+of+hydraulic+systems) | donated 2018؛ 2,205 cycles | لا ينطبق | CC BY 4.0 | الصفحة الأصلية، metadata، sensors/units/sampling، labels، license | Benchmark مع attribution؛ لا يحول إلى repair knowledge |
| [LBNL FDD datasets](https://catalog.data.gov/dataset/lbnl-fault-detection-and-diagnostics-datasets) | dataset updated 2024-02-12؛ catalog checked 2026-11-10 | لا ينطبق | CC BY 4.0 | Data.gov metadata، resources، FCU ZIP description، TTL links | Benchmark HVAC؛ البيانات الخام وTTL لم تُنزّل |
| [JonMuel hydraulic-condition-monitoring](https://github.com/JonMuel/hydraulic-condition-monitoring) | updated 2026-08-17؛ لا release | MIT في LICENSE؛ API metadata NOASSERTION | UCI CC BY 4.0؛ model artifact ليس له بيان مستقل | README، LICENSE، data README، downloader، inference، model_info، metrics، notebook | منهج تقييم فقط؛ لا استيراد model |
| [luciaparvaz hydraulic-predictive-maintenance](https://github.com/luciaparvaz/hydraulic-predictive-maintenance) | updated 2026-09-30؛ لا release | MIT في LICENSE؛ API metadata NOASSERTION | UCI CC BY 4.0؛ Parquet artifacts بلا ترخيص منفصل واضح | README، LICENSE، data_loader، feature_engineering، notebook، results summary | منهج GroupKFold فقط؛ لا استيراد Parquet/model |

### ملاحظات الترخيص والجودة

- لا يعني MIT في مستودع BearingDatasets أو Industrial Ops أن datasets داخلهما MIT.
- URMA-CRTI manifest في BearingDatasets يعلن CC BY 4.0، ويصف 23 تسجيلًا بطول 10.24 ثانية عند 25.6 kHz وحجم ملف 47,340,410 bytes. لكن صفحة Zenodo الأصلية لم تُتحقق منها بنجاح في هذا التدقيق؛ كما أن وحدة الإشارة وتعريف combined fault غير محسومين. لذلك لم يتم تنزيل الملف.
- Industrial Ops RAG Agent يحتوي 55 سجلًا في 9 مجموعات معدات، منها 9 سجلات مضخة. 42/55 تكرر possible_causes داخل diagnosis_steps؛ وهذا يقلل قيمته كاختبارات تفريقية. README لا يكفي لإثبات حقوق البيانات، وCSV المنسوب إلى معيار لا يُعاد نشره.
- JonMuel يوضح خطر Data Leakage: notebook يذكر CV-F1 يقارب 0.977 عند تقسيم الدورات عشوائيًا مقابل 0.527 عند التقسيم بحسب operating blocks. النموذج النهائي وBrier/ECE أرقام أبلغ عنها المستودع ولم نعد تدريبها. لا تعني هذه النتائج تشخيصًا سببيًا أو صلاحية ميدانية.
- luciaparvaz يستخدم StratifiedGroupKFold بحسب 144 operating points على 1,447 دورة مستقرة و74 ميزة. هذا أفضل من random cycle split، لكنه يظل اختبار منصة مخبرية لا اختبار مواقع ومعدات مستقلة.
- UCI 447 يحتوي 17 قناة بقياسات pressure/flow/temperature/vibration/power وبمعدلات 100/10/1 Hz. أهدافه تشمل internal pump leakage؛ ليست بيانات cavitation أو air-lock.
- LBNL catalog يغطي سبعة أنواع HVAC، لكنه يعرض حاليًا FCU ZIP موصوفًا بأنه simulated HVACSIM+ مع 15 حالة fault وواحدة fault-free؛ لا نعمم محتوى هذا الملف على جميع الأنظمة السبعة.
- MIMII public 1.0 حجمه 100.2 GB ويغطي valves/pumps/fans/slide rails؛ مناسب لقياس acoustic anomaly detection، وليس لتحديد root cause. MIMII-DG وMIMII-DUE لهما شروط non-commercial/share-alike منفصلة ولا يجوز افتراض أن ترخيص public 1.0 ينطبق عليهما.
- NASA ProgPy يعلن NASA-1.3 في pyproject وتوجد ملفات license PDF منفصلة؛ لم ننسخ الكود لأن بنود الترخيص لم تُراجع كاملة.
- PlantCraft محاكاة/منصة متعددة الخدمات وليست قاعدة أعطال موثقة. وثائق التشغيل تذكر متطلبات موارد أكبر بكثير من Worker أو هاتف Android؛ كما يظهر اختلاف إصدار بين tag v0.6.0 وذكر bundle v0.6.1 في وثيقة offline install ويجب حسمه قبل إعادة التجربة.

## 6. مقارنة المنافسين والمنتجات المجاورة

هذه مقارنة لوثائق ومواقع رسمية متاحة، وليست اختبارًا عمليًا لكل منتج، وادعاءات الشركات تبقى ادعاءات مورّد:

| المنتج | ما تعرضه وثائقه/موقعه | الفرق عن Toolkit |
|---|---|---|
| [IBM Maximo Application Suite](https://www.ibm.com/products/maximo) | EAM/APM، حالة الأصول، إدارة العمل والأصول وعمليات الصيانة المؤسسية | Toolkit يركز على triage محلي؛ لا يملك دورة أوامر عمل ومخزون وإدارة أصول مؤسسية |
| [Siemens Senseye](https://www.siemens.com/global/en/products/services/digital-enterprise-services/analytics-services/senseye-predictive-maintenance.html) | مراقبة صحة الأصول والتنبؤ بالمخاطر عبر بيانات تشغيلية وخبرة صناعية | Toolkit لا يجمع بيانات أسطول/حساسات مستمرة ولا يقدم fleet health |
| [AVEVA](https://www.aveva.com/) | منظومة صناعية للتحليلات وعمليات التشغيل وإدارة الأداء؛ تتكامل مع بيانات OT/SCADA | Toolkit لا يملك historian أو تكامل SCADA/PLC ولا إدارة بيانات مصنع |
| [Augury](https://www.augury.com/) | Machine Health عبر حساسات ومراقبة مستمرة وتحليلات/تشخيص ودعم خبراء | Toolkit لا يملك حساسات أو تحليل vibration/audio مستمر أو expert validation |
| [Fiix](https://fiixsoftware.com/) | CMMS وأوامر عمل وسجل أصول؛ Fiix MAX وميزات Asset Health ضمن منظومة الصيانة | Toolkit لا يملك CMMS أو inventory أو work-order lifecycle أو تكامل CMMS |
| [MaintainX](https://www.getmaintainx.com/) | أوامر عمل وإجراءات وفحوصات وموبايل؛ وثائق offline توضّح العمل دون اتصال ثم المزامنة | Toolkit يخزن معرفة وتشخيصًا محليًا، لكنه لا يملك offline work-order sync |
| [PlantCraft](https://github.com/PlantCraft/PlantCraft) | مشروع مفتوح يتضمن simulator وhistorian وalarms وdashboards وprocess models | مرجع معماري/محاكاة؛ ليس بديلًا مباشرًا لمحرك تشخيص Toolkit |

الاستنتاج: لا ينبغي محاولة بناء نسخة من EAM/CMMS كامل. الفرصة الأقوى هي طبقة تشخيص محلية، متعددة اللغة، قابلة للعمل دون اتصال، تفسر الأدلة والقياسات وتصدر تقريرًا فنيًا يمكن ربطه لاحقًا بأنظمة CMMS/EAM.

## 7. ترتيب المخاطر والأفكار

| الأولوية | المشكلة/الفكرة | الخطورة/الأثر | الجهد | التكلفة |
|---|---|---|---|---|
| P0 | 17 سجل مضخة بلا مصادر، وتكرار seal leak وتعارض low_flow | مرتفع جدًا؛ قد ينتج تشخيصًا مضللًا | متوسط | صفر |
| P0 | عدم توحيد safety gate بين local/guided/cloud | مرتفع جدًا؛ خطر إجراء اختبار غير آمن | متوسط | صفر |
| P0 | تحويل casebook إلى schema وtest harness قبل زيادة السجلات | مرتفع؛ يمنع تكرار المعرفة غير القابلة للاختبار | متوسط/مرتفع | صفر |
| P1 | قياسات typed مع وحدات/نقطة/أداة/وقت/مصدر القراءة | مرتفع؛ أساس الاستدلال | متوسط | صفر |
| P1 | Expected Information Gain مقيد بالسلامة والوقت والتكلفة | مرتفع؛ يحسن السؤال التالي | متوسط | صفر |
| P1 | تثبيت RAG على commit ومراجعة source hash | متوسط/مرتفع؛ يمنع تغير المعرفة دون مراجعة | منخفض/متوسط | صفر |
| P1 | Backup/Restore ومزامنة آمنة | متوسط؛ يحمي السجلات المحلية | متوسط | قد يتطلب خدمة لاحقًا، لا الآن |
| P2 | Embeddings/Semantic Search | قيمة عالية بعد تنظيف المعرفة | متوسط | يمكن بحث حلول محلية مجانية |
| P2 | Bayesian Network معايرة | قيمة عالية لكن بيانات التدريب محدودة | مرتفع | لا تكلفة إذا بقي offline |
| P2 | anomaly detection ثم RUL | لا ينفذ قبل بيانات سليمة ومعايرة مستقلة | مرتفع جدًا | قد يحتاج موارد/بيانات |

## 8. أعلى ثلاث خطوات تالية

1. **إكمال Evidence Mapping لحالات المضخة الست**: ربط كل ادعاء بمصدر مسموح وقسم/صفحة ونطاق تطبيق، مع إبقاء الحالات غير المدعومة candidate.
2. **بناء typed measurement schema ومحرك اختبار معزول**: قياسات فعلية مقابل PLC مقابل تقدير، وحدات ونقاط قياس وظروف تشغيل، مع اختبارات missing/conflicting/noisy/stale/sensor-error.
3. **تنظيف تعارضات سجل المضخة بعد المراجعة فقط**: دمج duplicate seal-leak أو تمييز نطاقهما، تصحيح excessive-flow/low_flow، ثم إضافة اختبارات deduplication وunknown references. لا تُنقل أي حالة إلى runtime قبل اعتماد المصدر والسلامة والاختبار.

## 9. حدود هذا التدقيق

- فحص الكود والملفات كان عبر GitHub API وملفات المستودعات، وفحص المصادر الخارجية عبر صفحات الناشرين/المستودعات. لم يتم تنزيل datasets الخام.
- لم يتم تثبيت تطبيق على هاتف Android أو إجراء قياسات ميدانية.
- لم يتم استدعاء نموذج AI مدفوع أو إجراء اختبارات حمل/اختراق.
- لم يتم تعديل main أو دمج PR أو نشر Production.
