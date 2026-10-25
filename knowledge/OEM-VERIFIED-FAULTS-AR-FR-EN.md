# OEM fault and diagnostic evidence records (AR / FR / EN)

> Verified means the cited official source supports the specific statement below. It does not mean every installation using the same brand behaves identically. Match machine builder, controller/drive model, firmware and manual revision before applying a record.

- Review date: 2026-10-24
- Model-scoped records in this file: 99; 84 manual-claim-reviewed (not field-verified), 15 pending claim-level review
- Languages: Arabic, French and English; summaries are paraphrased rather than copied from manuals.
- Chinese OEM coverage includes XINJE DS5K servo drivers, XINJE X-NET remote-connection diagnostics, and INOVANCE MD200 drives/H5U PLC indicators; this is not yet broad coverage of all Chinese CNC/PLC families.
- Other represented families include Delta ASDA-B2-F servo alarms, Syntec CNC communication alarms, Siemens SINUMERIK/SINAMICS/SIMATIC S7-1200, Mitsubishi Electric CNC/PLC/servo, and GSK218M CNC records.
- Evidence acquisition queue: INOVANCE H5U fault events and other PLC series, Delta PLC and other ASDA series, XINJE PLC families, GSK/HuazhongCNC/Syntec/LNC CNC controls, Siemens PLC/CNC, Beckhoff, Bosch Rexroth, Schneider Electric and machine-builder-specific alarm tables.
- Store concise original summaries and links, not copied manual chapters.

## Record format and evidence limits

Each record includes product family, model/software scope, code or diagnostic event, multilingual summary, official manual title/revision, section, page where available, evidence summary, safe checks, escalation guidance and review date.

Records marked `verified-source-exact-scope` describe what the cited manual supports. Any future record marked `source-registered-pending-claim-review` is not approved for technical claims and must not be presented as manufacturer-confirmed. They do not establish that a particular machine has that physical fault, and they do not replace the machine builder's electrical drawings, parameter backup, risk assessment or site isolation procedure.

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
- **Meaning (EN):** The MD200 manual labels Err14 as Module overheat and lists high ambient temperature, blocked air filter, damaged fan, damaged module thermistor, or a faulty drive unit as possible causes.
- **المعنى (AR):** يصنّف الدليل Err14 على أنه ارتفاع حرارة المغير. تشمل الأسباب المحتملة ارتفاع حرارة المحيط، أو انسداد مرشح الهواء، أو تلف المروحة أو حساس حرارة الوحدة، أو عطل وحدة القيادة.
- **Sens (FR):** Le guide classe Err14 comme une surchauffe du module. Les causes possibles comprennent une température ambiante élevée, un filtre d’air obstrué, un ventilateur ou thermistor de module endommagé, ou une unité de variateur défectueuse.
- **Official evidence:** MD200 User Guide; MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113; 3 Fault > 3.2 Faults and Solutions; printed page 35.
- **Source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Evidence note:** The manual labels Err14 as module overheat and lists high ambient temperature, blocked air filter, damaged fan, damaged module thermistor, or a faulty drive unit as possible causes.
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


## Added model-specific tranche — Siemens SINAMICS G120C FSD–FSF

**Official document:** [SINAMICS G120C FSD…FSF Compact Operating Instructions](https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf), firmware V4.7 SP6, document A5E39339884B AA, November 2016. See section **5.1, “List of alarms and faults,” printed page 82**.

The following structured entries were added to `faults.json`. The descriptions below are short paraphrases of the manual's table; they apply only to the stated G120C frame range and manual/firmware context, not to every SINAMICS model.

| Fault | Manual description | Manual-listed diagnostic direction |
|---|---|---|
| F07860 | External fault 1 | Identify and remove the external cause that triggered the fault. |
| F07900 | Motor blocked | Check that the motor/load can rotate freely and review the documented positive/negative torque limits. |
| F07901 | Motor overspeed | The manual points to speed-controller precontrol; any parameter change requires authorized engineering review. |
| F07902 | Motor stalled | Check motor-data parameterization/identification, documented current-limit parameters, and possible motor-cable disconnection during operation. |
| F08501 | Setpoint timeout | Check PROFINET connection and controller RUN state; review the documented monitoring-time parameter if repeated. |
| F08502 | Sign-of-life monitoring time expired | Check the PROFINET connection. |
| F08526 | No cyclic connection | Check cyclic operation and the documented station-name/IP parameters. |

### Safe-use boundary

- These are **manual-claim-reviewed**, not field-verified cases. A matching code alone does not prove the root cause.
- Capture the full code, exact drive model, frame size, firmware, connected controller, and machine state before troubleshooting.
- Do not change speed, torque, current, or network monitoring parameters merely to suppress a fault. Apply the machine's risk assessment, OEM instructions, and authorized change process.
- Isolate hazardous energy before inspecting wiring or mechanical load. Never touch the DC link unless qualified and the OEM discharge/verification procedure has been completed.


## Newly reviewed source tranche: Siemens SINAMICS G120C FSD–FSF

Official source: [SINAMICS G120C FSD…FSF Compact Operating Instructions](https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf), firmware V4.7 SP6, document A5E39339884B AA (11/2016), section 5.1, printed page 82.

Seven additional records were added to the structured source-backed index:

| Alarm | Manual description | Scope of manual guidance |
|---|---|---|
| F07860 | External fault 1 | Identify and remove the external cause; do not bypass the input. |
| F07900 | Motor blocked | Verify free rotation and review the documented torque-limit values. |
| F07901 | Motor overspeed | Review the documented speed-controller precontrol direction with authorized engineering. |
| F07902 | Motor stalled | Check motor data/identification, documented current-limit parameters and possible cable disconnection. |
| F08501 | Setpoint timeout | Check PROFINET, controller RUN state and documented monitoring time if repeated. |
| F08502 | Sign-of-life monitoring time expired | Check the PROFINET connection. |
| F08526 | No cyclic connection | Check cyclic operation, station name and station IP settings. |

These are manual-claim-reviewed, not field-verified. The model, frame size, firmware and machine integration must match. Parameter changes require authorized engineering review; do not suppress faults or bypass safety/network monitoring.

### siemens-s7-1200-ob80-time-error

- **Manufacturer / family:** Siemens — SIMATIC S7-1200
- **Scope:** S7-1200 CPU system diagnostics; OB80/time-error event handling; exact CPU and firmware revision must be checked
- **Event:** OB80 / time error event
- **Meaning (EN):** The manual describes time-error conditions including exceeding the configured maximum scan-cycle time, an interrupt OB being requested before the previous interrupt finishes, and event-queue overflow.
- **المعنى (AR):** يصف الدليل حالات الخطأ الزمني، ومنها تجاوز زمن المسح الأقصى المضبوط، وطلب كتلة مقاطعة قبل انتهاء السابقة، وامتلاء طابور الأحداث.
- **Sens (FR):** Le manuel décrit les erreurs temporelles : dépassement du temps de cycle maximal configuré, nouvelle demande d’OB d’interruption avant la fin de la précédente, ou débordement de file d’événements.
- **Source:** SIMATIC S7-1200 Programmable controller — System Manual, V4.6; document A5E02486680; section “Time error interrupt events; monitoring and configuring the cycle time”; printed page 90.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/download/109772940/s71200_system_manual_en-US_en-US.pdf
- **Evidence summary:** The official Siemens system manual lists the time-error conditions on printed page 90; the summary paraphrases those listed conditions.
- **Safe checks:** Record CPU order number, firmware, diagnostic buffer entry, cycle-time configuration and exact event text. Review program execution time, interrupt OB overlap and event bursts. Do not increase cycle-time limits or disable diagnostics without validating timing and process safety.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Confirm CPU type, firmware, cycle configuration and current manual revision.

### siemens-s7-1200-fs-031e-readback-failure

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal module SM 1226 F-DQ
- **Scope:** SM 1226 F-DQ 4 x 24 V DC and SM 1226 F-DQ 2 x Relay as described in the cited manual
- **Event ID:** 0x031E
- **Meaning (EN):** The manual describes a read-back failure when expected terminal voltage is not reached on the 24 V DC module, or when relay state differs from the commanded state on the relay module. It lists a too-short configured read-back time or a failed output switch/relay among possible causes.
- **المعنى (AR):** يصف الدليل فشل القراءة الراجعة عندما لا يتحقق جهد الطرف المتوقع في وحدة 24V DC، أو عندما تختلف حالة المرحل عن الحالة المطلوبة في وحدة المرحلات. ومن الأسباب المذكورة قصر زمن القراءة الراجعة المضبوط أو تعطل مفتاح الخرج/المرحل.
- **Sens (FR):** Le manuel décrit un échec de lecture de retour si la tension attendue n’est pas atteinte sur le module 24 V CC ou si l’état du relais diffère de la commande. Les causes indiquées incluent un temps de lecture trop court ou une sortie/un relais défectueux.
- **Source:** S7-1200 Functional Safety Manual, Equipment Manual V4.6, 11/2022; A5E03470344-AC; “Fail-safe signal module diagnostics → Fault diagnostics”; printed page 125.
- **Official manual:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Evidence summary:** The official Siemens safety manual lists event ID 0x031E, the affected module variants, descriptions and possible causes on printed page 125.
- **Safe checks:** Preserve the complete diagnostic entry, module and channel identifiers, commanded output state and measured terminal state. Under approved isolation, qualified personnel should inspect wiring, load supply and channel diagnostics. Never bypass the safety channel or extend monitoring time merely to suppress the event.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Applies only to the listed SM 1226 F-DQ variants and cited manual edition.

