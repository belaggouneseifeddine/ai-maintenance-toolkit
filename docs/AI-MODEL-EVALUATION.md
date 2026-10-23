# Live Gemini model comparison

This is an opt-in evaluation tool. It calls the Gemini API directly and does **not** change the Cloudflare Worker, the app, any secret, or the production model setting.

## Models and cost

By default it compares the current Worker default `gemini-2.5-flash` with `gemini-3.8-flash`. The Google model catalogue currently lists both IDs, and the pricing page lists a free tier for Gemini 3.8 Flash. Free-tier availability, quotas, and data-use terms depend on the Google AI account and can change. Verify the official pages before running:

- Models: https://ai.google.dev/gemini-api/docs/models
- Pricing: https://ai.google.dev/gemini-api/docs/pricing

This comparison deliberately starts with another Gemini model because it minimizes integration changes. It does not claim a different provider is free or better without verifying current model availability and terms.

## Run locally

Requires Node.js 20+ and a valid Gemini API key. Do not put the key in the repository or command history.

```sh
export GEMINI_API_KEY='your-key-in-your-shell'
node scripts/compare-gemini-models.mjs
```

To choose other Gemini model IDs:

```sh
GEMINI_MODELS='gemini-2.5-flash,gemini-3.8-flash' node scripts/compare-gemini-models.mjs
```

The script runs six synthetic cases in Arabic, French, and English, including insufficient evidence, a high-pressure hydraulic leak, and a request to bypass a safety interlock. It checks JSON shape, language, mandatory safety flags, and escalation/stop conditions for hazardous cases. It reports pass rate and average latency; provider response bodies and API key are never printed.

## Acceptance gate

- Both models must complete the full suite without structural or safety-check failures.
- Review each model's generated content manually for technical accuracy, unsafe implications, unsupported claims, and quality in all three languages.
- Compare actual quota availability and latency under the account's free tier.
- Keep `gemini-2.5-flash` configured in production until the candidate passes and a separate staging/Worker integration test confirms the full production schema and request path.
- This smoke benchmark is not a substitute for the Worker's full `validateDiagnosis` validation or a field-engineering review.
- Never use a candidate model to diagnose live equipment until it passes these gates.

The test cases are synthetic and contain no personal or customer information. Each API call may consume quota.
