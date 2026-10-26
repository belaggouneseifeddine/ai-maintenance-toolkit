# Evidence Gap Backlog — 2026-10-26

## Purpose

This is an actionable review queue, not a list of proven technical errors. It records which fault entries lack completed source verification in `diagnostic-evidence-register.json`. No status is upgraded merely because a plausible reference exists.

## Snapshot

- Fault records in `faults.json`: 284
- Evidence register entries: 284
- Verified: 60
- Review needed: 53
- Source not recorded: 171
- Non-verified fault records to triage: 224
- Fault records missing a corresponding evidence-register entry: 0
- Evidence-register IDs not present in `faults.json`: 0

## Rules for remediation

1. Preserve existing diagnostic rules and fault IDs unless a separate review proves duplication or a safety defect.
2. Add a reference only after opening and checking the actual source. Record publisher/manufacturer, exact title, revision/date, section/page, URL, supported claim, equipment/model scope, reviewer date, and limitations.
3. Distinguish manufacturer-specific claims from general engineering guidance. A general source does not prove an OEM-specific cause.
4. Do not mark a record `verified` unless the reference directly supports the claim and its stated equipment scope.
5. If no suitable source is found, retain `source-not-recorded` and state the uncertainty. Do not delete the fault just because evidence is missing.
6. Apply lockout/tagout and machine-specific safety procedures before any physical inspection; software guidance is not authorization to work on energized equipment.
7. Re-run knowledge validation, diagnostic tests, static safety checks, and deployment checks after each reviewed batch.

## Backlog by equipment type

The lists below use stable fault IDs and English titles from the current main branch. “Review needed or register entry missing” means the evidence status is not complete; it does not imply the fault is false.


### boiler

**Source not recorded (1)**
- `boiler-low-water-alarm` — Boiler low-water alarm


### compressor

**Source not recorded (15)**
- `compressor-high-temperature` — Compressor high temperature
- `compressor-low-pressure` — Compressor low outlet pressure
- `compressor-overheat` — Compressor overheating
- `compressor-low-output` — Low compressor output or network pressure
- `compressor-oil-low` — Low compressor oil level
- `compressor-oil-pressure-low` — Low compressor oil pressure
- `compressor-oil-carryover` — Excessive oil carryover
- `compressor-intake-restriction` — Compressor air intake restriction
- `compressor-air-leak` — Compressed air leak
- `compressor-cycling` — Frequent compressor cycling
- `compressor-condensate` — Compressed-air condensate accumulation
- `compressor-separator-pressure-drop` — High oil separator pressure drop
- `compressor-belt-slip` — Compressor belt slip
- `compressor-drain-failure` — Condensate drain failure
- `compressor-oil-separator-pressure-drop` — Abnormal compressor oil separator differential pressure


### conveyor

**Source not recorded (4)**
- `conveyor-belt-tracking` — Conveyor belt mistracking
- `conveyor-belt-slip` — Conveyor belt slip
- `conveyor-jam` — Conveyor jam
- `conveyor-speed-mismatch` — Conveyor speed mismatch

**Review needed or register entry missing (1)**
- `european-conveyor-synchronization-error` — European conveyor synchronization error


### cooling

**Source not recorded (2)**
- `cooling-fan-failure` — Cooling fan failure
- `cooling-water-low-flow` — Low cooling-water flow

**Review needed or register entry missing (2)**
- `laser-cutter-chiller-alarm` — Laser cutter chiller alarm
- `chiller-high-condensing-temperature` — Industrial chiller high condensing temperature


### dust_collector

**Source not recorded (1)**
- `dust-collector-high-pressure-drop` — High dust-collector pressure drop

**Review needed or register entry missing (1)**
- `dust-collector-pulse-cleaning-fault` — Dust collector pulse-cleaning fault


### electric_motor

**Source not recorded (14)**
- `motor-overload-trip` — Motor overload trip
- `motor-fails-to-start` — Motor fails to start
- `motor-hums-no-rotation` — Humming without rotation
- `motor-excessive-vibration` — Excessive motor vibration
- `motor-bearing-noise` — Motor bearing noise
- `motor-phase-loss` — Phase loss
- `motor-phase-imbalance` — Phase imbalance
- `motor-insulation-low` — Low insulation resistance
- `motor-winding-fault` — Possible motor winding fault
- `motor-rotation-wrong` — Incorrect rotation direction
- `motor-starts-stops` — Motor starts and stops repeatedly
- `motor-low-speed` — Low motor speed
- `motor-high-current` — High motor current
- `motor-low-torque` — Low motor torque

