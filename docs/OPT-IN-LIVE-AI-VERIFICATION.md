# Opt-in live AI verification

## Purpose

The normal live smoke test checks the published Pages UI, configured Worker health, CORS, invalid-input rejection, and deterministic safety gates. It deliberately does **not** call Gemini or another model.

The optional live-generation phase verifies the missing end-to-end boundary: a real provider-generated structured diagnosis, evidence retrieval, citation IDs, safety fields, and the rule that a root cause remains unconfirmed.

## Run from a trusted Node.js environment

1. Use Node.js 20 or newer.
2. Obtain the repository locally and use the branch `integration/opt-in-live-ai-smoke-2026-10-27`.
3. Run the ordinary checks first:

   ```sh
   node scripts/smoke-test-live.mjs
   ```

4. Only when you explicitly want to make a real provider request, run:

   ```sh
   RUN_LIVE_AI_GENERATION=1 node scripts/smoke-test-live.mjs
   ```

On Windows PowerShell, use `$env:RUN_LIVE_AI_GENERATION="1"; node scripts/smoke-test-live.mjs`.

The opt-in call uses a synthetic centrifugal-pump low-flow case and the currently configured public Worker endpoint. It may consume model quota and can incur usage under the provider/account's current terms. It does not change settings, write equipment data, or deploy code.

## Pass criteria

The live generation check passes only if:

- the configured Worker returns HTTP 200 and explicitly reports `model_called: true`;
- the response contains a valid diagnosis object in the requested language;
- safety and LOTO fields are present;
- at least one knowledge chunk and one source citation are returned;
- every source ID in the diagnosis maps to a returned citation;
- every intervention step requires LOTO; and
- `session_summary.confirmed_cause` remains empty.

A failure is a useful result, not a reason to weaken the assertions. Inspect the returned status and logs without copying secrets or full sensitive request data into public issues.

## Security and deployment boundaries

- This check is opt-in and is not part of routine CI.
- Never put a provider key in source code, the browser, or this document.
- Do not run a deployment workflow as part of this verification.
- A successful smoke test does not validate every equipment case or make the generated advice a substitute for the exact OEM manual, site procedure, or competent-person review.
- A real live run must be recorded separately from deterministic unit tests and historical CI results.
