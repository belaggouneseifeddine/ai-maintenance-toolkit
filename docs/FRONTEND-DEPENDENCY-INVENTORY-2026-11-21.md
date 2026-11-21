# Frontend Dependency Inventory — 2026-11-21

**Branch:** `refactor/unified-android-pwa-architecture-2026-11-21`  
**Purpose:** Record the current runtime loading and coupling before extracting modules. This is an inventory, not a refactor or deletion authorization.

## 1. Runtime entry point

`index.html` loads 34 classic JavaScript files in this order:

1. `diagnostic-flows.js`
2. `normalization.js`
3. `bayesian-engine.js`
4. `diagnostic-engine.js`
5. `engineering-core.js`
6. `agent-core.js`
7. `evidence-reasoning.js`
8. `evidence-reasoning-ui.js`
9. `i18n.js`
10. `oem-lookup.js`
11. `maintenance-records.js`
12. `app-legacy.js`
13. `maintenance-v03.js`
14. `knowledge-review.js`
15. `answer-tools.js`
16. `ux-redesign.js`
17. `navigation-redesign.js`
18. `p1-app-shell.js`
19. `agent-ui.js`
20. `assistant-session-contract.js`
21. `assistant-tool-registry.js`
22. `assistant-local-orchestrator.js`
23. `assistant-local-tools.js`
24. `diagnostic-session.js`
25. `diagnostic-session-ui.js`
26. `diagnostic-chat.js`
27. `learning-feedback-ui.js`
28. `document-library-core.js`
29. `document-semantic-search.js`
30. `learning-memory.js`
31. `document-library.js`
32. `document-retrieval-adapter.js`
33. `document-review-workspaces.js`
34. `diagnostic-document-evidence.js`

These are ordered classic scripts rather than isolated ES modules. Their execution order is therefore part of the current runtime contract.

## 2. Stylesheet cascade

The HTML loads five stylesheets in this order:

1. `document-library.css`
2. `app-shell.css`
3. `ux-redesign.css`
4. `p1-app-shell.css`
5. `design-system.css`

The cascade currently has multiple layers that can override one another. Do not remove or reorder a stylesheet based only on filename; verify computed styles and responsive states first.

## 3. Confirmed high-value dependency edges

The following dependencies were visible in the current source:

- `diagnostic-engine.js` → `MaintenanceNormalization`, `MaintenanceBayesianEngine`.
- `diagnostic-session.js` → `MAINTENANCE_DIAGNOSTIC_FLOWS`, `MaintenanceBayesianEngine`.
- `diagnostic-session-ui.js` → `MaintenanceI18n`, `MAINTENANCE_DIAGNOSTIC_FLOWS`, `MaintenanceDiagnosticSession`.
- `agent-core.js` → `MAINTENANCE_FAULTS`.
- `maintenance-records.js` → `MaintenanceI18n`.
- `agent-ui.js` → `MaintenanceI18n`, `MaintenanceAIAgentCore`, `MaintenanceEngineeringCore`, `MaintenanceDiagnosticSessionUI`, `MaintenanceDiagnosticChat`.
- `diagnostic-chat.js` → `MaintenanceDiagnosticSessionUI`, `MaintenanceI18n`, `MaintenanceLearningMemory`, `MaintenanceDocumentLibrary`, `MaintenanceAgentUI`.
- `learning-feedback-ui.js` → `MaintenanceLearningMemory`.
- `evidence-reasoning-ui.js` → `MaintenanceEvidenceReasoning`.
- `assistant-local-tools.js` resolves/injects the engineering core, diagnostic engine, Bayesian engine, evidence-source resolver, document retrieval adapter, and local fault library.
- `assistant-local-orchestrator.js` consumes the session contract and tool registry.
- `diagnostic-chat.js` creates the local tools and orchestrator and owns local session persistence.

This is a static source-reference inventory, not a complete runtime call graph. Dynamic property access, DOM events, inline handlers, and implicit global reads require browser instrumentation to enumerate fully.

## 4. Service-worker relationship

The current service worker uses cache key `maintenance-ai-toolkit-v76`.

- Core shell includes the HTML entry point, core styles, local diagnostic scripts, assistant contracts/orchestration, and `faults.json`.
- Optional assets include document/retrieval modules, OEM knowledge bundles, decision trees, OCR/PDF/transformer vendor assets, and language data.
- Optional assets are cached independently; a missing optional asset does not prevent installation of the core shell.
- Activation deletes older caches with the `maintenance-ai-toolkit-` prefix. The current worker does not intentionally delete IndexedDB or localStorage user records.

Any future module extraction must update the HTML script graph and the service-worker asset lists together. A file must not be removed until all direct references, dynamic loads, event listeners, tests, and offline paths have been checked.

## 5. Architectural findings

### Current risks

1. **Global namespace coupling:** multiple modules publish and consume `root.Maintenance*` globals.
2. **Mixed responsibilities:** `diagnostic-chat.js` currently combines UI rendering, message handling, session persistence, document retrieval, and orchestration setup.
3. **Load-order sensitivity:** the dependency graph is encoded by script tag order, not import declarations.
4. **CSS cascade complexity:** five stylesheets are layered without a single component-scoped ownership boundary.
5. **Legacy coexistence:** legacy shell/navigation and newer assistant UI coexist; static file age is not sufficient evidence that a file is unused.
6. **Offline coupling:** service-worker core/optional classification is a separate dependency surface and must stay synchronized with HTML.

### Recommended extraction sequence

1. Add contract tests for every global API and script bootstrap dependency.
2. Extract pure diagnostic state projection and validation from `diagnostic-chat.js` into a DOM-free application module.
3. Separate session persistence behind a platform-neutral repository interface; keep localStorage compatibility during migration.
4. Separate chat controller from DOM rendering without changing the user-visible flow.
5. Extract knowledge retrieval and case-memory ports with explicit offline adapters.
6. Convert one dependency cluster at a time to explicit imports or a documented bootstrap registry.
7. Consolidate CSS by component ownership only after visual snapshots exist for Arabic RTL, French/English LTR, light/dark, and narrow Android viewports.
8. Remove legacy code only after reference scans, runtime traces, and regression tests all show it is unused.

## 6. Not verified in this inventory

- Full dynamic call graph and all event-listener relationships.
- Computed CSS ownership, duplicate selectors, and visual regressions.
- Exact memory cost of OCR, PDF.js, Transformers.js, and language data on the target Android device.
- Android WebView bridge, Kotlin host, and native model runtime.
- Full offline behaviour on a real device.

No runtime files were moved or deleted as part of this inventory.
