# Rebuild Implementation Status — 2026-11-21

**Working branch:** `refactor/unified-android-pwa-architecture-2026-11-21`  
**Base:** `main` at `28bd2ecea8282e8f6d7bb915d83e8509d198b06e`  
**Status:** In progress — session/diagnostic integration milestone implemented; not release-ready.

## Completed in this branch

1. Added the unified Android/PWA architecture baseline in `docs/UNIFIED-ANDROID-PWA-ARCHITECTURE-2026-11-21.md`.
2. Upgraded `assistant-session-contract.js` from schema `1.0.0` to `1.1.0`.
3. Added a shared diagnostic state for operating context, symptoms, measurements, evidence, hypotheses, tests, references, repair outcome, and revision.
4. Added migration from schema `1.0.0`. Conversation messages, facts, equipment context, tool events, and legacy hypotheses are preserved. Legacy hypotheses without reliable source metadata are explicitly marked `provenance: "unknown"`.
5. Added contract operations for diagnostic records, equipment updates, and operating-context updates. Revision changes are performed through the session contract.
6. Enforced provenance when adding and restoring diagnostic records. Invalid IDs, duplicate IDs, oversized records, and missing provenance are rejected.
7. Model-suggested hypotheses can be promoted only when the record carries review metadata with an allowed review method and a substantive note. The original model provenance remains visible.
8. Updated local chat restoration to migrate old sessions before validating them.
9. Connected the local diagnostic result path to the unified session state. It now records the user-reported symptom, measurements with source classification, observations, engine-inferred hypotheses, and retrieved-document references. Hypotheses remain proposed; retrieved references are labelled as retrieved, not verified.
10. Added focused contract and orchestrator tests for migration, provenance, review-gated promotion, equipment updates, revision tracking, and restored-session validation.
11. Added `docs/FRONTEND-DEPENDENCY-INVENTORY-2026-11-21.md`, recording the 34-script load order, five stylesheet cascade, confirmed dependency edges, service-worker relationship, and safe extraction sequence.
12. Bumped the PWA cache identifier from `v75` to `v76` for a future branch release.

## Verification status

- Branch comparison at the last review: 32 commits ahead of `main`, 0 behind. This is a commit count, not a count of completed rebuild features.
- GitHub Actions diagnostic regression run on commit `e8f5763615dd037d3d95fb9a35cd5d1a53dd85f1`: **361 tests passed, 0 failed**.
- A subsequent change added the explicit review-metadata requirement for promotion of model-suggested hypotheses. Its latest workflow was still pending when this report was updated; the 361-test result therefore does not yet certify that final guard change.
- Earlier workflow execution exposed a legacy-migration validation failure. The migration was corrected by assigning `unknown` provenance to legacy hypotheses; the later 361-test diagnostic run passed.
- No complete Android build, APK installation, WebView/device test, offline-device test, memory/thermal test, or visual regression test was performed.
- No PR was opened and no production release was approved.

## Remaining work

### Application and domain
- Extract a DOM-free diagnostic state projection/application service from `diagnostic-chat.js`.
- Connect diagnostic session answers and test outcomes to the same session state, not only the final local assessment.
- Add explicit hypothesis update/revision semantics rather than append-only duplicate hypotheses for repeated assessments.
- Integrate Rules + Bayesian updates + validated Expected Information Gain with clear separation between calibrated probabilities and relative scores.
- Complete repair-outcome capture and use prior repair cases as historical context, not as automatic proof.
- Complete local PDF retrieval and document/case indexing; preserve document/page provenance and verification status.

### Model and platform
- Implement the Qwen adapter behind a model-neutral local runtime interface; benchmark candidate 1.5B–2B models on the target Android device before choosing one.
- Keep deterministic diagnostic services authoritative; model output remains a proposal and tool-call request.
- Separate PWA storage/persistence adapters from Android native storage and the Kotlin/WebView bridge.
- Verify offline startup, model load/unload, cancellation, memory pressure, thermal behaviour, and Android lifecycle.
- Consolidate CSS only after visual baselines exist for Arabic RTL, French/English LTR, light/dark, and narrow mobile viewports.

### Quality
- Obtain a green run for the latest review-gated promotion change.
- Add integration tests for the chat-to-session projection and repeat-assessment behaviour.
- Run accessibility, browser, PWA offline, and real Android regression checks.
- Remove legacy code only after dependency, runtime, and test evidence confirms it is unused.

## Release and scope constraints

- No merge to `main`.
- No intentional production deployment or promotion.
- No production secrets/provider configuration changed.
- No source-tracking/evidence-register repair included.
- Legacy files were not deleted.
