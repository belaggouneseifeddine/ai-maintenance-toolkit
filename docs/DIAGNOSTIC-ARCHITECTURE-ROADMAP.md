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


## Implemented in the diagnostic report pilot
- Optional asset ID, technician name, priority selected by the user, and manual/page reference.
- Printable inspection report suitable for the browser's “Save as PDF” print flow.
- The report separates user-entered observations from suggested checks and explicitly states that it is not an engineering approval or work permit.
- The selected priority is carried into the local log status; this is a user selection, not an automatic risk assessment.


## 2026-11-03 verified status and priority update

This section supersedes the older baseline where the two differ. It distinguishes code already on `main` from work that remains in draft pull requests.

### Verified implementation on `main` (commit `f22880f`)

- The shared diagnostic registry contains 11 equipment/symptom definitions.
- Two flows are multi-step adaptive sessions (pump low-flow and motor no-start); the other nine registry entries use the single-step adapter.
- Local diagnosis is deterministic/rule-based with a qualitative Bayesian-style ranking layer. The probabilities are explicitly not calibrated from field failure data.
- The PWA caches its app shell. Maintenance records remain browser-local; there is no cross-device synchronization or conflict resolution.
- The Cloudflare Worker health endpoint is reachable, but a successful health response does not verify the live generative-model path.
- The knowledge audit report in the repository was last modified on 2026-10-25. Its counts are a historical snapshot until the audit script is rerun.

### Draft changes awaiting review

- PR #122 adds a third adaptive session for compressor low pressure and moves the deterministic safety gate ahead of the AI rate limiter. The code changes passed GitHub Actions on head `1f127ccb`; this roadmap-only follow-up commit is awaiting its own CI run. It is not merged or deployed.
- PR #123 proposes manual-only production deployment and manual-only live AI smoke testing. Its latest reported checks passed; it is not merged. Repository-level branch protection remains a separate settings task.

### Updated priority order

| Priority | Work | Exit condition |
|---|---|---|
| P0 | Release governance | Protect `main` with required PR review/checks; keep Pages and Worker production deploys manual-only; keep live model smoke tests explicitly approved |
| P1 | Complete adaptive diagnosis | Review PR #122; put local guided diagnosis on the primary diagnosis path; expand equipment coverage without changing stable flows |
| P1 | Replace heuristic confidence with calibrated reasoning | Define per-equipment priors and likelihoods from reviewed cases; model dependencies explicitly; rank tests using expected information gain adjusted for test risk, time, and availability; validate calibration against recorded outcomes |
| P1 | Knowledge provenance | Regenerate the audit report; approve source/license records; verify exact manufacturer/model/revision applicability; return page/section citations for every model-specific claim |
| P2 | Safety assurance | Expand multilingual hazard/negation/contradiction tests; keep deterministic stop-work guidance independent of model availability and AI quotas |
| P2 | Offline and mobile reliability | Persist guided-session state locally; test cache recovery and data loss on Android; add explicit sync/conflict semantics before any cloud synchronization |
| P2 | Performance | Lazy-load equipment-specific knowledge bundles; measure real first-load transfer and mobile performance rather than relying only on repository file sizes |
| P3 | Collaboration and CMMS integration | Add authenticated contributions, roles, review/version/dispute history, and an asset/work-order integration boundary before enabling public writes |
| P3 | Condition monitoring | Add read-only, timestamped sensor ingestion only after units, calibration, asset identity, and data quality are defined |

### Reasoning and product boundary

The current product should remain a diagnostic-first tool, not attempt to reproduce a full EAM/CMMS. The strongest product direction is a local, evidence-traceable troubleshooting layer that can export a defensible report and later connect to existing work-order, asset, and inventory systems. Do not claim predictive maintenance until timestamped field data and measured validation exist.

### Non-negotiable release gates

- No merge, production deployment, paid provider request, or public knowledge write without explicit approval.
- No model-specific limit, setpoint, or repair instruction without an exact applicable source.
- Unknown and contradictory evidence must remain visible; do not convert absence of data into a negative finding.
- A model suggestion must never override the deterministic safety gate.
- Report automated CI, live provider checks, and physical Android/offline acceptance as separate evidence categories.


## 2026-11-06 verified status and priority update

