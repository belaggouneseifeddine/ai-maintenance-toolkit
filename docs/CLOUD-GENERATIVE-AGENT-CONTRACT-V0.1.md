# Cloud Generative Agent Contract — v0.1

## Approved architecture
- The cloud model is the primary natural-language generation component.
- The deterministic diagnostic engine and reviewed knowledge records remain authoritative for diagnostic state, evidence accounting, safety gates, and allowed actions.
- The model is a language and synthesis layer, not the source of truth and not a substitute for missing measurements.
- The first release must not require the model to rank or confirm causes. It may explain the engine's current hypotheses, ask the selected next question, translate/summarize, and format an evidence-grounded report.

## Request pipeline
1. Validate and normalize equipment, symptom, context, language, and user answers.
2. Run safety screening before model invocation. Hazard indicators can stop normal troubleshooting and return the applicable stop/escalation message.
3. Run the local diagnostic session and retrieve only knowledge records applicable to the equipment family, symptom, and operating context.
4. Construct a bounded model request containing the session state, current hypotheses, evidence for/against each hypothesis, safe next check, and source metadata.
5. Require structured JSON output matching the response contract below.
6. Validate schema, evidence IDs, source IDs, and safety constraints server-side. Reject unsupported claims and regenerate once with validation errors; if still invalid, use a deterministic fallback.
7. Render the validated response with sources and uncertainty labels. Log minimal diagnostic metadata; do not log secrets or unnecessary personal data.

## Response contract
The model response must be JSON with:
- `summary`: short explanation grounded in the supplied session
- `next_question`: null or a question already authorized by the diagnostic engine
- `hypotheses`: only hypothesis IDs supplied by the engine, with concise evidence-grounded explanations
- `checks`: only safe checks supplied by reviewed knowledge records
- `source_ids`: IDs from the supplied source bundle only
- `uncertainty`: one of `insufficient_evidence`, `mixed_evidence`, `evidence_supports_hypothesis`
- `confirmed_cause`: must remain null unless an explicit future verification policy and qualified evidence allow confirmation; v0.1 always null
- `safety_stop`: boolean
- `limitations`: explicit missing measurements, unverified source status, or out-of-scope limits

## Source trust labels
- `official_verified`: manufacturer, regulator, standards body, or official technical document reviewed for the specific claim.
- `public_reviewed`: general public reference reviewed for reliability and applicability; not model-specific unless documented.
- `candidate_unreviewed`: discovered but not yet reviewed; must not support a definitive claim.
- `field_observation_unverified`: user/technician report that has not been independently verified.

Every source record should preserve title, publisher, URL or document identifier, page/section where available, retrieval/review date, equipment/model applicability, claim supported, reviewer, and review status. A URL alone is not proof that a claim is supported.

## Safety and failure behavior
- Never bypass interlocks, protective trips, isolation, or permit-to-work requirements.
- Never instruct users to open energized panels or pressurized equipment.
- Never invent thresholds, specifications, source citations, test results, or equipment details.
- Do not treat missing data as normal or as negative evidence.
- If model output fails validation, the deterministic fallback must remain usable.
- Model output cannot modify the knowledge base, change a source's trust label, close a diagnostic session as confirmed, or execute an external action.
- Do not send API keys to the browser. The model provider credential belongs in a server-side secret store.

## Parallel workstreams
A. Diagnostic reasoning: adaptive next-test selection, hypothesis evidence accounting, explicit abstention.
B. Knowledge quality: schema, provenance, applicability, review workflow, safety classification.
C. Cloud generation: server-side provider adapter, structured output validation, bounded retries, deterministic fallback.
D. Integration and evaluation: UI session state, mocked-provider tests, contract tests, security tests, and mobile end-to-end checks.

## Acceptance gates before merge/deployment
- Unit tests for diagnostic state transitions, adaptive question selection, unknown answers, contradictions, unsupported cases, and safety stops.
- Contract tests for valid/invalid model JSON, unknown source IDs, fabricated hypothesis IDs, and timeout/provider failure.
- Secret scan and checks proving no provider key is exposed in client bundles or logs.
- Regression suite for existing app functionality.
- Mobile browser test of the complete diagnosis path.
- Human review of representative pump and motor cases by a qualified maintainer.
- All test results and remaining limitations recorded. No merge or deployment until every required gate passes.