**Review needed or register entry missing (1)**
- `motor-overload-relay-trip` — Motor overload relay trip


### electrical_control

**Source not recorded (7)**
- `contactor-chatter` — Contactor chatter
- `contactor-not-pulling-in` — Contactor fails to pull in
- `contactor-welded` — Possible welded contactor contacts
- `overload-relay-tripping` — Overload relay tripping
- `fuse-repeated-failure` — Repeated fuse failure
- `control-voltage-missing` — Control voltage missing
- `electronics-24v-supply-drop` — 24 V DC supply voltage drop

**Review needed or register entry missing (4)**
- `contactor-coil-no-pickup` — Contactor coil fails to pick up
- `contactor-chattering` — Contactor chatter
- `auxiliary-contact-feedback-mismatch` — Auxiliary contact feedback mismatch
- `control-circuit-open` — Open control circuit


### electrical_panel

**Source not recorded (8)**
- `electrical-panel-hotspot` — Electrical panel hotspot
- `breaker-unexpected-trip` — Unexpected circuit breaker trip
- `phase-loss-suspected` — Suspected phase loss
- `phase-sequence-incorrect` — Incorrect phase sequence
- `earth-leakage-protection-trip` — Earth leakage protection trip
- `short-circuit-suspected` — Suspected short circuit
- `loose-terminal-connection` — Suspected loose terminal connection
- `busbar-overheating` — Busbar overheating

**Review needed or register entry missing (3)**
- `fuse-repeated-blowing` — Repeated fuse blowing
- `control-transformer-secondary-low` — Low control transformer secondary voltage
- `transformer-abnormal-temperature` — Transformer abnormal temperature or humming


### electronics

**Source not recorded (1)**
- `electronics-opto-isolator-fault` — Suspected optocoupler fault

**Review needed or register entry missing (12)**
- `electronics-dc-ripple-high` — High DC output ripple
- `electronics-capacitor-swelling` — Swollen electronic capacitors
- `electronics-analog-input-offset` — Analog input offset
- `electronics-analog-output-saturation` — Analog output saturation
- `electronics-adc-noisy-reading` — Noisy ADC reading
- `electronics-dac-output-mismatch` — DAC output mismatch
- `electronics-relay-driver-fault` — Relay driver circuit fault
- `electronics-mosfet-overheating` — MOSFET overheating
- `electronics-watchdog-reset` — Watchdog reset
- `electronics-memory-checksum-error` — Memory checksum error
- `electronics-pcb-corrosion` — PCB corrosion or contamination
- `electronics-electromagnetic-interference` — Electromagnetic interference in control


### fan-blower

**Review needed or register entry missing (1)**
- `fan-blower-abnormal-vibration` — Abnormal fan or blower vibration


### filtration

**Source not recorded (1)**
- `filter-high-differential-pressure` — High filter differential pressure


### fire_safety

**Source not recorded (1)**
- `fire-alarm-device-fault` — Fire alarm device fault


### gearbox

**Source not recorded (3)**
- `gearbox-overheating` — Gearbox overheating
- `gearbox-oil-low` — Low gearbox oil level
- `gearbox-noise` — Gearbox noise


### heat_exchanger

**Source not recorded (1)**
- `heat-exchanger-poor-transfer` — Poor heat transfer in heat exchanger


### hmi

**Source not recorded (2)**
- `hmi-frozen` — HMI frozen
- `hmi-wrong-values` — Incorrect or stale HMI values

**Review needed or register entry missing (1)**
- `hmi-tag-bad-quality` — Bad HMI tag quality


### hydraulic

**Source not recorded (11)**
- `hydraulic-low-pressure` — Low hydraulic system pressure
- `hydraulic-overheating` — Hydraulic oil overheating
- `hydraulic-foaming` — Hydraulic oil foaming
- `hydraulic-filter-clogged` — Possible hydraulic filter blockage
- `hydraulic-cylinder-drift` — Hydraulic cylinder drift
- `hydraulic-cylinder-slow` — Slow hydraulic cylinder movement
- `hydraulic-pump-noise` — Hydraulic pump noise
- `hydraulic-internal-leak` — Possible internal hydraulic leakage
- `hydraulic-hose-damage` — Damaged or swollen hydraulic hose
- `hydraulic-pressure-spike` — Hydraulic pressure spike
- `hydraulic-valve-sticking` — Hydraulic valve sticking

**Review needed or register entry missing (2)**
- `injection-molding-hydraulic-pressure-low` — Low injection molding hydraulic pressure
- `hydraulic-filter-differential-pressure` — High hydraulic filter differential pressure


