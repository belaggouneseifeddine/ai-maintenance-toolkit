# OEM-verified fault and diagnostic records (AR / FR / EN)

> Verified means the cited official source supports the specific statement below. It does not mean every installation using the same brand behaves identically. Match machine builder, controller/drive model, firmware and manual revision before applying a record.

- Review date: 2026-10-24
- Existing model-scoped records with official manual evidence: 20
- Additional model-specific manual-reviewed structured records: 15 (these are source-verified claims, not field-verified machine diagnoses)
- Families represented: Siemens SINUMERIK 840D sl/828D, SINAMICS G120D and G120P; Mitsubishi MELSEC iQ-F FX5 and one narrowly scoped MR-J4 encoder-compatibility case.
- Chinese OEMs are in the evidence acquisition queue until exact code/manual passages are reviewed; portal presence is not a verified fault record.
- Store concise original summaries and links, not copied manual chapters.

## Records

### sinumerik-25000

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring
- **Code:** 25000
- **Meaning (EN):** The active measuring system reported a hardware fault; the affected axis stops using the configured braking ramp and referencing/synchronization status is reset.
- **المعنى (AR):** يذكر الدليل أن نظام القياس الفعّال أبلغ عن عطل عتادي؛ يُوقف المحور بمنحدر الكبح المضبوط وتُصفّر حالة المرجعة/المزامنة.
- **Sens (FR):** Le manuel indique un défaut matériel du système de mesure actif; l’axe s’arrête selon la rampe configurée et l’état de référencement/synchronisation est réinitialisé.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter. Preserve diagnostic history before acknowledging or power-cycling. Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **Escalation:** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.

### sinumerik-25001

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring
- **Code:** 25001
- **Meaning (EN):** A hardware fault was detected in the passive measuring system; this function-manual section specifies no further alarm response.
- **المعنى (AR):** اكتُشف عطل عتادي في نظام القياس السلبي؛ لا يحدد هذا القسم استجابة إنذار إضافية.
- **Sens (FR):** Un défaut matériel est détecté sur le système de mesure passif; cette section ne précise pas d’autre réaction.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter. Preserve diagnostic history before acknowledging or power-cycling. Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **Escalation:** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.

### sinumerik-25020

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring
- **Code:** 25020
- **Meaning (EN):** Zero-mark monitoring was triggered on the active measuring system; the affected axis stops using the configured braking ramp.
- **المعنى (AR):** تم تفعيل مراقبة علامة الصفر في نظام القياس الفعّال؛ يُوقف المحور بمنحدر الكبح المضبوط.
- **Sens (FR):** La surveillance du repère zéro est déclenchée sur le système actif; l’axe s’arrête selon la rampe configurée.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter. Preserve diagnostic history before acknowledging or power-cycling. Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **Escalation:** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.

### sinumerik-25021

- **Manufacturer / family:** Siemens — SINUMERIK 840D sl / 828D
- **Scope:** SINUMERIK 840D sl and 828D; axis measuring-system monitoring
- **Code:** 25021
- **Meaning (EN):** Zero-mark monitoring was triggered on the passive measuring system; this section specifies no further alarm response.
- **المعنى (AR):** تم تفعيل مراقبة علامة الصفر في نظام القياس السلبي؛ لا يحدد هذا القسم استجابة إنذار إضافية.
- **Sens (FR):** La surveillance du repère zéro est déclenchée sur le système passif; cette section ne précise pas d’autre réaction.
- **Official evidence:** SINUMERIK 840D sl / 828D Basic Functions Function Manual; 08/2018; 6FC5397-0BP40-6BA2; A3 Axis monitoring functions → 3.5 Measuring system monitoring; MD36310 $MA_ENC_ZERO_MONITORING; printed page 105.
- **Source:** https://support.industry.siemens.com/cs/attachments/download/109760797/840Dsl_828D_basic_fct_man_0818_en-US.pdf
- **Evidence note:** The official manual explicitly lists these alarm numbers and active/passive encoder response.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Record full alarm text, axis name, active/passive measuring-system context, and encoder-monitoring parameter. Preserve diagnostic history before acknowledging or power-cycling. Have qualified CNC personnel verify encoder type, connections, and machine-builder wiring documentation under the site isolation procedure.
- **Escalation:** Escalate recurring alarms, loss of axis reference, or unverified encoder wiring; never bypass encoder monitoring.

### sinamics-g120d-f31100

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** F31100
- **Meaning (EN):** Measured zero-mark distance does not match the parameterized distance.
- **المعنى (AR):** Measured zero-mark distance does not match the parameterized distance.
- **Sens (FR):** Measured zero-mark distance does not match the parameterized distance.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Check encoder cable routing for EMC, connectors, encoder type, and configured zero-mark distance parameters. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120d-f31101

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** F31101
- **Meaning (EN):** The manual lists a zero-mark failure for the encoder system.
- **المعنى (AR):** The manual lists a zero-mark failure for the encoder system.
- **Sens (FR):** The manual lists a zero-mark failure for the encoder system.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Capture the fault value and encoder diagnostics; inspect cabling/connectors only under the approved isolation procedure; consult the full List Manual for the configured encoder. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120d-f31118

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** F31118
- **Meaning (EN):** For an HTL/TTL encoder, speed difference exceeded configured tolerance over several sampling cycles.
- **المعنى (AR):** For an HTL/TTL encoder, speed difference exceeded configured tolerance over several sampling cycles.
- **Sens (FR):** For an HTL/TTL encoder, speed difference exceeded configured tolerance over several sampling cycles.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Check encoder cable continuity and shield grounding; confirm encoder type and configured tolerance in the exact drive project. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120d-f32110

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** F32110
- **Meaning (EN):** Serial protocol transfer between encoder and inverter is faulty.
- **المعنى (AR):** Serial protocol transfer between encoder and inverter is faulty.
- **Sens (FR):** Serial protocol transfer between encoder and inverter is faulty.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Check encoder compatibility, cable/connectors, EMC routing and associated drive settings. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120d-f32111

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** F32111
- **Meaning (EN):** The manual groups this code with absolute-encoder internal error.
- **المعنى (AR):** The manual groups this code with absolute-encoder internal error.
- **Sens (FR):** The manual groups this code with absolute-encoder internal error.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120d-f32112

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** F32112
- **Meaning (EN):** The manual groups this code with absolute-encoder internal error.
- **المعنى (AR):** The manual groups this code with absolute-encoder internal error.
- **Sens (FR):** The manual groups this code with absolute-encoder internal error.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 88.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Record encoder model and fault value; verify encoder supply and follow the manufacturer procedure if internal failure is confirmed. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120d-a32442

