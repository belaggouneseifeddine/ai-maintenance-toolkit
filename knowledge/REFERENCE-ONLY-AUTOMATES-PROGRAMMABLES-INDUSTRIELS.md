# Reference Index — Automates programmables industriels

## Catalog record

- **Title:** *Automates programmables industriels*
- **Author:** William Bolton
- **French translator:** Hervé Soulard
- **Edition:** 2nd French edition; translation of the 6th English edition of *Programmable Logic Controllers*
- **Publisher:** Dunod; original English work published by Elsevier
- **Copyright:** © Elsevier Ltd. 2015; French translation © Dunod 2010 and 2015
- **French ISBN:** 978-2-10-074219-6
- **Original English ISBN shown in the book:** 978-0-12-802929-9
- **Length:** 440 PDF pages
- **Source class:** Copyrighted general engineering textbook; reference-only
- **Reuse status:** No open reuse license recorded. Do not store, publish, or reproduce the PDF, chapter text, figures, tables, or extensive close paraphrases in this repository.
- **Knowledge status:** `reference_only`; not an OEM service manual, not a model-specific procedure, and not model-verified.

Page numbers in this index are the book's **printed page numbers**, not the PDF viewer page indices.

## Purpose in Maintenance AI Toolkit

This is the more directly relevant of the two supplied books for PLC and automation troubleshooting. It provides general background on PLC architecture, input/output devices, signal processing, programming methods, timers, counters, sequencing, commissioning, safety concepts, fault-finding and documentation.

Use it to improve the application's **question design and diagnostic structure** for PLC-controlled equipment. Do not use it as proof of a fault on a particular PLC, drive, sensor, valve, motor, machine or firmware revision.

## Chapter and topic locator

| Chapter / section | Printed pages | Retrieval topics |
|---|---:|---|
| 1. Industrial programmable controllers | 1–23 | Control-system architecture; PLC hardware and CPU; scan/program concepts; relay versus microprocessor control |
| 2. Input/output devices | 25–64 | Discrete and analogue sensors; proximity and photoelectric switches; encoders; temperature and pressure sensing; relays, contactors, solenoid valves and motors |
| 3. Digital systems | 65–82 | Binary, octal, hexadecimal and BCD; PLC data; combinational and sequential logic |
| 4. Input/output processing | 83–120 | I/O modules; analogue-to-digital and digital-to-analogue conversion; signal conditioning; remote I/O; communication links and networks |
| 5. Ladder and function-block diagrams | 121–158 | Ladder logic, logic functions, latching, interlocks, program examples and FBD |
| 6. IL, SFC and ST programming | 159–192 | Instruction lists, sequential function charts and structured text |
| 7–8. Internal relays, jumps and calls | 193–232 | Internal memory bits, retained states, master control relays, jumps and subroutines |
| 9. Timers | 233–254 | On-delay, off-delay, pulse and retentive timer behaviour |
| 10. Counters | 255–278 | Up/down counters, count pulses, reset and sequence control |
| 11. Shift registers | 279–290 | Shift-register and sequence applications |
| 12. Data management | 291–306 | Registers, bits, arithmetic and closed-loop control |
| 13. System design | 307–352 | Program development; safety concepts; commissioning; fault-finding; system documentation |
| 14. Program examples | 353–388 | Temperature regulation; valve sequencing; conveyor control; process control and data comparisons |

### High-value sections for this project

- **Sensors and measurement quality — Chapter 2, pp. 25–45:** the text distinguishes discrete from analogue sensing and discusses range, accuracy, non-linearity, hysteresis and response time. These concepts support better intake fields; they do not provide calibration limits for a particular instrument.
- **Output devices — Chapter 2, pp. 46–59:** relay, contactor, solenoid-valve and motor interfaces. Use this to separate a PLC command from the physical action of the final element.
- **Signal and I/O processing — Chapter 4, pp. 83–94:** I/O modules, signal conversion and conditioning. This supports distinguishing a field value, raw module value and scaled engineering value.
- **Networks — Chapter 4, pp. 94–110:** remote connections and industrial network concepts. The examples are historical/general; verify current protocol behaviour and diagnostics against the installed vendor and firmware documentation.
- **Safety concepts — Chapter 13.2, pp. 311–315:** risk assessment, emergency-stop concepts, safety relays and protective devices. These are background only; the book is not a functional-safety standard or a design approval.
- **Commissioning — Chapter 13.3, pp. 316–319:** monitoring and controlled testing of I/O and program behaviour. Any forcing or test mode must be restricted to an approved, risk-assessed commissioning condition; never use it to bypass a production interlock or safety function.
- **Fault-finding — Chapter 13.4, pp. 320–324:** field devices and wiring, I/O channels and power supply as candidate fault locations; comparison of output indication with the field device; watchdog/timeout concepts; last-active-step indicators; redundancy and expected-value checks; program backup.
- **System documentation — Chapter 13.5, pp. 325–347:** equipment description, control requirements, PLC details, electrical drawings, I/O list, application program and operation description, software backup, operating procedures and alarm information.
- **Temperature control — Chapter 14.1, pp. 353–358:** on/off control, deadband and proportional-control concepts. Do not copy example setpoints or use them as equipment limits.
- **Valve sequencing — Chapter 14.2, pp. 359–368:** directional valves, actuator sequence, timers and feedback logic. Useful for sequence-state and timeout questions, not a model-specific hydraulic/pneumatic service procedure.
- **Conveyor control — Chapter 14.3, pp. 369–375:** photoelectric detection, item counting and diverter/packaging sequence examples. Useful for missed/double count hypotheses and sensor-to-counter tracing.
- **Process control — Chapter 14.4, pp. 376–377:** general PLC process-control example.

