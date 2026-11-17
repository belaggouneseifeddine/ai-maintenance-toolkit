const $=id=>document.getElementById(id);
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.tab));}));
const guidance={
pump:{not_start:['تحقق بصريًا من حالة التغذية وإشارات لوحة التحكم وفق الإجراء المصرّح به.','راجع سجل الإنذارات وحالة الحماية؛ لا تعِد الضبط المتكرر دون معرفة السبب.','تحقق من وجود أمر تشغيل وتصريح التشغيل في نظام التحكم.'],noise:['تحقق من تثبيت القاعدة والحواجز، ثم راجع سجل الاهتزاز والمحامل إن توفرت قياسات آمنة.','ضع في الاعتبار التجويف أو دخول الهواء أو عدم المحاذاة؛ لا تفك المعدة أثناء التشغيل.'],overheat:['راجع اتجاهات الحرارة والحمل والتبريد مقارنة بحدود المصنع.','افحص التهوية والتشحيم من الخارج فقط بعد تأمين المعدة.'],leak:['حدد نوع السائل ومصدر التسرب من مسافة آمنة، واعزل المنطقة عند الحاجة.','لا تشد الوصلات أو تفكها تحت الضغط؛ اتبع إجراء التفريغ والعزل.'],low_flow:['تحقق من مستوى الخزان ووضع الصمامات ومؤشر الضغط/التدفق إن كان ذلك آمنًا.','راجع احتمال انسداد المرشح أو دخول الهواء أو تغير نقطة التشغيل مقارنة بالمواصفات.'],trip:['سجل رمز الحماية والظروف السابقة للفصل؛ لا تتجاوز الحماية أو تكرر إعادة التشغيل.','اطلب من كهربائي مؤهل فحص سبب الفصل وفق إجراءات العزل.']},
motor:{not_start:['راجع الإنذار وحالة أمر التشغيل من واجهة التحكم دون فتح اللوحات.','قد تكون الأسباب تغذية أو حماية أو interlock أو حملًا ميكانيكيًا؛ يلزم فحص مؤهل.'],noise:['راجع تثبيت المعدة وسجل الاهتزاز والمحامل، مع منع الاقتراب من الأجزاء المتحركة.'],overheat:['قارن الحمل والحرارة ببيانات المصنع؛ افحص التهوية خارجيًا بعد العزل.'],trip:['سجل رمز الفصل وحالة الحمل؛ لا تتجاوز المرحل الحراري أو وسائل الحماية.']},
conveyor:{not_start:['تحقق من حالة الطوارئ والحواجز وإشارات التحكم دون تجاوز أي interlock.','راجع سجل الأعطال؛ أي فحص ميكانيكي يتطلب العزل وتأمين الأجزاء.'],noise:['أوقف المعدة واعزلها قبل فحص السير أو البكرات أو المحامل.'],overheat:['راجع الحمل والاحتكاك وسجل حرارة المحامل وفق إجراء آمن.']},
compressor:{not_start:['راجع لوحة الإنذارات وضغط النظام وحالة التحكم حسب دليل المصنع.','لا تفتح خطوط الهواء أو أوعية الضغط قبل العزل والتفريغ والتحقق من انعدام الضغط.'],noise:['أوقف الضاغط عند صوت غير معتاد، ثم اتبع دليل المصنع وفحصًا مؤهلًا.'],overheat:['راجع سجل الحرارة والتهوية ومستوى الزيت وفق تعليمات المصنع.'],low_flow:['راجع ضغط الخروج والمرشحات وحالة التسرب من المؤشرات المتاحة؛ لا تفك خطوطًا مضغوطة.']},
hydraulic:{leak:['ابتعد عن التسرب عالي الضغط؛ حقن الزيت تحت الجلد حالة طبية طارئة. لا تستخدم اليد للبحث عن التسرب.','اعزل الطاقة وفرّغ الضغط وفق تعليمات المصنع قبل أي تدخل.'],low_flow:['راجع مستوى الزيت ودرجة الحرارة ومؤشرات الضغط من نقاط القياس المعتمدة.','تحقق من سجل المرشحات وحالة المضخة والصمامات؛ لا تضبط صمام تنفيس دون مواصفات وإذن.'],overheat:['راجع درجة حرارة الزيت ومستواه والمرشحات والحمل وفق حدود المصنع.'],noise:['أوقف المعدة عند اهتزاز أو صوت غير معتاد؛ بعد العزل، راجع السجل وحالة التثبيت والمحامل وفق دليل المصنع.'],trip:['سجّل الإنذار وظروف حدوثه؛ لا تتجاوز الحماية أو تكرر إعادة التشغيل دون تحديد السبب.']},
vfd:{not_start:['راجع حالة الجاهزية ومصدر أمر التشغيل والإنذارات من الواجهة، وسجّل رقم الموديل والرمز كما يظهر.','لا تغيّر التردد أو معلمات المحرك أو الحماية، ولا تعاود الضبط قبل فهم سبب الفصل.'],trip:['سجّل رمز العطل وسياق الحمل والوقت وسجل الأعطال قبل أي إعادة ضبط.','تحقق من التهوية والحمل والمؤشرات المتاحة؛ فحص الدائرة أو المحرك يتطلب شخصًا مؤهلًا وإجراءات العزل.'],overheat:['راجع مؤشرات الحرارة والحمل والتهوية من الخارج وقارنها بدليل المغير والمحرك.','لا تغيّر حدود التيار أو الحماية ولا تفتح اللوحة وهي حية.'],noise:['أوقف المعدة عند صوت أو اهتزاز مفاجئ أو شديد؛ تحقق من السجل وافحص ميكانيكيًا بعد العزل.'],bad_signal:['راجع مصدر الأمر المختار وحالة الاتصال والإنذارات من واجهة التحكم.','لا تفترض أن المغير تالف قبل التحقق من الأمر والتشابكات المسموح بها وسجل الأعطال.']},
instrumentation:{bad_signal:['سجّل القيمة والوحدة والوقت ورمز الإنذار ومصدر القراءة. قارنها بمؤشر مستقل معتمد أو سجل سابق إذا كان ذلك آمنًا.','تحقق من الوحدة ونقطة القياس وحالة الاتصال من واجهة التحكم؛ لا تعتمد قراءة مشكوكًا فيها لاتخاذ قرار سلامة.','فحص الأسلاك أو القياس الكهربائي أو المعايرة يجب أن ينفذه شخص مؤهل وفق دليل الجهاز وإجراءات العزل.'],not_start:['راجع حالة الاتصال والقناة والإنذارات من واجهة التحكم دون فتح اللوحات.','لا تجسّر أطرافًا أو تتجاوز إنذارًا؛ اطلب فحصًا مؤهلًا عند الاشتباه في عطل كهربائي.'],trip:['سجّل الإنذار والقراءة وظروف العملية، ثم قارنها بالقيم المرجعية المعتمدة.','لا تعطل الحماية أو تستبدل الحساس قبل التحقق من السبب وإجراء الموقع.'],low_flow:['قارن قراءة التدفق بمؤشرات العملية الأخرى وبخط الأساس، وتحقق من الوحدة ونقطة القياس.','قد يكون السبب في العملية أو الخط أو الحساس/الإشارة؛ لا تفترض عطل الحساس من قراءة واحدة.'],overheat:['راجع اتجاهات القراءة وحالة الإنذار ومصدر القياس؛ لا تغيّر حدود الإنذار دون مواصفات واعتماد.']},
valve:{not_start:['راجع إشارة الأمر ومؤشر الموضع والإنذارات من واجهة التحكم.','تحقق من توفر مصدر طاقة المشغل حسب تصميمه، ومن شروط interlock دون تجاوزها.'],leak:['حدد نوع التسرب ومصدره من مسافة آمنة؛ اعزل وفرّغ الضغط قبل أي تدخل.','لا تفك جسم الصمام أو المشغل تحت الضغط؛ راجع دليل المصنع ونوع السائل.'],low_flow:['راجع مؤشر الموضع والضغط/التدفق وحالة الخط من نقاط المراقبة المعتمدة.','تحقق من احتمال انسداد أو عدم اكتمال حركة الصمام؛ لا تغيّر إعدادات المشغل دون تصريح ومواصفات.'],trip:['سجّل الإنذار وإشارة الأمر ومؤشر الموضع؛ لا تتجاوز interlocks أو وسائل الحماية.'],noise:['أوقف العمل إذا ظهر اهتزاز أو طرق شديد؛ راجع ظروف التدفق والتثبيت وفق دليل المصنع بعد جعل المعدة آمنة.']},
pneumatic:{not_start:["راجع ضغط مصدر الهواء ومؤشر الجاهزية والإنذارات من نقاط المراقبة المعتمدة؛ لا تفك وصلات مضغوطة."],leak:["حدد المنطقة من مسافة آمنة باستخدام طريقة كشف معتمدة؛ اعزل وفرّغ الضغط قبل الإصلاح."],low_flow:["راجع ضغط المصدر والمرشحات ومنظمات الضغط ومصارف المكثفات وفق دليل المعدة."],slow_cycle:["قارن زمن الدورة بالخط الأساسي، وراجع ضغط التغذية وحالة المرشحات والصمامات والمشغلات من المؤشرات المتاحة."],noise:["تحقق من وجود تسرب أو عادم غير طبيعي من مسافة آمنة؛ لا تقترب من نقاط حركة المشغلات."]},
gearbox:{noise:["سجّل تغير الصوت والحمل والحرارة؛ أوقف المعدة عند ضجيج مفاجئ أو شديد، وافحص الزيت والمحاذاة بعد العزل."],overheat:["راجع مستوى/حالة زيت التروس ودرجة الحرارة والحمل وسجل الصيانة وفق دليل المصنع."],leak:["حدد موضع التسرب من الخارج؛ لا تفتح غطاء أو سدادة قبل إيقاف المعدة وتأمينها واتباع تعليمات المصنع."],trip:["اربط وقت الفصل بحالة الحمل والإنذارات؛ لا تكرر التشغيل إذا اشتبه بانحشار ميكانيكي."]},
bearing:{noise:["أوقف المعدة عند صوت مفاجئ أو شديد؛ راجع اتجاهات الاهتزاز والحرارة والتشحيم بعد العزل."],overheat:["قارن الحرارة والاهتزاز واتجاهات التشحيم بالخط الأساسي؛ لا تلمس المحمل وهو ساخن أو متحرك."],trip:["قد يرتبط الفصل بزيادة الاحتكاك أو حمل مدفوع أو سبب كهربائي؛ سجّل البيانات قبل إعادة التشغيل."],vibration:["راجع تاريخ الاهتزاز والمحاذاة والتثبيت والتشحيم؛ فحص ميكانيكي بعد العزل فقط."]},
electrical_control:{not_start:["راجع حالة PLC/HMI، وأوامر التشغيل، وpermissives والإنذارات من الواجهة المصرح بها.","لا تفتح لوحة حية أو تجسّر أطرافًا؛ اختبارات الكهرباء ينفذها شخص مؤهل بعد العزل والتحقق."],bad_signal:["سجّل القناة والقيمة والوحدة والوقت، وقارنها بقراءة مستقلة معتمدة وسجل الأحداث."],intermittent:["سجّل وقت العطل والظروف المتزامنة ورسائل PLC/HMI؛ لا تغيّر البرنامج أو تتجاوز interlocks دون إجراء معتمد."],trip:["احفظ سجل الإنذار وتسلسل الأحداث قبل إعادة الضبط؛ لا تعطّل المرحلات أو الحمايات."]},
thermal:{low_flow:["راجع مؤشرات التدفق وفرق الحرارة والضغط وسجل المرشحات من نقاط القياس المعتمدة."],overheat:["راجع درجات الدخول والخروج والتدفق وحالة المراوح/التبريد من المؤشرات؛ قارن بدليل المعدة."],high_pressure:["اعتبر الضغط المرتفع خطرًا محتملًا؛ أوقف وصعّد وفق إجراء الموقع ولا تضبط صمام أمان أو تتجاوز حماية."],leak:["حدد نوع السائل ودرجة حرارته من مسافة آمنة؛ اعزل وفرّغ الضغط والطاقة قبل التدخل."],trip:["سجّل رمز الحماية والقراءات السابقة للفصل؛ لا تعاود التشغيل قبل مراجعة السبب."]},
other:{}
};
const followupBank={
"pump|low_flow":{q:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["pump|low_flow"].question.text,a:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["pump|low_flow"].answers.map(item=>item.label)},
"pump|noise":{q:"هل بدأ الصوت مع تراجع التدفق أو الضغط؟",a:["نعم، بالتزامن","لا، الأداء طبيعي","غير معروف"]},
"motor|not_start":{q:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["motor|not_start"].question.text,a:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["motor|not_start"].answers.map(item=>item.label)},
"motor|overheat":{q:"هل الحمل أو التيار المسجل أعلى من خط الأساس/بيانات اللوحة؟",a:["نعم","لا","لا توجد بيانات موثوقة"]},
"compressor|low_flow":{q:"هل ضغط مخرج الضاغط طبيعي بينما ضغط نقطة الاستخدام منخفض؟",a:["نعم، فرق الضغط في الشبكة محتمل","ضغط المخرج نفسه منخفض","لا توجد قراءات مقارنة"]},
"compressor|low_pressure":{q:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["compressor|low_pressure"].question.text,a:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["compressor|low_pressure"].answers.map(item=>item.label)},
"compressor|not_start":{q:"هل يوجد رمز إنذار أو حالة منع تشغيل على وحدة التحكم؟",a:["نعم، يوجد إنذار/منع","لا يظهر إنذار","لم أتحقق"]},
"hydraulic|slow_cycle":{q:"هل الحركة البطيئة تشمل كل المشغلات أم دائرة واحدة؟",a:["كل المشغلات","مشغل/دائرة واحدة","غير معروف"]},
"hydraulic|leak":{q:"هل التسرب مشتبه بأنه عالي الضغط أو رذاذ دقيق؟",a:["نعم أو غير متأكد","لا، تسرب منخفض الضغط مؤكد","لا أستطيع التحديد"]},
"vfd|trip":{q:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["vfd|trip"].question.text,a:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["vfd|trip"].answers.map(item=>item.label)},
"instrumentation|bad_signal":{q:"هل توجد قراءة مستقلة معتمدة للمقارنة؟",a:["نعم، تختلف عن الحساس","نعم، القراءة متقاربة","لا توجد قراءة مستقلة"]},
"valve|not_start":{q:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["valve|not_start"].question.text,a:window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["valve|not_start"].answers.map(item=>item.label)},
"conveyor|not_start":{q:"هل تظهر حالة E-stop أو interlock أو drive fault في الواجهة؟",a:["نعم","لا","لم أتحقق"]},
"pneumatic|slow_cycle":{q:"هل ضغط الهواء عند المصدر مستقر حسب المؤشر؟",a:["مستقر","منخفض/متذبذب","لا توجد قراءة"]},
"gearbox|noise":{q:"هل تغيّر الصوت بعد تغير الحمل أو بدء التشغيل؟",a:["نعم","لا، مستمر","غير معروف"]},
"bearing|overheat":{q:"هل توجد زيادة متزامنة في الاهتزاز أو تغير صوت المحمل؟",a:["نعم","لا","لا توجد قياسات"]},
"electrical_control|intermittent":{q:"هل العطل يتزامن مع إنذار أو تغير في مدخل/إشارة PLC؟",a:["نعم","لا","لم يُسجّل"]},
"thermal|high_pressure":{q:"هل القراءة مؤكدة من مؤشر معتمد، وهل تجاوزت حد التشغيل المحدد للمعدة؟",a:["نعم، تجاوز مؤكد — أوقف وصعّد","القراءة مشكوك فيها","لا أعرف حد المعدة"]},
"pneumatic|leak":{q:"هل تم تحديد التسرب بطريقة كشف معتمدة ومن مسافة آمنة؟",a:["نعم، تم تحديد المنطقة","لا، الموقع غير محدد","لم يتم الفحص"]},
"pneumatic|low_flow":{q:"هل ضغط التغذية عند نقطة الاستخدام يطابق قيمة التشغيل المحددة في دليل المعدة؟",a:["نعم","أقل من المطلوب","لا توجد قراءة موثوقة"]},
"gearbox|overheat":{q:"هل تغير الحمل أو مستوى/حالة زيت التروس مقارنة بسجل الصيانة؟",a:["نعم، يوجد تغير","لا يوجد تغير معروف","لم يتم التحقق بعد"]},
"gearbox|leak":{q:"أين يظهر التسرب وفق الملاحظة الخارجية فقط؟",a:["حول عمود/مانع تسرب","من غطاء أو وصلة","المصدر غير محدد"]},
"gearbox|vibration":{q:"هل الاهتزاز ازداد فجأة أو بعد تغيير الحمل؟",a:["ازدياد مفاجئ","بعد تغير الحمل","تدريجي أو غير معروف"]},
"bearing|noise":{q:"هل الصوت جديد أو ازداد مقارنة بالحالة المعتادة؟",a:["جديد أو ازداد بوضوح","مستقر منذ مدة","غير معروف"]},
"bearing|vibration":{q:"هل توجد قراءة اهتزاز سابقة يمكن مقارنتها بالقراءة الحالية؟",a:["نعم، توجد مقارنة","لا توجد قراءة سابقة","لا توجد أداة قياس معتمدة"]},
"electrical_control|not_start":{q:"هل تعرض HMI/PLC سبب منع التشغيل أو permissive غير متحقق؟",a:["نعم، السبب ظاهر","لا يظهر سبب واضح","لا أملك صلاحية/وصولًا للواجهة"]},
"electrical_control|trip":{q:"هل تم حفظ رمز الإنذار وتسلسل الأحداث قبل إعادة الضبط؟",a:["نعم","لا","لا توجد سجلات متاحة"]},
"thermal|overheat":{q:"هل التدفق ودرجات الدخول والخروج متاحة للمقارنة مع خط الأساس؟",a:["نعم، البيانات متاحة","التدفق منخفض/غير مستقر","القراءات غير متاحة"]},
"thermal|low_flow":{q:"هل التدفق المنخفض مؤكد من مؤشر معتمد أم مستنتج من فرق الحرارة؟",a:["مؤكد من مؤشر تدفق","مستنتج من فرق الحرارة","غير مؤكد"]},
"pump|trip":{q:"هل سبق الفصل تغير في ضغط السحب أو الحمل أو ظهر رمز حماية؟",a:["تغير ضغط/حمل","رمز حماية ظاهر","لا توجد بيانات سابقة"]},
"motor|vibration":{q:"هل الاهتزاز مرتبط بتغير الحمل أو ظهر بعد صيانة/فك وتركيب؟",a:["بعد صيانة أو تركيب","مع تغير الحمل","غير معروف"]},
"conveyor|noise":{q:"هل الصوت يأتي من منطقة محددة أم من مسار السير عمومًا؟",a:["منطقة محددة","على طول المسار","غير معروف"]}
};
function followupGuidance(machine,symptom,answer){
if(!answer)return [];
const flow=window.MAINTENANCE_DIAGNOSTIC_FLOWS?.flows?.[machine+"|"+symptom];
const matchedAnswer=flow?.answers?.find(item=>item.label===answer);
if(matchedAnswer?.guidance)return [matchedAnswer.guidance];
const rules={
"pump|low_flow":Object.fromEntries(window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["pump|low_flow"].answers.map(item=>[item.label,[item.guidance]])),
"compressor|low_pressure":Object.fromEntries(window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["compressor|low_pressure"].answers.map(item=>[item.label,[item.guidance]])),
"valve|not_start":Object.fromEntries(window.MAINTENANCE_DIAGNOSTIC_FLOWS.flows["valve|not_start"].answers.map(item=>[item.label,[item.guidance]])),
"motor|not_start":{
"لا يوجد أمر تشغيل":["اتبع مخطط التحكم المعتمد للتحقق من مصدر الأمر وشروط السماح من واجهة التحكم؛ لا تجسّر دوائر أو تتجاوز interlocks."],
"أمر موجود مع إنذار/فصل":["احفظ رمز الإنذار وسجل الأحداث، وابحث عن السبب وفق دليل الموديل قبل أي إعادة ضبط."],
"أمر موجود ولا يظهر إنذار":["لا تكرر محاولات البدء؛ اطلب من شخص مؤهل التحقق من دائرة القدرة والحمل الميكانيكي وفق إجراءات العزل."]
},
"compressor|low_flow":{
"نعم، فرق الضغط في الشبكة محتمل":["قارن الضغط عند المخرج ونقطة الاستخدام في ظروف حمل متقاربة، ثم راجع الشبكة والمرشحات والتسربات بالطريقة المعتمدة."],
"ضغط المخرج نفسه منخفض":["راجع سجل الضاغط والإنذارات وحالة المرشحات/المجفف وفق دليل المصنع؛ لا تغيّر نقاط الضبط أو صمام الأمان."],
"لا توجد قراءات مقارنة":["اجمع قراءات ضغط موثوقة مع وحداتها ومواقعها قبل تحديد إن كانت المشكلة في الضاغط أو الشبكة."]
},
"hydraulic|leak":{
"نعم أو غير متأكد":["خطر حقن سائل عالي الضغط لا يمكن استبعاده: ابتعد عن المنطقة، أوقف وصعّد وفق إجراء الموقع، ولا تستخدم اليد للبحث عن التسرب. الاشتباه في حقن تحت الجلد حالة طبية طارئة."],
"لا، تسرب منخفض الضغط مؤكد":["استمر فقط وفق إجراء الموقع وبعد التحقق من تصنيف الضغط والعزل الآمن؛ لا تفك وصلة قبل تفريغ الطاقة والتحقق من الحالة الآمنة."],
"لا أستطيع التحديد":["تعامل معه كتسرب قد يكون عالي الضغط: ابتعد وصعّد إلى شخص مؤهل، ولا تقترب أو تلمس السائل."]
},
"thermal|high_pressure":{
"نعم، تجاوز مؤكد — أوقف وصعّد":["أبقِ المعدة متوقفة وصعّد فورًا وفق إجراء الموقع؛ لا تعِد التشغيل ولا تعدّل أو تعزل صمام أمان."],
"القراءة مشكوك فيها":["لا تتجاهل الإنذار؛ اتبع إجراء الموقع للتحقق من القراءة باستخدام مؤشر معتمد. لا تتجاوز الحماية."],
"لا أعرف حد المعدة":["لا يمكن تقييم القراءة دون حد المصنع المحدد. أبقِ الحالة تحت سيطرة الإجراء المعتمد وصعّد بدل تخمين حد."]
},
"vfd|trip":{
"نعم، الرمز محفوظ":["استخدم رمز العطل الكامل مع موديل المغير ودليل المصنع المطابق لتحديد الفحوص المسموحة؛ لا تنقل معنى الرمز من موديل آخر."],
"لا، لا يوجد سجل متاح":["وثّق الرمز والظروف في المرة القادمة قبل إعادة الضبط؛ لا تكرر التشغيل إذا كان سبب الفصل مجهولًا."],
"تمت إعادة الضبط بالفعل":["سجّل ما حدث قبل/بعد إعادة الضبط، ولا تكررها إذا عاد العطل؛ افحص السبب وفق دليل الموديل."]
}
};
const answers=rules[machine+"|"+symptom];
return answers&&answers[answer]||[];
}
function updateFollowup(){const key=$("machine").value+"|"+$("symptom").value;const flow=window.MAINTENANCE_DIAGNOSTIC_FLOWS?.flows?.[key];const item=followupBank[key];const question=flow?.question?.text||item?.q;$("followupPrompt").textContent=question||"لا يوجد سؤال متخصص لهذا الاختيار بعد؛ سجّل القياسات والإنذار كما هي.";const answers=flow?.answers?.map(answer=>answer.label)||item?.a||[];const sel=$("followupAnswer");sel.innerHTML='<option value="">اختر الإجابة إن كانت معلومة</option>';answers.forEach(a=>{const o=document.createElement("option");o.value=a;o.textContent=a;sel.appendChild(o);});}
$("machine").addEventListener("change",updateFollowup);$("symptom").addEventListener("change",updateFollowup);updateFollowup();
const symptomGeneral={
slow_cycle:['قارن زمن الدورة أو سرعة الحركة بخط الأساس؛ راجع الحمل وإشارات الأمر ومؤشرات الطاقة/الضغط المتاحة قبل افتراض سبب ميكانيكي.'],
intermittent:['سجّل وقت العطل والظروف المصاحبة والإنذارات وتسلسل الأحداث؛ لا تستبدل مكوّنًا قبل وجود دليل قابل للتحقق.'],
high_pressure:['تحقق من القراءة ومصدرها وحد التشغيل المحدد للمعدة؛ إذا كان تجاوز الحد محتملًا أو مؤكدًا، أوقف وصعّد وفق إجراء الموقع. لا تضبط صمام أمان.'],
consumption:['قارن استهلاك الطاقة أو المادة بمعدل الإنتاج والحمل وخط الأساس، وراجع التسربات والقراءات وسجل التغييرات دون تغيير إعدادات الحماية.'],
other:['صف ما تغير ومتى بدأ العطل، وسجّل رمز الإنذار والقراءات مع الوحدات ومصدرها؛ لا تستنتج السبب من وصف عام.']
};
const general=['وثّق الحالة كما هي، ولا تفترض سببًا واحدًا قبل جمع الأدلة.','قارن القياسات بدليل المصنع وحدود التشغيل المعتمدة للمعدة نفسها.','إذا كانت المعلومات غير كافية أو بقي الخطر قائمًا، أوقف التشخيص وصعّد إلى مختص مؤهل.'];

