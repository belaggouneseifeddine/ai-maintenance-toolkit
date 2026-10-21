# Maintenance AI Toolkit API (Cloudflare Workers)

This backend serves the GitHub Pages frontend. It does not use Vercel.

## Fast deployment through GitHub Actions

The repository includes a manual workflow at **Actions → Deploy Maintenance AI Toolkit API**. Configure these three repository Actions secrets first:

1. `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with permission to edit Workers Scripts for the target account.
2. `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.
3. `GEMINI_API_KEY`: your valid Google Gemini API key. Do not paste it into chat or commit it to the repository.

Add them under **Repository → Settings → Secrets and variables → Actions → New repository secret**:
https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/settings/secrets/actions

Then open:
https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/workflows/deploy-worker.yml

Choose **Run workflow**. The workflow uploads `GEMINI_API_KEY` to the Worker as the `AI_API_KEY` secret and deploys `worker.js` using `wrangler.toml`. It does not print the secret. Check the workflow run for the actual result.

## Connect the frontend

After a successful run, open the Worker URL shown in the workflow logs or Cloudflare dashboard. Check `https://YOUR-WORKER.workers.dev/health`, then open:

https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/

Paste the Worker URL ending in `/api/chat` into the AI endpoint field, for example `https://YOUR-WORKER.workers.dev/api/chat`. The frontend stores that endpoint in this browser.

## API

- `GET /health`: health check.
- `POST /api/chat`: JSON body `{ "machine": "...", "symptom": "...", "code": "", "observations": "", "language": "ar" }`.
- Supported languages: `ar`, `fr`, `en`.

The Worker restricts browser requests to the GitHub Pages origin, validates payloads, limits request size, and keeps provider errors/credentials out of responses. Provider calls may incur Gemini usage charges; configure provider usage limits before public release.

**Important:** committing source code does not deploy the backend. A successful workflow run and a valid Worker URL are required before live AI diagnosis can work.
