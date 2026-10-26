# Branch and Knowledge Base Cleanup Audit

**Audit date:** 2026-10-26  
**Baseline:** `main` at `3615e9e07907c0b48824c7b9e35bd9c66b4767a3`  
**Scope:** duplicate logic, diagnostic knowledge, OEM sources, and stale branches.

## Executive summary

Do not merge the old branches wholesale. The OEM expansion branch `feature/expand-oem-knowledge-base-2026-10-24` is 256 commits ahead and 15 behind the current baseline and changes `faults.json` by **+1 / -15,276 lines**. That is a destructive historical diff, not a safe update. The OEM records and supporting documentation already exist in `main`; the useful material must be compared by record ID and source metadata, not copied by branch merge.

## Current knowledge inventory

| Asset | Current observed inventory | Assessment |
|---|---:|---|
| `faults.json` | 284 fault records; 36 equipment types; no duplicate IDs found | Preserve as production rule-based library |
| `diagnostic-evidence-register.json` | 284 records: 60 `verified`, 53 `review-needed`, 171 `source-not-recorded` | Evidence coverage is incomplete; never promote unreviewed records automatically |
| `knowledge/oem-verified-faults.json` | 99 OEM records | Existing OEM knowledge; review per record and exact source scope |
| `knowledge/manufacturer-sources.json` | 63 sources | Existing source registry |
| `knowledge/open-knowledge-source-register.json` | Discovery-only source register | Discovery entries are leads, not verified evidence |

## Key findings

1. **No duplicate fault IDs were found** in the current `faults.json` inventory. A blanket deletion of diagnostic functions is therefore not justified by the present audit.
2. The repository already contains multilingual equipment workflows, local knowledge review, BM25-style retrieval/evidence traceability in the Worker, safety checks, and the new evidence-reasoning UI. Older branches that reintroduce `local-reasoning.js`, older diagnostic-engine implementations, or older Worker copies must not replace these current files.
3. The OEM expansion branch has useful documentation/data files, but its overall diff is unsafe to merge. Several OEM knowledge assets are already present in `main`. Review additions by stable record ID, manufacturer, product/model scope, manual revision, section/page, claim, and verification limitation.
4. The current evidence UI expects structured `scope.manufacturers` and `scope.models` arrays for exact applicability. Some reviewed records currently carry a human-readable string such as `scope: "MD200 series AC drive"`. Those records can show a claim and citation, but must remain **insufficient for exact installed-model applicability** until structured scope is reviewed and added. Do not infer manufacturer/model applicability from a URL or free text.
5. The app has 284 evidence-register entries but only 60 are marked verified; 224 entries are review-needed or lack a recorded source. This is the primary knowledge-quality backlog. It is safer to review and enrich records in batches than to bulk-mark them verified.
6. All pull requests returned by the current repository audit are closed; no open PRs were returned. Many stale branches remain in the remote branch list. Closed PRs do not imply the source branches were deleted.

## Safe cleanup decisions

- **Keep:** `diagnostic-engine.js`, `faults.json`, current `worker.js`, `diagnostic-evidence-register.json`, and current evidence-reasoning modules.
- **Do not merge wholesale:** `feature/expand-oem-knowledge-base-2026-10-24`, `feature/evidence-quality-gates-current-main-2026-10-26`, old local-reasoning branches, and older Worker/diagnostic-engine branches.
- **Selectively extract:** OEM reference material only after checking that its record ID is absent or its existing record is demonstrably less complete; preserve source URL, manual revision, section/page, model scope, reviewed claim, verification date, and limitations.
- **Delete stale remote branches only after confirming they are not the head of an open PR and are not the only location of unmerged unique work.** The GitHub connector available to this audit can search/read branches and compare commits but does not expose a branch-delete operation. Therefore no remote branches were deleted in this audit.

## Recommended next actions

1. Add structured manufacturer/model scope to the reviewed evidence records where the cited manual supports it; keep broader product-family claims clearly labelled as family-level.
2. Build a deterministic diff by stable ID between current OEM records and candidate branch records, and import only missing or materially improved records.
3. Review the 53 `review-needed` records first, then prioritize high-risk equipment and frequent failure modes among the 171 source-missing records. Do not auto-promote either group.
4. Run knowledge validation, diagnostic tests, quality checks, and both deployment workflows after each data batch.
5. After unique work is preserved or merged, remove stale remote branches using a GitHub operation with branch-deletion permission; record the deleted branch list in the cleanup log.

## Limitations

This is a repository-level audit based on the current `main` files and branch/PR metadata available during the run. It is not a claim that all OEM manuals were re-opened or independently re-verified during this audit. No production diagnosis rules or knowledge records were deleted as part of this report.
