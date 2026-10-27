# Experimental Bayesian Diagnostic Engine v1

## Scope

This branch adds an exact-inference engine for small binary Bayesian networks and one experimental model: **pump + low flow**. It is not yet a general industrial fault model and is not an OEM-approved diagnostic system.

## What is implemented

- Exact enumeration for networks of up to 20 binary nodes.
- Validation of probabilities, node uniqueness, parent references, topological order, and complete conditional probability tables (CPTs).
- Evidence conditioning and posterior ranking for selected query nodes.
- A user-facing panel where readings are explicitly marked yes/no/unknown. Unknown fields are excluded from inference rather than interpreted as false.
- Unit tests for posterior updates, missing/unknown evidence, invalid networks, and impossible evidence.

## Model assumptions — critical

The pump/low-flow model contains four candidate causes: suction restriction, downstream restriction, insufficient supply/source level, and flow-measurement fault. Its root priors and conditional observation probabilities are **provisional elicited assumptions**, not values learned from maintenance records, fleet data, manufacturer documentation, or a validated study. They are not calibrated probabilities.

The model assumes listed observations are conditionally independent given their listed parent causes. This simplification may be false in real installations. Priors are starting assumptions for the pump/low-flow scenario; qualified domain experts must review them and field cases must be used for calibration before operational use.

The panel is intentionally limited to pump + low flow. It does not infer evidence from free-text notes. The technician must select only readings actually checked and should record units, measurement points, baseline, and equipment model in the normal workflow.

## Safety and evidence policy

- Results are hypothesis rankings, not confirmed root causes or authorization to operate.
- Do not use percentages to make safety-critical decisions.
- Follow LOTO, site procedures, qualified-person requirements, and the exact model manual.
- A missing measurement is not negative evidence.
- Do not infer a technical limit or manufacturer claim from this model.
- Production use requires reviewed causal structure, traceable priors/CPTs, held-out field cases, calibration evaluation, and hazard review.

## Run tests

The repository test workflow is expected to execute `tests/*.test.cjs` using Node's built-in test runner. To run locally:

```sh
node --test tests/bayesian-diagnostic-engine.test.cjs
```

No production deployment is implied by this branch.
