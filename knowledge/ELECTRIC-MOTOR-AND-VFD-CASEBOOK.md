# Electric Motor & Drive Troubleshooting Casebook

**Status:** Practical, source-linked reference; not a machine-specific repair procedure.  
**Language:** Arabic-first, with common English technical terms.  
**Scope:** Three-phase low-voltage motors, contactors, thermal overload relays, motor protection, and variable-frequency drives (VFDs).

## Rules before diagnosis

1. Record the asset tag, motor nameplate data, starter/drive make and model, exact alarm text/code, when the fault occurs, and recent changes.
2. Separate what is observed from what is inferred. “Motor does not start” is a symptom, not a root cause.
3. Use the exact manufacturer's manual, wiring diagram, protection settings, and site procedure. The references below are general sources; do not transfer a fault-code meaning from one drive family to another.
4. Electrical measurements inside panels and insulation tests are for authorized, competent personnel using the approved isolation and test procedure.
5. Apply lockout/tagout (LOTO) as required, verify absence of voltage with an approved tester, and control stored energy. A VFD DC bus can remain charged after input power is isolated; follow the exact manual's discharge time and verification procedure.
6. Never bridge an overload, defeat an interlock, increase a trip setting to “stop nuisance trips,” or repeatedly reset a drive without finding the cause.

## Intake questions: ask these first

- Is the motor completely silent, humming, attempting to start, or running but not driving the machine?
- Is the starter a direct-on-line (DOL), star-delta, soft starter, or VFD?
- What exactly is shown on the overload relay or VFD display? Photograph the display if possible.
- Does the fault occur immediately at start, after acceleration, only under load, or after a period of operation?
- Did the motor, load, cable, drive parameters, supply, or mechanical process change recently?
- Are there recorded line currents, line voltages, speed/frequency, process load, and temperatures? Record units, measurement point, and operating condition.
- Does the driven equipment turn freely according to the approved isolation procedure, or is there evidence of a jam? Never test this by reaching into moving equipment.

## Case 1 — Motor does not start

**Possible branches (not a diagnosis):**
- No control command or permissive: stop circuit, interlock, emergency-stop circuit, PLC command, or control supply.
- Starter does not pull in: control circuit, coil, wiring, or protective trip.
- Starter pulls in but motor does not turn: supply phase problem, incorrect/loose connection, winding fault, mechanical jam, or a load requiring more starting torque.
- VFD does not run: missing run command/reference, active interlock, inhibit/coast input, active trip, or configuration/communication issue.

**Discriminating checks**
1. Record whether the contactor/drive indicates a run command and whether any trip is active; use status indicators and HMI records first.
2. Check the applicable schematic and trip history. Do not assume a control problem because the motor is silent.
3. An authorized electrician can verify supply/control voltage and phase condition using the site's safe test method.
4. If the starter is energized but the shaft remains stationary, stop repeated start attempts. Investigate overload, mechanical binding, and motor/circuit condition under isolation.
5. Compare the nameplate with the actual supply and starter/drive configuration before changing settings or wiring.

**Stop/escalate:** repeated protective trips, burning smell, smoke, visible damage, suspected winding/cable fault, or a jam that cannot be safely isolated.

## Case 2 — Overload relay trips

An overload trip indicates the protection detected a condition according to its design/settings; it does **not** prove the relay itself is faulty.

**Potential causes to distinguish**
- Actual mechanical overload, jam, bearing/seal problem, or process load increase.
- Phase loss/imbalance, poor connection, supply issue, or motor/cable fault.
- Incorrect overload selection or setting relative to the motor nameplate and starter design.
- Excessive starts, long acceleration, cooling obstruction, high ambient temperature, or a duty cycle outside the design.
- A defective relay is possible, but should not be the first assumption.

**Diagnostic sequence**
1. Record trip indication, time to trip, motor nameplate current, relay model/setting, and load/process condition.
2. Compare all three phase currents under a controlled, authorized operating test with the approved motor data and site limits. Do not invent a universal imbalance threshold.
3. Check mechanical load and ventilation after proper isolation.
4. Check the coordination/design documentation for relay type, setting, and starter arrangement.
5. Replace a component only after evidence supports the decision; verify the cause has been corrected before a single controlled restart.

**Do not:** increase the overload setting just to keep the machine running, repeatedly reset it, or bypass it.

## Case 3 — VFD trips or motor will not run from the drive

**Capture first:** exact drive model, full alarm code and text, event history, commanded frequency/reference, output frequency if displayed, run command/status, load state, and what changed immediately before the fault.

