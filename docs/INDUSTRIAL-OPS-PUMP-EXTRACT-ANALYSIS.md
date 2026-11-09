# Analysis of imported pump candidates against the current diagnostic engine

**Date:** 2026-11-09  
**Status:** Source analysis; recommendations only. No runtime flow or fault record changed.  
**Candidate source:** `knowledge/candidates/industrial-ops-rag-agent/pump-candidate-extract.json`

## 1. What was extracted

Nine pump records from the upstream centrifugal-pump group. Five of nine duplicate `possible_causes` as `diagnosis_steps`; those five have no usable discriminating test in the source. Four list some checks, but none provides complete measurement units, tap locations, operating conditions, expected result patterns, safety prerequisites, and traceable source-page evidence.

| Upstream ID | Symptom | Candidate value | Decision |
|---|---|---|---|
| P002-A | No flow / no suction | Candidate causes: suction air ingress, inlet valve state, impeller obstruction | Keep as hypothesis vocabulary only; diagnosis_steps duplicate causes |
| P002-B | Vibration / noise | Misalignment, foundation looseness, imbalance, bearing condition | Keep as hypothesis vocabulary only; no discriminating tests |
| P002-C | Significant seal leakage | Seal wear, face damage, O-ring ageing | Keep as hypothesis vocabulary only; no discriminating tests |
| P002-D | Bearing overheating | Lubricant condition, cooling-water condition, bearing clearance | Keep as hypothesis vocabulary only; no discriminating tests |
| P002-E | Motor overload | Fluid density, internal friction, rotor binding | Keep as hypothesis vocabulary only; no discriminating tests |
| P001-D | Mechanical-seal leakage | Location/rate, face condition, spring compression, fluid cleanliness | Candidate observations; internal checks require isolation and qualified personnel |
| P001-A | Bearing temperature high | Lubricant condition, vibration, alignment, load | Candidate measurements; units, positions, operating context and expected outcomes missing |
| P001-B | Low flow | Suction/discharge pressure, strainer differential pressure, suction air ingress, seal leakage | Highest-value overlap with existing pump low-flow workflow; still incomplete |
| P001-C | Abnormal vibration | Vibration spectrum, foundation fasteners, suction pressure, bearing clearance | Candidate checks; invasive checks require verified isolation |

The source labels such as GB/T 3215-2019 and “manual” are not verified references. No record can be promoted to a verified standard/OEM claim from this source alone.

## 2. Current engine baseline

The current code already has an adaptive `pump|low_flow` workflow with three broad hypotheses:
- supply or suction conditions;
- flow-path restriction or valve position;
- unusual operating condition or demand.

Its questions ask about source/suction status, flow-path indicators and changed operating context. This is a useful starting point, but it does not yet separate all relevant centrifugal-pump mechanisms.

The engine's question selection is explicitly a pairwise hypothesis-separation heuristic with equal-outcome assumptions. It is not empirical expected information gain and does not have validated answer likelihoods. Do not relabel it as full information-gain optimization or a calibrated Bayesian network.

Other existing workflows cover bearing vibration and motor overheating, but the candidate records are pump-specific. A motor-bearing observation must not be treated as proof that the pump's bearing is faulty without knowing sensor location, coupling arrangement and which asset was measured.

## 3. Candidate-to-engine gap map

### A. Extend `pump|low_flow` first

Potential hypotheses to review and distinguish:
1. source level / insufficient supply;
2. suction-line or strainer restriction;
3. air ingress / loss of prime (applicability depends on pump and installation);
4. cavitation / inadequate NPSH margin;
5. discharge-side restriction or valve/check-valve condition;
6. reduced pump performance from impeller/internal wear;
7. operating-point or speed mismatch;
8. measurement/instrument error.

Do not add all as active hypotheses immediately. Several overlap, and some are mechanisms rather than independent root causes. The reviewed model should use a causal hierarchy and explicit applicability constraints.

