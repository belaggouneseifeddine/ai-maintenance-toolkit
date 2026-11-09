# Industrial Ops RAG Agent — candidate extraction review

Upstream: https://github.com/yilin-2511/industrial-ops-rag-agent  
File reviewed: `data/knowledge_base.json` (blob `c849e987ac6d8bf52ff7c512d478d7a7487b1b52`)  
License: upstream repository LICENSE is MIT and is preserved here. The JSON references external GB/T/JB/T standards and generic manuals without claim-level pages, editions or model scope; those claims remain unverified, and the MIT license does not grant rights to reproduce underlying standards.  
Status: candidate-only; never loaded by app/Worker runtime.

## Snapshot and extraction
- Copied the upstream `data/knowledge_base.json` verbatim with attribution and its MIT license.
- Extracted nine centrifugal-pump records into a separate candidate file, preserving upstream IDs and marking every claim unverified.
- Excluded `fault_cases.json` because its sample includes a named handler and operational personal details.
- Excluded the standards CSVs; no standards text was copied.

## Coverage and quality
Nine equipment families: centrifugal pump (9), induction motor (7), control valve (5), air compressor (8), shell-and-tube exchanger (6), centrifugal fan (6), cooling tower (5), safety valve (4), gear reducer (5): 55 records total.

42/55 repeat `possible_causes` as `diagnosis_steps`; these are not discriminating tests. Other records still need measurement units/locations, operating context, expected result patterns, safety preconditions and claim-level source verification.

## Pump candidates
Nine pump records cover no-flow/no-suction, vibration/noise, seal leakage, bearing overheating, motor overload, low flow and abnormal vibration. Candidate observations include pressure/flow, strainer differential pressure, suction-side air ingress, seal leakage location/rate, bearing vibration, lubrication condition and vibration spectrum. These are prompts for expert review, not approved procedures.

## Decisions
- Keep the snapshot quarantined with attribution and upstream license.
- Treat all embedded standard/manual claims as unverified.
- Do not import generic maintenance schedules, downtime estimates or repair actions into runtime.
- Promote only non-duplicative facts after source, technical, safety and license review.
