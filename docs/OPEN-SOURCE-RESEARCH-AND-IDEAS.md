# Open-source research: ideas for Maintenance AI Toolkit

> Research snapshot: 2026-11-09. This is a shortlist for technical evaluation, not an endorsement or a statement that the projects are production-ready. Repository contents, releases, licenses, and dependencies must be rechecked before any code reuse.

## Executive findings

The strongest opportunity is to evolve from symptom-to-rule lookup into an evidence-centred maintenance intelligence workflow. External projects suggest several complementary capabilities:

1. **Condition anomaly detection** — learn a baseline and flag unusual sensor behavior.
2. **Operating-regime normalization** — compare like with like; speed/load changes can make healthy behavior look anomalous.
3. **Signal-quality and data-quality validation** — reject or qualify missing, duplicated, misordered, or incorrectly-unitized readings before diagnosis.
4. **Change-point and drift detection** — notice gradual process changes and shifts in normal behavior.
5. **Prognostics with uncertainty** — estimate remaining useful life only when the data and validation support it.
6. **Edge resilience** — buffer telemetry during connectivity loss and replay it in order.
7. **Reproducible scientific validation** — report false alarms, missed detections, uncertainty intervals, out-of-distribution conditions, and synthetic-vs-real evidence.
8. **Fault diagnosis remains a separate layer** — an anomaly score is not a root-cause diagnosis.

## Projects reviewed

### 1. Vicena Labs — Industrial Predictive Maintenance Twin
- Repository: https://github.com/vicena-labs/industrial-predictive-maintenance-twin
- License declared in repository README: MIT.
- Relevant ideas: explicit CSV/Parquet schema and units; data-quality checks; windowed vibration/current/temperature features; operating-regime normalization by speed/load; held-out asset and forward-time validation; false-alarm/missed-detection reporting; OOD reporting; uncertainty and validation levels.
- Important limitation declared by the project: bundled data and reported metrics are synthetic; validation level 0; anomaly detection is implemented, diagnosis is not, and the RUL example is illustrative.
- Potential use: adopt the **data contract, validation protocol, and separation of anomaly/diagnosis/prognosis**, not its model outputs as ready-to-use predictions.
- Review before reuse: inspect model code, dependency tree, tests, and MIT license file. Keep its scientific caveats visible.

### 2. PHAEMOS — open industrial IoT predictive-maintenance platform
- Repository: https://github.com/phaemos/phaemos
- License declared in README: AGPL-3.0-or-later for software; hardware uses CERN-OHL-S-2.0.
- Relevant ideas: sensor ingestion, vibration FFT, multi-sensor telemetry, Isolation Forest anomaly scoring, simulator with injectable faults, alert rules, audit trail, role-based access, and a Rust edge gateway that buffers data during network outages.
- Important limitation declared by the project: the software pipeline uses simulated readings while physical nodes and model training on real readings remain in progress.
- Potential use: architecture reference for a future optional sensor/condition-monitoring module, simulator-based testing, and store-and-forward synchronization.
- License warning: AGPL is a strong copyleft license. Do not copy or combine code into this repository without a deliberate license-compatibility decision. Architectural learning from public documentation is different from code reuse.

### 3. NASA — ProgPy
- Repository: https://github.com/nasa/progpy
- License: NASA Open Source Agreement (NOSA); review the exact license and obligations before reuse.
- Relevant ideas: prognostics model abstractions, state estimation, prediction, uncertainty propagation, and RUL-oriented evaluation.
- Potential use: future research reference for a distinct prognosis module after data collection, calibration, and validation.
- Limitation: a framework is not a substitute for equipment-specific degradation models and run-to-failure evidence. Do not turn generic examples into maintenance intervals.

### 4. Salesforce — Merlion
- Repository: https://github.com/salesforce/Merlion
- Relevant ideas: time-series forecasting and anomaly detection; univariate and multivariate methods; ensembles; change-point detection; preprocessing; standardized dataset loaders and evaluation workflows.
- Potential use: compare algorithms offline on curated datasets; borrow evaluation design and model-selection concepts.
- Review before reuse: confirm current maintenance status, exact license, dependency weight, supported Python/runtime environment, and whether the selected components can run within a browser/Android-oriented product. Likely better as an offline research/benchmark environment than as a direct browser dependency.