- **Manufacturer / family:** Siemens — SINAMICS G120D
- **Scope:** SINAMICS G120D converter; do not generalize to other SINAMICS families
- **Code:** A32442
- **Meaning (EN):** Encoder battery voltage pre-alarm.
- **المعنى (AR):** Encoder battery voltage pre-alarm.
- **Sens (FR):** Encoder battery voltage pre-alarm.
- **Official evidence:** SINAMICS G120D Getting Started; 04/2018; firmware V4.7 SP10; 6.4 List of alarms and faults; printed page 89.
- **Source:** https://support.industry.siemens.com/cs/attachments/109757509/G120D_getting_started_0418_en-US.pdf
- **Evidence note:** The official manual section 6.4 lists the exact code and description; summaries are paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies to the cited G120D documentation and firmware context. Check the current List Manual for the installed version.
- **Safe checks:** Confirm exact encoder and specified battery type from its manual; arrange replacement using the specified part/procedure. Record full code, fault value, encoder/drive model and firmware before reset.
- **Escalation:** Escalate recurring encoder faults, unexplained motion, or any need for live electrical access.

### sinamics-g120p-f30001

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping
- **Code:** F30001
- **Meaning (EN):** The power unit detects overcurrent; listed causes include motor/cable short or ground fault, incorrect motor data/connection, supply issues, or a defective power unit.
- **المعنى (AR):** The power unit detects overcurrent; listed causes include motor/cable short or ground fault, incorrect motor data/connection, supply issues, or a defective power unit.
- **Sens (FR):** The power unit detects overcurrent; listed causes include motor/cable short or ground fault, incorrect motor data/connection, supply issues, or a defective power unit.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.
- **Safe checks:** Under qualified isolation, inspect motor/power cables, verify nameplate data and star/delta connection, and check supply phases; do not increase limits blindly. Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **Escalation:** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.

### sinamics-g120p-f30002

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping
- **Code:** F30002
- **Meaning (EN):** DC-link voltage overvoltage.
- **المعنى (AR):** DC-link voltage overvoltage.
- **Sens (FR):** DC-link voltage overvoltage.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.
- **Safe checks:** Review deceleration ramp, line voltage and line phases against the exact application and manual. Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **Escalation:** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.

### sinamics-g120p-f30003

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping
- **Code:** F30003
- **Meaning (EN):** DC-link voltage undervoltage.
- **المعنى (AR):** DC-link voltage undervoltage.
- **Sens (FR):** DC-link voltage undervoltage.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.
- **Safe checks:** Check supply voltage and line phases using an approved safe measurement procedure; capture event timing and load state. Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **Escalation:** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.

### sinamics-g120p-f30004

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping
- **Code:** F30004
- **Meaning (EN):** Inverter overtemperature.
- **المعنى (AR):** Inverter overtemperature.
- **Sens (FR):** Inverter overtemperature.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.
- **Safe checks:** Check fan operation, permitted ambient conditions and possible motor/load overload; inspect cooling passages after safe isolation. Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **Escalation:** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.

### sinamics-g120p-f30011

- **Manufacturer / family:** Siemens — SINAMICS G120P Cabinet Units
- **Scope:** SINAMICS G120P cabinet units only; not a universal SINAMICS code mapping
- **Code:** F30011
- **Meaning (EN):** Line phase failure.
- **المعنى (AR):** Line phase failure.
- **Sens (FR):** Line phase failure.
- **Official evidence:** SINAMICS G120P Cabinet Units Operating Instructions; 04/2016; A5E32923362A; 9.5 List of alarms and faults; printed page 473.
- **Source:** https://support.industry.siemens.com/cs/attachments/109739200/SINAMICS_G120P_Cabinet_en-US.pdf
- **Evidence note:** The official operating instructions list the exact fault code, cause and checks in section 9.5.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Applies only to SINAMICS G120P cabinet units and the cited 04/2016 manual.
- **Safe checks:** Check input fuses and feeder cables under approved electrical safety procedures; verify supply phases with suitable instruments and qualified personnel. Capture drive status, fault history, motor nameplate and unit order number before parameter changes.
- **Escalation:** Escalate suspected short/ground fault, damaged power module, repeated trip, or any measurement requiring energized access.

### melsec-fx5-module-diagnostics

