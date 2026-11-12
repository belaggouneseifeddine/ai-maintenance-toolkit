# Production Deployment Governance

**Audit date:** 2026-11-12

## Policy

Production publishing and live AI-provider requests must be explicit, human-triggered operations. A commit to `main` is not, by itself, deployment approval.

## Workflow changes on this branch

- `.github/workflows/deploy-cloudflare-pages.yml`: production Cloudflare Pages deployment is manual-only through `workflow_dispatch`, restricted to `refs/heads/main`, and assigned to the `production` environment.
- `.github/workflows/deploy-pages.yml`: GitHub Pages fallback deploys automatically on `push` to `main` and also supports manual recovery through `workflow_dispatch`; its deploy job is restricted to `refs/heads/main` and retains the `github-pages` environment. The build job runs the full Node diagnostic test suite and `scripts/quality-check.mjs` before publishing.
- `.github/workflows/deploy-worker.yml`: production Worker deployment is manual-only through `workflow_dispatch`, restricted to `refs/heads/main`, and assigned to the `production` environment.
- `.github/workflows/live-ai-provider-smoke.yml`: a real model request is manual-only, restricted to `refs/heads/main`, and requires an explicit `confirm_live_request=true` input. It no longer runs automatically after Worker deployment because it may consume provider quota or paid usage.

Staging workflows are not changed by this proposal. The three deployment workflows and the primary test workflow now use Node.js 24. Repository workflow files use `actions/checkout@v5` and `actions/setup-node@v5` wherever those actions are present; secondary test/staging workflows retain their existing Node.js 22 script runtime. Node.js 20 reached end of life on 2026-04-30; other test workflows that already use supported Node.js 22 are left unchanged for now.

## Additional execution guards

- All production deployment jobs include a job-level `if` requiring `github.ref == 'refs/heads/main'`. A manual dispatch from another branch may start the workflow but cannot execute the deployment job.
- Cloudflare Pages and Worker use the GitHub `production` environment. Configure required reviewers and deployment branch restrictions in repository settings; the workflow cannot create those reviewers.
- GitHub Pages retains the canonical `github-pages` environment; configure its required reviewers and branch restrictions in repository settings.
- The live AI smoke job requires both `main` and the explicit boolean input `confirm_live_request=true`; the default is false.

## Operational boundaries

- This branch does not deploy, merge, provision, or modify any production resource.
- Existing live deployments remain unchanged.
- Manual workflow dispatch still performs the advertised deployment or model request; verify the target, provider, secrets, and budget before triggering it.
- A health check is not proof that the generative model path works. A live model smoke test must be approved separately because it sends a real request.
- Configure GitHub environment protection and required reviewers in repository settings if an additional approval gate is required. Workflow YAML alone cannot create those repository-level reviewers.

## Repository governance finding

At the time of this audit, the GitHub API reported the `main` branch as unprotected and the repository rulesets endpoint returned an empty list. Enable branch protection/rulesets requiring pull requests, passing checks, and an authorized review before merging production changes. This is a repository-settings action and is not changed by this branch.

## Verification

`tests/deployment-governance.test.cjs` asserts that GitHub Pages deploys on pushes to `main`, Cloudflare Pages and Worker remain manual-only, production deploy jobs are restricted to `main`, Cloudflare Pages and Worker use the `production` environment, and live AI smoke requires explicit boolean confirmation.

No deployment or live model request is performed by the tests.
