# Diagnostic Session Registry Integration

## Scope

The browser loads `diagnostic-flows.js` before `diagnostic-session.js`. The shared registry currently contains 11 equipment/symptom definitions.

The adaptive session engine owns three multi-question hypothesis workflows:

- `pump|low_flow`
- `motor|not_start`
- `compressor|low_pressure`

For the other eight registry entries, the session engine now exposes a bounded single-step guided check using the registry's existing question, answer labels, and answer-specific guidance.

## Evidence and reasoning boundaries

A single-step registry answer is stored with an empty evidence-token array. The adapter does not manufacture evidence IDs, hypothesis scores, likelihood ratios, priors, or Bayesian probabilities from a label or guidance string.

The selected guidance is shown as guidance associated with the recorded answer. It is not a confirmed root cause, and it is not added to the adaptive hypothesis ranking.

The existing adaptive pump and motor flows retain their current evidence ranking and question-selection behavior.

## Language boundary

The current registry question, answer, and guidance text is authored in Arabic only. The adapter therefore refuses to display these nine single-step flows in French or English and returns `flow_translation_pending`. The UI explains that the technical wording has not yet been reviewed in those languages.

This is intentional: untranslated technical safety instructions must not silently appear as reviewed translations. The existing pump and motor adaptive flows remain available in Arabic, French, and English.

## Input matching

The UI resolves equipment and symptom text against a bounded alias map, then checks that the resulting key exists in the shared registry. Unknown combinations continue to use the general local diagnosis path; no flow is guessed or synthesized.

## Regression coverage

`tests/diagnostic-session-registry.test.cjs` covers:

- All 11 registry keys can start a session.
- All three adaptive sessions remain adaptive.
- The other eight entries use the single-step adapter.
- Curated guidance is returned exactly for the selected answer.
- Single-step answers do not fabricate Bayesian evidence or a confirmed cause.
- Invalid answers do not mutate the session.
- Arabic-only technical wording is not exposed as translated French/English.
- Equipment/symptom aliases resolve to the intended registry keys.

## Remaining work

1. Add reviewed French and English translations for the nine single-step flows.
2. Convert the highest-value single-step flows into multi-step, evidence-linked diagnostic trees with explicit competing hypotheses.
3. Add model- and source-scoped evidence only after reviewing the original manufacturer documents.
4. Select follow-up questions using measured discrimination value, test risk, test cost, and validated answer likelihoods. Do not label heuristic scores as calibrated probabilities.
5. Expand browser-level tests for input changes, language switching, saving reports, and PWA offline behavior.