- **Manufacturer / family:** Mitsubishi Electric — MELSEC iQ-F FX5S / FX5UJ / FX5U / FX5UC
- **Scope:** FX5S, FX5UJ, FX5U and FX5UC CPU/module diagnostics
- **Code:** Procedure/rule (no single alarm code)
- **Meaning (EN):** Module diagnostics shows the current error, details, cause and recommended action; it can identify incorrect parameter settings or program error location.
- **المعنى (AR):** يعرض تشخيص الوحدة العطل الحالي وتفاصيله وسببه والإجراء المقترح؛ وقد يحدد إعداد معلمة غير صحيح أو موضع خطأ في البرنامج.
- **Sens (FR):** Le diagnostic de module affiche l’erreur courante, ses détails, sa cause et l’action recommandée; il peut repérer un paramètre incorrect ou l’emplacement d’une erreur de programme.
- **Official evidence:** MELSEC iQ-F FX5S/FX5UJ/FX5U/FX5UC User’s Manual (Hardware); Official PDF reviewed 2026-10-24; 17.3 Troubleshooting Using the Engineering Tool → Module diagnostics / Event history; printed page 277.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/manual/plcf/sh082452eng/sh082452engm.pdf
- **Evidence note:** The official manual documents module diagnostics on printed page 277 and event history on page 278.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Read current error and details in the engineering tool; save event history before reset or power cycling. Back up PLC program, parameters and device memory before changes. Do not force outputs or edit a live program without site safety/change-control procedures.
- **Escalation:** Escalate persistent hardware errors, unexplained output states, safety circuit faults, or recurring errors.

### melsec-fx5-error-severity

- **Manufacturer / family:** Mitsubishi Electric — MELSEC iQ-F FX5S / FX5UJ / FX5U / FX5UC
- **Scope:** FX5S, FX5UJ, FX5U and FX5UC
- **Code:** Procedure/rule (no single alarm code)
- **Meaning (EN):** The hardware manual distinguishes major errors (stop; hardware issue), moderate errors (stop; possible program/parameter setting or temporary noise issue), and minor errors (execution continues).
- **المعنى (AR):** يميّز الدليل بين خطأ كبير يوقف التنفيذ ويرتبط بمشكلة عتادية، وخطأ متوسط يوقف التنفيذ وقد يرتبط بالبرنامج أو المعلمات أو التشويش المؤقت، وخطأ بسيط يستمر معه التنفيذ.
- **Sens (FR):** Le manuel distingue les erreurs majeures (arrêt, matériel), modérées (arrêt, programme/paramètres ou bruit temporaire) et mineures (l’exécution continue).
- **Official evidence:** MELSEC iQ-F FX5S/FX5UJ/FX5U/FX5UC User’s Manual (Hardware); Official PDF reviewed 2026-10-24; 17.4 Error Status and Operations on Occurrence of an Error; printed page 279.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/manual/plcf/sh082452eng/sh082452engm.pdf
- **Evidence note:** The error status table specifies stop/continue behavior and required action for major, moderate and minor errors.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Record exact error number and severity in the engineering tool. For stop errors, identify and correct the cause before recovery; clear only documented continuation errors. Preserve event history and backup before program/parameter edits.
- **Escalation:** Escalate hardware-related stop errors or faults affecting safety interlocks or machine outputs.

### melsec-fx5-preserve-error-history

- **Manufacturer / family:** Mitsubishi Electric — MELSEC iQ-F FX5S / FX5UJ / FX5U / FX5UC
- **Scope:** FX5 CPU, expansion, intelligent function modules and network-related event history
- **Code:** Procedure/rule (no single alarm code)
- **Meaning (EN):** Event history can include CPU, expansion, intelligent module and network errors; events recorded before power-off/reset help identify causes and can be exported as CSV.
- **المعنى (AR):** قد يشمل سجل الأحداث أخطاء CPU والوحدات التوسعية والذكية والشبكة؛ وتساعد الأحداث السابقة لفصل التغذية أو إعادة الضبط على تحديد السبب ويمكن تصديرها إلى CSV.
- **Sens (FR):** L’historique peut inclure les erreurs CPU, extensions, modules intelligents et réseau; les événements antérieurs à une coupure/réinitialisation aident au diagnostic et peuvent être exportés en CSV.
- **Official evidence:** MELSEC iQ-F FX5S/FX5UJ/FX5U/FX5UC User’s Manual (Hardware); Official PDF reviewed 2026-10-24; 17.3 Troubleshooting Using the Engineering Tool → Event history; printed page 278.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/manual/plcf/sh082452eng/sh082452engm.pdf
- **Evidence note:** The manual describes event-history scope and CSV export.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Apply only to the stated model/software scope. Confirm installed manual revision and exact alarm text before action.
- **Safe checks:** Export event history before acknowledging or clearing errors. Record timestamps, CPU/module model, firmware and machine state.
- **Escalation:** Escalate if history points to network/hardware faults or intermittent errors that cannot be safely reproduced.

### mitsubishi-mrj4-al16-al20-encoder-compatibility

- **Manufacturer / family:** Mitsubishi Electric — MELSERVO-J4 MR-J4-A
- **Scope:** Only the handbook’s stated transition case: HC-FS/HA-FS motors driven by MR-J4-A with MR-J2S-compatible encoder setting
- **Code:** Procedure/rule (no single alarm code)
- **Meaning (EN):** The transition handbook states that in the specified HC-FS/HA-FS motor and MR-J4-A setup, an incorrect PC22 encoder setting can cause AL.16 (encoder initial communication error 1) or AL.20 (encoder normal communication error 1).
- **المعنى (AR):** يذكر دليل الانتقال أن إعداد PC22 غير الصحيح في حالة محرك HC-FS/HA-FS مع MR-J4-A قد يؤدي إلى AL.16 (خطأ اتصال أولي للمشفّر) أو AL.20 (خطأ اتصال عادي للمشفّر).
- **Sens (FR):** Le guide de transition indique qu’un réglage PC22 incorrect, dans le cas moteur HC-FS/HA-FS avec MR-J4-A, peut provoquer AL.16 ou AL.20.
- **Official evidence:** Transition from MELSERVO-J2-Super/J2M Series to J4 Series Handbook; Official transition handbook reviewed 2026-10-24; Part 7 Common Reference Material → 4. HC-FS/HA-FS MOTOR DRIVE → 4.1 Parameter setting; printed page not stated.
- **Source:** https://dl.mitsubishielectric.com/dl/fa/document/catalog/servo/l03093/l03093e.pdf
- **Evidence note:** The source explicitly links PC22 encoder compatibility setting with AL.16/AL.20 in the stated migration scenario.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Limit:** Narrow compatibility note, not a universal diagnostic for AL.16 or AL.20.
- **Safe checks:** Confirm exact amplifier suffix, motor and encoder models, and that the machine matches the documented transition case. Compare PC22 against exact motor/encoder instructions; do not change parameters based on the alarm alone.
- **Escalation:** Escalate if installed components fall outside the documented case or the alarm persists after the approved setting is verified.

