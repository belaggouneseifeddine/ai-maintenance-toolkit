---
name: maintenance-evaluation
description: Evaluate industrial troubleshooting and retrieval changes using a repeatable set of known fault scenarios, deterministic assertions, citation checks, safety checks, and regression comparison. Do not depend on a hosted evaluation service.
---

# Maintenance agent evaluation

## Goal

Catch unsupported diagnoses, missing citations, unsafe recommendations, retrieval regressions, and broken multilingual flows before changes are accepted.

## Evaluation dataset

Maintain version-controlled, non-sensitive scenarios with:

- stable case ID and equipment category/model when known
- symptom and exact alarm code
- observed facts and measurements with units
- expected clarification questions or accepted diagnostic branches
- authoritative permitted source IDs, when available
- prohibited outputs and mandatory safety warnings
- expected outcome class: clarify, preliminary assessment, escalate, or unable to assess

Include positive, negative, ambiguous, multilingual (Arabic/French/English), adversarial, and no-evidence cases. Do not label a synthetic case as a real field incident.

## Required test groups

1. **Retrieval:** exact-code recall, model/symptom match, irrelevant keyword distractors, duplicate passages, empty corpus, unknown source IDs, and forbidden source exclusion.
2. **Grounding:** every factual claim presented as source-supported must have a returned source ID; each source must support the stated claim and match the equipment scope.
3. **Uncertainty:** missing evidence must trigger clarification or a low-confidence result, not invented settings or a confirmed cause.
4. **Safety:** hazardous conditions trigger stop-work/escalation; no bypassing guards, interlocks, trips, overloads, relief devices, or emergency stops; no unqualified live electrical or pressurized-system intervention.
5. **Structured output:** schema validity, enum validity, bounds on arrays/text, escaping/untrusted text, and safe failure on malformed model output.
6. **Regression:** existing local diagnostic branches, Arabic RTL, French and English text, PWA offline shell, and Worker request contract remain intact.
7. **Operational boundary:** do not confuse static checks with a live provider request, deployed Worker state, Android UI test, or real-machine validation.

## Metrics

Track at least:

- retrieval recall@k for labeled relevant sources
- exact alarm/model hit rate
- citation validity rate
- unsupported-claim rate
- correct abstention rate for insufficient evidence
- safety-policy violation count (target: zero)
- schema pass rate
- regression test pass/fail counts

Do not collapse all metrics into a single score that can hide a safety failure. Any safety violation is a release blocker regardless of average quality.

## Review loop

1. Run the same versioned test set before a change.
2. Record baseline outputs and metrics.
3. Make one bounded change.
4. Re-run all relevant deterministic tests and the complete safety regression suite.
5. Compare failures and inspect changed cases manually.
6. Add a regression test for each confirmed defect.
7. Keep failed and unresolved cases visible; do not remove a difficult case merely to improve scores.
8. Report exactly which commands/tests ran and their actual results.

## Acceptance gates

- No critical safety regression.
- No invented source, citation, model-specific limit, or confirmed cause.
- Unknown/low-evidence cases abstain safely.
- Existing non-AI diagnosis remains functional.
- Automated tests pass before any release recommendation.
- Live backend and Android/manual checks remain explicitly pending until performed.
