# Universal Industrial Fault Atlas — AR / FR / EN

> **Status:** General triage reference written for this project. Not a manufacturer service manual, not a safety-rated procedure, and not proof of a confirmed root cause. Match model-specific parameters, wiring, torque, pressure, current, speed and tolerances to the exact approved manual and site procedure.

## Mandatory safety boundary

Before intervention, identify and control every hazardous energy source: electrical, stored electrical, hydraulic, pneumatic, thermal, gravity, rotating, spring, chemical and process energy. Follow the site's lockout/tagout procedure, verify isolation and zero energy, and use only approved methods to discharge stored energy. Do not bypass safety relays, guards, interlocks, pressure relief devices or trips. Never locate a hydraulic leak with a hand, loosen a pressurized fitting, open energized enclosures, or repeatedly reset a trip. If the hazard or isolation state is uncertain, stop and escalate.

This atlas prioritizes safe observations, existing alarm/history data, and measurements already collected by an authorized qualified person. It does not authorize hazardous work.

## How to use this atlas

1. Describe the exact symptom, not just “machine broken.”
2. Identify the machine function and affected subsystem(s). One symptom may span electrical, electronic, mechanical, hydraulic, pneumatic and control layers.
3. Record exact alarm text/code, machine make/model, operating state, recent maintenance/change, when the issue began, and any existing readings.
4. Rank hypotheses, then select the next check that best separates them. State what each possible result would mean.
5. Cite evidence and distinguish verified facts, general engineering possibilities and unknowns.
6. Confirm the root cause only after a technician reports verification.

## Cross-domain symptom matrix

| Symptom | Possible domains to distinguish | Safe first evidence | Do not assume |
|---|---|---|---|
| Machine will not start | supply/protection, control circuit, safety chain, PLC permissives, drive fault, motor or mechanical jam | HMI alarms, event log, status LEDs viewed without opening hazardous enclosures, operator sequence, recent changes | That the motor or PLC is defective |
| Motor trips or overheats | load/jam, bearing/friction, phase/supply issue, overload setting, drive parameters, cooling, frequent starts | Exact trip code, existing current/trend data, duty cycle, load change, motor/drive nameplate | A universal current limit or a failed motor |
| Motor runs but machine output is low | coupling/belt/gear, process load, pump/fan restriction, hydraulic/pneumatic loss, drive speed reference, sensor feedback | Command versus displayed speed, process state, existing pressure/flow readings, visible coupling/belt condition from a safe distance | That increasing speed/pressure is safe |
| Unexpected stop or intermittent fault | loose connection, sensor/connector, thermal drift, supply dips, communications, vibration, safety interlock | Timestamped alarms, trends, event sequence, environmental/recent maintenance history | That resetting repeatedly is a repair |
| PLC/HMI/SCADA shows bad or frozen values | sensor/transmitter, loop power/wiring, scaling, I/O module, network, PLC logic, HMI tag, historian/update rate | Tag quality/timestamp, known-good comparison, diagnostics, last-change log, protocol status | That a displayed value equals physical reality |
| Pressure/flow low | pump/compressor performance, blockage/filter, leak, valve position, bypass, suction conditions, actuator load, sensor error | Existing gauges/trends, filter indicator, equipment state, process demand, alarms | A universal setpoint or safe-to-open line |
| Cylinder/actuator moves slowly or not at all | supply pressure/flow, directional valve, actuator seal/friction, contamination, exhaust restriction, command/interlock, load binding | Command/status, existing pressure/flow readings, cycle timing history, leak indicators | That pressure should simply be increased |
| Excess vibration/noise | imbalance, misalignment, looseness, bearing damage, resonance, cavitation, gear/belt wear, process variation | Trend versus baseline, speed/load correlation, maintenance history, acoustic change from a safe position | A bearing diagnosis from sound alone |
| Repeated sensor faults | target/alignment, contamination, cable/connector, supply, EMI, incorrect sensor type, scaling/PLC logic | Sensor type/nameplate, diagnostic LED, fault timing, existing PLC I/O status, wiring diagram | A pinout or voltage without exact part data |
| Air compressor alarm/low delivery | intake restriction, separator/filter, cooling, condensate, demand/leak, drive/motor, pressure sensor/control | Exact model and alarm, service history, existing pressure/temperature trends, external indicator state | A model-specific alarm meaning without manual |
| Hydraulic system hot/noisy | restriction, low/incorrect fluid, aeration, contamination, relief/bypass flow, cooling, load | Fluid/service history, existing temperature/pressure trend, filter indicator, visible external leaks from safe distance | To touch a leak, open a line, or change relief settings |
| Repeated fuse/breaker/protection trip | short/ground fault, overload, damaged cable, drive fault, incorrect coordination, process jam | Trip chronology, exact device/model, drive fault log, approved inspection record | To fit a larger fuse or defeat protection |