### 5. River — online machine learning
- Repository: https://github.com/online-ml/river
- License declared in README: BSD-3-Clause.
- Relevant ideas: incremental learning from one observation at a time, streaming anomaly detection, drift detection, online statistics, and progressive evaluation.
- Potential use: a future edge/streaming monitor that updates baselines gradually while detecting concept drift.
- Guardrail: do not let a model learn unreviewed fault labels or contaminated data automatically. Require quality checks, drift alerts, versioning, and human approval for model promotion.

### 6. Edge Impulse expert projects
- Repository: https://github.com/edgeimpulse/expert-projects
- Relevant ideas: embedded predictive-maintenance examples using vibration, audio, motor/pump signals, compressors, fluid leaks, and clog detection.
- Potential use: reference designs for low-cost sensor acquisition and feature extraction, especially if a future optional ESP32/STM32 sensor companion is considered.
- Guardrail: inspect each subproject's own license, hardware assumptions, data rights, and field validation separately.

### 7. Awesome Industrial Automation / Industrial AI catalogues
- Catalogue: https://awesome-industrial.github.io/awesome-industrial-automation/
- Related catalogue: https://github.com/ishandutta2007/Awesome-Industrial-AI
- Value: discovery map for tools and datasets such as Alibi Detect, Anomalib, Darts, Orion, PyOD, ProgPy, CWRU, MIMII, Paderborn, NASA PCoE, SKAB, and Tennessee Eastman.
- Limitation: curated lists are discovery indexes, not quality assurance. Each candidate must be evaluated independently.

## Datasets worth evaluating

| Dataset / source | Useful domain | What it can test | Caution |
|---|---|---|---|
| CWRU Bearing Data Center | Rolling bearings | Vibration-based fault classification and feature extraction | Lab-seeded faults do not represent every field condition |
| Paderborn Bearing Data Center | Bearings | Vibration and motor-current diagnostics | Preserve operating conditions and data split rules |
| MIMII | Pumps, valves, fans, slide rails | Acoustic anomaly detection | Sound anomalies do not by themselves identify root cause |
| NASA PCoE / C-MAPSS | Turbofan degradation | Prognostics/RUL research | Domain-specific; not transferable to pumps/motors without validation |
| SKAB | Water circulation testbed | Sensor anomaly detection and change points | Benchmark performance is not industrial field validation |
| Tennessee Eastman Process | Process plant simulation | Multivariate process fault detection/diagnosis | Simulated process model; document its scope |
| HAI / SWaT | Industrial control/process data | Process anomaly and cyber-physical event research | Respect dataset terms, context, and security implications |

## New product ideas that were not explicit in the initial feature list

### A. Diagnostic evidence graph
Represent components, failure modes, symptoms, mechanisms, operating conditions, measurements, and tests as a graph. A fault hypothesis can then explain causal paths rather than relying only on a flat list of keywords.

Example: reduced pump flow may connect to suction restriction, air ingress, cavitation, speed reduction, impeller damage, discharge restriction, or process-demand change. Each path should identify discriminating evidence and expected observations.

### B. "What would disprove this?" counter-evidence
For every leading hypothesis, ask which observation should be present if it were true and which safe test could weaken or eliminate it. This reduces confirmation bias and makes the diagnostic interview more scientific.

### C. Test selection by expected information gain
Choose the next test that best separates the leading hypotheses, adjusted for:
- hazard and competence requirements,
- time and tool availability,
- cost and downtime,
- whether the reading can be measured reliably,
- whether the test is possible in the current operating state.

### D. Operating-regime-aware baselines
Do not compare motor current, temperature, vibration, pressure, or flow without considering load, speed, ambient temperature, fluid properties, and operating state. A healthy machine at high load may look abnormal against a low-load baseline.

