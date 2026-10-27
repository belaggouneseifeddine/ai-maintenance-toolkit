# Configure the optional Gemini assistant

The frontend remains usable without AI. The AI assistant works only after the Cloudflare Worker is deployed, the provider key is configured as a Worker secret, and a real request succeeds.

## Single supported backend

- Worker source: `worker.js`
- Worker configuration: `wrangler.toml`
- Deployment workflow: [Deploy Maintenance AI Toolkit API](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/workflows/deploy-worker.yml)
- API key creation: https://aistudio.google.com/apikey
- Gemini OpenAI-compatible API documentation: https://ai.google.dev/gemini-api/docs/interactions-overview
- Pricing and quotas: https://ai.google.dev/gemini-api/docs/pricing

The workflow expects these GitHub Actions repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GEMINI_API_KEY`

The workflow uploads `GEMINI_API_KEY` to the Worker as `AI_API_KEY`, then deploys `worker.js`. It does not expose the key in the frontend or print it in logs.

## After deployment

1. Confirm the GitHub Actions workflow completed successfully.
2. Open the Worker URL shown in the deployment logs.
3. Verify `https://YOUR-WORKER.workers.dev/health` returns JSON with `"ok": true`.
4. In the app's **AI assistant** section, enter the Worker URL ending in `/api/chat`, for example `https://YOUR-WORKER.workers.dev/api/chat`.
5. Press **Save endpoint**, then test with generic, non-sensitive data such as a centrifugal pump with abnormal vibration.
6. Verify the response is a preliminary assessment and review it against the exact manufacturer manual and site procedures.

Saving an endpoint only stores its URL on the current device; it does not verify that the server is online.

## Security and limitations

- Never put the provider key in `index.html`, browser storage, the endpoint field, or a public repository file.
- The frontend sends equipment, symptom, alarm code, observations, and selected language to the configured Worker and then to the provider.
- Do not submit plant names, customer data, credentials, internal manuals, or confidential maintenance records. Review current provider data-use terms, quotas, and charges first.
- The Worker source and deployed binding metadata show a Cloudflare rate limiter configured for 10 requests per 60 seconds per client key. The current configuration was inspected, but live limit-enforcement behavior has not yet been tested. CORS is not authentication; add operational usage/cost monitoring and validate abuse controls before public multi-user rollout.
- If the Worker is not configured or the provider is unavailable, use the local rule-based mode.
- AI output is not authoritative. Follow LOTO, site procedures, manufacturer instructions, and qualified-person requirements.

## Integration details

- The Worker calls `POST https://generativelanguage.googleapis.com/v1beta/interactions` and defaults to `gemini-3.8-flash`; set the Worker variable `AI_MODEL` only when intentionally overriding the model.
- The Worker converts its internal diagnosis schema into standard JSON Schema for Interactions API structured output.
- The response parser reads the Interactions API model-output steps rather than the legacy `candidates[0].content.parts` response.
- The API key remains server-side; provider response bodies and secret values are not returned to the browser.
- Interactions API request storage is explicitly disabled (`store: false`) because maintenance cases may contain operationally sensitive information. This means server-side conversation continuation is not used.

## Verification status

Source files and a deployment workflow are present in the repository. That does not prove the Worker is deployed or the Gemini request succeeds. Only mark AI as live after the health check and a real generic `POST /api/chat` test succeed.
