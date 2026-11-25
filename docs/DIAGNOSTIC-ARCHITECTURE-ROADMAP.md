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


### Post-patch verification — 2026-11-09

Verified on commit `0c1b2287df7d0a94fff0160f7652befd56b0f6c5`:

| Check | Command / workflow step | Result |
|---|---|---|
| Diagnostic and Worker contract | `node --test tests/diagnostic-session.test.cjs tests/worker-contract.test.cjs` | 67 passed, 0 failed |
| Full Node unit/integration suite | `node --test tests/*.test.cjs` | 240 passed, 0 failed |
| Knowledge and benchmark manifests | `python scripts/test_benchmark_manifests.py` and knowledge asset tests | 20 passed, 0 failed |
| Source registry | `python scripts/fetch_licensed_sources.py --validate-only` | errors=0 |
| Allowlisted source fetch | `python scripts/fetch_licensed_sources.py --cache-dir /tmp/maintenance-ai-source-cache` | errors=0; cache remained outside the repository workspace |
| UI browser smoke | `node scripts/ui-smoke-test.mjs` | `UI_SMOKE_OK`: Arabic/RTL, French/English LTR, theme, ARIA state, 320–1280 px, no uncaught page errors |
| Published app / Worker smoke | `node scripts/smoke-test-live.mjs` | `CORS_PREFLIGHT_OK`; published app and Worker health checks passed |

The Worker flow-pair regression tests, URMA primary-license gate tests and unlicensed Industrial Ops content-removal tests all passed. The service-worker test still reports one of seven optional reference assets not cached; core offline app installation remains successful. The live smoke test checks health/CORS, not a full live generative-AI response. No Android handset test, provider completion test, RUL calibration, merge or deployment was performed.


## 2026-11-23 daily audit — evidence-led pump pilot and import gates

**Audit base:** branch `feat/knowledge-importer-diagnostic-engine-2026-11-22`; branch comparison reports 17 commits ahead of `main`, 0 behind. The branch is not merged. No production deployment was performed.

### Verified repository state

- The branch adds a local knowledge importer, a user-facing import form, and an IndexedDB staging store. The importer accepts JSON, CSV, Markdown and TXT, enforces a 5 MiB input limit and 5,000-row limit, and saves records as `candidate` / `runtimeEligible: false`. PDF/OCR remains in the separate document-library workflow.
- Staging is local to the browser/device. The UI explicitly says imported items are not available to the diagnostic engine.
- The importer requires code-license and data-license text, attribution and a reuse-status value, but these fields are user-supplied metadata; they are not proof of rights. Do not treat `reuse_permitted` as legally verified without an evidence URL and reviewer record.
- The pump casebook documents six differential cases (cavitation, air lock/loss of prime, suction restriction, low flow, mechanical-seal leakage and bearing degradation). The current machine-readable pilot file is CP-004 low-flow only; it remains `candidate` with `licenseStatus: reference_only`.
- The casebook/knowledge adapters preserve unresolved hypotheses and distinguish direct measurements, PLC/historian values and estimates. The current next-evidence ordering is a safe-observation coverage heuristic, not expected information gain.
- The live diagnostic session remains a separate curated-flow path. Do not infer that the candidate casebook has become the production diagnostic source merely because its JavaScript modules are present in the branch or deployment asset list.

### Knowledge and provenance audit

- `faults.json`: 284 unique records, no duplicate IDs within this file. 152 records have no `sourceRefs` and no explicit `evidenceStatus`; treat them as unprovenanced general candidates until reviewed. The remaining records include 72 general-guidance records and 60 model-specific-manual-reviewed records.
- `knowledge/faults-supplement.json`: 3 supplemental general cases; these do not replace claim-level source review.
- `knowledge/oem-verified-faults.json`: 99 records labelled `verified-source-exact-scope`. This is source-claim review, not field validation or confirmation on a specific installed asset.
- `knowledge/sources.json`: 2 candidate source entries and 0 approved entries in the inspected snapshot. `knowledge/open-knowledge-source-register.json` is a discovery register, not an import allowlist.
- The exact-source, exact-model, document revision and page/section gate remains mandatory. Never promote a telemetry label, anomaly label, general article or unreviewed OCR excerpt to a confirmed root cause or OEM-verified instruction.

