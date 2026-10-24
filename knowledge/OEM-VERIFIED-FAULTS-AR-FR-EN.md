# OEM-verified fault and diagnostic records (AR / FR / EN)

> Verified means the cited official source supports the specific statement below. It does not mean every installation using the same brand behaves identically. Match machine builder, controller/drive model, firmware and manual revision before applying a record.

- Review date: 2026-10-24
- Model-scoped records with official manual evidence: 53
- Languages: Arabic, French and English; summaries are paraphrased rather than copied from manuals.
- Chinese OEM coverage includes XINJE DS5K servo drivers, XINJE X-NET remote-connection diagnostics, and INOVANCE MD200 drives/H5U PLC indicators; this is not yet broad coverage of all Chinese CNC/PLC families.
- Other represented families include Siemens SINUMERIK/SINAMICS and Mitsubishi Electric CNC/PLC/servo records.
- Evidence acquisition queue: INOVANCE H5U fault events and other PLC series, Delta ASDA/PLC, XINJE PLC families, GSK/HuazhongCNC/Syntec/LNC CNC controls, Siemens PLC/CNC, Beckhoff, Bosch Rexroth, Schneider Electric and machine-builder-specific alarm tables.
- Store concise original summaries and links, not copied manual chapters.

## Record format and evidence limits

Each record includes product family, model/software scope, code or diagnostic event, multilingual summary, official manual title/revision, section, page where available, evidence summary, safe checks, escalation guidance and review date.

Records describe what the cited manual supports. They do not establish that a particular machine has that physical fault, and they do not replace the machine builder's electrical drawings, parameter backup, risk assessment or site isolation procedure.

## Records

### sinumerik-25000

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring; Function Manual 08/2018; behavior depends on $MA_ENC_ZERO_MONITORING configuration
- **Code / event:** 25000
- **Meaning (EN):** The active measuring system reported a hardware fault; the affected axis stops using the configured braking ramp and referencing/synchronization status is reset.
- **المعنى (AR):** يذكر الدليل أن نظام القياس الفعّال أبلغ عن عطل عتادي؛ يُوقف المحور بمنحدر الكبح المضبوط وتُصفّر حالة المرجعة/المزامنة.
- **Sens (FR):** Le manuel indique un défaut matériel du système de mesure actif; l’axe s’arrête selon la rampe configurée et l’état de référencement/synchronisation est réinitialisé.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter.
- Preserve diagnostic history before acknowledging or power-cycling.
- Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **الفحوص الآمنة (AR):**
- سجّل نص الإنذار واسم المحور ونوع نظام القياس الفعّال/السلبي وإعداد مراقبة المشفّر.
- احتفظ بسجل التشخيص قبل الإقرار بالإنذار أو إعادة التشغيل.
- ليتحقق فني CNC مؤهل من نوع المشفّر وتوصيلاته ومخطط مصنع الماكينة بعد العزل حسب الإجراء.
- **Contrôles sûrs (FR):**
- Consigner le texte, l’axe, le système actif/passif et le paramètre de surveillance.
- Sauvegarder l’historique avant acquittement ou redémarrage.
- Faire vérifier le codeur et le schéma par un spécialiste CNC selon la procédure de consignation.
- **Escalation (EN):** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.
- **التصعيد (AR):** صعّد عند تكرار الإنذار أو فقد مرجعة المحور أو تعذر التحقق من توصيلات المشفّر؛ لا تتجاوز المراقبة.
- **Escalade (FR):** Escalader en cas de récidive, de perte de référencement ou de câblage non vérifié; ne pas contourner la surveillance.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### sinumerik-25001

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring; Function Manual 08/2018; behavior depends on $MA_ENC_ZERO_MONITORING configuration
- **Code / event:** 25001
- **Meaning (EN):** A hardware fault was detected in the passive measuring system; this function-manual section specifies no further alarm response.
- **المعنى (AR):** اكتُشف عطل عتادي في نظام القياس السلبي؛ لا يحدد هذا القسم استجابة إنذار إضافية.
- **Sens (FR):** Un défaut matériel est détecté sur le système de mesure passif; cette section ne précise pas d’autre réaction.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter.
- Preserve diagnostic history before acknowledging or power-cycling.
- Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **الفحوص الآمنة (AR):**
- سجّل نص الإنذار واسم المحور ونوع نظام القياس الفعّال/السلبي وإعداد مراقبة المشفّر.
- احتفظ بسجل التشخيص قبل الإقرار بالإنذار أو إعادة التشغيل.
- ليتحقق فني CNC مؤهل من نوع المشفّر وتوصيلاته ومخطط مصنع الماكينة بعد العزل حسب الإجراء.
- **Contrôles sûrs (FR):**
- Consigner le texte, l’axe, le système actif/passif et le paramètre de surveillance.
- Sauvegarder l’historique avant acquittement ou redémarrage.
- Faire vérifier le codeur et le schéma par un spécialiste CNC selon la procédure de consignation.
- **Escalation (EN):** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.
- **التصعيد (AR):** صعّد عند تكرار الإنذار أو فقد مرجعة المحور أو تعذر التحقق من توصيلات المشفّر؛ لا تتجاوز المراقبة.
- **Escalade (FR):** Escalader en cas de récidive, de perte de référencement ou de câblage non vérifié; ne pas contourner la surveillance.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### sinumerik-25020

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring; Function Manual 08/2018; behavior depends on $MA_ENC_ZERO_MONITORING configuration
- **Code / event:** 25020
- **Meaning (EN):** Zero-mark monitoring was triggered on the active measuring system; the affected axis stops using the configured braking ramp.
- **المعنى (AR):** تم تفعيل مراقبة علامة الصفر في نظام القياس الفعّال؛ يُوقف المحور بمنحدر الكبح المضبوط.
- **Sens (FR):** La surveillance du repère zéro est déclenchée sur le système actif; l’axe s’arrête selon la rampe configurée.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter.
- Preserve diagnostic history before acknowledging or power-cycling.
- Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **الفحوص الآمنة (AR):**
- سجّل نص الإنذار واسم المحور ونوع نظام القياس الفعّال/السلبي وإعداد مراقبة المشفّر.
- احتفظ بسجل التشخيص قبل الإقرار بالإنذار أو إعادة التشغيل.
- ليتحقق فني CNC مؤهل من نوع المشفّر وتوصيلاته ومخطط مصنع الماكينة بعد العزل حسب الإجراء.
- **Contrôles sûrs (FR):**
- Consigner le texte, l’axe, le système actif/passif et le paramètre de surveillance.
- Sauvegarder l’historique avant acquittement ou redémarrage.
- Faire vérifier le codeur et le schéma par un spécialiste CNC selon la procédure de consignation.
- **Escalation (EN):** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.
- **التصعيد (AR):** صعّد عند تكرار الإنذار أو فقد مرجعة المحور أو تعذر التحقق من توصيلات المشفّر؛ لا تتجاوز المراقبة.
- **Escalade (FR):** Escalader en cas de récidive, de perte de référencement ou de câblage non vérifié; ne pas contourner la surveillance.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### sinumerik-25021

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring; Function Manual 08/2018; behavior depends on $MA_ENC_ZERO_MONITORING configuration
- **Code / event:** 25021
- **Meaning (EN):** Zero-mark monitoring was triggered on the passive measuring system; this section specifies no further alarm response.
- **المعنى (AR):** تم تفعيل مراقبة علامة الصفر في نظام القياس السلبي؛ لا يحدد هذا القسم استجابة إنذار إضافية.
- **Sens (FR):** La surveillance du repère zéro est déclenchée sur le système passif; cette section ne précise pas d’autre réaction.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter.
- Preserve diagnostic history before acknowledging or power-cycling.
- Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **الفحوص الآمنة (AR):**
- سجّل نص الإنذار واسم المحور ونوع نظام القياس الفعّال/السلبي وإعداد مراقبة المشفّر.
- احتفظ بسجل التشخيص قبل الإقرار بالإنذار أو إعادة التشغيل.
- ليتحقق فني CNC مؤهل من نوع المشفّر وتوصيلاته ومخطط مصنع الماكينة بعد العزل حسب الإجراء.
- **Contrôles sûrs (FR):**
- Consigner le texte, l’axe, le système actif/passif et le paramètre de surveillance.
- Sauvegarder l’historique avant acquittement ou redémarrage.
- Faire vérifier le codeur et le schéma par un spécialiste CNC selon la procédure de consignation.
- **Escalation (EN):** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.
- **التصعيد (AR):** صعّد عند تكرار الإنذار أو فقد مرجعة المحور أو تعذر التحقق من توصيلات المشفّر؛ لا تتجاوز المراقبة.
- **Escalade (FR):** Escalader en cas de récidive, de perte de référencement ou de câblage non vérifié; ne pas contourner la surveillance.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### sinamics-g120d-f31100

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** F31100
- **Meaning (EN):** Measured zero-mark distance does not match the parameterized distance.
- **المعنى (AR):** المسافة المقاسة بين علامات الصفر لا تطابق المسافة المضبوطة في المعلمات.
- **Sens (FR):** La distance mesurée entre repères zéro ne correspond pas à la distance paramétrée.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check encoder cable routing for EMC, connectors, encoder type, and configured zero-mark distance parameters.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Check encoder cable routing for EMC, connectors, encoder type, and configured zero-mark distance parameters.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Check encoder cable routing for EMC, connectors, encoder type, and configured zero-mark distance parameters.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120d-f31101

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** F31101
- **Meaning (EN):** The manual lists a zero-mark failure for the encoder system.
- **المعنى (AR):** يُظهر الدليل وجود خلل في علامة الصفر ضمن نظام المشفّر.
- **Sens (FR):** Le manuel signale un défaut du repère zéro dans le système codeur.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Capture the fault value and encoder diagnostics; inspect cabling/connectors only under the approved isolation procedure; consult the full List Manual for the configured encoder.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Capture the fault value and encoder diagnostics; inspect cabling/connectors only under the approved isolation procedure; consult the full List Manual for the configured encoder.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Capture the fault value and encoder diagnostics; inspect cabling/connectors only under the approved isolation procedure; consult the full List Manual for the configured encoder.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120d-f31118

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** F31118
- **Meaning (EN):** For an HTL/TTL encoder, speed difference exceeded configured tolerance over several sampling cycles.
- **المعنى (AR):** في مشفّر HTL/TTL، تجاوز فرق السرعة حدّ السماح المضبوط خلال عدة دورات أخذ عينات.
- **Sens (FR):** Pour un codeur HTL/TTL, l’écart de vitesse a dépassé la tolérance configurée pendant plusieurs cycles d’échantillonnage.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check encoder cable continuity and shield grounding; confirm encoder type and configured tolerance in the exact drive project.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Check encoder cable continuity and shield grounding; confirm encoder type and configured tolerance in the exact drive project.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Check encoder cable continuity and shield grounding; confirm encoder type and configured tolerance in the exact drive project.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120d-f32110

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** F32110
- **Meaning (EN):** Serial protocol transfer between encoder and inverter is faulty.
- **المعنى (AR):** يوجد خلل في نقل البيانات عبر البروتوكول التسلسلي بين المشفّر ومغير التردد.
- **Sens (FR):** Le transfert du protocole série entre le codeur et le variateur est défectueux.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check encoder compatibility, cable/connectors, EMC routing and associated drive settings.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Check encoder compatibility, cable/connectors, EMC routing and associated drive settings.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Check encoder compatibility, cable/connectors, EMC routing and associated drive settings.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120d-f32111

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** F32111
- **Meaning (EN):** The manual groups this code with absolute-encoder internal error.
- **المعنى (AR):** يصنّف الدليل هذا الرمز ضمن الأخطاء الداخلية للمشفّر المطلق.
- **Sens (FR):** Le manuel classe ce code parmi les erreurs internes du codeur absolu.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120d-f32112

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** F32112
- **Meaning (EN):** The manual groups this code with absolute-encoder internal error.
- **المعنى (AR):** يصنّف الدليل هذا الرمز ضمن الأخطاء الداخلية للمشفّر المطلق.
- **Sens (FR):** Le manuel classe ce code parmi les erreurs internes du codeur absolu.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120d-a32442

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families; Getting Started 04/2018; firmware V4.7 SP10
- **Code / event:** A32442
- **Meaning (EN):** Encoder battery voltage pre-alarm.
- **المعنى (AR):** إنذار مسبق بشأن جهد بطارية المشفّر.
- **Sens (FR):** Préalarme de tension de la batterie du codeur.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 89.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Confirm exact encoder and specified battery type from its manual; arrange replacement using the specified part/procedure.
- Record full code, fault value, encoder/drive model and firmware before reset.
- **الفحوص الآمنة (AR):**
- Confirm exact encoder and specified battery type from its manual; arrange replacement using the specified part/procedure.
- سجّل الرمز وقيمة العطل وطراز المشفّر والمغير وإصدار البرنامج قبل إعادة الضبط.
- **Contrôles sûrs (FR):**
- Confirm exact encoder and specified battery type from its manual; arrange replacement using the specified part/procedure.
- Consigner le code, la valeur du défaut, le modèle codeur/variateur et le firmware avant réinitialisation.
- **Escalation (EN):** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.
- **التصعيد (AR):** صعّد عند تكرار أعطال المشفّر أو الحركة غير المتوقعة أو الحاجة إلى تدخل كهربائي تحت الجهد.
- **Escalade (FR):** Escalader en cas de défaut codeur récurrent, mouvement inattendu ou intervention sous tension.
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.