## Diagnostic patterns that can be represented safely

These are **general diagnostic patterns extracted from the chapter topics**, not confirmed causes or ready-to-run instructions.

1. **Command-to-action chain:** distinguish the PLC logic command, output-channel status, wiring/supply path, actuator response and process feedback. A correct LED state alone does not prove that the field device has received the correct power or moved.
2. **Input-path separation:** distinguish the physical sensor state, sensor supply, field wiring, input-channel indication, raw PLC value and scaled value. A mismatch between adjacent stages narrows the investigation; it does not automatically identify the failed component.
3. **Sequence stall:** record the current sequence step, last expected transition, last confirmed output, feedback state and elapsed time. A watchdog/timeout can flag that a movement did not complete within an approved design limit; the limit must come from the machine design/OEM documentation, never a generic guess.
4. **Last-action trace:** a recorded last-active output or sequence marker can help identify where a cycle stopped. This is useful as an observability feature in the app, provided it is clearly labelled as controller history rather than proof of root cause.
5. **Expected-value check:** compare the expected process value or transition with the measured value after a known event. Preserve the measurement point, units, timestamp and source.
6. **Program integrity:** retain an approved program backup and revision record. A battery-backed memory or storage problem is a separate hypothesis from a field-device failure.

### Safety interpretation

The book's safety chapter discusses risk assessment, emergency-stop architecture, safety relays and protective devices. The toolkit must preserve these boundaries:

- The app must never advise bypassing guards, interlocks, trips, emergency stops or safety relays.
- A standard PLC application or an AI-generated diagnostic sequence must not be treated as a safety function.
- Do not disconnect inputs one by one, force I/O, or test an actuator in a running production process as a casual troubleshooting step. Such work requires an approved test plan, qualified personnel, a safe machine state and site energy-control procedures.
- Electrical measurements at live I/O or actuator terminals are not ordinary user checks. They require the correct risk assessment, PPE, instruments, isolation/verification where applicable and qualified electrical personnel.
- Use current applicable regulations/standards and the exact machine-builder and component-OEM documentation. The book's 2015 examples do not replace current standards.

## Suggested structured intake fields

For future PLC-related diagnostic cases, consider recording:

- PLC manufacturer, exact CPU/model, firmware and program revision.
- I/O rack/module model, channel and address.
- Signal class: discrete, analogue, pulse, network or safety-related.
- Sensor/actuator model and supply type.
- Field observation versus PLC input/output indication.
- Raw input value, scaled engineering value, unit and measurement point.
- Commanded output versus confirmed feedback.
- Current sequence step, last completed step and elapsed time.
- Alarm/event text exactly as displayed, timestamp and recent program/maintenance changes.
- Source of each observation: operator report, controller display, instrument measurement, historian or inference.

Do not create a fault record or Bayesian likelihood from the textbook alone. A new structured fault case needs a defined asset scope, evidence provenance, safety review and—where applicable—the exact OEM manual and revision.

## Provenance and limitations

This index was prepared from the supplied PDF's title/copyright pages, table of contents and selected sections on sensors, I/O processing, safety, commissioning, fault-finding, documentation and PLC program examples. It is an original navigation summary, not a transcription or validation of every technical statement.

The book includes examples from multiple PLC vendors and reflects the standards and product context of its publication period. Do not generalize vendor-specific addresses, instruction syntax, electrical values, timings, network behaviour or safety designs to a different controller. The private PDF remains in the user's file library; only this reference index is stored in the repository.
