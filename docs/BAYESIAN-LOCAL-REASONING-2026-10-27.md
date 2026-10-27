# Bayesian-style local diagnostic ranking — 2026-10-27

## What changed

- Added `bayesian-engine.js`, a deterministic offline reranker for hypotheses produced by the existing local reasoning engine.
- Supporting observations raise a candidate's relative score; contrary evidence lowers it.
- The local UI displays a relative estimate and a clear caveat explaining that the likelihood ratios are heuristic and not calibrated field probabilities.
- Existing diagnostic safety gates, LOTO checks, OEM-source requirements, and the AI Worker remain separate and are not bypassed by this ranking.
- Updated the app-shell cache version and precache list so installed clients can receive the new module.

## Important limitation

This is a **Bayesian-style heuristic ranking**, not a validated Bayesian network learned from maintenance failure data. The default prior and likelihood ratios are provisional engineering heuristics. Displayed percentages are relative estimates and must not be interpreted as measured failure probabilities, diagnostic certainty, or permission to intervene.

## Validation plan

Automated regression tests check directionality (supporting evidence raises a score; contrary evidence lowers it), bounded scores, ranking order, empty evidence behavior, and explicit uncertainty labeling. CI must pass before merge. A real browser run is still required to confirm the module is loaded and the UI displays the estimates correctly.

## Next data-driven step

Collect reviewed fault cases with equipment family, symptom, observed evidence, confirmed root cause, and source provenance. Use a held-out evaluation set to estimate priors and likelihood ratios, measure calibration, and compare against the existing deterministic ranker before replacing any provisional values.
