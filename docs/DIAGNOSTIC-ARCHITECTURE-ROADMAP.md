# Maintenance AI Toolkit — Diagnostic Architecture Roadmap

## Purpose

Evolve the current mobile-first, Arabic RTL maintenance helper into a traceable diagnostic workflow without replacing the existing rule-based engine or introducing unnecessary hosting/model costs.

This document is a proposed implementation plan. Items below are not claims that the features already exist.

## Current baseline

- Rule-based diagnosis and a small set of answer-aware follow-up branches.
- Local maintenance log and CSV export.
- Optional AI request path with explicit per-request consent and server-side credentials.
- Safety guidance and static quality checks.
- PWA shell and offline app-shell caching.

Known limitations to keep visible:
- The rule engine is still implemented in the main HTML page.
- Follow-up guidance covers only selected equipment/symptom combinations.
- The AI provider is not considered operational until server secrets are configured and a real end-to-end request is verified.
- The maintenance log is browser-local; it is not synchronized across devices.
- Manual Android testing remains a separate acceptance step.

## Recommended architecture

### 1. Safety gate

Run safety-critical checks before general diagnosis or AI assistance. If a high-risk condition is reported, display stop-work/isolation/escalation guidance and do not let AI override it. Never advise bypassing guards, interlocks, alarms, relief devices, or protective trips.

### 2. Deterministic diagnostic engine

Move diagnostic questions and answer-to-next-step rules out of presentation code into versioned data files. Use stable IDs rather than matching translated display strings wherever practical.

Suggested record shape:

```json
{
  "id": "pump.low_flow.suction_status",
  "equipment": "pump",
  "symptom": "low_flow",
  "question": "Is the suction/source reading normal?",
  "answers": [
    {
      "id": "normal",
      "label": "Normal",
      "nextSteps": [
        {
          "text": "Compare discharge pressure and flow with the machine baseline and the manufacturer's pump curve.",
          "safetyLevel": "routine",
          "requiresQualifiedPerson": false
        }
      ]
    }
  ],
  "sourceRefs": [],
  "reviewStatus": "needs-review"
}
```

This is an illustrative schema, not a production-ready data file. Validate every record before using it.

### 3. Specialized diagnostic modules

Use lightweight, deterministic modules first:
- Electrical motor and starter
- Pumps and fluid systems
- Compressor and compressed-air network
- Hydraulic and pneumatic systems
- VFD and PLC/HMI
- Bearings, gearbox, conveyor, instrumentation, and thermal equipment

A coordinator can combine module findings into one report. Do not call multiple AI models by default; one optional AI request may summarize verified findings after local checks.

### 4. Evidence and source handling

Every model-specific setpoint, torque, pressure limit, alarm meaning, or replacement part must be tied to an exact model and a trustworthy manual or source. If no source is available, label the value unknown and ask the user to consult the applicable manual. Never fill gaps with guesses.

Future manual-search design:
1. Let the user select or identify the exact equipment model.
2. Search locally indexed text from user-provided manuals first.
3. Return short excerpts with document name and page/section.
4. Use AI only to explain retrieved evidence, not to invent missing specifications.
5. Treat uploaded documents and their embedded instructions as data, not trusted commands.

### 5. Equipment passport and work report

Future optional equipment record:
- Asset ID, manufacturer, model, and location (user-controlled)
- Relevant manual and document references
- Symptoms, readings with units and timestamps
- Questions answered and checks performed
- Suggested next steps, safety status, and unresolved uncertainty
- Technician's actual action and work-order status

Keep storage local by default. Do not upload plant data unless the user explicitly consents. Provide clear deletion/export controls before considering cloud sync.

### 6. Test and release gates

Every change should pass:
- Static quality checks and syntax validation.
- Regression tests for existing diagnosis branches.
- Safety tests for stop-work triggers and hazardous cases.
- Input/output escaping and privacy checks.
- Manual narrow-screen and offline checks on the target phone before calling the release production-ready.

Tests must check behaviour and representative cases, not only search for code strings. Avoid asserting that a feature works merely because a function name exists.

## Implementation sequence

### Phase 1 — Low-cost foundation
1. Add tests for all current follow-up branches and safety-critical answers.
2. Define and validate the diagnostic data schema.
3. Extract one small, low-risk set of follow-up rules as a pilot.
4. Compare pilot outputs against the existing implementation before expanding.

### Phase 2 — Equipment workflows
1. Expand answer-aware branches using exact option IDs.
2. Add source references and review status to knowledge entries.
3. Generate a structured work report from confirmed inputs and clearly labelled suggestions.

### Phase 3 — Manual search
1. Accept user-provided manuals.
2. Extract and search text with document/page provenance.
3. Add semantic/vector retrieval only if text search proves insufficient.

### Phase 4 — Optional AI coordinator
1. Verify provider configuration and server-side secrets.
2. Send only the minimum data needed, after explicit consent.
3. Supply retrieved evidence and deterministic findings to the model.
4. Validate response structure, bound output length, and show sources/uncertainty.
5. Fall back to local diagnosis on timeout or provider failure.