This snapshot supersedes the 2026-11-03 status above where the two differ. Repository state, branch checks and the Cloudflare settings were read during this review. No merge, production deployment, secret read or paid model inference was performed.

### Repository and runtime state

- **Production repository:** `main` is at `63d219c4667f858515354f76d68b2ec46cb43c0a` (2026-11-05 17:15 UTC). Its latest observed GitHub Pages workflow and quality checks succeeded.
- **Unmerged work:** PR #130, branch `feature/adaptive-diagnosis-knowledge-expansion-2026-11-06`, remains open and unmerged. The implementation/test snapshot that completed the full CI suite was `a199e0fa93acc842c40af07eb6c87bffe5d67f7b` (81 commits and 25 changed files at that point). This roadmap update is documentation-only; none of this branch has been merged or released to production.
- **Flow coverage:** `main` has 11 shared registry flows and 3 multi-step adaptive sessions. PR #130 expands this to 13 registry flows and 6 adaptive sessions; the remaining 7 registry flows still use the single-step adapter.
- **New general cases:** the branch adds three supplemental records: motor overheating, compressor overheating and bearing vibration. Their evidence status is explicitly general-reference / not model-verified. All 9 causes now have explicit cause-level `sourceRefs`; the 5 supporting source IDs exist in the registry and were content-reviewed. This checks traceability, not the truth of every claim.
- **Source-scope corrections:** the motor record uses an independent EPR article as secondary general guidance plus SKF bearing analysis; ABB MN404 is retained only as a related manual for Baldor-Reliance AC/DC mine motors, not as evidence for a general motor case. The compressor record uses two general Atlas Copco pages; the XAS 38-48 manual is a related model-specific route only and was not content-reviewed because the PDF exceeded the review limit. The bearing record uses the SKF damage guide and ISO 15243 article. Two model-scoped related manuals are excluded from supporting sourceRefs (one content-reviewed, one not content-reviewed).
- **Knowledge inventory on the branch:** 284 core records + 3 supplemental records = 287 local records; 37 equipment-type labels; 776 cause entries; 31 records with an alarmCodes/errorCodes array. The 60 model-specific manual-reviewed records remain manual-claim-reviewed, not field-verified. The OEM index contains 29 platform entries, with 0 model-verified; the 99 OEM diagnostic records are claim-reviewed against their cited scope, not field-verified. The source registry contains 68 official manufacturer/support records plus 1 independent secondary technical reference; the secondary article is explicitly non-fetchable and is not OEM authority.
- **Licensing:** the source registry has 2 candidate research sources and no approved source entries. Five reference-only portals and two reference-only books remain blocked from automated fetching. The books are indexed as metadata/navigation only; no open reuse license is recorded.
- **Cloudflare Worker, read-only configuration check:** the deployed Worker has an AI binding, `AI_PROVIDER=cloudflare`, model `@cf/meta/llama-3.2-3b-instruct`, and a rate-limit binding configured for 10 requests per 60 seconds. Its last deployment was 2026-11-04 23:20 UTC. The latest main-branch change to `worker.js` on 2026-11-05 only added the digital-electronics reference index, so the deployed Worker is behind the repository's Worker source by that knowledge-list change. The new PLC index and adaptive-flow changes remain only in PR #130. No Worker deployment was performed.
- **Provider default:** PR #130 changes the code fallback to Cloudflare so a missing `AI_PROVIDER` no longer silently selects Gemini. Gemini remains an explicit optional path in tests/code; the observed production binding selects Cloudflare. The existing `AI_API_KEY` and `OPENAI_API_KEY` secret bindings were observed by name only; their values were not read.
- **Offline cache:** PR #130 moves the service worker to cache version v56. Core UI, diagnostic scripts and the local fault library are cached as a required group; optional reference files are cached independently. A failed optional document no longer prevents the core app shell from being cached. Android airplane-mode acceptance is still outstanding.
- **Storage:** maintenance records and form drafts remain in browser `localStorage`; there is no IndexedDB migration, multi-device sync or conflict resolution.

### PDF review and knowledge boundaries

Two supplied PDFs were visible in the ChatGPT file library:

