# Maintenance AI Toolkit — AI Readiness Test Report

**Date:** 2026-10-27  
**Branch:** `feature/bayesian-diagnostic-engine-v1-main`  
**Functional test commit:** `b657d508e2d6340093e856dba22938fafb69f969`  
**Pull request:** [#97 — Draft, not merged](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/pull/97)

## Executive status

**Status: partially verified; not ready to claim live Gemini diagnosis is operationally validated.**

The published frontend and configured Cloudflare Worker pass the checks listed below. The deterministic evidence and safety gates work in live requests. Automated tests also exercise the Worker’s structured diagnosis contract with a mocked Gemini response. A live request that reaches Gemini, receives its real response, passes source-citation and schema validation, and renders correctly in the app has **not** been run in this verification cycle because provider quota/billing availability was not established.

## Confirmed results

At functional test commit `b657d508`:

- 142 Node unit/integration tests passed; 0 failed.
- Diagnostic engine regression workflow passed.
- Knowledge asset validation passed, including checks for equipment coverage, safety/stop-work guidance, and source traceability.
- Browser UI smoke test passed: Arabic RTL, French/English LTR, navigation, theme toggle and ARIA state, 320–1280 px viewport widths, no uncaught page errors.
- Published GitHub Pages returned HTTP 200.
- Configured Worker `/health` returned HTTP 200 and `ok: true`.
- CORS preflight passed for the published app origin.
- Invalid API payload was rejected before any provider call.
- Insufficient evidence returned clarification questions before retrieval/Gemini.
- Interlock-bypass and high-pressure-leak requests were blocked by deterministic safety gates without retrieval or Gemini calls.
- The Worker contract tests use a mocked provider response to exercise structured response validation, evidence/source IDs, required safety fields, and rejection of unverified confirmed causes.

## Bayesian engine limitations

The experimental Bayesian panel currently covers **pump + low flow** only. Its priors and conditional probabilities are provisional elicited assumptions, not learned from field records or calibrated against held-out cases. Cause values are marginal probabilities and may not sum to 100%. This feature remains experimental and must not be used for safety-critical decisions.

## Not yet verified

1. **Live Gemini end-to-end response:** no provider call was made in this cycle. The mock-provider contract test is not proof that the configured API key, quota, model access, provider response, and live response validation all work together.
2. **Operational diagnostic accuracy:** no held-out field-case evaluation or calibration analysis has established accuracy.
3. **Broad equipment coverage for Bayesian inference:** the Bayesian model is not a general-purpose industrial fault model.
4. **Production readiness:** not established by health checks or CI alone.

## Next safe steps

1. Confirm the Gemini account’s quota and billing/usage limits without exposing the API key.
2. If an acceptable free quota is available, run one deliberately bounded, non-hazardous test case through the published app and record HTTP status, provider/model metadata where safe, response structure, evidence excerpts, and citation validity. Do not print secrets or send multiple speculative retries.
3. If a live call is not safe to run, retain the mocked contract test and report the live-provider path as unverified.
4. Evaluate the Bayesian model using reviewed field cases and calibration metrics before promoting it beyond experimental status.

## Change control

This report and its test changes remain on the feature branch. **No merge to `main` and no deployment were performed.** The currently published app/Worker were only queried by smoke tests; they were not updated by this work.
