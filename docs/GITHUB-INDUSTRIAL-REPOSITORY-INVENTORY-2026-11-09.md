# GitHub industrial repository inventory — 2026-11-09

> Scope: first-pass content and license audit. This is a review record, not approval to copy third-party datasets or make technical claims operational. Repository metadata can change; re-check the exact commit and terms before each reuse.

## Executive result

The reviewed repositories fall into distinct classes. Only one reviewed repository contains a structured multi-equipment fault catalogue, but its fault records have material quality and provenance problems. The strongest immediate value is therefore **schema and coverage discovery, benchmark data, and reasoning/model research**, not bulk import of third-party fault text.

### Content review: structured fault knowledge

| Repository | Files actually inspected | Coverage found | License / rights assessment | Quality and integration decision |
|---|---|---|---|---|
| [industrial-ops-rag-agent](https://github.com/yilin-2511/industrial-ops-rag-agent) | `LICENSE`, `data/knowledge_base.json`, `data/fault_cases.json`, `requirements.txt` | 9 equipment types and 55 fault records: centrifugal pump (9), 3-phase induction motor (7), control valve (5), air compressor (8), shell-and-tube heat exchanger (6), centrifugal fan (6), cooling tower (5), safety valve (4), reducer/gearbox (5). One case-history record. | Repository code has MIT text (copyright 2025 Morty Team). No separate data license was found for the JSON files. Several records cite GB/T standards or generic “manual” without edition/page/claim linkage. MIT code license does not establish rights to those standards or data. | **Do not import fault text or schedules.** Use as a discovery-only coverage map and schema-design reference. 42 of 55 records have `diagnosis_steps` exactly identical to `possible_causes`; these are not discriminating tests. The single case has no independently verifiable evidence and includes an operator name; do not import it. Maintenance schedules lack model/duty/environment/source scope. |
| [awesome-industrial-datasets](https://github.com/jonathanwvd/awesome-industrial-datasets) | `README.md`, `LICENSE` | Catalogue reports 199 datasets across chemical/process, mechanical, oil/gas, manufacturing, energy, robotics, OT security and other domains. Includes dataset metadata for asset, modality, task, access and license where known. | Catalogue is CC BY-NC 4.0. Individual linked datasets retain their own terms. Non-commercial restriction makes the catalogue itself unsuitable for direct commercial reuse without separate permission. | **Discovery index only.** Use it to find original dataset owners, then inspect each original dataset's license and documentation. Do not copy its catalogue wholesale into the app. |
| [BearingDatasets](https://github.com/VictorBauler/BearingDatasets) | `README.md`, `LICENSE` | 69 bearing/rotating-machinery datasets normalized to a common metadata format; vibration/acoustic signals, fault labels, operating conditions and run-to-failure subsets. README explicitly says “code only, no data”; each dataset is downloaded from its original source and retains its own license. | Code MIT. Dataset rights are independent and must be checked one by one. | **Offline research/evaluation only.** Strong benchmark adapter candidate. Not an Android bundle: data can be multi-GB; Python >=3.10 and scientific-data tooling are expected. Never treat labels as field troubleshooting instructions. |
| [Condition monitoring of hydraulic systems — UCI](https://doi.org/10.24432/C5CW21) and [JonMuel/hydraulic-condition-monitoring](https://github.com/JonMuel/hydraulic-condition-monitoring) | Repository `README.md`, `LICENSE` | UCI dataset ID 447; hydraulic-system telemetry used to model valve wear states. The repository provides notebook, exported model and a FastAPI demo. | JonMuel repository code declares MIT. The UCI dataset is separately listed as CC BY in the industrial dataset catalogue; verify the current UCI page and attribution before redistribution. | **High-priority isolated benchmark.** README reports random-split leakage across near-identical cycles (about 0.98 F1) and a group-aware split around 0.53 F1. This is a useful warning and evaluation pattern, not a universal model score. Do not add its model to runtime without independent testing. |
| [ARX-MFCM hydraulic propulsion dataset](https://github.com/yuanhui12/arx-mfcm-data) | `README.md` | 50 simulation Excel files, five states (normal, cylinder leakage, directional-valve leakage, flow-control-valve damage, relief-valve damage), 6001 points/record. README reports only 30 unique numeric records and 11 duplicate groups crossing its stated train/test split. | No clear repository/data license found. | **Do not redistribute or import.** Potential isolated evaluation only after permission/terms are clarified and duplicate groups are handled before splitting. Units are not explicit in the source column names; do not infer them. |
| [FZU_HGPFD](https://github.com/HuiHuang2025/FZU_HGPFD) | `README.md` | Hydraulic gear-pump vibration/acoustic dataset: six health states across 28 operating conditions (speed and pressure). README points to an external Baidu download. | No explicit license found in the inspected README. External data access does not grant reuse rights. | **Do not import yet.** Strong research candidate after rights and data access are verified. |
| [MIMII baseline](https://github.com/MIMII-hitachi/mimii_baseline) | Attempted `README.md` and `LICENSE` fetch; both paths returned NOT_FOUND through the inspected connector route. | Known MIMII benchmark scope includes machine-sound anomaly detection for pumps, valves, fans and slide rails; the exact repository file inventory was not confirmed in this pass. | Not verified. MIMII dataset terms must be checked separately from any baseline code. | **Pending.** Do not copy code or data until the actual tree, license and data terms are inspected. Anomaly score is not root-cause diagnosis. |
| [NASA ProgPy](https://github.com/nasa/progpy) | `README.md`; linked `license.pdf` could not be inspected as text in this pass. | Prognostics framework for selected components; state estimation, prediction, uncertainty propagation and RUL-oriented algorithms. | README identifies NASA Open Source Agreement (NOSA) and links a PDF. Exact license obligations not reviewed in this pass. | **Research reference / isolated experiment.** Keep prognosis separate from diagnosis; no generic RUL claims or runtime integration before component-specific data, calibration, validation and legal review. |
| [pgmpy](https://github.com/pgmpy/pgmpy) | `README.md`, `LICENSE` | Bayesian networks, dynamic Bayesian networks, causal graphical models, inference, parameter estimation, simulation and model validation. | MIT. | **High-priority algorithm reference.** Prototype offline on small curated cases; compare with the existing lightweight `bayesian-engine.js`. Do not add a Python service or runtime dependency just to use the library. |
| [PlantCraft](https://github.com/PlantCraft/PlantCraft) | `README.md`, `LICENSE` | Open industrial suite with historian, analytics, alarms, dashboards, process models, documents and read-only assistant integration. | Apache-2.0. | **Architecture reference only.** Useful ideas: signal lineage, alarm-to-asset relationships, offline install, read-only OT access, auditability. Multi-container server platform is not suitable as an Android app dependency. |
| [Asset Administration Shell metamodel](https://github.com/admin-shell-io/aas-specs-metamodel) | `README.md` | IDTA-01001 metamodel and normative JSON/RDF/XML schemas for industrial asset digital-twin representations. | README declares CC BY 4.0 and links the license. | **High-priority schema reference.** Map only relevant asset identity, properties, relationships and documents into a compact local equipment profile; do not import the full specification as runtime payload. Attribute properly. |

## What was extracted from industrial-ops-rag-agent

The extraction is intentionally limited to non-operational coverage metadata:

- Equipment taxonomy: pump, induction motor, control valve, air compressor, shell-and-tube heat exchanger, centrifugal fan, cooling tower, safety valve and reducer/gearbox.
- Coverage count: 55 fault records across those nine types.
- Data-quality warning: 42/55 records repeat their cause list as the “diagnosis steps”; therefore they cannot be treated as test procedures.
- Provenance warning: source strings such as standard identifiers or “manual” lack page, revision, exact claim and model applicability.
- Case-history warning: only one case record is present; it is not a representative or validated failure database.
- Maintenance schedule warning: generic frequencies are not safe to transfer across models, services, duty cycles or site requirements.

No third-party fault text, maintenance schedule, raw case history, numeric signal or standard text has been copied into the operational knowledge base.

## Cross-project integration decisions

| Capability | Best candidates | Recommended use in this project |
|---|---|---|
| Equipment taxonomy and asset profile | AAS metamodel; industrial-ops coverage map | Design a compact, versioned equipment/component schema. Preserve local stable IDs and map AAS fields only where useful. |
| Structured fault content | industrial-ops-rag-agent | Coverage gap discovery only until data rights and claim-level sources are resolved. Re-author and verify claims from permitted primary sources rather than importing its records. |
| Bearing and rotating-machine evaluation | BearingDatasets; original CWRU/Paderborn/XJTU-SY datasets | External offline benchmark harness. Keep each dataset's license, citation, operating conditions and split protocol. |
| Hydraulic diagnostics evaluation | UCI hydraulic systems; ARX-MFCM; FZU_HGPFD | Prioritize UCI with CC BY attribution after current terms are rechecked. Keep unlicensed candidates quarantined. |
| Bayesian reasoning | pgmpy | Offline comparative prototype; use findings to improve the existing JavaScript engine without mandatory Python runtime. |
| Prognostics | NASA ProgPy | Separate research module, only after suitable run-to-failure data and calibration. |
| Industrial data/alarms architecture | PlantCraft | Learn from signal/asset relationships and read-only OT boundary; do not import platform. |
| Dataset discovery | awesome-industrial-datasets | Search index only; inspect original source and license for every candidate. |

## Import and evidence policy

1. A repository's code license does not automatically license bundled datasets, standards, manuals, screenshots, papers or externally hosted downloads.
2. Record the license at two levels: repository code and each dataset/content item.
3. Do not ingest source text from standards or OEM manuals unless redistribution rights are explicit. A public download link is not a reuse grant.
4. Telemetry and labels are benchmark data, not engineering rules. Never convert labels into cause-test-repair instructions without separate technical evidence.
5. Every operational claim must have bounded wording, source URL, document revision, page/section, scope, review date and evidence state.
6. Preserve the current evidence states. No third-party repository entry may create an `official_model_verified` record.
7. Run deduplication, source-reference validation, unit checks, time-order checks and leakage-resistant splits before using any dataset for model evaluation.
8. Keep unlicensed or unverified material in a research-only register, not in files loaded by the Worker/runtime.
9. No new package, paid API, Python backend, large binary dataset or automatic external fetch is required for the first integration phase.

## Immediate next steps

1. Reconcile the nine equipment types against the app's current fault taxonomy and identify true gaps rather than duplicate labels.
2. Review the app's current evidence register and source schema; add explicit repository/dataset rights fields and review states where missing.
3. Build a quarantined, reproducible benchmark harness for UCI hydraulic and one bearing dataset only after license and source checks.
4. Prototype a tiny Bayesian-network comparison against the existing local engine.
5. Add automated checks that reject unknown source IDs, missing licenses, duplicate fault IDs, cause-as-test records, unsupported units and unverified OEM status.

## Review limits

This is a first-pass inventory on 2026-11-09. The MIMII baseline repository tree and license, NASA NOSA PDF terms, exact UCI landing-page terms at the time of reuse, and individual BearingDatasets source licenses remain open checks. No production code or runtime knowledge was changed by this inventory.


## Proposed mapping to the current app taxonomy (not approved)

The nine equipment labels above can be tentatively mapped to the app's existing vocabulary for a future gap comparison: centrifugal pump → `pump`; induction motor → `motor`; control valve and safety valve → `valve`; air compressor → `compressor`; shell-and-tube exchanger → `heat_exchanger`; centrifugal fan → `fan-blower`; cooling tower → `cooling`; gear reducer → `gearbox`.

These are **candidate aliases only**. The app's allowed equipment vocabulary includes these categories, but a category match does not prove that the corresponding fault records, symptoms or diagnostic flows are already covered. The core `faults.json` is a large file and was not fully parsed through the current connector response; therefore no claim of complete deduplication or gap closure is made. Reconcile the aliases against all fault IDs, the supplemental records and `diagnostic-flow-coverage.json` before changing runtime behavior.


## Follow-up extraction and benchmark staging (2026-11-09)

### Industrial Ops RAG Agent
- Copied `data/knowledge_base.json` (upstream blob `c849e987ac6d8bf52ff7c512d478d7a7487b1b52`) into a candidate-only folder with the upstream MIT license and attribution.
- Extracted nine pump records into a separate candidate file; every claim remains unverified.
- Excluded the sample fault-case file containing a named handler and operational personal details; excluded standards CSVs and standards text.
- Confirmed 9 equipment groups and 55 fault records. 42/55 repeat causes as diagnosis steps. Remaining entries still need units, measurement points, operating conditions, expected outcomes, safety preconditions and source-page verification.

### Licensed benchmark staging
- **UCI hydraulic condition monitoring #447:** official UCI page identifies CC BY 4.0. It contains 2,205 60-second test-rig cycles and 17 channels; labels cover cooler, valve, internal pump leakage and accumulator. Manual download helper added; archive ~73 MB and extracted data ~530 MB. Not downloaded or bundled.
- **URMA-CRTI, Annaba, Algeria:** per-dataset metadata identifies CC BY 4.0; 23 recordings at 25.6 kHz with a pinned expected SHA-256. Manual, checksum-verified download helper added; ~47 MB file not downloaded.
- Both datasets are benchmark signals/labels, not root-cause narratives, repair procedures or field-validated thresholds. They remain outside runtime.

