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

## 2026-11-05 verified status and roadmap correction

This section supersedes the 2026-11-03 status above. The older section is retained as history, not as the current state.

### Main branch and release status

- Current `main`: `63d219c4667f858515354f76d68b2ec46cb43c0a`.
- Merged: PR #122 (compressor adaptive flow and safety-gate ordering), PR #123 (deployment governance), PR #124 (separate low-flow from low-pressure), PR #128 (restore GitHub Pages auto-deploy on main), and PR #129 (align governance tests with Pages-only automation).
- GitHub Pages now deploys automatically on pushes to `main`; the 2026-11-05 Pages run #42072822648 succeeded, including the published-app/Worker smoke-test step. This is a deliberate exception to the older manual-only policy.
- Cloudflare Pages and the Worker remain `workflow_dispatch` only. Their latest confirmed successful production deployment remains commit `ec06e75c75d6242dd1349b14e9f03fc11912d73c` from 2026-11-04; this run made no production deployment.
- Main-branch diagnostic tests and quality checks passed on `63d219c`. No live generative-model request or physical Android acceptance is implied by those CI results.
- Vercel GitHub checks and preview comments are still being created automatically on PRs. This is an integration-policy conflict with the project's no-Vercel preference; no Vercel action was initiated by this audit.
- The GitHub rulesets endpoint returned an empty list. The direct branch-protection endpoint denied access to the integration, so active branch protection could not be re-verified in this run.

### Diagnostic engine: corrected implementation count

- The registry contains 11 equipment/symptom flows. Three are multi-step sessions with ranked hypotheses: pump low-flow, motor no-start, and compressor low-pressure. The other eight use the `registry_single_step` adapter and return one curated check without a ranked hypothesis set.
- The multi-step selector ranks unanswered questions by pairwise hypothesis separation and assumes equal outcome weighting. It is a useful heuristic, but it is **not** Bayesian expected information gain or entropy reduction.
- The Bayesian-style engine uses a fixed default prior of 0.2 and fixed support/contradiction likelihood ratios of 1.5 and 1/1.5. The engine explicitly marks itself uncalibrated. It has no field-failure calibration dataset or learned conditional probability tables; describe outputs as relative evidence support, not real-world failure probabilities.
- The offline client path uses the cached `faults.json` with deterministic matching and bounded keyword scoring. The optional Worker retrieval path uses BM25 lexical ranking (with a legacy lexical fallback), fetches 10 Markdown files from raw GitHub, and caches them for five minutes per Worker isolate. It is not local semantic/vector search and is unavailable when those upstream files cannot be fetched after the isolate cache expires.
- The Worker citation-support check is based on token overlap with retrieved passages. Retrieval and overlap do not establish semantic entailment; generated statements must remain hypotheses unless the source passage directly supports the claim.
- The exact-scope evidence gate remains a strong constraint: source applicability requires an explicit verified claim plus exact manufacturer and model scope. A URL alone is not proof.
- The next diagnostic priority is to expand true multi-step flows, improve test selection using reviewed outcome frequencies, and keep confidence labels explicitly uncalibrated until field validation exists.

### Knowledge inventory — latest committed audit snapshot

The generated inventory was refreshed in commit `e7934bc95075303ce4b476847425422f6ab93237` on 2026-11-05:

- 10 Worker-referenced Markdown documents; 3,862 lines and 55,772 whitespace-separated words.
- 284 structured fault records, 36 equipment labels, 767 cause entries, and alarm/error-code arrays in 31 records.
- 60 model/manual-scoped fault records are manually reviewed, not field-verified.
- 63 manufacturer/support discovery records and 29 OEM platform-index entries; 0 platform entries are model-verified.
- 99 structured OEM diagnostic records are claim-reviewed with exact source scope and page references; this is source-claim review, not field-performance validation.
- The separate license-tracked research source registry contains 2 candidate entries and 0 approved entries. Five reference-only portals are not allowlisted for automated fetching.

The digital-electronics reference index added on 2026-11-05 is a locator/index only. It does not republish the book's copyrighted chapter content.

### Community P4 status and isolated hardening work

