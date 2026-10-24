# Knowledge Base Audit

Deterministic inventory of the current repository. This report adds no technical claims or troubleshooting content.

## Snapshot

- Worker-referenced Markdown documents: **9**
- Markdown inventory: **2,731 lines**, **35,144 whitespace-separated words**, **215 headings**
- Structured fault records: **239**
- Model-specific manual-reviewed fault records (not field-verified): **15**
- Source-linked OEM diagnostic records with exact manual scope: **47**
- Distinct equipment-type labels in the fault library: **34**
- Cause entries across fault records: **722**
- Fault records with an alarmCodes or errorCodes array: **0/239**
- Chinese/European OEM manufacturer profiles: **28**
- Structured OEM symptom templates: **38**
- Official manufacturer/support portal records: **57**
- Structured OEM platform index entries: **29**; model-verified: **0**
- OEM evidence records with missing source-registry references: **0**

## Document inventory

| Worker-loaded document | Lines | Words | Headings |
|---|---:|---:|---:|
| knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md | 296 | 4,738 | 40 |
| knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md | 129 | 1,429 | 11 |
| knowledge/INGERSOLL-RAND-COMPRESSOR-CASEBOOK.md | 107 | 1,203 | 14 |
| knowledge/CENTRIFUGAL-PUMP-TROUBLESHOOTING-DRAFT.md | 114 | 1,024 | 9 |
| knowledge/EQUIPMENT-TROUBLESHOOTING-AR-FR-EN.md | 156 | 1,946 | 21 |
| knowledge/UNIVERSAL-INDUSTRIAL-FAULT-ATLAS-AR-FR-EN.md | 120 | 1,737 | 14 |
| knowledge/CHINESE-EUROPEAN-OEM-FAULT-MATRIX-AR-FR-EN.md | 432 | 4,549 | 45 |
| knowledge/OEM-MANUFACTURER-INDEX-AR-FR-EN.md | 123 | 1,378 | 10 |
| knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md | 1254 | 17,140 | 51 |

## Source registry and licensing

- Registry source entries: **2**
- Source status counts: candidate: 2
- License counts: CC-BY-4.0: 2
- Reference-only portals: **5**; permitted for automated fetching by registry: **0/5**
- Accepted licenses declared by policy: CC-BY-4.0, MIT
- Human review before knowledge publication required by policy: **yes**

## Literal equipment-name coverage proxy

- Equipment-type labels literally present in the concatenated Worker-loaded Markdown: **25/34**.
- Labels with no literal match: boiler, electrical_control, electrical_panel, fan-blower, filtration, fire_safety, industrial_network, power_supply, refrigeration.

This is a conservative string-presence check only. It does not prove that a topic is technically covered when a label is present, or absent when a synonym or different wording is used.

## Gaps and required review

1. Model-specific manual-reviewed records summarize selected manual claims but are not field-verified; confirm the exact machine-builder configuration and applicable manual before using them operationally.
2. 2 license-tracked source-registry entries are not marked approved (approved count: 0). Candidate sources must not be treated as approved technical authority.
3. 9 equipment labels lack a literal name match in the Worker-loaded documents. Review this list with a subject-matter expert; do not automatically fill the gaps with generated technical content.
4. 5 reference-only portals are not allowlisted for automated fetching. Keep this restriction until reuse permissions are documented in the registry.

## Manufacturer-specific case coverage and limits

- The OEM matrix maps 28 manufacturer/controller families to official documentation routes and contains 38 structured symptom templates.
- The OEM platform index lists 29 machine builders and component OEMs; 0 are model-verified. These entries are discovery routes only until exact model/manual evidence is reviewed.
- The 47 OEM evidence records describe only the claim supported by their cited manual and scope; they are not field-verified machine diagnoses.
- The 57-entry OEM source-discovery registry is separate from the 2 license-tracked research sources above. Its URLs do not prove that a particular fault cause applies.
- OEM record registry references are checked against the manufacturer-source registry; missing references: none. The source link alone is not evidence unless the recorded manual section supports the claim.

## Method and limits

- The document inventory is derived from the Worker KNOWLEDGE_FILES list, not from every Markdown file in the repository.
- Word counts use whitespace-separated tokens; they are inventory measures, not measures of quality.
- This audit does not validate technical correctness, OEM applicability, or the evidentiary support of every statement.
- No source text is fetched by this script and no new technical content is generated.
