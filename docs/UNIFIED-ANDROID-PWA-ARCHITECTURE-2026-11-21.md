# Unified Architecture Reorganization — Android + PWA

**Date:** 2026-11-21  
**Status:** Architecture baseline for staged refactoring  
**Target branch:** refactor/unified-android-pwa-architecture-2026-11-21  
**Base:** main at 28bd2ecea8282e8f6d7bb915d83e8509d198b06e

This document defines target boundaries before moving or rewriting production modules. It does not authorize a merge or deployment.

## 1. Product decision

Maintenance AI Toolkit is one product with one assistant experience. Android and PWA are platform shells around the same diagnostic domain and shared contracts.

- One chatbot is the primary interaction surface.
- Qwen is the local conversation and tool-orchestration model.
- Deterministic domain services own diagnostic calculations and state transitions.
- Local knowledge and local history remain usable without a network.
- Online retrieval and external AI are optional adapters, never prerequisites for core diagnosis.
- Android and PWA must not fork diagnostic business rules.

## 2. Target architecture

    EXPERIENCE / UI
    Unified Chat • Diagnostic Timeline • Evidence • Documents • History • Knowledge • Settings
                                      |
                         Platform UI contracts
                         /                     \
                 PWA Platform Adapter      Android Platform Host
                 Browser APIs              Kotlin + WebView Bridge
                 IndexedDB, SW, Cache      Local files, model host
                         \                     /
                          Application / Orchestration
                          UnifiedAssistant
                          SessionManager
                          ToolRouter
                          RuntimeSelector
                          PersistenceCoordinator
                                      |
                                  Domain Core
                    DiagnosticState • Rules • Bayesian • EIG
                    Equipment • Evidence • Cases • Repair Outcome
                                      |
                               Data / Knowledge
                    Fault Library • Document Index • Local Cases
                    Measurements • Source Metadata • Local Storage
                                      |
                             Optional Adapters
                         Local Qwen Runtime | Online Services
                         Android native host | Search / Worker

Dependency rule: UI depends on application contracts; application depends on domain and ports; platform adapters implement ports. Domain logic must not import DOM, Android APIs, Worker APIs, or a specific model runtime.

## 3. Proposed source layout

This is the target layout, not an instruction to move all files in one commit.

    src/
      domain/
        diagnostic/
          diagnostic-state.js
          hypotheses.js
          rules/
          bayesian/
          information-gain/
          sessions/
        equipment/
        evidence/
        cases/
        shared/
      application/
        assistant/
          unified-assistant.js
          conversation-controller.js
          tool-router.js
        use-cases/
        contracts/
      knowledge/
        retrieval/
        documents/
        case-memory/
        schemas/
      infrastructure/
        persistence/
        model/
          qwen-adapter.js
          model-protocol.js
        online/
          search-adapter.js
          external-ai-adapter.js
      platforms/
        pwa/
          bootstrap/
          storage/
          service-worker/
          ui/
        android/
          bridge/
          storage/
          model-host/
          lifecycle/
      ui/
        chat/
        diagnostic/
        evidence/
        documents/
        history/
        design-system/
    worker/
      api/
      providers/
      middleware/
    android-native/
      app/
    tests/
      unit/
      integration/
      contracts/
      fixtures/

Migration is incremental. Existing root-level scripts stay in place until each module has a verified replacement and all script references, service-worker precache entries, tests, and deployment paths are updated.

## 4. Domain contracts

### 4.1 Unified diagnostic state

One versioned state object is the source of truth. Chat transcript is not the diagnostic database.

Required conceptual fields:
- schemaVersion, sessionId, status, language
- equipment: type, manufacturer, model, asset identifier
- operatingContext: duty, speed, load, process conditions, baseline
- symptoms[]
- measurements[]: value, unit, timestamp, method, provenance
- evidence[]: observation, polarity, source, reliability, linked claim
- hypotheses[]: cause, support, contradiction, uncertainty, status
- tests[]: candidate, rationale, cost, feasibility, result
- references[]: document, page, source status
- repairOutcome: confirmed cause, action, post-repair result
- audit timestamps and state version

Every fact carries provenance: user-reported, measured, document-derived, historical case, engine-inferred, model-suggested, or unknown. Model-suggested facts are never silently promoted to measured facts.

### 4.2 Model/tool boundary

Qwen may:
- interpret user language and propose structured facts;
- ask clarifying questions;
- choose among registered tools;
- explain tool results and draft reports.

Qwen may not:
- invent measurements or source citations;
- directly mutate Bayesian scores;
- mark a cause as confirmed;
- bypass tool schemas or state validation.

Tool calls use a versioned JSON schema, strict allow-list, bounded input/output, timeout, and explicit error states. The application validates every model proposal before changing diagnostic state.

### 4.3 Diagnostic calculation boundary

- Rules handle hard constraints and known relationships.
- Bayesian service handles evidence updates only where priors and likelihoods are declared.
- EIG ranks feasible tests only where outcome likelihoods are available.
- Uncalibrated heuristics remain labelled as relative support, not probabilities.
- Missing evidence remains unknown, never negative evidence.

### 4.4 Persistence boundary

Define platform-neutral repository interfaces:
- DiagnosticSessionRepository
- DocumentRepository
- KnowledgeIndexRepository
- MaintenanceCaseRepository
- ModelArtifactRepository

PWA implementation: IndexedDB with schema migrations and explicit export/backup.  
Android implementation: native app storage and a narrow bridge; do not expose arbitrary filesystem access to JavaScript.

