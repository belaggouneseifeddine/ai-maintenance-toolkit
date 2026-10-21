# Industrial Fault Knowledge Base

**Status:** Initial source-backed reference for the Maintenance AI Toolkit prototype  
**Language:** Arabic-first  
**Scope:** Common symptoms in pumps, electric motors, compressed-air systems, hydraulic systems, actuated valves, variable-frequency drives, instrumentation, and conveyors.

## How to use this reference

This is a troubleshooting aid, not a machine-specific service procedure or confirmed diagnosis. A symptom can have multiple causes. Use the equipment's exact manufacturer manual, approved site procedures, operating envelope, drawings, and competent-person authorization as the controlling references.

For each event, capture:
- Asset tag, manufacturer/model, and operating context.
- Symptom, alarm code exactly as displayed, time, and recent changes.
- Actual measurements with units, measurement point, and instrument/source.
- What was checked, the result, and the next authorized action.

Do not fill unknown values with guesses. Do not use these notes to choose setpoints, torque values, protection thresholds, wire connections, or pressure limits.

## Stop-work triggers

Stop, make the area safe, and escalate under site procedure if there is smoke, fire, sparks, burning smell, severe or sudden vibration, uncontrolled motion, exposed live parts, a suspected pressure-boundary failure, a major leak, or an unknown alarm associated with risk.

Before opening, touching, disconnecting, or servicing equipment, apply the site's energy-control procedure, including lockout/tagout (LOTO) where required. Identify and control electrical, mechanical, hydraulic, pneumatic, thermal, gravity, and other stored energy. Verify the safe state. Never bypass guards, interlocks, trips, or pressure-relief devices.

**Hydraulic injection warning:** Never use a hand to search for a hydraulic leak. A high-pressure fluid jet can penetrate skin and cause a serious injury even when the wound appears small. Treat suspected injection as an urgent medical emergency and tell clinicians that high-pressure hydraulic fluid injection is suspected.

## Fault patterns

### 1. Centrifugal and other process pumps

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Low or no flow | Low source level, incorrect valve lineup, suction restriction, air ingress, blocked strainer, worn internal parts, operation outside the intended operating range | Review tank level and approved indicators; compare suction/discharge pressure and flow readings with baseline and the correct pump curve; review recent maintenance and valve-position indications | Open a pressurized line, run a pump dry, or alter valve positions without authorization |
| Crackling / gravel-like noise with poor performance | Cavitation or other hydraulic instability; mechanical damage can produce similar symptoms | Record flow, pressure, level, and operating condition from approved instruments; compare with the manufacturer’s limits and system curve; escalate persistent noise | Treat sound alone as proof of cavitation or continue running when damaging vibration is suspected |
| Excessive vibration or bearing/seal problems | Misalignment, unbalance, bearing wear, loose foundation, pipe strain, operation away from intended range, cavitation | Review vibration/trend data and maintenance history; inspect only after safe isolation; have alignment and rotating-component checks done by qualified personnel | Reach near rotating parts or remove guards while running |
| Leakage | Seal, gasket, flange, pipe, or casing defect; pressure/temperature or compatibility issue | Identify fluid and leak location from a safe distance; contain according to site spill procedure; isolate and depressurize before intervention | Tighten or dismantle a pressurized joint |

DOE's pumping-system sourcebook describes cavitation, poor system performance, pump selection/operating range, and system-level causes. These are candidate explanations, not proof of the cause on a specific asset.

### 2. Electric motors and driven equipment

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Motor does not start | Supply or control issue, overload/protection, interlock, command missing, mechanical load problem | Record the exact drive/protection alarm; review control-system status and authorized indicators; ask a qualified electrician to perform electrical tests after the required isolation and verification | Repeatedly reset protection, bypass an interlock, or open an energized panel |
| Overheating | Excessive load, poor ventilation, contamination, voltage/current imbalance, bearing friction, incorrect application | Compare current/temperature trends with nameplate and manufacturer data; inspect external cooling passages only under the approved safe condition | Invent a permissible temperature/current threshold or change protection settings |
| Vibration or unusual noise | Bearing damage, coupling/alignment issue, imbalance, looseness, foundation problems, resonance, rubbing | Stop if vibration/noise is sudden or severe; review trend data; inspect mechanical components after isolation and with stored energy controlled | Continue operation solely to “see if it clears” when a serious fault is suspected |
| Repeated trips | Overload, supply/drive fault, process jam, motor/cable fault, protection or control issue | Preserve fault history and operating conditions; investigate the initiating cause with the authorized electrical/mechanical team | Defeat overload, thermal, earth-fault, or other protective functions |

