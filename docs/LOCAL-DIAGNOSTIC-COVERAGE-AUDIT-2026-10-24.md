# Local diagnostic coverage audit — 2026-10-24

## Scope

This audit is limited to the offline, rule-based diagnostic experience on `feature/local-diagnostic-engine`. It does not add an AI agent, network retrieval, a Worker dependency, a cloud provider, or new fault claims.

## Snapshot verified from repository files

- Fault library: **152 records** in `faults.json`.
- Equipment labels: **32 distinct values**.
- Symptom IDs: **12 distinct values**.
- Structured diagnostic flows: **11** in `diagnostic-flows.js`.
- The fault records checked have unique IDs and populated equipment/symptom fields.
- The checked records contain Arabic, French, and English titles, safe checks, escalation text, cause labels, and cause keywords.

These checks establish structural completeness only. They do **not** establish that every troubleshooting statement is correct for every manufacturer/model.

## Coverage risks to address before adding content

1. **Uneven breadth:** the 32 equipment categories have very uneven record counts. Several have only one record (for example filtration, heat exchanger, steam system, boiler, power supply, electrical panel, lubrication, vacuum, and dust collector). Treat these as thin coverage, not complete diagnostic support.
2. **Different IDs for similar symptoms:** both `overheat` and `overheating` exist. Review symptom normalization and UI options before adding more records; do not silently merge IDs without checking existing flows and aliases.
3. **Flow coverage is narrower than library coverage:** 11 structured flows cover only a subset of equipment/symptom pairs. The presence of a fault record must not imply that an interactive question flow exists.
4. **Evidence provenance:** the current structural audit does not prove that every cause or action has a traceable, model-applicable source. Add or enrich content only when the source, equipment scope, safe checks, and escalation criteria can be reviewed.
5. **OEM alarm codes:** do not add interpretations for codes unless the exact manufacturer/model manual or another authoritative source supports them.

## Local quality gates added

The new regression tests check stable unique IDs, equipment/symptom scope, multilingual safe checks and escalation, cause-label completeness, cautious behavior for unknown inputs, and the wording distinction between match scores and probabilities.

## Safety and evidence rules

- Prefer non-invasive observations.
- Keep hypotheses separate from confirmed causes.
- Never invent OEM limits, alarm meanings, or source citations.
- Do not advise bypassing guards, trips, interlocks, relief devices, or emergency stops.
- Require site isolation/LOTO and qualified personnel before hazardous intervention.
- If the available evidence is insufficient, ask for details or escalate rather than adding speculative content.

## Next audit step

Build a matrix of **equipment type × symptom × existing fault IDs × structured flow × source status**. Review the missing and thin cells with evidence before creating any new fault records. This is a coverage backlog, not a claim that every missing combination should be supported.