1. *Automates programmables industriels* — William Bolton, French 2nd edition / translation of the 6th English edition. The most relevant printed sections are sensors and I/O (pp. 25–64, 83–120), safety (pp. 311–315), commissioning (pp. 316–319), fault-finding (pp. 320–324), documentation (pp. 325–347), and temperature/valve/conveyor examples (pp. 353–375). PR #130 adds a reference-only chapter index. It does not add copied chapter text, figures or model-specific fault claims.
2. *Mastering Digital Electronics* — the repository already contains a reference-only chapter index. It is useful for digital logic, state machines, counters and related fundamentals, but it is not an industrial PLC service manual or a fault-finding procedure.

Both books are copyrighted and have no open reuse license recorded in the project. Keep them as private reference material and original navigation summaries. Do not republish their PDF contents or use either book alone to mark an OEM claim as model-verified.

### Strict implementation review

- **Architecture:** the app remains a lightweight PWA, but `index.html` still contains substantial rule tables, presentation and workflow code. The separate diagnostic/session modules are progress, not a complete separation of domain logic, UI and persistence.
- **Diagnostic engine:** the general local engine is deterministic keyword/rule matching with multilingual aliases and bounded advisory scores. It is not a semantic diagnosis engine. The 6 adaptive flows are curated and useful, but coverage is still narrow; 7 other registry flows remain one-step guidance. The flow resolver still maps free text through regular-expression aliases.
- **Bayesian reasoning:** the current layer is a qualitative Bayesian-style support scorer, not a calibrated Bayesian network learned from field outcomes. It uses a fixed prior and fixed support likelihood ratio, with explicit grouping assumptions. The next-question selector uses pairwise hypothesis separation; it is not full expected information gain over posterior entropy. UI labels correctly avoid claiming calibrated probabilities, but the implementation must not be marketed as a validated BN.
- **Evidence retrieval:** the Worker uses BM25 lexical retrieval with a legacy lexical fallback, returning a small number of Markdown chunks. It does not currently use embeddings or a vector index. The Worker fetches its configured Markdown files from the repository's `main` raw-content path and keeps a short per-isolate cache; this is not an offline semantic index.
- **Safety:** the main rule-diagnosis form checks four safety acknowledgements. The guided-session UI starts as soon as equipment/symptom text is entered and does not use that same gate; the cloud path requires consent but not completion of the form's safety checklist. The Worker has deterministic stop paths for protection-bypass requests and hydraulic/high-pressure leaks, but this is not a complete hazard classifier. A UI checkbox is an acknowledgement, not proof of isolation or a safety function. This is the highest-priority product gap.
- **AI and security:** the production configuration currently selects Cloudflare Workers AI and has a configured rate limiter. The Worker validates input/output, restricts browser origins and bounds request size. CORS is not authentication, however; non-browser clients can call a public endpoint, so the rate limiter and abuse monitoring remain important. The current BM25 retrieval and output source matching are useful safeguards but do not establish causal truth. The health smoke test is not a live model-quality test.
- **Offline and data:** local diagnosis can run without the cloud model after required assets are cached. The v56 partial-cache change improves installation resilience, but the app still needs physical Android airplane-mode testing, quota/storage-failure testing and session persistence. Clearing browser storage can remove local records; JSON/CSV export is not a substitute for tested backup/restore.
- **UX and scope:** Arabic RTL and French/English support exist, but not every guided technical flow is reviewed in every language. The product is a diagnostic-first tool, not a full CMMS: no work-order lifecycle, inventory, team roles, approval workflow or audit-grade multi-user history exists.
- **Performance:** the local fault library is a sizeable JSON asset and the Worker retrieves multiple Markdown files on a cold isolate. Measure first-load bytes, cold-start time and memory on the target Android device before claiming low-bandwidth performance.
- **Collaboration:** there is no authenticated contribution/review/dispute process or conflict-safe shared case history. Do not enable public knowledge writes until identity, moderation, versioning and provenance are designed.

### Competitor findings reviewed on 2026-11-06

The products below are not all direct substitutes; they cover CMMS/EAM, condition monitoring or measurement capture:

- **MaintainX** and **Fiix** document offline work-order workflows with later synchronization. Their offline model reinforces the need for cached work context and reliable sync, not just an offline landing page.
- **IBM Maximo Application Suite** is a broader EAM/asset-performance platform with asset history, work management, inventory and predictive/AI capabilities. It is an enterprise comparison, not a realistic feature-for-feature target for this free diagnostic tool.
- **Siemens Senseye** focuses on asset-agnostic predictive maintenance and condition-monitoring signals at industrial scale. **Fluke Connect** focuses on capturing, trending and sharing measurement data from compatible instruments/sensors.
- **Maintelix** is an Algerian CMMS offering Arabic/French interfaces, asset records, preventive maintenance, work orders and an offline-first mobile claim. That claim is vendor-provided and was not independently tested in this review.
- Public user discussions emphasize technician adoption, implementation ownership, mobile reliability and workflow fit. Individual Reddit reports are anecdotal and must not be treated as a representative benchmark.

Product implication: do not rebuild the CMMS layer. Make this toolkit the evidence-traceable troubleshooting layer that can export a defensible report and later hand it to a CMMS/work-order system.

### Updated priority order

| Priority | Work | Exit condition |
|---|---|---|
| P0 | Unify the safety gate across rule diagnosis, guided sessions and cloud assistance | One deterministic gate/stop policy is shared by every path; observation-only questions are separated from interventions; hazardous actions remain blocked; tests cover electrical, pressure, thermal, stored-energy and guard/interlock hazards |
| P1 | Replace pairwise question selection with expected information gain | For each candidate test, calculate expected posterior entropy across possible outcomes, then adjust for risk, time, cost and availability; validate against reviewed cases and record actual outcomes |
| P1 | Expand adaptive equipment coverage | Add PLC I/O faults, sequence stalls, sensor/actuator feedback, temperature-control and conveyor-count workflows only with bounded hypotheses, safe observations, exact evidence IDs and reviewed language |
| P1 | Calibrate evidence and priors | Define dependency groups and priors/likelihoods from reviewed historical cases; measure calibration, false positives and false negatives; keep uncalibrated support labels until sufficient outcomes exist |
| P1 | Hybrid semantic retrieval | Benchmark BM25 first; add a lightweight local embedding/index only if it improves retrieval on synonym and multilingual test sets; preserve source/page provenance and an offline fallback |
| P1 | Knowledge governance | Keep core and supplemental records separately visible; require source registration, page/revision scope, claim review and human approval; never promote a general textbook to model-specific evidence |
| P1 | Offline and data resilience | Test v56 on Android in airplane mode; persist session state; move structured records to versioned IndexedDB with tested JSON backup/restore before any sync |
| P2 | UX and language coverage | Replace the static symptom-first path with equipment/context/readings intake; show why a test was selected, what is unknown and what would change each hypothesis; review every technical translation |
| P2 | Worker abuse/privacy controls | Keep Cloudflare as the default provider; audit stale secret bindings, monitor rate-limit events, add abuse controls appropriate to a public endpoint, and keep plant data out of logs |
| P2 | Mobile performance | Measure cold load and cache footprint on Android/limited data; lazy-load optional reference bundles and compress structured knowledge where safe |
| P3 | CMMS interoperability | Export asset ID, diagnostic evidence and recommended work scope to existing work-order systems; do not build full inventory/dispatch functionality in this app |
| P3 | Condition monitoring | Accept read-only, timestamped sensor data only after asset identity, units, calibration, baseline and data-quality rules are defined |

### CI evidence for this snapshot

At branch head `a199e0fa`, GitHub Actions reported success for the maintenance unit/integration suite, diagnostic/worker contract suite (61 tests, 0 failures), Bayesian engine regression (13 tests, 0 failures), local reasoning regression (8 tests, 0 failures), diagnostic engine regression (16 tests, 0 failures), and knowledge validation. The knowledge workflow confirmed the generated audit report, source-page HTTPS checks, published Pages HTTP 200 and Worker `/health` HTTP 200. The suite includes the Cloudflare-default provider test, cause-level evidence/scope tests, and offline-cache tests that simulate optional-reference failure and required-core failure.

These are automated CI and health checks, not physical Android acceptance, not a live AI inference/quality evaluation, and not a production deployment. Keep those evidence categories separate.


## 2026-11-09 evidence-driven update

### Branch and change boundary

- Reviewed branch: `docs/master-requirements-open-source-research-2026-11-09`.
- Before this audit's patch, the branch was 29 commits ahead of `main` and 0 commits behind. No merge or production deployment was performed.
- No runtime fault record was promoted during this review. The patch set is limited to a Worker flow-pair validation correction, a fail-closed benchmark license check, removal of an unlicensed candidate copy, source metadata and documentation.