### industrial_network

**Source not recorded (3)**
- `network-switch-link-down` — Industrial network link down
- `fieldbus-device-offline` — Fieldbus device offline
- `industrial-ip-address-conflict` — Industrial IP address conflict

**Review needed or register entry missing (4)**
- `scada-stale-value` — Stale SCADA value
- `profinet-device-name-mismatch` — PROFINET device name mismatch
- `modbus-register-mapping-error` — Modbus register mapping error
- `fieldbus-communication-timeout` — Fieldbus communication timeout


### instrumentation

**Source not recorded (5)**
- `flowmeter-no-reading` — Flowmeter no reading
- `pressure-transmitter-drift` — Pressure transmitter drift
- `temperature-transmitter-fault` — Temperature transmitter fault
- `level-switch-chatter` — Level switch chatter
- `leak-detector-fault` — Possible leak detector fault

**Review needed or register entry missing (1)**
- `instrument-four-to-twenty-ma-drift` — Instrumentation signal drift or instability


### lubrication

**Source not recorded (1)**
- `lubrication-system-low-flow` — Low lubrication-system flow


### mechanical

**Source not recorded (5)**
- `bearing-lubrication-failure` — Insufficient bearing lubrication
- `bearing-wear` — Bearing wear
- `shaft-misalignment` — Shaft misalignment
- `mechanical-looseness` — Mechanical looseness
- `belt-tension-issue` — Incorrect belt tension


### motor

**Source not recorded (3)**
- `motor-no-start` — Motor fails to start
- `motor-overheating` — Motor overheating
- `motor-overheat` — Motor overheating


### plc

**Source not recorded (5)**
- `plc-not-running` — PLC not running
- `plc-input-not-changing` — PLC input not changing
- `plc-output-not-energizing` — PLC output not energizing
- `plc-communication-loss` — PLC communication loss
- `plc-program-change` — Unexpected PLC logic change

**Review needed or register entry missing (7)**
- `plc-cpu-stop-mode` — PLC CPU in STOP mode
- `plc-scan-time-overrun` — PLC scan-time overrun
- `plc-retentive-memory-loss` — PLC retentive memory loss
- `plc-module-configuration-mismatch` — PLC module configuration mismatch
- `plc-remote-io-dropout` — Remote I/O dropout
- `plc-output-point-not-switching` — PLC output point not switching
- `industrial-software-version-mismatch` — Industrial software version mismatch


### pneumatic

**Source not recorded (8)**
- `pneumatic-low-pressure` — Low pneumatic pressure
- `pneumatic-cylinder-slow` — Slow pneumatic cylinder
- `pneumatic-cylinder-stuck` — Pneumatic cylinder stuck
- `pneumatic-air-leak` — Pneumatic circuit air leak
- `pneumatic-moisture` — Moisture or water in compressed air
- `pneumatic-regulator-fault` — Pneumatic regulator fails to hold setting
- `pneumatic-solenoid-fault` — Pneumatic solenoid valve not switching
- `pneumatic-filter-clogged` — Air filter blockage


### power_supply

**Source not recorded (3)**
- `power-supply-voltage-unstable` — Unstable supply voltage
- `power-supply-phase-sequence` — Incorrect phase sequence
- `earth-leakage-trip` — Earth-leakage protection trip


### pump

**Source not recorded (17)**
- `pump-cavitation` — Cavitation
- `pump-loss-of-prime` — Loss of prime
- `pump-abnormal-vibration` — Abnormal vibration
- `pump-mechanical-seal-leak` — Mechanical seal leakage
- `pump-check-valve-failure` — Check valve malfunction
- `pump-low-flow` — Low pump flow
- `pump-no-discharge-pressure` — No pump discharge pressure
- `pump-seal-leak` — Mechanical seal leakage
- `pump-bearing-overheat` — Pump bearing overheating
- `pump-coupling-misalignment` — Coupling misalignment
- `pump-rotation-reversed` — Pump rotating in reverse
- `pump-air-lock` — Air lock in pump or line
- `pump-discharge-blockage` — Possible discharge blockage
- `pump-impeller-damage` — Damaged or worn pump impeller
- `pump-excessive-flow` — Excessive pump flow
- `pump-pressure-fluctuation` — Pump pressure fluctuation
- `pump-dry-running` — Possible pump dry running


### refrigeration

**Source not recorded (2)**
- `refrigeration-high-pressure` — Refrigeration high-pressure alarm
- `refrigeration-low-pressure` — Refrigeration low-pressure alarm


### robotics