### E. Measurement confidence and sensor health
Track sensor identity/location, calibration date, range, resolution, sampling rate, unit, missingness, timestamp quality, and plausible bounds. A bad sensor or poor measurement can otherwise become a false machine diagnosis.

### F. Change-point and degradation timeline
Show when a signal first departed from its own baseline, whether it recovered, and whether the change coincided with a maintenance action, process change, load shift, or component replacement.

### G. Failure Mode and Effects Analysis (FMEA) / criticality layer
Link failure modes to severity, occurrence, detectability, and asset criticality. Use this to prioritize inspection and escalation, not to override safety or claim exact risk probabilities.

### H. Confidence calibration and abstention
Use explicit states such as "insufficient evidence", "several plausible causes", "strongly supported", and "confirmed by inspection". If the system has not been calibrated, avoid numeric probability claims.

### I. Technician feedback loop with evidence quality
Capture predicted cause, chosen tests, actual findings, repair, post-repair readings, recurrence, and reviewer status. Use the result to improve knowledge only after quality review; never treat every user selection as ground truth.

### J. Maintenance procedure and spare-part context
Connect a diagnosis to the relevant manual section, approved work procedure, tools, consumables, spare parts, and verification steps. Keep exact-model applicability explicit.

### K. Sensor-data simulator and digital test bench
Build synthetic but physically plausible cases with controllable faults, load changes, sensor noise, missing readings, drift, and recovery. Use it to test engine behavior and regression cases, clearly labelled synthetic.

### L. Explainable alert triage
For each alert, show baseline, deviation, affected signals, data quality, operating regime, duration, and recommended safe next step. Avoid an alert that says only "AI detected anomaly".

## Recommended implementation order

1. **Now:** formalize evidence/hypothesis/test/result schemas and add contradiction + data-quality handling to local diagnosis.
2. **Next:** build a source-grounded evidence graph for a small number of priority equipment classes (pump, motor/VFD, compressor, gearbox/bearing).
3. **Then:** add information-gain question selection and counter-evidence prompts.
4. **In parallel:** audit safety coverage and add adversarial regression cases.
5. **After schemas are stable:** build a benchmark harness using public datasets; report false alarms, missed detections, and domain limitations.
6. **Later:** add operating-regime-aware anomaly/trend analysis for uploaded CSV data.
7. **Only after real data and validation:** consider prognosis/RUL and sensor/edge integrations.

## Adoption decision

| Candidate | Recommended action | Why |
|---|---|---|
| Vicena twin | Study and selectively adapt methodology | Strong data-quality, validation, regime normalization, and scientific caveats |
| PHAEMOS | Architecture inspiration only for now | Useful edge/sensor pipeline; AGPL and simulated-data maturity require caution |
| NASA ProgPy | Research reference for later prognosis | Useful uncertainty-aware prognostics framework; not an immediate diagnostic dependency |
| Merlion | Benchmark offline | Broad time-series methods; likely heavy for direct browser/mobile integration |
| River | Prototype later for streaming/drift | Useful online learning patterns; must guard against feedback contamination |
| Edge Impulse projects | Study individual sensor examples | Useful acquisition/embedded examples; per-project validation/license review needed |
| Dataset catalogues | Use to select test datasets | Valuable discovery layer, not evidence of model quality |

## Review checklist before code reuse

- Confirm exact repository commit/release and maintenance activity.
- Read the full license and any dataset/model/hardware licenses.
- Inspect dependency vulnerabilities, install scripts, network calls, and telemetry.
- Check whether data are synthetic, lab-generated, or field-collected.
- Reproduce documented tests and results before adapting.
- Keep a clear attribution and third-party notice.
- Add our own tests and retain the original method limitations.
- Do not import models or claims into production knowledge without domain validation.

## Sources reviewed

- https://github.com/vicena-labs/industrial-predictive-maintenance-twin
- https://github.com/phaemos/phaemos
- https://github.com/nasa/progpy
- https://github.com/salesforce/Merlion
- https://github.com/online-ml/river
- https://github.com/edgeimpulse/expert-projects
- https://awesome-industrial.github.io/awesome-industrial-automation/
- https://github.com/ishandutta2007/Awesome-Industrial-AI


