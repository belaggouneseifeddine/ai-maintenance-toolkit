# Configure the optional AI assistant

The published app continues to work without AI. The AI tab is a client interface; it does not call a model until a backend is deployed, configured, and tested.

## Recommended zero-budget starting point: Gemini API + Cloudflare Worker

This is a suggested starting point, not a verified live integration. Availability, quotas, model IDs, and terms can change; check the provider dashboard before use.

- Frontend: GitHub Pages — https://belaggouneseifeddine.github.io
- Backend template: `backend/cloudflare-worker.js`
- Gemini API docs: https://ai.google.dev/gemini-api/docs/openai
- Gemini pricing and free-tier terms: https://ai.google.dev/gemini-api/docs/pricing
- Google AI Studio for creating an API key: https://aistudio.google.com/apikey

### Gemini settings for the current Worker

The Worker uses an OpenAI-compatible `/chat/completions` endpoint. Gemini documents compatibility with this interface.

- `AI_BASE_URL`: `https://generativelanguage.googleapis.com/v1beta/openai`
- `AI_MODEL`: `gemini-2.5-flash` (verify that this model is currently available to your API key before relying on it)
- `AI_API_KEY`: your Gemini API key, stored only as a Cloudflare Worker secret
- `ALLOWED_ORIGIN`: `https://belaggouneseifeddine.github.io`

Do not append `/chat/completions` to `AI_BASE_URL`; the Worker adds that path itself.

## Setup steps (Android phone)

1. Open Google AI Studio at https://aistudio.google.com/apikey and create an API key if your account is eligible.
2. Review the current free-tier availability, quota, and data-use terms before sending any information. The Gemini pricing page says content submitted on the Free tier may be used to improve Google's products. Use only generic, non-sensitive test examples; never submit plant names, customer details, credentials, internal documents, or confidential maintenance data.
3. Open Cloudflare Dashboard → **Workers & Pages**. Create a Worker and deploy the contents of `backend/cloudflare-worker.js`.
4. In the Worker settings, add `AI_API_KEY` as a **Secret**. Add `AI_BASE_URL`, `AI_MODEL`, and `ALLOWED_ORIGIN` as variables using the exact values above.
5. Deploy the Worker and copy its HTTPS URL.
6. Open the Maintenance AI Toolkit website, select **مساعد AI**, paste the Worker URL, and select **حفظ الرابط على هذا الجهاز**.
7. Run one generic test, such as equipment = centrifugal pump, symptom = abnormal vibration, alarm code = none, observations = no readings available. Do not treat the answer as an authoritative diagnosis.

## Security and cost limits

- Never put the provider key in `index.html`, localStorage, a public GitHub file, or the Worker URL field. Only store it as a Worker Secret.
- Cloudflare Workers has a free plan with request limits, but this does not make the AI provider free. Confirm both sets of limits and usage terms.
- The current Worker has an in-memory per-IP limit only. It is best-effort, not robust shared rate limiting or authentication. A public endpoint can be targeted by non-browser clients even if CORS is configured. Keep this as a personal test deployment until abuse controls and provider quota limits have been reviewed; do not enable paid billing.
- The Worker sends equipment type, symptom, alarm code, and observations to the provider. Do not use real or confidential industrial data.
- AI can be wrong. Follow lockout/tagout (LOTO), manufacturer manuals, site procedures, and qualified-person requirements. Never bypass guards, interlocks, alarms, or protective devices.
- If the Worker is missing or the provider is unavailable, the local rule-based diagnostic mode should remain available.

## Verification status

The repository contains the UI and Worker template. The Worker has not been deployed or connected to a provider by this documentation change. Do not describe the AI assistant as live until a real request and a representative troubleshooting test both succeed.