### sinamics-g120p-f30001

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping; Operating Instructions 04/2016
- **Code / event:** F30001
- **Meaning (EN):** The power unit detects overcurrent; listed causes include motor/cable short or ground fault, incorrect motor data/connection, supply issues, or a defective power unit.
- **المعنى (AR):** اكتشفت وحدة القدرة تيارًا زائدًا. تشمل الأسباب المذكورة قصرًا أو تماسًا أرضيًا في المحرك أو الكابل، أو بيانات/توصيل محرك غير صحيح، أو مشكلة في التغذية، أو عطلًا في وحدة القدرة.
- **Sens (FR):** L’unité de puissance détecte une surintensité. Les causes citées comprennent un court-circuit ou un défaut à la terre du moteur/câble, des données ou raccordements moteur incorrects, un problème d’alimentation ou une unité de puissance défectueuse.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Under qualified isolation, inspect motor/power cables, verify nameplate data and star/delta connection, and check supply phases; do not increase limits blindly.
- Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **الفحوص الآمنة (AR):**
- Under qualified isolation, inspect motor/power cables, verify nameplate data and star/delta connection, and check supply phases; do not increase limits blindly.
- احتفظ بحالة المغير وسجل الأعطال ولوحة بيانات المحرك ورقم الوحدة قبل تغيير المعلمات.
- **Contrôles sûrs (FR):**
- Under qualified isolation, inspect motor/power cables, verify nameplate data and star/delta connection, and check supply phases; do not increase limits blindly.
- Enregistrer l’état du variateur, l’historique, la plaque moteur et la référence avant toute modification.
- **Escalation (EN):** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.
- **التصعيد (AR):** صعّد عند الاشتباه بقصر أو تماس أرضي أو تلف وحدة القدرة أو تكرر الفصل أو الحاجة إلى قياس تحت الجهد.
- **Escalade (FR):** Escalader en cas de court-circuit, défaut terre, module endommagé, déclenchements répétés ou mesure sous tension.
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.

### sinamics-g120p-f30002

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping; Operating Instructions 04/2016
- **Code / event:** F30002
- **Meaning (EN):** DC-link voltage overvoltage.
- **المعنى (AR):** ارتفاع مفرط في جهد ناقل التيار المستمر (DC link).
- **Sens (FR):** Surtension du bus continu (DC link).
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Review deceleration ramp, line voltage and line phases against the exact application and manual.
- Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **الفحوص الآمنة (AR):**
- Review deceleration ramp, line voltage and line phases against the exact application and manual.
- احتفظ بحالة المغير وسجل الأعطال ولوحة بيانات المحرك ورقم الوحدة قبل تغيير المعلمات.
- **Contrôles sûrs (FR):**
- Review deceleration ramp, line voltage and line phases against the exact application and manual.
- Enregistrer l’état du variateur, l’historique, la plaque moteur et la référence avant toute modification.
- **Escalation (EN):** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.
- **التصعيد (AR):** صعّد عند الاشتباه بقصر أو تماس أرضي أو تلف وحدة القدرة أو تكرر الفصل أو الحاجة إلى قياس تحت الجهد.
- **Escalade (FR):** Escalader en cas de court-circuit, défaut terre, module endommagé, déclenchements répétés ou mesure sous tension.
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.

### sinamics-g120p-f30003

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping; Operating Instructions 04/2016
- **Code / event:** F30003
- **Meaning (EN):** DC-link voltage undervoltage.
- **المعنى (AR):** انخفاض جهد ناقل التيار المستمر (DC link).
- **Sens (FR):** Sous-tension du bus continu (DC link).
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check supply voltage and line phases using an approved safe measurement procedure; capture event timing and load state.
- Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **الفحوص الآمنة (AR):**
- Check supply voltage and line phases using an approved safe measurement procedure; capture event timing and load state.
- احتفظ بحالة المغير وسجل الأعطال ولوحة بيانات المحرك ورقم الوحدة قبل تغيير المعلمات.
- **Contrôles sûrs (FR):**
- Check supply voltage and line phases using an approved safe measurement procedure; capture event timing and load state.
- Enregistrer l’état du variateur, l’historique, la plaque moteur et la référence avant toute modification.
- **Escalation (EN):** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.
- **التصعيد (AR):** صعّد عند الاشتباه بقصر أو تماس أرضي أو تلف وحدة القدرة أو تكرر الفصل أو الحاجة إلى قياس تحت الجهد.
- **Escalade (FR):** Escalader en cas de court-circuit, défaut terre, module endommagé, déclenchements répétés ou mesure sous tension.
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.

### sinamics-g120p-f30004

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping; Operating Instructions 04/2016
- **Code / event:** F30004
- **Meaning (EN):** Inverter overtemperature.
- **المعنى (AR):** ارتفاع درجة حرارة مغير التردد.
- **Sens (FR):** Surchauffe du variateur.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check fan operation, permitted ambient conditions and possible motor/load overload; inspect cooling passages after safe isolation.
- Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **الفحوص الآمنة (AR):**
- Check fan operation, permitted ambient conditions and possible motor/load overload; inspect cooling passages after safe isolation.
- احتفظ بحالة المغير وسجل الأعطال ولوحة بيانات المحرك ورقم الوحدة قبل تغيير المعلمات.
- **Contrôles sûrs (FR):**
- Check fan operation, permitted ambient conditions and possible motor/load overload; inspect cooling passages after safe isolation.
- Enregistrer l’état du variateur, l’historique, la plaque moteur et la référence avant toute modification.
- **Escalation (EN):** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.
- **التصعيد (AR):** صعّد عند الاشتباه بقصر أو تماس أرضي أو تلف وحدة القدرة أو تكرر الفصل أو الحاجة إلى قياس تحت الجهد.
- **Escalade (FR):** Escalader en cas de court-circuit, défaut terre, module endommagé, déclenchements répétés ou mesure sous tension.
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.

### sinamics-g120p-f30011

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping; Operating Instructions 04/2016
- **Code / event:** F30011
- **Meaning (EN):** Line phase failure.
- **المعنى (AR):** فقدان أحد أطوار التغذية الكهربائية.
- **Sens (FR):** Perte d’une phase du réseau d’alimentation.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check input fuses and feeder cables under approved electrical safety procedures; verify supply phases with suitable instruments and qualified personnel.
- Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **الفحوص الآمنة (AR):**
- Check input fuses and feeder cables under approved electrical safety procedures; verify supply phases with suitable instruments and qualified personnel.
- احتفظ بحالة المغير وسجل الأعطال ولوحة بيانات المحرك ورقم الوحدة قبل تغيير المعلمات.
- **Contrôles sûrs (FR):**
- Check input fuses and feeder cables under approved electrical safety procedures; verify supply phases with suitable instruments and qualified personnel.
- Enregistrer l’état du variateur, l’historique, la plaque moteur et la référence avant toute modification.
- **Escalation (EN):** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.
- **التصعيد (AR):** صعّد عند الاشتباه بقصر أو تماس أرضي أو تلف وحدة القدرة أو تكرر الفصل أو الحاجة إلى قياس تحت الجهد.
- **Escalade (FR):** Escalader en cas de court-circuit, défaut terre, module endommagé, déclenchements répétés ou mesure sous tension.
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.

### melsec-fx5-module-diagnostics

- **Manufacturer / family:** Mitsubishi Electric — MELSEC iQ-F FX5S / FX5UJ / FX5U / FX5UC
- **Scope:** FX5S, FX5UJ, FX5U and FX5UC CPU/module diagnostics; Not stated in cited source; verify on device.
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** Module diagnostics shows the current error, details, cause and recommended action; it can identify incorrect parameter settings or program error location.
- **المعنى (AR):** يعرض تشخيص الوحدة العطل الحالي وتفاصيله وسببه والإجراء المقترح؛ وقد يحدد إعداد معلمة غير صحيح أو موضع خطأ في البرنامج.
- **Sens (FR):** Le diagnostic de module affiche l’erreur courante, ses détails, sa cause et l’action recommandée; il peut repérer un paramètre incorrect ou l’emplacement d’une erreur de programme.
- **Official evidence:** MELSEC iQ-F FX5S/FX5UJ/FX5U/FX5UC User’s Manual (Hardware); Official PDF reviewed 2026-10-24; 17.3 Troubleshooting Using the Engineering Tool → Module diagnostics / Event history; printed page 277.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/manual/plcf/sh082452eng/sh082452engm.pdf
- **Evidence note:** The official manual documents module diagnostics on printed page 277 and event history on page 278.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Read current error and details in the engineering tool; save event history before reset or power cycling.
- Back up PLC program, parameters and device memory before changes.
- Do not force outputs or edit a live program without site safety/change-control procedures.
- **الفحوص الآمنة (AR):**
- اقرأ العطل وتفاصيله بأداة البرمجة واحفظ سجل الأحداث قبل إعادة الضبط أو فصل التغذية.
- انسخ البرنامج والمعلمات وذاكرة الأجهزة قبل التغيير.
- لا تفرض مخارج أو تعدّل برنامجًا أثناء التشغيل دون إجراء السلامة وإدارة التغيير.
- **Contrôles sûrs (FR):**
- Lire l’erreur dans l’outil et sauvegarder l’historique avant réinitialisation.
- Sauvegarder programme, paramètres et mémoire avant modification.
- Ne pas forcer les sorties ni modifier un programme en marche sans procédure de sécurité.
- **Escalation (EN):** Escalate persistent hardware errors, unexplained output states, safety circuit faults, or recurring errors.
- **التصعيد (AR):** صعّد عند استمرار أخطاء العتاد أو حالات مخارج غير مفسرة أو أعطال السلامة أو تكرار الخطأ.
- **Escalade (FR):** Escalader les erreurs matérielles persistantes, sorties inexpliquées, défauts de sécurité ou récidives.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### melsec-fx5-error-severity

