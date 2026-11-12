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



### BearingDatasets per-dataset metadata snapshot
- Copied the `urma_crti/dataset.yaml` and `files.lock.json` metadata from BearingDatasets into the benchmark candidate folder, preserving the upstream MIT license for the metadata/tooling source.
- The per-dataset manifest identifies URMA-CRTI as CC BY 4.0 and pins a 47,340,410-byte signal file by SHA-256. The actual signal binary was not downloaded or copied.
- Metadata uncertainties (signal unit, combined-fault definition, channel mapping) remain explicit; no bearing thresholds or diagnosis rules were imported.


## Verified repository and dataset delta — 2026-11-09

The entries below distinguish code license from data/content license. No raw dataset payload was downloaded or added to runtime during this audit.

| Source | Version / last update | Code license | Data / content license | Files or positions actually reviewed | Quality, access and decision |
|---|---|---|---|---|---|
| [industrial-ops-rag-agent](https://github.com/yilin-2511/industrial-ops-rag-agent) | Last push 2026-06-02; no release | MIT | No separate data license identified | README, LICENSE, knowledge_base.json, fault_cases.json, pump CSV, requirements | 55 records/9 classes; 42/55 diagnosis steps duplicate possible causes; pump CSV row count differs from README. Standards/manual provenance lacks page/model rights. **Discovery only; copied snapshot and pump extract removed.** |
| [BearingDatasets](https://github.com/VictorBauler/BearingDatasets) | v0.3.0; updated 2026-11-04; 70 dataset manifests | MIT | Per dataset; not covered by MIT | README, LICENSE, pyproject, five representative dataset.yaml manifests | Registry only; no raw data bundled. CWRU/XJTU-SY/FEMTO rights unresolved in reviewed manifests; Paderborn CC BY-NC 4.0; URMA CC BY 4.0 is only a third-party claim pending primary Zenodo verification. **Metadata only.** |
| [awesome-industrial-datasets](https://github.com/jonathanwvd/awesome-industrial-datasets) | Last push 2026-11-09; no release | No code reuse assumed | Catalogue CC BY-NC 4.0; linked datasets separate | README, LICENSE and UCI/3W/DAMADICS entries | 199-entry discovery index; non-commercial content license. **Discovery only; use original publishers.** |
| [AAS metamodel](https://github.com/admin-shell-io/aas-specs-metamodel) | v3.2.0; updated 2026-10-28 | Schema/spec content, not runtime code | CC BY 4.0 | README, LICENSE.txt, JSON schema README and aas.json | Useful asset/submodel/semantic-reference model; not a fault ontology. **Schema reference with attribution.** |
| [Brick Schema](https://github.com/BrickSchema/Brick) | v1.5.0; updated 2026-11-09 | BSD-3-Clause | BSD-3-Clause for reviewed ontology files | README, LICENSE, ontology.py and chiller-plant TTL example | Strong HVAC equipment/point ontology; RDF/TTL needs a small JSON mapping. **Ontology reference; no full reasoner in runtime.** |
| [MIMII baseline](https://github.com/MIMII-hitachi/mimii_baseline) | Baseline 1.0.3; latest code push 2022-12-27 | No LICENSE file; source header says all rights reserved | Separate MIMII public 1.0 dataset: CC BY-SA 4.0 | readme, baseline.py, baseline.yaml, requirements | Autoencoder anomaly detection, not causal diagnosis; Python 3.6/Keras 2.1/TensorFlow 1.15. **Dataset benchmark only; do not copy baseline code.** |
| [MIMII public 1.0](https://zenodo.org/records/3384388) | Public 1.0; record modified 2020-02-29 | N/A | CC BY-SA 4.0 | Official Zenodo metadata and conditions of use | Four machine types (valves, pumps, fans, slide rails); public 1.0 has four model IDs per type; 8-channel 16 kHz audio. **Anomaly benchmark only; share-alike applies.** |
| [MIMII DUE](https://zenodo.org/records/4740355) | v1.01; 2021-05-07 | N/A | CC BY-NC-SA 4.0 | Official Zenodo metadata and conditions | Five types and six sections per type for domain shift. **Non-commercial research benchmark only.** |
| [MIMII DG](https://zenodo.org/records/6529888) | 2022-05-11 | N/A | CC BY-NC-SA 4.0 | Official Zenodo metadata and conditions | Five types including bearings and gearboxes; 4.4 GB audio. **Non-commercial domain-generalization benchmark only.** |
| [UCI hydraulic dataset 447](https://archive.ics.uci.edu/dataset/447/condition+monitoring+of+hydraulic+systems) | Dataset metadata; no release | N/A | CC BY 4.0 | Official UCI metadata and signal descriptions | 2,205 cycles, 17 signals, mixed sampling rates; condition labels are not root-cause repair facts. Raw archive not downloaded. **Offline benchmark only; group-aware split required.** |
| [LBNL FDD datasets](https://fdd.lbl.gov/fdd_datasets.html) / [OEDI record](https://data.openei.org/submissions/5763) | OEDI record updated 2024-02-12 | N/A | CC BY 4.0 confirmed through OEDI license link | Official LBNL page, OEDI metadata and license | Seven HVAC system types, 257 states and billions of points; raw CSV/TTL/PDF payloads not retrieved; full LBNL access uses a contact/registration workflow. **HVAC benchmark candidate; no runtime import.** |
| [Petrobras 3W](https://github.com/petrobras/3W) | Dataset 2.0.0; toolkit 3.2.1; repo release v1.97.0; pushed 2026-11-09 | Apache-2.0 | CC BY 4.0 | README, LICENSE, versioning, structure docs, dataset.ini, pyproject | Ten oil-well event classes; Parquet payload not opened; repo about 3.3 GB. **Isolated event benchmark only; split by well/event/source.** |
| [IBM AssetOpsBench](https://github.com/IBM/AssetOpsBench) | Updated 2026-11-09; no release found | Apache-2.0 | Scenario/telemetry data license not separately verified | README, LICENSE, SPEC, pyproject, alarms README/SECURITY/ROADMAP | Agent/operations benchmark and workflow architecture, not a validated fault library. Sample telemetry JSON/CSV not inspected. **Architecture reference only; no data import.** |
| [PlantCraft](https://github.com/PlantCraft/PlantCraft) | v0.6.0; updated 2026-11-09 | Apache-2.0 | No separate sample-data license verified | README, LICENSE, SPEC, alarms docs and pyproject | Self-hosted historian/alarms/analytics/workflow suite; broader than the Toolkit and no pump-specific causal pilot established. **Architecture reference only.** |
| [pgmpy](https://github.com/pgmpy/pgmpy) | v1.1.2; updated 2026-11-09 | MIT | No industrial data bundled | LICENSE, README, pyproject and discrete BN example | Useful BN/DBN/inference reference; Python >=3.10 scientific stack. **Offline prototype/reference only.** |
| [NASA ProgPy](https://github.com/nasa/progpy) | v1.9.0; updated 2026-11-05 | NASA Open Source Agreement stated; exact PDF version not fully reviewed | No separate dataset license reviewed | README and pyproject | Prognostics/RUL framework with pump/valve simulation examples, not root-cause diagnosis. **Research reference pending license PDF review.** |

### Additional rights and data-leakage controls

- The URMA-CRTI manifest in BearingDatasets claims CC BY 4.0, but the primary Zenodo record was not independently confirmed. The local manifest is now marked pending and the downloader fails closed unless the primary record explicitly declares CC BY 4.0.
- MIMII/MIMII DUE/MIMII DG are audio anomaly-detection benchmarks. Their labels do not become causal repair instructions. The two latter datasets are non-commercial share-alike.
- UCI hydraulic, 3W, MIMII and LBNL data are benchmark telemetry/labels. Use group splits by operating point, well/event, machine/recording/domain or building/equipment as applicable; do not randomly split overlapping windows.
- The source register now records code and data licenses separately, exact files reviewed, provenance, limitations, dependencies, mobile/Worker compatibility and decisions. No raw dataset was imported.