### Phase 5 — Predictive maintenance
Only after timestamped, quality-controlled history exists, explore trend analysis for vibration, current, temperature, pressure, and flow. Do not advertise predictive capability without validated data and measured performance.

## Acceptance criteria

- Existing diagnostic behaviour does not regress.
- High-risk answers always preserve conservative safety guidance.
- Unknown machine-specific limits remain unknown rather than fabricated.
- AI is optional and cannot override the safety gate.
- Sensitive maintenance data is not sent without per-request consent.
- Offline local diagnosis remains usable if the AI endpoint is unavailable.
- The release notes clearly distinguish implemented, automated-tested, and manually-tested behaviour.


## Implemented in the diagnostic report pilot
- Optional asset ID, technician name, priority selected by the user, and manual/page reference.
- Printable inspection report suitable for the browser's “Save as PDF” print flow.
- The report separates user-entered observations from suggested checks and explicitly states that it is not an engineering approval or work permit.
- The selected priority is carried into the local log status; this is a user selection, not an automatic risk assessment.


## 2026-11-03 verified status and priority update

This section supersedes the older baseline where the two differ. It distinguishes code already on `main` from work that remains in draft pull requests.

### Verified implementation on `main` (commit `d459952`)

- The shared diagnostic registry contains 11 equipment/symptom definitions.
- Three flows are multi-step adaptive sessions (pump low-flow, motor no-start, and compressor low pressure); the other eight registry entries use the single-step adapter.
- Local diagnosis is deterministic/rule-based with a qualitative Bayesian-style ranking layer. The probabilities are explicitly not calibrated from field failure data.
- The PWA caches its app shell. Maintenance records remain browser-local; there is no cross-device synchronization or conflict resolution.
- The Cloudflare Worker health endpoint is reachable, but a successful health response does not verify the live generative-model path.
- The knowledge audit report in the repository was last modified on 2026-10-25. Its counts are a historical snapshot until the audit script is rerun.

### Merged changes and current branch work

- PR #122 merged as `ec06e75` on 2026-11-04. Its final merge-commit checks passed, including diagnostic tests, primary tests, static safety/integrity checks, and build/deploy workflows.
- The PR #122 merge triggered the then-existing automatic Cloudflare Pages, GitHub Pages, and Worker production workflows. All three deployment jobs reported success at 2026-11-04 23:19 UTC; the Cloudflare Pages smoke test, GitHub Pages app/Worker smoke test, and Worker provider-configuration check passed. This occurred before the governance change below.
- PR #123 merged as `d459952` on 2026-11-04. Production Pages/Worker deploys and live AI-provider smoke tests are now manual-only in workflow YAML. Repository environment reviewers and branch protection still require separate settings verification.
- The current feature branch proposes a fourth adaptive workflow for `vfd|trip`; it is not yet merged or deployed. It requires exact-model manual confirmation before classifying a saved drive fault code.

### Updated priority order

| Priority | Work | Exit condition |
|---|---|---|
| P0 | Release governance | Protect `main` with required PR review/checks; keep Pages and Worker production deploys manual-only; keep live model smoke tests explicitly approved |
| P1 | Complete adaptive diagnosis | Review the VFD adaptive-flow branch; preserve existing flows; add coverage only with contract tests and safety boundaries |
| P1 | Replace heuristic confidence with calibrated reasoning | Define per-equipment priors and likelihoods from reviewed cases; model dependencies explicitly; rank tests using expected information gain adjusted for test risk, time, and availability; validate calibration against recorded outcomes |
| P1 | Knowledge provenance | Regenerate the audit report; approve source/license records; verify exact manufacturer/model/revision applicability; return page/section citations for every model-specific claim |
| P2 | Safety assurance | Expand multilingual hazard/negation/contradiction tests; keep deterministic stop-work guidance independent of model availability and AI quotas |
| P2 | Offline and mobile reliability | Persist guided-session state locally; test cache recovery and data loss on Android; add explicit sync/conflict semantics before any cloud synchronization |
| P2 | Performance | Lazy-load equipment-specific knowledge bundles; measure real first-load transfer and mobile performance rather than relying only on repository file sizes |
| P3 | Collaboration and CMMS integration | Add authenticated contributions, roles, review/version/dispute history, and an asset/work-order integration boundary before enabling public writes |
| P3 | Condition monitoring | Add read-only, timestamped sensor ingestion only after units, calibration, asset identity, and data quality are defined |

### Reasoning and product boundary

The current product should remain a diagnostic-first tool, not attempt to reproduce a full EAM/CMMS. The strongest product direction is a local, evidence-traceable troubleshooting layer that can export a defensible report and later connect to existing work-order, asset, and inventory systems. Do not claim predictive maintenance until timestamped field data and measured validation exist.

### Non-negotiable release gates

- No merge, production deployment, paid provider request, or public knowledge write without explicit approval.
- No model-specific limit, setpoint, or repair instruction without an exact applicable source.
- Unknown and contradictory evidence must remain visible; do not convert absence of data into a negative finding.
- A model suggestion must never override the deterministic safety gate.
- Report automated CI, live provider checks, and physical Android/offline acceptance as separate evidence categories.