- **Manufacturer / family:** Mitsubishi Electric — MELSEC iQ-F FX5S / FX5UJ / FX5U / FX5UC
- **Scope:** FX5S, FX5UJ, FX5U and FX5UC; Not stated in cited source; verify on device.
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** The hardware manual distinguishes major errors (stop; hardware issue), moderate errors (stop; possible program/parameter setting or temporary noise issue), and minor errors (execution continues).
- **المعنى (AR):** يميّز الدليل بين خطأ كبير يوقف التنفيذ ويرتبط بمشكلة عتادية، وخطأ متوسط يوقف التنفيذ وقد يرتبط بالبرنامج أو المعلمات أو التشويش المؤقت، وخطأ بسيط يستمر معه التنفيذ.
- **Sens (FR):** Le manuel distingue les erreurs majeures (arrêt, matériel), modérées (arrêt, programme/paramètres ou bruit temporaire) et mineures (l’exécution continue).
- **Official evidence:** MELSEC iQ-F FX5S/FX5UJ/FX5U/FX5UC User’s Manual (Hardware); Official PDF reviewed 2026-10-24; 17.4 Error Status and Operations on Occurrence of an Error; printed page 279.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/manual/plcf/sh082452eng/sh082452engm.pdf
- **Evidence note:** The error status table specifies stop/continue behavior and required action for major, moderate and minor errors.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record exact error number and severity in the engineering tool.
- For stop errors, identify and correct the cause before recovery; clear only documented continuation errors.
- Preserve event history and backup before program/parameter edits.
- **الفحوص الآمنة (AR):**
- سجّل رقم الخطأ ودرجة الخطورة في أداة البرمجة.
- في أخطاء التوقف، حدّد السبب وصححه قبل الاستعادة؛ لا تمسح إلا أخطاء الاستمرار المسموح بها.
- احتفظ بسجل الأحداث ونسخة احتياطية قبل التعديل.
- **Contrôles sûrs (FR):**
- Consigner le numéro et la gravité dans l’outil.
- Pour une erreur d’arrêt, corriger la cause avant reprise; n’effacer que les erreurs de continuation documentées.
- Sauvegarder l’historique et le projet avant modification.
- **Escalation (EN):** Escalate hardware-related stop errors or faults affecting safety interlocks or machine outputs.
- **التصعيد (AR):** صعّد أخطاء التوقف المرتبطة بالعتاد أو التي تؤثر في تعشيقات السلامة ومخارج الماكينة.
- **Escalade (FR):** Escalader les arrêts liés au matériel ou touchant les interverrouillages de sécurité/sorties.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### melsec-fx5-preserve-error-history

- **Manufacturer / family:** Mitsubishi Electric — MELSEC iQ-F FX5S / FX5UJ / FX5U / FX5UC
- **Scope:** FX5 CPU, expansion, intelligent function modules and network-related event history; Not stated in cited source; verify on device.
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** Event history can include CPU, expansion, intelligent module and network errors; events recorded before power-off/reset help identify causes and can be exported as CSV.
- **المعنى (AR):** قد يشمل سجل الأحداث أخطاء CPU والوحدات التوسعية والذكية والشبكة؛ وتساعد الأحداث السابقة لفصل التغذية أو إعادة الضبط على تحديد السبب ويمكن تصديرها إلى CSV.
- **Sens (FR):** L’historique peut inclure les erreurs CPU, extensions, modules intelligents et réseau; les événements antérieurs à une coupure/réinitialisation aident au diagnostic et peuvent être exportés en CSV.
- **Official evidence:** MELSEC iQ-F FX5S/FX5UJ/FX5U/FX5UC User’s Manual (Hardware); Official PDF reviewed 2026-10-24; 17.3 Troubleshooting Using the Engineering Tool → Event history; printed page 278.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/manual/plcf/sh082452eng/sh082452engm.pdf
- **Evidence note:** The manual describes event-history scope and CSV export.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Export event history before acknowledging or clearing errors.
- Record timestamps, CPU/module model, firmware and machine state.
- **الفحوص الآمنة (AR):**
- صدّر سجل الأحداث قبل الإقرار بالأخطاء أو مسحها.
- سجّل الوقت وطراز CPU والوحدات وإصدار البرنامج وحالة الماكينة.
- **Contrôles sûrs (FR):**
- Exporter l’historique avant acquittement ou effacement.
- Noter l’heure, les modèles CPU/modules, le firmware et l’état machine.
- **Escalation (EN):** Escalate if history points to network/hardware faults or intermittent errors that cannot be safely reproduced.
- **التصعيد (AR):** صعّد إذا أشار السجل إلى أعطال شبكة أو عتاد أو أخطاء متقطعة لا يمكن إعادة إنتاجها بأمان.
- **Escalade (FR):** Escalader si l’historique indique des défauts réseau/matériels ou des erreurs intermittentes.
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.

### mitsubishi-mrj4-al16-al20-encoder-compatibility

- **Manufacturer / family:** Mitsubishi Electric — MELSERVO-J4 MR-J4-A
- **Scope:** Only the handbook’s stated transition case: HC-FS/HA-FS motors driven by MR-J4-A with MR-J2S-compatible encoder setting; Not stated in cited source; verify on device.
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** The transition handbook states that in the specified HC-FS/HA-FS motor and MR-J4-A setup, an incorrect PC22 encoder setting can cause AL.16 (encoder initial communication error 1) or AL.20 (encoder normal communication error 1).
- **المعنى (AR):** يذكر دليل الانتقال أن إعداد PC22 غير الصحيح في حالة محرك HC-FS/HA-FS مع MR-J4-A قد يؤدي إلى AL.16 (خطأ اتصال أولي للمشفّر) أو AL.20 (خطأ اتصال عادي للمشفّر).
- **Sens (FR):** Le guide de transition indique qu’un réglage PC22 incorrect, dans le cas moteur HC-FS/HA-FS avec MR-J4-A, peut provoquer AL.16 ou AL.20.
- **Official evidence:** Transition from MELSERVO-J2-Super/J2M Series to J4 Series Handbook; Official transition handbook reviewed 2026-10-24; Part 7 Common Reference Material → 4. HC-FS/HA-FS MOTOR DRIVE → 4.1 Parameter setting.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/catalog/servo/l03093/l03093e.pdf
- **Evidence note:** The source explicitly links PC22 encoder compatibility setting with AL.16/AL.20 in the stated migration scenario.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Confirm exact amplifier suffix, motor and encoder models, and that the machine matches the documented transition case.
- Compare PC22 against exact motor/encoder instructions; do not change parameters based on the alarm alone.
- **الفحوص الآمنة (AR):**
- تحقق من لاحقة المضخم وطرازي المحرك والمشفّر ومطابقة الحالة لسيناريو الانتقال المذكور.
- قارن PC22 بتعليمات المحرك والمشفّر؛ لا تغيّر المعلمات اعتمادًا على الإنذار وحده.
- **Contrôles sûrs (FR):**
- Confirmer la référence du variateur, du moteur et du codeur et le scénario de transition.
- Comparer PC22 aux instructions exactes; ne pas modifier les paramètres sur la seule base de l’alarme.
- **Escalation (EN):** Escalate if installed components fall outside the documented case or the alarm persists after the approved setting is verified.
- **التصعيد (AR):** صعّد إذا كانت المكونات خارج حالة التوافق الموثقة أو استمر الإنذار بعد التحقق من الإعداد المعتمد.
- **Escalade (FR):** Escalader si les composants sortent du cas documenté ou si l’alarme persiste.
- **Limit:** Narrow compatibility note, not a universal diagnostic for AL.16 or AL.20.

