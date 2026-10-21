# Ingersoll Rand Compressor Troubleshooting Casebook

**Status:** Evidence-led generic case notes; model-specific diagnosis is pending identification of the actual compressor.  
**Language:** Arabic-first with common English technical terms.  
**Scope:** Practical troubleshooting workflow for Ingersoll Rand compressed-air equipment. Do not apply a reciprocating-compressor procedure to a rotary-screw unit, or vice versa.

## Case intake pattern

The user's prior troubleshooting style starts with the real symptom and the machine's behavior, then adds the exact alarm text and asks for a practical next step. Preserve that sequence, but collect enough context to avoid guessing:

1. **Machine identity:** compressor type (rotary screw / reciprocating / other), exact model, serial/nameplate data if available, controller model, and approximate age.
2. **Observed behavior:** what starts, what does not, whether the motor actually rotates, whether the intake behaves normally, whether pressure rises, and where pressure was observed.
3. **Alarm:** photograph or transcribe the exact message, punctuation, and code; include when it appears (at start, during run, or at shutdown).
4. **Timeline:** normal operation before the fault? recent maintenance, power loss, filter change, leak, unusual sound, temperature change, or process change?
5. **Available measurements:** pressure and temperature readings with units and measurement points, status indicators, running/load state, and any trend/history. Do not invent missing values.
6. **Safe checks already completed:** only external observations or checks authorized by the site procedure; record each result.
7. **Next discriminating check:** select the safest observation or measurement that separates the leading hypotheses; identify whether qualified electrical/mechanical staff are needed.

## Case A — Motor starts/runs, but no air intake is observed

**Reported symptom:** the motor appears to start, but the user observes no air intake. This description alone does not prove the compressor's suction system is faulty.

### First distinguish the compressor design

- **Reciprocating compressor:** intake occurs through an inlet filter and inlet valve during the piston intake stroke. The model-specific manual may include inlet/discharge valve, pressure-switch, unloader, and gasket checks.
- **Rotary-screw compressor:** air admission depends on the inlet/unloader valve, control state, and machine design. A reciprocating-compressor valve procedure is not applicable by default.
- **Unknown design:** identify the type and model before proposing internal checks.

### Diagnostic questions in priority order

| Question | Why it matters | Evidence to record |
|---|---|---|
| Is the motor physically running, or is only a start command/contactor heard? | Separates actual rotation from a control or electrical event | Control status, observed motor state from a safe position, exact alarm |
| Does pressure rise at the compressor outlet/receiver, or is only downstream pressure low? | Separates compressor production from distribution leak/demand/pressure-drop issues | Installed gauge readings, units, measurement locations, trend over time |
| Is the unit in loaded, unloaded, standby, or fault state? | A running motor may be intentionally unloaded or inhibited from loading | Controller state, load/unload indication, pressure-control status |
| Is there a new noise, overheating, trip, or oil/air leak? | May change urgency and the safe next action | Exact observation and time of onset |
| What is the exact model and controller? | Alarm meanings and component layout vary across models | Nameplate/model photo with private/site-sensitive details excluded |

### Conservative fault hypotheses to discriminate

- **Control/load state or unloader/inlet valve not admitting air:** compare the displayed state and command/feedback with the correct manual; do not force the valve.
- **Intake restriction or filter problem:** inspect only accessible external indicators and service history; isolate and follow the model's procedure before opening any housing.
- **Inlet/discharge valve or compressor-element issue:** consider only after external status, pressure behavior, and maintenance history support it; internal inspection is for qualified personnel under the OEM procedure.
- **Pressure is being produced but not reaching the point of use:** compare installed pressure indicators and inspect the distribution side under site-approved procedures.
- **Electrical or motor protection fault:** if the motor is not truly running, trips, hums, or overheats, record the alarm and have qualified staff assess the electrical/control side. Do not repeatedly reset protection.

These are competing hypotheses, not a confirmed diagnosis. Do not dismantle a pressurized assembly, bypass a safety device, or open energized electrical equipment.

