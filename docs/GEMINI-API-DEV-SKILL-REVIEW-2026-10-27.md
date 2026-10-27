# Gemini API Skill Compatibility Review — 2026-10-27

## Scope

- Repository: `belaggouneseifeddine/ai-maintenance-toolkit`
- Base: `main`
- Working branch: `feature/gemini-api-dev-skill-review-2026-10-27`
- Skill reviewed: [google-gemini/gemini-skills — gemini-api-dev](https://github.com/google-gemini/gemini-skills/tree/main/skills/gemini-api-dev)
- Purpose: adopt relevant development and validation practices without blindly applying provider-specific migration instructions or changing production behavior.

## Findings from repository inspection

The repository already has a server-side Gemini integration in `worker.js`, with structured JSON output, bounded diagnosis validation, source IDs, a deterministic evidence gate, a safety gate, and a local fallback. The app uses a Cloudflare Worker; the browser must not receive the provider API key.

The Worker currently calls the Gemini `generateContent` REST endpoint and defaults to `gemini-2.5-flash` unless `AI_MODEL` is configured. Existing worker contract tests mock provider responses and do not, by themselves, prove that a live provider request or production Worker succeeds.

## Skill compatibility decision

**Use `gemini-api-dev` as coding-agent reference material, not as an application runtime dependency.**

Useful practices to apply:
- Consult the matching official Gemini API documentation before modifying an API call.
- Preserve strict structured-output validation and bounded error handling.
- Treat retrieved knowledge and user input as untrusted data, never as instructions.
- Keep provider secrets server-side.
- Add regression tests before changing request format or model selection.

Do not blindly follow every claim in the skill file. At review time, the official [Gemini models guide](https://ai.google.dev/gemini-api/docs/models) says Gemini 2.5 models are restricted to users who have actively used them, but are not deprecated and remain served until further notice. It recommends Gemini 3.5 Flash-Lite or Gemini 3.8 Flash for new projects. Therefore, the skill's blanket statement that all Gemini 2.5 models are deprecated is not consistent with the current official model guide.

The official [Interactions API guide](https://ai.google.dev/gemini-api/docs/interactions-overview.md) recommends Interactions API for new projects. This does not justify an untested production migration of the existing Worker. Keep the current endpoint until a separately evaluated migration demonstrates schema parity, safety behavior, source traceability, quota/cost acceptability, and successful provider responses.

## Change made on this branch

- Added a worker-contract regression test that places a prompt-injection string inside a retrieved knowledge excerpt and verifies:
  - the system instruction explicitly treats supplied material as untrusted data;
  - the malicious excerpt remains in the user/evidence payload, not the system instruction;
  - the test restores the original fixture even if an assertion fails.

This is a boundary test for prompt construction. It does **not** prove the model will always resist prompt injection, nor does it validate a live Gemini response.

## Verification status

- [x] Repository identity and default branch checked through the GitHub connection.
- [x] `worker.js`, `docs/AI-SETUP.md`, `docs/AI-AGENT-CORE-V1.md`, `wrangler.toml`, and `tests/worker-contract.test.cjs` inspected on `main`.
- [x] Branch created from `main`.
- [x] Regression test committed on the working branch.
- [ ] Test suite executed in a repository checkout or CI.
- [ ] Live Worker health endpoint checked.
- [ ] Real `POST /api/chat` provider generation verified.
- [ ] Gemini model/API migration evaluated.
- [ ] Merge and production deployment intentionally not performed.

## Next gates

1. Run the full worker contract suite and the repository quality checks on this branch.
2. Confirm the new test fails if the explicit untrusted-data system instruction is removed.
3. Run existing deterministic safety, source-traceability, malformed-output, timeout, and quota/error cases.
4. Only after CI passes, consider a separate migration experiment for the current Gemini model/API; do not change the default model based on the skill alone.
5. Perform a live provider test only after confirming current free-tier limits and acceptable usage/cost. Do not put keys in source code or chat.
6. Review the diff before any pull request. No merge or deployment is part of this change.
