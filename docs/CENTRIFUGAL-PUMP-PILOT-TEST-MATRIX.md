# Centrifugal pump pilot — measurable test matrix

**Status:** Candidate test plan. These are software and reasoning acceptance scenarios, not operating instructions or validated field cases. They do not promote candidate knowledge into runtime.

## Differential case coverage

| Case | Distinguishing evidence to represent | Important competitors | Acceptance expectation |
|---|---|---|---|
| CP-001 Cavitation | Concurrent suction condition, flow, fluid temperature, speed and actual pump/system operating point | Suction restriction, gas entrainment, excessive flow, bearing/coupling condition | Sound alone never confirms cavitation; no universal NPSH or pressure threshold |
| CP-002 Air lock / loss of prime | Pump design and priming arrangement, source availability, pressure/flow development during approved startup | Empty source, closed valve, blocked strainer, suction air ingress, sensor fault | Do not infer air lock from low flow alone; no opening/venting of a pressurized system |
| CP-003 Suction blockage | Comparable suction pressure loss and strainer differential pressure, source level, flow and fluid condition | Low source level, valve lineup, air ingress, high viscosity, transmitter error | Compare at comparable flow and conditions; no physical opening before isolation and site authorization |
| CP-004 Low flow | Flow, suction/discharge pressure, actual speed, source level, valve/system state and correct pump curve | Suction restriction, discharge resistance, reduced speed, internal wear, gas, flowmeter error | Treat low flow as a symptom; retain all unresolved hypotheses until discriminating evidence exists |
| CP-005 Mechanical seal leakage | Leakage origin/trend, seal plan, fluid compatibility, temperature, flush/barrier indicators and maintenance history | Gasket/flange/casing leak, dry running, misalignment, vibration | A visible leak does not prove seal-face failure; exact seal arrangement matters |
| CP-006 Bearing degradation | Bearing temperature/vibration trends, lubrication history, speed/load and measurement location | Misalignment, imbalance, looseness, hydraulic excitation, sensor fault | A noise or temperature observation alone does not confirm bearing damage |

## Input-quality scenarios

1. No measurement supplied: all hypotheses remain unresolved.
2. Estimated reading: preserve as estimated; never present as a direct measurement.
3. PLC and Historian values: retain their provenance; command/frequency is not independently verified shaft speed.
4. Suspect or failed sensor: exclude the reading from accepted evidence.
5. Noisy, stale or contradictory reading: exclude from accepted evidence and expose the rejection reason.
6. Duplicate tag/name with conflicting values: require reconciliation; do not average silently.
7. Unknown measurement name or incompatible unit: reject rather than coerce.
8. Missing location, operating condition or timestamp: mark incomplete; do not promote to validated evidence.
9. Conflicting evidence: preserve both sides and do not force a root cause.
10. Single symptom or sound: never promote to a confirmed fault.

## Test selection and information value

- Current casebook triage uses safe installed-indicator coverage and qualitative time/resource costs. It is not expected information gain.
- The Bayesian engine may calculate expected information gain only when complete outcome likelihoods are supplied and the configured source resolver approves them.
- No reviewed, equipment-specific likelihood table is currently registered for this pump pilot. Therefore the pilot must not claim that an automatically selected test is the mathematically optimal next test.
- Safety eligibility, access authorization, time and cost are constraints, not weights that can make an unsafe test eligible.

## Release gate

The six cases remain candidate-only until their case-specific measurements, competing hypotheses, expected outcomes, uncertainty and verification criteria are reviewed. Software tests passing does not constitute technical review, source approval, field validation or permission to include a case in runtime.
