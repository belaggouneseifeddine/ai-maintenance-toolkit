# Repository audit and local reasoning increment — 2026-10-24

## Baseline and scope

- Repository: `belaggouneseifeddine/ai-maintenance-toolkit`
- Baseline `main` HEAD before this work: `f6f6ef89b082ae781063688f7d315a1c9d42b97f` (verified by comparing `main` to that commit; identical).
- Work branch: `work/local-reasoning-source-audit-2026-10-24`, created from that `main` HEAD.
- This is a source/history/branch comparison and implementation audit. It is not a new phone-browser test, a live provider-generation test, or a field validation of maintenance advice.

## Project evolution visible in repository history and prior project reviews

The project evolved from a mobile-first static maintenance PWA and rule-based fault guidance toward a broader maintenance workspace. The currently audited `main` contains:
- Arabic/French/English UI and PWA offline shell.
- Local deterministic fault ranking, multilingual `faults.json`, structured follow-up flows, safety gates, and generic maintenance knowledge documents.
- Browser-local maintenance records, CSV and JSON export/import, and a human review queue for possible knowledge candidates.
- An optional Cloudflare Worker / Gemini route with explicit consent, server-side secret expectations, structured output validation, evidence retrieval, and safety checks.
- An isolated `engineering-core.js` routing/normalization module that README/audit documentation says is not yet wired into the production UI.
- Lexical retrieval in the Worker, not a local embedding/vector index. The offline diagnostic path does not call a model or network.

The project review dated 2026-10-21 explicitly recorded that on-device manual verification had not been performed at that time. The architecture audit dated 2026-10-24 records that prior CI checked deterministic behavior, health/safety paths, and Pages deployment but did not establish a successful provider-generated answer. Historical CI is not evidence of current phone behavior or field accuracy.

## Main HEAD and latest commit history

At audit start, `main` and commit `f6f6ef89b082ae781063688f7d315a1c9d42b97f` were identical. Recent commits visible in repository history include:
- `f6f6ef8` — wire diagnostic follow-ups and preserve Worker secrets.
- `5a681ae` — expand equipment diagnostic workflows.
- `fa7a4ac` — configure Gemini Worker secret deployment.
- `40e2e8d` — correct AI runtime and rate-limit status.
- `2a29b31` — add isolated engineering AI routing core.
- `48bb31f` — add architecture audit and phase-2 plan.
- `445726d` — UI polish and browser smoke tests.
- Earlier visible phases include knowledge-source validation, local knowledge review, answer cache/speech, equipment flows, and the diagnostic knowledge audit.

This list is a selected recent-history summary, not a claim that every commit in the repository's full lifetime was individually reviewed. The GitHub connector's commit search returned a limited recent page; the branch comparisons below were used to map active work.

## Open pull requests found