## Electrical power and motors

**Common branches:** supply interruption/imbalance; protective device operation; contactor/relay/control supply issue; overload or stalled load; motor insulation/winding/bearing problem; incorrect command or permissive; VFD/servo trip; mechanical binding.

**Evidence that improves discrimination:** exact protective-device/drive code; motor and drive nameplates; whether the fault occurs at start, acceleration, steady state or stop; existing current and speed trends; load/process changes; last maintenance performed.

**Safe triage:** review HMI/drive diagnostics and maintenance records first. Visual inspection only from a safe position. Electrical testing, opening panels and insulation tests require qualified authorized personnel, proper isolation and approved instruments/procedures. Never prescribe terminal numbers or parameter values without the exact model documentation.

## Electronics, sensors and instrumentation

**Common branches:** failed or dirty sensing element; misalignment; broken/shorted cable; connector corrosion; missing loop/sensor supply; signal interference; wrong sensor type/range; analog scaling mismatch; I/O channel/module issue; PLC logic or tag mapping; firmware/configuration change.

**Evidence:** sensor part number and wiring diagram; signal type (e.g. 4–20 mA, 0–10 V, PNP/NPN) only when known; raw PLC input versus scaled HMI value; diagnostic quality bits; timestamp; environmental conditions; recent replacement/configuration changes.

Do not infer pinout, supply voltage, polarity, safe isolation method or expected signal values from sensor appearance. Verify against the exact sensor and machine drawing.

## PLC, HMI, SCADA, drives and communications

**Common branches:** unmet permissive/interlock; mode/sequence state; I/O mismatch; sensor fault; drive fault; communications timeout; incorrect address/tag/scaling; stale cache or historian gap; configuration/firmware mismatch; network/power issue.

**Evidence:** exact controller/drive model and firmware where available; alarm/event sequence; tag quality and timestamps; controller diagnostics; network status from authorized tools; recent logic, project or network changes.

Read-only diagnostics and approved offline backups are preferred. Do not connect to, scan, write to, download to, or change a production controller without explicit site authorization, change control, a backup and an approved plan. Never propose changing safety PLC logic or bypassing interlocks as troubleshooting.

## Hydraulics

**Common branches:** insufficient supply/flow; clogged suction/return/filter; fluid level/condition/viscosity issue; aeration/cavitation; internal leakage/worn pump; valve stuck or incorrect command; actuator seal/binding; relief/bypass behavior; sensor error; contamination; cooling issue.

**Evidence:** equipment diagram and component ratings; fluid/service/filter history; existing pressure/flow/temperature readings and conditions; pump sound/trend; actuator cycle history; external leakage observations from a safe position.

Never touch a suspected leak, loosen fittings, remove guards, or open a pressurized circuit. Accumulators and trapped pressure can retain dangerous energy after shutdown. Pressure settings and test points must come from the exact manual/site procedure.

## Pneumatics and compressed air

**Common branches:** low supply, leaks, blocked filter, regulator or directional valve issue, silencer/exhaust restriction, cylinder seal/friction, moisture/contamination, incorrect command, load binding, compressor/dryer capacity issue.