## Evidence acquisition queue — not verified fault records

| Manufacturer / family | Official entry point | Current status | Next evidence needed |
|---|---|---|---|
| HuazhongCNC HNC8 CNC / PLC / servo | https://en.huazhongcnc.com/download-center-of-huazhongcnc/ | Official manual index located; individual alarm entries not yet reviewed | Exact HNC8 controller version, alarm number/text, manual revision, section/page |
| INOVANCE MD-series drives / servo / PLC | https://www.inovance.com/global/support/download-documentation.html | Official document portal; no code marked verified from portal alone | Exact family manual and fault-table page |
| XINJE XD/XG PLC and DS5 servo | https://en.xinje.com/web/downloadCenter/index | Official document portal; no code marked verified from portal alone | Exact product model, manual revision and alarm-code table |
| GSK CNC | https://gskcnc.com/support.php | Support portal only | Controller series, software version and alarm-manual section/page |
| Delta ASDA servo / PLC | https://downloadcenter.delta-china.com.cn/en-US/DownloadCenter | Official download portal only | Exact ASDA generation and manual alarm table |
| Siemens SINUMERIK 828D diagnostics | https://support.industry.siemens.com/cs/attachments/109802874/828D_alarms_diagnostics_man_0721_en-US.pdf | Official diagnostics manual identified; code-level review pending for this edition | Exact alarm entry, page, software version and machine-builder context |

## Chinese OEM records: XINJE DS5K servo drive

The official DS5K series servo driver manual (Data No. SC5 03 20230427EN, revision 1.3.1) was reviewed. The following exact alarm entries are now represented with source pages. These apply only to the DS5K family; confirm the installed variant and manual revision.

### xinje-ds5k-e-010

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-010
- **Meaning (EN):** The manual links E-010 to an incorrect downloaded firmware version and recommends contacting the agent/manufacturer.
- **المعنى (AR):** يربط الدليل E-010 بإصدار برنامج ثابت تم تنزيله بصورة غير صحيحة، ويوصي بالتواصل مع الوكيل أو المصنع.
- **Sens (FR):** Le manuel relie E-010 à une version de firmware téléchargée incorrecte et recommande de contacter l’agent/le fabricant.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 173.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Record the drive model and installed firmware; do not flash an unverified file. Confirm compatibility with the exact drive/motor before updates.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-021

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-021
- **Meaning (EN):** The drive rejects a parameter value outside its allowed range; the manual says to check and correct the parameters.
- **المعنى (AR):** يرفض المغير قيمة المعلمة خارج المجال المسموح؛ ويوصي الدليل بمراجعة المعلمات وتصحيحها.
- **Sens (FR):** Le variateur rejette une valeur hors plage; le manuel demande de vérifier et corriger les paramètres.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 173.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Capture parameter number/value and source of write. Compare with the exact manual and commissioned settings; do not restore defaults without an approved backup.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-030

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-030
- **Meaning (EN):** The manual associates E-030 with bus voltage above threshold; listed causes include high supply voltage, high inertia/regeneration demand, braking-resistor problems, or short ramps.
- **المعنى (AR):** يربط الدليل E-030 بارتفاع جهد الناقل؛ وتشمل الأسباب ارتفاع جهد التغذية أو قصور التجديد بسبب القصور الذاتي أو مشكلة مقاومة الكبح أو قصر أزمنة التسارع والتباطؤ.
- **Sens (FR):** Le manuel associe E-030 à une surtension du bus; les causes citées comprennent tension réseau élevée, régénération insuffisante, résistance de freinage ou rampes trop courtes.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 175.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Record U0-05 and when the fault occurs. Have qualified personnel inspect supply and regenerative resistor; do not change ramps before backup and engineering review.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-040

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-040
- **Meaning (EN):** The alarm list distinguishes low grid voltage from bus undervoltage caused by a drive power failure.
- **المعنى (AR):** تميّز قائمة الإنذارات بين انخفاض جهد الشبكة وانخفاض جهد الناقل الناتج عن انقطاع تغذية المغير.
- **Sens (FR):** La liste distingue la sous-tension due au réseau de celle causée par une coupure d’alimentation du variateur.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 175.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Record supply behavior and event timing; have a qualified electrician verify phases/connections and avoid repeated resets before capturing the cause.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-221

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-221
- **Meaning (EN):** Received encoder data is incorrect and retries exceed P0-56; the manual identifies encoder interference as a possible cause.
- **المعنى (AR):** بيانات المشفّر المستقبلة غير صحيحة وعدد المحاولات يتجاوز P0-56؛ ويشير الدليل إلى احتمال وجود تداخل على المشفّر.
- **Sens (FR):** Les données reçues du codeur sont erronées et les reprises dépassent P0-56; le manuel cite des interférences.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 180.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Review U0-79/U0-54 counters as directed by the manual and inspect cable routing/shielding after isolation. Do not change parameters without an EMC review.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-222

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-222
- **Meaning (EN):** The manual identifies low voltage in the absolute-encoder battery box, below 2.75 V, and warns that position information may be lost if battery power is interrupted.
- **المعنى (AR):** يحدد الدليل انخفاض جهد بطارية المشفّر المطلق إلى أقل من 2.75 فولت ويحذر من احتمال فقد بيانات الموضع عند انقطاع البطارية.
- **Sens (FR):** Le manuel indique une tension de batterie du codeur absolu inférieure à 2,75 V et avertit d’un risque de perte de position.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 180.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Confirm the exact encoder/battery assembly and approved OEM replacement procedure. Do not perform live battery replacement based only on this summary; use qualified personnel and site safety rules.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-236

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-236
- **Meaning (EN):** Motor encoder feedback differs from grating/displacement feedback by more than configured P9-02; the manual lists mechanical errors or scale alignment as possible causes.
- **المعنى (AR):** يتجاوز الفرق بين تغذية مشفّر المحرك وتغذية المسطرة/الإزاحة الخارجية قيمة P9-02؛ ويذكر الدليل احتمال خلل ميكانيكي أو سوء محاذاة المسطرة.
- **Sens (FR):** L’écart entre le codeur moteur et la règle dépasse P9-02; le manuel cite un problème mécanique ou d’alignement.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 181.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Record P9-02 and feedback values; inspect mechanical transmission and scale alignment before changing parameters; back up settings and seek machine-builder review.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-237

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-237
- **Meaning (EN):** In the stated P9-02 configuration, the manual says the external scale may be broken or incorrectly connected when feedback direction is reversed.
- **المعنى (AR):** في إعداد P9-02 المذكور، قد تكون المسطرة الخارجية مكسورة أو موصولة بشكل غير صحيح عند انعكاس اتجاه التغذية.
- **Sens (FR):** Dans la configuration P9-02 indiquée, la règle externe peut être rompue ou mal raccordée lorsque le sens est inversé.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 181.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Confirm P9-02 and compare direction with machine drawings; inspect scale cable/connector and mounting under isolation. Do not alter direction parameters without authorization.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.