### xinje-ds5k-e-010

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-010
- **Meaning (EN):** The manual links E-010 to an incorrect downloaded firmware version and recommends contacting the agent/manufacturer.
- **المعنى (AR):** يربط الدليل E-010 بإصدار برنامج ثابت تم تنزيله بصورة غير صحيحة، ويوصي بالتواصل مع الوكيل أو المصنع.
- **Sens (FR):** Le manuel relie E-010 à une version de firmware téléchargée incorrecte et recommande de contacter l’agent/le fabricant.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 173.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the drive model and installed firmware; do not flash an unverified file. Confirm compatibility with the exact drive/motor before updates.
- **الفحوص الآمنة (AR):**
- سجّل طراز السيرفو وإصدار البرنامج الثابت. لا تثبّت ملفًا غير متحقق منه؛ تأكد من توافقه مع السيرفو والمحرك المحددين قبل التحديث.
- **Contrôles sûrs (FR):**
- Consigner le modèle du servo et la version du firmware. Ne pas flasher un fichier non vérifié; confirmer la compatibilité avec le servo et le moteur exacts avant toute mise à jour.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-021

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-021
- **Meaning (EN):** The drive rejects a parameter value outside its allowed range; the manual says to check and correct the parameters.
- **المعنى (AR):** يرفض المغير قيمة المعلمة خارج المجال المسموح؛ ويوصي الدليل بمراجعة المعلمات وتصحيحها.
- **Sens (FR):** Le variateur rejette une valeur hors plage; le manuel demande de vérifier et corriger les paramètres.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 173.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Capture parameter number/value and source of write. Compare with the exact manual and commissioned settings; do not restore defaults without an approved backup.
- **الفحوص الآمنة (AR):**
- تحقق من كود الإنذار الكامل وحالة التشغيل، واحفظ سجل الأعطال قبل إعادة الضبط. افحص التوصيلات بعد العزل وفق إجراء الموقع.
- **Contrôles sûrs (FR):**
- Vérifier le code complet et les conditions de fonctionnement, sauvegarder l’historique avant réinitialisation et contrôler les raccordements après consignation.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-030

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-030
- **Meaning (EN):** The manual associates E-030 with bus voltage above threshold; listed causes include high supply voltage, high inertia/regeneration demand, braking-resistor problems, or short ramps.
- **المعنى (AR):** يربط الدليل E-030 بارتفاع جهد الناقل؛ وتشمل الأسباب ارتفاع جهد التغذية أو قصور التجديد بسبب القصور الذاتي أو مشكلة مقاومة الكبح أو قصر أزمنة التسارع والتباطؤ.
- **Sens (FR):** Le manuel associe E-030 à une surtension du bus; les causes citées comprennent tension réseau élevée, régénération insuffisante, résistance de freinage ou rampes trop courtes.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 175.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record U0-05 and when the fault occurs. Have qualified personnel inspect supply and regenerative resistor; do not change ramps before backup and engineering review.
- **الفحوص الآمنة (AR):**
- سجّل الكود وحالة المحور والحمل. افحص الكابلات والموصلات بعد العزل، ولا تغيّر معلمات التحكم دون مقارنة الدليل بالطراز الفعلي.
- **Contrôles sûrs (FR):**
- Consigner le code, l’état de l’axe et la charge. Contrôler câbles et connecteurs après consignation; ne pas modifier les paramètres sans vérifier le manuel du modèle exact.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-040

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-040
- **Meaning (EN):** The alarm list distinguishes low grid voltage from bus undervoltage caused by a drive power failure.
- **المعنى (AR):** تميّز قائمة الإنذارات بين انخفاض جهد الشبكة وانخفاض جهد الناقل الناتج عن انقطاع تغذية المغير.
- **Sens (FR):** La liste distingue la sous-tension due au réseau de celle causée par une coupure d’alimentation du variateur.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 175.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record supply behavior and event timing; have a qualified electrician verify phases/connections and avoid repeated resets before capturing the cause.
- **الفحوص الآمنة (AR):**
- تحقق من سجل الإنذارات وتوصيلات المحرك والمشفّر بعد العزل. لا تفصل أو تعِد توصيل الموصلات تحت الجهد.
- **Contrôles sûrs (FR):**
- Consulter l’historique et vérifier les connexions moteur/codeur après consignation. Ne jamais débrancher ou rebrancher sous tension.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-221

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-221
- **Meaning (EN):** Received encoder data is incorrect and retries exceed P0-56; the manual identifies encoder interference as a possible cause.
- **المعنى (AR):** بيانات المشفّر المستقبلة غير صحيحة وعدد المحاولات يتجاوز P0-56؛ ويشير الدليل إلى احتمال وجود تداخل على المشفّر.
- **Sens (FR):** Les données reçues du codeur sont erronées et les reprises dépassent P0-56; le manuel cite des interférences.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 180.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Review U0-79/U0-54 counters as directed by the manual and inspect cable routing/shielding after isolation. Do not change parameters without an EMC review.
- **الفحوص الآمنة (AR):**
- تحقق من حالة البطارية ومعلومات الإنذار في الدليل المطابق. قبل استبدال البطارية أو إعادة المرجعة، اتبع إجراء الشركة المصنّعة للحفاظ على بيانات الموضع المطلق.
- **Contrôles sûrs (FR):**
- Vérifier l’état de la batterie et l’alarme dans le manuel exact. Avant remplacement ou référencement, suivre la procédure constructeur pour préserver les données de position absolue.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-222

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-222
- **Meaning (EN):** The manual identifies low voltage in the absolute-encoder battery box, below 2.75 V, and warns that position information may be lost if battery power is interrupted.
- **المعنى (AR):** يحدد الدليل انخفاض جهد بطارية المشفّر المطلق إلى أقل من 2.75 فولت ويحذر من احتمال فقد بيانات الموضع عند انقطاع البطارية.
- **Sens (FR):** Le manuel indique une tension de batterie du codeur absolu inférieure à 2,75 V et avertit d’un risque de perte de position.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 180.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Confirm the exact encoder/battery assembly and approved OEM replacement procedure. Do not perform live battery replacement based only on this summary; use qualified personnel and site safety rules.
- **الفحوص الآمنة (AR):**
- لا تستبدل البطارية أو تعِد تشغيل النظام عشوائيًا. احفظ بيانات الحالة واتبع إجراء XINJE المحدد للحفاظ على الموضع المطلق.
- **Contrôles sûrs (FR):**
- Ne pas remplacer la batterie ni redémarrer au hasard. Sauvegarder l’état et suivre la procédure XINJE de conservation de la position absolue.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-236

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-236
- **Meaning (EN):** Motor encoder feedback differs from grating/displacement feedback by more than configured P9-02; the manual lists mechanical errors or scale alignment as possible causes.
- **المعنى (AR):** يتجاوز الفرق بين تغذية مشفّر المحرك وتغذية المسطرة/الإزاحة الخارجية قيمة P9-02؛ ويذكر الدليل احتمال خلل ميكانيكي أو سوء محاذاة المسطرة.
- **Sens (FR):** L’écart entre le codeur moteur et la règle dépasse P9-02; le manuel cite un problème mécanique ou d’alignement.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 181.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record P9-02 and feedback values; inspect mechanical transmission and scale alignment before changing parameters; back up settings and seek machine-builder review.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار الكامل وإصدار السيرفو، ثم راجع قسم الرمز في دليل DS5K قبل تغيير أي إعداد.
- **Contrôles sûrs (FR):**
- Consigner le code complet et la version du servo, puis consulter la section correspondante du manuel DS5K avant toute modification.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-237

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-237
- **Meaning (EN):** In the stated P9-02 configuration, the manual says the external scale may be broken or incorrectly connected when feedback direction is reversed.
- **المعنى (AR):** في إعداد P9-02 المذكور، قد تكون المسطرة الخارجية مكسورة أو موصولة بشكل غير صحيح عند انعكاس اتجاه التغذية.
- **Sens (FR):** Dans la configuration P9-02 indiquée, la règle externe peut être rompue ou mal raccordée lorsque le sens est inversé.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 181.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Confirm P9-02 and compare direction with machine drawings; inspect scale cable/connector and mounting under isolation. Do not alter direction parameters without authorization.
- **الفحوص الآمنة (AR):**
- تحقق من التوصيلات والتهيئة وفق مخطط الماكينة ودليل DS5K، بعد تطبيق العزل الكهربائي.
- **Contrôles sûrs (FR):**
- Vérifier les raccordements et la configuration selon le schéma de la machine et le manuel DS5K, après consignation électrique.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-238

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Scope:** XINJE DS5K servo driver family covered by Data No. SC5 03 20230427EN; Confirm installed drive variant and compatible firmware
- **Code / event:** E-238
- **Meaning (EN):** The difference between motor encoder speed and external scale speed exceeds configured P9-04.
- **المعنى (AR):** يتجاوز الفرق بين سرعة مشفّر المحرك وسرعة المسطرة الخارجية قيمة P9-04.
- **Sens (FR):** L’écart entre la vitesse du codeur moteur et celle de la règle externe dépasse P9-04.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 181.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Capture both feedback values, P9-04 and mechanism configuration; verify scale/coupling and P9-05–P9-08 settings with qualified motion-control personnel before tuning.
- **الفحوص الآمنة (AR):**
- احتفظ بسجل الإنذار وإعدادات المحور، وتحقق من توافق المحرك والمشفّر والبرنامج الثابت مع الطراز. صعّد إلى الدعم عند استمرار الإنذار.
- **Contrôles sûrs (FR):**
- Conserver l’historique et les paramètres de l’axe; vérifier la compatibilité moteur/codeur/firmware avec le modèle. Contacter le support si l’alarme persiste.
- **Escalation (EN):** Escalate if the fault recurs or the correction requires energized access or changes to safety-critical parameters.
- **التصعيد (AR):** صعّد إذا تكرر العطل أو تطلب التصحيح العمل تحت الجهد أو تعديل معلمات حرجة للسلامة.
- **Escalade (FR):** Escalader si le défaut revient ou si la correction exige une intervention sous tension ou la modification de paramètres critiques.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### oem-inovance-md200-err02-overcurrent-acceleration

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Scope:** INOVANCE — MD200 series AC drive
- **Code / event:** Err02
- **Meaning (EN):** The manual labels Err02 as overcurrent during acceleration and lists output short/ground fault, short acceleration time, unsuitable torque boost/V/f, low voltage, restarting a rotating motor, sudden load, undersized drive, braking resistor fault, and motor ground fault among possible causes.
- **المعنى (AR):** يصنّف الدليل Err02 على أنه زيادة تيار أثناء التسارع. تشمل الأسباب المحتملة قصرًا أو تماسًا أرضيًا في الخرج، وزمن تسارع قصيرًا، وإعدادًا غير مناسب لتعزيز العزم أو V/f، وانخفاض الجهد، وإعادة تشغيل محرك يدور، وحملًا مفاجئًا، ومغيرًا أصغر من المطلوب، وخلل مقاومة الكبح أو تأريض المحرك.
- **Sens (FR):** Le guide classe Err02 comme une surintensité pendant l’accélération. Les causes possibles comprennent un court-circuit ou défaut à la terre en sortie, une rampe d’accélération trop courte, un réglage inadapté du couple ou du rapport V/f, une sous-tension, le redémarrage d’un moteur en rotation, une charge soudaine, un variateur sous-dimensionné, un défaut de résistance de freinage ou la mise à la terre du moteur.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.1 Fault List; printed page 32.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The manual labels Err02 as overcurrent during acceleration and lists output short/ground fault, short acceleration time, unsuitable torque boost/V/f, low voltage, restarting a rotating motor, sudden load, undersized drive, braking resistor fault, and motor ground fault among possible causes.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the code and operating conditions; inspect fault history before repeated resets. After site-approved isolation and absence-of-voltage verification, have a qualified technician inspect motor cable and insulation. Compare acceleration ramp, load, and V/f settings with the MD200 manual and application; do not alter protection settings arbitrarily.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a drive specialist if the fault persists or internal damage is suspected; do not replace components without approved measurements.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err03-overcurrent-deceleration

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Scope:** INOVANCE — MD200 series AC drive
- **Code / event:** Err03
- **Meaning (EN):** The manual identifies Err03 as overcurrent during deceleration and lists short/ground faults, short deceleration time, low voltage, sudden load, missing/unsuitable braking resistor, and motor ground fault as possible causes.
- **المعنى (AR):** يصنّف الدليل Err03 على أنه زيادة تيار أثناء التباطؤ. تشمل الأسباب المحتملة قصرًا أو تماسًا أرضيًا، وزمن تباطؤ قصيرًا، وانخفاض الجهد، وحملًا مفاجئًا، أو غياب مقاومة الكبح أو عدم ملاءمتها، أو تأريض المحرك.
- **Sens (FR):** Le guide classe Err03 comme une surintensité pendant la décélération. Les causes possibles comprennent un court-circuit ou défaut à la terre, une rampe de décélération trop courte, une sous-tension, une charge soudaine, une résistance de freinage absente/inadaptée ou la mise à la terre du moteur.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.1 Fault List; printed page 32.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The manual identifies Err03 as overcurrent during deceleration and lists short/ground faults, short deceleration time, low voltage, sudden load, missing/unsuitable braking resistor, and motor ground fault as possible causes.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record whether the fault occurs only on stopping or with a specific load; do not repeat test starts without risk assessment. Review fault history and compare deceleration time with the application requirements and MD200 manual. Inspect braking resistor and power cables only after isolation and DC-bus discharge by a qualified technician.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate if Err03 recurs after ramp review or braking resistor/motor cable damage is suspected.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err05-overvoltage-acceleration

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Scope:** INOVANCE — MD200 series AC drive
- **Code / event:** Err05
- **Meaning (EN):** The manual labels Err05 as overvoltage during acceleration and lists excessive input voltage, external force driving the motor, short acceleration time, and absent braking resistor as possible causes.
- **المعنى (AR):** يصنّف الدليل Err05 على أنه ارتفاع جهد أثناء التسارع. تشمل الأسباب المحتملة ارتفاع جهد الدخل، أو دفع المحرك بقوة خارجية، أو قصر زمن التسارع، أو غياب مقاومة الكبح.
- **Sens (FR):** Le guide classe Err05 comme une surtension pendant l’accélération. Les causes possibles comprennent une tension d’entrée excessive, l’entraînement du moteur par une force externe, une rampe d’accélération trop courte ou l’absence de résistance de freinage.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.1 Fault List; printed page 33.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The manual labels Err05 as overvoltage during acceleration and lists excessive input voltage, external force driving the motor, short acceleration time, and absent braking resistor as possible causes.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Compare supply readings and fault timing with the drive nameplate and model manual limits. Review the ramp and any load that may drive the motor; do not change braking settings without engineering approval. A qualified technician must perform power-cabinet measurements or braking-resistor checks after isolation and energy discharge.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate if voltage is outside the permitted range or the fault persists after acceleration/braking checks.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err09-undervoltage

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Scope:** INOVANCE — MD200 series AC drive
- **Code / event:** Err09
- **Meaning (EN):** The manual labels Err09 as undervoltage and lists momentary power failure, input voltage outside the permitted range, abnormal bus voltage, and possible rectifier/pre-charge/drive/control-board faults.
- **المعنى (AR):** يصنّف الدليل Err09 على أنه انخفاض جهد. تشمل الأسباب انقطاعًا لحظيًا للطاقة، أو جهد دخل خارج النطاق المسموح، أو خللًا في جهد الناقل، أو عطلًا محتملًا في المقوم أو دائرة الشحن المسبق أو لوحة القيادة/التحكم.
- **Sens (FR):** Le guide classe Err09 comme une sous-tension. Les causes possibles comprennent une coupure momentanée, une tension d’entrée hors plage, une anomalie du bus ou un défaut du redresseur, du préchargement ou des cartes de commande/puissance.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.1 Fault List; printed page 34.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The manual labels Err09 as undervoltage and lists momentary power failure, input voltage outside the permitted range, abnormal bus voltage, and possible rectifier/pre-charge/drive/control-board faults.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check supply interruption history and approved voltage monitoring without opening an energized cabinet. If the fault recurs with a sound supply, preserve the fault log and contact INOVANCE support instead of attempting board-level repair. Avoid repeated resets before identifying the voltage dip; follow site energy-isolation procedures.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a specialist if the fault recurs or internal power components are suspected.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err12-input-phase-loss

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Scope:** INOVANCE — MD200 series AC drive
- **Code / event:** Err12
- **Meaning (EN):** The fault table names Err12 as input phase loss and lists abnormal three-phase input supply or internal drive/protection/control components as possible causes. The parameter note says the F9-12 input phase-loss protection applies only to single-phase MD200TXX models; do not generalize this parameter applicability to all MD200 variants.
- **المعنى (AR):** يسمّي جدول الأعطال Err12 فقدان طور الدخل، ويذكر خلل التغذية ثلاثية الطور أو مكونات داخلية للقيادة/الحماية/التحكم. تنطبق ملاحظة المعلمة F9-12 الخاصة بحماية فقدان الطور على طرازات MD200TXX أحادية الطور فقط، ولا يجوز تعميمها على جميع نسخ MD200.
- **Sens (FR):** Le tableau des défauts nomme Err12 « perte de phase d’entrée » et cite une alimentation triphasée anormale ou des composants internes de commande/protection/contrôle. La note sur le paramètre F9-12 ne s’applique qu’aux modèles MD200TXX monophasés et ne doit pas être généralisée à toutes les variantes MD200.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.1 Fault List; parameter F9-12 note; printed page 34.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The fault table names Err12 as input phase loss and lists abnormal three-phase input supply or internal drive/protection/control components as possible causes. The parameter note says the F9-12 input phase-loss protection applies only to single-phase MD200TXX models; do not generalize this parameter applicability to all MD200 variants.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Review breaker, supply status, and fault history from a safe point; the code alone does not prove drive failure. Inter-phase voltage measurements or cabinet wiring inspections must be performed by a qualified electrician under an approved isolation procedure. If the supply is sound and the fault persists, send the exact drive model and fault log to INOVANCE support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a qualified electrician or OEM support; do not bypass phase-loss protection.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err14-drive-overtemperature

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Scope:** INOVANCE — MD200 series AC drive
- **Code / event:** Err14
- **Meaning (EN):** The manual labels Err14 as drive overtemperature and lists high ambient temperature, blocked air filter, damaged fan, damaged module thermistor, or a faulty drive unit as possible causes.
- **المعنى (AR):** يصنّف الدليل Err14 على أنه ارتفاع حرارة المغير. تشمل الأسباب المحتملة ارتفاع حرارة المحيط، أو انسداد مرشح الهواء، أو تلف المروحة أو حساس حرارة الوحدة، أو عطل وحدة القيادة.
- **Sens (FR):** Le guide classe Err14 comme une surchauffe du variateur. Les causes possibles comprennent une température ambiante élevée, un filtre d’air obstrué, un ventilateur ou thermistor de module endommagé, ou une unité de variateur défectueuse.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.1 Fault List; printed page 35.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The manual labels Err14 as drive overtemperature and lists high ambient temperature, blocked air filter, damaged fan, damaged module thermistor, or a faulty drive unit as possible causes.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check ambient temperature, cabinet ventilation, and fan indications externally. Do not clean the filter or approach the fan until the equipment is stopped and isolated under the approved procedure. If Err14 persists after correcting external ventilation conditions, request OEM diagnosis rather than opening the power module.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate if overheating persists, the fan is faulty, or an internal sensor is suspected; do not continue running with recurring thermal alarms.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-10-insufficient-voltage

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Scope:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 10
- **Meaning (EN):** Alarm No. 10 is named Insufficient voltage; the manual says a drop of bus voltage was detected in the main circuit. It gives reset class PR, but detailed troubleshooting is delegated to the exact drive-unit instruction manual.
- **المعنى (AR):** يسمّي الدليل الإنذار 10 «جهد غير كافٍ» ويذكر اكتشاف انخفاض جهد الناقل في الدائرة الرئيسية. فئة إعادة الضبط PR؛ أما استكشاف الأعطال التفصيلي فيتطلب دليل وحدة القيادة المطابقة.
- **Sens (FR):** Le manuel nomme l’alarme 10 « tension insuffisante » et indique une baisse de tension du bus dans le circuit principal. La classe de réinitialisation est PR; le diagnostic détaillé nécessite le manuel de l’unité d’entraînement exacte.
- **Official evidence:** C80 Series Alarm/Parameter Manual; C80 Series Alarm/Parameter Manual; IB-1501560-F; 3.1 Servo Errors (S01/S03/S04), drive unit alarm table; printed page 51.
- **Source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Evidence note:** Alarm No. 10 is named Insufficient voltage; the manual says a drop of bus voltage was detected in the main circuit. It gives reset class PR, but detailed troubleshooting is delegated to the exact drive-unit instruction manual.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the full C80 alarm, affected axis, drive model, and time of occurrence. Review alarm history and supply measurements available through an approved monitoring system. Use the manual for the actual drive unit before measurements or power cycling; the CNC manual alone is insufficient.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate if the alarm recurs or requires internal power-unit inspection; stop work under site procedure.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-18-encoder-initial-communication

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Scope:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 18
- **Meaning (EN):** Alarm No. 18 is named Main side encoder: Initial communication error; the details say initial communication with the motor-side encoder failed. Troubleshooting is not specified in this table and requires the exact drive-unit manual.
- **المعنى (AR):** يسمّي الدليل الإنذار 18 خطأ اتصال أولي بمشفّر جهة المحرك؛ فشل الاتصال الأولي بالمشفّر. لا يحدد هذا الجدول خطوات إصلاح، ويجب الرجوع إلى دليل وحدة القيادة المطابقة.
- **Sens (FR):** Le manuel nomme l’alarme 18 « erreur de communication initiale du codeur côté moteur ». Le tableau ne précise pas le dépannage; consulter le manuel exact de l’unité d’entraînement.
- **Official evidence:** C80 Series Alarm/Parameter Manual; C80 Series Alarm/Parameter Manual; IB-1501560-F; 3.1 Servo Errors (S01/S03/S04), drive unit alarm table; printed page 51.
- **Source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Evidence note:** Alarm No. 18 is named Main side encoder: Initial communication error; the details say initial communication with the motor-side encoder failed. Troubleshooting is not specified in this table and requires the exact drive-unit manual.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record axis, full alarm code, encoder type, and drive model. Review alarm history and prior encoder-cable work without disconnecting connectors while running. Inspect connections only after stopping and isolating per the drive manual; do not replace the encoder without diagnosis.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a servo specialist if communication errors persist or electrical encoder testing is required.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-23-excessive-speed-error

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Scope:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 23
- **Meaning (EN):** Alarm No. 23 is Excessive speed error; the manual defines it as the difference between actual and commanded speed persisting longer than the configured excessive-speed-deviation timer. Reset class is NR.
- **المعنى (AR):** الإنذار 23 هو خطأ تجاوز فرق السرعة؛ يعرّف الدليل ذلك باستمرار الفرق بين السرعة الفعلية والمطلوبة مدة أطول من المؤقت المضبوط. فئة إعادة الضبط NR.
- **Sens (FR):** L’alarme 23 correspond à un écart de vitesse excessif; le manuel le définit comme un écart entre vitesse réelle et commandée persistant au-delà de la temporisation réglée. Classe de réinitialisation NR.
- **Official evidence:** C80 Series Alarm/Parameter Manual; C80 Series Alarm/Parameter Manual; IB-1501560-F; 3.1 Servo Errors (S01/S03/S04), drive unit alarm table; printed page 52.
- **Source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Evidence note:** Alarm No. 23 is Excessive speed error; the manual defines it as the difference between actual and commanded speed persisting longer than the configured excessive-speed-deviation timer. Reset class is NR.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Capture the alarm, axis, commanded/actual speed, and available load changes. Visually check for an obstruction from a safe point; do not enter the motion zone or bypass guards. Review the configured deviation timer and exact servo manual; do not change alarm thresholds or control parameters without approval.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate if deviation recurs or accompanies unexpected motion; keep the area secured.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-24-grounding

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Scope:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 24
- **Meaning (EN):** Alarm No. 24 is named Grounding; the manual states the motor power cable is in contact with FG (frame ground). Reset class is PR.
- **المعنى (AR):** يسمّي الدليل الإنذار 24 تأريضًا، ويذكر أن كابل قدرة المحرك يلامس FG (أرضي الهيكل). فئة إعادة الضبط PR.
- **Sens (FR):** Le manuel nomme l’alarme 24 « mise à la terre » et indique que le câble de puissance moteur touche FG (terre du châssis). Classe de réinitialisation PR.
- **Official evidence:** C80 Series Alarm/Parameter Manual; C80 Series Alarm/Parameter Manual; IB-1501560-F; 3.1 Servo Errors (S01/S03/S04), drive unit alarm table; printed page 52.
- **Source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Evidence note:** Alarm No. 24 is named Grounding; the manual states the motor power cable is in contact with FG (frame ground). Reset class is PR.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Stop the machine and apply isolation plus absence-of-voltage verification before inspecting the power cable. Visually inspect chafing points and external damage without touching conductors or taking live measurements. Insulation testing must be performed by a qualified technician per the drive manual; do not megger connected electronics.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a qualified industrial electrician before restart; do not bypass grounding protection.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-25-absolute-position-lost

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Scope:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 25
- **Meaning (EN):** Alarm No. 25 is named Absolute position data lost; the manual states absolute-position data was lost in the encoder. Reset class is AR. Recovery must follow the exact machine-builder and encoder procedure.
- **المعنى (AR):** الإنذار 25 يعني فقدان بيانات الموضع المطلق في المشفّر. فئة إعادة الضبط AR. يجب اتباع إجراء الاستعادة الخاص بمصنّع الماكينة والمشفّر المطابقين.
- **Sens (FR):** L’alarme 25 signifie que les données de position absolue du codeur sont perdues. Classe de réinitialisation AR. Suivre la procédure de récupération propre au constructeur de la machine et au codeur.
- **Official evidence:** C80 Series Alarm/Parameter Manual; C80 Series Alarm/Parameter Manual; IB-1501560-F; 3.1 Servo Errors (S01/S03/S04), drive unit alarm table; printed page 52.
- **Source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Evidence note:** Alarm No. 25 is named Absolute position data lost; the manual states absolute-position data was lost in the encoder. Reset class is AR. Recovery must follow the exact machine-builder and encoder procedure.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Do not move the axis or perform arbitrary homing before confirming reference state and OEM procedure. Record the alarm, battery/encoder status, and any recent power loss or maintenance. Use the drive, encoder, and machine-builder manuals to determine safe position recovery.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a CNC specialist before homing or resuming production; recovery may require axis-position verification.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-emg-plc-emergency-stop

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; emergency-stop alarm section
- **Scope:** Mitsubishi Electric CNC — C80 Series CNC; emergency-stop alarm section
- **Code / event:** Mitsubishi Electric C80 — EMG: user PLC emergency stop
- **Meaning (EN):** The manual states that the PLC emergency-stop signal is turned ON during user-PLC sequence processing and instructs checking the conditions that turn the signal ON and removing the cause. Other EMG labels in the same section have distinct causes and must not be conflated.
- **المعنى (AR):** يوضح الدليل أن إشارة إيقاف الطوارئ القادمة من PLC المستخدم أصبحت مفعّلة أثناء تنفيذ تسلسل PLC. افحص شروط تفعيل الإشارة وأزل السبب؛ لا تخلط بينها وبين رسائل EMG الأخرى ذات الأسباب المختلفة.
- **Sens (FR):** Le manuel indique que le signal d’arrêt d’urgence du PLC utilisateur est activé pendant l’exécution de sa séquence. Vérifier les conditions d’activation et supprimer la cause; ne pas confondre avec d’autres messages EMG.
- **Official evidence:** C80 Series Alarm/Parameter Manual; C80 Series Alarm/Parameter Manual; IB-1501560-F; 8 Emergency Stop Alarms (EMG); printed page 106.
- **Source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Evidence note:** The manual states that the PLC emergency-stop signal is turned ON during user-PLC sequence processing and instructs checking the conditions that turn the signal ON and removing the cause. Other EMG labels in the same section have distinct causes and must not be conflated.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Check the stop-signal state on the diagnostic screen without bypassing the circuit or forcing outputs. Have an authorized person review signal conditions in the PLC program and approved safety schematic. Restart only after identifying the cause, removing the hazard, and verifying the stop system.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** If the stop cause is unclear, keep the machine stopped and escalate to a controls/safety engineer; never bypass the safety circuit.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-siemens-s7-1200-fs-event-0005-overtemperature

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Scope:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Code / event:** 0x0005
- **Meaning (EN):** The manual labels event 0x0005 Overtemperature for all listed fail-safe signal modules and states the module-case high-temperature limit has been exceeded; it directs checking ambient temperature and power cycling after the fault is eliminated.
- **المعنى (AR):** يسمّي الدليل الحدث 0x0005 ارتفاع حرارة، ويذكر تجاوز حد حرارة هيكل الوحدة لوحدات الإشارة الآمنة المحددة. يوجّه إلى فحص حرارة المحيط ثم إعادة التغذية بعد إزالة السبب.
- **Sens (FR):** Le manuel nomme l’événement 0x0005 « surchauffe » et indique que la limite de température du boîtier des modules de sécurité concernés est dépassée. Vérifier la température ambiante puis remettre sous tension après élimination de la cause.
- **Official evidence:** S7-1200 Functional Safety Manual; S7-1200 Functional Safety Manual; V4.6, 11/2022; A5E03470344-AC; 6.2 Fault diagnostics; Event ID 0x0005; printed page 122.
- **Source:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Evidence note:** The manual labels event 0x0005 Overtemperature for all listed fail-safe signal modules and states the module-case high-temperature limit has been exceeded; it directs checking ambient temperature and power cycling after the fault is eliminated.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the Event ID, module part number, and timestamp from the diagnostics buffer. Check cabinet temperature and ventilation externally; do not open an energized cabinet. After correcting the cause, follow the OEM power-cycle procedure; do not bypass the safety function.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a safety/controls engineer if the event recurs or the module does not return to normal.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-siemens-s7-1200-fs-event-004d-profisafe-crc

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Scope:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Code / event:** 0x004D
- **Meaning (EN):** The manual describes event 0x004D as PROFIsafe communication error (CRC), indicating inconsistent data frames; possible cause is communication interference between fail-safe CPU and F-module, including excessive electromagnetic interference or sign-of-life monitoring error. Corrective measures include checking the communication connection and eliminating interference.
- **المعنى (AR):** يصف الدليل الحدث 0x004D بأنه خطأ اتصال PROFIsafe (CRC) مع إطارات بيانات غير متسقة. قد يرتبط بتداخل الاتصال بين CPU الآمن ووحدة F، أو بتداخل كهرومغناطيسي أو مراقبة إشارة الحياة. يوصي بفحص الاتصال وإزالة مصادر التداخل.
- **Sens (FR):** Le manuel décrit l’événement 0x004D comme une erreur de communication PROFIsafe (CRC) avec des trames incohérentes. Une interférence entre la CPU de sécurité et le module F, des perturbations électromagnétiques ou la surveillance de signe de vie peuvent être en cause. Vérifier la liaison et éliminer les perturbations.
- **Official evidence:** S7-1200 Functional Safety Manual; S7-1200 Functional Safety Manual; V4.6, 11/2022; A5E03470344-AC; 6.2 Fault diagnostics; Event ID 0x004D; printed page 122.
- **Source:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Evidence note:** The manual describes event 0x004D as PROFIsafe communication error (CRC), indicating inconsistent data frames; possible cause is communication interference between fail-safe CPU and F-module, including excessive electromagnetic interference or sign-of-life monitoring error. Corrective measures include checking the communication connection and eliminating interference.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record event ID, module, topology, and network diagnostics before changing settings. Externally inspect communication cables/connectors and follow the approved safety-network specification. Do not alter PROFIsafe timing or safety parameters without a risk assessment and approved engineering procedure.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a controls/safety engineer if communication faults persist; do not bypass safety communication.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-siemens-s7-1200-fs-event-004e-profisafe-timeout

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Scope:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Code / event:** 0x004E
- **Meaning (EN):** The manual labels event 0x004E PROFIsafe communication failure (timeout) and states that the F-monitoring time was exceeded. It recommends checking the F-monitoring time and examining the safety program and other CPU activities such as interrupts, Ethernet communication, OB scheduling, and long program paths.
- **المعنى (AR):** يسمّي الدليل الحدث 0x004E فشل اتصال PROFIsafe بسبب انتهاء المهلة، لأن زمن مراقبة F قد تم تجاوزه. يوصي بفحص زمن المراقبة وبرنامج السلامة ونشاطات CPU مثل المقاطعات واتصال Ethernet وجدولة OB ومسارات البرنامج الطويلة.
- **Sens (FR):** Le manuel nomme l’événement 0x004E « défaut de communication PROFIsafe par dépassement de délai » car le temps de surveillance F est dépassé. Vérifier ce délai, le programme de sécurité et les activités CPU : interruptions, Ethernet, planification des OB et chemins de programme longs.
- **Official evidence:** S7-1200 Functional Safety Manual; S7-1200 Functional Safety Manual; V4.6, 11/2022; A5E03470344-AC; 6.2 Fault diagnostics; Event ID 0x004E; printed page 122.
- **Source:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Evidence note:** The manual labels event 0x004E PROFIsafe communication failure (timeout) and states that the F-monitoring time was exceeded. It recommends checking the F-monitoring time and examining the safety program and other CPU activities such as interrupts, Ethernet communication, OB scheduling, and long program paths.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Preserve diagnostics, CPU-cycle data, and event details before changing monitoring time. Have an authorized engineer review CPU load, interrupts, communications, and the safety program. Do not increase the timeout merely to suppress the alarm; risk analysis and safety validation are required.
- **الفحوص الآمنة (AR):**
- سجّل رمز الإنذار والطراز والإصدار. اتبع تعليمات الدليل وإجراءات العزل والتحقق من انعدام الجهد؛ لا تتجاوز وسائل الحماية.
- **Contrôles sûrs (FR):**
- Consigner le code, le modèle et la révision. Suivre le manuel et la procédure de consignation; ne jamais contourner les protections.
- **Escalation (EN):** Escalate to a functional-safety engineer before changing F-monitoring time or resuming production.
- **التصعيد (AR):** صعّد إلى فني مؤهل عند تكرار العطل أو الاشتباه في خلل داخلي أو متعلق بالسلامة.
- **Escalade (FR):** Escalader vers un spécialiste qualifié en cas de récidive ou de risque de sécurité.
- **Limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-h5u-err-system-indicator