### siemens-s7-1200-fs-0320-output-overload

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal module SM 1226 F-DQ
- **Scope:** SM 1226 F-DQ 4 x 24 V DC output module as described in the cited manual
- **Event ID:** 0x0320
- **Meaning (EN):** The manual defines event 0x0320 as an overload condition at the output driver that causes the channel to be passivated.
- **المعنى (AR):** يعرّف الدليل الحدث 0x0320 بأنه حالة حمل زائد في مشغل الخرج تؤدي إلى عزل القناة آمنًا (passivation).
- **Sens (FR):** Le manuel définit l’événement 0x0320 comme une surcharge du pilote de sortie entraînant la passivation du canal.
- **Source:** S7-1200 Functional Safety Manual, Equipment Manual V4.6, 11/2022; A5E03470344-AC; “Fail-safe signal module diagnostics → Fault diagnostics”; printed page 125.
- **Official manual:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Evidence summary:** The official Siemens safety manual lists event ID 0x0320 as output-driver overload and describes channel passivation on printed page 125.
- **Safe checks:** Record module/channel, full diagnostic text and output load. After isolation, qualified personnel should inspect wiring and load for a short, excessive current or unsuitable load. Do not force the output on or defeat passivation.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Specific to the module and manual edition cited; confirm installed hardware and safety configuration.

### gsk-218m-alarm-0000-parameter-power-cycle

- **Manufacturer / family:** GSK CNC — GSK218M CNC System
- **Scope:** GSK218M only; do not generalize to other GSK controller families
- **Alarm code:** 0000
- **Meaning (EN):** The GSK218M alarm list labels code 0000 as power not turned off after parameter input; the controller indicates that the parameter change has not been followed by the required power-off/restart step.
- **المعنى (AR):** تسمّي قائمة إنذارات GSK218M الرمز 0000 بأنه عدم فصل الطاقة بعد إدخال المعلمات؛ ويشير ذلك إلى أن تغيير المعلمة لم يتبعه إجراء إيقاف الطاقة المطلوب.
- **Sens (FR):** La liste d’alarmes GSK218M associe le code 0000 à l’absence de mise hors tension après saisie d’un paramètre; le changement n’a pas été suivi de l’étape d’arrêt requise.
- **Source:** GSK218M CNC System Programming and Operation Manual; “Alarm interface → alarm number and meaning list”; printed page 207.
- **Official manual:** https://gskcnc.com/Support/218M01.pdf
- **Safe checks:** Record the alarm and recent parameter change. Follow the machine builder’s approved shutdown/restart procedure; do not cycle power while axes or process are in an unsafe state.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.

### gsk-218m-alarm-0001-file-open-fail

- **Manufacturer / family:** GSK CNC — GSK218M CNC System
- **Scope:** GSK218M only; do not generalize to other GSK controller families
- **Alarm code:** 0001
- **Meaning (EN):** The GSK218M alarm list labels code 0001 as file open fail. The message identifies a file-opening operation that did not complete; the specific file and operation context must be captured before intervention.
- **المعنى (AR):** تسمّي قائمة إنذارات GSK218M الرمز 0001 بأنه فشل فتح الملف. يشير الإنذار إلى تعذر إكمال عملية فتح ملف؛ ويجب تسجيل اسم الملف وسياق العملية قبل التدخل.
- **Sens (FR):** La liste d’alarmes GSK218M associe le code 0001 à un échec d’ouverture de fichier. Il faut relever le fichier concerné et le contexte avant intervention.
- **Source:** GSK218M CNC System Programming and Operation Manual; “Alarm interface → alarm number and meaning list”; printed page 207.
- **Official manual:** https://gskcnc.com/Support/218M01.pdf
- **Safe checks:** Record the exact file name and operation; preserve program/data before changing or reloading files. Do not delete or overwrite machine data without a verified backup.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.

### gsk-218m-alarm-0002-data-input-overflow

- **Manufacturer / family:** GSK CNC — GSK218M CNC System
- **Scope:** GSK218M only; do not generalize to other GSK controller families
- **Alarm code:** 0002
- **Meaning (EN):** The GSK218M alarm list labels code 0002 as data input overflow. The entered value or data payload exceeds the input capacity or accepted range for the active operation; the affected field and entry context must be verified.
- **المعنى (AR):** تسمّي قائمة إنذارات GSK218M الرمز 0002 بأنه تجاوز سعة إدخال البيانات. يجب التحقق من الحقل المدخل وسياق العملية لأن القيمة أو البيانات قد تتجاوز السعة أو النطاق المقبول.
- **Sens (FR):** La liste d’alarmes GSK218M associe le code 0002 à un dépassement de capacité des données saisies. Vérifier le champ et le contexte, car la valeur peut dépasser la capacité ou la plage acceptée.
- **Source:** GSK218M CNC System Programming and Operation Manual; “Alarm interface → alarm number and meaning list”; printed page 207.
- **Official manual:** https://gskcnc.com/Support/218M01.pdf
- **Safe checks:** Record the field/value and active operation. Verify format and allowed range from the GSK218M manual before editing; preserve original program and parameters.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.

