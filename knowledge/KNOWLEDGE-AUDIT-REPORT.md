# Knowledge Base Audit

Deterministic inventory of the current repository. This report adds no technical claims or troubleshooting content.

## Snapshot

- Worker-referenced Markdown documents: **11**
- Markdown inventory: **4,022 lines**, **58,140 whitespace-separated words**, **297 headings**
- Core structured fault records: **284**
- Supplemental general fault records (not model-verified): **3**
- Combined local fault records: **287**
- Model-specific manual-reviewed fault records (not field-verified): **60**
- Distinct equipment-type labels across core and supplemental fault records: **37**
- Cause entries across core and supplemental fault records: **776**
- Fault records with an alarmCodes or errorCodes array: **31/287**
- Chinese/European OEM manufacturer profiles: **28**
- Structured OEM symptom templates: **38**
- Official manufacturer/support portal records: **67**
- Structured OEM platform index entries: **29**; model-verified: **0**
- Structured source-linked OEM diagnostic records: **99**; claim-reviewed: **99**; pending claim-level review: **0**; records missing a printed/PDF page reference: **0**; records missing firmware/applicability scope: **0**; records with a missing manufacturer-source registry entry: **0**

## Document inventory

| Worker-loaded document | Lines | Words | Headings |
|---|---:|---:|---:|
| knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md | 354 | 5,636 | 46 |
| knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md | 129 | 1,429 | 11 |
| knowledge/INGERSOLL-RAND-COMPRESSOR-CASEBOOK.md | 107 | 1,203 | 14 |
| knowledge/CENTRIFUGAL-PUMP-TROUBLESHOOTING-DRAFT.md | 114 | 1,024 | 9 |
| knowledge/EQUIPMENT-TROUBLESHOOTING-AR-FR-EN.md | 156 | 1,946 | 21 |
| knowledge/UNIVERSAL-INDUSTRIAL-FAULT-ATLAS-AR-FR-EN.md | 120 | 1,737 | 14 |
| knowledge/CHINESE-EUROPEAN-OEM-FAULT-MATRIX-AR-FR-EN.md | 432 | 4,549 | 45 |
| knowledge/OEM-MANUFACTURER-INDEX-AR-FR-EN.md | 139 | 1,606 | 12 |
| knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md | 2,308 | 36,793 | 109 |
| knowledge/REFERENCE-ONLY-MASTERING-DIGITAL-ELECTRONICS.md | 61 | 747 | 7 |
| knowledge/REFERENCE-ONLY-AUTOMATES-PROGRAMMABLES-INDUSTRIELS.md | 102 | 1,470 | 9 |

## Source registry and licensing

- Registry source entries: **2**
- Source status counts: candidate: 2
- License counts: CC-BY-4.0: 2
- Reference-only portals: **5**; permitted for automated fetching by registry: **0/5**
- Reference-only books: **2**; permitted for automated fetching by registry: **0/2**
- Supplemental fault source references registered in the manufacturer-source registry: **6**; missing registry entries: **0**
- Accepted licenses declared by policy: CC-BY-4.0, MIT
- Human review before knowledge publication required by policy: **yes**

## Literal equipment-name coverage proxy

- Equipment-type labels literally present in the concatenated Worker-loaded Markdown: **30/37**.
- Labels with no literal match: boiler, electrical_control, electrical_panel, fan-blower, filtration, fire_safety, refrigeration.

This is a conservative string-presence check only. It does not prove that a topic is technically covered when a label is present, or absent when a synonym or different wording is used.

## Gaps and required review

1. Model-specific manual-reviewed records summarize selected manual claims but are not field-verified; confirm the exact machine-builder configuration and applicable manual before using them operationally.
2. 2 source-registry entries are not marked approved (approved count: 0). Candidate sources must not be treated as approved technical authority.
3. 7 equipment labels lack a literal name match in the Worker-loaded documents. Review this list with a subject-matter expert; do not automatically fill the gaps with generated technical content.
4. 5 reference-only portals are not allowlisted for automated fetching. Keep this restriction until reuse permissions are documented in the registry.
5. 2 reference-only books are not allowlisted for automated fetching. Keep them as metadata and original navigation indexes until reuse permissions are documented.
6. Supplemental fault records are general-reference candidates, not model-verified cases; missing source registry entries: none. Human review is still required before operational use.

## Manufacturer-specific case coverage and limits

- The OEM matrix maps 28 manufacturer/controller families to official documentation routes and contains 38 structured symptom templates.
- The OEM platform index lists 29 machine builders and component OEMs; 0 are model-verified. These entries are discovery routes only until exact model/manual evidence is reviewed.
- These templates are not verified alarm-code definitions. A verified case requires exact model, controller/drive, firmware, manual revision, page/section, supported claim, and human review.
- The 67-entry OEM source-discovery registry is separate from the 2 license-tracked research sources above. Its URLs do not prove that a particular fault cause applies.
- OEM record registry references are checked against the manufacturer-source registry; missing references: none. The source link alone is not evidence unless the recorded manual section supports the claim.
- The structured OEM file contains 99 claim-reviewed records and 0 records pending claim-level review. Pending records must not be presented as source-verified.

## Recent model-specific evidence tranche

- The reviewed OEM tranche includes seven SINAMICS G120C FSD–FSF alarm records scoped to the official Compact Operating Instructions, firmware V4.7 SP6, section 5.1, printed page 82, plus 31 Delta ASDA-B2-F servo alarm records scoped to the official September 2015 manual, section 9.1 and relevant section 9.4 pages, and two Syntec CNC communication alarms scoped to the versions listed in the official CNC Alarm Manual.
- The structured fault library includes 60 model/manual-scoped records; these are manual-claim-reviewed, not field-verified.
- Additional source-backed SINUMERIK, SINAMICS G120D/G120P/G120C, MELSEC FX5, MR-J4, XINJE DS5K/X-NET, INOVANCE H5U, GSK218M, Delta ASDA-B2-F, and Syntec MOT-082/MOT-083 records are available in the structured OEM evidence lookup. The separate general diagnostic library currently has 60 model/manual-scoped entries.

## Method and limits

- The document inventory is derived from the Worker KNOWLEDGE_FILES list, not from every Markdown file in the repository.
- Fault counts include the core faults.json file and the separately loaded knowledge/faults-supplement.json file; model-specific status remains distinct from general-reference evidence.
- Word counts use whitespace-separated tokens; they are inventory measures, not measures of quality.
- This audit does not validate technical correctness, OEM applicability, or the evidentiary support of every statement.
- No source text is fetched by this script and no new technical content is generated.