ABB's motor troubleshooting documentation lists multiple possible causes for overheating, vibration, and abnormal noise. The exact motor design and manufacturer manual determine the applicable checks and repair procedure.

### 3. Compressors and compressed-air networks

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Low pressure at a point of use | Distribution pressure drop, leaks, clogged filter, demand exceeding supply, dryer/separator/trap issue, control problem | Compare compressor discharge and point-of-use pressure trends using installed gauges/sensors; review leaks, filters, dryers, drains, and demand history | Assume the compressor itself is faulty without checking distribution and demand |
| Frequent loading/unloading or unusual run time | Leaks, demand variation, control settings, storage or sequencing issue, maintenance condition | Review trend and operating logs; inspect accessible areas for leaks using the site's approved method; compare maintenance against the exact manual | Change pressure settings or relief-valve settings without authorization |
| High temperature or unusual noise | Cooling restriction, lubrication issue, load or internal fault | Record alarms and temperatures; check externally accessible cooling/maintenance indicators against the manual; stop and escalate for smoke, severe vibration, or abnormal mechanical noise | Open a receiver, separator, or line until it is isolated, depressurized, and verified safe |
| Persistent condensate / poor air quality | Drain trap malfunction, dryer or separator issue, contamination, maintenance lapse | Review dew-point/quality indicators where installed and inspect drain/maintenance history under the approved procedure | Disconnect pressurized equipment or ignore condensate carryover |

The U.S. Department of Energy compressed-air sourcebook discusses leaks, pressure drop, filters, dryers, condensate traps, controls, and preventive maintenance. Maintenance intervals and lubricant/pressure specifications must come from the exact compressor manual, not this generic summary.

### 4. Hydraulic power systems

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Slow movement or low force | Low fluid level, fluid temperature/viscosity issue, filter restriction, pump wear, leakage, valve or actuator issue, load problem | Review reservoir level, temperature, approved pressure/flow indicators, filter history, and cycle-time trends | Adjust relief valves or increase pressure without the manufacturer's specification and authorization |
| Oil leak or suspected hose failure | Hose, fitting, seal, cylinder, or connection defect; retained or trapped pressure | Keep clear of the suspected jet; stop and isolate the system; follow the specific depressurization procedure and verify zero energy before touching components | Search with fingers, loosen a fitting to “check pressure,” or assume one isolated section means the whole circuit is depressurized |
| Unexpected actuator movement | Stored pressure, gravity/load, control fault, valve leakage, failed restraint | Keep clear of crush zones; stop and secure the equipment according to site procedure; use approved supports and energy-control steps | Work beneath a raised load or rely only on a control command to prevent motion |

OSHA incident reports document serious injuries caused by high-pressure hydraulic-fluid injection. These incidents support treating even pinhole leaks and unexpected fluid release as high-risk conditions.

### 5. Actuated valves

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Valve does not move | Missing command, interlock condition, actuator power/air/hydraulic supply issue, positioner or feedback issue, mechanical sticking | Review command, alarm, and position feedback from the control system; compare supply indications with the actuator manual | Force the valve or bypass interlocks to obtain movement |
| Incorrect or unstable position | Feedback/calibration issue, supply instability, process forces, actuator/positioner fault | Record commanded versus actual position and alarm history; request qualified instrumentation/controls review | Change calibration or control parameters without an approved procedure |
| Leakage or abnormal noise | Seal/packing/body issue, flow conditions, cavitation or mechanical issue depending on service | Identify service fluid and pressure hazard from a safe distance; use approved isolation and depressurization before work | Dismantle a valve under pressure or assume every noise has the same cause |

### 6. Variable-frequency drives (VFDs) and motor controls

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Drive trips or shows an alarm | Overload, supply disturbance, motor/cable fault, cooling issue, configuration or control condition | Record the exact code, drive model, operating state, load context, and fault history; compare with the exact manufacturer's manual | Guess the meaning of a code, repeatedly reset the drive, or bypass a protective function |
| Motor does not respond to a command | Wrong command source, missing permissive/interlock, drive not ready, control/network issue | Review status, selected command source, permissives, and alarm history from the authorized interface | Bypass interlocks or open an energized drive cabinet |
| Drive/motor overheating | Load, cooling/ventilation, installation conditions, motor issue, parameter mismatch | Review available temperature/load trends and external ventilation; compare against the specific manual and nameplate | Change current limits, switching/frequency settings, or protection parameters without approved engineering review |
| Unusual noise or vibration | Driven-machine issue, bearing/coupling problem, electrical/drive-related condition | Stop for sudden/severe symptoms; review trends and involve qualified electrical/mechanical personnel | Assume the VFD alone is the cause or work near rotating parts |