$('aiForm').addEventListener('submit',async e=>{
 e.preventDefault();
 if(window.MaintenanceAgentUI&&typeof window.MaintenanceAgentUI.runLocal==='function'){
   window.MaintenanceAgentUI.runLocal();
 }else{
   const box=$('aiResult');box.hidden=false;
   box.textContent='تعذر تشغيل محرك التشخيص المحلي. تحقق من تحميل ملفات المحرك ثم أعد المحاولة.';
 }
});

const DRAFT_KEY='maintenance-ai-toolkit-draft-v1';
let lastDiagnosisDraft=null;
const faultLibraryPromise=fetch('./faults.json').then(response=>{if(!response.ok)throw new Error('Fault library unavailable');return response.json();}).then(async data=>{let supplement={faults:[]};try{const response=await fetch('./knowledge/faults-supplement.json');if(response.ok)supplement=await response.json();}catch(_error){}const existing=new Set((data.faults||[]).map(item=>item.id));const additions=(supplement.faults||[]).filter(item=>item&&typeof item.id==='string'&&!existing.has(item.id));window.MAINTENANCE_FAULTS={...data,faults:[...(data.faults||[]),...additions]};return window.MAINTENANCE_FAULTS;}).catch(()=>null);
function tr(key){return window.MaintenanceI18n?window.MaintenanceI18n.t(key):key;}
function renderEngineResults(result){
const lang=result.language||'ar';
const labels={
ar:{title:'نتيجة محرك التشخيص بالقواعد',rank:'سبب المطابقة',score:'نقاط المطابقة (ليست احتمالًا)',causes:'أسباب محتملة للتحقق',checks:'فحوصات آمنة مقترحة',escalation:'شروط التصعيد',safety:'قبل كل فحص: تأكد من العزل وحالة الطاقة الآمنة وفق إجراء الموقع.',advisory:'هذه النتيجة إرشادية وليست تشخيصًا مؤكدًا. راجع دليل الشركة المصنّعة.',causeScore:'كلمات مطابقة',confidence:'مستوى الثقة',alarmNote:'لم تتم مطابقة رمز المصنع آليًا ضمن هذا التشخيص المحلي. استخدم بحث أكواد المصنّعين في قاعدة المعرفة، وطابق الطراز وإصدار الدليل.'},
fr:{title:'Résultat du moteur de diagnostic à règles',rank:'Base de correspondance',score:'Score de correspondance (pas une probabilité)',causes:'Causes possibles à vérifier',checks:'Contrôles sûrs proposés',escalation:'Conditions d’escalade',safety:'Avant chaque contrôle : confirmer l’isolement et l’état sûr selon la procédure du site.',advisory:'Résultat indicatif, pas un diagnostic confirmé. Consultez le manuel du fabricant.',causeScore:'mots correspondants',confidence:'Niveau de confiance',alarmNote:'Ce diagnostic local ne fait pas de correspondance automatique des codes constructeur. Utilisez la recherche OEM dans la base de connaissances et vérifiez le modèle et la révision du manuel.'},
en:{title:'Rule-based diagnostic result',rank:'Match basis',score:'Match points (not probability)',causes:'Possible causes to check',checks:'Suggested safe checks',escalation:'Escalation conditions',safety:'Before every check: verify isolation and safe energy state under site procedures.',advisory:'This result is advisory, not a confirmed diagnosis. Consult the manufacturer manual.',causeScore:'matching keywords',confidence:'Confidence level',alarmNote:'This local diagnosis does not automatically match the OEM alarm code. Use the OEM lookup in the knowledge base and confirm the model and manual revision.'}
}[lang];
if(!result.matched)return '<section class="result" id="ruleDiagnosis"><h3>'+labels.title+'</h3><p role="status"><b>'+escapeHtml(result.message)+'</b></p><p>'+escapeHtml(result.reason)+'</p><p class="hint">'+escapeHtml(labels.advisory)+'</p></section>';
return '<section class="result" id="ruleDiagnosis"><h3>'+labels.title+'</h3>'+(String($('code')?.value||'').trim()?'<div class="notice">'+escapeHtml(labels.alarmNote)+'</div>':'')+result.results.map((fault,index)=>'<article class="record"><h3>'+(index+1)+'. '+escapeHtml(fault.title)+'</h3><p><b>'+labels.score+':</b> '+fault.score+'</p><p><b>'+labels.confidence+':</b> '+escapeHtml(fault.confidenceLabel||'')+'</p><p><b>'+labels.rank+':</b> '+escapeHtml(fault.rankingReason)+'</p><h4>'+labels.causes+'</h4><ol>'+fault.causes.map(cause=>'<li><b>'+escapeHtml(cause.label)+'</b><br><span class="hint">'+escapeHtml(cause.reason)+(cause.matchedKeywords.length?' ('+labels.causeScore+': '+escapeHtml(cause.matchedKeywords.join(', '))+')':'')+'</span></li>').join('')+'</ol><h4>'+labels.checks+'</h4><ul>'+fault.safeChecks.map(check=>'<li><b>'+escapeHtml(labels.safety)+'</b> '+escapeHtml(check)+'</li>').join('')+'</ul><div class="notice"><b>'+labels.escalation+':</b> '+escapeHtml(fault.escalation)+'</div></article>').join('')+'<p class="hint">'+escapeHtml(labels.advisory)+'</p></section>';
}
function currentFormDraft(){
return {machine:$('machine').value,symptom:$('symptom').value,assetId:$('assetId').value,priority:$('priority').value,technician:$('technician').value,manualRef:$('manualRef').value,code:$('code').value,observations:$('observations').value,followupAnswer:$('followupAnswer').value,recordDraft:lastDiagnosisDraft};
}
function persistDraft(){
try{localStorage.setItem(DRAFT_KEY,JSON.stringify({...currentFormDraft(),updatedAt:new Date().toISOString()}));}catch(error){console.warn('Draft could not be saved locally.',error);}
}
function renderDraftSummary(){
const box=$('draftSummary');if(!box)return;
const d=lastDiagnosisDraft;
box.textContent=d?((window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='en')?'Date: ':window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='fr'?'Date : ':'التاريخ: ')+d.date+'\n'+((window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='en')?'Equipment: ':window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='fr'?'Équipement : ':'المعدة: ')+d.machine+'\n'+((window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='en')?'Fault: ':window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='fr'?'Panne : ':'العَرَض: ')+d.fault+'\n'+((window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='en')?'Status: Under inspection':window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage()==='fr'?'Statut : En cours d’inspection':'الحالة: قيد الفحص'):'لا توجد مسودة تشخيص بعد. املأ النموذج؛ سيُحفظ تلقائيًا على هذا الجهاز.';
$('saveDraft').disabled=!d;
}
function restoreDraft(){
try{
const raw=localStorage.getItem(DRAFT_KEY);if(!raw){renderDraftSummary();return;}
const d=JSON.parse(raw);lastDiagnosisDraft=d.recordDraft||null;
for(const id of ['machine','symptom','assetId','priority','technician','manualRef','code','observations','followupAnswer'])if(d[id]!==undefined&&$(id))$(id).value=d[id];
if($('machine'))$('machine').dispatchEvent(new Event('change'));
if($('symptom'))$('symptom').dispatchEvent(new Event('change'));
}catch(error){console.warn('Saved draft could not be restored.',error);}
renderDraftSummary();
}