- **Manufacturer / family:** INOVANCE — H5U Series Programmable Logic Controller
- **Scope:** INOVANCE H5U series PLC; hardware status indicators; H5U User Guide revision A00 (June 2023); verify current hardware and firmware revision
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** The H5U guide defines the ERR indicator as a PLC system fault. The indicator alone does not identify the root cause; retrieve the controller diagnostics and exact event details.
- **المعنى (AR):** يعرّف دليل H5U مؤشر ERR بأنه عطل في نظام PLC. لا يحدد المؤشر وحده السبب الجذري؛ يجب استخراج تشخيصات المتحكم وتفاصيل الحدث.
- **Sens (FR):** Le guide H5U définit le voyant ERR comme un défaut système du PLC. Le voyant seul n’identifie pas la cause racine; consulter les diagnostics du contrôleur et les détails de l’événement.
- **Official evidence:** H5U Series Programmable Logic Controller User Guide (Without CAN, Electronic CAM, Electronic Gear); June 2023; A00; document code 19012251A00; 5 Operation and Maintenance → 5.3 Indicators.
- **Source:** https://portal-file.inovance.com/owfile/ProdDoc/SC/19012251-SC/A00/19012251-SC_A00%E3%80%8AH5U%20Series%20Programmable%20Logic%20Control%20User%20Guide%20%E3%80%8BWithout%20CAN%2C%20ECAM%2C%20Electronic%20Gear-EN.pdf
- **Evidence note:** The official H5U guide identifies the RUN, ERR, BAT and BF indicators and defines ERR as system failure, BAT as battery error, and BF as EtherCAT bus error. These records describe indicator meaning only, not a specific root cause.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record PLC model, RUN/ERR states, exact diagnostic text, program/firmware revision and event time.
- Preserve the project and diagnostic/event logs before power cycling or changing parameters.
- Check power, I/O and communication status only using the approved schematic and site isolation procedure; do not force outputs or bypass interlocks.
- **الفحوص الآمنة (AR):**
- سجّل طراز PLC وحالة مؤشري RUN وERR ونص التشخيص وإصدار البرنامج/البرنامج الثابت ووقت الحدث.
- احفظ نسخة المشروع وسجلات التشخيص والأحداث قبل فصل التغذية أو تغيير المعلمات.
- افحص التغذية وحالة I/O والاتصالات بالرجوع إلى المخطط المعتمد وإجراء العزل؛ لا تفرض المخارج ولا تتجاوز دوائر التعشيق.
- **Contrôles sûrs (FR):**
- Consigner le modèle PLC, les états RUN/ERR, le texte exact du diagnostic, les versions programme/firmware et l’heure de l’événement.
- Sauvegarder le projet et les journaux avant coupure ou modification des paramètres.
- Contrôler alimentation, E/S et communications selon le schéma approuvé et la procédure de consignation; ne pas forcer les sorties ni contourner les interverrouillages.
- **Escalation (EN):** Escalate persistent ERR status, unexplained machine motion, safety-related errors or loss of the PLC project to qualified controls personnel and the machine builder.
- **التصعيد (AR):** صعّد إلى مختص تحكم ومصنّع الماكينة عند استمرار ERR أو حدوث حركة غير مفسرة أو خطأ متعلق بالسلامة أو فقد مشروع PLC.
- **Escalade (FR):** Faire intervenir un spécialiste automatismes et le constructeur si ERR persiste, si un mouvement est inexpliqué, si la sécurité est concernée ou si le projet PLC est perdu.
- **Limit:** Indicator meaning only; no exact H5U alarm code or root cause is asserted. Confirm the installed manual revision and retrieve the actual diagnostic event.

