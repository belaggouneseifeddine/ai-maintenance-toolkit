# Agent orchestration and security assurance plan

## Purpose
Apply useful ideas from multi-agent coding workflows and Cloudflare's security-audit-skill without adding an unnecessary agent framework to the runtime app. The production app remains a lightweight, local-first PWA; agents are a development and review workflow, not autonomous control of industrial equipment.

## Development roles (separate review responsibilities)
1. **Product/maintenance analyst** — translates technician workflow into explicit requirements and acceptance cases.
2. **Implementation agent** — proposes a minimal patch and identifies affected files.
3. **Safety reviewer** — checks stop-work conditions, LOTO, stored energy, hydraulic injection, protective devices, and whether any recommendation exceeds available evidence.
4. **Security reviewer** — checks trust boundaries, user input, XSS/HTML escaping, endpoint origin validation, secrets, privacy consent, rate/size limits, and dependency/workflow risks.
5. **Test/verification reviewer** — independently tries to falsify the proposed change using regression tests and edge cases.
6. **Release reviewer** — checks CI status, deployment result, cache version, release notes, and clearly separates automated from manual verification.

Do not treat multiple role labels as independent verification if the same reviewer simply repeats the implementer's claims. For high-impact security findings, require a separate review pass and a reproducible source trace.

## Security audit phases
1. **Reconnaissance:** document architecture, data flows, trust boundaries, entry points, third-party services, and deployment configuration.
2. **Coverage ledger:** enumerate browser UI, local storage/export, AI endpoint, Cloudflare Worker, Vercel function, PWA cache, CI/workflows, and dependencies. Record what was checked and what remains unchecked.
3. **Coverage-led review:** review one surface at a time; include XSS and unsafe DOM rendering, prompt injection/untrusted AI output, CORS/origin assumptions, secret exposure, oversized inputs, abuse/cost controls, stale cache, CSV formula injection, data deletion/export, and supply-chain/CI permissions.
4. **Independent validation:** attempt to disprove each candidate issue. Distinguish confirmed defects from hardening opportunities and unresolved questions; do not assign severity without a demonstrated impact path.
5. **Machine-readable results:** use stable IDs, file/line evidence, status (confirmed, needs validation, rejected), impact, reproduction steps, and remediation. Never call a finding confirmed without a bounded source trace.
6. **Remediation and regression:** fix only evidence-backed findings, add a regression test for each confirmed issue, rerun the audit for changed surfaces, and preserve unresolved items.
7. **Release gate:** no claim of security certification or production readiness based only on static checks. Report automated tests, code review, deployment result, and device/manual tests separately.

## Maintenance-domain safety gate
- The app must not bypass guards, interlocks, trips, overloads, relief valves, or permits.
- It must not recommend live electrical measurement, opening pressurized systems, or hazardous motion tests to an unqualified user.
- Unknown values remain unknown; model-specific settings require the exact OEM manual and model.
- AI output is advisory, must be bounded and treated as untrusted text, and cannot override local safety rules.
- Local diagnosis must remain useful when AI/network is unavailable.

## Implementation sequence
- [x] Move pump low-flow, motor no-start, and VFD trip question/answer definitions into structured data.
- [ ] Add runtime-level tests for rendered branches and safe output, not just source-string checks.
- [ ] Perform a source-trace security audit of browser rendering, API handlers, deployment configuration, and PWA update behavior.
- [ ] Add verified OEM manual retrieval with document/page provenance; never fabricate a citation.
- [ ] Add equipment passports and work-order lifecycle (reported, assigned, work performed, result verified) without conflating recommendation and actual work.
- [ ] Add preventive schedules and trend views only when units, timestamps, measurement points, and operating states are captured.
- [ ] Test AI end-to-end only after server secrets are configured; document provider status accurately.

## Evidence and release reporting
Every release note should list implemented changes, exact automated workflow results, manual checks actually completed (device/browser/date), known limitations and unresolved security items, and AI status (configured and tested, unconfigured, or unavailable).