## 5. Backend and online services

The backend is not the owner of the local diagnostic state. The local application remains functional if the Worker is unavailable.

Cloudflare Worker responsibilities, when enabled:
- optional search/provider proxy;
- request validation, origin policy, rate limiting and bounded payloads;
- provider abstraction and normalized responses;
- no authoritative client-supplied diagnosis or probability updates.

The Worker must not become a mandatory hop for local diagnosis, local document retrieval, Qwen inference, or maintenance history. External AI remains opt-in and replaceable.

## 6. PWA architecture

PWA is the browser platform adapter:
- installable shell and responsive UI;
- service worker caches only versioned application assets;
- IndexedDB owns local documents, diagnostic sessions, and case history;
- offline boot and local diagnosis are first-class;
- model downloads are explicit, resumable, size-checked, and separate from the app shell;
- cache version changes must not delete user data;
- UI must distinguish offline/local results from online results.

Current root scripts and styles are loaded through index.html and sw.js. Any future module split must update both loading and precache manifests in the same change.

## 7. Android architecture

Android is a host for the same application/domain contracts:
- Kotlin host owns lifecycle, file picking, permissions, model loading and native storage;
- WebView UI shares the PWA experience where practical;
- a narrow, versioned JS bridge exposes only explicit operations;
- Qwen runtime is isolated behind LocalModelAdapter;
- model load/unload, generation cancellation, memory pressure and app backgrounding are explicit states;
- no external provider is required for local diagnosis.

Model selection is not assumed complete. The existing 0.8B prototype is a baseline only; 1.5B–2B candidates must pass on-device latency, memory, heat, and stability tests before adoption.

## 8. UI / design system

Use one consistent Industrial Premium design language across Android and PWA:
- navy / cyan / amber semantic palette;
- light and dark themes;
- RTL-first Arabic with correct LTR handling for French and English;
- mobile-first spacing and thumb-reachable primary actions;
- consistent typography, cards, forms, dialogs, status and evidence components.

Information architecture:
1. Chat is the home and primary workspace.
2. Diagnostic progress appears as a timeline within the conversation.
3. Evidence and hypotheses are expandable structured panels, not a second assistant.
4. Document upload and retrieved references are available in the same conversation.
5. History and knowledge are supporting workspaces, not separate AI experiences.
6. Safety-critical notices remain visible and are not hidden by theme or layout changes.

The first UI refactor should remove stylesheet cascade ambiguity and duplicated navigation behavior, not redesign every screen at once.

## 9. Known cleanup targets

Initial high-risk areas observed in main:
- index.html loads multiple overlapping CSS layers and root scripts.
- app-shell.css, ux-redesign.css, p1-app-shell.css, and design-system.css overlap in ownership.
- navigation-redesign.js moves DOM nodes and rewrites tab markup at runtime.
- diagnostic-chat.js owns substantial chat state and local persistence concerns.
- assistant-local-orchestrator.js is not itself a model runtime or natural-language parser.
- assistant-local-tools.js expects an evidence likelihood resolver that must be verified before EIG integration.
- worker.js combines routing, provider integration, validation, and diagnostic-related logic in a large entry file.
- sw.js manually duplicates the asset dependency list.
- PWA and Android need explicit shared contracts rather than duplicated platform behavior.

Do not delete or rename any of these until import/script references, tests, cache entries, and rollback paths are mapped.

## 10. Staged implementation

### Stage 1 — Stabilize boundaries
- Add architecture and contract documentation.
- Define module ownership and public interfaces.
- Inventory every script/style entry and runtime dependency.
- Establish baseline tests and smoke tests.

### Stage 2 — Unify application state
- Introduce versioned diagnostic state adapter.
- Route chat, guided diagnosis, tools, and history through one session.
- Preserve backward compatibility with existing stored sessions.

### Stage 3 — Unify assistant orchestration
- Integrate Qwen agent behind model adapter.
- Route validated tools through the existing allow-list.
- Keep deterministic diagnosis independent of Qwen.
- Provide local fallback when model loading fails.

### Stage 4 — Domain and knowledge consolidation
- Connect rules, Bayesian updates, and EIG to one evidence contract.
- Connect documents, retrieval, and maintenance cases to the same session.
- Keep the source-tracking repair explicitly out of scope unless separately approved.

### Stage 5 — Platform separation
- Extract PWA storage, service-worker and lifecycle adapters.
- Formalize Android bridge and native lifecycle.
- Verify both platforms use identical domain contracts.

### Stage 6 — UI and design-system consolidation
- Establish design tokens and component ownership.
- Simplify navigation and make chat the central workspace.
- Remove duplicate CSS only after visual and regression tests.

### Stage 7 — Verification
- Unit, contract, integration, offline, Android bridge, accessibility and visual regression tests.
- On-device testing for model memory, latency, heat and lifecycle.
- No release or deployment without separate approval.

## 11. Acceptance gates

A stage is not complete until:
- all existing supported workflows remain accounted for;
- relevant automated tests pass;
- PWA offline boot works;
- diagnostic sessions survive reload and migration;
- Android bridge errors are recoverable;
- model failure does not disable deterministic diagnosis;
- no user data is lost;
- Arabic, French and English layouts remain correct;
- no source-tracking changes are included without approval.

## 12. Explicit exclusions

- No merge to main.
- No deployment or release.
- No production secrets or provider settings changes.
- No deletion of legacy code before dependency proof.
- No changes to source-tracking/evidence-register repair scope.
- No claim that Android model training is supported until a working on-device experiment proves it.
