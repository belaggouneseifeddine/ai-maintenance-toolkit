---
name: maintenance-bayesian-reasoning
description: Review or extend the Maintenance AI Toolkit's qualitative Bayesian hypothesis-ranking workflow. Use when interpreting evidence groups, uncertainty, priors, conflicts, or Bayesian engine tests. Do not describe heuristic scores as calibrated probabilities.
---

# Maintenance Bayesian reasoning

## Purpose

Help engineers reason transparently from observations to competing maintenance hypotheses. This skill governs analysis and development review; it does not authorize equipment work and does not replace the deterministic diagnostic or safety gates.

## Current implementation facts

Before proposing a change, inspect the current `bayesian-engine.js` and its tests. The current implementation identifies itself as `qualitative_bn_v1` and:

- ranks relative support using conservative heuristic likelihood-ratio assumptions;
- groups evidence to reduce repeated counting of correlated observations;
- treats missing information as unknown, not as evidence against a hypothesis;
- reports conflicts within an evidence group;
- declares that its likelihood assumptions are unvalidated and its output is not calibrated probabilities;
- keeps safety and OEM applicability checks outside the Bayesian engine.

These are implementation facts to re-check against the current branch, not permanent guarantees.

## Required reasoning workflow

1. **Define the target hypothesis.** State the suspected failure mode precisely and keep different failure modes separate.
2. **Establish the prior transparently.** Use an explicitly supplied prior or the documented default. Do not invent field failure rates or claim a prior is statistically learned.
3. **Classify observations.** Each observation must be one of:
   - supports the hypothesis;
   - contradicts the hypothesis, based on a verified observation;
   - unknown / unavailable / not measured.
4. **Preserve provenance.** Record the original observation, unit, timestamp/operating state when available, source or reporter, and why it supports or contradicts the hypothesis.
5. **Group dependent evidence.** Do not count several measurements from the same physical process as independent evidence merely because they have different names. Review the grouping logic and identify cases where a group combines unrelated phenomena.
6. **Expose conflicts.** If one evidence family contains both supporting and contradictory observations, report the conflict and avoid presenting a net update as decisive.
7. **Rank cautiously.** Describe results as relative support bands or heuristic scores. A higher score is not a calibrated probability, failure frequency, confidence interval, or proof of root cause.
8. **Check abstention.** If no candidates or no discriminating observations exist, request the next useful measurement or return insufficient evidence.
9. **Keep safety independent.** Bayesian ranking must never weaken stop-work rules, isolation requirements, OEM limits, or qualification boundaries.
10. **Explain assumptions.** State the network version, prior assumption, evidence grouping, conditional-independence assumption, calibration status, unknowns, and evidence conflicts.

## Development rules

- Do not change the score formula, prior, likelihood ratios, evidence groups, or thresholds without a specific failing case and a regression test.
- Do not introduce numeric probability language unless a representative, labeled field dataset and a documented calibration/validation procedure support it.
- Do not silently convert missing readings, missing logs, or unperformed checks into negative evidence.
- Do not count duplicate observations twice.
- Do not infer causal independence from different sensor names.
- Do not allow model-generated evidence labels to become observations without a traceable source.
- Keep the Bayesian layer advisory; deterministic diagnosis and safety policy remain authoritative.
- Preserve the current output contract unless a separately reviewed migration is explicitly requested.

## Required tests

Use the existing `tests/bayesian-engine.test.cjs` as the baseline and add focused tests for:

- unknown evidence leaves support unchanged;
- only explicit contradictory evidence lowers support;
- duplicates do not change the score;
- correlated evidence in one group is not repeatedly counted;
- independent evidence groups can contribute separately;
- mixed support and contradiction in one group is surfaced;
- evidence order does not change the result;
- invalid states are ignored safely;
- empty candidate sets return insufficient evidence;
- extreme inputs remain finite and bounded;
- output explicitly states that the model is not calibrated.

Also run the diagnostic regression suite because the Bayesian layer must not alter deterministic diagnosis, localization, or safety output.

## Required review output

Return:

- implementation version and files inspected;
- hypothesis and observation classification;
- evidence groups and possible dependency concerns;
- assumptions and calibration status;
- tests actually executed, with exact commands and results;
- unresolved risks and recommended next discriminating observation.

Never claim a test passed unless it was executed and its result was observed.
