# Maintenance AI Toolkit API (Cloudflare Workers)

This is a standalone backend for the GitHub Pages frontend. It does not use Vercel.

## Deploy

1. Create a Cloudflare account and open **Workers & Pages**.
2. Create a Worker named `maintenance-ai-toolkit-api`.
3. Deploy the contents of `worker.js` (or connect this repository and set the Worker entry point to `worker.js`).
4. In the Worker settings, add the secret `AI_API_KEY` with your valid Google Gemini API key. Do not commit API keys to Git.
5. Optionally add variables `AI_MODEL=gemini-2.5-flash` and `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`.
6. Deploy and copy the Worker URL, for example the URL Cloudflare assigns to your Worker.
7. Open the app at https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/ and paste the Worker URL ending in `/api/chat` into the AI endpoint field, for example `https://YOUR-WORKER.workers.dev/api/chat`. The Worker also exposes `/health`.

## API

- `GET /health`: health check.
- `POST /api/chat`: JSON body `{ "machine": "...", "symptom": "...", "code": "", "observations": "", "language": "ar" }`.
- Supported languages: `ar`, `fr`, `en`.

The Worker restricts browser requests to the GitHub Pages origin, validates payloads, limits request size, and keeps provider errors/credentials out of responses. Provider calls may incur Gemini usage charges. Configure usage limits in the provider account before public release.

## Important

A source-code commit is not a deployed backend. A Cloudflare Worker URL and the `AI_API_KEY` secret must be configured in Cloudflare before live AI requests can succeed. Never store API keys in this public repository or browser JavaScript.
