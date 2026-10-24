# Local Diagnostic Coverage Matrix and Evidence Gaps

**Baseline:** `feature/local-diagnostic-engine` at audit time.  
**Purpose:** inventory links from equipment type → symptom IDs → fault records → exact diagnostic-flow coverage → technical-reference status. This is a structural inventory, not a validation of engineering correctness.

## Summary

- Fault records: **152**
- Equipment types: **32**
- Structured diagnostic flows: **11**
- Fault records with an explicit source/reference field: **0/152**
- Source status: **all 152 fault records currently lack an explicit source/reference field**. This does not prove that no author consulted a manual; it means the application data cannot show or verify that provenance.
- Symptom IDs include both `overheat` and `overheating`; do not merge them until all UI, aliases, tests, and records are reviewed.

## Coverage matrix

| Equipment type | Fault count | Symptom IDs | Fault record IDs | Exact flow coverage (equipment + symptom) | Technical reference |
|---|---:|---|---|---|---|
| boiler | 1 | trip | boiler-low-water-alarm | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| compressor | 14 | intermittent, leak, low_flow, low_pressure, overheat, overheating, trip, vibration | compressor-high-temperature, compressor-low-pressure, compressor-overheat, compressor-low-output, compressor-oil-low, compressor-oil-pressure-low, compressor-oil-carryover, compressor-intake-restriction, compressor-air-leak, compressor-cycling, compressor-condensate, compressor-separator-pressure-drop, compressor-belt-slip, compressor-drain-failure | compressor|low_pressure (compressor-low-pressure-v1) | MISSING — faults.json has no source/reference field |
| conveyor | 4 | not_start, slow_cycle, vibration | conveyor-belt-tracking, conveyor-belt-slip, conveyor-jam, conveyor-speed-mismatch | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| cooling | 2 | bad_signal, low_flow | cooling-fan-failure, cooling-water-low-flow | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| dust_collector | 1 | trip | dust-collector-high-pressure-drop | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| electric_motor | 14 | bad_signal, intermittent, noise, not_start, slow_cycle, trip, vibration | motor-overload-trip, motor-fails-to-start, motor-hums-no-rotation, motor-excessive-vibration, motor-bearing-noise, motor-phase-loss, motor-phase-imbalance, motor-insulation-low, motor-winding-fault, motor-rotation-wrong, motor-starts-stops, motor-low-speed, motor-high-current, motor-low-torque | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| electrical_control | 6 | not_start, trip | contactor-chatter, contactor-not-pulling-in, contactor-welded, overload-relay-tripping, fuse-repeated-failure, control-voltage-missing | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| electrical_panel | 1 | overheat | electrical-panel-hotspot | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| filtration | 1 | trip | filter-high-differential-pressure | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| fire_safety | 1 | bad_signal | fire-alarm-device-fault | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| gearbox | 3 | low_pressure, noise, overheat | gearbox-overheating, gearbox-oil-low, gearbox-noise | gearbox|overheat (gearbox-overheat-v1) | MISSING — faults.json has no source/reference field |
| heat_exchanger | 1 | low_flow | heat-exchanger-poor-transfer | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| hmi | 2 | bad_signal, not_start | hmi-frozen, hmi-wrong-values | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| hydraulic | 11 | bad_signal, leak, low_flow, noise, overheat, slow_cycle, trip | hydraulic-low-pressure, hydraulic-overheating, hydraulic-foaming, hydraulic-filter-clogged, hydraulic-cylinder-drift, hydraulic-cylinder-slow, hydraulic-pump-noise, hydraulic-internal-leak, hydraulic-hose-damage, hydraulic-pressure-spike, hydraulic-valve-sticking | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| industrial_network | 2 | bad_signal, not_start | network-switch-link-down, fieldbus-device-offline | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| instrumentation | 5 | bad_signal, leak, noise, not_start, overheat | flowmeter-no-reading, pressure-transmitter-drift, temperature-transmitter-fault, level-switch-chatter, leak-detector-fault | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| lubrication | 1 | low_flow | lubrication-system-low-flow | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| mechanical | 5 | bad_signal, vibration | bearing-lubrication-failure, bearing-wear, shaft-misalignment, mechanical-looseness, belt-tension-issue | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| motor | 3 | not_start, overheat, overheating | motor-no-start, motor-overheating, motor-overheat | motor|not_start (motor-no-start-v1) | MISSING — faults.json has no source/reference field |
| plc | 5 | bad_signal, not_start | plc-not-running, plc-input-not-changing, plc-output-not-energizing, plc-communication-loss, plc-program-change | plc|not_start (plc-no-start-v1) | MISSING — faults.json has no source/reference field |
| pneumatic | 8 | bad_signal, leak, low_flow, not_start, slow_cycle, trip | pneumatic-low-pressure, pneumatic-cylinder-slow, pneumatic-cylinder-stuck, pneumatic-air-leak, pneumatic-moisture, pneumatic-regulator-fault, pneumatic-solenoid-fault, pneumatic-filter-clogged | pneumatic|low_flow (pneumatic-low-flow-v1) | MISSING — faults.json has no source/reference field |
| power_supply | 3 | intermittent, trip | power-supply-voltage-unstable, power-supply-phase-sequence, earth-leakage-trip | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| pump | 17 | bad_signal, intermittent, leak, low_flow, noise, not_start, overheat, trip, vibration | pump-cavitation, pump-loss-of-prime, pump-abnormal-vibration, pump-mechanical-seal-leak, pump-check-valve-failure, pump-low-flow, pump-no-discharge-pressure, pump-seal-leak, pump-bearing-overheat, pump-coupling-misalignment, pump-rotation-reversed, pump-air-lock, pump-discharge-blockage, pump-impeller-damage, pump-excessive-flow, pump-pressure-fluctuation, pump-dry-running | pump|low_flow (pump-low-flow-v1) | MISSING — faults.json has no source/reference field |
| refrigeration | 2 | trip | refrigeration-high-pressure, refrigeration-low-pressure | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| robotics | 2 | bad_signal, not_start | robot-axis-following-error, robot-homing-failure | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| safety_circuit | 3 | trip | emergency-stop-chain-open, safety-interlock-not-made, safety-relay-fault | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| sensor | 11 | bad_signal, low_pressure, not_start, overheat | sensor-no-signal, sensor-signal-fluctuation, sensor-out-of-range, sensor-drift, sensor-wiring-fault, proximity-sensor-no-detect, photoelectric-sensor-false-trigger, encoder-feedback-loss, temperature-sensor-fault, pressure-sensor-fault, level-sensor-fault | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| steam_system | 1 | bad_signal | steam-trap-failure | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| ups | 1 | bad_signal | ups-battery-alarm | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| vacuum | 1 | low_flow | vacuum-low-level | No exact equipment+symptom match | MISSING — faults.json has no source/reference field |
| valve | 7 | bad_signal, leak, noise, not_start | valve-stuck-closed, valve-stuck-open, valve-internal-leakage, valve-actuator-no-response, valve-position-feedback, valve-solenoid-fault, valve-water-hammer | valve|not_start (valve-no-response-v1) | MISSING — faults.json has no source/reference field |
| vfd | 13 | bad_signal, intermittent, not_start, overheat, trip | vfd-trip, vfd-overcurrent, vfd-overvoltage, vfd-undervoltage, vfd-overtemperature, vfd-ground-fault, vfd-motor-not-running, vfd-frequency-unstable, vfd-communication-loss, vfd-parameter-mismatch, vfd-speed-reference-missing, vfd-fan-failure, vfd-dc-bus-ripple | vfd|trip (vfd-trip-v1) | MISSING — faults.json has no source/reference field |

