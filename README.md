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

## Evidence-aware local reasoning (work in progress)

- `local-reasoning.js` generates symptom-based exploratory hypotheses, explains why each is worth checking, suggests the next follow-up question, and lists missing context. These are hypotheses, not confirmed faults or statistical probabilities.
- `knowledge/manufacturer-sources.json` records manufacturer manuals/portals with model scope, section/page locators, verification state, and redistribution cautions.
- `knowledge/open-knowledge-source-register.json` tracks research datasets and RAG/agent examples without copying code/data before license and provenance checks.
- The Grundfos Hydro EN index is for **Hydro EN firefighting/sprinkler systems only**. Section 13 is indexed at printed page 32, but the detailed cause/action table is not yet verified. The UI must not present these headings as confirmed solutions.
- The reasoning path is local and deterministic; it does not call an external LLM or fetch live sources during diagnosis. “Guessing” means transparently ranked exploratory hypotheses with rationale and safe checks, not fabricated manufacturer evidence.
- Work is confined to `feature/local-evidence-quality-gates` and PR #54. No merge or deployment is intended.

## Current limitations

- Local diagnosis is heuristic guidance, not a confirmed root cause.
- Maintenance records are stored in the current browser/device and are not automatically synchronized or backed up.
- The app is a PWA, not a native Android APK.
- The AI assistant is **not confirmed live** until the Worker is deployed and a real generic request returns a valid answer.
- The Worker has a configured Cloudflare rate-limit binding (10 requests per 60 seconds per client key). Runtime enforcement, broader abuse monitoring, and cost controls still require operational verification; CORS is not authentication.

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
- `engineering-core.js` — isolated request-normalization and routing core; not yet wired into the production UI
- `BACKEND_DEPLOYMENT.md`, `docs/AI-SETUP.md` — backend setup

## Safety

Follow site procedures, lockout/tagout (LOTO), the exact manufacturer manual, and qualified-person requirements. Never bypass guards, interlocks, alarms, relief devices, or other protective systems. Do not touch energized parts or investigate hydraulic leaks by hand. If evidence is insufficient or a hazard is present, stop and escalate.

## Verification policy

Do not claim that a feature or deployment has passed testing unless it was actually tested. A source-code commit is not proof that the live site or AI backend works.
