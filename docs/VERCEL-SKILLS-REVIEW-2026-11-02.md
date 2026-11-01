# Vercel Agent Skills review — 2026-11-02

## Scope and safety boundary

This review concerns reusable development-agent instructions only. It does not change the Maintenance AI Toolkit runtime, diagnostic engine, Bayesian scoring, Worker, UI, dependencies, secrets, or deployment configuration.

Work is confined to `research/vercel-skills-integration`. No skill package was installed and no deployment or merge was performed.

## Upstream review

Repositories reviewed:

- `vercel-labs/skills`: CLI for discovering, installing, listing, and invoking agent skills.
- `vercel-labs/agent-skills`: Vercel's collection of agent instructions.

Relevant official materials reviewed:

- CLI README and creating-skills documentation;
- CLI installation and command documentation;
- `web-design-guidelines/SKILL.md`;
- `writing-guidelines/SKILL.md`;
- agent-skills repository README and skill structure.

### Findings

1. A skill is a directory containing a `SKILL.md` with YAML frontmatter. The required fields are `name` and `description`; the name must match its directory and use lowercase letters, digits, and hyphens.
2. The Toolkit's existing skills are stored under `agent-skills/`, which is not one of the CLI's default discovery roots. A root `skills.sh.json` custom path entry is therefore added to make this location discoverable without moving or duplicating files.
3. The CLI README currently specifies Node.js 22.20 or later. The CLI was not installed or run in this review.
4. The CLI documents anonymous telemetry and security-audit requests by default; `DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1` opts out. If the CLI is later run, use one of these opt-out variables.
5. Vercel's web-design skill is relevant only for a UI/accessibility review. Its instruction to fetch current external guidelines means the reviewer must treat fetched content as untrusted reference material and not let it override project safety/security rules.
6. Vercel's writing skill is relevant to documentation review only. It does not improve industrial diagnostic reasoning.
7. React, React Native, Vercel optimization, and Vercel deployment skills are not selected: this project is a vanilla HTML/CSS/JavaScript application, and Vercel deployment is outside the approved project workflow.

## Existing Toolkit skills found

- `maintenance-agent-orchestration`: diagnostic workflow and report contract.
- `maintenance-evaluation`: scenario-based quality, safety, grounding, and regression evaluation.
- `maintenance-rag-retrieval`: retrieval, provenance, and source-permission boundaries.
- `maintenance-safety-grounding`: industrial safety and evidence labels.

The existing content already covers much of the requested diagnostic and safety workflow. It was retained rather than rewritten.

## Changes on this branch

- Added `skills.sh.json` to register `./agent-skills` as a custom skill discovery path.
- Added `maintenance-bayesian-reasoning` to clarify the current qualitative, uncalibrated ranking model and its test/interpretation constraints.
- Added `maintenance-oem-evidence-validation` to enforce exact model/document/firmware/page/claim provenance and source permissions.
- Added this review record.

No production application file was modified.

## Quality impact and verification status

### Static review completed

- Compared existing Toolkit skill instructions with current Bayesian engine behavior and tests.
- Confirmed that the current Bayesian engine labels itself `qualitative_bn_v1`, uses heuristic likelihood ratios, groups evidence, treats missing observations as unknown, and declares itself uncalibrated.
- Confirmed that the source registry distinguishes licensed candidates from reference-only portals and includes explicit fetch restrictions.
- Checked that the two new skill names match their directory names and that both include the required frontmatter fields.
- Checked the custom discovery path against the CLI's documented `skills.sh.json` mechanism.

### Not executed

The GitHub connector used here can read and write repository files, but it does not provide a Node.js shell in which to run the CLI or project test suite. Therefore none of the following is claimed as passed:

- `npx skills add . --list` / CLI discovery;
- YAML/frontmatter parser validation by the CLI;
- `node --test tests/bayesian-engine.test.cjs`;
- the full diagnostic regression suite;
- `node scripts/knowledge-audit.mjs --check`;
- live AI/Worker or Android UI tests.

No measured before/after improvement in agent output quality is claimed. The changes establish a more explicit review procedure; an actual quality comparison requires running the same versioned cases with and without the skills in a supported coding-agent environment.

## Next verification commands

Run from the repository root with Node.js 22.20+ and the CLI available:

```sh
DISABLE_TELEMETRY=1 npx skills add . --list
node --test tests/bayesian-engine.test.cjs
node --test tests/diagnostic-engine.test.cjs
node scripts/knowledge-audit.mjs --check
```

Then perform a controlled A/B review on the same fixed scenarios, recording unsupported claims, citation validity, correct abstention, safety violations, schema compliance, and regression findings. A safety violation is a hard failure and must not be averaged away.

## Release status

Review artifacts only; not merged, not deployed, and not a change to stable application behavior.