Minimum evidence bundle for a low-flow session:
- actual flow with unit, measurement point, timestamp and instrument source;
- suction and discharge pressure with tap location, gauge/absolute basis and units;
- source level and fluid identity/temperature;
- pump speed and drive frequency when available;
- valve lineup and strainer differential pressure where instrumented;
- pump model, impeller diameter, correct performance curve and system curve;
- operating stability and recent changes.

The next question should not be “is it cavitation?” from sound alone. First establish a trustworthy operating point and suction context. Compare the readings with the exact pump curve and site/OEM limits. Do not invent a universal pressure threshold.

### B. Add a dedicated `pump|seal_leak` workflow after source review

Candidate evidence:
- safe external observation of leakage location and trend/rate;
- fluid identity, hazard, temperature and operating state;
- seal arrangement and whether a flush/barrier plan exists;
- recent dry-running, startup, maintenance or process changes;
- flush/barrier indicators if fitted.

Face condition, spring compression and internal seal inspection are not operator-level live checks. They require isolation, depressurization, draining/containment, and competent personnel under the site procedure. A leak does not automatically prove seal-face failure; distinguish seal, gasket, flange and piping leak locations.

### C. Add a dedicated `pump|vibration` / `pump|noise` workflow after source review

Candidate alternatives:
- bearing degradation/lubrication/contamination;
- coupling misalignment;
- rotor imbalance;
- foundation/soft-foot/looseness;
- suction instability/cavitation;
- pipe strain or external excitation;
- measurement/sensor mounting issue.

Required context: sensor location and direction, pump speed, load/flow, vibration units and method, trend/spectrum, nearby machine vibration, maintenance history and exact machine arrangement. A single overall vibration number or sound description is not enough to identify a component.

### D. Treat pump-driven motor overload as a coupled-system case

Do not add “motor overload” as a pump-only cause. Capture motor current/power, voltage and frequency from approved instrumentation, pump flow/head, fluid density/viscosity/temperature, speed, and the motor/pump operating envelopes. Electrical tests and internal mechanical checks are for qualified personnel under verified energy isolation.

## 4. Data and knowledge boundaries

- The UCI hydraulic dataset is a labelled laboratory test rig with internal pump leakage labels, not a centrifugal-pump field fault casebook. It can test sensor-feature pipelines and robustness, not validate cavitation/air-lock troubleshooting.
- URMA-CRTI is a bearing vibration dataset, not pump assembly data. It can test signal classification and domain shift, but its units/channel mapping need validation.
- The upstream 55-record fault catalogue is a discovery source only. Its 42 duplicated diagnosis-step entries are not tests.
- Benchmark model scores must use group-aware splits and must not be represented as field accuracy.
- Every promoted diagnostic claim needs an independent technical source with the exact section/page, applicable model/configuration, review date and reviewer role.

## 5. Recommended implementation order

1. **Schema:** introduce structured diagnostic evidence objects with parameter, unit, point, instrument, timestamp, operating context, source, quality and uncertainty.
2. **Low-flow pilot:** expand the existing flow only after a reviewed cause/evidence matrix exists. Include evidence-for, evidence-against, unknowns and expected outcome patterns.
3. **Test selection:** improve the current pairwise heuristic only after answer likelihoods or explicit discrimination tables are reviewed. Include test risk, cost, time and feasibility.
4. **Seal leakage and vibration:** add as separate flows rather than forcing them into low-flow.
5. **Evaluation:** add missing/contradictory/noisy measurements, bad instruments, unsupported pump designs, language switching and safety-stop tests.
6. **Field review:** obtain qualified technician review and later compare predictions with confirmed repair outcomes.

## 6. Promotion gate

A candidate record may enter runtime only when:
- technical claims are reviewed against a suitable source;
- source and reuse rights are recorded;
- model scope and applicability are explicit;
- every test has safe preconditions and expected result patterns;
- units, measurement locations and operating conditions are defined;
- competing explanations and counter-evidence are represented;
- tests pass and a reviewer approves the content.

**Current decision:** keep all nine upstream pump records in candidate quarantine. Use only their taxonomy and questions as leads for independent evidence collection. No production diagnosis behavior changed.
