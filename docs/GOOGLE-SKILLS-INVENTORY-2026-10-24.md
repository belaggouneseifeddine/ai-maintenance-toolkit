# Google Skills inventory for Maintenance AI Toolkit

Review date: 2026-10-24  
Source repository: https://github.com/google/skills  
Source catalog: https://raw.githubusercontent.com/google/skills/main/index.json  
Reviewed source revision: `e0ac7bdbe2611699fa615bd93c3b5628f4d3faab` (tree SHA observed during review)  
Source license: Apache License 2.0; see https://github.com/google/skills/blob/main/LICENSE

## Scope and result

The source catalog contained **175 skills** when reviewed. This is a relevance-based inventory for this project, not a claim that every skill file or every linked resource in the large repository was exhaustively audited. The repository bundles many Google Cloud-specific workflows, MCP integrations, product operations, and deployment instructions.

The Maintenance AI Toolkit is a mobile-first PWA with a rule-based diagnostic engine, a Cloudflare Worker AI path, a curated industrial knowledge base, and a source-grounded lexical retrieval implementation. Its own documentation says the AI backend must not be considered live until a real end-to-end request is verified. The goal here is to reuse portable workflow principles, not to add Google Cloud dependencies.

## Selected source skills

| Source skill | Decision | Reason |
|---|---|---|
| [Agent Platform RAG Engine Management](https://github.com/google/skills/blob/main/skills/cloud/agent-platform-rag-engine-management/SKILL.md) | Adapt retrieval and provenance ideas; do not copy the Google SDK workflow | Useful pattern: retrieve relevant passages and retain source identifiers. The actual skill requires Google Agent Platform / Vertex AI SDK and a managed corpus. |
| [Dynamic Hybrid Search using AlloyDB](https://github.com/google/skills/blob/main/skills/cloud/google-cloud-solution-hybrid-search-alloydb/SKILL.md) | Adapt the search strategy only | Exact alarm codes, equipment models and part numbers require lexical matching; semantic retrieval can complement it later. AlloyDB-specific deployment is not needed. |
| [RAG for enterprise search using GKE and AlloyDB](https://github.com/google/skills/blob/main/skills/cloud/google-cloud-solution-rag-enterprise-search-gke-sqldb/SKILL.md) | Reuse staged design/validation discipline only | Its full architecture assumes GKE, AlloyDB and Google Cloud storage, which conflicts with the current lightweight/free-first project constraints. |
| [Agent Platform Eval Flywheel](https://github.com/google/skills/blob/main/skills/cloud/agent-platform-eval-flywheel/SKILL.md) | Adapt the evaluation loop | Build a repeatable set of known faults, score evidence and citations, analyze failures, and compare before/after changes. Do not depend on the Google evaluation SDK. |
| [Gemini Interactions API](https://github.com/google/skills/blob/main/skills/cloud/gemini-interactions-api/SKILL.md) | Keep as reference only | Multi-step interaction and structured-output ideas are useful, but the API and SDK are provider-specific and not required for the first portable agent workflow. |
| [Multi-agent security](https://github.com/google/skills/blob/main/skills/cloud/google-cloud-solution-multi-agent-security/SKILL.md) | Adapt general separation-of-duties principles only | The project already has safety, security, test, and release review roles. Google Agent Gateway / Model Armor deployment instructions do not transfer directly. |
| [Retrieving developer knowledge](https://github.com/google/skills/blob/main/skills/developers/retrieving-developer-knowledge/SKILL.md) | Do not install as a runtime skill | It is specifically for official Google developer documentation, not industrial OEM manuals or maintenance literature. It may help when researching Google APIs only. |
| [Finding Google Skills](https://github.com/google/skills/blob/main/plugins/cloud/google-cloud-developer/skills/finding-google-skills/SKILL.md) | Do not install in the app | It routes work to Google product skills; it is a catalog-discovery helper, not a maintenance capability. |

## What was copied into this repository

Four **project-specific adaptations** were added under `agent-skills/` on this branch:

1. `maintenance-rag-retrieval` — evidence-first retrieval, source metadata, low-confidence handling, lexical-first retrieval.
2. `maintenance-agent-orchestration` — staged diagnostic workflow, bounded tool use, safety gate and human escalation.
3. `maintenance-evaluation` — repeatable fault scenarios, deterministic checks, citation metrics and regression workflow.
4. `maintenance-safety-grounding` — separation of observed facts, hypotheses and verified causes; mandatory maintenance safety boundaries.

These are not verbatim copies of Google's cloud-specific SKILL.md files. They adapt general workflow ideas to the existing application and retain links to the upstream references. The upstream repository declares Apache-2.0; consult its license for any future verbatim redistribution.

## Implementation constraints

- No Google Cloud, AlloyDB, GKE, Vertex AI, Agent Platform, paid vector database, or new model provider is introduced by this change.
- Existing rule-based diagnostics remain usable without AI or network access.
- Current retrieval is treated as lexical/source-grounded retrieval, not vector search. Do not claim semantic or embedding search until implemented and tested.
- Retrieved content and model output are untrusted input. Escape rendered text and validate structured output.
- A source being retrieved does not prove that it supports a diagnosis. Record the exact source and passage; mark unsupported claims as hypotheses or unknowns.
- Do not ingest or reproduce OEM manuals unless the source's license or permission allows it. The existing `knowledge/sources.json` policy remains authoritative.
- No deployment, merge, provider configuration, secret change, or automatic operational action is part of this work.

## Acceptance checklist

- [ ] Validate every skill file's metadata and scope.
- [ ] Add deterministic tests for retrieval ranking, source IDs, empty results, and low-confidence queries.
- [ ] Add tests that unsupported model-specific settings are not invented.
- [ ] Confirm no new paid service or Google credential is required.
- [ ] Run the repository quality checks on this branch.
- [ ] Report automated checks separately from live backend and Android manual tests.
