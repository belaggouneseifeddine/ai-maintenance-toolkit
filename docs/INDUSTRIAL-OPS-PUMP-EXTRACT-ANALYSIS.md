# Industrial Ops RAG Agent — pump-content rights and quality review

**Review date:** 2026-11-18  
**Decision:** discovery-only; no fault-content import; no runtime use.

## Upstream files actually inspected

- `README.md`
- `LICENSE`
- `data/knowledge_base.json`
- `data/fault_cases.json`
- `data/standards/gbt3215_pump_faults.csv`
- `requirements.txt`

No upstream file or fault-text extract is retained in this repository. The previously stored candidate snapshot and derived pump extract were removed because the repository MIT license does not separately license embedded knowledge data or standards-derived content.

## Verified structure and quality observations

- The upstream knowledge file contains 55 records across 9 equipment classes; 9 records were categorized as pump-related during inspection.
- 42/55 `diagnosis_steps` entries repeat `possible_causes` rather than defining a test, expected result and discriminating value.
- The pump CSV contains 5 rows while the README describes 3 pump fault types.
- The reviewed records do not consistently provide the original standard/manual edition, page, model scope, operating conditions, measurement location, safe test prerequisites or claim-level evidence.
- The sample case file is not sufficient to establish field truth, model-specific limits or a safe repair instruction.

## Additional code review — 2026-11-18

- `src/agents/integrated_agent.py` accepts `use_llm=True`, but the inspected branch only builds and returns a prompt; it does not call `model_router.generate()`. The advertised generation path is therefore a stub in this file.
- `src/retrieval/four_channel_retriever.py` documents weights of 0.20/0.30/0.30/0.20, while the implementation uses 0.35/0.50/0.15/0.00. Jaccard scoring is disabled in the actual weights.
- The integrated prompt asks for causes and maintenance actions; the inspected path does not enforce a separate deterministic safety gate or claim-level source-page requirement.
- No Python code was executed and no raw data, fault text, standards text or code was copied.

## Rights and reuse

- **Code:** MIT at repository root.
- **Data:** no separate license identified for the knowledge JSON, case JSON or standards-derived CSV.
- **Original sources:** GB/T/JB/T standards and generic manuals are referenced, but the exact rights and permitted redistribution of each source are not established.
- **Decision:** do not copy or translate fault records; use only as a pointer to independently reviewable primary sources.

## Relevance to the Toolkit

This source does not close the centrifugal-pump pilot evidence gap. Build the six pilot cases independently from primary sources with explicit license, section/page, equipment scope and technical review. No runtime records were added from this repository.
