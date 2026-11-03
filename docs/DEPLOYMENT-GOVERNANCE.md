# Production Deployment Governance

**Audit date:** 2026-11-03

## Policy

Production publishing and live AI-provider requests must be explicit, human-triggered operations. A commit to `main` is not, by itself, deployment approval.

## Workflow changes on this branch

- `.github/workflows/deploy-cloudflare-pages.yml`: production Cloudflare Pages deployment is manual-only through `workflow_dispatch`.
- `.github/workflows/deploy-pages.yml`: production GitHub Pages deployment is manual-only through `workflow_dispatch`.
- `.github/workflows/deploy-worker.yml`: production Worker deployment is manual-only through `workflow_dispatch`.
- `.github/workflows/live-ai-provider-smoke.yml`: a real model request is manual-only. It no longer runs automatically after Worker deployment because it may consume provider quota or paid usage.

Staging workflows are not changed by this proposal. The three deployment workflows and the primary test workflow now use Node.js 24, with `actions/checkout@v5` and `actions/setup-node@v5` (the Node 24-compatible releases). Node.js 20 reached end of life on 2026-04-30; other test workflows that already use supported Node.js 22 are left unchanged for now.

## Operational boundaries

- This branch does not deploy, merge, provision, or modify any production resource.
- Existing live deployments remain unchanged.
- Manual workflow dispatch still performs the advertised deployment or model request; verify the target, provider, secrets, and budget before triggering it.
- A health check is not proof that the generative model path works. A live model smoke test must be approved separately because it sends a real request.
- Configure GitHub environment protection and required reviewers in repository settings if an additional approval gate is required. Workflow YAML alone cannot create those repository-level reviewers.

## Repository governance finding

At the time of this audit, the GitHub API reported the `main` branch as unprotected and the repository rulesets endpoint returned an empty list. Enable branch protection/rulesets requiring pull requests, passing checks, and an authorized review before merging production changes. This is a repository-settings action and is not changed by this branch.

## Verification

`tests/deployment-governance.test.cjs` asserts that the three production deployment workflows and the live AI smoke workflow expose manual dispatch without automatic `push` or `workflow_run` triggers.

No deployment or live model request is performed by the tests.
