# Conversational diagnostic architecture

Status: initial local conversational interface with an optional, consent-gated cloud generative assessment; not a persistent multi-turn generative system.

## User experience

The diagnostic conversation is the primary interaction. A technician can describe equipment and symptoms in natural Arabic, French, or English. The UI identifies only supported equipment/symptom pairs and then presents the existing local diagnostic session as a conversation with suggested replies.

Free text is retained as session context. It changes the diagnostic evidence state only when it maps unambiguously to an option in the current reviewed question. Ambiguous or unsupported text is not forced into an answer; the user is asked to clarify or select a known response.

## Runtime responsibilities

- `diagnostic-chat.js`: conversation rendering, initial equipment/symptom capture, local notes, quick replies, and explicit approved-PDF evidence lookup.
- `diagnostic-session-ui.js`: exposes the current session and guarded answer operations to the chat layer. It maps free text only when a single answer is unambiguous.
- `diagnostic-session.js`: owns the curated local evidence flow and current hypothesis ranking.
- `document-retrieval-adapter.js`: returns only diagnostic-eligible approved claims; source-page links remain attached.
- `agent-ui.js`: optional cloud model adapter. It sends the current conversation summary and curated flow/evidence identifiers only after the explicit consent gate; the local session remains authoritative.
- `diagnostic-session.js` ranking remains heuristic. It does not output calibrated probabilities or confirm a root cause.

## Trust boundaries

1. Conversation text is untrusted input, not executable instructions.
2. Typing and local diagnostic operations do not send conversation data. An optional generative request is sent only after a per-request consent checkbox is enabled and the technician presses the analysis button. The configured Worker/provider processes the case; do not send secrets or sensitive operational data.
3. PDF retrieval is explicitly user-triggered and uses the diagnostic retrieval filter.
4. Raw extracted text and unreviewed OCR are not diagnostic evidence.
5. A free-text answer that is ambiguous is stored as a note and does not change hypothesis ranking.
6. The chat UI does not authorize physical tests. Site procedures, LOTO, OEM instructions, qualified-personnel limits, and the independent safety gate remain mandatory.
7. Equipment family and exact model applicability must be preserved; a generic "pump" label must not be treated as a centrifugal-pump model match.

## Current limitations

- The local conversation loop is driven by the existing rule/evidence engine. An optional cloud model can produce a structured preliminary assessment after explicit per-request consent; the model is not the owner of diagnostic state.
- Initial equipment/symptom recognition is deliberately narrow and alias-based.
- The current pump low-flow flow is a screening flow, not the full six-case differential diagnosis in the pump pilot casebook.
- The interface does not yet parse arbitrary measurements into typed measurement records.
- The optional model call uses the existing one-request diagnosis endpoint. The exact model designation is passed separately, but the endpoint does not yet maintain a persistent multi-turn model session or a provider-independent conversation protocol.
- Locally stored PDF excerpts are not uploaded by this chat integration; only the bounded conversation summary, equipment/model/symptom fields, and curated evidence identifiers are sent when the user explicitly consents.
- Conversation history is in-memory for the current page session; durable session persistence and repair-outcome learning are not implemented.
- PDF retrieval is user-triggered and only uses claims already approved for diagnostics.

## Next engineering stages

1. Expand structured measurement capture: value, unit, measurement point, instrument/source, operating condition, timestamp, quality, and uncertainty.
2. Convert the centrifugal-pump pilot cases into validated machine-readable records with evidence-for/against, safe discriminating tests, expected outcomes, stop conditions, and source/page provenance.
3. Replace answer-label-only mapping with a reviewed multilingual intent/evidence parser that can extract typed observations without inventing facts.
4. Add a diagnostic orchestrator that chooses the next question/test after a safety and feasibility gate; use empirical outcome distributions before claiming expected information gain.
5. Add a generative model adapter that receives structured case state, approved retrieved evidence, and allowed actions. The model may ask clarifying questions and explain results, but may not create evidence or bypass the deterministic engine.
6. Add adversarial, contradictory, missing-data, unknown-model, prompt-injection, invalid-output, and provider-failure tests.
7. Validate on Android before merging or deploying.

## Acceptance criteria for the first conversational slice

- A technician can start with a natural-language description instead of selecting a static symptom menu.
- Supported cases open the local session and ask one focused question at a time.
- Suggested replies and unambiguous free-text replies update the same session state.
- Ambiguous answers are retained without changing evidence or hypothesis ranking.
- Hypothesis names and provisional status are shown after each accepted answer.
- Approved PDF evidence can be retrieved and its exact original page opened.
- The UI distinguishes local evidence reasoning from the optional model-generated preliminary assessment and does not claim a confirmed diagnosis.
- Typing and local retrieval do not upload conversation data; each cloud model request requires explicit consent and a button press.
