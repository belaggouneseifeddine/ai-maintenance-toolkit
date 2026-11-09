# Maintenance AI Toolkit — Master Product Requirements

> Status: living product specification. This document records the product direction and acceptance criteria; it is not proof that every capability is implemented or validated.
> Last reviewed: 2026-11-09.

## 1. Product vision

Build a mobile-first, offline-capable **Industrial Maintenance Intelligence Platform** that helps technicians understand equipment, reason from evidence, investigate faults safely, preserve maintenance knowledge, and improve decisions over time.

The product is not merely a CMMS, a symptom lookup table, or a generic chatbot. Its differentiator is a traceable diagnostic workflow that combines engineering rules, structured knowledge, evidence retrieval, uncertainty-aware reasoning, and a non-bypassable safety layer.

### Product principles

1. Evidence before confidence: distinguish observations, assumptions, hypotheses, verified facts, and unknowns.
2. Diagnosis is not anomaly detection; prognosis is not diagnosis.
3. Safety rules are deterministic and independent of language-model output.
4. Local functionality remains useful without a network or paid AI provider.
5. Every technical claim should have provenance and a review state.
6. Never invent measurements, limits, model compatibility, citations, or test results.
7. Human technicians remain responsible for work execution and approval.
8. Optimize for Android/mobile use, low bandwidth, and free or low-cost operation.

## 2. User and operating constraints

- Primary user: industrial maintenance technician / troubleshooting practitioner.
- Interface languages: Arabic, French, English; all user-facing flows should be translated consistently.
- Primary device: Android phone; responsive, touch-friendly layout.
- Connectivity: intermittent or limited mobile data; offline-first behavior is required.
- Cost: free core functionality; no paid dependency without explicit approval.
- Technical level: useful to technicians while preserving engineering detail and units.
- The app is decision support, not a replacement for site procedures, OEM manuals, qualified personnel, or statutory requirements.

## 3. Functional requirements

### FR-DIAG — Evidence-driven diagnostic engine

The diagnostic session must collect, where relevant:
- Equipment class, asset identity, manufacturer, exact model, serial or configuration.
- Operating state, duty cycle, speed, load, process conditions, environment, and recent changes.
- Symptom onset, frequency, severity, sequence, alarms, events, and prior interventions.
- Available readings with value, unit, timestamp, sensor/location, measurement method, and operating state.
- Missing information and confidence/quality of each observation.

The engine must:
- Ask context-sensitive follow-up questions; avoid a fixed symptom menu as the main reasoning mechanism.
- Generate multiple plausible causes, not a single premature answer.
- Show evidence supporting and contradicting each hypothesis.
- Separate known facts, technician observations, inferred assumptions, and unknowns.
- Rank hypotheses transparently without presenting uncalibrated scores as probabilities.
- Select the next useful inspection or measurement based on expected information gain, safety, cost, and feasibility.
- Update the ranking when new evidence arrives and preserve the reasoning history.
- Detect contradictory, stale, implausible, or out-of-range input.
- State when evidence is insufficient and when a specialist/OEM source is required.
- End with a verified cause only when the user records a confirming inspection or repair outcome; otherwise retain a provisional diagnosis.

Acceptance criteria:
- A session with insufficient readings explicitly asks for the most useful missing evidence.
- A contradictory reading is surfaced, not silently reconciled.
- A new reading can change the hypothesis ranking and the explanation states why.
- The system never labels an unverified cause as confirmed.
- An unsafe test is blocked or replaced with a safe alternative/escalation.
- A diagnostic result can be exported with evidence, assumptions, source references, and safety notes.

### FR-KNOW — Structured fault and engineering knowledge base

Each knowledge record should support:
- Stable ID, title, language, domain, equipment class, component, and applicable make/model/series.
- Failure mode, symptom, operating context, causes, mechanisms, and dependencies.
- Supporting evidence, contradicting evidence, discriminating tests, and expected observations.
- Measurements, units, ranges, conditions, method, sensor placement, and reference source.
- Inspection sequence, corrective action, required competence, tools, spare parts, and post-repair verification.
- Hazards, isolation requirements, PPE, stored-energy controls, and stop-work conditions.
- Source URL/document, publisher, document number, revision/date, page/section, access date, and exact claim supported.
- Verification level, reviewer, review date, version, superseded status, and known limitations.
- Field case/outcome linkage, with sensitive plant information removed or consented.

