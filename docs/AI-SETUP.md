# Configure the Maintenance AI Toolkit cloud provider

The local diagnostic engine remains available independently of the cloud model. The cloud provider is selected by the Worker variable `AI_PROVIDER`. The browser never receives provider credentials.

## Recommended free-tier setup: Cloudflare Workers AI

The feature branch is configured to use Cloudflare Workers AI through the native `env.AI` binding:

- Worker variable: `AI_PROVIDER = "cloudflare"`
- Worker variable: `CLOUDFLARE_AI_MODEL = "@cf/meta/llama-3.2-3b-instruct"`
- Wrangler binding: `[ai]` with `binding = "AI"`
- No separate model API key or secret is required for the native Workers AI binding.
- Cloudflare documents a free allocation of 10,000 Neurons per day for Workers AI. Actual use depends on model and prompt size; when the allocation is exhausted, requests may stop until it resets. Check the current pricing and model access in your Cloudflare account before production use.

The selected model appears in the connected account's model catalog and its schema endpoint exposes JSON Mode inputs. The full staging Worker path was verified on 2026-10-29 for two generic cases (pump low flow and motor fails to start). Both returned HTTP 200 with safety/LOTO fields, structured hypotheses, and inspection steps. This is a narrow smoke test, not proof of general diagnostic accuracy; the pump case remains preliminary and uses low-confidence hypotheses without source citations when retrieved excerpts do not support them.

Official references:
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers AI model catalog](https://developers.cloudflare.com/workers-ai/models/)
- [Workers AI JSON Mode and supported models](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)

## Alternative providers

- Gemini remains available by setting `AI_PROVIDER = "gemini"` and configuring `GEMINI_API_KEY` (or the legacy `AI_API_KEY`) as a Worker secret.
- There is no silent fallback between providers. Select a provider explicitly so failures are visible and testable.

## Use the app

1. Deploy only after the branch checks and the staged end-to-end diagnosis test pass.
2. Open the Worker `/health` endpoint. `{"ok":true}` confirms service health only, not model availability.
3. Open the published Maintenance AI Toolkit and go to **مساعد AI / AI assistant**.
4. Enter generic, non-sensitive equipment and symptom details.
5. Use **التشخيص المحلي — دون إرسال البيانات** to keep the case in the browser.
6. For cloud diagnosis, explicitly grant consent and submit the cloud diagnosis form.
7. Review the safety gate, unknowns, proposed checks, and retrieved excerpts against the exact manufacturer manual and site procedures.

The frontend sends equipment, symptom, alarm code, observations, measurement status, and language to the configured Worker. Do not submit plant names, customer data, credentials, confidential manuals, or sensitive maintenance records.

## API and safety notes

- Worker source: `worker.js`
- Worker configuration: `wrangler.toml`
- Cloudflare provider adapter: `providers/cloudflare-provider.mjs`
- The Worker validates the response structure and mandatory safety fields, and maps source IDs to retrieved excerpts. Structured JSON does not guarantee technical correctness.
- Source excerpts support traceability but do not prove every claim is correct. Never invent a source, page number, alarm meaning, or OEM limit.
- If the provider is unavailable, at capacity, or returns invalid JSON, the request must fail closed; use the local diagnostic engine or escalate rather than treating a failed cloud response as a diagnosis.
- AI output is guidance, not an operating authorization or confirmed diagnosis. Follow LOTO, site procedures, manufacturer instructions, and qualified-person requirements.

## Free UI simulation

The **اختبار الواجهة مجانًا — محاكاة فقط** button exercises the response-display path with a deterministic placeholder. It does not call the Worker, send case data, call a model, or validate reasoning. Its output is explicitly labelled as a simulation.