### xinje-ds5k-e-238

- **Manufacturer / family:** Wuxi XINJE Electric Co., Ltd. — DS5K series servo driver
- **Code:** E-238
- **Meaning (EN):** The difference between motor encoder speed and external scale speed exceeds configured P9-04.
- **المعنى (AR):** يتجاوز الفرق بين سرعة مشفّر المحرك وسرعة المسطرة الخارجية قيمة P9-04.
- **Sens (FR):** L’écart entre la vitesse du codeur moteur et celle de la règle externe dépasse P9-04.
- **Official evidence:** DS5K series servo driver User Manual; Data No. SC5 03 20230427EN, revision 1.3.1; 7.1 Alarm code list / 7.2 Analysis of alarm types; printed page 181.
- **Source:** https://cdn-en.xinje.com/DS5K%20servo%20manual.pdf
- **Evidence note:** Official XINJE DS5K manual lists the code in section 7.1 and/or explains its causes in section 7.2; summary is paraphrased.
- **Review date:** 2026-10-24
- **Status:** verified-source-exact-scope
- **Safe checks:** Capture both feedback values, P9-04 and mechanism configuration; verify scale/coupling and P9-05–P9-08 settings with qualified motion-control personnel before tuning.
- **Limit:** Applies to XINJE DS5K series only; confirm installed variant and manual revision. The E-222 battery procedure requires the exact OEM safety procedure.
## Required fields for every new verified record

1. Machine builder and machine model (including variant/serial range when relevant).
2. CNC/PLC/servo/drive model and firmware/software version.
3. Exact alarm code and exact text shown by the machine.
4. Official manual title, document number, revision/date, section and printed page or PDF page.
5. Concise evidence summary tied to the cited passage, safe checks, escalation rule, reviewer and review date.
6. If any of these are missing, keep the record in portal-only, manual-found, or claim-reviewed status; do not mark it model-verified.


## Additional model-specific manual-reviewed records

> These records summarize selected official manual claims and are not field-verified. They must not be applied outside the listed model family/revision. Page numbers below distinguish printed page from PDF page.

