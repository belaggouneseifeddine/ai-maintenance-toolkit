# Competitive benchmark — 21 October 2026

## Purpose and scope

This is a capability benchmark based on public product documentation, not a hands-on feature test or a claim that the products are equivalent. ChatGPT and Claude are general-purpose AI workspaces; MaintainX and Fiix are maintenance-management products. Maintenance AI Toolkit is currently a small, browser-based prototype.

## What the reference products do well

| Reference | Strengths described in official material | Lesson for Maintenance AI Toolkit |
|---|---|---|
| ChatGPT | Projects and chats, web search, files, plugins/connectors, work with files and longer-running workflows | Keep project context and evidence organized; support structured file import/export and make actions traceable. |
| Claude | Project knowledge bases; Artifacts for editable documents, dashboards and small interactive tools; newer project workflows can coordinate longer-running work | Make generated maintenance reports editable, reviewable and reusable rather than returning chat text alone. |
| MaintainX | Work orders, assigned work, preventive maintenance, checklists, notifications, audit/history and reporting | Model a maintenance job as a lifecycle with owner, priority, status, evidence, sign-off and history. |
| Fiix CMMS | Work orders, preventive schedules, asset history, parts, reporting, mobile/offline workflows and AI-assisted insights | Build asset-centric records, PM completion tracking, evidence attachments and explicit offline/sync behavior. |

Official references:
- ChatGPT feature overview: https://learn.chatgpt.com/docs/features
- Claude Projects: https://support.claude.com/en/articles/9517075-what-are-projects
- Claude Artifacts: https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them
- MaintainX work orders: https://www.getmaintainx.com/use-cases/work-order-management
- Fiix preventive maintenance: https://fiixsoftware.com/cmms/preventive-maintenance-software/

## Honest positioning

The project should not try to replace ChatGPT or Claude as general-purpose assistants, nor claim to match an established CMMS. Its defensible niche is a lightweight, multilingual, phone-first industrial maintenance companion that combines:
1. conservative, explainable troubleshooting rules;
2. a carefully bounded AI second opinion;
3. work-log and shift-handover capture;
4. preventive-maintenance reminders;
5. portable backup/export for technicians with limited connectivity.

## Current gaps to close before broad use

- Evidence-backed troubleshooting coverage is uneven: the structured fault library currently contains pump cases, while the interface supports many equipment families. The other families must clearly fall back to general safe guidance until dedicated cases are validated.
- No automated regression suite was present at the start of this phase.
- Browser-local records are not a multi-user CMMS and do not sync automatically.
- Photos are stored in local IndexedDB; the record-to-photo relationship needs a stable identifier rather than relying on list position.
- Runtime checks for the deployed AI endpoint and Android/PWA behavior must be recorded separately from source-code review.
- Translation coverage must include generated content, dynamic status messages, validation errors, empty states and accessibility labels.

## Product success measures

Do not measure success by number of AI features. Track:
- percentage of supported scenarios with an evidence-backed result;
- false-positive rate and safe fallback rate in a reviewed test set;
- translation coverage by visible UI string;
- successful backup/restore round trips;
- record/photo association integrity after insert, delete, export and restore;
- AI endpoint success/error handling with secrets kept server-side;
- completion of Android offline and usability checks;
- number of unresolved critical/high-risk findings.

## Release rule

A commit, green automated test, or successful health endpoint is not sufficient by itself to claim production readiness. The release record must distinguish static review, automated tests, deployed API tests, and manual Android/PWA tests. The app remains advisory and must not replace site safety procedures, qualified judgement or manufacturer instructions.


## Competitive review — 2026-11-09

Public product pages and documentation were reviewed; no paid trial, production integration or independent performance benchmark was run. Vendor capability and accuracy statements below are vendor claims, not independently verified measurements.

| Product | Publicly described capabilities | What it means for the Toolkit |
|---|---|---|
| IBM Maximo Application Suite / APM | Enterprise asset performance, condition monitoring, predictive/prescriptive maintenance, asset health and work-management integration | Benchmark asset history, sensor-to-work-order traceability and enterprise workflows; do not attempt to reproduce a full EAM suite. |
| Siemens Senseye Predictive Maintenance | Industrial AI and domain-expert workflow for asset health visibility, prioritization and predictive maintenance across fleets | Benchmark multi-asset prioritization and maintenance-context capture; public material does not expose enough model detail to validate causal reasoning. |
| AVEVA Predictive Analytics | Condition monitoring, fault detection/diagnostics, asset-health analytics and time-to-failure/prescriptive guidance | Benchmark clear separation between anomaly detection, fault diagnosis and prediction; require calibration evidence before adopting RUL language. |
| Fiix Asset Health powered by Augury | Sensor-based machine-health monitoring, AI plus human vibration expertise and maintenance workflow integration | Benchmark sensor provenance, expert validation and conversion of alerts into work; the Toolkit currently has no live sensor ingestion. |
| UpKeep Nova | AI assistant inside a CMMS for maintenance knowledge, work orders and mobile workflows | Benchmark natural-language access to asset/work-order history; the Toolkit currently exports/shares locally but has no authenticated multi-user CMMS backend. |
| ABB Digital Powertrain / asset health services | Motor/drive and rotating-equipment condition monitoring and predictive-maintenance services | Benchmark motor-centric monitoring and lifecycle context; the Toolkit needs better motor/VFD/bearing evidence and measurement context. |
| PlantCraft (open source) | Self-hosted historian, alarms, analytics, dashboards, models and workflow components | Architecture reference for local ownership and plant context; broader platform, not a validated pump diagnosis competitor. |

### Relative position

**Current Toolkit strengths:** mobile PWA, Arabic/French/English, local/offline deterministic workflows, local PM scheduling, photo-backed maintenance log, handover/export, safety gate and an explicit evidence/uncertainty direction.

**Current gaps:** no live PLC/SCADA/historian ingestion, no calibrated predictive model/RUL, no asset hierarchy or CMMS integration, no authenticated collaboration/sync, no complete document/PDF ingestion, and the pump pilot is not yet a source-backed six-case diagnostic engine.

**Product strategy:** do not compete feature-for-feature with enterprise APM/CMMS suites. Build a reliable offline diagnostic companion that is unusually transparent about evidence, uncertainty, measurement provenance and safe next tests. Add work-order/CMMS integrations only after the diagnostic core is validated.