### 7. Sensors and instrumentation

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Implausible, frozen, or unstable reading | Sensor fault, process condition, wiring/connection issue, scaling/unit mismatch, calibration drift, communication issue | Record value, unit, timestamp, measurement point, and alarm; compare with an independent approved indication or historical trend where safe | Treat a single reading as proof or use an unverified value for a safety-critical decision |
| Lost signal or out-of-range alarm | Sensor/power/loop issue, connector or cable fault, I/O channel or network issue, process outside range | Review the control-system channel/status and event history; ask qualified instrumentation staff to test the circuit under approved isolation procedures | Bridge terminals, inject signals, or open live panels without authorization |
| Difference between command and feedback | Feedback sensor, scaling, actuator/mechanical issue, communication delay | Compare command, feedback, alarm history, and process state; verify units and approved calibration records | Change scaling/calibration or suppress the alarm without the correct procedure |

### 8. Conveyors and belt systems

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Conveyor will not start | Emergency-stop circuit, guard/interlock, missing permissive, motor/drive fault, jam or control issue | Review the control-system status and fault history; confirm guards and emergency-stop status through approved checks | Bypass a guard, interlock, or emergency stop |
| Belt tracking or slipping problem | Alignment, tension, pulley/roller condition, loading, contamination, mechanical wear | Stop, isolate, and secure the system before inspection; follow the specific manufacturer's tracking/tension procedure | Adjust or touch a moving belt or reach into nip/pinch points |
| Abnormal bearing noise or heat | Bearing wear, misalignment, lubrication or loading issue | Stop for sudden/severe changes; compare approved trend data and inspect after isolation | Continue running to see whether a serious noise disappears |

### 9. Pneumatic systems and air preparation

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Actuator is slow or weak | Low/unstable supply pressure, restricted filter, regulator issue, valve/actuator wear, exhaust restriction, load change | Compare approved supply-pressure and cycle-time indicators with baseline; review filter and condensate maintenance records | Disconnect a pressurized tube or adjust regulator settings without authorization |
| Air leak or continuous exhaust | Tube/fitting leak, valve seal, actuator seal, exhaust silencer or control-valve issue | Locate from a safe distance using the site's approved leak-detection method; isolate and exhaust stored pressure before repair | Use fingers to locate a leak or remove a fitting under pressure |
| Water or oil carryover | Drain, separator, filter, or dryer issue; upstream contamination | Review air-quality indicators and service history; identify whether the point is upstream or downstream of treatment | Assume every moisture issue is a failed compressor |

### 10. Gearboxes, couplings, and rotating assemblies

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| New noise or vibration | Bearing damage, misalignment, looseness, gear wear, lubrication issue, process/load change | Record load, temperature, vibration trend, and onset; stop for sudden/severe changes; inspect only after isolation | Remove guards or touch rotating equipment while running |
| High temperature or oil leak | Incorrect/low lubricant, seal damage, overload, ventilation issue, misalignment | Compare with the exact manual and historical trend; inspect externally after shutdown and safe isolation | Guess lubricant grade or quantity, or open a hot gearbox without the specified procedure |
| Repeated mechanical trips | Jam, overload, driven-machine fault, coupling or gearbox damage | Preserve alarm sequence and load conditions; inspect the whole drive train rather than assuming the motor is the cause | Repeatedly reset or restart a suspected jammed drive |

### 11. Bearings and lubrication systems

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Bearing temperature rising | Lubrication problem, overload, contamination, misalignment, installation or bearing damage | Review trend, lubrication records, load and vibration together; use approved temperature data | Touch a hot bearing or add lubricant without the correct type/quantity and procedure |
| Abnormal vibration | Bearing wear, imbalance, looseness, resonance, coupling/alignment issue, process disturbance | Compare trend and operating conditions; inspect after isolation and control of stored energy | Treat vibration alone as proof that the bearing must be replaced |
| Lubricant contamination | Water/dust ingress, seal failure, incorrect storage or handling, degradation | Review sample/test results and service history; follow the equipment's contamination-control procedure | Mix lubricant types without manufacturer approval |

