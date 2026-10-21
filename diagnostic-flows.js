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
      }
    }
};