### oem-inovance-h5u-bat-battery-indicator

- **Manufacturer / family:** INOVANCE — H5U Series Programmable Logic Controller
- **Scope:** INOVANCE H5U series PLC; BAT indicator; H5U User Guide revision A00 (June 2023); verify installed hardware revision
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** The H5U guide identifies BAT as a battery error indicator. It does not by itself specify the battery condition, retention risk or replacement procedure for every hardware variant.
- **المعنى (AR):** يحدد دليل H5U مؤشر BAT على أنه خطأ في البطارية. ولا يحدد المؤشر وحده حالة البطارية أو خطر فقد البيانات أو إجراء الاستبدال لكل نسخ العتاد.
- **Sens (FR):** Le guide H5U identifie BAT comme un indicateur de défaut de batterie. Il ne précise pas à lui seul l’état de la batterie, le risque de perte des données ni la procédure pour toutes les variantes matérielles.
- **Official evidence:** H5U Series Programmable Logic Controller User Guide (Without CAN, Electronic CAM, Electronic Gear); June 2023; A00; document code 19012251A00; 5 Operation and Maintenance → 5.3 Indicators.
- **Source:** https://portal-file.inovance.com/owfile/ProdDoc/SC/19012251-SC/A00/19012251-SC_A00%E3%80%8AH5U%20Series%20Programmable%20Logic%20Control%20User%20Guide%20%E3%80%8BWithout%20CAN%2C%20ECAM%2C%20Electronic%20Gear-EN.pdf
- **Evidence note:** The official H5U guide identifies the RUN, ERR, BAT and BF indicators and defines ERR as system failure, BAT as battery error, and BF as EtherCAT bus error. These records describe indicator meaning only, not a specific root cause.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact CPU model and indicator state; back up the PLC project and relevant retained data before maintenance.
- Consult the manual for the exact CPU and battery type before replacement; do not assume data retention during battery removal.
- Follow the manufacturer’s replacement and disposal instructions and the site's isolation procedure.
- **الفحوص الآمنة (AR):**
- سجّل طراز CPU الدقيق وحالة المؤشر، وخذ نسخة احتياطية من مشروع PLC والبيانات المحتفظ بها قبل الصيانة.
- راجع دليل وحدة CPU ونوع البطارية المطابقين قبل الاستبدال؛ لا تفترض بقاء البيانات عند نزع البطارية.
- اتبع تعليمات الشركة المصنّعة للاستبدال والتخلص من البطارية وإجراء العزل المعتمد.
- **Contrôles sûrs (FR):**
- Consigner le modèle exact du CPU et l’état du voyant; sauvegarder le projet PLC et les données rémanentes avant maintenance.
- Consulter le manuel du CPU et le type de batterie exact avant remplacement; ne pas supposer que les données seront conservées pendant le retrait.
- Suivre les instructions du fabricant pour le remplacement et l’élimination de la batterie ainsi que la procédure de consignation du site.
- **Escalation (EN):** Escalate if the battery warning persists, retained data may be at risk, or the replacement procedure for the exact CPU variant is unclear.
- **التصعيد (AR):** صعّد إذا استمر تحذير البطارية أو كان حفظ البيانات مهددًا أو لم يتضح إجراء الاستبدال الخاص بنسخة CPU.
- **Escalade (FR):** Faire intervenir le support si l’avertissement persiste, si les données rémanentes sont menacées ou si la procédure propre au CPU n’est pas claire.
- **Limit:** Indicator meaning only; does not specify a battery part number, replacement interval or data-retention duration.

### oem-inovance-h5u-bf-ethercat-indicator

