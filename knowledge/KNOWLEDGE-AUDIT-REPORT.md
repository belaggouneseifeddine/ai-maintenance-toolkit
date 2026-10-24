# Knowledge Base Audit

Deterministic inventory of the current repository. This report adds no technical claims or troubleshooting content.

## Snapshot

- Worker-referenced Markdown documents: **6**
- Markdown inventory: **922 lines**, **12,077 whitespace-separated words**, **109 headings**
- Structured fault records: **252**
- Distinct equipment-type labels in the fault library: **33**
- Cause entries across fault records: **761**
- Fault records with an alarmCodes or errorCodes array: **0/252**

## Document inventory

| Worker-loaded document | Lines | Words | Headings |
|---|---:|---:|---:|
| knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md | 296 | 4,738 | 40 |
| knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md | 129 | 1,429 | 11 |
| knowledge/INGERSOLL-RAND-COMPRESSOR-CASEBOOK.md | 107 | 1,203 | 14 |
| knowledge/CENTRIFUGAL-PUMP-TROUBLESHOOTING-DRAFT.md | 114 | 1,024 | 9 |
| knowledge/EQUIPMENT-TROUBLESHOOTING-AR-FR-EN.md | 156 | 1,946 | 21 |
| knowledge/UNIVERSAL-INDUSTRIAL-FAULT-ATLAS-AR-FR-EN.md | 120 | 1,737 | 14 |

## Source registry and licensing

- Registry source entries: **2**
- Source status counts: candidate: 2
- License counts: CC-BY-4.0: 2
- Reference-only portals: **5**; permitted for automated fetching by registry: **0/5**
- Accepted licenses declared by policy: CC-BY-4.0, MIT
- Human review before knowledge publication required by policy: **yes**

## Literal equipment-name coverage proxy

- Equipment-type labels literally present in the concatenated Worker-loaded Markdown: **24/33**.
- Labels with no literal match: boiler, electrical_control, electrical_panel, filtration, fire_safety, industrial_network, power_supply, refrigeration, robotics.

This is a conservative string-presence check only. It does not prove that a topic is technically covered when a label is present, or absent when a synonym or different wording is used.

## Gaps and required review

1. No structured OEM alarm-code index is present in the fault library. Do not claim manufacturer-specific code matching until code records are sourced and reviewed.
2. 2 source-registry entries are not marked approved (approved count: 0). Candidate sources must not be treated as approved technical authority.
3. 9 equipment labels lack a literal name match in the Worker-loaded documents. Review this list with a subject-matter expert; do not automatically fill the gaps with generated technical content.
4. 5 reference-only portals are not allowlisted for automated fetching. Keep this restriction until reuse permissions are documented in the registry.

## Method and limits

- The document inventory is derived from the Worker KNOWLEDGE_FILES list, not from every Markdown file in the repository.
- Word counts use whitespace-separated tokens; they are inventory measures, not measures of quality.
- This audit does not validate technical correctness, OEM applicability, or the evidentiary support of every statement.
- No source text is fetched by this script and no new technical content is generated.