### sinamics-g120c-f07860
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F07860
- **Meaning (EN):** The drive reports an external fault input.
- **المعنى (AR):** يشير محرك القيادة إلى تفعيل إشارة عطل خارجي.
- **Sens (FR):** Le variateur signale une entrée de défaut externe.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F07860 as “External fault 1” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Record the full code and the machine/controller state that preceded it.
- Use the machine-builder electrical drawings and PLC diagnostics to identify which external signal asserted the fault.
- Remove the external cause only after it is identified; do not bridge or force the fault input.
- **الفحوصات الآمنة (AR):**
- سجّل الرمز الكامل وحالة الماكينة ووحدة التحكم قبل ظهور العطل.
- استخدم المخططات الكهربائية وتشخيص PLC لتحديد الإشارة الخارجية التي فعّلت العطل.
- عالج السبب بعد تحديده؛ لا تجسر إشارة العطل ولا تفرضها برمجيًا.
- **Vérifications sûres (FR):**
- Relever le code complet et l’état machine/automate avant le défaut.
- Utiliser les schémas électriques et le diagnostic API pour identifier le signal externe activé.
- Supprimer la cause uniquement après identification; ne pas ponter ni forcer l’entrée de défaut.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.
### sinamics-g120c-f07900
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F07900
- **Meaning (EN):** The manual identifies this fault as motor blocked and directs the reader to verify free rotation and the documented positive/negative torque limits.
- **المعنى (AR):** يعرّف الدليل الحالة بأنها حجب المحرك ويوجه إلى التحقق من حرية الدوران وحدود العزم الموجبة والسالبة المحددة.
- **Sens (FR):** Le manuel identifie un moteur bloqué et demande de vérifier la liberté de rotation ainsi que les limites de couple positives et négatives documentées.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F07900 as “Motor blocked” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Under lockout and the machine's approved procedure, verify whether the load or mechanism is mechanically obstructed.
- Review the exact drive's r1538/r1539 torque-limit values against the approved commissioning record; do not change them just to clear the fault.
- Record motor, load, drive model, firmware and fault history before resetting.
- **الفحوصات الآمنة (AR):**
- بعد عزل الطاقة ووفق إجراء الماكينة، تحقق مما إذا كان الحمل أو الآلية محجوبًا ميكانيكيًا.
- قارن قيم حدود العزم r1538 وr1539 بسجل التشغيل المعتمد؛ لا تغيّرها لمجرد مسح العطل.
- سجّل بيانات المحرك والحمل وطراز القيادة وإصدار البرنامج وسجل العطل قبل إعادة الضبط.
- **Vérifications sûres (FR):**
- Après consignation et selon la procédure machine, vérifier si la charge ou le mécanisme est bloqué mécaniquement.
- Comparer r1538/r1539 aux valeurs de mise en service approuvées; ne pas les modifier uniquement pour effacer le défaut.
- Consigner moteur, charge, modèle de variateur, firmware et historique avant réarmement.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.
### sinamics-g120c-f07901
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F07901
- **Meaning (EN):** The manual lists motor overspeed and identifies speed-controller precontrol as a documented remedy direction.
- **المعنى (AR):** يسرد الدليل زيادة سرعة المحرك ويشير إلى الاستباق في منظم السرعة كاتجاه معالجة موثق.
- **Sens (FR):** Le manuel répertorie une survitesse moteur et mentionne l’anticipation du régulateur de vitesse comme piste documentée.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F07901 as “Motor overspeed” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Record actual speed, commanded speed, machine state and the full fault history from safe diagnostics.
- Have an authorized drive engineer check the application and documented precontrol setting p1401 bit 7; do not change it without validation.
- Inspect the load and feedback system only under the approved isolation procedure.
- **الفحوصات الآمنة (AR):**
- سجّل السرعة الفعلية والمرجعية وحالة الماكينة وسجل العطل من التشخيص الآمن.
- اطلب من مهندس قيادة مخوّل مراجعة التطبيق وإعداد الاستباق p1401 bit 7؛ لا تغيّره دون تحقق هندسي.
- افحص الحمل ونظام التغذية الراجعة وفق إجراء العزل المعتمد فقط.
- **Vérifications sûres (FR):**
- Relever la vitesse réelle, la consigne, l’état machine et l’historique depuis le diagnostic sécurisé.
- Faire vérifier l’application et p1401 bit 7 par un ingénieur habilité; ne pas modifier sans validation.
- Examiner charge et retour de mesure uniquement selon la procédure de consignation.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.
### sinamics-g120c-f07902
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F07902
- **Meaning (EN):** The manual directs checks of motor-data parameterization/identification, current-limit values and possible motor-cable disconnection during operation.
- **المعنى (AR):** يوجه الدليل إلى فحص إعداد/تحديد بيانات المحرك وحدود التيار واحتمال انفصال كابلات المحرك أثناء التشغيل.
- **Sens (FR):** Le manuel demande de contrôler le paramétrage/identification moteur, les limites de courant et une éventuelle déconnexion des câbles en fonctionnement.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F07902 as “Motor stalled” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Compare motor nameplate data with the approved drive configuration and identification record.
- Review p0640, r0067 and r0289 against the exact application and manual; do not raise current limits as a blind fix.
- Inspect motor-cable integrity only after isolation and prove-dead steps.
- **الفحوصات الآمنة (AR):**
- قارن بيانات لوحة المحرك بإعداد القيادة المعتمد وسجل تحديد بيانات المحرك.
- راجع p0640 وr0067 وr0289 وفق التطبيق والدليل؛ لا ترفع حدود التيار عشوائيًا.
- افحص كابلات المحرك بعد العزل والتحقق من انعدام الجهد فقط.
- **Vérifications sûres (FR):**
- Comparer la plaque moteur à la configuration approuvée et au relevé d’identification.
- Examiner p0640, r0067 et r0289 selon l’application et le manuel; ne pas augmenter les limites à l’aveugle.
- Inspecter les câbles moteur après consignation et vérification d’absence de tension.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.
### sinamics-g120c-f08501
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F08501
- **Meaning (EN):** The manual directs the user to check PROFINET connectivity and controller RUN state; repeated faults warrant review of monitoring time p2044.
- **المعنى (AR):** يوجه الدليل إلى فحص اتصال PROFINET وحالة RUN لوحدة التحكم؛ وعند التكرار تُراجع مهلة المراقبة p2044.
- **Sens (FR):** Le manuel demande de vérifier PROFINET et l’état RUN du contrôleur; en cas de répétition, examiner le temps de surveillance p2044.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F08501 as “Setpoint timeout” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Record controller RUN/STOP state, network diagnostics and the time of the fault.
- Check PROFINET link and the approved PLC/drive configuration before changing any timing parameter.
- Any p2044 change requires application review and authorized approval; do not use it to mask intermittent communication.
- **الفحوصات الآمنة (AR):**
- سجّل حالة RUN/STOP لوحدة التحكم وتشخيص الشبكة ووقت العطل.
- افحص وصلة PROFINET وإعداد PLC/القيادة المعتمد قبل تعديل أي مهلة.
- أي تعديل لـ p2044 يتطلب مراجعة التطبيق وموافقة مخوّلة؛ لا تستخدمه لإخفاء الاتصال المتقطع.
- **Vérifications sûres (FR):**
- Consigner RUN/STOP, les diagnostics réseau et l’heure du défaut.
- Vérifier la liaison PROFINET et la configuration approuvée API/variateur avant toute modification de temporisation.
- Toute modification de p2044 exige une validation autorisée; ne pas masquer une communication intermittente.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.
### sinamics-g120c-f08502
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F08502
- **Meaning (EN):** The manual identifies expiration of the sign-of-life monitoring time and directs the user to check the PROFINET connection.
- **المعنى (AR):** يحدد الدليل انتهاء زمن مراقبة إشارة الحيوية ويوجه إلى فحص اتصال PROFINET.
- **Sens (FR):** Le manuel indique l’expiration du temps de surveillance du signal de vie et demande de vérifier PROFINET.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F08502 as “Monitoring time, sign-of-life expired” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Capture the full fault text, timestamp and controller/drive communication diagnostics.
- Inspect the PROFINET connection and approved network configuration; compare with known-good configuration records.
- Escalate repeated events to controls/network engineering; do not bypass watchdog monitoring.
- **الفحوصات الآمنة (AR):**
- احفظ نص العطل الكامل ووقته وتشخيص الاتصال بين وحدة التحكم والقيادة.
- افحص اتصال PROFINET وإعداد الشبكة المعتمد وقارنه بسجل إعداد صحيح معروف.
- صعّد الأحداث المتكررة إلى مهندس التحكم/الشبكات؛ لا تتجاوز مراقبة الاتصال.
- **Vérifications sûres (FR):**
- Enregistrer le texte complet, l’heure et les diagnostics de communication automate/variateur.
- Vérifier PROFINET et la configuration réseau approuvée en la comparant aux dossiers de référence.
- Escalader les récidives; ne pas contourner la surveillance de communication.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.
### sinamics-g120c-f08526
- **Manufacturer / family:** Siemens — SINAMICS G120C FSD–FSF
- **Scope:** SINAMICS G120C frame sizes FSD through FSF only; confirm installed model and machine integration
- **Firmware/software scope:** Compact Operating Instructions, firmware V4.7 SP6; A5E39339884B AA, 11/2016
- **Alarm code:** F08526
- **Meaning (EN):** The manual directs the user to enable cyclic operation and check the station name and station IP parameters r61000/r61001.
- **المعنى (AR):** يوجه الدليل إلى تفعيل التشغيل الدوري وفحص معلمتي اسم المحطة وعنوان IP ‏r61000/r61001.
- **Sens (FR):** Le manuel demande d’activer le fonctionnement cyclique et de vérifier le nom et l’adresse IP de station r61000/r61001.
- **Source:** SINAMICS G120C FSD … FSF Compact Operating Instructions; revision FW V4.7 SP6; A5E39339884B AA; 11/2016; section 5.1 List of alarms and faults; printed page 82.
- **Official manual:** https://support.industry.siemens.com/cs/attachments/109744756/G120C_FSD_F_cmpct_op_instr_1116_en-US.pdf
- **Evidence summary:** Official manual table 5.1 explicitly lists F08526 as “No cyclic connection” and provides the summarized corrective direction. The summary is paraphrased and limited to this model/frame/firmware context.
- **Safe checks (EN):**
- Record PLC/drive device names, IP addresses and the configured cyclic data exchange before edits.
- Verify cyclic operation is configured and compare station name/IP with the approved PROFINET project.
- Coordinate network identity changes with the controls engineer; avoid duplicate IP/name assignments.
- **الفحوصات الآمنة (AR):**
- سجّل أسماء أجهزة PLC والقيادة وعناوين IP وإعداد تبادل البيانات الدوري قبل التعديل.
- تحقق من تهيئة التشغيل الدوري وقارن اسم المحطة وعنوان IP بمشروع PROFINET المعتمد.
- نسّق أي تغيير لهوية الشبكة مع مهندس التحكم وتجنب تكرار عنوان IP أو اسم المحطة.
- **Vérifications sûres (FR):**
- Consigner les noms d’appareils, adresses IP et l’échange cyclique configuré avant modification.
- Vérifier le fonctionnement cyclique et comparer nom/IP au projet PROFINET approuvé.
- Coordonner tout changement d’identité réseau avec l’ingénieur; éviter les doublons IP/noms.
- **Escalation (EN):** Escalate recurring faults or any case requiring drive-parameter, safety, or network changes to authorized controls/drive engineering. Never bypass safety or communication monitoring.
- **التصعيد (AR):** صعّد الأعطال المتكررة أو الحالات التي تتطلب تعديل معلمات القيادة أو السلامة أو الشبكة إلى مهندس مخوّل. لا تتجاوز مراقبة السلامة أو الاتصال.
- **Escalade (FR):** Escalader les défauts récurrents et toute modification de paramètres variateur, sécurité ou réseau vers un ingénieur habilité. Ne jamais contourner les surveillances de sécurité/communication.
- **Review date:** 2026-10-24. **Evidence status:** manual-claim-reviewed, not field-verified.
- **Limits:** Manual-claim reviewed, not field-verified. Applies only to the stated SINAMICS G120C frame range and cited manual revision. Verify the exact installed drive, firmware, PLC project and machine-builder instructions before action.

