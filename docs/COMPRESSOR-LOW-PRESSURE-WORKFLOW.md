# Adaptive Compressor Low-Pressure Workflow

## Scope

Adds a local, multi-step workflow for `compressor|low_pressure` in the existing diagnostic session engine. It is generic across compressor families and does not assert manufacturer/model-specific limits or fault-code meanings.

## Competing hypotheses

1. Compressor capacity, control, or protection state.
2. Distribution network, leakage, or changed demand.
3. Filter or air-treatment restriction.

These are candidate explanations, not confirmed causes. The relative support ranking inherits the engine's qualitative, uncalibrated likelihood assumptions and must not be interpreted as calibrated probabilities.

## Evidence collection

The workflow asks about:
- Pressure comparison at compressor outlet and point of use, under comparable load.
- Visible control/load state and recorded alarms.
- Available filter, dryer, and air-treatment indicators.

Unknown or unavailable readings add no evidence. The adaptive selector uses pairwise hypothesis separation with equal outcome weighting; it is not yet empirical Expected Information Gain because validated answer frequencies are unavailable.

## Safety boundary

- Observe only existing indicators and approved records.
- Do not adjust pressure setpoints or safety devices.
- Do not disconnect pressurized lines or open pressure vessels.
- Internal, electrical, or pressure-system work requires site isolation and qualified personnel.
- Consult the exact compressor and treatment-equipment manuals before model-specific intervention.

## Tests

`tests/compressor-low-pressure-session.test.cjs` covers language availability, initial hypotheses, invalid and unknown answers, pressure-location discrimination, multi-step evidence capture, and the no-confirmed-cause invariant.

## Remaining work

- Add model-scoped fault evidence only after reviewing the exact original OEM manuals.
- Validate answer likelihoods and costs/risks of each observation against field cases before implementing true Expected Information Gain.
- Add browser-level interaction tests and offline smoke coverage for the UI path.