### 12. Electrical distribution, control panels, PLC and HMI

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Machine does not start | Missing command/permissive, emergency-stop or guard status, control supply, overload/drive trip, process condition | Review authorized HMI/PLC status, alarm history, and sequence-of-events log | Bypass safety circuits, force outputs, bridge terminals, or open an energized panel |
| Intermittent fault | Loose connection, unstable supply, sensor/communication issue, environmental condition, program/sequence issue | Record exact timestamps, machine state, alarms and recent changes; compare logs across occurrences | Change PLC logic or replace parts without evidence and change-control approval |
| Sensor value disagrees with process | Sensor, wiring, scaling, I/O channel, communication or actual process issue | Confirm units, tag, range and timestamp; compare with an independent approved indication | Use an unverified value for a safety-critical decision or suppress an alarm |

### 13. Thermal systems, heat exchangers and cooling

| Symptom | Possible causes to investigate | Safe, evidence-led checks | Do not |
|---|---|---|---|
| Poor heating or cooling | Low/uneven flow, fouling, air binding, control-valve issue, sensor error, load change | Compare inlet/outlet temperatures, flow and pressure trends with the operating baseline and manual | Open hot or pressurized circuits before isolation, cooling and pressure verification |
| High pressure or temperature | Blocked flow, control failure, excess load, sensor error, relief/protection issue | Verify the indication through approved instruments; treat a confirmed or suspected limit exceedance as a stop/escalation condition | Adjust or isolate relief devices, or invent acceptable limits |
| Repeated trips | Flow/temperature condition, control/interlock issue, fan/pump failure, fouling | Capture trip code and preceding trends; inspect linked equipment and sequence of events | Reset repeatedly without identifying the initiating condition |

## Diagnostic workflow for the app

1. **Triage:** Check immediate hazards and decide whether to stop/escalate.
2. **Capture facts:** Asset, symptom, alarm, time, context, measurements, units, and source.
3. **Compare with baseline:** Use approved trends, manufacturer curves, nameplate data, and operating limits.
4. **Rank hypotheses:** Present several plausible causes with evidence needed to distinguish them; do not state a cause as certain from a symptom alone.
5. **Choose safe next checks:** Start with logs and external indicators. State when a qualified person, isolation, or permit is required.
6. **Record outcome:** What was checked, what was observed, and whether the issue remains.
7. **Escalate:** Stop when evidence is insufficient, the fault is safety-critical, or the required procedure/manual is unavailable.

## Sources

1. **U.S. Department of Energy / Hydraulic Institute**, *Improving Pumping System Performance: A Sourcebook for Industry* (PDF): https://www.energy.gov/sites/prod/files/2014/05/f16/pump.pdf
2. **ABB**, *Section 3 — Maintenance & Troubleshooting* (motor troubleshooting table, PDF): https://library.e.abb.com/public/c553f9f2138646fbbe2321456a02de51/MN404.pdf
3. **U.S. Department of Energy**, *Improving Compressed Air System Performance: A Sourcebook for Industry* (PDF): https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/compressed_air_sourcebook.pdf
4. **U.S. Occupational Safety and Health Administration (OSHA)**, hydraulic fluid injection injury incident report: https://www.osha.gov/ords/imis/accidentsearch.accident_detail?id=170764609
5. **OSHA**, additional high-pressure hydraulic-fluid injection incident (2019): https://www.osha.gov/ords/imis/accident_detail?id=1434300.015

## Equipment-specific reference policy

When a fault depends on a particular make or model, capture the complete nameplate and controller details, exact alarm text, firmware/manual revision when available, and operating context. Then consult the matching manufacturer's documentation. Do not transfer alarm meanings, setpoints, maintenance intervals, or procedures between different models or equipment designs.

## Electric motor and VFD model-specific follow-up

For more detailed symptom-led checks, see the [Electric Motor & Drive Troubleshooting Casebook](./ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md). It covers motor no-start, overload trips, VFD alarms, overheating/vibration, and contactor chatter with free manufacturer references. Match all fault codes and procedures to the installed model and manual revision.

## Limitations and review policy

- This knowledge base summarizes general references; it is not a substitute for equipment-specific manuals, drawings, risk assessments, permits, or local regulations.
- Do not use the entries as repair authorization, a complete risk assessment, or a substitute for competence and site training.
- Keep references linked to the claims they support; add model-specific instructions only after reviewing the correct manufacturer documentation.
- Revalidate source URLs and technical content before using this material for operational decisions.