| Observed condition | Investigation direction | Important limit |
|---|---|---|
| No display | Supply/isolation, control power, display/keypad, drive status | Do not open energized equipment; use the model-specific manual |
| Run command absent | PLC/HMI command, local/remote mode, permissives, interlocks, digital inputs, communication | Confirm the control architecture and wiring diagram |
| Run command present but output frequency stays at zero | Inhibit/coast/interlock, reference source, enable logic, configuration | Do not alter parameters without recording the original values and authorization |
| Overcurrent during start/acceleration | Mechanical load/jam, acceleration demand, motor/cable fault, incorrect motor/drive data | Do not assume ramp time is the cause or lengthen it blindly |
| Earth/ground fault | Motor cable, motor insulation, moisture, connection or drive-related fault | Qualified isolation and prescribed tests required |
| DC undervoltage / mains phase loss | Supply condition, upstream protection, connections, phase availability | Verify against the exact drive manual and approved measurement procedure |
| Overtemperature | Drive cooling path/fan, ambient conditions, load/current, switching or installation conditions | Do not defeat thermal protection |
| Motor runs but process output is low | Mechanical/process issue, speed/reference limit, feedback or sensor issue | Separate motor speed from process performance |

**VFD-specific caution:** alarm codes and reset rules vary by manufacturer, model, firmware, and configuration. Some faults are trip-locked. Correct the underlying cause first and follow the model-specific manual; repeated resets or automatic restart can create unexpected movement.

## Case 4 — Motor runs hot, noisy, or vibrates

Record the duration before the symptom, load, current on each phase if available, ambient/cooling conditions, noise character, vibration location, and any recent maintenance.

Potential investigation branches include process/mechanical overload, obstructed cooling, bearing/lubrication issue, alignment or mounting, voltage/phase imbalance, unsuitable operating speed, or motor/drive incompatibility. Use the motor and bearing manufacturer's procedure for vibration, temperature, lubrication, and alignment limits; there are no universal limits suitable for every motor.

Stop and escalate for sudden/severe vibration, smoke, burning smell, abnormal impact noise, or rapidly rising temperature. Do not touch a running motor to estimate temperature.

## Case 5 — Contactor chatters or drops out

Possible branches include unstable control supply, loose/incorrect control wiring, wrong coil voltage/frequency, poor control contact, mechanical obstruction in the contactor, or an interlock/control command repeatedly changing.

Capture the coil nameplate, control schematic, status/PLC event history, and whether the chatter begins at energization or during operation. An authorized technician should isolate and inspect components and verify control voltage against the manufacturer's specifications. Do not hold a contactor closed by hand or bypass control protection.

## Minimum fault report

- Asset / location:
- Motor manufacturer and model:
- Nameplate voltage, current, frequency, power, connection, and speed:
- Starter type and model (DOL / star-delta / soft starter / VFD):
- Exact alarm text/code (attach photo if permitted):
- Symptom and timing:
- Process load and recent changes:
- Measurements (value, unit, point, operating state, instrument):
- Checks performed and results:
- Hypotheses still open:
- Next safe, authorized check:
- Confirmed cause and post-repair verification:

## Free manufacturer references

1. **ABB — IEC low-voltage motor manuals** (installation, operation, maintenance, safety; available in multiple languages including Arabic and English):  
   https://www.abb.com/global/en/areas/motion/motors-generators/low-voltage-motors/iec-low-voltage-motors/iec-lv-manuals
2. **ABB — Low-voltage motor installation, operation, maintenance and safety manual (PDF):**  
   https://library.e.abb.com/public/29b6ff8abd8e47bf8bc6b579165100d5/3GZF500730-85%20Rev%20H%20ML_05_LQP.pdf
3. **Schneider Electric — Easy TeSys Motor Protection Coordination Guide (PDF/download page):**  
   https://www.se.com/in/en/download/document/LVED250601EN/
4. **Danfoss — VLT HVAC Drive Operating Instructions, troubleshooting and alarms (PDF):**  
   https://assets.danfoss.com/documents/275829/AQ267037536117en-000801.pdf
5. **Danfoss — Drive troubleshooting support and documentation:**  
   https://www.danfoss.com/en-us/service-and-support/fix-and-troubleshooting/drives-support/
6. **Danfoss — VLT/VACON troubleshooting videos** (e.g. motor will not run, earth fault, phase loss, no display):  
   https://www.danfoss.com/en-us/service-and-support/fix-and-troubleshooting/drives-support/drive-videos/

These references support general troubleshooting principles. Always select the document for the actual installed model and revision.

## Review policy

Add a confirmed root cause only when supported by measurements, inspection, and post-repair verification. Keep “suspected,” “not checked,” and “confirmed” distinct. Record false leads so future troubleshooting can eliminate them faster.