- **Manufacturer / family:** INOVANCE — H5U Series Programmable Logic Controller
- **Scope:** INOVANCE H5U series PLC; EtherCAT bus indicator; H5U User Guide revision A00 (June 2023); verify installed EtherCAT topology and firmware
- **Code / event:** No single alarm code; diagnostic indicator/procedure
- **Meaning (EN):** The H5U guide identifies BF as an EtherCAT bus error indicator. It does not establish which slave, cable, topology or configuration is responsible; inspect the actual bus diagnostics.
- **المعنى (AR):** يحدد دليل H5U مؤشر BF على أنه خطأ في ناقل EtherCAT. ولا يحدد المؤشر وحده وحدة التابع أو الكابل أو البنية أو الإعداد المسؤول؛ افحص تشخيصات الناقل الفعلية.
- **Sens (FR):** Le guide H5U identifie BF comme un indicateur d’erreur du bus EtherCAT. Il ne désigne pas à lui seul l’esclave, le câble, la topologie ou la configuration en cause; consulter les diagnostics réels du bus.
- **Official evidence:** H5U Series Programmable Logic Controller User Guide (Without CAN, Electronic CAM, Electronic Gear); June 2023; A00; document code 19012251A00; 5 Operation and Maintenance → 5.3 Indicators.
- **Source:** https://portal-file.inovance.com/owfile/ProdDoc/SC/19012251-SC/A00/19012251-SC_A00%E3%80%8AH5U%20Series%20Programmable%20Logic%20Control%20User%20Guide%20%E3%80%8BWithout%20CAN%2C%20ECAM%2C%20Electronic%20Gear-EN.pdf
- **Evidence note:** The official H5U guide identifies the RUN, ERR, BAT and BF indicators and defines ERR as system failure, BAT as battery error, and BF as EtherCAT bus error. These records describe indicator meaning only, not a specific root cause.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the EtherCAT topology, master/slave models, firmware versions and exact diagnostic state before restarting the bus.
- Inspect link/status indicators and connectors only under approved safe conditions; compare the topology and device order with the project.
- Check the controller’s EtherCAT diagnostic view for the first failing node and preserve logs; do not hot-plug unless the exact system explicitly permits it.
- **الفحوص الآمنة (AR):**
- سجّل بنية EtherCAT وطرازات المتحكم الرئيسي والوحدات التابعة وإصدارات البرنامج الثابت وحالة التشخيص قبل إعادة تشغيل الناقل.
- افحص مؤشرات الاتصال والموصلات ضمن شروط العمل الآمنة المعتمدة، وقارن ترتيب الأجهزة بالمشروع.
- راجع تشخيص EtherCAT لتحديد أول عقدة فاشلة واحفظ السجلات؛ لا تفصل أو توصل أثناء التشغيل إلا إذا سمح النظام المحدد بذلك صراحةً.
- **Contrôles sûrs (FR):**
- Consigner la topologie EtherCAT, les modèles maître/esclaves, les versions firmware et l’état de diagnostic avant redémarrage du bus.
- Contrôler les voyants de liaison et connecteurs dans les conditions de sécurité approuvées; comparer l’ordre des appareils au projet.
- Consulter le diagnostic EtherCAT pour identifier le premier nœud en défaut et sauvegarder les journaux; ne pas connecter/déconnecter à chaud sauf autorisation explicite du système exact.
- **Escalation (EN):** Escalate recurring bus faults, unexpected axis motion, loss of safety communication or unresolved slave identification to a qualified automation engineer.
- **التصعيد (AR):** صعّد عند تكرار أخطاء الناقل أو حركة محور غير متوقعة أو فقد اتصال السلامة أو تعذر تحديد الوحدة التابعة إلى مهندس أتمتة مؤهل.
- **Escalade (FR):** Faire intervenir un automaticien qualifié en cas de défauts bus récurrents, de mouvement inattendu, de perte de communication de sécurité ou d’esclave non identifié.
- **Limit:** Indicator meaning only; not an EtherCAT fault-code mapping. Exact root cause must come from the installed topology and diagnostic log.

### xinje-xnet-error-1-remote-device-connection

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — X-NET fieldbus / XINJEConfig remote-connection diagnostics
- **Scope:** XINJE X-NET fieldbus user manual; remote-connection diagnostic table; Manual Data No. PD06 20151009 3.2; confirm installed XINJEConfig and X-NET versions
- **Code / event:** 1
- **Meaning (EN):** The X-NET manual associates code 1 with failure to connect to a remote device and notes that an unstable network environment may contribute.
- **المعنى (AR):** يربط دليل X-NET الرمز 1 بفشل الاتصال بجهاز بعيد، ويذكر أن عدم استقرار الشبكة قد يساهم في ذلك.
- **Sens (FR):** Le manuel X-NET associe le code 1 à l’échec de connexion à un appareil distant et indique qu’un réseau instable peut y contribuer.
- **Official evidence:** X-NET fieldbus User Manual; Data No. PD06 20151009 3.2; 2. Search the device ID → Report error message when building the remote connection.
- **Source:** https://cdn-en.xinje.com/XNET%20manual.pdf
- **Evidence note:** The official XINJE X-NET manual lists the stated error codes and brief explanations in the remote-connection diagnostic table. These are XINJEConfig/X-NET connection errors, not universal PLC alarm codes; the manual's antivirus-removal suggestion is intentionally not reproduced.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact error code, software version, remote device ID and time of failure.
- Check network reachability and the documented remote parameters on both endpoints; compare them with the approved configuration.
- Do not share passwords in logs or bypass corporate security controls. If the fault persists, preserve logs and escalate to controls/network support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الخطأ وإصدار البرنامج ومعرّف الجهاز البعيد ووقت حدوث العطل.
- تحقق من إمكانية الوصول عبر الشبكة ومن المعلمات البعيدة على الطرفين، وقارنها بالإعداد المعتمد.
- لا تضع كلمات المرور في السجلات ولا تتجاوز ضوابط أمن الشبكة. إذا استمر العطل، احفظ السجلات وصعّد إلى دعم التحكم/الشبكات.
- **Contrôles sûrs (FR):**
- Consigner le code exact, la version logicielle, l’identifiant distant et l’heure de l’incident.
- Vérifier l’accessibilité réseau et les paramètres distants aux deux extrémités, puis les comparer à la configuration approuvée.
- Ne pas inclure de mots de passe dans les journaux ni contourner les contrôles de sécurité. En cas de persistance, conserver les journaux et solliciter le support automatismes/réseau.
- **Escalation (EN):** Escalate persistent errors, unexplained remote sessions or suspected credential/security issues to the automation and IT/network owners.
- **التصعيد (AR):** صعّد الأخطاء المستمرة أو جلسات الاتصال البعيد غير المفسرة أو الاشتباه في مشكلة بيانات دخول/أمن إلى مسؤولي الأتمتة وتقنية المعلومات/الشبكة.
- **Escalade (FR):** Faire intervenir les responsables automatismes et informatique/réseau en cas d’erreurs persistantes, de sessions distantes inexpliquées ou de suspicion de problème d’identifiants/sécurité.
- **Limit:** Applies only to the X-NET/XINJEConfig remote-connection diagnostic table in the cited manual. These are not PLC ladder, servo-drive or machine-builder alarm codes. No printed page number was available in the reviewed extracted text.

### xinje-xnet-error-16-sponsor-not-logged-in

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — X-NET fieldbus / XINJEConfig remote-connection diagnostics
- **Scope:** XINJE X-NET fieldbus user manual; remote-connection diagnostic table; Manual Data No. PD06 20151009 3.2; confirm installed XINJEConfig and X-NET versions
- **Code / event:** 16
- **Meaning (EN):** The manual labels code 16 as the initiating party not logged in; its note mentions network instability as a possible contributing condition.
- **المعنى (AR):** يسمّي الدليل الرمز 16 عدم تسجيل الطرف البادئ الدخول، ويذكر أن عدم استقرار الشبكة قد يكون عاملًا مساهمًا.
- **Sens (FR):** Le manuel décrit le code 16 comme l’absence de connexion de la partie initiatrice; il mentionne une instabilité réseau possible.
- **Official evidence:** X-NET fieldbus User Manual; Data No. PD06 20151009 3.2; 2. Search the device ID → Report error message when building the remote connection.
- **Source:** https://cdn-en.xinje.com/XNET%20manual.pdf
- **Evidence note:** The official XINJE X-NET manual lists the stated error codes and brief explanations in the remote-connection diagnostic table. These are XINJEConfig/X-NET connection errors, not universal PLC alarm codes; the manual's antivirus-removal suggestion is intentionally not reproduced.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact error code, software version, remote device ID and time of failure.
- Check network reachability and the documented remote parameters on both endpoints; compare them with the approved configuration.
- Do not share passwords in logs or bypass corporate security controls. If the fault persists, preserve logs and escalate to controls/network support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الخطأ وإصدار البرنامج ومعرّف الجهاز البعيد ووقت حدوث العطل.
- تحقق من إمكانية الوصول عبر الشبكة ومن المعلمات البعيدة على الطرفين، وقارنها بالإعداد المعتمد.
- لا تضع كلمات المرور في السجلات ولا تتجاوز ضوابط أمن الشبكة. إذا استمر العطل، احفظ السجلات وصعّد إلى دعم التحكم/الشبكات.
- **Contrôles sûrs (FR):**
- Consigner le code exact, la version logicielle, l’identifiant distant et l’heure de l’incident.
- Vérifier l’accessibilité réseau et les paramètres distants aux deux extrémités, puis les comparer à la configuration approuvée.
- Ne pas inclure de mots de passe dans les journaux ni contourner les contrôles de sécurité. En cas de persistance, conserver les journaux et solliciter le support automatismes/réseau.
- **Escalation (EN):** Escalate persistent errors, unexplained remote sessions or suspected credential/security issues to the automation and IT/network owners.
- **التصعيد (AR):** صعّد الأخطاء المستمرة أو جلسات الاتصال البعيد غير المفسرة أو الاشتباه في مشكلة بيانات دخول/أمن إلى مسؤولي الأتمتة وتقنية المعلومات/الشبكة.
- **Escalade (FR):** Faire intervenir les responsables automatismes et informatique/réseau en cas d’erreurs persistantes, de sessions distantes inexpliquées ou de suspicion de problème d’identifiants/sécurité.
- **Limit:** Applies only to the X-NET/XINJEConfig remote-connection diagnostic table in the cited manual. These are not PLC ladder, servo-drive or machine-builder alarm codes. No printed page number was available in the reviewed extracted text.

### xinje-xnet-error-17-recipient-not-logged-in

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — X-NET fieldbus / XINJEConfig remote-connection diagnostics
- **Scope:** XINJE X-NET fieldbus user manual; remote-connection diagnostic table; Manual Data No. PD06 20151009 3.2; confirm installed XINJEConfig and X-NET versions
- **Code / event:** 17
- **Meaning (EN):** The manual labels code 17 as recipient not logged in and directs checking the device ID, BOX/XDE login state, remote parameters and network.
- **المعنى (AR):** يسمّي الدليل الرمز 17 عدم تسجيل الطرف المستقبِل الدخول، ويوجّه إلى فحص معرّف الجهاز وحالة دخول BOX/XDE والمعلمات البعيدة والشبكة.
- **Sens (FR):** Le manuel décrit le code 17 comme l’absence de connexion du destinataire et recommande de vérifier l’identifiant, l’état de connexion BOX/XDE, les paramètres distants et le réseau.
- **Official evidence:** X-NET fieldbus User Manual; Data No. PD06 20151009 3.2; 2. Search the device ID → Report error message when building the remote connection.
- **Source:** https://cdn-en.xinje.com/XNET%20manual.pdf
- **Evidence note:** The official XINJE X-NET manual lists the stated error codes and brief explanations in the remote-connection diagnostic table. These are XINJEConfig/X-NET connection errors, not universal PLC alarm codes; the manual's antivirus-removal suggestion is intentionally not reproduced.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact error code, software version, remote device ID and time of failure.
- Check network reachability and the documented remote parameters on both endpoints; compare them with the approved configuration.
- Do not share passwords in logs or bypass corporate security controls. If the fault persists, preserve logs and escalate to controls/network support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الخطأ وإصدار البرنامج ومعرّف الجهاز البعيد ووقت حدوث العطل.
- تحقق من إمكانية الوصول عبر الشبكة ومن المعلمات البعيدة على الطرفين، وقارنها بالإعداد المعتمد.
- لا تضع كلمات المرور في السجلات ولا تتجاوز ضوابط أمن الشبكة. إذا استمر العطل، احفظ السجلات وصعّد إلى دعم التحكم/الشبكات.
- **Contrôles sûrs (FR):**
- Consigner le code exact, la version logicielle, l’identifiant distant et l’heure de l’incident.
- Vérifier l’accessibilité réseau et les paramètres distants aux deux extrémités, puis les comparer à la configuration approuvée.
- Ne pas inclure de mots de passe dans les journaux ni contourner les contrôles de sécurité. En cas de persistance, conserver les journaux et solliciter le support automatismes/réseau.
- **Escalation (EN):** Escalate persistent errors, unexplained remote sessions or suspected credential/security issues to the automation and IT/network owners.
- **التصعيد (AR):** صعّد الأخطاء المستمرة أو جلسات الاتصال البعيد غير المفسرة أو الاشتباه في مشكلة بيانات دخول/أمن إلى مسؤولي الأتمتة وتقنية المعلومات/الشبكة.
- **Escalade (FR):** Faire intervenir les responsables automatismes et informatique/réseau en cas d’erreurs persistantes, de sessions distantes inexpliquées ou de suspicion de problème d’identifiants/sécurité.
- **Limit:** Applies only to the X-NET/XINJEConfig remote-connection diagnostic table in the cited manual. These are not PLC ladder, servo-drive or machine-builder alarm codes. No printed page number was available in the reviewed extracted text.

