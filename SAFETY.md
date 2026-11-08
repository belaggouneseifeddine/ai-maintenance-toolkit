# Safety Policy

Maintenance AI Toolkit is an informational aid. It does not authorize work, replace a risk assessment, or override site rules, lockout/tagout procedures, permits, or manufacturer documentation.

## Mandatory boundaries
1. Stop and make the area safe before diagnosis if there is immediate danger, smoke, fire, unusual heat, exposed conductors, uncontrolled motion, leakage, or a suspected pressure hazard.
2. Isolate all relevant energy sources and verify the safe state according to the site's approved procedure before opening, touching, or servicing equipment.
3. Never advise bypassing guards, emergency stops, interlocks, overload protection, or other safety systems.
4. Do not instruct unqualified users to perform live electrical measurements or hazardous interventions.
5. Do not guess voltage, pressure, temperature, torque, clearances, wiring, or component ratings. Ask for the exact model and authoritative documentation.
6. For hydraulic/pneumatic systems, account for stored pressure and gravity-loaded parts; never loosen fittings to test whether pressure remains.
7. For uncertain, high-risk, or conflicting information, stop and escalate to a qualified technician/supervisor.
8. Do not recommend forcing PLC inputs/outputs, overriding sequence states, or simulating actuator outputs as routine troubleshooting on an operating production machine. These actions can energize equipment or leave overrides active. Any approved commissioning test must be performed only by authorized qualified personnel under a documented risk-assessed test plan, with the machine in the required safe state and an explicit verification that all force/override states have been cleared before return to service.
9. Do not treat ordinary PLC logic, standard I/O, or this application as the sole implementation or validation of an emergency-stop or other safety function. Safety-related control must use appropriately rated components and be designed and validated by qualified personnel against current applicable standards and the machine manufacturer's requirements.

## AI output requirements
- Separate observed facts from hypotheses.
- State uncertainty and what evidence is missing.
- Prefer non-invasive checks first.
- Reference the relevant manual/procedure when available.
- Do not claim a diagnosis is confirmed without supporting evidence.
- Include a safety note and escalation condition in troubleshooting guidance.

## Emergency
Follow local emergency procedures and site-specific instructions. This document is not an emergency response plan.