Source trust levels (do not collapse these into one generic "verified" flag):
1. Exact original OEM document reviewed for the exact model/configuration and claim.
2. OEM document reviewed but generic or model scope incomplete.
3. Recognized standard, regulator, university, or engineering reference reviewed.
4. Peer-reviewed research or validated benchmark.
5. Reputable technical publication / training material.
6. Community contribution with evidence and review pending.
7. Unverified lead or external link.

A source link alone is not evidence that the referenced claim is correct. Do not use `official_model_verified` unless the exact document, model scope, and relevant page/claim were actually reviewed.

Knowledge coverage should expand across pumps, motors and drives, hydraulics, pneumatics, compressors, gearboxes, bearings, couplings, lubrication, conveyors, cooling/thermal systems, valves/cylinders, sensors/actuators, electrical panels, PLC/HMI/SCADA, industrial networks, CNC/servo systems, and process equipment.

### FR-SEARCH — Semantic retrieval and knowledge grounding

- Search by meaning and technical relationships, not exact keywords alone.
- Preserve exact-keyword and structured-filter search as complementary paths.
- Return matched passages, source metadata, equipment/model scope, and why each result matched.
- Distinguish retrieval relevance from source authority and technical truth.
- Support multilingual aliases and terminology (Arabic/French/English) without silently changing units or component identity.
- Do not invent citations when retrieval returns no source.
- Keep embedding/index generation optional and compatible with local/offline constraints; do not require Ollama.

### FR-SAFETY — Independent safety gate

The safety layer must run independently of AI responses and cannot be overridden by a generated answer or a user checkbox alone.

Cover at minimum:
- Electrical isolation, verification of absence of voltage, arc-flash/qualified-person boundaries.
- Lockout/tagout and site-specific permit requirements.
- Hydraulic and pneumatic pressure, accumulators, trapped energy, and safe depressurization.
- Rotating machinery, guards, belts, couplings, and unexpected startup.
- Hot surfaces, steam, chemicals, confined spaces, lifting, and stored mechanical energy.
- Safe inspection versus work requiring qualified personnel.

The system must never advise bypassing guards, interlocks, alarms, relief devices, or protective functions; touching energized parts; opening pressurized/hot equipment; or checking hydraulic leaks by hand. If isolation or safe state is uncertain, stop and escalate. A user confirmation is not proof that isolation has been completed.

### FR-ASSET — Asset profile and maintenance history

Support asset ID, plant/line/location, manufacturer, model, serial/configuration, commissioning date, operating hours/cycles, manuals, components, history, parts, recurring faults, readings, alarms, and notes.

### FR-RECORD — Maintenance records

Support inspections, work requests, tasks, actions, parts, downtime, root cause, repair, responsible role, status, attachments, and post-repair verification. Provide safe edit/delete behavior, draft recovery, filters, export/import, and data-integrity checks. Failed persistence must never be presented as successful.

### FR-PM — Preventive and predictive maintenance

- Calendar/usage-based preventive schedules and recurring tasks.
- Reminders and due/overdue status, with configurable intervals and responsibility.
- Trend monitoring for vibration, temperature, current, pressure, flow, speed, and other supported signals.
- Baseline and operating-regime comparison; detect drift and change points.
- MTTR/MTBF only when sufficient, correctly defined history exists.
- Remaining useful life (RUL) only when relevant run-to-event data, calibration, and validation exist; otherwise show trend/condition indicators without a numerical promise.
- Link recommendations to asset history and source evidence.

### FR-HANDOVER — Shift handover

Summarize stopped/limited equipment, open faults, incomplete work, hazards, temporary controls, pending measurements, parts waiting, and next actions. Preserve author/time and acknowledgement history.

### FR-COMMUNITY — Reviewed contributions

Contributors can submit cases, fault records, corrections, sources, and translations. The workflow must include completeness checks, privacy/sensitive-data review, safety review, technical review, source-level classification, approval/rejection/return, version history, reviewer identity, and audit trail. Unreviewed submissions must not silently enter trusted diagnostic knowledge.

### FR-OFFLINE — Offline-first operation

- App shell and core local diagnosis remain usable without network.
- Downloaded knowledge is searchable offline.
- Local records and drafts persist with visible save/error status.
- Sync is deferred until online and handles duplicate/conflicting edits explicitly.
- Users can see sync state and export/backup data.
- Avoid losing records when storage quota is exhausted, local storage is unavailable, or a write fails.
- Verify on real Android devices and browsers, not only mocked tests.