### oem-inovance-md200-err02-overcurrent-acceleration

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Code / event:** Err02
- **Title (EN):** INOVANCE MD200 Err02 — overcurrent during acceleration
- **العنوان (AR):** INOVANCE MD200 Err02 — زيادة التيار أثناء التسارع
- **Titre (FR):** INOVANCE MD200 Err02 — surintensité pendant l’accélération
- **Manual:** MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113
- **Section:** 3 Fault > 3.1 Fault List
- **Page:** printed 32; PDF 32
- **Official source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Manual-supported claim:** The manual labels Err02 as overcurrent during acceleration and lists output short/ground fault, short acceleration time, unsuitable torque boost/V/f, low voltage, restarting a rotating motor, sudden load, undersized drive, braking resistor fault, and motor ground fault among possible causes.
- **Safe checks (EN):** Record the code and operating conditions; inspect fault history before repeated resets. After site-approved isolation and absence-of-voltage verification, have a qualified technician inspect motor cable and insulation. Compare acceleration ramp, load, and V/f settings with the MD200 manual and application; do not alter protection settings arbitrarily.
- **Escalation (EN):** Escalate to a drive specialist if the fault persists or internal damage is suspected; do not replace components without approved measurements.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err03-overcurrent-deceleration

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Code / event:** Err03
- **Title (EN):** INOVANCE MD200 Err03 — overcurrent during deceleration
- **العنوان (AR):** INOVANCE MD200 Err03 — زيادة التيار أثناء التباطؤ
- **Titre (FR):** INOVANCE MD200 Err03 — surintensité pendant la décélération
- **Manual:** MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113
- **Section:** 3 Fault > 3.1 Fault List
- **Page:** printed 32; PDF 32
- **Official source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Manual-supported claim:** The manual identifies Err03 as overcurrent during deceleration and lists short/ground faults, short deceleration time, low voltage, sudden load, missing/unsuitable braking resistor, and motor ground fault as possible causes.
- **Safe checks (EN):** Record whether the fault occurs only on stopping or with a specific load; do not repeat test starts without risk assessment. Review fault history and compare deceleration time with the application requirements and MD200 manual. Inspect braking resistor and power cables only after isolation and DC-bus discharge by a qualified technician.
- **Escalation (EN):** Escalate if Err03 recurs after ramp review or braking resistor/motor cable damage is suspected.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err05-overvoltage-acceleration

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Code / event:** Err05
- **Title (EN):** INOVANCE MD200 Err05 — overvoltage during acceleration
- **العنوان (AR):** INOVANCE MD200 Err05 — زيادة الجهد أثناء التسارع
- **Titre (FR):** INOVANCE MD200 Err05 — surtension pendant l’accélération
- **Manual:** MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113
- **Section:** 3 Fault > 3.1 Fault List
- **Page:** printed 33; PDF 33
- **Official source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Manual-supported claim:** The manual labels Err05 as overvoltage during acceleration and lists excessive input voltage, external force driving the motor, short acceleration time, and absent braking resistor as possible causes.
- **Safe checks (EN):** Compare supply readings and fault timing with the drive nameplate and model manual limits. Review the ramp and any load that may drive the motor; do not change braking settings without engineering approval. A qualified technician must perform power-cabinet measurements or braking-resistor checks after isolation and energy discharge.
- **Escalation (EN):** Escalate if voltage is outside the permitted range or the fault persists after acceleration/braking checks.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err09-undervoltage

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Code / event:** Err09
- **Title (EN):** INOVANCE MD200 Err09 — undervoltage
- **العنوان (AR):** INOVANCE MD200 Err09 — انخفاض الجهد
- **Titre (FR):** INOVANCE MD200 Err09 — sous-tension
- **Manual:** MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113
- **Section:** 3 Fault > 3.1 Fault List
- **Page:** printed 34; PDF 34
- **Official source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Manual-supported claim:** The manual labels Err09 as undervoltage and lists momentary power failure, input voltage outside the permitted range, abnormal bus voltage, and possible rectifier/pre-charge/drive/control-board faults.
- **Safe checks (EN):** Check supply interruption history and approved voltage monitoring without opening an energized cabinet. If the fault recurs with a sound supply, preserve the fault log and contact INOVANCE support instead of attempting board-level repair. Avoid repeated resets before identifying the voltage dip; follow site energy-isolation procedures.
- **Escalation (EN):** Escalate to a specialist if the fault recurs or internal power components are suspected.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err12-input-phase-loss

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Code / event:** Err12
- **Title (EN):** INOVANCE MD200 Err12 — input phase loss
- **العنوان (AR):** INOVANCE MD200 Err12 — فقدان طور الدخل
- **Titre (FR):** INOVANCE MD200 Err12 — perte de phase d’entrée
- **Manual:** MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113
- **Section:** 3 Fault > 3.1 Fault List; parameter F9-12 note
- **Page:** printed 34; PDF 34
- **Official source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Manual-supported claim:** The fault table names Err12 as input phase loss and lists abnormal three-phase input supply or internal drive/protection/control components as possible causes. The parameter note says the F9-12 input phase-loss protection applies only to single-phase MD200TXX models; do not generalize this parameter applicability to all MD200 variants.
- **Safe checks (EN):** Review breaker, supply status, and fault history from a safe point; the code alone does not prove drive failure. Inter-phase voltage measurements or cabinet wiring inspections must be performed by a qualified electrician under an approved isolation procedure. If the supply is sound and the fault persists, send the exact drive model and fault log to INOVANCE support.
- **Escalation (EN):** Escalate to a qualified electrician or OEM support; do not bypass phase-loss protection.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-inovance-md200-err14-drive-overtemperature

