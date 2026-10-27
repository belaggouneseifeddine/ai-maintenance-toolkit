# Adaptive Diagnostic Agent v1 — implementation contract

Status: design contract for implementation; not evidence of a completed or field-validated agent.

## Product behavior

The diagnosis flow must start from equipment context and observed symptoms, not a preselected fault label. It must maintain multiple candidate causes and select the next question/check from the remaining uncertainty and the evidence already collected.

## Required session model

Each session stores:
- equipment type, manufacturer, model, operating context, and symptom in the user's words;
- observations and measurements with units, source, timestamp when available, and whether values are measured, reported, or unknown;
- candidate hypotheses, each with evidence for, evidence against, missing evidence, source references, and a state (candidate / weakened / supported / ruled_out);
- answered questions and checks, including inconclusive outcomes;
- the reason a question/check was selected and what outcomes would change the hypothesis ranking;
- safety gate state, escalation conditions, and an explicit unresolved/confirmed status.

Do not store a root cause as confirmed unless a verification step or an explicitly documented field finding supports it.

## Adaptive loop

1. Validate the request and perform a safety triage before diagnostic reasoning.
2. Ask for minimum missing context that materially changes the diagnostic path.
3. Retrieve only relevant knowledge records and preserve their source scope and evidence status.
4. Generate candidate hypotheses from supported rules/records. Hypothesis-only items must remain visibly unverified.
5. Select a safe, discriminating next question/check. Prefer non-invasive observations and existing readings; never instruct bypassing guards/interlocks or working on energized/pressurized equipment.
6. Update candidate states from the user's answer. Unknown, unavailable, contradictory, or unreliable readings must not be treated as negative evidence.
7. Stop when evidence is insufficient, risks require escalation, the next check is unsafe/unavailable, or no candidate is adequately distinguished. Explain the uncertainty and what evidence is needed.
8. Produce a traceable report: observed facts, hypotheses and their evidence, next check and rationale, sources/applicability, safety warnings, and unresolved questions.

## Knowledge record requirements

Every record intended to support a diagnostic claim should include:
- stable record ID, equipment family and symptom;
- cause/mechanism and discriminating observations;
- expected result for each check and how each outcome changes the candidate set;
- exact source identity, model/variant, manual revision, section/page, claim supported, and review status;
- safety prerequisites, stop conditions, and required qualification;
- language variants linked to one canonical technical record.

A manufacturer portal URL alone is discovery metadata, not evidence for a technical claim. Do not auto-promote unreviewed or generated content to verified knowledge.

## Confidence and stopping rules

- Do not present keyword match scores as probabilities.
- Do not use numerical confidence unless its interpretation is documented and calibrated against labelled cases.
- Contradictory evidence lowers support; missing evidence is not evidence against a cause.
- Always allow "cannot determine yet" and request a specific missing measurement or qualified inspection.
- Distinguish manual-reviewed claims from field-verified diagnoses.

## Initial acceptance tests

1. A vague symptom asks for context before ranking specific causes.
2. The same symptom with different observations selects different next checks.
3. A missing measurement is recorded as unknown and does not eliminate a hypothesis.
4. Contradictory observations are surfaced rather than silently reconciled.
5. Every source-backed claim carries its exact applicable reference; discovery-only URLs cannot justify a cause.
6. A safety trigger stops ordinary diagnosis and requests safe isolation/escalation.
7. A candidate cannot become confirmed without an explicit verification event.
8. If no relevant knowledge record exists, the system says so and does not fabricate a procedure.
9. Every question/check has a rationale and expected discriminating outcomes.
10. Session state can be resumed without losing prior evidence or repeating answered questions unnecessarily.

## Rollout boundary

Implement and test this on an isolated branch. Do not merge or deploy until unit tests, knowledge-integrity checks, safety regressions, and mobile end-to-end tests pass. The production UI must remain usable offline and must not require an external model for the core evidence-tracking loop.