- PR #117 remains Draft/open and is not merge-ready. Its branch is 10 commits behind and 74 commits ahead of current `main`; it modifies deployment workflows.
- Merging PR #117 unchanged would reintroduce push-to-main deployment triggers for Cloudflare Pages and the Worker, reversing the current manual-only production policy.
- A separate child branch, `fix/p4-atomic-storage-quotas-2026-11-05`, adds D1 reservation-based quota enforcement and migration 0004. Its P4 schema/API/PDF test workflow passed 35 tests on code commit `26729bf1ccc1b0c9f3da4f93e42dcbeed8c9a7d6`.
- The quota migration has **not** been applied to remote staging D1 and R2 has **not** been enabled. The branch is 10 commits behind and 81 ahead of `main`; it is an isolated implementation branch, not merge-ready. No PR was opened.
- Remaining P4 blockers: list/read/delete document APIs and UI, localStorage bearer-token exposure review, cross-contributor access tests, and reconciliation of R2 orphan objects after an abrupt Worker crash. The new reservation lease expires after 30 minutes; this limits stale quota holds but does not make R2 and D1 a distributed transaction.

### Competitive signals and product boundary

The 2026-11-05 competitor review is recorded in `docs/DAILY-AUDIT-2026-11-05.md`. CMMS products such as MaintainX, Limble, and Fiix document offline work-order caching/sync, work-order and PM workflows, assets, and parts capabilities. AI-focused products such as YAFEX, InduQT, and Diagster publicly describe manual/work-order ingestion, guided evidence-based troubleshooting, history feedback, live data/OPC connections, or read-only PLC analysis. These are vendor-published feature claims, not independent accuracy benchmarks.

Keep the Toolkit diagnostic-first. Its differentiator should be local-first troubleshooting, explicit uncertainty, model-scoped evidence, and a safety gate. Integrate with existing asset/work-order systems rather than attempting to recreate a full CMMS before the diagnostic engine is validated.

### Revised priority order

| Priority | Work | Exit condition |
|---|---|---|
| P0 | Release governance | Preserve manual-only Cloudflare Pages/Worker and live-AI workflows; verify main protection/review rules; remove or explicitly approve Vercel GitHub integration; document the Pages auto-deploy exception |
| P1 | Complete adaptive diagnosis | Convert the eight single-step adapters into reviewed multi-step flows; test contradictory/missing readings, equipment switching, language switching, and safety priority |
| P1 | Validate reasoning | Replace equal-outcome pairwise scoring with an evidence-weighted test-selection method; collect technician-reviewed outcomes; calibrate only after enough representative cases; never label current scores as calibrated probabilities |
| P1 | Knowledge provenance | Maintain exact model/firmware/manual/page scope; distinguish portal discovery, manual-claim review, and field validation; approve the source/licence registry before automated ingestion |
| P1 | P4 security and storage | Reconcile PR #117 with current `main`; apply migration 0004 only to isolated staging after review; verify R2 binding; add document listing/deletion and ownership/session/XSS tests before public writes |
| P2 | Local hybrid retrieval | Keep exact-code and BM25 retrieval; prototype a local embedding index without an Ollama runtime dependency; test multilingual synonym recall@k, model filters, provenance, and offline behavior before switching retrieval paths |
| P2 | Offline/mobile reliability | Persist guided-session state locally; make cache completeness observable; test offline startup and data recovery on Android; define sync/conflict handling before cloud sync |
| P2 | Asset and work-order workflow | Add a local equipment passport, QR/asset lookup, structured work-order export, PM checklist templates, and integration boundaries for existing CMMS platforms |
| P2 | Performance and UX | Measure real mobile first-load and memory use; lazy-load equipment knowledge; test Arabic/French/English and narrow-screen workflows on a physical Android device |
| P3 | Condition monitoring | Add read-only timestamped sensor/OPC ingestion only after asset identity, units, calibration, retention, and data-quality controls are defined |

### Non-negotiable release gates

- No merge, production deployment, remote migration, paid provider request, or public knowledge write without explicit approval.
- No model-specific limit, alarm interpretation, or repair instruction without exact applicable source evidence.
- Unknown and contradictory readings remain visible; absence of a reading is not a negative finding.
- The deterministic safety gate takes precedence over local ranking and cloud output.
- Automated CI, live provider checks, remote database migration, and physical Android/offline acceptance must be reported as separate evidence categories.