## Case B — Alarm transcribed as “SOUVRAC MOT ELEC”

The earlier conversation contained an alarm transcribed approximately as **“SOUVRAC MOT ELEC”**. Keep it as a user transcription, not a verified manufacturer code. It may be a shortened or misread French-language message, but its meaning must not be assumed.

### Required follow-up before interpreting it

- Obtain a clear photo of the display, or copy the message character for character.
- Record the controller make/model and compressor model/type.
- Note when it occurs: before start, during acceleration, while loaded, after a delay, or during shutdown.
- Record any associated fault number, motor/drive indication, and event history.
- Check the exact model/controller manual's alarm table and troubleshooting section.

If the verified message indicates motor overload or electrical protection, preserve the fault history and escalate to qualified electrical personnel. Do not increase overload settings, change drive parameters, bridge protection, or repeatedly reset the fault to keep production running.

## Case C — Motor runs, but pressure does not build

Before attributing the problem to the compressor, compare compressor-side pressure with receiver and point-of-use readings using installed indicators. Consider, depending on design, load/unload control state, air leaks, inlet restriction, valve performance, and downstream demand. The correct OEM manual determines the sequence and allowable checks.

For reciprocating models, Ingersoll Rand publishes model-specific manuals that can include troubleshooting tables for the pump, check valve, pressure switch, and unloading behavior. For rotary-screw models, use the manual for the exact series and controller.

## Safety boundary

Compressed-air receivers and lines store energy. Stop and isolate the machine according to site procedure; lock/tag the electrical supply where required, prevent automatic restart, and verify pressure is safely relieved before servicing. Never loosen a fitting to check pressure. Never disable pressure-relief devices, guards, interlocks, or overload protection. Hot surfaces and unexpected automatic starts are additional hazards.

## Free source library

### Manufacturer sources — start here

1. **Ingersoll Rand Reciprocating Compressor Technical Support** — troubleshooting resources for no-start/tripped breaker, air leaks, failure to build pressure, failure to shut off, water in lines, and check-valve service:  
   https://www.ingersollrand.com/en-nam/products/air-compressors/reciprocating-air-compressors/tech-support/
2. **Ingersoll Rand Reciprocating Compressor Documentation** — select the exact model and document type before downloading:  
   https://www.ingersollrand.com/en-us/resources/knowledge-hub/reciprocating-compressor-documents/
3. **Ingersoll Rand UP5/UP6 operation and maintenance manual (PDF)** — applies only to the listed SSR UP5/UP6 models; do not assume it applies to a different compressor:  
   https://azure-na-assets.contentstack.com/v3/assets/blta3c1d56420975795/blt1534320ca4dffb24/67b74e293b71a869c92d418d/IRP-En-Manual-oil-lubricated-compressor-up5-4-up6-5-operation-maintenance.pdf
4. **Ingersoll Rand 2000/2000P reciprocating compressor owner manual (PDF)** — applies to the listed 2000/2000P two-stage models, not rotary-screw compressors:  
   https://azure-na-assets.contentstack.com/v3/assets/blta3c1d56420975795/blt46bab9f20d540b18/67b74e35af30132bc75a697f/IRP-En-Manual-Reciprocating_Air_Compressor-Operators_Manual_-_2000_&_2000P.pdf

### General references

5. **U.S. Department of Energy — Improving Compressed Air System Performance**:  
   https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/compressed_air_sourcebook.pdf
6. **Ingersoll Rand — Master Technician on low air pressure and system-side leaks**:  
   https://www.ingersollrand.com/en-us/resources/knowledge-hub/articles/master-tech-ds/

## Case report template

- Asset / exact model:
- Compressor type and controller:
- Symptom in the user's words:
- Exact alarm text/code:
- What runs / what does not:
- Pressure readings (value + unit + location + time):
- Recent changes / maintenance:
- Safe checks completed and results:
- Hypotheses still plausible:
- Next safe discriminating check:
- Required qualification / isolation:
- Final cause (only after evidence) and repair verification:
