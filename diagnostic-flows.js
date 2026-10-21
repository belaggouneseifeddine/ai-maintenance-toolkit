/* Structured, model-independent diagnostic flow data. Unknown values remain unknown. */
(function () {
  "use strict";
  window.MAINTENANCE_DIAGNOSTIC_FLOWS = Object.freeze({
    schemaVersion: 1,
    flows: Object.freeze({
      "pump|low_flow": Object.freeze({
        id: "pump-low-flow-v1",
        equipmentId: "pump",
        symptomId: "low_flow",
        question: Object.freeze({
          id: "pump-low-flow-suction-source-status",
          text: "هل ضغط السحب/مستوى المصدر طبيعي حسب المؤشرات المتاحة؟"
        }),
        answers: Object.freeze([
          Object.freeze({
            id: "source-normal",
            label: "نعم، طبيعي",
            guidance: "إذا كانت قراءة السحب والمصدر طبيعية، قارن ضغط الخروج والتدفق بخط الأساس ومنحنى المضخة؛ لا تفترض انسداد السحب."
          }),
          Object.freeze({
            id: "source-low-unstable",
            label: "منخفض أو غير مستقر",
            guidance: "انخفاض/عدم استقرار السحب قد يساهم في ضعف التدفق. أوقف وصعّد إذا ظهرت مؤشرات تشغيل ضار، وراجع المصدر وخط السحب وفق إجراء الموقع."
          }),
          Object.freeze({
            id: "source-no-reliable-reading",
            label: "لا توجد قراءة موثوقة",
            guidance: "لا تستنتج السبب دون قياس موثوق؛ اجمع قراءات معتمدة من نقاط القياس المحددة في دليل المعدة."
          })
        ])
      })
    })
  });
})();
