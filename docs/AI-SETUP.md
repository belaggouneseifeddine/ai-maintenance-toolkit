# Configure the optional AI assistant

The GitHub Pages app remains usable without AI. The AI tab is only a client interface; it does not call a model until a separate backend is deployed and configured.

## Architecture

- Frontend: GitHub Pages (https://belaggouneseifeddine.github.io)
- Backend template: `backend/cloudflare-worker.js`
- Provider: any provider that supports an OpenAI-compatible `/chat/completions` endpoint, subject to its current terms and pricing.

## Deploy the backend

1. Create/sign in to a Cloudflare account and open **Workers & Pages**.
2. Create a Worker and paste the contents of `backend/cloudflare-worker.js`, or deploy the file using your preferred workflow.
3. In the Worker settings, add these **secrets** / variables:
   - Secret `AI_API_KEY`: the API key issued by your chosen AI provider.
   - Variable `AI_BASE_URL`: provider API base URL, without the final `/chat/completions` path.
   - Variable `AI_MODEL`: exact model identifier supported by that provider.
   - Variable `ALLOWED_ORIGIN`: `https://belaggouneseifeddine.github.io`
4. Deploy the Worker and copy its HTTPS URL.
5. Open the published Maintenance AI Toolkit, go to **مساعد AI**, paste the Worker URL, and tap **حفظ الرابط على هذا الجهاز**.
6. Test with a non-sensitive example. If it fails, check the Worker logs, provider quota, endpoint format, and CORS origin.

## Important cost and security notes

- Do not commit provider API keys to GitHub or enter them into the app's browser field. Only store the key as a backend secret.
- A free Worker plan does not make the AI provider free. Check the provider's current pricing, data handling, and quota before use; do not assume a free tier exists.
- The included per-IP limit is only best-effort in-memory protection and is not a complete abuse-prevention system. Before public or production use, add robust rate limiting, provider spending limits, and abuse monitoring. Keep the provider quota/budget capped.
- The backend sends equipment type, symptom, alarm code, and observations to the configured provider. Do not send personal, confidential, or sensitive plant data.
- AI output can be wrong. Follow LOTO, manufacturer instructions, site procedures, and qualified-person requirements. Never bypass safety interlocks or protections.
- If the Worker is not configured or the provider is unavailable, the local rule-based diagnostic tab should continue to work.

## Current status

The UI and Worker template are committed, but the Worker has **not** been deployed or connected to an AI provider by this repository change. The AI assistant is not live until the manual deployment and configuration steps above are completed and tested.