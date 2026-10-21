# Maintenance AI Toolkit — Expert Capability Model

## Product goal

The app should behave like a disciplined maintenance assistant: help a technician collect facts, protect people and equipment, narrow fault possibilities, document evidence, and prepare a useful handover. It must not pretend to replace an authorized technician, the OEM manual, a permit-to-work process, or site procedures.

## Available in the current MVP

- Arabic, mobile-first PWA with a rule-based diagnostic checklist for multiple equipment families.
- Selected answer-aware follow-up paths, including pump low-flow, motor no-start, compressor low-flow, hydraulic leak, high thermal pressure, and VFD trip.
- Safety guidance for stored energy, isolation/LOTO, hydraulic injection, and protection devices.
- Local maintenance log and CSV export.
- Optional AI endpoint guarded by explicit per-request consent; provider availability is not guaranteed until configured and end-to-end tested.
- Structured pump low-flow flow definition.
- Diagnostic report pilot: optional asset ID, user-selected priority, technician, manual/page reference, print/PDF workflow, and local-log handover.

## Core skills the app should develop

### 1. Safety and triage
- Identify stop-work conditions before troubleshooting: electrical exposure, unexpected motion, stored pressure, hydraulic injection risk, hot surfaces, rotating parts, and unknown protective trips.
- Display conservative isolation/escalation guidance when a user flags an urgent situation.
- Never advise bypassing guards, interlocks, alarms, overloads, relief valves, or safety trips.
- Treat user-selected priority as a user label, not an automated risk assessment.

### 2. Evidence-led troubleshooting
- Separate observed facts, measured values, hypotheses, and recommended next checks.
- Capture readings with units, timestamps, measurement point, operating state, and source/manual reference when known.
- Ask one discriminating question at a time and adapt the next step to the answer.
- Keep unknown values unknown. Do not invent setpoints, torque values, alarm meanings, or replacement part numbers.

### 3. Equipment-specific diagnostic modules
- **Electric motors/starters:** nameplate data, overload trips, phase imbalance evidence, insulation-test prerequisites, bearing symptoms, and starter/VFD context.
- **Pumps:** suction/discharge conditions, flow, cavitation clues, seal/bearing/coupling observations, pump curve and operating point.
- **Compressors/air networks:** pressure at source vs point of use, load/unload state, filter/dryer pressure drop, leaks, and alarm history.
- **Hydraulics/pneumatics:** pressure/flow/temperature evidence, cylinder synchronisation, valves, contamination clues, and stored-energy precautions.
- **VFD/PLC/HMI/instrumentation:** exact model and fault code, event history, I/O state, signal plausibility, and vendor-manual matching.
- **Bearings/gearboxes/conveyors/thermal systems:** trend comparison, lubrication condition, alignment and tracking observations, heat-exchanger performance, and guarded access.
- Modules should share a common data contract, not a separate hard-coded mini-app for every machine.

### 4. OEM evidence and manuals
- Let the user attach or select a machine manual.
- Search the actual document and show the document title plus page/section for relevant guidance.
- Distinguish official OEM documents from generic training material.
- If the exact model/manual cannot be verified, say so and avoid model-specific instructions.
- AI may explain retrieved evidence; it must not fabricate citations or specifications.

### 5. Work-order and handover quality
- Generate a printable report with asset ID, timestamp, user-selected priority, symptom, observed measurements, error code, follow-up answer, recommended checks, manual reference, and unresolved questions.
- Distinguish **recommended** actions from **actions actually performed** and from **verified results**.
- Support technician notes, parts requested, downtime, and supervisor handover in later iterations.
- Preserve local-first storage and make data export/deletion explicit before adding sync.

### 6. Preventive maintenance and reliability
- Provide configurable checklists by equipment family and site policy.
- Track due dates and completion records only when the user supplies or approves the schedule.
- Trend timestamped vibration, current, temperature, pressure, flow, and downtime only when units and measurement conditions are recorded.
- Do not call simple threshold rules or a few records “predictive maintenance.” Predictive features require enough quality historical data and measured validation.

### 7. Optional AI coordinator
- Use local rules and safety checks first.
- Send only the minimum necessary information after explicit consent.
- Provide the AI with known observations, rule-engine findings, and retrieved sources—not a blank prompt asking it to guess.
- Validate the response, display uncertainty, retain source links, bound output length, and fall back to local guidance on failure.
- Never let AI override a safety gate or issue unverified model-specific settings.

## Recommended implementation order

1. Finish the report pilot and keep regression checks green.
2. Expand structured diagnostic data to motor no-start and VFD trip, preserving current wording and safety behaviour.
3. Add behaviour-level tests for each answer branch, not just source-string checks.
4. Add source-reference fields and verified OEM manual search.
5. Add editable equipment passports and maintenance work-order fields.
6. Add preventive-maintenance scheduling and trend charts only after record quality is adequate.
7. Verify AI end-to-end after provider secrets are configured; keep the app useful when AI is unavailable.

## Release standard

A release is ready for wider use only after:
- automated quality checks pass;
- critical diagnostic and safety paths pass regression tests;
- mobile layout and print-to-PDF are manually checked on the target Android browser;
- offline installation and cache refresh are manually checked;
- AI status is accurately described as working, unconfigured, or unavailable based on an actual test;
- release notes separate implemented, automated-tested, and manually-tested features.

The app is an aid for disciplined maintenance work, not a substitute for OEM instructions, formal risk assessment, permits, isolation verification, or professional judgement.
