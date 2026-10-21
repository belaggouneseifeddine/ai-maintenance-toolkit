# Maintenance AI Toolkit

Mobile-first progressive web app (PWA) for preliminary industrial-maintenance troubleshooting.

- **Live frontend:** https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/
- **Repository:** https://github.com/belaggouneseifeddine/ai-maintenance-toolkit
- **Default branch:** `main`
- **Languages:** Arabic, French, English
- **Backend target:** Cloudflare Workers only

## Features

- Rule-based fault guidance and structured fault data.
- Safety checklist and inspection-plan gate.
- Local maintenance log, draft recovery, filters, CSV export, and printable reports.
- Responsive interface, language switching, and PWA offline shell.
- Optional Gemini assistant through a separately deployed Cloudflare Worker.

## Current limitations

- Local diagnosis is heuristic guidance, not a confirmed root cause.
- Maintenance records are stored in the current browser/device and are not automatically synchronized or backed up.
- The app is a PWA, not a native Android APK.
- The AI assistant is **not confirmed live** until the Worker is deployed and a real generic request returns a valid answer.
- The Worker currently has only best-effort in-memory rate limiting; it is not a production abuse-control system.

## AI deployment

Use [Cloudflare Worker deployment instructions](BACKEND_DEPLOYMENT.md) and [AI setup notes](docs/AI-SETUP.md). The manual workflow is:

https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/workflows/deploy-worker.yml

Required GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GEMINI_API_KEY`

The workflow deploys the root `worker.js` using `wrangler.toml`. It does not configure the frontend endpoint automatically. After a successful deployment, enter the Worker URL ending in `/api/chat` in the app's AI section and save it on the device.

Never commit API keys or put them in browser code, local storage, or the public repository. Use generic, non-sensitive test data only and review current provider terms, quotas, and costs.

## Core files

- `index.html` — main interface and local diagnostic logic
- `diagnostic-engine.js`, `faults.json`, `diagnostic-flows.js` — rule-based diagnostics
- `i18n.js` — translations
- `maintenance-v03.js`, `ux-redesign.js` — maintenance workflow and home dashboard
- `manifest.json`, `sw.js` — PWA metadata and cache
- `worker.js`, `wrangler.toml` — Cloudflare Worker API
- `BACKEND_DEPLOYMENT.md`, `docs/AI-SETUP.md` — backend setup

## Safety

Follow site procedures, lockout/tagout (LOTO), the exact manufacturer manual, and qualified-person requirements. Never bypass guards, interlocks, alarms, relief devices, or other protective systems. Do not touch energized parts or investigate hydraulic leaks by hand. If evidence is insufficient or a hazard is present, stop and escalate.

## Verification policy

Do not claim that a feature or deployment has passed testing unless it was actually tested. A source-code commit is not proof that the live site or AI backend works.
