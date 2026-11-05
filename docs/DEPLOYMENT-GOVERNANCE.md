# Production Deployment Governance

**Audit date:** 2026-11-03

## Policy

Production publishing and live AI-provider requests must be explicit, human-triggered operations. A commit to `main` is not, by itself, deployment approval.

## Workflow changes on this branch

- `.github/workflows/deploy-cloudflare-pages.yml`: production Cloudflare Pages deployment is manual-only through `workflow_dispatch`, restricted to `refs/heads/main`, and assigned to the `production` environment.
- `.github/workflows/deploy-pages.yml`: production GitHub Pages deployment is manual-only through `workflow_dispatch`; the deploy job is restricted to `refs/heads/main` and retains the `github-pages` environment.
- `.github/workflows/deploy-worker.yml`: production Worker deployment is manual-only through `workflow_dispatch`, restricted to `refs/heads/main`, and assigned to the `production` environment.
- `.github/workflows/live-ai-provider-smoke.yml`: a real model request is manual-only, restricted to `refs/heads/main`, and requires an explicit `confirm_live_request=true` input. It no longer runs automatically after Worker deployment because it may consume provider quota or paid usage.

Staging workflows are not changed by this proposal. The three deployment workflows and the primary test workflow now use Node.js 24. All 11 repository workflow files use `actions/checkout@v5` and `actions/setup-node@v5` wherever those actions are present; secondary test/staging workflows retain their existing Node.js 22 script runtime. Node.js 20 reached end of life on 2026-04-30; other test workflows that already use supported Node.js 22 are left unchanged for now.

## Additional execution guards

- All production deployment jobs include a job-level `if` requiring `github.ref == 'refs/heads/main'`. A manual dispatch from another branch may start the workflow but cannot execute the deployment job.
- Cloudflare Pages and Worker use the GitHub `production` environment. Configure required reviewers and deployment branch restrictions in repository settings; the workflow cannot create those reviewers.
- GitHub Pages retains the canonical `github-pages` environment; configure its required reviewers and branch restrictions in repository settings.
- The live AI smoke job requires both `main` and the explicit boolean input `confirm_live_request=true`; the default is false.

## Deployment audit note — 2026-11-04

Immediately before this manual-only policy merged, the PR #122 merge to `main` triggered the then-configured automatic production deployment workflows. GitHub Actions reported successful Cloudflare Pages, GitHub Pages, and production Worker deployment jobs. The Cloudflare Pages smoke test passed; the GitHub Pages post-deploy smoke test passed for the published app and Worker API; the Worker provider-configuration verification passed. This event preceded this governance change; the PR #123 governance merge itself did not deploy production assets. The workflows on current `main` now require manual dispatch.

## Operational boundaries

- This branch does not deploy, merge, provision, or modify any production resource.
- Existing live deployments remain unchanged.
- Manual workflow dispatch still performs the advertised deployment or model request; verify the target, provider, secrets, and budget before triggering it.
- A health check is not proof that the generative model path works. A live model smoke test must be approved separately because it sends a real request.
- Configure GitHub environment protection and required reviewers in repository settings if an additional approval gate is required. Workflow YAML alone cannot create those repository-level reviewers.

## Repository governance finding

At the time of this audit, the GitHub API reported the `main` branch as unprotected and the repository rulesets endpoint returned an empty list. Enable branch protection/rulesets requiring pull requests, passing checks, and an authorized review before merging production changes. This is a repository-settings action and is not changed by this branch.

## Verification

`tests/deployment-governance.test.cjs` asserts that the three production deployment workflows and the live AI smoke workflow expose manual dispatch without automatic `push` or `workflow_run` triggers; production deploy jobs are restricted to `main`; Cloudflare Pages and Worker use the `production` environment; and live AI smoke requires explicit boolean confirmation.

No deployment or live model request is performed by the tests.