### FR-UX — Interface and accessibility

- Industrial Premium visual direction: navy/cyan/amber, balanced information density, light/dark themes.
- Mobile-first layout with clear hierarchy, large touch targets, legible units, and minimal unnecessary typing.
- Arabic RTL, French, and English must work across navigation, diagnostics, errors, reports, and safety content.
- Use the label "التشخيص" for the diagnostic action; avoid duplicate or misleading controls.
- Explain technical terms where useful without removing technical precision.

### FR-SEC — Security, privacy, and resilience

- Validate all input at the boundary; enforce request-size limits while streaming.
- Rate limiting and abuse controls must be operationally verified; CORS is not authentication.
- Keep secrets out of frontend code, repository, and local storage.
- Treat uploaded documents, retrieved text, and community content as untrusted data; defend against prompt injection.
- Validate source IDs and links; never accept model-generated references as trusted by default.
- Minimize telemetry and never log secrets or unnecessary sensitive plant data.
- Handle provider errors, timeouts, invalid JSON, malformed schemas, storage failure, and network loss safely.
- Test data deletion/export, privacy boundaries, and cross-device conflict behavior.

### FR-ARCH — Architecture and extensibility

Maintain clear modules for UI, local diagnostic engine, knowledge retrieval, safety policy, storage/sync, optional AI adapters, and evidence/provenance. External providers must be optional adapters, not core dependencies. Keep algorithms and schemas testable independently of the UI. Optimize bundle size, startup, search latency, and offline cache behavior.

## 4. AI and reasoning architecture

### Local-first architecture

1. Deterministic safety policy and validation.
2. Structured asset/context/evidence model.
3. Local diagnostic rules, causal relations, and decision trees.
4. Local knowledge retrieval (keyword, filters, semantic retrieval where feasible).
5. Evidence-weighted hypothesis ranking and information-gain test selection.
6. Optional cloud AI for language assistance or structured suggestions, with consent and validation.
7. Outcome capture and reviewed learning loop.

AI output must conform to a schema and pass validation. It may propose hypotheses, questions, or summaries, but cannot create verified evidence or bypass safety.

### Reasoning capabilities to develop

- Bayesian evidence updating only where priors/likelihoods have a defensible basis; otherwise use transparent ordinal evidence scoring.
- Fault trees, causal graphs, failure-mode relationships, and dependency propagation.
- Counterfactual checks: what evidence would be expected if a hypothesis were true/false?
- Information-gain / expected-value-of-information test selection, adjusted for hazard, time, cost, and accessibility.
- Out-of-distribution detection and explicit "unknown equipment / unknown operating regime" behavior.
- Calibration and validation reports; never label an arbitrary score as probability.
- Learning from confirmed outcomes with human review and dataset-quality controls.

## 5. Non-functional requirements and test strategy

Every feature should have:
- Unit tests for core rules and schema validation.
- Integration tests for UI-to-engine and storage boundaries.
- Regression tests for known cases and previously fixed bugs.
- Negative tests: missing fields, conflicting evidence, invalid units, malformed JSON, unknown references, injection attempts, storage errors, provider timeouts, and unsafe requests.
- Language/RTL tests for Arabic, French, and English.
- Android/mobile viewport and offline tests.
- Performance checks for initial load, knowledge search, and diagnostic response.
- Documentation of test scope and what has not been tested.

No test, deployment, provider status, or field validation may be claimed unless evidence exists for that exact build and environment.

## 6. Traceability matrix — initial repository baseline

This matrix is a starting map, not a claim that all acceptance criteria pass. "Partial / verify" means code exists or is documented but end-to-end completeness is not yet established.

