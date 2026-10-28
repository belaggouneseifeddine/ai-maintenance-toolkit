# Dynamic diagnostic session v0.1 — engineering contract

## Why this exists
The current diagnostic UI accepts a predefined equipment and symptom pair, then largely returns a prepared plan. This module introduces a stateful, offline-first session for selected curated cases: collect evidence, rank several hypotheses against explicit support/contradiction signals, then ask the next question. It does not call a model or network and does not claim calibrated probabilities.

## Initial scope
- Centrifugal/process pump with low flow.
- Electric motor that does not start.

These are pilot flows only. Other pairs must return `flow_not_curated`, not a guessed diagnostic tree.

## Session contract
- `createSession({equipment, symptom, language})` returns the first discriminating question, hypotheses unresolved by default, and limitations.
- `answer(session, answerId)` records the selected answer and evidence tokens, updates transparent support/contradiction lists, and advances to the next curated question.
- Unknown answers add no evidence.
- The last step returns an evidence-review state with a blank `confirmedCause` and a request for more evidence.
- The score is a simple heuristic ranking, not a probability. No calibrated confidence is displayed.
- This module is not yet the production UI's active diagnostic path. Integration and mobile end-to-end testing remain required.

## Knowledge quality requirements
Each hypothesis should eventually include: equipment family/model scope, symptom patterns, discriminating observations, safe checks, counter-evidence, source claim/page, applicability constraints, review status, and a date/reviewer. General references must not be represented as model-specific evidence. Candidate/unreviewed sources cannot confirm causes.

## Safety and acceptance gates
- Safety review takes precedence over diagnostic progression.
- Unknown measurements stay unknown; no inferred thresholds, values, or specifications.
- No instructions to bypass interlocks, open pressurized systems, or touch energized equipment.
- Unsupported equipment/symptom pairs stop with an explicit limitation.
- Tests cover evidence updates, unknown answers, unsupported cases, and no false confirmation.
- Do not merge or deploy until the module is integrated, existing tests pass, and UI flows are tested on mobile.
