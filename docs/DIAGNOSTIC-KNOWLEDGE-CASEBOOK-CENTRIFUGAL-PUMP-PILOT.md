# Diagnostic Knowledge Casebook — Centrifugal Pump Pilot

**Status:** Design specification and candidate case templates; not yet approved as runtime knowledge.  
**Priority:** Convert source-backed knowledge into measurable diagnostic cases rather than increasing raw fault-record count.  
**Initial asset family:** Centrifugal pumps.  
**Languages:** Arabic-first, with stable English technical terms and French equivalents added during content review.

## 1. Product behavior

When a technician selects **Centrifugal Pump**, the application should expose a linked technical knowledge profile and then enter a guided diagnostic workflow.

1. **Equipment profile:** pump type, manufacturer, exact model, serial/variant where relevant, duty, fluid, temperature, speed/drive, suction arrangement, installation orientation, seal and bearing arrangement, and system context. Unknown values remain explicitly unknown.
2. **Component map:** component, function, failure modes, observable symptoms, measurable indicators, safe inspection boundaries, and references.
3. **Diagnostic cases:** each case is a testable hypothesis, not just a fault title. It includes supporting evidence, contradicting evidence, competing explanations, discriminating tests, expected result patterns, stop conditions, and source provenance.
4. **Interactive reasoning:** rank hypotheses transparently; ask the next question/test that is most informative and safe; update confidence only when evidence is entered. Do not fabricate probabilities or treat a heuristic score as calibrated probability.
5. **Outcome capture:** record confirmed cause, repair, verification run, and whether the predicted evidence matched the actual outcome. Keep unresolved cases unresolved.

## 2. Component knowledge map

| Component | Primary function | Failure modes to represent | Evidence that may be useful |
|---|---|---|---|
| Impeller | Transfers energy to fluid | Erosion, corrosion, blockage, damage, wear, incorrect installation | Flow, differential/head, power/current trend, vibration, inspection after isolation |
| Casing / volute / diffuser | Converts velocity and guides flow | Erosion, corrosion, blockage, cracking, internal recirculation | Pressure/head, leakage, operating point, inspection |
| Shaft | Transmits torque | Deflection, fatigue, corrosion, damage | Vibration trends, alignment, runout measured by qualified personnel after isolation |
| Bearings | Support shaft and control rotor position | Lubrication failure, contamination, fatigue, incorrect fit, overheating | Temperature and vibration trends, lubricant condition, noise; model-specific limits |
| Mechanical seal / packing | Controls leakage along shaft | Face wear, dry running, misalignment, elastomer incompatibility, installation damage | Leakage location/rate, temperature, flush/barrier condition, operating history |
| Wear rings / clearances | Limit internal recirculation | Excessive clearance, wear, rubbing | Performance degradation and dimensional inspection after isolation |
| Coupling | Transfers torque between driver and pump | Misalignment, wear, looseness, damage | Vibration, temperature, alignment records; inspect only in safe isolated state |
| Suction piping / strainer / foot valve | Supplies fluid to pump | Restriction, air ingress, blockage, closed valve, inadequate submergence | Suction pressure, source level, differential pressure across strainer if instrumented, valve indication |
| Discharge piping / valve / check valve | Delivers and controls flow | Restriction, incorrect lineup, stuck check valve, leakage | Discharge pressure, flow, valve position, system curve and operating history |
| Baseplate / foundation | Supports and aligns assembly | Looseness, soft foot, grout/foundation deterioration, pipe strain | Vibration, movement, alignment history, inspection after safe isolation |

This table is a taxonomy scaffold, not a claim that every pump contains every listed component. The exact pump design and OEM documentation determine applicability.

## 3. Minimum diagnostic case schema

Each case must carry the following fields before it can be considered publishable:

- `caseId`, `title`, `equipmentFamily`, `applicability`, `failureMode`, `mechanism`.
- `symptoms`: observable facts, not inferred causes.
- `requiredContext`: fluid, operating point, system arrangement, pump/driver model, recent changes.
- `hypotheses`: cause, supporting evidence, contradicting evidence, confounders, and scope.
- `measurements`: name, unit, measurement location, instrument/source, operating condition, baseline/reference, uncertainty and timestamp.
- `tests`: prerequisite safe state, authorized role, method at a high level, expected patterns per hypothesis, interpretation limits, and stop/escalation conditions.
- `decisionLogic`: conditional evidence relationships; never hard-code universal numeric thresholds when the correct limit depends on model, fluid, installation or operating envelope.
- `actions`: only safe, authorized next steps; distinguish observation, operator action, and qualified-personnel intervention.
- `verification`: post-repair acceptance evidence and repeat measurement conditions.
- `sources`: exact source title, publisher/OEM, URL, revision/date, section/page, claim supported, license/reuse status, review date, reviewer role, evidence class.
- `status`: candidate, source-reviewed, technically-reviewed, field-validated, retired.
- `limitations`: known missing information and what the case cannot conclude.

A record is not source-verified merely because a URL exists. The reviewer must inspect the cited source passage and confirm that it supports the specific claim and scope.

## 4. Pilot differential diagnosis cases

These are candidate patterns for expert/source review, not ready-to-publish OEM procedures. Directional patterns are conditional and must be interpreted against the pump curve, system curve, fluid properties, instrument accuracy, and operating conditions.

### CP-001 — Cavitation / inadequate NPSH margin

**Mechanism:** Local pressure at the impeller eye falls sufficiently for vapor formation; bubble collapse can produce noise, vibration, material damage and performance loss. Other hydraulic instability and mechanical faults can sound similar.

**Competing hypotheses:** suction restriction; insufficient source level or submergence; excessive fluid temperature or vapor pressure; excessive flow / operation outside preferred range; air ingress; damaged impeller; bearing or coupling fault.

**Measurements to capture:** suction pressure at a defined tap, discharge pressure, flow, source liquid level, fluid temperature, speed, valve lineup, strainer differential pressure if instrumented, vibration trend and measurement location. Record units, instrument IDs and operating stability.

**Evidence that may support this hypothesis:** noisy/unstable operation together with reduced suction pressure or reduced available NPSH margin under the actual flow and fluid conditions; deterioration that changes with operating point. Noise alone is insufficient.

**Evidence against / alternative clues:** normal suction conditions and stable performance weaken (but do not independently eliminate) this hypothesis; a strong vibration frequency signature or bearing temperature trend may instead direct investigation toward rotating components.

**Safe next checks:** use installed gauges/transmitters and approved remote indicators; compare readings with the correct OEM curve and system design; record readings at stable operating points only when operation is safe. Do not deliberately throttle, starve, vent, or alter valves as an experiment without an approved procedure and competent authorization.

**Expected outcome:** a suction/NPSH-related issue should show a coherent relationship between suction conditions, flow and the operating point. No single universal pressure or vibration threshold is valid across all pumps.

### CP-002 — Air lock / trapped gas / loss of prime

**Mechanism:** Gas accumulation or loss of prime prevents the pump from developing the expected liquid flow/head. Applicability depends on pump type and installation; some designs are not self-priming.

**Competing hypotheses:** empty source, closed suction valve, blocked strainer, air leak on suction side, vapor formation, failed foot/check valve, incorrect startup/priming procedure, instrument fault.

**Measurements to capture:** source level, suction and discharge pressure behavior during the approved startup sequence, flow indication, pump speed, valve-position indications, priming/vent status where instrumented, and recent maintenance/intervention.

**Supporting pattern:** pump speed/command is present but expected liquid flow and pressure development do not occur, with evidence of gas ingress or loss of prime. This pattern is not unique.

**Discriminating checks:** verify source availability and valve-position indication; review the approved priming design/procedure and instrument plausibility; have qualified personnel inspect suspected suction-side ingress only after required isolation and depressurization.

**Safety boundary:** never loosen a fitting or open a vent on a pressurized/hot/hazardous-fluid system to “see if air comes out.” Do not run a pump dry unless the manufacturer explicitly permits the exact operating condition.

