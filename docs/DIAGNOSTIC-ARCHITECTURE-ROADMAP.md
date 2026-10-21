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
