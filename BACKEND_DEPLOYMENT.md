# Maintenance AI Toolkit API (Cloudflare Workers)

This backend serves the published frontend using Cloudflare Workers. The intended Worker allowlist is the primary Cloudflare Pages site (`https://maintenance-ai-toolkit.pages.dev`) and the GitHub Pages fallback (`https://belaggouneseifeddine.github.io`).

## Fast deployment through GitHub Actions

The repository includes a manual workflow at **Actions → Deploy Maintenance AI Toolkit API**.

Required repository Actions secrets:

1. `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with permission to edit Workers Scripts and manage Worker secrets for the target account.
2. `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Add them under **Repository → Settings → Secrets and variables → Actions → New repository secret**:
https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/settings/secrets/actions

**Provider key handling:** the Worker accepts either `GEMINI_API_KEY` or the existing compatibility name `AI_API_KEY`. If one of those secrets is already configured directly on the Cloudflare Worker, you do not need to duplicate it in GitHub. The workflow checks that a provider secret exists after deployment. To provision or rotate the key through GitHub Actions, optionally add `GEMINI_API_KEY` as a third repository secret. Never paste the key into chat or commit it to the repository.

Then open:
https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/workflows/deploy-worker.yml

Choose **Run workflow**. The workflow validates the Cloudflare credentials, deploys `worker.js`, updates `GEMINI_API_KEY` only if that optional GitHub secret is supplied, and verifies that a provider secret remains configured. The key is passed through standard input and is not written into source files or printed by the workflow. Check the workflow run for the actual result.

## Connect the frontend

After a successful run, open the Worker URL shown in the workflow logs or Cloudflare dashboard. Check `https://YOUR-WORKER.workers.dev/health`, then open:

https://maintenance-ai-toolkit.pages.dev/ (primary) or https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/ (fallback)

Use the Worker URL ending in `/api/chat` in the AI endpoint field, for example `https://YOUR-WORKER.workers.dev/api/chat`. The frontend stores that endpoint in this browser.

## API

- `GET /health`: health check.
- `POST /api/chat`: JSON body `{ "machine": "...", "symptom": "...", "code": "", "observations": "", "language": "ar" }`.
- Supported languages: `ar`, `fr`, `en`.

The Worker must restrict browser requests to these two explicitly allowlisted published app origins, validate payloads, limit request size, and keep provider errors/credentials out of responses. CORS is not authentication. Provider calls may incur Gemini usage charges; check provider quota and any billing settings before enabling usage.

**Important:** committing source code does not deploy the backend. A successful workflow run, a configured provider secret, and a valid Worker URL are required before live AI diagnosis can be considered ready.