**Evidence:** existing supply/point-of-use pressure readings; pressure-drop history; filter indicators; compressor/dryer alarms; cycle time; leak survey by approved method; valve/actuator part number.

Isolate and exhaust stored air using the approved procedure before intervention; verify zero pressure. Never disconnect a pressurized tube or assume an actuator is safe because the compressor has stopped.

## Mechanical transmission and rotating equipment

**Common branches:** misalignment; imbalance; looseness; bearing or lubrication issue; belt/chain tension or wear; gear damage; coupling damage; shaft deformation; brake drag; thermal expansion; resonance; process overload.

**Evidence:** speed/load relationship; trend versus known baseline; lubrication and alignment history; temperature/vibration readings already collected using approved equipment; recent coupling/belt/bearing work; visible external condition while stopped and isolated.

Do not diagnose a bearing from one symptom alone. Stop-work indicators include rapid temperature rise, severe new noise, smoke, guard damage, looseness, or uncontrolled movement.

## Pumps, fans and compressors

**Common branches:** suction/discharge restriction; air ingress or cavitation; blocked filter/strainer; incorrect rotation (verify from approved records/procedure, not by unsafe trial); wear or internal leakage; coupling/bearing issue; process demand change; relief/bypass; control/drive issue; instrumentation error.

**Evidence:** exact pump/compressor type and model; suction/discharge conditions; flow/pressure trends; vibration/noise trend; operating point versus approved curve/manual; filter/service history; alarm code.

Do not apply a generic pressure, flow, vibration or temperature threshold across models. Compressor alarm meanings and service steps are model/firmware specific.

## Preventive and predictive maintenance

Use condition trends rather than a single number: vibration, temperature, current, pressure, flow, cycle time, starts, alarms, lubrication intervals, filter differential indicators and failure history. Compare against the same machine's baseline, approved OEM limits and operating conditions. Anomaly detection signals a need for investigation; it does not prove a fault or remaining useful life. Never present predictive estimates as certainty without validated data and documented model performance.

## Open-source software and datasets: intended use

The projects below are references for building the toolkit's software, simulation, protocol testing or predictive-maintenance workflow. They are **not** repair manuals and their claims must not be used as evidence for a particular physical fault.

- Open Industry Project — PLC/machine simulation; project site states MIT: https://www.openindustryproject.org/
- OpenPMX — predictive-maintenance platform reference; inspect current license, code quality, dependencies and reproducibility: https://github.com/SahDhirendra/openpmx
- OpenWebHMI — SCADA/HMI reference; core AGPL-3.0-only and protocol packages MPL-2.0 according to project license notes: https://openwebhmi.com/about/
- OSOlogic — open automation platform; licenses differ by component, including AGPL core and Apache-2.0 SDK/schema: https://github.com/OSOlogic/platform
- Rapid SCADA — industrial automation/SCADA reference; documentation states Apache-2.0: https://rapidscada.net/docs/en/latest/software-overview/introduction
- SCADA-LTS — open-source SCADA project; repository describes GPL-2.0: https://github.com/SCADA-LTS/Scada-LTS
- AI_MaintenanceAgent — multimodal maintenance-agent design reference; MIT license stated by repository, but small project and code should be audited before adoption: https://github.com/dogaece-koca/AI_MaintenanceAgent

Do not clone or incorporate code until the exact repository revision, license file, per-file notices, dependency licenses, security posture, project activity and fit are checked. Publicly visible code is not automatically reusable. Do not ingest manuals or dataset text unless the specific license permits the intended use and redistribution/processing.

## Required evidence labels in every diagnosis

- **Observed:** explicitly provided machine data, alarm, photo or measurement.
- **Source-backed:** supported by a cited eligible source, applicable model/revision where relevant.
- **Hypothesis:** plausible explanation requiring a discriminating check.
- **Unknown:** missing or contradictory evidence.
- **Confirmed cause:** only after explicit verification evidence is supplied.

The technician should be able to open each citation. Never invent source IDs, page numbers, model-specific alarm meanings, numeric limits or citations.