The repository-scoped open-PR search returned three open PRs:
- [#52 — safety-first AI Agent Core v1](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/pull/52). Adds an isolated dependency-injected orchestration core and tests. Its own description says it is not wired into the production UI/Worker runtime and does not verify a live Gemini response.
- [#53 — merge research skills into local diagnostic engine branch](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/pull/53). Adds four maintenance skill drafts, an inventory, and associated tests/changes. It targets `feature/local-diagnostic-engine`, not `main`.
- [#54 — local diagnostic evidence quality gates and coverage audit](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/pull/54). Adds evidence/coverage registers, a local reasoning prototype, manufacturer source metadata, documentation, and regression tests. It targets a development branch, not `main`; the PR itself says no merge/deployment is intended.

No PR was merged, retargeted, or closed as part of this work.

## Related branch comparison against the audited main HEAD

The branch search returned 61 branch names across two pages. These comparisons were performed against `main` at the baseline HEAD:

| Branch | Compare result | Interpretation |
|---|---:|---|
| `feature/local-diagnostic-engine` | 3 commits ahead, 0 behind | Small local diagnostic changes; overlaps with the research-skill PR. |
| `research/google-skills-adaptation` | 16 ahead, 0 behind | Skill inventory/drafts and diagnostic-engine/Worker-related work; useful design references, not automatically imported. |
| `feature/local-evidence-quality-gates` | 26 ahead, 0 behind | Contains the local-reasoning prototype, evidence/coverage registers, source metadata, and tests; reviewed as a candidate, not merged wholesale. |
| `feature/ai-agent-core-v1` | 7 ahead, 0 behind | Isolated agent core and tests; not needed for the selected local-only increment. |
| `feature/ai-agent-evidence-v1` | 14 ahead, 0 behind | Adds evidence-library work; separate from the chosen local module and not imported wholesale. |
| `feature/answer-aware-diagnosis` | diverged, 2 ahead / 215 behind | Stale/diverged line; do not merge without a dedicated reconciliation. |
| `fix/followup-registry-integration-2026-10-24` | diverged, 5 ahead / 1 behind | Worker/follow-up changes; separate review needed. |
| `fix/knowledge-source-fetch-2026-10-23` | diverged, 3 ahead / 16 behind | Source fetching and licensing-related work; not imported into the offline path. |
| `phase-2/bm25-ranking` | diverged, 5 ahead / 23 behind | Worker retrieval experiment; not required for local-only reasoning. |
| `phase-3/evidence-traceability` | diverged, 11 ahead / 22 behind | Worker provenance changes; useful reference, not merged. |
| `phase-4/knowledge-audit` | 18 behind | Historical phase branch; superseded by mainline work. |
| `phase-5/diagnostic-flows` | diverged, 6 ahead / 17 behind | Older structured-flow branch. |
| `phase-6/local-knowledge-review` | diverged, 13 ahead / 16 behind | Earlier local knowledge-review phase. |
| `phase-7/optional-answer-tools` | diverged, 14 ahead / 11 behind | Optional cache/speech branch; main already has related features. |
| `phase-8/opt-in-answer-cache` | diverged, 17 ahead / 10 behind | Alternate cache line; do not merge without reconciliation. |
| `audit/harden-answer-cache-safety` | diverged, 4 ahead / 9 behind | Cache-safety fixes on a divergent branch. |
| `chore/complete-validation-gates-2026-10-23` | diverged, 2 ahead / 13 behind | Validation workflow branch; compare before any future merge. |

The branch catalogue is larger than the active PR set. The comparisons above prioritize branches related to local reasoning, RAG/evidence, agent core, knowledge, and validation; they do not imply every one of the 61 branches was reviewed file-by-file.

## Technical findings that affect this implementation

1. The local rule engine already distinguishes advisory matches from confirmed faults, but it normally returns no result when the equipment/symptom pair has no exact local match. That is safe but can be unhelpful.
2. The Worker already has lexical retrieval/evidence-traceability logic, but it is an optional remote route and cannot satisfy the chosen offline-first constraint by itself.
3. The existing manufacturer-source candidate for Grundfos Hydro EN is specific to a firefighting system. The fault-finding headings are indexed, but the detailed cause/check table has not been verified. It must not be used as generic pump evidence.
4. The Ingersoll Rand page is a model-manual discovery portal, not a selected manual. The exact compressor model must be known before choosing an OEM document.
5. Existing generic knowledge documents contain safe inspection guidance and reference links, but their presence does not make every generic fault record OEM-verified.
6. Maintenance records remain device-local. A JSON backup/import path exists in the current app, so this increment documents it rather than introducing cloud sync.
7. The app is a PWA. Native Android packaging is not introduced in this branch.
8. Secrets and Worker deployment settings were not read or modified by this change.

## Implemented on this branch

- Extend the offline diagnostic engine with `analyse()`, which can return up to three localized hypotheses for selected common equipment/symptom pairs even when the exact rule library has no match.
- Add a compact in-code index of paraphrased excerpts from the repository's industrial knowledge base. It retrieves by equipment/symptom and matching observation terms, and returns the source title, URL, and scope status; it does not fetch the network or claim OEM verification.
- Every candidate remains `hypothesis_only`; output includes why it was suggested, matching input terms if any, missing/contrary evidence, and a safe next check. No probability percentages or invented OEM limits are generated.
- The browser UI renders the local reasoning panel after the existing diagnosis submission, using DOM text nodes rather than inserting user text as HTML.
- The UI suppresses hypotheses if the priority is urgent or the safety checklist is missing/incomplete.
- Add a source-discovery registry that records scope and verification/redistribution status without copying manual text.
- Add tests for exploratory fallback, equipment/symptom scope, hypothesis labels, and manufacturer-source gating.
- Update the service-worker cache version for the new source metadata.

## Verification boundary

- No secrets were read or included.
- No branch was merged; no deployment workflow was manually invoked.
- A lightweight JavaScript harness executed the seven local-reasoning test callbacks and twelve existing diagnostic-engine test callbacks against the branch files: **19/19 passed**. JavaScript syntax checks and JSON parsing also passed in that harness. This is not the native Node `node --test` runner and is not a GitHub Actions result.
- The latest commit status exposed only external Vercel build-rate-limit failures; Vercel was not used for deployment. No GitHub Actions run was available to verify the workflow on this branch. Native CI therefore remains **unverified**.
- The new UI path still requires manual testing on an Android browser and field review by qualified maintenance personnel.
- No fault cause is claimed as OEM-verified by this increment.


## Additional related-branch comparisons

Further comparisons against the same baseline `main` HEAD covered these branches because they touch diagnosis, safety, consent, knowledge acquisition, or validation:

| Branch | Compare result | Review implication |
|---|---:|---|
| `feature/structured-pump-diagnostic-flow` | diverged, 10 ahead / 213 behind | Older pump-flow work; not safe to merge wholesale into current main. |
| `feature/diagnostic-architecture-roadmap` | diverged, 2 ahead / 214 behind | Documentation-only roadmap line; consult for planning, not runtime behavior. |
| `feature/diagnostic-work-report-and-triage` | diverged, 7 ahead / 212 behind | Older report/triage work; substantial divergence. |
| `feature/agent-security-diagnostic-expansion` | diverged, 8 ahead / 211 behind | Older agent/safety design; do not import without reconciliation. |
| `feature/ai-data-consent` | diverged, 5 ahead / 217 behind | Consent UI changes are on an old divergent line; current main already has consent controls. |
| `fix/pmc-fulltext-xml-fetch` | diverged, 7 ahead / 16 behind | Knowledge-fetch work needs a dedicated license/data review before reuse. |
| `fix/pmc-fulltext-xml-fetch-reviewed` | diverged, 3 ahead / 15 behind | Reviewed fetch variant, still divergent from current main. |
| `fix/gemini-secret-deploy-phase1-2026-10-24` | diverged, 2 ahead / 3 behind | Worker secret workflow differs from current main; no secrets were read. |
| `test/knowledge-base-safety-coverage` | diverged, 1 ahead / 216 behind | Older static safety-coverage check. |
| `safety-gate/independent-2026-10-23` | diverged, 2 ahead / 25 behind | Worker safety-gate experiment, not imported into local reasoning. |
| `audit/worker-loto-and-knowledge-ci-2026-10-23` | diverged, 2 ahead / 13 behind | Validation workflow branch; separate review required. |
| `chore/quality-gates-2026-10` | diverged, 12 ahead / 226 behind | Older architecture/workflow line; not a safe base. |
| `docs/architecture-audit-phase2-2026-10-24` | diverged, 2 ahead / 6 behind | Recent architecture docs; reviewed conceptually, not merged. |
| `feat/equipment-workflows-phase2-2026-10-24` | diverged, 2 ahead / 2 behind | Small structured-flow changes; separate comparison needed before reuse. |

## Scope limitation on historical completeness

The GitHub connector exposed the current HEAD, the recent commit-search page, branch refs, PR file lists, and pairwise branch comparisons, but did not provide a complete paginated chronological commit list in this audit session. Therefore this report records the full current HEAD and the related-branch/PR comparisons performed, plus a recent-history summary; it does **not** falsely claim that every historical commit from the repository's first commit was individually inspected. A true commit-by-commit historical audit would require retrieving the full commit list and reviewing every commit/diff.


## Final merge and deployment status — 2026-10-24

- PR #55 merged the offline evidence-aware reasoning and local knowledge excerpt index into `main`.
- PR #52 merged the isolated deterministic agent orchestration core. It remains a library module and is not yet wired into every live UI workflow.
- PR #56 merged the evidence provenance register, explicit diagnostic-flow coverage map, and associated tests/docs.
- PR #57 merged the reviewed skill specifications, exact keyword-boundary matching, unreviewed-alias hints, non-probabilistic UI labels, and stricter Worker validation for `confirmed_cause`.
- PR #58 merged the Cloudflare Pages direct-upload workflow. PR #53 and PR #54 were closed as superseded after their useful changes were ported selectively; their old branches were not merged wholesale.
- The final deployment workflow run for commit `4fcbddffec4ea15a25700125e32c2ff9e3d19b5f` completed successfully: [Cloudflare Pages deploy and smoke test](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/runs/40066333828). It verified the production URL, diagnostic engine asset, and manufacturer-source registry.
- GitHub Pages deployment and quality checks also passed for that commit. The Cloudflare Worker deployment for the preceding code commit `933aa6c44ae379f1a9d93454d367aa0d0cd11421` completed successfully, including credential-presence checks; secret values were not accessed or logged.
- Primary frontend URL: https://maintenance-ai-toolkit.pages.dev/ . GitHub Pages remains as a fallback.
- The repo contains 60+ branches. Pairwise comparisons were performed for the current branch list. Old branches that diverge substantially were not merged automatically; compatible changes were ported selectively through PRs #55–#58.
- Historical completeness limit remains: the full chronological commit list from the repository's first commit was not available through the connector, so this is not a claim that every historical commit was individually reviewed.