## 8. Causal and probabilistic reasoning projects

These projects are especially relevant to the longer-term goal of moving from symptom correlation toward explicit causal reasoning. They are research/engineering references, not ready-made industrial fault diagnosis systems.

### 8.1 pgmpy — Bayesian networks and causal reasoning
- Repository: https://github.com/pgmpy/pgmpy
- License shown by GitHub: MIT.
- Capabilities described by the project: Bayesian and dynamic Bayesian networks, causal graphs, structure learning with expert knowledge, parameter estimation, probabilistic inference, causal identification, simulation, and model validation.
- Potential value: represent relationships such as operating condition → component stress → failure mechanism → observed symptom; update posterior beliefs when new evidence is observed; simulate expected observations.
- Recommended use: prototype small expert-authored Bayesian networks for one equipment family (for example centrifugal pumps or induction motors). Keep priors and conditional probabilities traceable to engineering evidence or clearly labelled expert assumptions.
- Caution: structure learned from observational data is not automatically causal. Hidden confounders, operating regime, sensor bias, and small datasets can produce misleading graphs. Do not generate production probabilities from uncalibrated or synthetic-only data.

### 8.2 DoWhy — causal assumptions, refutation, and root-cause analysis
- Repository: https://github.com/py-why/dowhy
- License shown by GitHub: MIT.
- Capabilities described by the project: explicit causal models, estimation, sensitivity analysis, refutation/falsification of assumptions, counterfactuals, and root-cause attribution for changes in distributions.
- Potential value: encourage a disciplined "what evidence would refute this explanation?" workflow; evaluate causal assumptions instead of accepting a model's explanation at face value.
- Recommended use: study its refutation and causal-model workflow for offline research and for test design. Consider it for post-event analysis only after the app has a well-defined data model.
- Caution: many DoWhy examples concern treatment effects or non-industrial domains. It is not an equipment diagnostic knowledge base; transfer requires a valid causal graph and domain-specific validation.

### 8.3 pyAgrum — probabilistic graphical models and decision support
- Project site: https://pyagrum.gitlab.io/
- License: dual LGPL-3.0 / MIT according to project documentation; confirm which license applies to the exact component and distribution.
- Capabilities described by the project: Bayesian networks, probabilistic prediction, causal analysis, influence diagrams, and decision-making under uncertainty.
- Potential value: influence diagrams may help formalize the trade-off between test value, test cost, downtime, and risk.
- Recommended use: compare its decision-network abstractions with the proposed information-gain test selector; do not add the dependency to the browser app without a deployment/runtime study.

## 9. Important theoretical distinction

The product should maintain four separate reasoning layers:

1. **Anomaly detection:** "This signal or behavior differs from an expected baseline."
2. **Fault diagnosis:** "These failure mechanisms plausibly explain the observations."
3. **Causal analysis:** "This mechanism is supported by a causal model and survives stated assumption checks."
4. **Prognosis:** "Given a validated degradation model and relevant history, this is a qualified estimate of future condition or remaining life."

A causal graph or Bayesian network can make assumptions explicit, but it does not make them true. Field confirmation, calibration, source traceability, and validation remain mandatory.

## 10. Additional recommended experiment

Create a small synthetic pump fault graph with causes such as suction restriction, air ingress, cavitation, speed reduction, impeller wear, and discharge restriction. Generate cases with known hidden causes and deliberately inject:
- missing flow or pressure readings,
- sensor bias and unit mistakes,
- changes in speed/load,
- two simultaneous faults,
- contradictory measurements,
- a confounding process-demand change.

Compare three strategies:
- static symptom matching,
- transparent rule/evidence ranking,
- Bayesian network plus information-gain test selection.

Evaluate top-k cause ranking, false confidence, number of tests needed, unsafe test proposals, and abstention when evidence is inadequate. Keep synthetic results labelled as simulation only. This experiment can show whether the added reasoning complexity improves decisions before any real-world claim is made.
