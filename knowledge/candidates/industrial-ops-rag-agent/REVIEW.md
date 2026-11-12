# Review — Industrial Ops RAG Agent

## Files inspected upstream

- `README.md`
- `LICENSE`
- `data/knowledge_base.json`
- `data/fault_cases.json`
- `data/standards/gbt3215_pump_faults.csv`
- `requirements.txt`

These files were inspected for structure and quality. Their content is not copied into this repository.

## Findings

- The upstream knowledge file describes 55 records across 9 equipment classes; the review counted 9 pump records.
- 42 of 55 `diagnosis_steps` entries duplicate `possible_causes` instead of specifying a discriminating test with a predicted result.
- The pump CSV has 5 rows while the README describes 3 pump fault types.
- The sample fault-case records do not provide enough source-page, model, operating-condition, measurement-location and safety context for operational diagnosis.
- Several records cite standards by identifier or generic manuals without an independently reviewed edition/page/claim mapping.
- The repository-level MIT license covers code; no separate data license for the embedded knowledge or standards-derived records was identified.

## Rights decision

The prior quarantined copy of `knowledge_base.json` and the derived pump extract have been removed from this branch on 2026-11-09. Only high-level counts and provenance metadata remain. Do not copy, translate, redistribute or import upstream fault text unless a separate data license and the rights for every embedded source are verified.

## Toolkit relevance

The repository can remain a discovery pointer for finding primary sources and taxonomy ideas. It is not an approved source for runtime fault facts, repair steps or OEM-verified claims.
