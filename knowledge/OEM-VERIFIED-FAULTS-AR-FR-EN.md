# OEM-verified fault and diagnostic records (AR / FR / EN)

> Verified means the cited official source supports the specific statement below. It does not mean every installation using the same brand behaves identically. Match machine builder, controller/drive model, firmware and manual revision before applying a record.

- Review date: 2026-10-24
- Records with official manual evidence: 20
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

## Required fields for every new verified record

1. Machine builder and machine model (including variant/serial range when relevant).
2. CNC/PLC/servo/drive model and firmware/software version.
3. Exact alarm code and exact text shown by the machine.
4. Official manual title, document number, revision/date, section and printed page or PDF page.
5. Concise evidence summary tied to the cited passage, safe checks, escalation rule, reviewer and review date.
6. If any of these are missing, keep the record in portal-only, manual-found, or claim-reviewed status; do not mark it model-verified.
