# Universal Industrial Troubleshooting — Open-Source Expansion Plan

## Product goal

Maintenance AI Toolkit must support technicians working on machines from different manufacturers and across mixed technologies. It must not assume a single factory, brand, machine family, or control platform.

The product should combine:
1. A manufacturer-neutral diagnostic workflow.
2. A searchable, traceable knowledge index.
3. Licensed open educational/technical sources and selected public repositories.
4. Manufacturer manuals as model-specific evidence when the user supplies or identifies the exact model.
5. Explicit safety gates and uncertainty reporting.

This document is a roadmap, not a claim that these integrations are already implemented.

## Coverage model

Each case should be classified across all relevant layers; real machines often combine several:

- **Electrical power:** supply, fuses, contactors, overloads, motors, grounding, insulation and protection devices.
- **Electronics and instrumentation:** power supplies, analog/digital I/O, 4–20 mA and 0–10 V loops, sensors, encoders, signal conditioning, PCBs and wiring.
- **Automation and control:** PLC, relays, safety circuits, HMI/SCADA, VFDs/servo drives, interlocks, fieldbus and industrial Ethernet.
- **Hydraulics:** pumps, reservoirs, filters, valves, cylinders, accumulators, pressure/flow/temperature, contamination and leakage.
- **Pneumatics:** compressors, air preparation, filters/regulators/lubricators, directional valves, cylinders, tubing, leakage and pressure loss.
- **Mechanical systems:** bearings, couplings, belts, chains, gears, lubrication, alignment, vibration, shafts, brakes and wear.
- **Process and utility equipment:** water pumps, centrifugal pumps, compressors, fans, conveyors, mixers and thermal equipment.
- **Cross-domain faults:** a symptom such as “motor does not start” should check mechanical blockage, power circuit, drive fault, PLC permissives, sensors and safety interlocks rather than guessing one subsystem.

## Diagnostic workflow

1. Capture the symptom in the technician's own words, language, machine function and operating context.
2. Ask for machine type, component, nameplate/model where available, alarm/fault code, recent changes and when the fault occurs.
3. Determine immediate hazards before suggesting checks. Require site procedures, isolation and verification of zero energy before intervention.
4. Separate safe observations from interventions. Never instruct bypassing guards/interlocks, defeating protection, opening pressurized systems, or probing live circuits without a qualified, approved procedure.
5. Produce a ranked differential diagnosis with evidence for/against each hypothesis, confidence, and the next discriminating check.
6. Retrieve supporting references and show their title, publisher, date/version if known, URL, license status and the specific claim they support.
7. If evidence is insufficient, ask targeted questions or escalate; do not fabricate a confirmed root cause.
8. Record the confirmed cause only when the technician supplies evidence of verification.

## Open-source project candidates

These are discovery starting points, not pre-approved content sources. Before reusing code or text, inspect the repository's current license, individual file headers, dependencies, activity, security posture and fit. A public GitHub repository is not automatically licensed for reuse. Do not copy repository code into the app merely because it is public.

| Project | Potential value | Link | Important caveat |
|---|---|---|---|
| Open Industry Project | PLC/machine simulation, IEC 61131-3 logic, test scenarios and protocol examples | https://www.openindustryproject.org/ | Describes itself as MIT-licensed; verify repository license and version before reuse. |
| OpenPMX | Predictive-maintenance workflow ideas, condition monitoring, anomaly detection and maintenance records | https://github.com/SahDhirendra/openpmx | Inspect repository license, dependencies and tests before reuse; treat performance claims as unverified until reproduced. |
| OpenWebHMI | SCADA/HMI concepts and industrial protocol integration | https://github.com/sergiogallegos/OpenWebHMI | Project describes AGPL core and MPL protocol packages; evaluate copyleft implications before incorporating code. |
| OSOlogic platform | Open PLC architecture, IEC 61131-3, gateways and protocols | https://github.com/OSOlogic/platform | Project describes AGPL-3.0 core and separate licenses for other components; do not merge code without a license review. |
| OpenPLC | PLC runtime and IEC 61131-3 learning/testing reference | https://github.com/thiagoralves/OpenPLC_v3 | Verify current repository license and component-level terms before reuse. |
| pymodbus | Modbus protocol implementation/reference for test tools | https://github.com/pymodbus-dev/pymodbus | Check the current license, supported versions and security advisories before integration. |
| asyncua | OPC UA client/server implementation/reference | https://github.com/FreeOpcUa/opcua-asyncio | Check current license, security posture and version compatibility. |
| python-snap7 | Siemens S7 communication reference for authorized lab/test environments | https://github.com/gijzelaerr/python-snap7 | Verify license and test only with authorized systems; never scan or write to production PLCs by default. |

## Source acquisition and knowledge policy

- Prefer explicitly licensed open sources (for example CC-BY documentation or MIT/BSD/Apache-2.0 code) after verifying the exact license and scope.
- Store metadata and links first; fetch only allowlisted sources whose terms permit the intended processing.
- Keep source text and code out of the public repository unless redistribution is explicitly permitted.
- Preserve attribution and license notices; respect ShareAlike, copyleft, patent, trademark and dependency conditions.
- Do not use search snippets as proof of a technical claim.
- Never mark a claim “manufacturer verified” unless it is supported by the exact applicable manual, model and revision.
- Treat AI-generated diagnoses as hypotheses, not measurements or work authorization.
- Keep a claim-to-source record: claim, subsystem, source URL, document revision/date, applicable model range, license, verification status, and reviewer.
- Reject unsupported numeric thresholds, torque values, pressure settings, wiring pinouts and parameter values. Obtain them from the exact manual or approved site procedure.

## Retrieval architecture

1. **Case parser:** extract symptoms, component, subsystem, alarm code, measurements, model and operating state.
2. **Hybrid search:** combine keyword search for fault codes/part numbers with semantic search for symptoms; filter by subsystem and source eligibility.
3. **Evidence ranking:** exact model/manual match first, then official technical document, licensed technical publication, then reviewed general guidance. Repository README files are software/project evidence, not proof of machine-repair claims.
4. **Grounded response:** every source-backed statement links to a source; distinguish source-supported facts from diagnostic inference.
5. **Uncertainty and safety layer:** detect hazardous contexts, missing measurements and contradictions; ask for information or escalate rather than inventing.
6. **Feedback loop:** let technicians record the actual finding and repair outcome, with privacy controls and review before promoting patterns into shared knowledge.
7. **Evaluation:** maintain representative test cases for electrical, electronics, PLC/SCADA, hydraulic, pneumatic, mechanical and cross-domain failures; measure groundedness, safe escalation, useful next checks and unsupported-claim rate.

## Implementation sequence

- **Phase A — Taxonomy and source governance:** define subsystem vocabulary, metadata schema, license checks and claim provenance.
- **Phase B — Retrieval prototype:** index only eligible sources, retrieve excerpts with citations, and keep original source text out of Git.
- **Phase C — Diagnostic coverage:** add symptom-to-test workflows across each subsystem and mixed-domain faults.
- **Phase D — Evaluation:** test against curated cases reviewed by qualified technicians; include hazardous and ambiguous cases.
- **Phase E — Product integration:** connect retrieval to the Worker only after offline tests pass, then test with generic cases and a controlled rollout.
- **Phase F — Maintenance:** schedule source refresh checks, detect broken URLs/license changes, version the knowledge index, and provide a correction process.

## Current status boundary

This roadmap does not mean that the listed projects have been cloned, their code incorporated, their complete licenses audited, or their diagnostic accuracy validated. It does not mean that retrieval is live in production. Those steps require separate implementation and tests.