## Priority gaps to address

### P0 — Evidence provenance (system-wide)
1. Add a reference schema for each fault/cause or explicitly mark it as **unverified/general guidance** until reviewed.
2. For each source, record title, manufacturer/organization, exact model or scope, document number/revision/date where available, URL or local citation, relevant page/section, and review status.
3. Do not invent OEM alarm meanings, numerical limits, torque values, oil grades, wiring instructions, or replacement procedures. Generic safety wording is not a substitute for an equipment-specific reference.
4. Keep the app's advisory wording: a match is not a confirmed diagnosis.

### P1 — Thinly covered equipment types
The following types have only one to three records and should be reviewed against the actual equipment inventory and risk profile before adding material:
- **filtration (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **heat_exchanger (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **steam_system (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **boiler (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **ups (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **electrical_panel (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **lubrication (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **vacuum (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **dust_collector (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **fire_safety (1 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **hmi (2 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **cooling (2 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **refrigeration (2 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **industrial_network (2 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **robotics (2 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **motor (3 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **safety_circuit (3 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **gearbox (3 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.
- **power_supply (3 سجل/سجلات):** مراجعة أولوية بسبب ضآلة التغطية، مع إعطاء الأولوية أولًا لأي معدة حرجة حسب استعمال الموقع.

### P1 — Flow coverage
Only exact equipment-ID + symptom-ID pairs are counted as covered. Similar names are not silently treated as equivalent. Current structured flows: `bearing|vibration`, `compressor|low_pressure`, `conveyor|tracking`, `gearbox|overheat`, `motor|not_start`, `plc|not_start`, `pneumatic|low_flow`, `pump|low_flow`, `thermal|overheat`, `valve|not_start`, `vfd|trip`.

The current library includes equipment names that do not exactly match flow IDs (for example, `electric_motor` vs `motor`, and symptom IDs `overheat` vs `overheating`). Review mappings explicitly and test them before treating these as covered.

### P2 — Schema and quality improvements
- Add a stable `sourceStatus` such as `verified`, `review-needed`, or `unverified`; do not infer verification from field completeness.
- Add automated checks that every verified claim has a traceable reference and that reference scope matches the equipment/model.
- Add tests for equipment/symptom flow matching, unknown values, multilingual guidance, and dangerous-action guardrails.
- Track coverage separately for **content exists**, **flow exists**, and **source verified**. A row is not “complete” just because a fault record exists.

## Safe next implementation sequence

1. Approve the reference schema and provenance policy.
2. Collect exact manuals/official sources for the highest-risk equipment actually used by the app's audience.
3. Add only claims supported by those sources; otherwise retain an explicit “needs source review” status.
4. Add tests for source presence and flow matching, then run GitHub Actions.
5. Review the PR; do not merge or deploy automatically.

## Limits of this audit

This audit reads the current JSON records and structured-flow definitions. It does **not** establish that any listed cause is technically correct, that a specific manufacturer manual was consulted, or that a fault is common/rare in real facilities. Counts measure only current repository coverage.