- **Manufacturer / family:** INOVANCE — MD200 series AC drive
- **Code / event:** Err14
- **Title (EN):** INOVANCE MD200 Err14 — drive overtemperature
- **العنوان (AR):** INOVANCE MD200 Err14 — ارتفاع حرارة الدرايف
- **Titre (FR):** INOVANCE MD200 Err14 — surchauffe du variateur
- **Manual:** MD200 User Guide; C02; document identifier MD200_User_Guide_EN_C02_19012113
- **Section:** 3 Fault > 3.1 Fault List
- **Page:** printed 35; PDF 35
- **Official source:** https://www.inovance.eu/fileadmin/downloads/Manuals/EN/MD200/MD200_User_Guide_EN_C02_19012113.PDF
- **Manual-supported claim:** The manual labels Err14 as drive overtemperature and lists high ambient temperature, blocked air filter, damaged fan, damaged module thermistor, or a faulty drive unit as possible causes.
- **Safe checks (EN):** Check ambient temperature, cabinet ventilation, and fan indications externally. Do not clean the filter or approach the fan until the equipment is stopped and isolated under the approved procedure. If Err14 persists after correcting external ventilation conditions, request OEM diagnosis rather than opening the power module.
- **Escalation (EN):** Escalate if overheating persists, the fan is faulty, or an internal sensor is suspected; do not continue running with recurring thermal alarms.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-10-insufficient-voltage

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 10
- **Title (EN):** Mitsubishi Electric C80 — servo alarm 10: insufficient voltage
- **العنوان (AR):** Mitsubishi Electric C80 — إنذار السيرفو رقم 10: جهد غير كافٍ
- **Titre (FR):** Mitsubishi Electric C80 — alarme servo 10 : tension insuffisante
- **Manual:** C80 Series Alarm/Parameter Manual; IB-1501560-F
- **Section:** 3.1 Servo Errors (S01/S03/S04), drive unit alarm table
- **Page:** printed 51; PDF 63
- **Official source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Manual-supported claim:** Alarm No. 10 is named Insufficient voltage; the manual says a drop of bus voltage was detected in the main circuit. It gives reset class PR, but detailed troubleshooting is delegated to the exact drive-unit instruction manual.
- **Safe checks (EN):** Record the full C80 alarm, affected axis, drive model, and time of occurrence. Review alarm history and supply measurements available through an approved monitoring system. Use the manual for the actual drive unit before measurements or power cycling; the CNC manual alone is insufficient.
- **Escalation (EN):** Escalate if the alarm recurs or requires internal power-unit inspection; stop work under site procedure.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-18-encoder-initial-communication

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 18
- **Title (EN):** Mitsubishi Electric C80 — servo alarm 18: encoder initial communication
- **العنوان (AR):** Mitsubishi Electric C80 — إنذار السيرفو 18: اتصال المشفر عند البدء
- **Titre (FR):** Mitsubishi Electric C80 — alarme servo 18 : communication initiale de l’encodeur
- **Manual:** C80 Series Alarm/Parameter Manual; IB-1501560-F
- **Section:** 3.1 Servo Errors (S01/S03/S04), drive unit alarm table
- **Page:** printed 51; PDF 63
- **Official source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Manual-supported claim:** Alarm No. 18 is named Main side encoder: Initial communication error; the details say initial communication with the motor-side encoder failed. Troubleshooting is not specified in this table and requires the exact drive-unit manual.
- **Safe checks (EN):** Record axis, full alarm code, encoder type, and drive model. Review alarm history and prior encoder-cable work without disconnecting connectors while running. Inspect connections only after stopping and isolating per the drive manual; do not replace the encoder without diagnosis.
- **Escalation (EN):** Escalate to a servo specialist if communication errors persist or electrical encoder testing is required.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-23-excessive-speed-error

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 23
- **Title (EN):** Mitsubishi Electric C80 — servo alarm 23: excessive speed error
- **العنوان (AR):** Mitsubishi Electric C80 — إنذار السيرفو 23: انحراف سرعة مفرط
- **Titre (FR):** Mitsubishi Electric C80 — alarme servo 23 : erreur excessive de vitesse
- **Manual:** C80 Series Alarm/Parameter Manual; IB-1501560-F
- **Section:** 3.1 Servo Errors (S01/S03/S04), drive unit alarm table
- **Page:** printed 52; PDF 64
- **Official source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Manual-supported claim:** Alarm No. 23 is Excessive speed error; the manual defines it as the difference between actual and commanded speed persisting longer than the configured excessive-speed-deviation timer. Reset class is NR.
- **Safe checks (EN):** Capture the alarm, axis, commanded/actual speed, and available load changes. Visually check for an obstruction from a safe point; do not enter the motion zone or bypass guards. Review the configured deviation timer and exact servo manual; do not change alarm thresholds or control parameters without approval.
- **Escalation (EN):** Escalate if deviation recurs or accompanies unexpected motion; keep the area secured.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-24-grounding

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 24
- **Title (EN):** Mitsubishi Electric C80 — servo alarm 24: motor cable grounding
- **العنوان (AR):** Mitsubishi Electric C80 — إنذار السيرفو 24: تأريض كابل المحرك
- **Titre (FR):** Mitsubishi Electric C80 — alarme servo 24 : mise à la terre du câble moteur
- **Manual:** C80 Series Alarm/Parameter Manual; IB-1501560-F
- **Section:** 3.1 Servo Errors (S01/S03/S04), drive unit alarm table
- **Page:** printed 52; PDF 64
- **Official source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Manual-supported claim:** Alarm No. 24 is named Grounding; the manual states the motor power cable is in contact with FG (frame ground). Reset class is PR.
- **Safe checks (EN):** Stop the machine and apply isolation plus absence-of-voltage verification before inspecting the power cable. Visually inspect chafing points and external damage without touching conductors or taking live measurements. Insulation testing must be performed by a qualified technician per the drive manual; do not megger connected electronics.
- **Escalation (EN):** Escalate to a qualified industrial electrician before restart; do not bypass grounding protection.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-servo-alarm-25-absolute-position-lost

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; servo/spindle alarm table
- **Code / event:** servo alarm 25
- **Title (EN):** Mitsubishi Electric C80 — servo alarm 25: absolute position data lost
- **العنوان (AR):** Mitsubishi Electric C80 — إنذار السيرفو 25: فقدان بيانات الموضع المطلق
- **Titre (FR):** Mitsubishi Electric C80 — alarme servo 25 : perte des données de position absolue
- **Manual:** C80 Series Alarm/Parameter Manual; IB-1501560-F
- **Section:** 3.1 Servo Errors (S01/S03/S04), drive unit alarm table
- **Page:** printed 52; PDF 64
- **Official source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Manual-supported claim:** Alarm No. 25 is named Absolute position data lost; the manual states absolute-position data was lost in the encoder. Reset class is AR. Recovery must follow the exact machine-builder and encoder procedure.
- **Safe checks (EN):** Do not move the axis or perform arbitrary homing before confirming reference state and OEM procedure. Record the alarm, battery/encoder status, and any recent power loss or maintenance. Use the drive, encoder, and machine-builder manuals to determine safe position recovery.
- **Escalation (EN):** Escalate to a CNC specialist before homing or resuming production; recovery may require axis-position verification.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-mitsubishi-c80-emg-plc-emergency-stop