## Delta Electronics — ASDA-B2-F series servo drive

- **Official manual:** Delta Economic AC Servo Drive with DMCNET Communication ASDA-B2-F Series User Manual, Version 1.0, September 2015.
- **Manual URL:** https://filecenter.deltaww.com/Products/download/06/060201/Manual/DELTA_IA-ASD_ASDA-B2-F_UM_EN_20150925.pdf
- **Scope:** ASDA-B2-F only. Do not generalize to ASDA-B2, ASDA-A3, ASDA-B3 or other series without the matching manual.
- **Evidence status:** Manual-claim-reviewed, not field-verified. Code meanings below are concise paraphrases of the official alarm table; safe checks are advisory and do not replace machine-builder instructions.
- **Review date:** 2026-10-24

### delta-asda-b2-f-al001-overcurrent

- **Code:** AL001
- **Meaning (EN):** The ASDA-B2-F manual identifies AL001 as overcurrent in the servo drive main circuit.
- **المعنى (AR):** يصنّف دليل ASDA-B2-F الإنذار AL001 على أنه زيادة تيار في الدائرة الرئيسية للمحرك المؤازر.
- **Sens (FR):** Le manuel ASDA-B2-F identifie AL001 comme une surintensité dans le circuit principal du variateur servo.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The ASDA-B2-F manual identifies AL001 as overcurrent in the servo drive main circuit.

### delta-asda-b2-f-al002-overvoltage

- **Code:** AL002
- **Meaning (EN):** The manual identifies AL002 as main-circuit voltage above the specified standard voltage.
- **المعنى (AR):** يعرّف الدليل AL002 بأنه ارتفاع جهد الدائرة الرئيسية فوق الجهد القياسي المحدد.
- **Sens (FR):** Le manuel définit AL002 comme une tension du circuit principal supérieure à la tension standard spécifiée.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL002 as main-circuit voltage above the specified standard voltage.

### delta-asda-b2-f-al003-undervoltage

- **Code:** AL003
- **Meaning (EN):** The manual identifies AL003 as main-circuit voltage below the specified standard voltage.
- **المعنى (AR):** يعرّف الدليل AL003 بأنه انخفاض جهد الدائرة الرئيسية عن الجهد القياسي المحدد.
- **Sens (FR):** Le manuel définit AL003 comme une tension du circuit principal inférieure à la tension standard spécifiée.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL003 as main-circuit voltage below the specified standard voltage.

### delta-asda-b2-f-al006-overload

- **Code:** AL006
- **Meaning (EN):** The manual labels AL006 as overload of the motor and servo drive.
- **المعنى (AR):** يصنّف الدليل AL006 على أنه حمل زائد على المحرك والمغير المؤازر.
- **Sens (FR):** Le manuel classe AL006 comme une surcharge du moteur et du variateur servo.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual labels AL006 as overload of the motor and servo drive.

### delta-asda-b2-f-al007-overspeed

- **Code:** AL007
- **Meaning (EN):** The manual identifies AL007 when motor speed exceeds the normal speed range.
- **المعنى (AR):** يعرّف الدليل AL007 عند تجاوز سرعة المحرك نطاق السرعة الطبيعي.
- **Sens (FR):** Le manuel indique AL007 lorsque la vitesse du moteur dépasse la plage normale.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL007 when motor speed exceeds the normal speed range.

### delta-asda-b2-f-al009-position-deviation

- **Code:** AL009
- **Meaning (EN):** The manual identifies AL009 when position-command deviation exceeds the permitted setting.
- **المعنى (AR):** يعرّف الدليل AL009 عندما يتجاوز انحراف أمر الموضع القيمة المسموح بها في الإعداد.
- **Sens (FR):** Le manuel identifie AL009 lorsque l'écart de commande de position dépasse la valeur réglée autorisée.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL009 when position-command deviation exceeds the permitted setting.

### delta-asda-b2-f-al011-encoder-error

- **Code:** AL011
- **Meaning (EN):** The manual identifies AL011 as an encoder error in which the encoder generates an abnormal pulse.
- **المعنى (AR):** يعرّف الدليل AL011 بأنه خطأ في المشفّر ينتج فيه المشفّر نبضات غير طبيعية.
- **Sens (FR):** Le manuel identifie AL011 comme une erreur du codeur produisant des impulsions anormales.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL011 as an encoder error in which the encoder generates an abnormal pulse.

### delta-asda-b2-f-al016-igbt-overheat

- **Code:** AL016
- **Meaning (EN):** The manual identifies AL016 when the IGBT temperature is too high.
- **المعنى (AR):** يعرّف الدليل AL016 عندما تكون درجة حرارة IGBT مرتفعة جدًا.
- **Sens (FR):** Le manuel identifie AL016 lorsque la température de l’IGBT est trop élevée.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL016 when the IGBT temperature is too high.

### delta-asda-b2-f-al022-main-circuit-phase-loss

- **Code:** AL022
- **Meaning (EN):** The manual identifies AL022 as an abnormal main-circuit supply condition associated with missing phase power; the exact power wiring and drive rating must be matched to the manual.
- **المعنى (AR):** يعرّف الدليل AL022 بأنه حالة غير طبيعية في تغذية الدائرة الرئيسية مرتبطة بفقدان طور؛ يجب مطابقة توصيل التغذية وقدرة المغير مع الدليل.
- **Sens (FR):** Le manuel identifie AL022 comme une anomalie de l’alimentation principale liée à une phase manquante; le câblage et la puissance du variateur doivent correspondre au manuel.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2; corrective details 9-9
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL022 as an abnormal main-circuit supply condition associated with missing phase power; the exact power wiring and drive rating must be matched to the manual.

### delta-asda-b2-f-al024-encoder-magnetic-field

- **Code:** AL024
- **Meaning (EN):** The manual identifies AL024 as an error in the initial magnetic field of the encoder U/V/W signals.
- **المعنى (AR):** يعرّف الدليل AL024 بأنه خطأ في المجال المغناطيسي الابتدائي لإشارات U/V/W الخاصة بالمشفّر.
- **Sens (FR):** Le manuel identifie AL024 comme une erreur du champ magnétique initial des signaux U/V/W du codeur.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-2; corrective details 9-9
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL024 as an error in the initial magnetic field of the encoder U/V/W signals.

### delta-asda-b2-f-al031-motor-power-wiring

- **Code:** AL031
- **Meaning (EN):** The manual identifies AL031 as incorrect wiring of the motor power cable U, V, W or ground.
- **المعنى (AR):** يعرّف الدليل AL031 بأنه توصيل غير صحيح لكابل قدرة المحرك U/V/W أو التأريض.
- **Sens (FR):** Le manuel identifie AL031 comme un câblage incorrect du câble moteur U/V/W ou de terre.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL031; 9.4 Causes and Corrective Actions where noted; printed page 9-11
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL031 as incorrect wiring of the motor power cable U, V, W or ground.

### delta-asda-b2-f-al060-absolute-position-lost

- **Code:** AL060
- **Meaning (EN):** The manual identifies AL060 as loss of absolute position and discusses battery undervoltage, incomplete absolute-coordinate initialization, and battery-circuit connection issues in the troubleshooting section.
- **المعنى (AR):** يعرّف الدليل AL060 بأنه فقدان الموضع المطلق، ويناقش انخفاض جهد البطارية وعدم اكتمال تهيئة الإحداثيات المطلقة ومشكلات توصيل دائرة البطارية ضمن قسم استكشاف الأعطال.
- **Sens (FR):** Le manuel identifie AL060 comme une perte de position absolue et cite notamment une batterie sous-tension, une initialisation incomplète des coordonnées absolues et des problèmes de connexion du circuit de batterie.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL060; 9.4 Causes and Corrective Actions where noted; printed page 9-12
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code and check the manual's absolute-system section for the installed ASDA-B2-F revision. Do not replace/remove the backup battery or initialize absolute coordinates based on generic advice. Use the model-specific service procedure with qualified personnel; stop and escalate if that procedure is unavailable. Preserve machine position/reference information and verify the machine-builder's homing/recovery procedure before returning the axis to service.
- **فحوصات آمنة (AR):** سجّل الرمز بدقة وراجع قسم النظام المطلق في دليل ASDA-B2-F المطابق للإصدار المركب. لا تستبدل أو تنزع بطارية النسخ الاحتياطي ولا تهيّئ الإحداثيات المطلقة اعتمادًا على نصيحة عامة. يجب اتباع إجراء الخدمة الخاص بالطراز بواسطة شخص مؤهل؛ أوقف العمل وصعّد إذا لم يتوفر الإجراء. حافظ على معلومات الموضع والمرجعة، وتحقق من إجراء الإرجاع إلى المرجع لدى مصنع الماكينة قبل إعادة المحور إلى الخدمة.
- **Contrôles sûrs (FR):** Consignez le code exact et consultez la section système absolu de la révision ASDA-B2-F installée. Ne remplacez/retirez pas la batterie de sauvegarde et n'initialisez pas les coordonnées absolues sur la base de conseils génériques. Appliquez la procédure de service propre au modèle avec du personnel qualifié; arrêtez et escaladez si elle n'est pas disponible. Préservez les informations de position/référencement et vérifiez la procédure de reprise du constructeur avant de remettre l'axe en service.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL060 as loss of absolute position and discusses battery undervoltage, incomplete absolute-coordinate initialization, and battery-circuit connection issues in the troubleshooting section.