| ID | Requirement area | Current repository entry points | Initial status | Next verification |
|---|---|---|---|---|
| FR-DIAG | Local diagnostic engine and flows | `diagnostic-engine.js`, `diagnostic-flows.js`, `engineering-core.js`, `agent-core.js` | Partial / verify depth and evidence model | Test dynamic questioning, contradiction handling, ranked hypotheses, evidence updates, and unknown cases |
| FR-KNOW | Fault knowledge and provenance | `faults.json`, `knowledge/manufacturer-sources.json` | Partial | Audit schema, coverage, source claim/page mapping, and verification levels |
| FR-SEARCH | Semantic retrieval | knowledge excerpt/index code; locate exact modules during implementation audit | Not established as production semantic retrieval | Inspect current index, retrieval ranking, multilingual aliases, and source-grounded results |
| FR-SAFETY | Independent safety checks | safety checklist/gate in diagnostic and agent paths | Partial / verify bypass resistance | Adversarial tests across every diagnostic route and external AI response |
| FR-ASSET | Asset profiles | maintenance workflow files including `maintenance-v03.js` | Partial / verify data model | Map existing fields, persistence, history, and asset linking |
| FR-RECORD | Maintenance records | `maintenance-v03.js`, local storage and record tests | Partial; persistence failure handling exists | Test quota/unavailable storage, edit/delete, export/import, recovery |
| FR-PM | PM/PdM | maintenance workflow and dashboard modules | Needs gap audit | Verify recurrence, reminders, usage intervals, trend model, and limitations |
| FR-HANDOVER | Shift handover | no dedicated module confirmed in README | Not established | Design and implement after asset/record model |
| FR-COMMUNITY | Contribution review | no complete review workflow confirmed in README | Not established | Audit current submission path; define reviewer workflow and data privacy controls |
| FR-OFFLINE | PWA/offline | `manifest.json`, `sw.js`, local knowledge and storage | Partial | Real Android airplane-mode tests, storage failures, cache updates, sync conflicts |
| FR-UX | Mobile/i18n/themes | `index.html`, `i18n.js`, `ux-redesign.js` | Partial / verify all screens | Full language/RTL/accessibility regression |
| FR-SEC | Worker and browser security | `worker.js`, `wrangler.toml`, tests | Partial | Runtime rate-limit verification, injection tests, provider failure tests, privacy audit |
| FR-ARCH | Modular boundaries | `engineering-core.js`, `agent-core.js`, adapters | Partial | Dependency graph, duplication, schema contracts, browser performance |
| FR-OUTCOME | Confirmed outcome feedback loop | maintenance records and diagnostic session history | Not established as a validated learning loop | Add predicted-vs-observed outcome schema and reviewed feedback workflow |

### Traceability rules

- Each requirement receives a stable ID and must map to implementation paths, tests, and a status.
- A requirement is "implemented" only when the code path exists; "verified" only when acceptance tests pass; "field validated" only with documented real-world evidence.
- Keep "not implemented", "partial", "implemented", "automated test verified", and "field validated" as distinct states.
- Update this matrix in the same pull request as material requirement changes.

## 7. Priority roadmap

### P0 — Trustworthy diagnosis foundation
1. Audit the actual diagnostic session schema and all active flows.
2. Standardize evidence/hypothesis/result schemas.
3. Add contradictions, missing-data handling, and explainable ranking.
4. Make the independent safety gate universal and test bypass attempts.
5. Expand high-quality fault records with source provenance.

### P1 — Knowledge retrieval and reasoning
1. Build hybrid keyword + semantic retrieval with source passage display.
2. Add multilingual aliases and unit-aware filters.
3. Add causal/fault-tree representation and information-gain question selection.
4. Add out-of-distribution and data-quality checks.
5. Build a regression casebook from reviewed real cases.

### P2 — Asset and maintenance workflow
1. Strengthen asset profiles and linked maintenance records.
2. Add preventive schedules, reminders, and shift handover.
3. Add post-repair verification and predicted-vs-observed outcome capture.
4. Add safe reviewed community contributions.

### P3 — Condition monitoring and prognosis
1. Define CSV data contract and sensor metadata.
2. Add signal feature extraction and baseline/trend views.
3. Evaluate anomaly detection on public benchmarks.
4. Add prognosis only after sufficient run-to-failure data and validation.

### P4 — Product quality and distribution
1. Android offline and storage reliability.
2. Security/privacy and accessibility audit.
3. Performance and bundle-size optimization.
4. Free core and optional paid extensions only after product validation.

## 8. Explicit exclusions and guardrails

- No dependency on Ollama, Gemini, OpenAI, or any single cloud provider for core diagnosis.
- No paid service, hardware purchase, or new recurring cost without explicit approval.
- No direct copying of third-party code before checking license, dependencies, security, provenance, and compatibility.
- No autonomous equipment control, protective-system bypass, or unsupervised work authorization.
- No claims of OEM verification, diagnosis accuracy, RUL accuracy, or industrial validation without evidence.
- No merging or production deployment without separate explicit approval for that change.

## 9. Change log

- 2026-11-09: Initial master specification consolidated from product requirements and current repository README. Initial statuses deliberately conservative; implementation audit remains necessary.