$('diagnosisForm').addEventListener('submit',async e=>{
e.preventDefault();
const safetyChecks=[...document.querySelectorAll('#safetyChecks input')];
const gate=$('safetyGateNotice');
const safetyReviewIncomplete=!safetyChecks.length||safetyChecks.some(box=>!box.checked);
gate.style.display=safetyReviewIncomplete?'block':'none';
const machine=$('machine').value,symptom=$('symptom').value,code=$('code').value.trim(),obs=$('observations').value.trim(),followup=$('followupAnswer').value;
const assetId=$('assetId').value.trim(),technician=$('technician').value.trim(),manualRef=$('manualRef').value.trim(),priority=$('priority').value;
const priorityLabel=$('priority').selectedOptions[0].text;
const createdAt=new Date().toLocaleString();
let steps=(guidance[machine]&&guidance[machine][symptom])||[];
steps=[...steps,...(symptomGeneral[symptom]||[]),...general];
let branchSteps=followupGuidance(machine,symptom,followup);
const faultLibrary=await faultLibraryPromise;
const engineResult=window.diagnose({equipmentType:machine,symptom,observations:obs,errorCode:code,language:window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar'},faultLibrary);
const evidencePanel=window.MaintenanceEvidenceReasoningUI?await window.MaintenanceEvidenceReasoningUI.render(engineResult,{manufacturer:$("manufacturer").value.trim(),model:$("equipmentModel").value.trim()},window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():"ar"):"";
if(machine==='pump'&&!engineResult.matched){steps=[];branchSteps=[];}
lastDiagnosisDraft={date:localDateString(),machine:(assetId?assetId+' — ':'')+$('machine').selectedOptions[0].text,fault:$('symptom').selectedOptions[0].text+(code?' — '+code:'')+(followup?' | '+followup:'')+(obs?' | '+obs:''),action:'مسودة تشخيص إرشادية؛ السبب غير مؤكد.'+(manualRef?' مرجع الدليل: '+manualRef:''),status:'قيد الفحص'};
persistDraft();
renderDraftSummary();
$('diagnosisResult').innerHTML='<div class="result"><div class="print-only" style="display:none"><h2>تقرير فحص صيانة — Maintenance Inspection Report</h2><p><b>وقت الإنشاء:</b> '+escapeHtml(createdAt)+'</p><p><b>رقم الأصل:</b> '+escapeHtml(assetId||'غير محدد')+' | <b>الأولوية:</b> '+escapeHtml(priorityLabel)+'</p>'+(technician?'<p><b>الفني:</b> '+escapeHtml(technician)+'</p>':'')+(manualRef?'<p><b>مرجع الدليل:</b> '+escapeHtml(manualRef)+'</p>':'')+'<hr></div><h3>خطة فحص إرشادية — ليست تشخيصًا مؤكدًا</h3><span class="pill">المعدة: '+escapeHtml($('machine').selectedOptions[0].text)+'</span><span class="pill">العَرَض: '+escapeHtml($('symptom').selectedOptions[0].text)+'</span><span class="pill">الأولوية: '+escapeHtml(priorityLabel)+'</span>'+(assetId?'<p><b>رقم الأصل:</b> '+escapeHtml(assetId)+'</p>':'')+(technician?'<p><b>الفني:</b> '+escapeHtml(technician)+'</p>':'')+(code?'<p><b>رمز مسجل:</b> '+escapeHtml(code)+'</p>':'')+(priority==='urgent'?'<div class="notice" role="alert"><b>تنبيه أولوية عاجلة — حسب اختيار المستخدم:</b> لا تبدأ أو تواصل العمل إذا كان الوضع غير آمن. طبّق العزل والإجراءات المحلية وصعّد إلى شخص مؤهل. لا تتجاوز الحواجز أو interlocks أو أجهزة الحماية.</div>':priority==='high'?'<div class="notice"><b>أولوية مرتفعة — حسب اختيار المستخدم:</b> نسّق مع مسؤول الصيانة والإنتاج قبل الاختبار، واستخدم إجراءات الموقع ودليل المصنع.</div>':'')+renderEngineResults(engineResult)+evidencePanel+(steps.length?'<h3>خطوات الفحص العامة</h3><ul>'+steps.map(s=>'<li>'+escapeHtml(s)+'</li>').join('')+'</ul>':'')+(branchSteps.length?'<h3>خطوة تالية بحسب إجابتك</h3><ul>'+branchSteps.map(s=>'<li>'+escapeHtml(s)+'</li>').join('')+'</ul>':'')+(followup?'<p><b>إجابة السؤال الموجّه:</b> '+escapeHtml(followup)+'</p>':'')+(obs?'<h3>الملاحظات والقياسات التي أدخلها المستخدم</h3><p>'+escapeHtml(obs)+'</p>':'')+(manualRef?'<p><b>مرجع الدليل الذي أدخله المستخدم:</b> '+escapeHtml(manualRef)+'</p>':'')+'<p class="hint">الإجابة تساعد على توجيه الفحص ولا تثبت السبب. لا تُجرِ قياسًا كهربائيًا حيًا أو اختبار ضغط/حركة غير مصرح به.</p><p class="print-only" style="display:none"><b>حالة التقرير:</b> توصيات إرشادية؛ يجب تسجيل القياسات الفعلية ونتيجة الفحص بعد التنفيذ. لا يمثل هذا التقرير اعتمادًا هندسيًا أو تصريح عمل.</p><div class="actions"><button class="btn" id="saveDiagnosis" type="button">حفظ كبلاغ صيانة</button><button class="btn secondary" id="printDiagnosis" type="button">طباعة / حفظ PDF</button></div></div>';
$('printDiagnosis').addEventListener('click',()=>window.print());
$('saveDiagnosis').addEventListener('click',()=>{
const all=getRecords();
all.unshift({id:newRecordId(),date:localDateString(),machine:(assetId?assetId+' — ':'')+$('machine').selectedOptions[0].text,fault:$('symptom').selectedOptions[0].text+(code?' — '+code:'')+(followup?' | إجابة السؤال: '+followup:'')+(obs?' | '+obs:''),action:'خطة فحص إرشادية تم إنشاؤها؛ لم يتم تأكيد السبب.'+(manualRef?' مرجع الدليل: '+manualRef:''),status:priority==='urgent'?'تم التصعيد': 'قيد الفحص'});
saveRecords(all);renderRecords();lastDiagnosisDraft=null;persistDraft();renderDraftSummary();$('log').classList.add('active');$('diagnose').classList.remove('active');document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab==='log'));
});
});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('resetSafety').addEventListener('click',()=>{document.querySelectorAll('#safetyChecks input').forEach(c=>c.checked=false);$('diagnosisResult').innerHTML='';$('safetyGateNotice').style.display='none';});
const KEY='maintenance-ai-toolkit-records-v1';function getRecords(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch(error){console.warn('Maintenance records could not be read from local storage.',error);return []}}function saveRecords(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch(error){console.error('Maintenance records could not be saved locally.',error);const lang=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';const message=lang==='en'?'Could not save records on this device. Storage may be unavailable or full. Export your data if possible.':lang==='fr'?'Impossible d’enregistrer les interventions sur cet appareil. Le stockage est peut-être indisponible ou plein. Exportez vos données si possible.':'تعذّر حفظ سجلات الصيانة على هذا الجهاز. قد تكون مساحة التخزين ممتلئة أو غير متاحة؛ صدّر بياناتك إن أمكن.';window.alert(message);return false}}function newRecordId(){return 'rec-'+Date.now().toString(36)+Math.random().toString(36).slice(2,10)}
function localDateString(date=new Date()){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
$('logDate').value=localDateString();
$('logForm').addEventListener('submit',e=>{e.preventDefault();const a=getRecords();a.unshift({id:newRecordId(),date:$('logDate').value,createdAt:new Date().toISOString(),machine:$('logMachine').value.trim(),fault:$('logFault').value.trim(),action:$('logAction').value.trim(),status:$('logStatus').value});if(!saveRecords(a))return;e.target.reset();$('logDate').value=localDateString();renderRecords();});
function renderRecords(){
const currentLanguage=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';
const statusText=status=>status==='قيد الفحص'?tr('statusInProgress'):status==='تم الإصلاح'?tr('statusRepaired'):status==='يتطلب قطع غيار'?tr('statusParts'):status==='تم التصعيد'?tr('statusEscalated'):status;
const all=getRecords();
const query=($('recordSearch')&&$('recordSearch').value||'').trim().toLocaleLowerCase();
const status=$('recordStatusFilter')&&$('recordStatusFilter').value||'';
const date=$('recordDateFilter')&&$('recordDateFilter').value||'';
const filtered=all.map((record,index)=>({record,index})).filter(item=>{
const machine=String(item.record.machine||'').toLocaleLowerCase();
return (!query||machine.includes(query))&&(!status||item.record.status===status)&&(!date||item.record.date===date);
});
$('records').innerHTML=filtered.length?filtered.map(item=>{const r=item.record;return '<article class="record"><h3>'+escapeHtml(r.machine)+' <span class="pill">'+escapeHtml(statusText(r.status))+'</span></h3><p>'+escapeHtml(r.date)+'</p><p><b>'+escapeHtml(tr('faultLabel'))+'</b> '+escapeHtml(r.fault)+'</p><p><b>'+escapeHtml(tr('actionLabel'))+'</b> '+escapeHtml(r.action)+'</p><div class="actions"><button class="btn secondary" data-report="'+item.index+'" type="button">تصدير تقرير السجل</button><button class="btn secondary" data-delete="'+item.index+'" type="button">'+escapeHtml(tr('deleteRecord'))+'</button></div></article>';}).join(''):('<div class="empty">'+escapeHtml(tr('noRecords'))+'</div>');
document.querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>{const r=getRecords()[Number(b.dataset.report)];if(!r)return;const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>تقرير صيانة</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:24px auto;padding:20px;color:#172b32;line-height:1.7}h1{font-size:24px;border-bottom:2px solid #0f766e;padding-bottom:10px}.meta{color:#52666d}section{border:1px solid #dce5e8;border-radius:10px;padding:14px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere}.warning{background:#fff7ed;padding:12px;border:1px solid #fed7aa}@media print{button{display:none}body{margin:0;max-width:none}}</style></head><body><h1>تقرير صيانة صناعية</h1><p class="meta">تم التصدير: '+escapeHtml(new Date().toLocaleString())+'</p><section><b>التاريخ</b><br>'+escapeHtml(r.date||'غير محدد')+'</section><section><b>المعدة / رقم الأصل</b><br>'+escapeHtml(r.machine||'غير محدد')+'</section><section><b>العطل / الملاحظة</b><br>'+escapeHtml(r.fault||'غير محدد')+'</section><section><b>الإجراء / النتيجة المسجلة</b><br>'+escapeHtml(r.action||'غير محدد')+'</section><section><b>الحالة</b><br>'+escapeHtml(r.status||'غير محدد')+'</section><p class="warning">هذا التقرير يعكس البيانات المسجلة فقط، ولا يمثل اعتمادًا هندسيًا أو تأكيدًا مستقلًا للسبب الجذري. اتبع دليل المصنع وإجراءات السلامة المعتمدة.</p><button onclick="window.print()">طباعة / حفظ PDF</button></body></html>';const blob=new Blob([html],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='maintenance-report-'+String(r.date||'record')+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);const printable=window.open('','_blank');if(printable){printable.document.open();printable.document.write(html);printable.document.close();}}));
document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{const lang=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';const message=lang==='en'?'Delete this maintenance record? This cannot be undone.':lang==='fr'?'Supprimer cet enregistrement de maintenance ? Cette action est irréversible.':'هل تريد حذف سجل الصيانة؟ لا يمكن التراجع عن هذا الإجراء.';if(!window.confirm(message))return;const x=getRecords();const index=Number(b.dataset.delete);if(!Number.isInteger(index)||index<0||index>=x.length)return;x.splice(index,1);if(!saveRecords(x))return;renderRecords();}));
}
function csvCell(value){const text=String(value??'');const safe=/^[\t\r\n ]*[=+\-@]/.test(text)?"'"+text:text;return '"'+safe.replace(/"/g,'""')+'"';}
$('exportCsv').addEventListener('click',()=>{const rows=[['Date','Machine','Fault','Action','Status'],...getRecords().map(r=>[r.date,r.machine,r.fault,r.action,r.status])];const csv='\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='maintenance-log.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('exportJson').addEventListener('click',()=>{
  const backup={schema:'maintenance-ai-toolkit-backup',version:1,exportedAt:new Date().toISOString(),records:getRecords()};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='maintenance-backup-'+localDateString()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('importJson').addEventListener('click',()=>$('importJsonFile').click());
$('importJsonFile').addEventListener('change',async e=>{
  const file=e.target.files&&e.target.files[0];e.target.value='';if(!file)return;
  if(file.size>2*1024*1024){alert('حجم ملف النسخة الاحتياطية يتجاوز 2 ميغابايت.');return;}
  let backup;try{backup=JSON.parse(await file.text());}catch{alert('الملف ليس JSON صالحًا.');return;}
  if(!backup||backup.schema!=='maintenance-ai-toolkit-backup'||backup.version!==1||!Array.isArray(backup.records)||backup.records.length>5000){alert('تنسيق النسخة الاحتياطية غير مدعوم أو عدد السجلات كبير.');return;}
  const valid=backup.records.every(r=>r&&typeof r==='object'&&!Array.isArray(r)&&
    ['date','machine','fault','action','status'].every(k=>typeof r[k]==='string'&&r[k].length<=4000));
  if(!valid){alert('تحتوي النسخة على سجل غير صالح أو حقول غير نصية. لم يتم استيراد شيء.');return;}
  if(!confirm('سيتم دمج '+backup.records.length+' سجلًا مع السجلات الحالية. هل تريد المتابعة؟'))return;
  const current=getRecords(),seen=new Set(current.map(r=>JSON.stringify(r)));
  let added=0;
  for(const record of backup.records){const clean={date:record.date,machine:record.machine,fault:record.fault,action:record.action,status:record.status};if(record.createdAt&&typeof record.createdAt==='string'&&record.createdAt.length<=80)clean.createdAt=record.createdAt;const key=JSON.stringify(clean);if(!seen.has(key)){current.push(clean);seen.add(key);added++;}}
  if(current.length>5000){alert('عدد السجلات بعد الدمج سيتجاوز 5000. قلّل حجم النسخة ثم أعد المحاولة.');return;}
  try{if(!saveRecords(current))return;renderRecords();alert('اكتمل الاستيراد. السجلات الجديدة المضافة: '+added+'.');}catch{alert('تعذّر حفظ السجلات؛ قد تكون مساحة التخزين ممتلئة.');}
});
$('clearRecords').addEventListener('click',()=>{
  if(!confirm('تحذير: سيتم حذف جميع سجلات الصيانة المحفوظة على هذا الجهاز.'))return;
  if(prompt('للتأكيد النهائي، اكتب حذف')!=='حذف'){alert('تم إلغاء الحذف.');return;}
  localStorage.removeItem(KEY);renderRecords();
});

document.querySelectorAll('#safetyChecks input').forEach(box=>box.addEventListener('change',()=>{const all=[...document.querySelectorAll('#safetyChecks input')];$('safetyGateNotice').style.display=(!all.length||all.some(item=>!item.checked))?'block':'none';}));
['recordSearch','recordStatusFilter','recordDateFilter'].forEach(id=>$(id).addEventListener('input',renderRecords));
$('clearRecordFilters').addEventListener('click',()=>{$('recordSearch').value='';$('recordStatusFilter').value='';$('recordDateFilter').value='';renderRecords();});
$('diagnosisForm').querySelectorAll('input,select,textarea').forEach(field=>field.addEventListener('input',persistDraft));
$('diagnosisForm').querySelectorAll('input,select,textarea').forEach(field=>field.addEventListener('change',persistDraft));
$('diagnosisForm').addEventListener('reset',()=>{setTimeout(()=>{localStorage.removeItem(DRAFT_KEY);lastDiagnosisDraft=null;$('diagnosisResult').innerHTML='';$('safetyGateNotice').style.display='none';updateFollowup();renderDraftSummary();},0);});
window.saveGuidedDiagnosticReport=function(payload){
 if(!payload||typeof payload.diagnosticFlowId!=='string'||!payload.diagnosticFlowId||
    !Array.isArray(payload.diagnosticAnswers)||!payload.diagnosticAnswers.length||
    !Array.isArray(payload.diagnosticHypotheses)||!payload.diagnosticHypotheses.length){
   alert('أكمل جمع الأدلة قبل حفظ التقرير.'); return false;
 }
 const language=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';
 const labels=language==='en'?{e:'Recorded evidence',a:'Answers',h:'Ranked hypotheses',s:'Supporting',c:'Contradicting',k:'Suggested checks',n:'No items recorded'}:language==='fr'?{e:'Éléments enregistrés',a:'Réponses',h:'Hypothèses classées',s:'Favorables',c:'Contradictoires',k:'Contrôles suggérés',n:'Aucun élément'}:{e:'الأدلة المسجلة',a:'الإجابات',h:'الفرضيات المرتبة',s:'الأدلة المؤيدة',c:'الأدلة المعارضة',k:'الفحوص المقترحة',n:'لا توجد عناصر مسجلة'};
 const lines=['Guided diagnostic session: '+payload.diagnosticFlowId,labels.a+':'];
 payload.diagnosticAnswers.forEach((a,i)=>lines.push((i+1)+'. '+a.questionId+' — '+a.answerId+(a.evidence&&a.evidence.length?' ['+a.evidence.join('; ')+']':'')));
 lines.push('',labels.e+':',...(payload.diagnosticEvidence.length?payload.diagnosticEvidence:['—']),'',labels.h+':');
 payload.diagnosticHypotheses.forEach((h,i)=>{lines.push((i+1)+'. '+(h.label||h.id)+' — '+(h.status||'unresolved'));lines.push('  '+labels.s+': '+(h.supportingEvidence.join('; ')||labels.n));lines.push('  '+labels.c+': '+(h.contradictingEvidence.join('; ')||labels.n));if(h.checks.length)lines.push('  '+labels.k+': '+h.checks.join('; '));});
 lines.push('',language==='en'?'Provisional heuristic ranking; not a confirmed root cause.':language==='fr'?'Classement heuristique provisoire ; cause racine non confirmée.':'ترتيب استدلالي أولي؛ لا يؤكد السبب الجذري.');
 const machine=($('aiMachine').value||'').trim();
 const record={id:newRecordId(),date:localDateString(),createdAt:new Date().toISOString(),machine:machine+' ('+payload.diagnosticFlowId.split('|')[0]+')',fault:($('aiSymptom').value||'').trim(),action:lines.join('\n'),status:'قيد الفحص',guidedSession:payload};
 const records=getRecords();records.unshift(record);
 if(!saveRecords(records))return false;
 renderRecords();
 alert(language==='en'?'Guided diagnostic report saved locally.':language==='fr'?'Rapport de diagnostic enregistré localement.':'تم حفظ تقرير التشخيص الموجّه محليًا.');
 return true;
};
$('saveDraft').addEventListener('click',()=>{if(!lastDiagnosisDraft)return;const all=getRecords();all.unshift({...lastDiagnosisDraft,id:lastDiagnosisDraft.id||newRecordId()});if(!saveRecords(all))return;renderRecords();lastDiagnosisDraft=null;persistDraft();renderDraftSummary();$('log').classList.add('active');$('diagnose').classList.remove('active');document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab==='log'));});
$('clearDraft').addEventListener('click',()=>{localStorage.removeItem(DRAFT_KEY);lastDiagnosisDraft=null;$('diagnosisForm').reset();$('diagnosisResult').innerHTML='';renderDraftSummary();});
(function initKnowledgeFilters(){const panel=$('knowledge');const card=panel&&panel.querySelector('.card');const search=$('knowledgeSearch');const category=$('knowledgeCategory');const count=$('knowledgeCount');if(!card||!search||!category)return;const headings=[...card.querySelectorAll(':scope > h3')];const groups=headings.map(heading=>{const nodes=[heading];let node=heading.nextElementSibling;while(node&&node.tagName!=='H3'){nodes.push(node);node=node.nextElementSibling;}return{heading,nodes,text:nodes.map(n=>n.innerText||n.textContent||'').join(' ').toLocaleLowerCase()};});const apply=()=>{const q=search.value.trim().toLocaleLowerCase();const cat=category.value;let shown=0;for(const g of groups){const visible=(!q||g.text.includes(q))&&(!cat||g.heading.textContent.trim()===cat);g.nodes.forEach(n=>n.hidden=!visible);if(visible)shown++;}if(count)count.textContent=shown+' / '+groups.length+' أقسام ظاهرة. لا تستبدل هذه المعرفة دليل المصنع الخاص بالموديل.';};search.addEventListener('input',apply);category.addEventListener('change',apply);apply();})();
restoreDraft();
renderRecords();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
