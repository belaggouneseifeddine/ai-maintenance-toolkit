# Maintenance AI Toolkit — Manual Test Checklist

Use this checklist on the published site from an Android phone. Record the browser and date when testing. A checked item means it was actually tested, not merely implemented.

## Core navigation
- [ ] App opens without a blank screen or console-visible blocking error.
- [ ] Each navigation tab opens the intended panel.
- [ ] Layout fits a narrow phone screen; fields and buttons are usable without horizontal scrolling.
- [ ] Arabic text direction and labels display correctly.

## Knowledge base
- [ ] Knowledge tab opens and links to the cited technical references.
- [ ] Valve/actuator, pneumatic system, gearbox, bearing, electrical control/PLC, and thermal system appear in the equipment selector and produce conservative guidance.
- [ ] VFD and sensor/instrumentation appear in the equipment selector.
- [ ] New symptoms (slow cycle, intermittent fault, high pressure, abnormal consumption) produce safe fallback guidance.
- [ ] A VFD trip and an implausible/lost sensor signal produce specific guidance.
- [ ] Conveyor start/tracking/noise guidance includes isolation and pinch-point warnings.
- [ ] New knowledge entries do not provide invented setpoints, torque values, or pressure limits.
- [ ] Safety warnings for hydraulic injection, stored pressure, and energy isolation are visible.

- [ ] General knowledge is presented by equipment family and workflow, not as a dedicated brand-specific case study.
- [ ] Motor casebook covers no-start, overload trip, VFD trip, overheating/vibration, and contactor chatter.
- [ ] Motor/VFD guidance requires exact model-specific alarm manuals and forbids bypassing protection or repeated resets.

## AI assistant and privacy
- [ ] Submit the AI form without checking consent; browser blocks submission and no request is sent.
- [ ] Check consent and submit once; verify the checkbox is cleared immediately for the next request.
- [ ] Submit again without re-checking consent; verify the request cannot be sent.
- [ ] Leave the endpoint empty and submit with consent; verify no maintenance data is sent and local diagnosis remains available.
- [ ] Use an untrusted or malformed endpoint only in a controlled test; verify HTTPS validation and clear error handling.
- [ ] Simulate an unavailable/slow endpoint; verify the request times out and the button becomes usable again.
- [ ] Verify AI response line breaks are readable on a narrow Android screen.
- [ ] Confirm the configured endpoint belongs to a trusted operator before sending any data; never use confidential plant or personal data.

## Diagnosis flow
- [ ] Submit a pump fault with a symptom and confirm a result appears.
- [ ] Change equipment/symptom and confirm the follow-up question and choices update where supported.
- [ ] Verify follow-up questions for pneumatic leak/low flow, gearbox overheating/leak, bearing noise/vibration, PLC start/trip, and thermal overheating/low flow.
- [ ] Submit a diagnosis with a follow-up answer and verify the answer is included in the result.
- [ ] Leave the follow-up question unanswered and confirm diagnosis still works.
- [ ] Submit a motor fault and confirm equipment-specific guidance appears.
- [ ] Submit a compressor or hydraulic fault and review pressure/energy warnings.
- [ ] Enter an unusual error code and verify it is displayed safely as text.
- [ ] Enter HTML-like text in notes and confirm it is not interpreted as markup.
- [ ] Confirm results are clearly labelled as guidance, not a confirmed diagnosis.
- [ ] Save a diagnosis and confirm it appears in the maintenance log.

## Safety checklist
- [ ] Safety checklist can be checked and reset.
- [ ] Guidance warns against working on energized or pressurized equipment.
- [ ] No flow recommends bypassing guards, interlocks, or protective devices.

## Maintenance log
- [ ] Create a record with date, machine, fault, action, and status.
- [ ] Refresh the page and verify records persist on the same browser/device.
- [ ] Delete one record and verify only that record is removed.
- [ ] Export CSV and open it in a spreadsheet app.
- [ ] Clear all records only after confirming the confirmation dialog.

## PWA and offline behavior
- [ ] Open the site over HTTPS.
- [ ] Browser offers installation or “Add to Home screen” where supported.
- [ ] Launch the installed shortcut and confirm the app opens.
- [ ] After one successful online load, enable airplane mode and test the app shell.
- [ ] Restore connectivity and confirm the app still opens.
- [ ] Verify a new release replaces the old cached version.

## Acceptance rule
Do not describe the app as production-ready until the critical flows above have been tested on the target device. The current app uses local browser storage and rule-based guidance; it has no connected AI model or server-side synchronization.

## Answer-aware diagnostic regression cases

These cases cover the currently implemented answer-specific branches. Use only safe observations and existing instrument readings; do not create a hazardous condition to test a branch.

- [ ] **Pump / low flow:** choose "نعم، طبيعي" for the suction/source question; confirm the next step asks to compare discharge pressure/flow with baseline and pump curve rather than assuming suction blockage.
- [ ] **Pump / low flow:** choose "منخفض أو غير مستقر"; confirm guidance asks for safe review of source/suction and escalation when harmful operating signs appear.
- [ ] **Motor / does not start:** choose "لا يوجد أمر تشغيل"; confirm the result says to inspect the command/permissives through the approved control diagram and forbids bridging interlocks.
- [ ] **Motor / does not start:** choose "أمر موجود مع إنذار/فصل"; confirm it asks to preserve the alarm/event log and consult the exact model manual before reset.
- [ ] **Compressor / low flow:** choose "نعم، فرق الضغط في الشبكة محتمل"; confirm the result compares outlet and point-of-use pressure under similar load.
- [ ] **Compressor / low flow:** choose "ضغط المخرج نفسه منخفض"; confirm it does not suggest changing setpoints or the relief valve.
- [ ] **Hydraulic / leak:** choose "نعم أو غير متأكد"; confirm the high-pressure injection warning is prominent and instructs the user to move away, escalate, and never use a hand to locate a leak.
- [ ] **Hydraulic / leak:** choose "لا أستطيع التحديد"; confirm the result conservatively treats the leak as potentially high pressure.
- [ ] **Thermal / high pressure:** choose "نعم، تجاوز مؤكد — أوقف وصعّد"; confirm the instruction is to keep the equipment stopped and not restart, adjust, or isolate a safety valve.
- [ ] **Thermal / high pressure:** choose "لا أعرف حد المعدة"; confirm the app does not invent a limit and directs the user to the model-specific limit and escalation process.
- [ ] **VFD / trip:** choose "نعم، الرمز محفوظ"; confirm the exact full fault code and matching drive model/manual are required; no meaning is guessed from another model.
- [ ] **VFD / trip:** choose "تمت إعادة الضبط بالفعل"; confirm it asks to document pre/post-reset conditions and discourages repeated resets if the fault returns.
- [ ] For each case, leave the follow-up unanswered once; confirm the general diagnosis still works and does not claim the branch was evaluated.
- [ ] Confirm the displayed result is labelled guidance, not a confirmed diagnosis, and that user-provided code/notes are rendered as text.

## Architecture roadmap review

- [ ] Treat `docs/DIAGNOSTIC-ARCHITECTURE-ROADMAP.md` as a proposal, not a statement that all planned capabilities are implemented.
- [ ] Any future diagnostic schema has stable IDs for questions/answers and validates required fields before runtime use.
- [ ] Every machine-specific value or alarm interpretation is tied to an exact model/source; unknown values stay unknown.
- [ ] The deterministic safety gate takes precedence over AI output.
- [ ] No manuals, observations, or plant data are sent to an external service without explicit user consent.