### CP-003 — Suction blockage / restriction

**Mechanism:** Increased resistance on the suction side reduces available inlet pressure/flow and can lead to reduced capacity and/or cavitation.

**Competing hypotheses:** low tank level, closed or partially closed valve, clogged strainer, collapsed/obstructed line, incorrect pipe configuration, high fluid viscosity, air ingress, inaccurate pressure instrument.

**Measurements:** suction pressure at known location, flow, source level, differential pressure across strainer where available, fluid temperature/viscosity context, speed, valve position and trend before/after the reported change.

**Supporting pattern:** restriction is more plausible when suction-side pressure loss or strainer differential pressure increases relative to a known clean baseline at comparable flow. Compare at comparable conditions; raw readings at different flow rates are not directly equivalent.

**Safe tests:** inspect remote level/valve/pressure indications; compare instrument readings with validated baseline; plan physical inspection/cleaning only after energy isolation, depressurization, drainage and site-specific controls.

**Do not:** open a strainer, remove a plug, disconnect a suction line, or manipulate a valve under uncertain pressure/energy conditions.

### CP-004 — Low flow: system restriction or operating-point mismatch

**Mechanism:** Actual flow is determined by pump performance and system resistance. Low flow may result from system-side restriction, incorrect valve lineup, excessive system head, low speed, wrong rotation, internal wear, or measurement error.

**Measurements:** calibrated flow, suction/discharge pressure, speed/frequency, valve position, source level, fluid properties, motor current/power where safely available, and the correct pump curve for the installed impeller/speed.

**Reasoning:** plot/compare the measured operating point against the applicable pump curve and system curve. A pressure reading alone does not identify the cause. Check whether the flow instrument is suitable and functioning before drawing conclusions.

**Expected patterns:** a system restriction can shift the operating point toward lower flow and higher system resistance; reduced speed changes the pump curve; internal wear can reduce developed head/capacity relative to a sound reference. These patterns require model- and installation-specific comparison.

### CP-005 — Mechanical seal leakage

**Mechanism:** Leakage can arise from seal-face damage/wear, dry running, misalignment, vibration, unsuitable fluid/material compatibility, incorrect installation, or loss of required flush/barrier conditions.

**Measurements/context:** leakage location and trend, fluid identity and hazard, temperature, pressure, pump operating state, seal arrangement, flush/barrier pressure and flow if fitted, vibration trend, startup/dry-run history, and recent maintenance.

**Discriminating evidence:** distinguish seal leakage from flange/gasket/casing/piping leakage by safe external observation; compare seal support-system indicators with the exact seal plan and OEM requirements. Leakage alone does not prove a failed seal face.

**Safety:** identify fluid hazards and contain from a safe position. Do not touch, tighten or dismantle a pressurized seal/gland. Isolation and depressurization must be verified before intervention.

### CP-006 — Bearing degradation / lubrication issue

**Mechanism:** fatigue, contamination, inadequate/excess lubricant, incorrect lubricant, misalignment, electrical fluting or installation errors can cause bearing damage.

**Measurements:** vibration spectrum/trend with sensor location and machine speed, bearing temperature trend, lubricant type/condition and maintenance history, noise observations, load and operating point. Use manufacturer/standard guidance for interpretation and limits.

**Discriminating evidence:** a repeatable bearing-related vibration pattern plus corroborating temperature/lubricant/history evidence is stronger than noise alone. Cavitation, imbalance, looseness and misalignment can overlap in vibration observations.

**Safety:** no contact with rotating equipment; no guard removal during operation. Internal inspection and lubrication work require the site energy-control procedure and competent personnel.

## 5. Measurement record format

Every measurement entry must include:

| Field | Example format (not a setpoint) |
|---|---|
| Parameter | Suction pressure |
| Value | Numeric value entered by technician |
| Unit | kPa(g), bar(g), m, °C, m³/h, rpm, A, mm/s — as applicable |
| Measurement point | Defined tap/sensor/location |
| Instrument | Gauge/transmitter ID and calibration status if known |
| Operating state | Speed, flow/valve state, fluid and stable/transient condition |
| Time | Timestamp and timezone |
| Reference | OEM curve, baseline, site limit or “not available” |
| Quality | Measured / controller-indicated / estimated / unknown |
| Notes | Uncertainty, sensor fault, abnormal context |

Never silently convert an indicated value into a calibrated measurement. Preserve the original value and unit when converting.

## 6. Evidence and source rules

1. Prefer exact pump OEM manual, performance curve, installation/operation manual and seal/bearing documentation for the exact model/configuration.
2. Use recognized engineering references and peer-reviewed open-access research for general mechanisms, clearly marked as generic.
3. Link every technical claim to the precise section/page or figure reviewed.
4. Record the license/reuse terms separately from technical authority. A technically authoritative manual may be reference-only if reproduction rights are not granted.
5. Do not copy protected manual text, figures or tables. Store concise original summaries and citations.
6. Do not use a generic centrifugal-pump reference to assert model-specific limits, alarm meanings, clearances, torque, NPSHr values or acceptance criteria.
7. Mark all pilot cases `candidate` until a qualified reviewer confirms technical correctness and source support; field validation is a separate status.

## 7. Diagnostic workflow and test selection

The engine should:
- Gather the minimum context needed to interpret measurements before ranking causes.
- Display multiple hypotheses with evidence for, evidence against, and unknowns.
- Select the next test by expected information gain subject to safety, feasibility, cost and time.
- Prefer non-invasive installed-instrument observations before invasive inspection.
- Never recommend a test whose preconditions or safe state are unknown.
- Explain what different results would mean before asking the technician to perform an authorized test.
- Update ranking only from user-entered observations; do not invent readings.
- Stop and escalate when stop-work conditions are present.
- Keep a traceable log of question, answer, test, reading, source and reasoning change.

A rule-based score is not a calibrated probability. If Bayesian inference is later introduced, document priors, likelihood assumptions, missing-data handling, calibration and validation; expose uncertainty and avoid false precision.

## 8. Acceptance tests for the pilot

- A pump selection opens the component map and linked cases without mixing pump types or unsupported components.
- “Low flow” does not automatically return “cavitation”; it asks for suction/discharge pressure, flow, level, speed, fluid and operating context as relevant.
- Cavitation, air lock, suction blockage and system restriction remain separate hypotheses with overlapping evidence explicitly acknowledged.
- Missing readings remain unknown; no default values or invented thresholds are inserted.
- Each measurement has unit, location, operating condition and provenance.
- A pressure value without tap location or operating condition is flagged as incomplete.
- Unsafe requests (opening a pressurized line, hand-checking hydraulic leakage, bypassing protection, removing guards while running) trigger a safety stop, not a diagnostic branch.
- Source links that do not support the claim cannot mark it verified.
- A source license failure blocks content redistribution, not necessarily a reference link.
- Contradictory readings lower confidence or trigger instrument/context validation rather than forcing a single cause.
- A repaired case requires post-repair verification evidence before it can be labelled field-validated.
- Arabic/French/English labels retain stable technical identifiers and units; RTL rendering does not corrupt symbols or numbers.

## 9. Next implementation sequence

1. Review the current pump material and source registry; map every existing claim to a source and evidence status.
2. Create a normalized JSON schema and validator for diagnostic cases and measurements.
3. Convert one pump case at a time into structured, reviewed records; start with low-flow differential diagnosis.
4. Build a local deterministic case runner and test harness before connecting cases to the AI layer.
5. Add safe test-selection logic and evidence-for/against presentation.
6. Validate with contradictory, missing and noisy measurements; compare expected recommendations with qualified technician review.
7. Only after acceptance, integrate reviewed records into the runtime knowledge bundle.

**Non-goals for this pilot:** importing large raw vibration datasets into the Android bundle; claiming universal thresholds; automatic fault diagnosis from a single symptom; displaying uncalibrated probabilities or RUL; importing unlicensed third-party content.


