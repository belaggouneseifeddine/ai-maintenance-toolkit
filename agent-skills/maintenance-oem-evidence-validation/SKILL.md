---
name: maintenance-oem-evidence-validation
description: Validate industrial maintenance claims against exact OEM manuals and approved technical sources. Use when extracting alarm meanings, troubleshooting steps, model-specific limits, citations, or adding OEM evidence to the knowledge base.
---

# OEM evidence validation

## Purpose

Ensure that every model-specific maintenance claim is traceable to a source that actually supports it. A manufacturer portal URL or search result is a discovery lead, not proof of a fault definition.

## Repository policy to inspect first

Read the current `knowledge/sources.json`, manufacturer source registry, OEM evidence records, and the relevant knowledge-audit rules before retrieving or adding source material.

Respect the registry's policy, including:

- explicit reuse/licence permission where required;
- `fetch_allowed: false` for reference-only portals;
- no raw OEM manual text in the repository unless reuse rights explicitly permit it;
- human review before publishing knowledge;
- no treating candidate sources as approved authority.

If a permission or licence is missing, ambiguous, or disallows fetching/reuse, do not download, copy, quote, or automatically ingest the protected material. Ask for an authorized source or record the portal as reference-only.

## Evidence extraction workflow

1. **Identify the exact equipment scope.** Capture manufacturer, machine family, exact model/type, serial range where relevant, controller/drive, firmware/software version, region/configuration, and operating mode. Mark unknown fields as unknown.
2. **Identify the exact document.** Record document title/number, revision/date, language, official source URL, publisher, and access/reuse status.
3. **Locate the claim.** Record section/subsection and printed page. If the PDF page differs, record both printed page and PDF page; never substitute one silently.
4. **Extract only the needed claim.** Summarize the supported technical meaning in original wording. Do not reproduce substantial copyrighted manual text, tables, or figures.
5. **Map claim to evidence.** Each record must state the exact alarm/fault/symptom claim and the source passage location that supports it. A source link without a claim-level mapping is insufficient.
6. **Check applicability.** Confirm that the cited model, controller, firmware, manual revision, and configuration match the target machine. If scope is broader or uncertain, label the limitation.
7. **Separate evidence states.** Distinguish:
   - source discovered;
   - source permission verified;
   - source passage reviewed;
   - claim reviewed against exact scope;
   - field result independently verified.
   A manual-reviewed claim is not automatically field-verified.
8. **Record contradictions.** Preserve conflicting manual revisions or manufacturer documents. Do not silently select one.
9. **Validate safety.** Review isolation, stored energy, qualification, permits, protective devices, and stop-work criteria before turning a source statement into a recommended action.
10. **Run repository audits.** Run the knowledge audit and related tests after edits. Regenerate generated reports only through their documented script.

## Minimum evidence record

Where applicable, capture:

- stable record ID;
- manufacturer and exact model;
- controller/drive and firmware scope;
- alarm/fault code exactly as printed;
- supported claim in concise original wording;
- source registry ID;
- document title/number and revision/date;
- official URL;
- licence/reuse evidence and verification status;
- section and printed page;
- PDF page if different;
- applicability notes and exclusions;
- evidence review status and reviewer/date;
- contradictions or unresolved questions.

Do not fabricate missing fields. Use explicit null/unknown values where the schema allows them.

## Prohibited shortcuts

- Do not infer an alarm meaning from a similar model or another manufacturer's equipment.
- Do not treat a portal landing page, search snippet, forum post, AI response, or generic training page as an OEM manual citation.
- Do not invent page numbers, document revisions, firmware compatibility, limits, torque values, wiring details, or calibration settings.
- Do not label a record field-verified because it was copied from a manual.
- Do not mark a source approved merely because its URL is official.
- Do not bypass `knowledge/sources.json` permissions or publication review.
- Do not turn a model-specific claim into a universal rule for an equipment category.

## Required validation

For each proposed knowledge change, test:

- exact model match and wrong-model rejection;
- controller/firmware mismatch handling;
- missing page/section handling;
- source ID exists in the registry;
- source permission and status are acceptable;
- claim-level citation exists;
- reference-only source is not auto-fetched;
- candidate/pending claim is not displayed as verified;
- conflicting revisions remain visible;
- no unsupported numerical settings or safety instructions are introduced.

Run `node scripts/knowledge-audit.mjs --check` after generated report inputs change, or the documented generation command when intentionally updating the report. Run the relevant diagnostic tests as well.

## Required review output

Return a claim-to-source table with exact scope, document revision, section/page, permission state, evidence status, and unresolved limitations. Separate source discovery, permission review, claim review, and field verification. List exact tests run and results; if the source or runtime is inaccessible, say so.
