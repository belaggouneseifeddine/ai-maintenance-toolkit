# Knowledge Base Audit

Deterministic inventory of the current repository. This report adds no technical claims or troubleshooting content.

## Snapshot

- Worker-referenced Markdown documents: **9**
- Markdown inventory: **1,849 lines**, **22,291 whitespace-separated words**, **188 headings**
- Structured fault records: **239**
- Model-specific manual-reviewed fault records (not field-verified): **15**
- Distinct equipment-type labels in the fault library: **34**
- Cause entries across fault records: **721**
- Fault records with an alarmCodes or errorCodes array: **0/239**
- Chinese/European OEM manufacturer profiles: **28**
- Structured OEM symptom templates: **38**
- Official manufacturer/support portal records: **50**
- Structured OEM platform index entries: **29**; model-verified: **0**

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
| knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md | 372 | 4,287 | 24 |

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
2. 2 source-registry entries are not marked approved (approved count: 0). Candidate sources must not be treated as approved technical authority.
3. 9 equipment labels lack a literal name match in the Worker-loaded documents. Review this list with a subject-matter expert; do not automatically fill the gaps with generated technical content.
4. 5 reference-only portals are not allowlisted for automated fetching. Keep this restriction until reuse permissions are documented in the registry.

## Method and limits

- The document inventory is derived from the Worker KNOWLEDGE_FILES list, not from every Markdown file in the repository.
- Word counts use whitespace-separated tokens; they are inventory measures, not measures of quality.
- This audit does not validate technical correctness, OEM applicability, or the evidentiary support of every statement.
- No source text is fetched by this script and no new technical content is generated.


## OEM-specific verified knowledge update (2026-10-24)

- Structured evidence records: **29** in `knowledge/oem-verified-faults.json`.
- Exact source-reviewed families: Siemens SINUMERIK 840D sl/828D, SINAMICS G120D, SINAMICS G120P; Mitsubishi MELSEC iQ-F FX5 and a narrowly scoped MR-J4 compatibility case; XINJE DS5K servo driver.
- Official source registry entries: **51**.
- Retrieval guide: `knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md`, included in Worker-loaded knowledge documents.
- Every verified record includes source ID/URL, manual title/revision, section, printed page where available, multilingual meaning, safe checks, escalation and review date.
- Other Chinese OEM families remain in the evidence-acquisition queue until exact model-specific manual passages are reviewed; a portal link alone is not model-verified evidence.
- This update is on the feature branch; no deployment is implied.