### Validation status and limits

- The latest branch commit records a claim that GitHub Actions passed 364/364 diagnostic tests plus broader unit/integration, static, UI and read-only live smoke checks on commit `1f397185d35cad19dbebc7c0a64b85cf044ff4a5`. This audit did not independently retrieve the corresponding Actions run details.
- The branch head has successful Vercel status checks; this is not evidence of a Cloudflare production deployment. The latest `main` commit has Vercel status failures reporting a build-rate-limit URL.
- No local test suite, Android-device acceptance, technician field validation, new rights adjudication, runtime promotion, merge or production deployment was performed in this audit.

### Updated priority order

1. **P0 — provenance repair:** classify the 152 unprovenanced base records as `unreviewed` or attach exact claim-level sources; do not let missing provenance inherit an OEM-supported label.
2. **P0 — pump pilot evidence:** keep CP-001 through CP-006 as separate cases; add machine-readable records only after source and technical review. CP-004 is the only structured pilot record currently confirmed in this branch review.
3. **P1 — test integrity:** add fixtures for missing, contradictory, noisy, stale, mismatched-unit and failed-sensor data; preserve measured / PLC / historian / estimated source types and uncertainty.
4. **P1 — test selection:** replace missing-field-count ordering with a measured, transparent discrimination score; implement expected information gain only after defensible likelihoods and outcome data exist, constrained by safety, time and cost.
5. **P1 — importer rights evidence:** add explicit code/data license evidence URLs, original dataset origin, file-level review scope, attribution text, reviewer/date and redistribution/commercial-use flags. The staging form must remain non-authoritative.
6. **P2 — Android/offline acceptance:** test IndexedDB quota/unavailability, corrupt/oversized imports, cache upgrades, local document retrieval, offline restart and data export on target Android devices.
7. **P2 — post-pilot expansion:** only after the pump pilot meets its Definition of Done, extend the same evidence contract to motors, bearings, compressors, hydraulics and pneumatics.

**Definition of Done for every pilot case:** exact applicability; component/failure mechanism; competing hypotheses; supporting and contradicting evidence; measurement units, locations, operating state and provenance; safe discriminating tests and prerequisites; expected outcomes; interpretation limits; stop conditions; post-repair verification; claim-level source and rights record; and regression fixtures. No uncalibrated heuristic score may be displayed as a probability.


## 2026-11-24 audit update

This snapshot is based on the current GitHub branch and selected file contents, not on the prior report's unverified claims. No application code, fault records, runtime knowledge, Worker configuration or deployment target was changed in this audit.

### Repository and release state

- Repository: `belaggouneseifeddine/ai-maintenance-toolkit`.
- Audit branch: `feat/knowledge-importer-diagnostic-engine-2026-11-22`, head before this documentation update `f5d7842dbe594456d525fd34b01417b632fc9bfa`.
- Production `main`: `28bd2ecea8282e8f6d7bb915d83e8509d198b06e`; comparison was 18 commits ahead and 0 behind.
- GitHub reports both `main` and the audit branch as unprotected. The repository has no declared top-level license and no root `package.json`.
- There were 18 open pull requests; this audit branch was not attached to an open PR. Several drafts overlap local assistant, pump pilot and evidence-reasoning work.
- GitHub Pages deploys automatically on every push to `main`. Cloudflare Pages and Worker deploy workflows are manual-only. No deployment was run. Automatic Pages deployment conflicts with the project's no-unapproved-production-deploy rule unless main is protected and the workflow policy is changed separately.

### CI evidence

On 2026-11-23, commit `f5d7842dbe594456d525fd34b01417b632fc9bfa` had two successful GitHub Actions runs:

- `Maintenance Toolkit tests`: `node --test tests/*.test.cjs` and `node --test tests/*.test.mjs` — success.
- `Maintenance Toolkit Quality Checks`: `node scripts/quality-check.mjs`, Playwright installation/UI smoke checks, and `node scripts/smoke-test-live.mjs` — success.

Important limits found by inspecting the workflow and scripts:

- The live smoke script checks the published GitHub Pages HTML plus `agent-ui.js` and `diagnostic-chat.js`; it does not call the Worker API. The workflow step label overstates its Worker coverage.
- `scripts/smoke-test-worker.mjs` exists but is run by the manual Worker deployment workflow, not by the two branch CI runs above.
- `validate-knowledge.yml` does not list this `feat/**` branch in its push triggers. Its pull-request trigger would apply only after a PR is opened; this branch currently has no PR. The source-registry/Python knowledge audit was therefore not demonstrated by the latest branch CI.
- The test workflow uses Node 24 while the quality workflow uses Node 22. Playwright is installed with an unpinned `npm install --no-save playwright`; there is no root package manifest/lockfile to pin it.
- No Android-device acceptance, field pilot or local rerun was performed in this audit.

### Knowledge and pump-pilot state

- `knowledge/sources.json` still has two candidate sources and zero approved sources.
- `knowledge/open-knowledge-source-register.json` had 25 records before this update. Seven newly inspected repositories are added as discovery/benchmark/reference-only entries; none is runtime-eligible.
- `knowledge/faults-supplement.json` has three general-reference records. `knowledge/manufacturer-machine-fault-matrix.json` has 28 manufacturer profiles and 38 templates.
- `knowledge/oem-verified-faults.json` contains 99 records marked `verified-source-exact-scope`, with page and firmware scope present in the inspected records. This is source-claim review, not field validation on installed assets.
- The 1,128,130-byte `faults.json` blob returned empty content through the available GitHub file reader in this pass. Its historical 284-record count and the 152-record provenance gap remain the latest documented snapshot, not a fresh recount. `KNOWLEDGE-AUDIT-REPORT.md` still reflects that older snapshot and should be regenerated by the knowledge-audit workflow/tool before its counts are treated as current.
- The pump casebook describes CP-001 through CP-006, but only CP-004 Low Flow exists as a machine-readable diagnostic case. CP-004 remains `candidate` with `licenseStatus: reference_only`; its five references include restricted/reference-only sources. No exact-model OEM pump curve or field validation was found.
- `index.html` loads the casebook and knowledge-engine scripts, but the inspected session, chat and local-orchestrator paths do not call `MaintenanceDiagnosticCasebook` or `MaintenanceDiagnosticKnowledgeEngine`. Loading a script is not integration; the pilot remains outside the primary diagnosis path.
- `diagnostic-knowledge-engine.js` selects a next observation using a safe-coverage heuristic. It does not call the Bayesian EIG helper.
- The EIG helper exists in `bayesian-engine.js` and is exposed through `rankNextDiagnosticTests`, but `assistant-local-tools.js` falls back to `root.MaintenanceEvidenceSourceResolver`; no resolver implementation was found in the repository search. The unit tests inject `() => true`, so they test the mathematical ranking path, not real source-registry verification. Without an injected resolver, tests are rejected as `source_verification_unavailable`.
- The qualitative Bayesian scorer still uses fixed prior/likelihood-ratio heuristics and explicitly marks itself uncalibrated. No calibrated probabilities should be displayed.

### Safety, security and performance findings

- The Worker safety gate is lexical and currently handles interlock/protection bypass and hydraulic/high-pressure leak patterns. It is not a comprehensive hazard classifier.
- Its negation handling is global across the concatenated message: one occurrence of a phrase such as “do not bypass” suppresses the bypass trigger even if another sentence in the same request asks how to bypass protection. No mixed-negation regression test was found. This is a high-priority false-negative risk.
- The root repository has no top-level license declaration. The branch is unprotected, main is unprotected, and GitHub Pages auto-deploys from main.
- Large application modules remain: `diagnostic-chat.js` about 68 KB, `diagnostic-session.js` about 49 KB, `diagnostic-engine.js` about 46 KB, `worker.js` about 68 KB, `faults.json` about 1.13 MB and `oem-verified-faults.json` about 371 KB. The service worker is at cache v76; `faults.json` is in the required core cache, while the CP-004 case is optional. This preserves offline fault access but makes core install dependent on a large data file.
- `diagnostic-casebook.js` implements a hand-written partial validator rather than executing the JSON Schema. Its validation contract and `diagnostic-knowledge-engine.js` measurement normalizer should be kept in parity; the older triage helper coerces numeric strings while the newer normalizer requires finite JavaScript numbers.

### New upstream candidates added to the register