### delta-asda-b2-f-al185-dmcnet-bus-hardware

- **Code:** AL185
- **Meaning (EN):** The manual identifies AL185 as abnormal DMCNET bus hardware and directs attention to communication-cable condition and communication quality.
- **المعنى (AR):** يعرّف الدليل AL185 بأنه خلل عتادي في ناقل DMCNET، ويوجه إلى فحص حالة كابل الاتصال وجودة الاتصال.
- **Sens (FR):** Le manuel identifie AL185 comme une anomalie matérielle du bus DMCNET et recommande de vérifier le câble et la qualité de communication.
- **Manual locator:** 9.1 Alarm of Servo Drive; 9.4 Causes and Corrective Actions where noted; printed page 9-14
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the exact code, operating mode, load and time of occurrence; preserve the fault history before any reset. Use the machine's approved isolation procedure before inspecting wiring or connectors. Electrical measurements inside the drive are for qualified personnel only. Compare the observed condition with the ASDA-B2-F manual and machine-builder drawings; do not bypass protection or change limits to hide the alarm.
- **فحوصات آمنة (AR):** سجّل الرمز الدقيق ووضع التشغيل والحمل ووقت ظهور العطل، واحتفظ بسجل الأعطال قبل أي إعادة ضبط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك أو الموصلات. القياسات الكهربائية داخل المغير من اختصاص شخص مؤهل فقط. طابق الحالة مع دليل ASDA-B2-F ومخططات مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez le code exact, le mode de fonctionnement, la charge et l’heure d’apparition; conservez l’historique avant toute réinitialisation. Appliquez la procédure de consignation approuvée avant d’inspecter câbles ou connecteurs. Les mesures électriques à l’intérieur du variateur sont réservées au personnel qualifié. Comparez la situation au manuel ASDA-B2-F et aux schémas du constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to a qualified Delta servo-drive or machine-builder specialist if the alarm persists, recurs after approved checks, or suggests internal power-stage/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل في مغيرات Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو دلّ على احتمال تلف داخلي في مرحلة القدرة أو المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur de la machine si l’alarme persiste, réapparaît après les contrôles autorisés ou suggère un dommage interne de l’étage de puissance ou du codeur.
- **Evidence note:** The manual identifies AL185 as abnormal DMCNET bus hardware and directs attention to communication-cable condition and communication quality.

## Additional Delta ASDA-B2-F servo alarms — manual-reviewed 2026-10-24

