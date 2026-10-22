# Maintenance AI Toolkit — UI and RAG Audit Log

Audit date: 2026-10-22
Scope reviewed from the current main branch: index.html, ux-redesign.js, ux-redesign.css, diagnostic-engine.js, maintenance-v03.js, maintenance-v03.css, i18n.js, diagnostic-flows.js, sw.js, manifest.json, scripts/quality-check.mjs, and the Cloudflare Worker source worker.js.

## Evidence and limits

This is a source-code review, not a browser-based visual/accessibility test. Line numbers refer to the reviewed revisions and may shift after later commits. Runtime behavior, all mobile viewport sizes, real Gemini requests, and the deployed Worker version must be verified separately. Do not interpret a successful source commit as a successful live test.

## Confirmed findings and actions

| Severity | File / location | Finding | Action / status |
|---|---|---|---|
| High | worker.js — previous referencePack() | The previous implementation selected guidance labels based on keywords but did not retrieve document text. | Replaced in source with document fetch, Markdown section splitting, lexical ranking, and source metadata. Committed; deployment still blocked by Worker secret-binding upload validation. |
| High | index.html — AI response renderer | Backend source citations were not rendered in the UI. | Added plain-text rendering of returned source IDs, filenames, section headings, and line ranges. Committed; depends on the deployed Worker returning citation metadata. |
| High | scripts/quality-check.mjs — Worker source path | The test script read backend/cloudflare-worker.js, which could not be found in the repository, rather than the existing root worker.js. | Updated test to read root worker.js and assert retrieval/source-provenance behavior. Test suite has not yet been executed. |
| Medium | index.html — record delete handler | A record was deleted immediately after tapping Delete, without confirmation or validating the index. | Added localized confirmation and index bounds check. Committed. |
| High | worker.js — provider network error path | The source contained a raw network error detail field (provider_detail) in one failure path despite sanitizing HTTP provider errors elsewhere. | Removed the raw network detail from the response in the committed Worker source. Deployment status remains unverified. |
| Medium | index.html — dynamic rendering | Several templates use innerHTML. Reviewed major record/diagnostic templates use escapeHtml for user-controlled text, but every sink still needs a focused adversarial test. | Do not bulk-rewrite without tests; prioritize a complete sink-by-sink review and replace with DOM/textContent where practical. |
| Medium | ux-redesign.js | The dashboard builds HTML templates and uses a safe() helper. It needs tests with malicious stored records and malformed localStorage data. | Audit identified; adversarial tests remain. |
| Medium | maintenance-v03.js | Maintenance reports, decision-tree output, PM alerts, and photo list use HTML insertion in multiple places. Some values are escaped with esc(); IndexedDB/localStorage error and malformed-data paths need additional tests. | Audit identified; no wholesale rewrite made. |
| Medium | index.html — storage | Main record persistence uses localStorage.setItem without a local error handler, unlike draft persistence. Storage quota/security errors can interrupt the action. | Needs a consistent user-visible storage failure path; not yet changed. |
| Medium | worker.js — RAG | Retrieval currently fetches two Markdown files from the public repository and ranks sections by normalized lexical overlap. It is source-grounded lexical RAG, not embedding/vector search; no answer is proven grounded merely because sources were retrieved. | Add deterministic retrieval tests, low-confidence handling, stale-source checks, and response validation before calling it production-ready. |
| Medium | worker.js — rate limiting | No reliable rate limiting was found in the Worker source. A per-isolate in-memory counter would not be a robust substitute. | Configure a Cloudflare-supported rate-limit rule or a shared durable limiter before public rollout. |
| Medium | sw.js | The service worker caches a fixed shell list and falls back to network for uncached requests. Cache invalidation and stale-client behavior need an install/upgrade test. | Test offline launch, new-version activation, and missing optional assets on mobile. |
| Medium | index.html / translations | Arabic/French/English and RTL/LTR support exist, but full visual, keyboard, contrast, and screen-reader validation has not been performed. | Run manual tests at narrow mobile widths and keyboard-only navigation; verify each language and dark mode. |
| Medium | scripts/quality-check.mjs | Static assertions exist, but no test run was captured during this review. | Run the script in CI/local Node and fix all failures before release. |

## RAG design in the current source

1. Fetch only the allowlisted Markdown files from the repository's raw-content endpoint.
2. Split content by Markdown headings and retain source path, heading, and line ranges.
3. Rank sections with normalized lexical overlap against equipment, symptom, alarm code, and observations.
4. Supply the top four matching excerpts to the model as untrusted reference data.
5. Return citation metadata separately from the generated answer so the UI can display it.
6. If retrieval is unavailable or yields no matches, tell the model not to invent citations.

Known limitations: retrieval is lexical and may miss synonyms; documents are fetched per request (latency/availability impact); section line ranges are source-file line ranges, not OEM manual page numbers; no embedding model, reranker, freshness hash, or offline retrieval index exists yet.

## Next steps (ordered)

1. Resolve Cloudflare deployment metadata/binding handling without exposing or replacing secret values; deploy and verify the exact Worker source revision.
2. Run static quality checks and add RAG unit tests for section splitting, ranking, missing files, malicious text in knowledge documents, and citation integrity.
3. Execute a live /health test and controlled /api/chat cases: strong evidence, vague symptom, no matching knowledge, unavailable knowledge host, provider 429/503, malformed input, oversized body, and disallowed origin.
4. Complete a sink-by-sink review of every innerHTML/HTML insertion in index.html, ux-redesign.js, and maintenance-v03.js; test stored XSS payloads.
5. Add safe storage-failure handling and test import/export validation, CSV formula injection, and record-delete behavior.
6. Validate responsive layout, keyboard focus, labels, contrast, RTL/LTR, dark mode, offline launch, and service-worker upgrades on real mobile browsers.
7. Implement shared rate limiting and operational monitoring before public production use.

## Release gate

Do not mark RAG or the UI audit complete until tests pass and the deployed Worker revision is confirmed. Do not claim a diagnosis is source-backed unless the returned citation corresponds to a retrieved excerpt and supports the relevant statement.