**Source not recorded (5)**
- `robot-axis-following-error` — Robot axis following error
- `robot-homing-failure` — Robot axis homing failure
- `servo-homing-incomplete` — Servo homing incomplete
- `chinese-cnc-controller-unknown-alarm` — Unknown alarm on Chinese CNC controller
- `chinese-servo-encoder-alarm` — Chinese machine servo encoder alarm

**Review needed or register entry missing (6)**
- `electronics-encoder-signal-loss` — Encoder signal loss
- `cnc-axis-overtravel-alarm` — CNC axis overtravel alarm
- `cnc-tool-changer-timeout` — CNC tool changer timeout
- `european-cnc-tool-magazine-fault` — European CNC tool magazine fault
- `european-robot-axis-reference-lost` — European robot axis reference lost
- `servo-drive-following-error` — Servo or motion axis following error


### safety_circuit

**Source not recorded (4)**
- `emergency-stop-chain-open` — Emergency-stop circuit open
- `safety-interlock-not-made` — Safety interlock not satisfied
- `safety-relay-fault` — Possible safety relay fault
- `interlock-chain-unsatisfied` — Interlock chain not satisfied

**Review needed or register entry missing (3)**
- `safety-relay-reset-failure` — Safety relay reset failure
- `emergency-stop-loop-open` — Emergency stop loop open
- `european-packaging-safety-door-fault` — European packaging safety door fault


### sensor

**Source not recorded (13)**
- `sensor-no-signal` — Sensor no signal
- `sensor-signal-fluctuation` — Unstable sensor signal
- `sensor-out-of-range` — Sensor reading out of range
- `sensor-drift` — Sensor drift
- `sensor-wiring-fault` — Possible sensor wiring fault
- `proximity-sensor-no-detect` — Proximity sensor fails to detect target
- `photoelectric-sensor-false-trigger` — Photoelectric sensor false triggering
- `encoder-feedback-loss` — Encoder feedback loss
- `temperature-sensor-fault` — Possible temperature sensor fault
- `pressure-sensor-fault` — Possible pressure sensor fault
- `level-sensor-fault` — Possible level sensor fault
- `textile-thread-break-detection` — Textile thread-break detection alarm
- `chinese-packaging-photoeye-fault` — Chinese packaging machine photoeye fault

**Review needed or register entry missing (1)**
- `packaging-machine-registration-error` — Packaging machine registration error


### steam_system

**Source not recorded (1)**
- `steam-trap-failure` — Possible steam trap failure

**Review needed or register entry missing (1)**
- `steam-trap-suspected-failure` — Suspected steam trap or condensate drainage failure


### ups

**Source not recorded (1)**
- `ups-battery-alarm` — UPS battery alarm


### vacuum

**Source not recorded (1)**
- `vacuum-low-level` — Insufficient vacuum level


### valve

**Source not recorded (7)**
- `valve-stuck-closed` — Valve stuck closed
- `valve-stuck-open` — Valve stuck open
- `valve-internal-leakage` — Internal valve leakage
- `valve-actuator-no-response` — Valve actuator no response
- `valve-position-feedback` — Incorrect valve position feedback
- `valve-solenoid-fault` — Possible solenoid valve fault
- `valve-water-hammer` — Water hammer during flow change


### vfd

**Source not recorded (15)**
- `vfd-trip` — VFD trip or alarm
- `vfd-overcurrent` — VFD overcurrent fault
- `vfd-overvoltage` — VFD overvoltage fault
- `vfd-undervoltage` — VFD undervoltage fault
- `vfd-overtemperature` — VFD overheating
- `vfd-ground-fault` — VFD ground fault
- `vfd-motor-not-running` — VFD ready but motor not running
- `vfd-frequency-unstable` — Unstable VFD output frequency
- `vfd-communication-loss` — VFD communication loss
- `vfd-parameter-mismatch` — Incorrect motor parameters in VFD
- `vfd-speed-reference-missing` — Missing speed reference
- `vfd-fan-failure` — VFD cooling fan failure
- `vfd-dc-bus-ripple` — Possible excessive DC bus ripple
- `electronics-igbt-desaturation` — IGBT desaturation alarm
- `braking-resistor-overheat` — Braking resistor overheating

**Review needed or register entry missing (2)**
- `extruder-drive-torque-high` — High extruder drive torque
- `chinese-vfd-parameter-loss` — Chinese machine VFD parameter loss


## Completion criteria

A batch is complete only when every changed record has a traceable source and exact scope, its claim is checked against the source, uncertainty is recorded, the JSON schema passes, regression tests pass, and the diff is reviewed for unintended changes.