### Current evidence inventory

- `faults.json`: 284 records across 36 equipment types; 17 are pump records. 152 records have no `sourceRefs`; only 132 have them. The 17 pump records have no source references.
- `diagnostic-evidence-register.json`: 287 entries — 171 `source-not-recorded`, 60 `verified`, 56 `review-needed`.
- `oem-verified-faults.json`: 99 claims across 8 manufacturers, 24 model scopes and 17 source documents; zero pump claims.
- `faults-supplement.json`: three general records, none is a centrifugal-pump pilot case.
- `knowledge/sources.json`: two CC BY 4.0 pump research papers, now scoped as research references only.

### Diagnosis and reasoning

- The local registry contains 13 flows; six have adaptive sessions and seven are single-step guidance entries.
- The pump adaptive session is still a broad low-flow differential, not six separately evidenced cases.
- The support scorer uses a fixed prior and fixed likelihood ratio; its bands are heuristic support, not calibrated probabilities.
- The next-question selector does not yet optimize expected information gain under safety/time/cost constraints.
- The Worker had an equipment/symptom mismatch check for only three of its six server-curated flows. This branch adds checks for motor-overheat, compressor-overheat and bearing-vibration, with regression tests.
- The retrieval path is lexical/term-based over curated documents; no vector-embedding semantic index is present in the inspected Worker path.

### Product surface confirmed in source

- Arabic/French/English interface; local guided diagnosis, fault library and safety guidance.
- PWA shell with service-worker caching and local diagnosis when offline; cloud AI and external references are not available offline.
- User-defined preventive-maintenance tasks and recurrence; this is scheduling, not predictive maintenance.
- Local maintenance log, local photo attachments, shift handover report, local statistics, CSV export, JSON backup/import, print and Web Share/clipboard handoff.
- Photo attachments are local records, not a document-ingestion pipeline. No PDF/OEM-manual ingestion, automatic sensor/historian ingestion, calibrated RUL, multi-user sync or authenticated community contribution workflow was found in the inspected UI/source tree.

### Security and operational boundary

- Worker controls include an origin allowlist, JSON/body-size validation (8 KB), rate limiting, structured-output validation, prompt-injection handling and deterministic safety escalation for selected high-risk requests.
- CORS is not authentication. No user identity/authentication layer or shared audit trail is present in the inspected Worker flow.
- Local browser storage is not shown as encrypted at rest. Security headers/CSP were not established by the source review.
- The latest pre-patch GitHub Actions run passed the diagnostic-engine, maintenance-toolkit and quality-check jobs. The knowledge-asset validation job failed while fetching external sources (network timeout); this was not a passing knowledge validation.
- A local clone/test run could not be completed because GitHub network access from the audit runtime failed. Post-patch CI remains the required verification.

### Updated priority order

1. **P0 — rights and source integrity:** keep unlicensed third-party data out of the repository; require primary-source license verification before any benchmark download; keep code and data licenses separate.
2. **P0 — diagnostic contract integrity:** validate all six server-curated flow/equipment/symptom combinations; retain regression tests.
3. **P1 — centrifugal-pump pilot:** map components and create six separate, claim-traceable cases. Start with one research-reference-only bearing/seal case, then independently source cavitation, air-lock, suction blockage and low-flow evidence. Do not promote the research-only cases as OEM-verified.
4. **P1 — measured diagnostic quality:** add missing/contradictory/noisy/sensor-fault test fixtures; separate measured, PLC-indicated and estimated values; track units, location and operating point.
5. **P1 — reasoning:** replace fixed-LR scoring with an explicit dependency model and validated conditional probabilities, or keep the current support bands explicitly heuristic. Implement expected information gain subject to safety, time and cost.
6. **P2 — knowledge architecture:** use a small attributed AAS asset/submodel subset and Brick HVAC point relationships; add local semantic retrieval only after the source corpus is rights-cleared and benchmarked.
7. **P2 — offline/mobile:** verify Android offline behavior, storage limits, import/export recovery and accessibility with real device tests.
8. **P3 — predictive maintenance and collaboration:** only after time-series provenance, calibration, group-split benchmarks, authenticated sync and auditability exist. Do not expose RUL or anomaly scores as root-cause diagnosis.