- **Official manual:** [Delta ASDA-B2-F Series User Manual](https://filecenter.deltaww.com/Products/download/06/060201/Manual/DELTA_IA-ASD_ASDA-B2-F_UM_EN_20150925.pdf)
- **Scope:** ASDA-B2-F only; do not generalize these alarm meanings to other ASDA series.
- **Evidence status:** manual-claim-reviewed, not field-verified. Follow the exact machine-builder procedure and installed manual revision.

### delta-asda-b2-f-al004-motor-combination-error

- **Code:** AL004
- **Meaning (EN):** The manual identifies AL004 when the drive is paired with the wrong motor.
- **المعنى (AR):** يعرّف الدليل AL004 عند اقتران المغير بمحرك غير مناسب.
- **Sens (FR):** Le manuel identifie AL004 lorsque le variateur est associé au mauvais moteur.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL004; printed page 9-5; PDF page 206
- **Review date:** 2026-10-24
- **Safe checks (EN):** Confirm complete drive/motor model codes against the manual pairing table; inspect encoder connectors only after isolation. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** طابق رموز طراز المغير والمحرك مع جدول التوافق؛ افحص موصلات المشفّر بعد العزل فقط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Comparez les références variateur/moteur au tableau du manuel; inspectez les connecteurs codeur après consignation uniquement. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual identifies AL004 when the drive is paired with the wrong motor.

### delta-asda-b2-f-al005-regeneration-error

- **Code:** AL005
- **Meaning (EN):** The manual identifies AL005 as a regeneration error and directs checks to the regenerative-resistor circuit/configuration.
- **المعنى (AR):** يعرّف الدليل AL005 بأنه خطأ في استرجاع الطاقة ويوجه إلى فحص دائرة مقاومة الكبح وإعدادها.
- **Sens (FR):** Le manuel identifie AL005 comme un défaut de régénération et renvoie au circuit/configuration de la résistance.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL005; printed page 9-6; PDF page 207
- **Review date:** 2026-10-24
- **Safe checks (EN):** Under isolation and after cooling, check the model-specific regenerative-resistor wiring and connection; do not guess resistor values or change parameters without the sizing procedure. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** بعد العزل والتبريد، افحص توصيل مقاومة الكبح وفق الطراز؛ لا تخمّن قيمة المقاومة ولا تغيّر المعلمات دون إجراء تحديد القيمة. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Après consignation et refroidissement, vérifiez le câblage de la résistance selon le modèle; ne devinez pas sa valeur et ne modifiez pas les paramètres sans procédure. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual identifies AL005 as a regeneration error and directs checks to the regenerative-resistor circuit/configuration.

### delta-asda-b2-f-al012-adjustment-error

- **Code:** AL012
- **Meaning (EN):** The manual describes AL012 when electrical adjustment exceeds the allowable value; abnormal current adjustment is listed as a cause.
- **المعنى (AR):** يصف الدليل AL012 عند تجاوز قيمة الضبط الكهربائي الحد المسموح، ويذكر خلل ضبط التيار سببًا محتملًا.
- **Sens (FR):** Le manuel décrit AL012 lorsque le réglage électrique dépasse la valeur autorisée; un réglage anormal du courant est cité.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL012; printed page 9-7; PDF page 208
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the commissioning step and displayed diagnostics; do not repeat auto-adjustment blindly; escalate if the documented reset procedure does not clear the alarm. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** سجّل خطوة التشغيل الأولي والتشخيص المعروض؛ لا تكرر الضبط الآلي عشوائيًا، وصعّد إذا لم يزل الإنذار بعد الإجراء الموثق. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez l’étape de mise en service et les diagnostics; ne répétez pas l’auto-réglage à l’aveugle; escaladez si la procédure documentée échoue. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual describes AL012 when electrical adjustment exceeds the allowable value; abnormal current adjustment is listed as a cause.

### delta-asda-b2-f-al013-emergency-stop-active

- **Code:** AL013
- **Meaning (EN):** The manual identifies AL013 when DI.EMGS is active; it clears automatically after the input is OFF.
- **المعنى (AR):** يعرّف الدليل AL013 عند تفعيل DI.EMGS، ويذكر أن الإنذار يزول تلقائيًا بعد إيقاف الدخل.
- **Sens (FR):** Le manuel identifie AL013 lorsque DI.EMGS est actif; l’alarme disparaît lorsque l’entrée est désactivée.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL013; printed page 9-7; PDF page 208
- **Review date:** 2026-10-24
- **Safe checks (EN):** Treat as a safety state; identify why the emergency-stop circuit is active. Never bridge or defeat the circuit; restart only after the hazard is cleared and the approved procedure is followed. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** تعامل معها كحالة سلامة وحدد سبب تفعيل دائرة الطوارئ. لا تجسّر الدائرة؛ لا تستأنف التشغيل قبل إزالة الخطر واتباع الإجراء المعتمد. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Traitez-le comme un état de sécurité; recherchez la cause d’activation. Ne shuntez jamais le circuit; ne redémarrez qu’après élimination du danger. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual identifies AL013 when DI.EMGS is active; it clears automatically after the input is OFF.

### delta-asda-b2-f-al014-reverse-limit-active

- **Code:** AL014
- **Meaning (EN):** The manual identifies AL014 when the reverse-limit switch is activated.
- **المعنى (AR):** يعرّف الدليل AL014 عند تفعيل مفتاح حد الحركة العكسي.
- **Sens (FR):** Le manuel identifie AL014 lorsque le fin de course arrière est activé.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL014; printed page 9-7; PDF page 208
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record axis direction/position; verify limit-switch state against machine-builder limits after isolation; never force movement past the limit. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** سجّل اتجاه المحور وموضعه؛ تحقق من مفتاح الحد مقارنة بحدود المصنع بعد العزل؛ لا تفرض الحركة لتجاوز الحد. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez direction/position; vérifiez le fin de course par rapport aux limites constructeur après consignation; ne forcez pas le dépassement. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual identifies AL014 when the reverse-limit switch is activated.

### delta-asda-b2-f-al015-forward-limit-active

- **Code:** AL015
- **Meaning (EN):** The manual identifies AL015 when the forward-limit switch is activated.
- **المعنى (AR):** يعرّف الدليل AL015 عند تفعيل مفتاح حد الحركة الأمامي.
- **Sens (FR):** Le manuel identifie AL015 lorsque le fin de course avant est activé.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL015; printed page 9-7; PDF page 208
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record axis direction/position; verify limit-switch state against machine-builder limits after isolation; use only the approved recovery/jog procedure. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** سجّل اتجاه المحور وموضعه؛ تحقق من مفتاح الحد مقارنة بحدود المصنع بعد العزل؛ استخدم إجراء الاستعادة المعتمد فقط. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Consignez direction/position; vérifiez le fin de course par rapport aux limites constructeur après consignation; utilisez uniquement la procédure de récupération autorisée. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual identifies AL015 when the forward-limit switch is activated.

### delta-asda-b2-f-al017-eeprom-access-error

- **Code:** AL017
- **Meaning (EN):** The manual identifies AL017 as an error when the drive DSP accesses EEPROM and discusses parameter-write/ROM issues.
- **المعنى (AR):** يعرّف الدليل AL017 بأنه خطأ عند وصول DSP إلى EEPROM ويناقش مشكلات كتابة المعلمات وROM.
- **Sens (FR):** Le manuel identifie AL017 comme une erreur d’accès EEPROM par le DSP et décrit des problèmes d’écriture/ROM.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL017; printed page 9-8; PDF page 209
- **Review date:** 2026-10-24
- **Safe checks (EN):** Capture when the alarm occurs and any EXGAB/E100X/E0001 display; do not reset all parameters without approved backup/recovery; refer persistent ROM faults to Delta. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** سجّل توقيت الإنذار وأي رمز EXGAB/E100X/E0001؛ لا تصفّر جميع المعلمات دون نسخة احتياطية وإجراء استعادة معتمد؛ صعّد أعطال ROM المستمرة إلى Delta. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Notez le moment d’apparition et tout code EXGAB/E100X/E0001; ne réinitialisez pas tous les paramètres sans sauvegarde/procédure approuvée; escaladez les défauts ROM persistants. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual identifies AL017 as an error when the drive DSP accesses EEPROM and discusses parameter-write/ROM issues.

### delta-asda-b2-f-al018-abnormal-encoder-output

- **Code:** AL018
- **Meaning (EN):** The manual links AL018 to encoder faults or output pulses exceeding the hardware range, and points to related encoder alarms and P1-76/P1-46.
- **المعنى (AR):** يربط الدليل AL018 بأعطال المشفّر أو تجاوز نبضات الخرج النطاق العتادي، ويوجه إلى إنذارات المشفّر والمعلمتين P1-76/P1-46.
- **Sens (FR):** Le manuel relie AL018 aux défauts codeur ou au dépassement de la plage matérielle des impulsions et renvoie aux alarmes associées et à P1-76/P1-46.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL018; printed page 9-8; PDF page 209
- **Review date:** 2026-10-24
- **Safe checks (EN):** Preserve P4-00 to P4-05 fault history; check for AL011/AL024/AL025/AL026; verify encoder rating and parameter definitions before changing P1-76/P1-46. Use the approved isolation procedure before inspecting wiring/connectors; electrical work inside the drive is for qualified personnel. Confirm the installed drive/motor and machine-builder configuration; do not bypass protection or change limits to suppress an alarm.
- **فحوصات آمنة (AR):** احتفظ بسجل P4-00 إلى P4-05؛ تحقق من AL011/AL024/AL025/AL026؛ راجع مواصفات المشفّر وتعريف المعلمات قبل تغيير P1-76/P1-46. طبّق إجراء العزل المعتمد قبل فحص الأسلاك والموصلات؛ الأعمال الكهربائية داخل المغير من اختصاص شخص مؤهل. تحقق من طراز المغير/المحرك وإعداد مصنع الماكينة؛ لا تتجاوز الحماية ولا تغيّر الحدود لإخفاء الإنذار.
- **Contrôles sûrs (FR):** Conservez l’historique P4-00 à P4-05; vérifiez AL011/AL024/AL025/AL026; contrôlez les spécifications codeur et paramètres avant toute modification. Appliquez la consignation avant d’inspecter câbles/connecteurs; les interventions électriques internes sont réservées au personnel qualifié. Confirmez les modèles installés et l’intégration constructeur; ne contournez pas les protections et ne modifiez pas les limites pour masquer l’alarme.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists, recurs after approved checks, or suggests internal drive/encoder damage.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها أو أشار إلى تلف داخلي بالمغير/المشفّر.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste, revient après les contrôles autorisés ou indique un dommage interne du variateur/codeur.
- **Evidence note:** The manual links AL018 to encoder faults or output pulses exceeding the hardware range, and points to related encoder alarms and P1-76/P1-46.

### delta-asda-b2-f-al019-rs232-communication-error

- **Code:** AL019
- **Meaning (EN):** The manual identifies AL019 as an RS-232 communication error; it directs checks to communication parameters, address and accessed value.
- **المعنى (AR):** يعرّف الدليل AL019 بأنه خطأ اتصال RS-232 ويوجه إلى معلمات الاتصال والعنوان والقيمة المطلوبة.
- **Sens (FR):** Le manuel identifie AL019 comme une erreur RS-232 et renvoie aux paramètres, à l’adresse et à la valeur accédée.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL019; printed page 9-8; PDF page 209
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record host/controller, serial settings, address and failed transaction; compare with the exact drive and host manuals; inspect cable/connectors after isolation. Inspect wiring only under approved isolation; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** سجّل المتحكم وإعدادات الاتصال والعنوان والمعاملة الفاشلة؛ طابقها مع الدليلين وافحص الكابل بعد العزل. افحص الأسلاك بعد العزل المعتمد فقط؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Consignez contrôleur, paramètres série, adresse et transaction; comparez aux manuels exacts et inspectez le câble après consignation. Inspectez le câblage après consignation uniquement; les interventions internes sont réservées au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL019 as an RS-232 communication error; it directs checks to communication parameters, address and accessed value.

### delta-asda-b2-f-al020-rs232-communication-timeout

- **Code:** AL020
- **Meaning (EN):** The manual identifies AL020 as an RS-232 timeout and lists timeout settings, missing commands or cable faults as checks.
- **المعنى (AR):** يعرّف الدليل AL020 بأنه تجاوز مهلة RS-232 ويوجه إلى فحص إعداد المهلة وغياب الأمر أو خلل الكابل.
- **Sens (FR):** Le manuel identifie AL020 comme un dépassement de délai RS-232; vérifier le délai, la commande attendue et le câble.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL020; printed page 9-8–9-9; PDF page 209
- **Review date:** 2026-10-24
- **Safe checks (EN):** Verify whether the host sent the expected command and inspect the timeout setting; inspect cable damage only after isolation. Inspect wiring only under approved isolation; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** تحقق من إرسال الأمر المتوقع وراجع إعداد المهلة؛ افحص تلف الكابل بعد العزل فقط. افحص الأسلاك بعد العزل المعتمد فقط؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Vérifiez l’envoi de la commande attendue et le délai; inspectez le câble après consignation. Inspectez le câblage après consignation uniquement; les interventions internes sont réservées au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL020 as an RS-232 timeout and lists timeout settings, missing commands or cable faults as checks.

### delta-asda-b2-f-al023-overload-warning

- **Code:** AL023
- **Meaning (EN):** The manual identifies AL023 as an overload warning and directs checks to the overload condition and parameter P1-56.
- **المعنى (AR):** يعرّف الدليل AL023 بأنه تحذير حمل زائد ويوجه إلى حالة الحمل والمعلمة P1-56.
- **Sens (FR):** Le manuel identifie AL023 comme un avertissement de surcharge et renvoie à la charge et au paramètre P1-56.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL023; printed page 9-9; PDF page 210
- **Review date:** 2026-10-24
- **Safe checks (EN):** Compare load/duty with rated motor-drive capacity and review P1-56 against the exact manual; do not disable the warning merely to suppress it. Inspect wiring only under approved isolation; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** قارن الحمل بقدرة المحرك والمغير وراجع P1-56 في الدليل المطابق؛ لا تعطّل التحذير لمجرد إخفائه. افحص الأسلاك بعد العزل المعتمد فقط؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Comparez charge/cycle aux capacités nominales et vérifiez P1-56 dans le manuel exact; ne désactivez pas l’avertissement pour le masquer. Inspectez le câblage après consignation uniquement; les interventions internes sont réservées au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL023 as an overload warning and directs checks to the overload condition and parameter P1-56.

### delta-asda-b2-f-al025-encoder-internal-memory-counter-error

- **Code:** AL025
- **Meaning (EN):** The manual identifies AL025 as an encoder internal-memory/counter error and lists grounding, cable routing and shielding checks.
- **المعنى (AR):** يعرّف الدليل AL025 بأنه خطأ في الذاكرة أو العداد الداخلي للمشفّر، ويوجه إلى التأريض ومسار الكابل والتدريع.
- **Sens (FR):** Le manuel identifie AL025 comme une erreur de mémoire/compteur interne du codeur et recommande de vérifier terre, câble et blindage.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL025; printed page 9-9; PDF page 210
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record related encoder alarms; after isolation, verify grounding and shielded cable routing away from power cables; escalate recurring faults. Inspect wiring only under approved isolation; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** سجّل إنذارات المشفّر المصاحبة؛ بعد العزل تحقق من التأريض ومسار الكابل المدرع بعيدًا عن كابلات القدرة؛ صعّد عند التكرار. افحص الأسلاك بعد العزل المعتمد فقط؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Consignez les alarmes codeur associées; après consignation, vérifiez terre et câble blindé éloigné des câbles de puissance; escaladez si récurrent. Inspectez le câblage après consignation uniquement; les interventions internes sont réservées au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL025 as an encoder internal-memory/counter error and lists grounding, cable routing and shielding checks.

### delta-asda-b2-f-al026-encoder-internal-data-unreliable

- **Code:** AL026
- **Meaning (EN):** The manual identifies AL026 when encoder internal-data errors occur three times consecutively.
- **المعنى (AR):** يعرّف الدليل AL026 عند حدوث أخطاء البيانات الداخلية للمشفّر ثلاث مرات متتالية.
- **Sens (FR):** Le manuel identifie AL026 lorsque des erreurs de données internes du codeur surviennent trois fois consécutivement.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL026; printed page 9-10; PDF page 211
- **Review date:** 2026-10-24
- **Safe checks (EN):** Preserve recurrence history; after isolation, have qualified personnel verify grounding, shielding and cable routing; do not treat repeated resets as repair. Inspect wiring only under approved isolation; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** احتفظ بسجل التكرار؛ بعد العزل ليتحقق فني مؤهل من التأريض والتدريع ومسار الكابل؛ لا تعتبر إعادة الضبط المتكررة إصلاحًا. افحص الأسلاك بعد العزل المعتمد فقط؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Conservez l’historique; après consignation, faites vérifier terre, blindage et cheminement; des réinitialisations répétées ne constituent pas une réparation. Inspectez le câblage après consignation uniquement; les interventions internes sont réservées au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL026 when encoder internal-data errors occur three times consecutively.

### delta-asda-b2-f-al027-encoder-internal-reset-error

- **Code:** AL027
- **Meaning (EN):** The manual identifies AL027 as an internal encoder-reset error and directs checks to encoder communication, supply stability and operating temperature.
- **المعنى (AR):** يعرّف الدليل AL027 بأنه خطأ في إعادة الضبط الداخلية للمشفّر ويوجه إلى اتصال المشفّر واستقرار التغذية وحرارة التشغيل.
- **Sens (FR):** Le manuel identifie AL027 comme une erreur de réinitialisation interne et renvoie à la communication codeur, à l’alimentation et à la température.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL027; printed page 9-10; PDF page 211
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record recent thermal/supply events; after isolation inspect encoder connectors and cable; have qualified personnel verify supply and temperature against the manual. Use approved isolation before inspecting wiring; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** سجّل اضطرابات الحرارة أو التغذية؛ بعد العزل افحص موصلات وكابل المشفّر؛ ليتحقق فني مؤهل من التغذية والحرارة وفق الدليل. طبّق العزل المعتمد قبل فحص الأسلاك؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Consignez les incidents thermiques/alimentation; après consignation inspectez connecteurs et câble; faites vérifier alimentation/température selon le manuel. Appliquez la consignation avant d’inspecter le câblage; les travaux électriques internes sont réservés au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL027 as an internal encoder-reset error and directs checks to encoder communication, supply stability and operating temperature.

### delta-asda-b2-f-al028-encoder-voltage-or-internal-error

- **Code:** AL028
- **Meaning (EN):** The manual associates AL028 with encoder voltage/internal error and discusses battery voltage above specification or an encoder internal fault.
- **المعنى (AR):** يربط الدليل AL028 بخطأ جهد المشفّر أو خطأ داخلي ويناقش تجاوز جهد البطارية للمواصفة أو عطل المشفّر.
- **Sens (FR):** Le manuel associe AL028 à une erreur de tension/interne et évoque une tension de batterie hors spécification ou un défaut interne.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL028; printed page 9-10; PDF page 211
- **Review date:** 2026-10-24
- **Safe checks (EN):** Confirm encoder/battery configuration and compare with the exact manual; do not replace the battery or initialize absolute coordinates without the approved position-preservation/homing procedure. Use approved isolation before inspecting wiring; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** تحقق من إعداد المشفّر/البطارية وطابقه مع الدليل؛ لا تستبدل البطارية ولا تهيّئ الإحداثيات المطلقة دون إجراء معتمد لحفظ الموضع والمرجعة. طبّق العزل المعتمد قبل فحص الأسلاك؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Confirmez la configuration codeur/batterie et comparez au manuel exact; ne remplacez pas la batterie et n’initialisez pas les coordonnées sans procédure approuvée. Appliquez la consignation avant d’inspecter le câblage; les travaux électriques internes sont réservés au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual associates AL028 with encoder voltage/internal error and discusses battery voltage above specification or an encoder internal fault.

### delta-asda-b2-f-al029-absolute-position-gray-code-error

- **Code:** AL029
- **Meaning (EN):** The manual identifies AL029 as an absolute-position error and advises checking whether it recurs after a power cycle.
- **المعنى (AR):** يعرّف الدليل AL029 بأنه خطأ في الموضع المطلق ويوجه إلى التحقق من تكراره بعد دورة طاقة.
- **Sens (FR):** Le manuel identifie AL029 comme une erreur de position absolue et recommande de vérifier sa réapparition après un cycle d’alimentation.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL029; printed page 9-11; PDF page 212
- **Review date:** 2026-10-24
- **Safe checks (EN):** Preserve axis position and absolute-position status; use only the machine builder's approved restart/homing procedure; do not resume automatic motion until position validity is confirmed. Use approved isolation before inspecting wiring; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** احفظ موضع المحور وحالة الموضع المطلق؛ استخدم إجراء إعادة التشغيل والمرجعة المعتمد فقط؛ لا تستأنف الحركة الآلية قبل تأكيد صلاحية الموضع. طبّق العزل المعتمد قبل فحص الأسلاك؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Préservez la position de l’axe et l’état absolu; utilisez uniquement la procédure approuvée de redémarrage/référencement; ne reprenez pas le mouvement avant validation. Appliquez la consignation avant d’inspecter le câblage; les travaux électriques internes sont réservés au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL029 as an absolute-position error and advises checking whether it recurs after a power cycle.

### delta-asda-b2-f-al034-encoder-internal-communication-error

- **Code:** AL034
- **Meaning (EN):** The manual identifies AL034 as an internal communication error affecting an absolute encoder or another encoder type.
- **المعنى (AR):** يعرّف الدليل AL034 بأنه خطأ اتصال داخلي قد يؤثر في المشفّر المطلق أو أنواع أخرى.
- **Sens (FR):** Le manuel identifie AL034 comme une erreur de communication interne pouvant toucher un codeur absolu ou un autre type.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL034; printed page 9-11; PDF page 212
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record encoder type and related alarms; after isolation, have qualified personnel verify model-specific encoder/battery wiring; escalate if persistent. Use approved isolation before inspecting wiring; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** سجّل نوع المشفّر والإنذارات المصاحبة؛ بعد العزل ليتحقق فني مؤهل من توصيلات المشفّر/البطارية الخاصة بالطراز؛ صعّد إذا استمر العطل. طبّق العزل المعتمد قبل فحص الأسلاك؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Consignez le type de codeur et les alarmes associées; après consignation, faites vérifier le câblage codeur/batterie exact; escaladez si persistant. Appliquez la consignation avant d’inspecter le câblage; les travaux électriques internes sont réservés au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL034 as an internal communication error affecting an absolute encoder or another encoder type.

### delta-asda-b2-f-al035-encoder-overtemperature

- **Code:** AL035
- **Meaning (EN):** The manual identifies AL035 when encoder temperature exceeds 100°C and directs checks to the displayed temperature, heat dissipation and load.
- **المعنى (AR):** يعرّف الدليل AL035 عند تجاوز حرارة المشفّر 100°C ويوجه إلى فحص الحرارة المعروضة وتبديد الحرارة والحمل.
- **Sens (FR):** Le manuel identifie AL035 lorsque la température du codeur dépasse 100 °C et recommande de vérifier la température affichée, le refroidissement et la charge.
- **Manual locator:** 9.4 Causes and Corrective Actions → AL035; printed page 9-11–9-12; PDF page 212
- **Review date:** 2026-10-24
- **Safe checks (EN):** Treat 100°C as specific to this manual/model scope; record displayed temperature, review cooling/load per approved procedure, and escalate if the reading is inconsistent or alarm persists. Use approved isolation before inspecting wiring; internal electrical work is for qualified personnel.
- **فحوصات آمنة (AR):** اعتبر 100°C حدًا خاصًا بهذا الدليل والطراز؛ سجّل الحرارة المعروضة وراجع التبريد والحمل وفق الإجراء المعتمد، وصعّد إذا استمر الإنذار أو تناقضت القراءة. طبّق العزل المعتمد قبل فحص الأسلاك؛ الأعمال الكهربائية الداخلية من اختصاص شخص مؤهل.
- **Contrôles sûrs (FR):** Considérez 100 °C comme propre à ce manuel/modèle; consignez la température, vérifiez refroidissement/charge selon procédure et escaladez si l’alarme persiste. Appliquez la consignation avant d’inspecter le câblage; les travaux électriques internes sont réservés au personnel qualifié.
- **Escalation (EN):** Escalate to qualified Delta or machine-builder personnel if the alarm persists or recurs after approved checks.
- **التصعيد (AR):** صعّد إلى مختص مؤهل من Delta أو مصنع الماكينة إذا استمر الإنذار أو تكرر بعد الفحوصات المصرح بها.
- **Escalade (FR):** Faites intervenir un spécialiste Delta ou le constructeur si l’alarme persiste ou revient après les contrôles autorisés.
- **Evidence note:** The manual identifies AL035 when encoder temperature exceeds 100°C and directs checks to the displayed temperature, heat dissipation and load.


## Syntec CNC controller — communication alarms

- **Official manual:** [Syntec CNC Alarm Manual](https://www.syntecclub.com/cncrel/Manual/PDF/Syntec%20CNC%20Alarm%20Manual.pdf)
- **Version scope:** 10.118.86L, 10.120.16L, 10.120.24B, 10.120.27 and previous versions as listed by the manual; confirm the actual installed version and machine-builder integration.
- **Evidence status:** manual-claim-reviewed, not field-verified. The source's alarm IDs are used as section locators because a stable page number was not confirmed.

### syntec-mot-082-drive-response-packet-noise

- **Code:** MOT-082
- **Meaning (EN):** The Syntec alarm manual describes MOT-082 when a drive response packet is disturbed by noise for more than 10 ms. It lists poor communication-cable quality or noise interference as possible reasons.
- **المعنى (AR):** يصف دليل إنذارات Syntec الرمز MOT-082 عندما تتعرض حزمة استجابة المشغّل للتشويش لأكثر من 10 مللي ثانية. ويذكر رداءة كابل الاتصال أو التداخل كأسباب محتملة.
- **Sens (FR):** Le manuel d’alarmes Syntec décrit MOT-082 lorsque le bruit perturbe un paquet de réponse du variateur pendant plus de 10 ms. Une mauvaise qualité du câble ou des interférences sont citées comme causes possibles.
- **Manual locator:** CNC Alarm Manual → MOT-082 → Description / Possible Reason / Solution
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the complete alarm ID, controller software version, drive model, and event time before resetting. Have qualified personnel inspect communication-cable condition, connectors, shielding/grounding, and controller-to-drive configuration under the approved isolation procedure. Compare DIP-switch and communication parameters with the machine-builder's documentation; do not change timing or communication settings arbitrarily.
- **فحوصات آمنة (AR):** سجّل رمز الإنذار كاملًا وإصدار برنامج المتحكم وطراز المشغّل ووقت الحدث قبل إعادة الضبط. ليتحقق شخص مؤهل من كابل الاتصال والموصلات والتدريع/التأريض وإعداد الاتصال بين المتحكم والمشغّل وفق إجراء العزل المعتمد. طابق مفاتيح DIP ومعلمات الاتصال مع وثائق مصنع الماكينة؛ لا تغيّر إعدادات التوقيت أو الاتصال عشوائيًا.
- **Contrôles sûrs (FR):** Consignez le code complet, la version logicielle du contrôleur, le modèle du variateur et l'heure de l'événement avant toute réinitialisation. Faites vérifier par une personne qualifiée le câble de communication, les connecteurs, le blindage/la terre et la configuration contrôleur-variateur selon la procédure de consignation. Comparez les commutateurs DIP et les paramètres de communication aux documents du constructeur; ne modifiez pas arbitrairement les temporisations ou réglages.
- **Escalation (EN):** Escalate to Syntec or the machine builder if the alarm persists after approved cable/configuration checks, or if the installed version is outside the documented scope.
- **التصعيد (AR):** صعّد إلى Syntec أو مصنع الماكينة إذا استمر الإنذار بعد فحص الكابل والإعدادات المصرح به، أو كان إصدار البرنامج خارج النطاق الموثق.
- **Escalade (FR):** Escaladez vers Syntec ou le constructeur si l'alarme persiste après les contrôles autorisés du câble/de la configuration, ou si la version installée est hors du périmètre documenté.
- **Evidence note:** The official Syntec alarm manual describes MOT-082 as a drive-response packet disturbed by noise for more than 10 ms and lists cable quality/noise interference among possible reasons.

### syntec-mot-083-drive-response-packet-watchdog

- **Code:** MOT-083
- **Meaning (EN):** The Syntec alarm manual describes MOT-083 when the drive response-packet watchdog (M3) or EtherCAT working counter is incorrect for more than 10 ms.
- **المعنى (AR):** يصف دليل إنذارات Syntec الرمز MOT-083 عندما تكون مراقبة حزمة استجابة المشغّل (M3) أو عدّاد العمل في EtherCAT غير صحيحة لأكثر من 10 مللي ثانية.
- **Sens (FR):** Le manuel d’alarmes Syntec décrit MOT-083 lorsque le watchdog des paquets de réponse du variateur (M3) ou le compteur de travail EtherCAT est incorrect pendant plus de 10 ms.
- **Manual locator:** CNC Alarm Manual → MOT-083 → Description / Possible Reason / Solution
- **Review date:** 2026-10-24
- **Safe checks (EN):** Record the complete alarm ID, controller software version, drive model, and event time before resetting. Have qualified personnel inspect communication-cable condition, connectors, shielding/grounding, and controller-to-drive configuration under the approved isolation procedure. Compare DIP-switch and communication parameters with the machine-builder's documentation; do not change timing or communication settings arbitrarily.
- **فحوصات آمنة (AR):** سجّل رمز الإنذار كاملًا وإصدار برنامج المتحكم وطراز المشغّل ووقت الحدث قبل إعادة الضبط. ليتحقق شخص مؤهل من كابل الاتصال والموصلات والتدريع/التأريض وإعداد الاتصال بين المتحكم والمشغّل وفق إجراء العزل المعتمد. طابق مفاتيح DIP ومعلمات الاتصال مع وثائق مصنع الماكينة؛ لا تغيّر إعدادات التوقيت أو الاتصال عشوائيًا.
- **Contrôles sûrs (FR):** Consignez le code complet, la version logicielle du contrôleur, le modèle du variateur et l'heure de l'événement avant toute réinitialisation. Faites vérifier par une personne qualifiée le câble de communication, les connecteurs, le blindage/la terre et la configuration contrôleur-variateur selon la procédure de consignation. Comparez les commutateurs DIP et les paramètres de communication aux documents du constructeur; ne modifiez pas arbitrairement les temporisations ou réglages.
- **Escalation (EN):** Escalate to Syntec or the machine builder if the alarm persists after approved cable/configuration checks, or if the installed version is outside the documented scope.
- **التصعيد (AR):** صعّد إلى Syntec أو مصنع الماكينة إذا استمر الإنذار بعد فحص الكابل والإعدادات المصرح به، أو كان إصدار البرنامج خارج النطاق الموثق.
- **Escalade (FR):** Escaladez vers Syntec ou le constructeur si l'alarme persiste après les contrôles autorisés du câble/de la configuration, ou si la version installée est hors du périmètre documenté.
- **Evidence note:** The official Syntec alarm manual describes MOT-083 in terms of an incorrect drive response-packet watchdog (M3) or EtherCAT working counter lasting more than 10 ms.

