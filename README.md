# Maintenance AI Toolkit

Mobile-first progressive web app (PWA) for preliminary industrial-maintenance troubleshooting.

- **Live frontend (Cloudflare Pages):** https://maintenance-ai-toolkit.pages.dev/
- **Fallback frontend (GitHub Pages):** https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/
- **Repository:** https://github.com/belaggouneseifeddine/ai-maintenance-toolkit
- **Default branch:** `main`
- **Languages:** Arabic, French, English
- **Frontend hosting:** Cloudflare Pages, deployed from `main` by `.github/workflows/deploy-cloudflare-pages.yml`
- **Backend target:** Cloudflare Workers only

## Features

- Rule-based fault guidance, structured fault data, offline exploratory hypotheses, and a compact local knowledge-excerpt index with explicit evidence limits.
- Safety checklist and inspection-plan gate.
- Evidence provenance register and explicit equipment/symptom coverage gaps (QA metadata; not yet used to label runtime causes as OEM-verified).
- Portable maintenance-agent skill specifications, exact-keyword matching, review-required alias hints, and stricter Worker validation that prevents unverified causes from being labelled confirmed.
- Local maintenance log, draft recovery, filters, CSV export, and printable reports.
- Responsive interface, language switching, and PWA offline shell.
- Consent-based OpenAI assistant through a Cloudflare Worker, with a separate local/offline diagnosis action.

## Current limitations

- Local diagnosis is heuristic guidance, not a confirmed root cause. Exploratory hypotheses are labelled as hypotheses and do not carry calibrated probabilities.
- Manufacturer links are source-discovery aids; model scope and the exact claim/page must be verified before describing a cause as OEM-supported.
- Maintenance records are stored in the current browser/device and are not automatically synchronized or backed up.
- The app is a PWA, not a native Android APK.
- The OpenAI assistant is **not confirmed live** until the OpenAI Worker configuration and a real generic request return a validated model-generated answer.
- The Worker has a configured Cloudflare rate-limit binding (10 requests per 60 seconds per client key). Runtime enforcement, broader abuse monitoring, and cost controls still require operational verification; CORS is not authentication. The source allowlist must include both the primary Cloudflare Pages origin and the GitHub Pages fallback.

## AI deployment

Use [Cloudflare Worker deployment instructions](BACKEND_DEPLOYMENT.md) and [AI setup notes](docs/AI-SETUP.md). The manual workflow is:

https://github.com/belaggouneseifeddine/ai-maintenance-toolkit/actions/workflows/deploy-worker.yml

Required GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `OPENAI_API_KEY` (optional in GitHub if already configured as a Cloudflare Worker secret)

The workflow deploys the root `worker.js` using `wrangler.toml`, which selects OpenAI as the provider. The published app calls the configured Worker from the OpenAI diagnosis button only after per-request consent. The local diagnosis action remains offline.

Never commit API keys or put them in browser code, local storage, or the public repository. Use generic, non-sensitive test data only and review current provider terms, quotas, and costs.

## Core files

- `index.html` — main interface and local diagnostic logic
- `diagnostic-engine.js`, `faults.json`, `diagnostic-flows.js` — rule-based diagnostics plus local exploratory reasoning
- `knowledge/manufacturer-sources.json` — scoped source references; entries are not automatically treated as verified fault evidence
- `i18n.js` — translations
- `maintenance-v03.js`, `ux-redesign.js` — maintenance workflow and home dashboard
- `manifest.json`, `sw.js` — PWA metadata and cache
- `worker.js`, `wrangler.toml` — Cloudflare Worker API
- `engineering-core.js` — request normalization, conservative routing, and local diagnostic adapter
- `agent-core.js` — orchestration core with safety-first routing and explicit tool adapters; `agent-ui.js` connects both the local-agent and consent-based OpenAI actions. Source wiring does not prove live AI availability or end-to-end production validation.
- `tests/agent-core.test.cjs` — agent orchestration behavior tests
- `docs/AI-AGENT-CORE-V1.md` — orchestration contract, current UI integration, and remaining verification gates
- `BACKEND_DEPLOYMENT.md`, `docs/AI-SETUP.md` — backend setup

## Safety

Follow site procedures, lockout/tagout (LOTO), the exact manufacturer manual, and qualified-person requirements. Never bypass guards, interlocks, alarms, relief devices, or other protective systems. Do not touch energized parts or investigate hydraulic leaks by hand. If evidence is insufficient or a hazard is present, stop and escalate.

## Verification policy

Do not claim that a feature or deployment has passed testing unless it was actually tested. A source-code commit is not proof that the live site or AI backend works.
