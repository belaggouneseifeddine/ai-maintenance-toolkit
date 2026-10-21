# Project review — 21 October 2026

## Current state

- Public repository: `belaggouneseifeddine/ai-maintenance-toolkit`, default branch `main`.
- Published site: https://belaggouneseifeddine.github.io/ai-maintenance-toolkit/
- The project is a mobile-first Arabic PWA prototype, not a native Android APK.
- Existing core areas: rule-based fault guidance, safety checklist, local maintenance log, CSV export, PWA manifest/service worker, CV page, and an optional AI interface.
- AI is **not connected** until a backend Worker is deployed and configured. The UI alone does not provide AI responses.
- Maintenance records are stored in the current browser/device only; there is no automatic sync or backup.

## Changes made independently

1. Fixed maintenance-log date handling in `index.html`: default dates and diagnosis-created records now use the device's local calendar date rather than UTC, which could show the previous day for some time zones.
2. Removed a stray trailing separator from the CV contact line in `cv.html`.

## Review notes / remaining risks

### Priority 1 — verify core flows on the actual Android phone
- Open the published URL and check all four tabs.
- Create a record, reload the page, and confirm the record remains.
- Export CSV and confirm it opens in a spreadsheet app.
- Save a diagnosis to the maintenance log and confirm the date and fields are correct.
- Test the safety checklist and reset button.
- Try “Add to Home screen” and test offline after the first successful online load.
- These are **not marked as passed** because this review did not execute the app in the user's phone browser.

### Priority 2 — make data loss clearer
- Local records may disappear if browser data is cleared or the user switches browser/device. Add a visible export/backup reminder before wider use.
- Consider a JSON backup/import workflow in addition to CSV. CSV is useful for spreadsheet analysis but is not a complete restore format.

### Priority 3 — strengthen product clarity
- Keep the AI tab explicitly labelled experimental until a real backend is deployed and tested.
- Keep all maintenance suggestions subordinate to site procedures, LOTO, and manufacturer documentation.
- Add more equipment-specific rules only from verified technical references; do not invent setpoints, torque values, pressure limits, or part numbers.
- Validate the CV's contact details, language levels, and all claims before sharing it publicly.

### Priority 4 — AI integration, later
- Review `docs/AI-SETUP.md` and `backend/cloudflare-worker.js`.
- Before connecting a provider, verify its current free-tier terms, data handling, request limits, CORS configuration, and server-side secret storage.
- Never put API keys in `index.html`, a public repository, or browser storage.

## User decisions needed later

No decision is required to apply the two small fixes above. Before the next larger step, ask the user to choose:
1. Whether to prioritize app reliability and backup/export, or expand the troubleshooting knowledge base.
2. Which language should be prioritized next after Arabic: English or French.
3. Whether to proceed with a free-tier AI backend after checking current provider terms and privacy.

## Status statement

The repository and deployment URL are present in project context, and the two small code/text changes were committed to `main`. The published deployment and runtime behavior should still be rechecked after the commits; do not claim the site is fully tested or production-ready.