1. SCADA-MV-IDS — OT cybersecurity telemetry only; README claims CC BY 4.0 but no LICENSE file was found and the publisher license remains unverified.
2. ICS Telemetry Dataset — repository LICENSE is CC0-1.0, but the current tree contains only README and LICENSE; no telemetry files are present.
3. PIVOT — research reproduction code under a custom Academic Reproducibility License (All Rights Reserved); HAI/SWaT/WADI data are not redistributed.
4. Pump Maintenance — no repository code license; external Kaggle data rights unresolved; labels classify RECOVERING/BROKEN state rather than root cause; backfill creates potential look-ahead bias.
5. Awesome Bearing Datasets — MIT covers the catalogue repository, not the linked datasets; each source needs its own license and leakage review.
6. FSBrick — MIT repository license, but the large derived TTL and three spreadsheets were not parsed; spreadsheet and upstream Brick rights require file-level review.
7. Hydraulic Condition Monitoring — code repository has no declared license; underlying UCI dataset 447 is CC BY 4.0; random cycle split may not control dependence between nearby cycles.

No code or dataset content from these projects was copied. The seven records are metadata-only and set `runtimeImport: false`.

### Competitor scan

- [Mantenix](https://www.mantenix.com/) publicly claims ISO 14224 failure taxonomy, offline PWA field work, QR asset history, permits/LOTO, preventive work orders, inventory agents and AI suggestions with human approval. These are vendor claims, not independently trial-tested.
- [Fiix free CMMS](https://fiixsoftware.com/free-cmms/) advertises work orders, asset hierarchy, QR/barcodes, offline mobile updates and up to 25 preventive-maintenance tasks on its free tier.
- [UpKeep](https://upkeep.com/product/cmms-software/) advertises work orders, PM, asset/parts management and Nova AI; its pricing page shows offline mode in the Professional tier, so the headline offline claim should not be assumed to apply to every plan.
- [MaintainX](https://www.getmaintainx.com/use-cases/work-order-management-app) advertises mobile work orders, preventive tasks, QR/barcode, photos and offline updates.

The competitive gap is not a lack of diagnostic content alone: these products emphasize asset history, work orders, PM, parts, inspections, signatures and team synchronization. The Toolkit should remain diagnosis-first, but should eventually export a structured work-order-ready diagnostic record rather than attempt a full CMMS immediately.

### Updated priority order

1. **P0 — release governance:** protect `main`, require PR checks/review, and reconcile automatic GitHub Pages deployment with the explicit-approval rule.
2. **P0 — safety false-negative:** change negation handling to sentence/intent-aware logic and add mixed-negation, multilingual and adversarial tests.
3. **P0 — connect the pump pilot:** wire the casebook into the actual local diagnostic path; implement a real claim/source resolver before exposing EIG.
4. **P1 — knowledge audit:** regenerate the deterministic audit report and re-count `faults.json`; classify unprovenanced records without inventing sources.
5. **P1 — schema parity:** validate diagnostic cases against the JSON Schema, reject unknown fields, verify source IDs/URLs/license evidence and add cross-file duplicate/conflict tests.
6. **P1 — CI integrity:** run knowledge validation on the active feature branch; pin Playwright/Node versions; make the live smoke label match what it actually tests and add a separate read-only Worker smoke step.
7. **P2 — Android/offline:** measure cold install, cache recovery, IndexedDB quota behavior, import size limits and session restoration on the target Android device.

No fault record was promoted, no OEM claim was created, no candidate data was imported into runtime, no PR was opened, and no merge or production deployment was performed.


### CI correction after the source-register update

- The first CI run on commit `eb51e8ac32d127c05559cf8a2efb06d1db263e71` reported 364 passing tests and one failing new source-register test. The failure was a test-fixture scope error (`register is not defined`), not a failed source-license assertion or runtime behavior.
- The first CI attempt on `eb51e8ac32d127c05559cf8a2efb06d1db263e71` failed because the new test referenced a register variable outside its scope. That was corrected in `a746dd05887415408837e0b035c669fbbadc3481`. The next CI attempt on `7e804db1e502746239776b23afa0c0e40c70e096` then exposed a second test-only assertion mismatch: the expected license wording did not match the stored wording. The second assertion also contained an over-escaped dot in its regular expression; it is now changed to match the exact recorded license wording. Final verification on commit `c64c89a4f26d62290eb5fa40d9586aaef46bf00e` succeeded: 365/365 CommonJS tests, 13/13 ESM tests, 62/62 static quality checks, UI smoke checks and the published GitHub Pages smoke test (`PAGES_OK HTTP 200`). The Worker API was not exercised by that live smoke script, and the knowledge-validation workflow was not triggered on this branch.


## Daily audit — 2026-11-25 (HVAC, hydraulic and rotating-equipment rotation)

### Repository state at audit start

- Branch: `feat/knowledge-importer-diagnostic-engine-2026-11-22`; head `33b9952c30ab0ea7c619ae9b2fbb6b91f9683374`; 25 commits ahead of `main`, 0 behind.
- `main` head: `28bd2ecea8282e8f6d7bb915d83e8509d198b06e`. GitHub reports `protected:false` for both `main` and the feature branch. The branch-protection details endpoint returned 403, so repository rulesets were not independently inspected.
- 18 open pull requests; this feature branch has no associated PR.
- No code commit had landed after the 2026-11-24 audit before this documentation refresh. This update changes only the source register, its tests and this roadmap; no runtime fault data or engine code is changed.

### CI evidence and limits

- GitHub Actions run `45466179732` on the audited head `33b9952c30ab0ea7c619ae9b2fbb6b91f9683374`: CommonJS suite 365/365 passed.
- Run `45466179834` on the same head: ESM suite 13/13, static checks 62/62 and Playwright UI smoke passed.
- The live smoke script used by the quality workflow checks GitHub Pages and prints `PAGES_OK`; despite the workflow step label, it does not call the Worker API. The separate Worker smoke script is part of a manual deployment workflow and was not run.
- The knowledge-validation workflow does not include this feature branch in its push trigger; no knowledge-validation run is claimed.
- No Android-device test, live Worker health check or raw external dataset benchmark was run in this audit.
- GitHub Pages deploys on pushes to `main`; Cloudflare Pages/Worker workflows are manual and main-gated. No merge or deployment occurred.

### Safety and security findings

- `worker/safety-gate.mjs` concatenates machine, symptom, code and observations, then treats the presence of any phrase such as `do not bypass` anywhere in that combined text as a global negation. This suppresses the bypass trigger even if a later clause requests bridging/jumpering the same interlock. This is a static code-path finding; the current tests cover a direct bypass request but not mixed-negation/adversarial clauses.
- The Worker does run this deterministic gate before retrieval and provider calls; the existing test verifies that direct bypass requests stop both. The current gate is limited to protective-device bypass and hydraulic/high-pressure leaks; it does not comprehensively cover live electrical work, rotating guards, steam/hot surfaces, chemicals or confined spaces.
- `main` is not marked protected by GitHub branch metadata. GitHub Pages' main-branch deployment trigger remains a governance risk.

### Knowledge and diagnostic engine state

- `faults.json`: 284 records in the current branch snapshot; 17 records have `equipmentType=pump`, and none of those 17 has a top-level source/provenance reference.
- `knowledge/faults-supplement.json`: 3 records. `knowledge/sources.json`: 2 candidate sources, 0 approved. `knowledge/oem-verified-faults.json`: 99 records and no pump record. `manufacturer-machine-fault-matrix.json`: 28 manufacturer profiles and 38 case templates.
- `INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md` is a broad narrative reference with explicit general-vs-OEM scope warnings; `ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md` has five general case groups and model-specific reference links. Neither replaces claim-level structured provenance for pump cases.
- The pump casebook describes CP-001 through CP-006, but only CP-004 currently has a machine-readable JSON case. CP-004 remains `candidate` with `licenseStatus=reference_only`; its five sources include two CC BY research papers that do not establish low-flow root causes, a KSB MDX family-specific manual reference, and KSB/ASHRAE operating-point references. No exact pump model/curve or field validation is available.
- The casebook validator is hand-written and does not execute the full JSON Schema. CP-004 triage is candidate-only and selects the next observation by missing-measurement coverage, not expected information gain.
- `diagnostic-knowledge-engine.js` and `diagnostic-casebook.js` are loaded by the page but are not called by the primary assistant/session/orchestrator path inspected. The primary local tools still use the separate diagnostic engine.
- The Bayesian helper uses fixed prior/likelihood-ratio constants and explicitly marks outputs uncalibrated. It does not define a DAG with learned/validated CPDs. Expected-information-gain requires an injected `resolveLikelihoodSource`/global resolver; no default resolver implementation exists in the current branch tree. The pump Pilot path uses `safe_observation_coverage_heuristic_not_information_gain`, not EIG.

### Open-source inventory refresh

The source register now contains 35 entries. Three newly reviewed repositories were added; no code or dataset was copied:

- [CAMBER](https://github.com/yroussev/camber), package version 0.112.0, Apache-2.0 code. Its 24-entry dataset catalogue records publishers, per-dataset licenses, SHA-256 hashes, file sizes, transformations and known data issues. Its research-only license gate requires explicit acknowledgement and an append-only ledger. The reviewed LBNL SDAHU entry is simulated; no raw dataset was downloaded. Decision: isolated benchmark only.
- [Hydronic Delta-T Diagnostics](https://github.com/VB-Builds/hydronic-deltat-diagnostics), version 0.1.0, MIT code; LBNL FCU and Open-Meteo data retain separate terms. Most examples are synthetic, the first 28 active days are assumed healthy, and thresholds are project-specific. Decision: isolated benchmark only.
- [Operating-State-Aware Monitoring](https://github.com/RocketWill/operating-state-aware-monitoring), no declared code license; UCI hydraulic data are CC BY 4.0. It documents grouped splits over 144 contiguous condition blocks, but those blocks are not established independent physical runs. Decision: reference only; do not copy code.

Previously registered sources were refreshed: Awesome Industrial Datasets now reports 398 entries under CC BY-NC-4.0; BearingDatasets reports 69 datasets and its CWRU/Paderborn manifests have different rights; MIMII's dataset is CC BY-SA-4.0 while its baseline code is unlicensed; PlantCraft's canonical owner/repository is `jonathanwvd/PlantCraft` and latest release is v0.6.1; AAS is at v3.2.0; pgmpy is v1.1.2; NASA ProgPy is v1.9.0 with NASA-1.3 identified but license PDFs still pending text review. UCI #447 is CC BY 4.0 and LBNL FDD is CC BY 4.0 according to OEDI/Data.gov metadata; raw files were not downloaded.

### Competitor scan — vendor claims, not independent validation

- [InduQT](https://induqt.ai/demo) is the closest workflow comparison: public OPC UA/MQTT/CSV feeds, historian exports, manuals/photos, live replay and root-cause investigations. Its own 27-Oct-2026 test report says the decision engine caught 3/4 seeded LBNL boiler faults; AI first-choice was 2/4 and top-two 3/4, missing a slow fouling case. The vendor explicitly says the windows were used to improve the engine, so this is a demonstration, not an independent benchmark.
- [Samotics SAM4](https://samotics.com/sam4) combines cabinet current/voltage, electrical-signature analysis, automated detection and reliability-engineer review. Its published fleet figures are vendor-reported (95.5% recall and 2.1% post-review false-alert rate over its stated 12-month window); they are not independently verified here. “Sensorless” means no sensor mounted on the pump, not no measurement hardware.
- [Mantenix](https://www.mantenix.com/) advertises ISO 14224 failure coding, offline PWA, asset QR, work orders, PM, inventory, LOTO/JSA/permits and human approval of AI suggestions.
- [Fiix](https://fiixsoftware.com/cmms/pricing/) lists a free plan with 25 active PMs, work orders and asset/inventory features; its mobile documentation separately advertises offline capture/sync, but plan-specific offline entitlement is not explicit in the pricing table.
- [UpKeep](https://upkeep.com/) combines Nova AI, CMMS, safety, IIoT and work orders; its pricing page places mobile offline mode in Professional, not the entry plans.
- [Siemens Senseye](https://www.siemens.com/en-us/products/industrial-digitalization-services/senseye-predictive-maintenance/) and [Augury](https://www.augury.com/machine-health/) emphasize continuous condition monitoring, AI diagnostics and enterprise integrations; performance and ROI claims remain vendor claims.

### Roadmap changes

1. **P0 — Safety:** fix sentence-scoped negation and add mixed-negation, Arabic/French/English and prompt-injection tests; expand the deterministic hazard taxonomy before exposing repair actions.
2. **P0 — Pump Pilot:** finish CP-001–CP-006 as separate structured cases, but keep them quarantined until model scope, claim-level source rights, technical review, safe preconditions and tests pass. Do not use CP-004 as a live root-cause rule yet.
3. **P1 — Provenance/Importer:** implement CAMBER-style per-dataset manifests (publisher, exact license, DOI, version, SHA-256, source files, transformations, known issues, attribution, redistribution status) and an explicit acknowledgement ledger for restricted datasets.
4. **P1 — Reasoning:** add a real source resolver; enforce JSON Schema at import and runtime boundaries; keep heuristic scores distinct from calibrated probabilities; make EIG depend on validated likelihoods and explicit test cost/safety.
5. **P2 — Product:** measure Android offline behavior, add a minimal AAS-inspired asset/component passport and diagnostic-to-work-order export; defer multi-user sync and OPC UA/MQTT connectors until the local diagnostic path is proven.

No OEM-verified records were created. No runtime candidate data was added. No code/data from external repositories was copied. No merge, production deployment or paid service was used.


### Post-refresh validation — 2026-11-25

- Final source-register/test head before this note: `463b78d1fa95a47e0d351e175302933ee9165bf1`.
- GitHub Actions run `45684692864`: CommonJS suite 366/366 passed.
- Run `45684692939`: ESM suite 13/13 passed.
- Run `45684692909`: static checks 62/62, Playwright UI smoke passed, and GitHub Pages smoke returned HTTP 200.
- The new source-register test failed on three intermediate commits: first a license-wording assertion, then an over-escaped regex syntax error, then a grouped-split wording mismatch. All three were corrected; the final test run above is green.
- The quality workflow's `smoke-test-live.mjs` verifies GitHub Pages only. No live Worker API health check or Android-device test is claimed.
- These changes are documentation and test metadata only. No runtime knowledge, Worker logic, Production deployment or merge was changed.


### Supplemental OT/AAS/OPC UA audit — 2026-11-25

**Repository state**
- Active audit branch: `feat/knowledge-importer-diagnostic-engine-2026-11-22`; pre-update head `93adf54175cc52967394f2b61e12ac6916fff578`, six commits ahead of `main` and zero behind.
- `main` remains at `28bd2ecea8282e8f6d7bb915d83e8509d198b06e` (2026-11-18). The GitHub Pages deployment workflow is restricted to `main` and manual dispatch.
- GitHub Actions source-register/diagnostic/quality runs 45684692864, 45684692939 and 45684692909 passed on `463b78d1`; the branch head subsequently advanced by two documentation-only commits. Vercel status checks on `93adf541` are green. Branch-protection API returned 403 to the integration, so protection settings were not re-verified.
- `faults.json` could not be read by the GitHub file connector (0-byte content response); its current record count and provenance distribution are therefore not re-asserted. Other current files were parsed: faults-supplement 3 records; sources.json 2 primary sources, 3 reference-only documents and 2 reference-only books; OEM evidence register 99 records; manufacturer matrix 28 profiles and 38 templates.

**Source-register refresh**
- Refreshed Open-FDD from the stale 2026-11-17 metadata to GitHub release v5.0.21 (published 2026-11-20), repository push 2026-11-25, Python package metadata 4.5.11. The repo LICENSE is MIT while GitHub API license metadata says NOASSERTION. Its LBNL-derived two-day AHU fixture explicitly identifies CC BY 4.0, attribution and transformations. No blanket license is claimed for other data.
- Added Faaster (open-aas/faaster): code Apache-2.0; AAS example JSON and bundled OPC UA specification PDF have no separate rights confirmation. Python >=3.12; known gaps include MongoDB NotImplementedError, unused AMQP URL and legacy tests that do not run. Security docs say NoSecurity is exposed unless PKI is configured. Decision: reference-only.
- Added open62541: core MPL-2.0, with file-specific example licenses (the reviewed client.c header is CC0-1.0); release v1.5.10. CMake contains Android platform 24, but no Toolkit NDK build was performed. Decision: protocol-stack reference only; no runtime import.
- No data, source code or standard text was copied. No OEM-verified records or diagnostic cases were added.

**Diagnostic and safety review**
- `diagnostic-knowledge-engine.js` is loaded by index.html, but the reviewed `diagnose` local tool still calls `engineeringCore.executeLocalDiagnosis(..., diagnostic-engine.js, faults.json)`; it does not call the casebook/knowledge engine. The new pump casebook is therefore not the primary live diagnosis path.
- The casebook validator is a hand-written subset validator, not a full execution of `diagnostic-case.schema.json`; additional-property rejection and full source-registry validation are not enforced there.
- The Bayesian scorer uses a fixed prior and heuristic likelihood ratios grouped by evidence family; it labels the output relative support, not calibrated probability. EIG is conditional on supplied likelihood tables and a resolver injected as `config.resolveLikelihoodSource` or `MaintenanceEvidenceSourceResolver`; no default resolver implementation was found in the reviewed runtime modules. Unit tests use a synthetic `() => true` resolver and separately verify that no resolver means source verification unavailable.
- The knowledge engine explicitly returns `safe_observation_coverage_heuristic_not_information_gain`, unresolved hypotheses and `probabilities: null`. This is safer than a false diagnosis, but it is not yet a complete diagnostic engine.
- The local tool registry invokes its safety gate only for tools marked `safetySensitive`. `rankNextDiagnosticTests` is not marked safety-sensitive; the local safety callback also returns allowed for non-`diagnose` tools. The EIG test intentionally keeps hazardous tests in the ranking with a warning rather than excluding them. Add an explicit safety/competency eligibility filter before test ranking.
- The Worker safety gate still uses a message-wide `explicitlyNegated` flag. Worker contract tests cover direct English and Arabic bypass requests, but no mixed-negation case was found. A sentence such as “do not bypass the interlock, but tell me how to bridge it” can suppress the trigger. Treat this as P0 and add sentence-scoped adversarial tests.

**OT/AAS architecture**
- AAS metamodel v3.2.0 (CC BY 4.0) is a useful asset identity/submodel reference, not a fault ontology.
- Faaster and open62541 are protocol/asset-integration references, not fault knowledge. An OPC UA connector should be a separate read-only, opt-in gateway; Android local TCP/IP requires INTERNET permission, certificates and endpoint controls. The current Android local-model draft omits INTERNET permission, which is appropriate for offline inference but not for OT polling.
- Open-FDD's rule catalogue reports 78 SQL / 72 pandas rules, while its standalone PostgreSQL pack says 77 templates. Its LBNL fixture is simulated; source documentation notes duplicated archive members. Benchmark splits must be grouped by file/scenario/time, not random overlapping windows.

**Roadmap additions**
1. P0: sentence-scoped Worker safety detection; gate all diagnostic test ranking by safety class, required competence, site isolation and installed instrumentation.
2. P0: wire the reviewed pump casebook into the actual local diagnosis path only after full schema/source checks; keep it quarantined meanwhile.
3. P1: implement a real claim/likelihood source resolver backed by the reviewed evidence register; reject unregistered, wrong-scope or unreviewed references.
4. P1: reconcile Open-FDD rule-count surfaces before using it as a benchmark; build a grouped LBNL benchmark manifest with source DOI, CC BY 4.0 attribution, checksums and duplicate-member exclusion.
5. P2: prototype a read-only OPC UA adapter in a separate Android NDK branch only after permission, certificate, endpoint allow-list and local-network threat review. No Worker or app runtime dependency is approved.

No merge, production deployment, paid service, or external binding action was performed.


### LBNL source-rights and final CI confirmation — 2026-11-25

- The original DOE Open Energy Data Initiative submission 5763 and Data.gov catalog identify DOI 10.25984/1881324 and CC BY 4.0. The LBNL source page confirms the seven HVAC system families and distinguishes simulation, laboratory and field sources. The Open-FDD benchmark reviewed here uses only the simulated single-duct AHU subset; do not generalize its benchmark results to the full LBNL collection.
- After commit `31883c20c2f2a012902d8d3ddcc7ec380a847ca4`, GitHub Actions run `45687447883` passed 367 CommonJS tests and 13 ESM tests (0 failures); `45687447797` passed the 367-test diagnostic suite; `45687447879` passed 62/62 static checks, Playwright UI smoke and GitHub Pages HTTP 200.
- The run results are for the audit branch only. No Worker health check, Android-device validation, merge or Production deployment was performed.
