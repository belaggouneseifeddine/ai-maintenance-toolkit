# Maintenance AI Toolkit

An Android-first, mobile-friendly industrial maintenance troubleshooting prototype, published as a static progressive web app (PWA).

- **Live frontend:** https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/
- **Repository:** https://github.com/belaggouneseifeddine/ai-maintenance-toolkit
- **Current branch:** `main`
- **Interface languages:** Arabic, French, and English

## Current status

The static frontend includes an offline, rule-based diagnostic flow and a local maintenance log. The optional AI assistant is **not live by default**: a backend must be deployed, configured with a provider key, and tested with a real request before it can be described as connected.

The v0.2 diagnostic-engine work has been merged into `main`. It adds pump-fault matching from structured fault data, conservative no-match handling, a safety gate before producing an inspection plan, local draft autosave, language switching, and maintenance-record filters.

## What the prototype currently supports

- Structured fault entry across pumps, motors, conveyors, compressors, hydraulic and pneumatic systems, actuated valves, VFDs, instrumentation, gearboxes, bearings, electrical control/PLC, and thermal systems.
- Symptom-specific follow-up questions for selected equipment/fault paths.
- Rule-based pump-fault matching that avoids guessing when evidence is weak.
- Safety reminders and a checklist before generating an inspection plan.
- Arabic, French, and English labels, with RTL layout for Arabic.
- Local maintenance records and draft data stored in the current browser/device.
- CSV export, printable inspection reports, and PWA shell/offline support.

## AI backend options

The repository includes two **deployment templates**, neither of which should be assumed to be live:

- Cloudflare Worker: `backend/cloudflare-worker.js` — see [AI setup](docs/AI-SETUP.md).
- Vercel Function: `api/chat.js` — see [Vercel AI setup](docs/VERCEL-AI-SETUP.md).

Never put provider API keys in browser code, local storage, the public repository, or the frontend endpoint field. Store keys only as backend secrets/environment variables. Check current provider pricing, quotas, and data-use terms before sending any information. Use generic, non-sensitive test examples only.

The frontend can continue to use local rule-based diagnosis when no AI endpoint is configured or when the backend is unavailable.

## Important limitations

- Rule-based results are preliminary guidance, not a confirmed root cause or an authoritative diagnosis.
- AI responses, once configured, must also be reviewed against the exact manufacturer manual, site procedures, and qualified-person requirements.
- Browser-local records are not synchronized or automatically backed up; they remain on the current device/browser.
- Offline behavior, installation, language flows, and report printing require testing on the target Android device.
- This is a PWA, not a native Android APK.
- A successful CI check or deployment does not by itself prove that the AI backend works.

## Safety principles

- Follow lockout/tagout (LOTO), site procedures, and the exact manufacturer documentation.
- Account for electrical, hydraulic, pneumatic, mechanical, thermal, and stored energy.
- Never bypass guards, interlocks, alarms, relief devices, or other protective systems.
- Do not invent specifications, torque values, pressure limits, wiring details, alarm meanings, or part numbers.
- Do not touch energized electrical parts or locate hydraulic leaks by hand.
- If information is insufficient or risk is high, stop and escalate to a qualified person.

## Project files

- `index.html` — user interface and local rule-based prototype logic
- `diagnostic-engine.js`, `faults.json` — rule-based diagnostic engine and structured fault data
- `i18n.js` — interface translations
- `manifest.json`, `sw.js` — PWA metadata and service worker
- `SAFETY.md` — safety boundaries
- `docs/troubleshooting-workflow.md` — structured diagnostic workflow
- `knowledge/INDUSTRIAL-FAULT-KNOWLEDGE-BASE.md` — source-backed fault patterns and safety boundaries
- `knowledge/ELECTRIC-MOTOR-AND-VFD-CASEBOOK.md` — supplemental motor/VFD troubleshooting
- `docs/TEST-CHECKLIST.md` — manual acceptance tests
- `docs/AI-SETUP.md`, `docs/VERCEL-AI-SETUP.md` — optional backend setup guides

## Roadmap

1. Run the Android acceptance checklist against the published frontend; record actual results rather than assuming features are verified.
2. Fix any reproducible UI, localization, draft, record, and PWA-cache issues.
3. Choose and deploy one backend only after reviewing current free-tier limits, privacy, and abuse controls.
4. Verify a real generic AI request and a representative troubleshooting test without exposing secrets or sending confidential plant data.
5. Keep the deterministic safety gate and local diagnostic fallback independent of AI availability.

## Verification policy

Do not mark a checklist item complete unless it was actually tested. Do not describe the AI assistant as live until the configured backend returns a valid response and a representative test has been reviewed. Do not describe the project as production-ready until critical flows have been tested on the target device.
