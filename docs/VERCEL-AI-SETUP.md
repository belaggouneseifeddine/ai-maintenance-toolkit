# Optional Vercel AI backend

This repository includes `api/chat.js`, a serverless API endpoint that can call Gemini without exposing the provider key in the browser. The existing GitHub Pages app can keep running; configure its AI endpoint field to the Vercel URL.

## Setup

1. Connect this repository to a Vercel project and deploy from the repository root.
2. In Vercel project settings, add these environment variables:
   - `AI_API_KEY`: create the key in https://aistudio.google.com/apikey and enter it directly in Vercel settings. Never commit it to GitHub or paste it into the app.
   - `AI_BASE_URL`: `https://generativelanguage.googleapis.com/v1beta/openai`
   - `AI_MODEL`: `gemini-2.5-flash` (verify that the model is available to your account and check quota first).
   - `ALLOWED_ORIGIN`: `https://belaggouneseifeddine.github.io`
3. Redeploy after saving the variables.
4. Copy the Vercel project domain and open the Maintenance AI Toolkit app. In the AI tab, set the endpoint to `https://YOUR-VERCEL-DOMAIN/api/chat`, then save it on the device.
5. Test with generic non-sensitive data, such as a centrifugal pump with abnormal vibration. Confirm the response contains a preliminary assessment and safe checks.

## Safety and limits

- This function uses a best-effort per-instance in-memory rate limit, not a shared abuse-control system. CORS limits browser origins but is not authentication; public endpoints can still be called by non-browser clients.
- Keep paid billing disabled, monitor provider usage, and do not submit confidential plant, customer, or personal data. Gemini Free-tier data-use terms may permit content to be used to improve Google products; check current terms.
- AI output is not an authoritative diagnosis. Follow LOTO, manufacturer manuals, and site procedures. The local rule-based diagnostic mode should remain available if the AI backend fails.
- This code addition does not mean the Vercel project is connected, deployed, or tested. A real API request is still required before the AI assistant can be called live.
