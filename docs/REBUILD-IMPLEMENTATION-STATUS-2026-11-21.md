# Rebuild Implementation Status — 2026-11-21

**Working branch:** `refactor/unified-android-pwa-architecture-2026-11-21`  
**Base:** `main` at `28bd2ecea8282e8f6d7bb915d83e8509d198b06e`  
**Status:** In progress — session/diagnostic integration, guided-flow synchronization, and hypothesis-history milestone implemented; not release-ready.

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
10. Added stable-ID hypothesis upsert so repeated local assessments update one hypothesis and retain a bounded history of prior score/status/source instead of duplicating entries. Reviewed confirmations are not downgraded by later provisional updates.
11. Connected guided diagnostic answers, answer-derived evidence IDs, hypotheses, and recommended checks to the same session state; repeated answers and hypotheses are upserted rather than duplicated.
12. Added focused contract and orchestrator tests for migration, provenance, review-gated promotion, equipment updates, revision tracking, hypothesis upsert, and restored-session validation.
13. Added `docs/FRONTEND-DEPENDENCY-INVENTORY-2026-11-21.md`, recording the 34-script load order, five stylesheet cascade, confirmed dependency edges, service-worker relationship, and safe extraction sequence.
14. Bumped the PWA cache identifier from `v75` to `v76` for a future branch release.

## Verification status

- Branch comparison at this update: 43 commits ahead of `main`, 0 behind. This is a commit count, not a count of completed rebuild features.
- GitHub Actions on the current code plus documentation branch state: **364 diagnostic regression tests passed, 0 failed**, and the separate Node/provider suite completed **13 tests passed, 0 failed** (latest Node suite on commit `51b19e2939a0f30b978d2d777755e12ac1c2b934`).
- These runs include provenance validation, review-gated model-hypothesis promotion, hypothesis upsert/history, and guided-answer synchronization.
- An earlier workflow exposed a legacy-migration validation failure. The migration was corrected by assigning `unknown` provenance to legacy hypotheses; the subsequent suites passed.
- No complete Android build, APK installation, WebView/device test, offline-device test, memory/thermal test, or visual regression test was performed.
- Vercel status checks report a build-rate-limit failure for the connected Vercel project. This is a hosting/build quota limitation, not a passing preview build; no production deployment or promotion was initiated.
- No PR was opened and no production release was approved.

## Remaining work

### Application and domain
- Extract a DOM-free diagnostic state projection/application service from `diagnostic-chat.js`.
- Connect completed test outcomes and repair results to the unified session state; guided answers and recommendations are now synchronized.
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
- Keep both CI suites green as subsequent application modules are extracted and integrated.
- Add integration tests for the chat-to-session projection and repeat-assessment behaviour.
- Run accessibility, browser, PWA offline, and real Android regression checks.
- Remove legacy code only after dependency, runtime, and test evidence confirms it is unused.

## Release and scope constraints

- No merge to `main`.
- No intentional production deployment or promotion.
- No production secrets/provider configuration changed.
- No source-tracking/evidence-register repair included.
- Legacy files were not deleted.
