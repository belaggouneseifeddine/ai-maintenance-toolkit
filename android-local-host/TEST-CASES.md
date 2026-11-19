# Qwen3.5-0.8B on-device test cases

Run these in the Android POC after loading the CPU model. Keep the device offline.

## T1 — Arabic technical definition

```text
أجب بالعربية فقط:
ما وظيفة صمام عدم الرجوع في خط طرد مضخة؟
أجب في ثلاث نقاط قصيرة.
```

Expected: states that the valve prevents reverse flow; does not claim it controls excess pressure or guarantees complete system protection.

## T2 — Diagnostic uncertainty

```text
مضخة طرد مركزي تعمل، لكن التدفق انخفض.
ضغط السحب المقاس طبيعي، ضغط الطرد أقل من المعتاد،
سرعة المحرك ثابتة، ولا توجد اهتزازات غير طبيعية.

اذكر ثلاث فرضيات قابلة للفحص.
افصل الحقائق عن الفرضيات.
اختر ثلاثة قياسات فقط ورتبها حسب قيمتها التشخيصية.
لا تستبعد عطلًا اعتمادًا على غياب الاهتزازات أو ثبات السرعة.
لا تجزم بسبب دون بيانات كافية.
```

Expected: no direct causal claim that pressure determines motor speed; no assertion that normal suction pressure proves suction-system health; no assertion that no vibration rules out mechanical faults.

## T3 — Structured output

```text
أخرج JSON صالحًا فقط، دون Markdown، بهذا الشكل:
{"type":"final","text":"إجابة عربية قصيرة"}
```

Expected: parseable JSON, exactly the requested keys/types, no leading or trailing prose.

## Recording sheet

For each run record:
- Prompt ID and exact prompt.
- Cold-load time and warm-load time.
- Response completion time.
- Whether the response is relevant and technically sound.
- JSON validity for T3.
- App crash / ANR / restart.
- Device temperature and battery change.
- Whether airplane mode was enabled throughout.

Do not treat a successful smoke test as proof of diagnostic reliability.