### xinje-xnet-error-18-safe-mode-mismatch

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — X-NET fieldbus / XINJEConfig remote-connection diagnostics
- **Scope:** XINJE X-NET fieldbus user manual; remote-connection diagnostic table; Manual Data No. PD06 20151009 3.2; confirm installed XINJEConfig and X-NET versions
- **Code / event:** 18
- **Meaning (EN):** The manual states that code 18 means remote parameters on the device and PC are not correct or consistent.
- **المعنى (AR):** يذكر الدليل أن الرمز 18 يعني أن المعلمات البعيدة على الجهاز والحاسوب غير صحيحة أو غير متطابقة.
- **Sens (FR):** Le manuel indique que le code 18 signifie que les paramètres distants du périphérique et du PC sont incorrects ou incohérents.
- **Official evidence:** X-NET fieldbus User Manual; Data No. PD06 20151009 3.2; 2. Search the device ID → Report error message when building the remote connection.
- **Source:** https://cdn-en.xinje.com/XNET%20manual.pdf
- **Evidence note:** The official XINJE X-NET manual lists the stated error codes and brief explanations in the remote-connection diagnostic table. These are XINJEConfig/X-NET connection errors, not universal PLC alarm codes; the manual's antivirus-removal suggestion is intentionally not reproduced.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact error code, software version, remote device ID and time of failure.
- Check network reachability and the documented remote parameters on both endpoints; compare them with the approved configuration.
- Do not share passwords in logs or bypass corporate security controls. If the fault persists, preserve logs and escalate to controls/network support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الخطأ وإصدار البرنامج ومعرّف الجهاز البعيد ووقت حدوث العطل.
- تحقق من إمكانية الوصول عبر الشبكة ومن المعلمات البعيدة على الطرفين، وقارنها بالإعداد المعتمد.
- لا تضع كلمات المرور في السجلات ولا تتجاوز ضوابط أمن الشبكة. إذا استمر العطل، احفظ السجلات وصعّد إلى دعم التحكم/الشبكات.
- **Contrôles sûrs (FR):**
- Consigner le code exact, la version logicielle, l’identifiant distant et l’heure de l’incident.
- Vérifier l’accessibilité réseau et les paramètres distants aux deux extrémités, puis les comparer à la configuration approuvée.
- Ne pas inclure de mots de passe dans les journaux ni contourner les contrôles de sécurité. En cas de persistance, conserver les journaux et solliciter le support automatismes/réseau.
- **Escalation (EN):** Escalate persistent errors, unexplained remote sessions or suspected credential/security issues to the automation and IT/network owners.
- **التصعيد (AR):** صعّد الأخطاء المستمرة أو جلسات الاتصال البعيد غير المفسرة أو الاشتباه في مشكلة بيانات دخول/أمن إلى مسؤولي الأتمتة وتقنية المعلومات/الشبكة.
- **Escalade (FR):** Faire intervenir les responsables automatismes et informatique/réseau en cas d’erreurs persistantes, de sessions distantes inexpliquées ou de suspicion de problème d’identifiants/sécurité.
- **Limit:** Applies only to the X-NET/XINJEConfig remote-connection diagnostic table in the cited manual. These are not PLC ladder, servo-drive or machine-builder alarm codes. No printed page number was available in the reviewed extracted text.

### xinje-xnet-error-19-password-error

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — X-NET fieldbus / XINJEConfig remote-connection diagnostics
- **Scope:** XINJE X-NET fieldbus user manual; remote-connection diagnostic table; Manual Data No. PD06 20151009 3.2; confirm installed XINJEConfig and X-NET versions
- **Code / event:** 19
- **Meaning (EN):** The manual labels code 19 as a password error; do not store or request credentials in the fault record.
- **المعنى (AR):** يسمّي الدليل الرمز 19 خطأ في كلمة المرور؛ لا تخزّن بيانات الدخول ولا تطلبها داخل سجل العطل.
- **Sens (FR):** Le manuel nomme le code 19 « erreur de mot de passe »; ne pas enregistrer ni demander les identifiants dans le dossier d’incident.
- **Official evidence:** X-NET fieldbus User Manual; Data No. PD06 20151009 3.2; 2. Search the device ID → Report error message when building the remote connection.
- **Source:** https://cdn-en.xinje.com/XNET%20manual.pdf
- **Evidence note:** The official XINJE X-NET manual lists the stated error codes and brief explanations in the remote-connection diagnostic table. These are XINJEConfig/X-NET connection errors, not universal PLC alarm codes; the manual's antivirus-removal suggestion is intentionally not reproduced.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact error code, software version, remote device ID and time of failure.
- Check network reachability and the documented remote parameters on both endpoints; compare them with the approved configuration.
- Do not share passwords in logs or bypass corporate security controls. If the fault persists, preserve logs and escalate to controls/network support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الخطأ وإصدار البرنامج ومعرّف الجهاز البعيد ووقت حدوث العطل.
- تحقق من إمكانية الوصول عبر الشبكة ومن المعلمات البعيدة على الطرفين، وقارنها بالإعداد المعتمد.
- لا تضع كلمات المرور في السجلات ولا تتجاوز ضوابط أمن الشبكة. إذا استمر العطل، احفظ السجلات وصعّد إلى دعم التحكم/الشبكات.
- **Contrôles sûrs (FR):**
- Consigner le code exact, la version logicielle, l’identifiant distant et l’heure de l’incident.
- Vérifier l’accessibilité réseau et les paramètres distants aux deux extrémités, puis les comparer à la configuration approuvée.
- Ne pas inclure de mots de passe dans les journaux ni contourner les contrôles de sécurité. En cas de persistance, conserver les journaux et solliciter le support automatismes/réseau.
- **Escalation (EN):** Escalate persistent errors, unexplained remote sessions or suspected credential/security issues to the automation and IT/network owners.
- **التصعيد (AR):** صعّد الأخطاء المستمرة أو جلسات الاتصال البعيد غير المفسرة أو الاشتباه في مشكلة بيانات دخول/أمن إلى مسؤولي الأتمتة وتقنية المعلومات/الشبكة.
- **Escalade (FR):** Faire intervenir les responsables automatismes et informatique/réseau en cas d’erreurs persistantes, de sessions distantes inexpliquées ou de suspicion de problème d’identifiants/sécurité.
- **Limit:** Applies only to the X-NET/XINJEConfig remote-connection diagnostic table in the cited manual. These are not PLC ladder, servo-drive or machine-builder alarm codes. No printed page number was available in the reviewed extracted text.

### xinje-xnet-error-255-login-failed

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — X-NET fieldbus / XINJEConfig remote-connection diagnostics
- **Scope:** XINJE X-NET fieldbus user manual; remote-connection diagnostic table; Manual Data No. PD06 20151009 3.2; confirm installed XINJEConfig and X-NET versions
- **Code / event:** 255
- **Meaning (EN):** The manual labels code 255 as login failed and recommends checking remote parameters, network environment and firewall settings. The antivirus-uninstallation suggestion is excluded as an unsafe generic step.
- **المعنى (AR):** يسمّي الدليل الرمز 255 فشل تسجيل الدخول، ويوصي بفحص المعلمات البعيدة والشبكة وإعدادات جدار الحماية. تم استبعاد اقتراح إزالة مضاد الفيروسات كخطوة عامة غير آمنة.
- **Sens (FR):** Le manuel nomme le code 255 « échec de connexion » et recommande de vérifier les paramètres distants, le réseau et le pare-feu. La suggestion de désinstaller l’antivirus est exclue des consignes génériques.
- **Official evidence:** X-NET fieldbus User Manual; Data No. PD06 20151009 3.2; 2. Search the device ID → Report error message when building the remote connection.
- **Source:** https://cdn-en.xinje.com/XNET%20manual.pdf
- **Evidence note:** The official XINJE X-NET manual lists the stated error codes and brief explanations in the remote-connection diagnostic table. These are XINJEConfig/X-NET connection errors, not universal PLC alarm codes; the manual's antivirus-removal suggestion is intentionally not reproduced.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks (EN):**
- Record the exact error code, software version, remote device ID and time of failure.
- Check network reachability and the documented remote parameters on both endpoints; compare them with the approved configuration.
- Do not share passwords in logs or bypass corporate security controls. If the fault persists, preserve logs and escalate to controls/network support.
- **الفحوص الآمنة (AR):**
- سجّل رمز الخطأ وإصدار البرنامج ومعرّف الجهاز البعيد ووقت حدوث العطل.
- تحقق من إمكانية الوصول عبر الشبكة ومن المعلمات البعيدة على الطرفين، وقارنها بالإعداد المعتمد.
- لا تضع كلمات المرور في السجلات ولا تتجاوز ضوابط أمن الشبكة. إذا استمر العطل، احفظ السجلات وصعّد إلى دعم التحكم/الشبكات.
- **Contrôles sûrs (FR):**
- Consigner le code exact, la version logicielle, l’identifiant distant et l’heure de l’incident.
- Vérifier l’accessibilité réseau et les paramètres distants aux deux extrémités, puis les comparer à la configuration approuvée.
- Ne pas inclure de mots de passe dans les journaux ni contourner les contrôles de sécurité. En cas de persistance, conserver les journaux et solliciter le support automatismes/réseau.
- **Escalation (EN):** Escalate persistent errors, unexplained remote sessions or suspected credential/security issues to the automation and IT/network owners.
- **التصعيد (AR):** صعّد الأخطاء المستمرة أو جلسات الاتصال البعيد غير المفسرة أو الاشتباه في مشكلة بيانات دخول/أمن إلى مسؤولي الأتمتة وتقنية المعلومات/الشبكة.
- **Escalade (FR):** Faire intervenir les responsables automatismes et informatique/réseau en cas d’erreurs persistantes, de sessions distantes inexpliquées ou de suspicion de problème d’identifiants/sécurité.
- **Limit:** Applies only to the X-NET/XINJEConfig remote-connection diagnostic table in the cited manual. These are not PLC ladder, servo-drive or machine-builder alarm codes. No printed page number was available in the reviewed extracted text.

## Evidence acquisition queue

Prioritize the next batch by actual installed equipment and available official manuals:

1. Chinese PLC/CNC/servo: INOVANCE H5U/AM series, Delta AS/DVP and ASDA, XINJE XC/XD/DS, HuazhongCNC HNC, GSK, Syntec and LNC.
2. European PLC/CNC/drive: Siemens SIMATIC/SINUMERIK/SINAMICS, Beckhoff TwinCAT/EtherCAT, Bosch Rexroth IndraDrive/ctrlX, Schneider Modicon/Altivar, HEIDENHAIN TNC, Lenze and SEW-EURODRIVE.
3. Machine builders: injection moulding, laser cutting, woodworking, packaging, textile and machine-tool OEMs; always capture machine builder and component OEM separately.

Do not mark a case verified until the exact manual and section/page have been checked and the code's meaning is supported in that source. Keep unsupported codes in a separate unverified intake queue.