- **Manufacturer / family:** Mitsubishi Electric CNC — C80 Series CNC; emergency-stop alarm section
- **Code / event:** Mitsubishi Electric C80 — EMG: user PLC emergency stop
- **Title (EN):** Mitsubishi Electric C80 — EMG: user PLC emergency stop
- **العنوان (AR):** Mitsubishi Electric C80 — EMG: إيقاف طوارئ من PLC المستخدم
- **Titre (FR):** Mitsubishi Electric C80 — EMG : arrêt d’urgence du PLC utilisateur
- **Manual:** C80 Series Alarm/Parameter Manual; IB-1501560-F
- **Section:** 8 Emergency Stop Alarms (EMG)
- **Page:** printed 106; PDF 118
- **Official source:** https://www.mitsubishielectric-cnc.com/wp-content/uploads/2025/02/C80-Series-Alarm-Parameter-Manual.pdf
- **Manual-supported claim:** The manual states that the PLC emergency-stop signal is turned ON during user-PLC sequence processing and instructs checking the conditions that turn the signal ON and removing the cause. Other EMG labels in the same section have distinct causes and must not be conflated.
- **Safe checks (EN):** Check the stop-signal state on the diagnostic screen without bypassing the circuit or forcing outputs. Have an authorized person review signal conditions in the PLC program and approved safety schematic. Restart only after identifying the cause, removing the hazard, and verifying the stop system.
- **Escalation (EN):** If the stop cause is unclear, keep the machine stopped and escalate to a controls/safety engineer; never bypass the safety circuit.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-siemens-s7-1200-fs-event-0005-overtemperature

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Code / event:** 0x0005
- **Title (EN):** Siemens S7-1200 F-module Event 0x0005 — overtemperature
- **العنوان (AR):** Siemens S7-1200 F-module Event 0x0005 — ارتفاع الحرارة
- **Titre (FR):** Siemens S7-1200 F-module Event 0x0005 — surtempérature
- **Manual:** S7-1200 Functional Safety Manual; V4.6, 11/2022; A5E03470344-AC
- **Section:** 6.2 Fault diagnostics; Event ID 0x0005
- **Page:** printed 122; PDF 122
- **Official source:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Manual-supported claim:** The manual labels event 0x0005 Overtemperature for all listed fail-safe signal modules and states the module-case high-temperature limit has been exceeded; it directs checking ambient temperature and power cycling after the fault is eliminated.
- **Safe checks (EN):** Record the Event ID, module part number, and timestamp from the diagnostics buffer. Check cabinet temperature and ventilation externally; do not open an energized cabinet. After correcting the cause, follow the OEM power-cycle procedure; do not bypass the safety function.
- **Escalation (EN):** Escalate to a safety/controls engineer if the event recurs or the module does not return to normal.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-siemens-s7-1200-fs-event-004d-profisafe-crc

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Code / event:** 0x004D
- **Title (EN):** Siemens S7-1200 F-module Event 0x004D — PROFIsafe CRC communication error
- **العنوان (AR):** Siemens S7-1200 F-module Event 0x004D — خطأ CRC في PROFIsafe
- **Titre (FR):** Siemens S7-1200 F-module Event 0x004D — erreur CRC PROFIsafe
- **Manual:** S7-1200 Functional Safety Manual; V4.6, 11/2022; A5E03470344-AC
- **Section:** 6.2 Fault diagnostics; Event ID 0x004D
- **Page:** printed 122; PDF 122
- **Official source:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Manual-supported claim:** The manual describes event 0x004D as PROFIsafe communication error (CRC), indicating inconsistent data frames; possible cause is communication interference between fail-safe CPU and F-module, including excessive electromagnetic interference or sign-of-life monitoring error. Corrective measures include checking the communication connection and eliminating interference.
- **Safe checks (EN):** Record event ID, module, topology, and network diagnostics before changing settings. Externally inspect communication cables/connectors and follow the approved safety-network specification. Do not alter PROFIsafe timing or safety parameters without a risk assessment and approved engineering procedure.
- **Escalation (EN):** Escalate to a controls/safety engineer if communication faults persist; do not bypass safety communication.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.

### oem-siemens-s7-1200-fs-event-004e-profisafe-timeout

- **Manufacturer / family:** Siemens — SIMATIC S7-1200 fail-safe signal modules (F-modules)
- **Code / event:** 0x004E
- **Title (EN):** Siemens S7-1200 F-module Event 0x004E — PROFIsafe communication timeout
- **العنوان (AR):** Siemens S7-1200 F-module Event 0x004E — مهلة اتصال PROFIsafe
- **Titre (FR):** Siemens S7-1200 F-module Event 0x004E — délai de communication PROFIsafe
- **Manual:** S7-1200 Functional Safety Manual; V4.6, 11/2022; A5E03470344-AC
- **Section:** 6.2 Fault diagnostics; Event ID 0x004E
- **Page:** printed 122; PDF 122
- **Official source:** https://support.industry.siemens.com/dl/files/552/104547552/att_896075/v1/s71200_f_user_manual_en-US_en-US.pdf
- **Manual-supported claim:** The manual labels event 0x004E PROFIsafe communication failure (timeout) and states that the F-monitoring time was exceeded. It recommends checking the F-monitoring time and examining the safety program and other CPU activities such as interrupts, Ethernet communication, OB scheduling, and long program paths.
- **Safe checks (EN):** Preserve diagnostics, CPU-cycle data, and event details before changing monitoring time. Have an authorized engineer review CPU load, interrupts, communications, and the safety program. Do not increase the timeout merely to suppress the alarm; risk analysis and safety validation are required.
- **Escalation (EN):** Escalate to a functional-safety engineer before changing F-monitoring time or resuming production.
- **Review date:** 2026-10-24
- **Evidence status:** manual-claim-reviewed-not-field-verified
- **Application limit:** Confirm exact controller/drive model, firmware, installed manual revision, and machine-builder configuration before applying. The cited manual supports the summary only within its stated scope.