## 8. Source and implementation review — 2026-11-09

### Open-access research sources reviewed

1. **Ahmad et al., “Multistage Centrifugal Pump Fault Diagnosis Using Informative Ratio Principal Component Analysis” (2021), PMCID PMC8747656, DOI 10.3390/s22010179.** License: CC BY 4.0, confirmed on the full-text page. Reviewed sections 1, 3–6, Figure 2–4 and Tables 2–5. The experiment is limited to one PMT-4008 multistage pump rig, 5.5 kW motor, water loop, 1733 rpm, four accelerometers and three seeded states (mechanical-seal hole, mechanical-seal scratch and impeller defect), with 300 seconds recorded per state. The paper supports research on vibration-feature classification for those seeded test-rig states only. Its reported 100% classification result is not a calibrated field probability. Cavitation is explicitly left as future work; this paper does not validate cavitation, air-lock, suction blockage or field low-flow diagnosis.

2. **Irfan et al., “A Novel Feature Extraction and Fault Detection Technique for the Intelligent Fault Identification of Water Pump Bearings” (2021), PMCID PMC8234243, DOI 10.3390/s21124225.** License: CC BY 4.0, confirmed on the full-text page. Reviewed sections 1 and 3–6, including the experimental setup and result tables. The experiment uses a laboratory 2 HP induction motor, 6202-2z bearing, two seeded bearing defects, current/voltage/instantaneous-power features and 640 samples across three load states. The paper reports a 70/30 split and up to 100% classification on its own test setup; raw data are not supplied in the article. This is a research reference for the paper's lab conditions, not a field procedure, universal threshold or pump-specific bearing acceptance rule.

### Evidence coverage decision

| Pilot case | Current evidence status | Decision |
|---|---|---|
| Cavitation | No reviewed primary source with a claim-level section/page and operating envelope in this pilot | Source gap; do not promote |
| Air Lock | No reviewed primary source with a claim-level section/page | Source gap; do not promote |
| Suction Blockage | No reviewed primary source with a claim-level section/page | Source gap; do not promote |
| Low Flow | Existing runtime records are not enough to distinguish hydraulic causes under a model-specific pump curve | Source gap; do not confirm a cause |
| Mechanical Seal Leakage | The 2021 paper covers seeded seal defects on one rig, not a field leakage-rate or safe inspection procedure | Research reference only |
| Bearing Degradation | The 2021 paper covers two seeded defects on one lab bearing/motor setup, not field thresholds | Research reference only |

No paper text, figures, tables or raw data were copied. The two sources are registered in `knowledge/sources.json` with scope and limitations. Neither source creates an OEM-verified pump claim.

### Current runtime gap

- `decision-trees.json` contains an 8-node pump screening tree with three branching questions and five result endpoints. It is not the six-case differential pilot.
- The shared diagnostic registry contains 13 equipment/symptom flows: six adaptive sessions and seven single-step entries. The pump adaptive flow still groups the problem into three broad hypotheses; it does not independently resolve the six pilot cases.
- `bayesian-engine.js` is a qualitative log-odds support scorer with fixed prior 0.2 and fixed likelihood ratio 1.5. It is not a calibrated Bayesian network or a validated probability model.
- The next-question selector uses hypothesis separation/equal-outcome logic. Expected information gain, test time, test cost and safety risk are not yet jointly optimized.
- The core `faults.json` has 17 pump records, but none has a source reference. The OEM-verified registry has no pump record.

### Pilot gate

No pump case enters runtime until every claim has a permitted source, exact section/page, equipment scope, units, measurement location, operating conditions, supporting and opposing evidence, safe test prerequisites, expected results for competing hypotheses, stop conditions, post-repair verification and automated tests for missing, contradictory, noisy and invalid measurements. Actual measurements, PLC-indicated values and estimates must remain distinct. No general numeric threshold is allowed without the applicable model/curve/fluid/installation source.
