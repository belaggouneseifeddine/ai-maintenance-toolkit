# Branch integration audit — 2026-10-27

## Decision

Do not merge every branch wholesale. Branches are divergent, some are hundreds of commits behind `main`, and at least one knowledge branch reports a destructive-looking `faults.json` diff (15,276 deletions). The available GitHub connector could not retrieve that large file's content for a trustworthy record-level comparison. A bulk merge would therefore risk overwriting current diagnostic data.

## Confirmed already present on `main`

The following files were fetched directly from `main` and are already present; they do not need to be copied from old branches again:

- `knowledge/CHINESE-EUROPEAN-OEM-FAULT-MATRIX-AR-FR-EN.md`
- `knowledge/OEM-MANUFACTURER-INDEX-AR-FR-EN.md`
- `knowledge/open-knowledge-source-register.json`
- `tests/open-knowledge-source-register.test.cjs`
- `evidence-reasoning.js`
- `evidence-reasoning-ui.js`
- `agent-core.js`
- `engineering-core.js`

The OEM matrix itself explicitly distinguishes investigation templates from manufacturer-verified fault-code definitions. Keep that evidence boundary.

## Comparison findings

| Branch | Comparison against main | Safe disposition |
|---|---|---|
| `work/evidence-grounded-reasoning-2026-10-26` | 2 commits ahead, 4 behind; adds `evidence-reasoning.js` and its tests in its comparison base | Core module is already on main; compare latest test behavior before cherry-picking anything else |
| `work/integrate-evidence-reasoning-ui-2026-10-26` | 8 ahead, 3 behind; UI adapter, index, cache/workflow and quality-check changes | Main already contains `evidence-reasoning-ui.js`; do not copy stale UI/workflow changes wholesale |
| `work/local-reasoning-evidence-traceability-2026-10-26` | 6 ahead, 4 behind; adds `local-reasoning.js` and tests | Review implementation and API wiring against current engine before integration |
| `work/evidence-register-integration-2026-10-24` | 9 ahead, 25 behind; includes evidence registry and test files | Main already has evidence registry and evidence-reasoning modules; only integrate non-duplicate tests after compatibility checks |
| `feature/ai-agent-core-v1` | 7 ahead, 27 behind; agent core and tests | Main already has `agent-core.js`; do not replace it with an older divergent version |
| `feature/ai-agent-evidence-v1` | 14 ahead, 27 behind; agent/evidence library files and tests | Main has `agent-core.js`; assess `evidence-library.js` independently before merging |
| `feat/engineering-ai-core-v1` | 9 ahead, 33 behind; engineering core and tests | Main already has `engineering-core.js`; compare test coverage rather than replacing the module |
| `feature/v0.2-diagnostic-engine` | 0 ahead, 209 behind | No unique commits according to compare result; candidate for deletion after owner confirmation and branch protection review |
| `feature/v0.3-handover-pm-stats` | 12 ahead, 206 behind; decision trees, UI and stats files | High divergence; cherry-pick individual reviewed assets only |
| `feature/expand-oem-knowledge-base-2026-10-24` | 256 ahead, 16 behind; extensive OEM files plus a `faults.json` diff of +1/-15,276 | **Do not merge wholesale.** OEM structured records have 99 IDs on both sides in prior parsed comparison; 0 new IDs, 56 identical records and 43 differing records. Those 43 require field-level review. Large `faults.json` could not be retrieved by the connector, so deletion/replacement semantics remain unverified. |
| `feature/evidence-quality-gates-current-main-2026-10-26` | 1 ahead, 6 behind; substantial changes to engine/evidence sources and adds source register | High-risk replacement/deletion diff; keep separate until exact current-main comparison and CI validation |
| `work/selective-knowledge-source-register-2026-10-26` | 1 ahead, 5 behind; adds source register and tests | Both files already exist on main; likely duplicate work |
| `fix/evidence-claim-display-2026-10-26` | 4 ahead, 2 behind; UI/logic small changes and a new test | Main already has both evidence UI and reasoning modules; verify whether test or fixes are missing before cherry-picking |

## Evidence and safety rules

- A missing source citation is not proof that a claim is false, but it is not verified evidence either.
- Keep records marked as review-needed/source-not-recorded until the exact manual, revision, section/page and claim are traceable.
- Do not promote general manufacturer portal links into proof for a specific alarm meaning.
- Do not overwrite `faults.json`, `diagnostic-engine.js`, evidence registries, deployment workflows, or service-worker cache rules from a divergent branch without exact content comparison and passing tests.

## Remaining work / limitations

- The current connector exposes compare/fetch/create/update/PR/merge operations but no branch-deletion operation. This audit therefore does not claim branch deletion.
- Large `faults.json` retrieval returned empty content for both refs despite returning a blob SHA, so the record-level diff remains unresolved.
- This is a targeted comparison of high-impact branches, not a claim that every repository branch has been exhaustively reviewed.
- Next safe pass: inspect each remaining branch's unique files against current `main`, port only missing changes to a fresh branch, run the repository checks, and merge each passing PR separately.
