# Approved Source Register for Agent Development — 2026-10-27

This register records source projects explicitly surfaced in prior Maintenance AI Toolkit work and the intended, bounded use of each. Inclusion is not a claim that every instruction or claim in a source has been validated.

## Source register

| Source | Trust label | Intended use | Do not do |
|---|---|---|---|
| [Google Gemini API development skill](https://github.com/google-gemini/gemini-skills/tree/main/skills/gemini-api-dev) | official_project_skill; review required per change | API integration patterns, request/response validation, tests, provider error handling. Use alongside current official Gemini API docs. | Do not blindly migrate APIs or assume provider calls work without live tests. |
| [Google Skills catalog](https://github.com/google/skills) | official_project_skill; individual skill review required | Selectively adapt evaluation loops, retrieval design, structured output, and security separation-of-duties where portable. | Do not import Google Cloud-only infrastructure or install unrelated skills as runtime capabilities. |
| [Gemini Interactions API documentation](https://ai.google.dev/gemini-api/docs/interactions-overview) | official_vendor_documentation; current compatibility review required | Evaluate the cloud model adapter and structured interactions; compare against existing Worker contract before migration. | Do not migrate production until schema parity, safety, citations, cost/quota, and live provider response tests pass. |
| [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill) | public_reviewed_candidate; security workflow review required | Adapt scoped code review, evidence-backed findings, validation plans, coverage tracking, and report quality for local repository audits. | Do not claim a full audit was executed merely because the skill was read; do not send audit traffic to deployment or write generated reports into the target unless explicitly safe and ignored. |
| [Maintenance RAG retrieval skill in this repository](../agent-skills/maintenance-rag-retrieval/SKILL.md) | project_policy; review with tests | Evidence sufficiency, source scope, passage-level citations, abstention when retrieval is weak, human review before publishing knowledge. | Do not generate a specific diagnosis when evidence is insufficient; do not reproduce whole copyrighted manuals. |
| [Google Cloud generative AI examples](https://github.com/GoogleCloudPlatform/generative-ai) | official_project_examples; example-level review required | Reference patterns only when relevant to portable retrieval/evaluation/agent behavior. | Do not add cloud services or cost-bearing infrastructure without an explicit architecture and budget review. |

## Trust labels for maintenance claims

These labels describe the *evidence record*, not the reputation of a whole website:

- `official_verified`: the specific claim was checked against a manufacturer, regulator, standards body, or official technical document and the model/equipment scope matches.
- `public_reviewed`: a public source was reviewed for the particular claim, reliability, and applicability; not automatically model-specific.
- `candidate_unreviewed`: source discovered but the claim and scope have not been reviewed; cannot justify a definitive diagnosis.
- `field_observation_unverified`: user/technician report awaiting independent verification.
- `conflicting_sources`: sources disagree; preserve the conflict and do not silently choose one.

## Minimum metadata for every knowledge claim

Each claim must carry: stable source ID; title; publisher; exact URL or document ID; page/section or quoted short passage where allowed; retrieval date; review date; reviewer; equipment family and exact model applicability (or explicitly general); claim supported; trust label; safety relevance; and any known limitations/conflicts.

A source URL by itself is not evidence that the source supports the claim. Candidate or generic sources must never be presented as OEM-specific instructions. Do not invent page numbers, quotations, manuals, or source IDs.

## How the source set is used in the agent

1. Retrieve candidate passages using lexical matching for exact model numbers, alarm codes, part numbers, and identifiers; semantic retrieval may supplement but must not replace exact matching.
2. Filter by equipment family/model and operating context.
3. Pass the model a bounded evidence packet with stable source IDs, short excerpts, trust labels, and explicit missing information.
4. Permit generated explanations to cite only source IDs present in that packet.
5. Validate every cited ID and ensure the excerpt supports the claim; reject fabricated references and unsupported instructions.
6. If evidence is weak, conflicting, or out of scope, ask for more data or abstain.
7. Keep candidate-source review separate from runtime diagnosis. A model response must never promote a source to verified status or write directly to the reviewed knowledge base.

## Parallel delivery workstreams

- **Diagnostic engine:** improve next-test selection and evidence accounting independently of the cloud provider.
- **Knowledge and sources:** normalize claim-level metadata, trust labels, source coverage, and review workflow.
- **Cloud generative layer:** server-side model adapter, constrained JSON contract, evidence-grounded language, timeout/error fallback, and secret protection.
- **Security and evaluation:** adapt relevant checks from the Cloudflare audit skill; add reproducible contract, regression, and adversarial-input tests.

## Status and release gate

This is a source-policy document, not an audit report and not evidence that tests passed. The dynamic diagnostic session and cloud generation contract remain isolated on `feature/dynamic-diagnostic-agent-knowledge-v1`. No merge, deployment, or Vercel use is authorized until actual tests, security checks, existing regression checks, and mobile end-to-end verification have been run and their results recorded.
