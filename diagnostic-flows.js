/* Structured, model-independent diagnostic flow data. Unknown values remain unknown. */
window.MAINTENANCE_DIAGNOSTIC_FLOWS = {
    "schemaVersion": 2,
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
      }
    }
};
