# Configure OpenAI as the primary AI provider

The application keeps its local diagnostic engine available, but the cloud AI path uses OpenAI through the Cloudflare Worker. The browser never receives the provider API key.

## Required Cloudflare Worker configuration

- Worker variable: `AI_PROVIDER = "openai"` (now set in `wrangler.toml`).
- Worker secret: `OPENAI_API_KEY`.
- Optional variable: `OPENAI_MODEL = "gpt-4.1-mini"`.

The deploy workflow verifies that the Worker has an `OPENAI_API_KEY` secret. If a GitHub Actions secret named `OPENAI_API_KEY` is supplied, the workflow updates the Cloudflare Worker secret from it. Otherwise, it uses the secret already configured directly in Cloudflare. Never put a key in browser code, local storage, the repository, logs, or chat.

OpenAI is selected explicitly. A failed OpenAI request does not silently fall back to Gemini. Use the local diagnostic button if the cloud service is unavailable.

## Use the app

1. Deploy the Worker workflow and confirm that it succeeds.
2. Open the Worker `/health` endpoint and verify it returns JSON with `"ok": true`. This checks service health only; it does not prove that a model request works.
3. Open the published Maintenance AI Toolkit and go to **مساعد AI / AI assistant**.
4. Enter generic, non-sensitive equipment and symptom details.
5. To use the local engine, choose **التشخيص المحلي — دون إرسال البيانات**. This keeps the case in the browser.
6. To use OpenAI, check the consent box and press **التشخيص باستخدام OpenAI**. Consent is cleared after each request; it must be granted again for the next request.
7. Review the response, safety gate, uncertainties, and any retrieved source excerpts against the exact manufacturer manual and site procedures.

The frontend sends equipment, symptom, alarm code, observations, measurement status, and language to the configured Worker, which processes the case using OpenAI. Do not submit plant names, customer data, credentials, confidential manuals, or sensitive maintenance records.

## API and safety notes

- Worker source: `worker.js`
- Worker configuration: `wrangler.toml`
- Deployment workflow: [Deploy Maintenance AI Toolkit API](https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/workflows/deploy-worker.yml)
- OpenAI adapter: `providers/openai-provider.mjs`
- The adapter calls the OpenAI Responses API with strict structured output and `store: false`.
- The Worker validates the response structure and safety requirements, and maps returned source IDs to retrieved excerpts. A source excerpt is not proof that every claim is correct.
- HTTP 429 can indicate a quota, billing, or rate-limit issue. Check the OpenAI project usage, billing status, and rate limits; do not paste the API key into chat or logs.
- CORS is not authentication. Rate limits and deployment controls should be reviewed before public multi-user rollout.
- AI output is guidance, not an operating authorization or confirmed diagnosis. Follow LOTO, site procedures, manufacturer instructions, and qualified-person requirements.

## Verification status

The Worker health endpoint was confirmed by the operator on 2026-10-29. A previous real OpenAI request returned HTTP 502 with upstream status 429; the exact cause was not confirmed. The UI-to-Worker integration and provider selection changes are being prepared on a separate branch. Do not consider the full OpenAI path verified until a real, non-sensitive `POST /api/chat` returns a validated model-generated response.


## Free UI simulation (no API credits required)

The **اختبار الواجهة مجانًا — محاكاة فقط** button exercises the response-display path with a deterministic placeholder. It does not call the Worker, send case data, call OpenAI, or validate model reasoning. Its output is explicitly labelled as a simulation. Use the local diagnosis action for actual rule-based guidance. A real OpenAI test still requires available API quota.
