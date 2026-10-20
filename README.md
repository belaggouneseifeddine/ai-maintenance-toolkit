# Maintenance AI Toolkit

An Android-first, low-cost assistant for industrial maintenance troubleshooting, fault reporting, and preventive-maintenance planning.

## MVP goals
- Collect machine and fault details in a structured workflow.
- Suggest safe, evidence-based troubleshooting steps.
- Generate a clear maintenance report.
- Organize manuals, datasheets, and verified knowledge sources.
- Keep AI/API providers replaceable so free tiers can be evaluated without lock-in.

## Current status
Project foundation only. No AI provider, live diagnostic engine, or Android app has been connected yet.

## Safety principles
- Treat suggestions as support for qualified personnel, not a substitute for site procedures or manufacturer instructions.
- Never work on energized equipment unless a formally approved procedure and qualified personnel specifically authorize it.
- Isolate and verify energy sources before intervention; account for electrical, hydraulic, pneumatic, mechanical, thermal, and stored energy.
- Never bypass guards, interlocks, or protective devices.
- Do not invent specifications, torque values, pressure limits, wiring details, or part numbers.
- If information is insufficient or risk is high, stop and escalate.

## Planned structure
- `docs/troubleshooting-workflow.md` — structured diagnostic workflow
- `knowledge/fault-report-template.md` — reusable fault report
- `SAFETY.md` — safety boundaries

## Roadmap
1. Define MVP and safety workflow.
2. Add fault-report template and example cases.
3. Evaluate free-tier AI APIs and their current terms, limits, and privacy conditions.
4. Build a mobile-friendly prototype.
5. Test with non-hazardous, documented examples before real-world use.

## Language
Initial documentation is in English; Arabic and French support may be added.
