#!/usr/bin/env node
"use strict";

import { readFileSync, writeFileSync } from "node:fs";

const worker = readFileSync("worker.js", "utf8");
const registry = JSON.parse(readFileSync("knowledge/sources.json", "utf8"));
const faultLibrary = JSON.parse(readFileSync("faults.json", "utf8"));
const manufacturerSources = JSON.parse(readFileSync("knowledge/manufacturer-sources.json", "utf8"));
const manufacturerMatrix = JSON.parse(readFileSync("knowledge/manufacturer-machine-fault-matrix.json", "utf8"));
const oemPlatformIndex = JSON.parse(readFileSync("knowledge/oem-platform-index.json", "utf8"));
const knowledgeMatch = worker.match(/const KNOWLEDGE_FILES = \[([\s\S]*?)\];/);
if (!knowledgeMatch) throw new Error("Could not find Worker KNOWLEDGE_FILES registry.");
const documentPaths = [...knowledgeMatch[1].matchAll(/"([^"]+\.md)"/g)].map(match => match[1]);
if (!documentPaths.length) throw new Error("Worker knowledge document list is empty.");

const documents = documentPaths.map(path => {
  const text = readFileSync(path, "utf8");
  const lines = text.split(/\r?\n/);
  return {
    path,
    lines: lines.length,
    words: (text.match(/\S+/g) || []).length,
    headings: lines.filter(line => /^#{1,4}\s+/.test(line)).length,
    text
  };
});
const faults = Array.isArray(faultLibrary.faults) ? faultLibrary.faults : [];
const equipmentTypes = [...new Set(faults.map(fault => String(fault.equipmentType || "").trim()).filter(Boolean))].sort();
const corpus = documents.map(document => document.text).join("\n").toLocaleLowerCase();
const literalMentioned = equipmentTypes.filter(type => corpus.includes(type.replace(/_/g, " ").toLocaleLowerCase()));
const literalMissing = equipmentTypes.filter(type => !literalMentioned.includes(type));
const causeCount = faults.reduce((count, fault) => count + (Array.isArray(fault.causes) ? fault.causes.length : 0), 0);
const statusCounts = (registry.sources || []).reduce((counts, source) => {
  const status = String(source.status || "missing-status");
  counts[status] = (counts[status] || 0) + 1;
  return counts;
}, {});
const licenseCounts = (registry.sources || []).reduce((counts, source) => {
  const license = String(source.license || "missing-license");
  counts[license] = (counts[license] || 0) + 1;
  return counts;
}, {});
const structuredAlarmIndexCount = faults.filter(fault =>
  Array.isArray(fault.alarmCodes) || Array.isArray(fault.errorCodes)
).length;
const referencePortals = registry.reference_only_portals || [];
const fetchablePortals = referencePortals.filter(portal => portal.fetch_allowed === true).length;
const approvedCount = statusCounts.approved || 0;
const nonApprovedCount = (registry.sources || []).length - approvedCount;
const manufacturerPortalCount = (manufacturerSources.sources || []).length;
const manufacturerProfileCount = (manufacturerMatrix.manufacturerProfiles || []).length;
const manufacturerTemplateCount = (manufacturerMatrix.caseTemplates || []).length;
const oemPlatformCount = (oemPlatformIndex.manufacturers || []).length;
const modelVerifiedPlatformCount = (oemPlatformIndex.manufacturers || []).filter(item => item.evidenceStatus === "model-verified").length;
const fmt = value => Number(value).toLocaleString("en-US");

const report = [
  "# Knowledge Base Audit",
  "",
  "Deterministic inventory of the current repository. This report adds no technical claims or troubleshooting content.",
  "",
  "## Snapshot",
  "",
  "- Worker-referenced Markdown documents: **" + documents.length + "**",
  "- Markdown inventory: **" + fmt(documents.reduce((sum, doc) => sum + doc.lines, 0)) + " lines**, **" + fmt(documents.reduce((sum, doc) => sum + doc.words, 0)) + " whitespace-separated words**, **" + documents.reduce((sum, doc) => sum + doc.headings, 0) + " headings**",
  "- Structured fault records: **" + faults.length + "**",
  "- Distinct equipment-type labels in the fault library: **" + equipmentTypes.length + "**",
  "- Cause entries across fault records: **" + causeCount + "**",
  "- Fault records with an alarmCodes or errorCodes array: **" + structuredAlarmIndexCount + "/" + faults.length + "**",
  "- Chinese/European OEM manufacturer profiles: **" + manufacturerProfileCount + "**",
  "- Structured OEM symptom templates: **" + manufacturerTemplateCount + "**",
  "- Official manufacturer/support portal records: **" + manufacturerPortalCount + "**",
  "- Structured OEM platform index entries: **" + oemPlatformCount + "**; model-verified: **" + modelVerifiedPlatformCount + "**",
  "",
  "## Document inventory",
  "",
  "| Worker-loaded document | Lines | Words | Headings |",
  "|---|---:|---:|---:|",
  ...documents.map(doc => "| " + doc.path + " | " + doc.lines + " | " + fmt(doc.words) + " | " + doc.headings + " |"),
  "",
  "## Source registry and licensing",
  "",
  "- Registry source entries: **" + (registry.sources || []).length + "**",
  "- Source status counts: " + (Object.entries(statusCounts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => status + ": " + count).join(", ") || "none"),
  "- License counts: " + (Object.entries(licenseCounts).sort(([a], [b]) => a.localeCompare(b)).map(([license, count]) => license + ": " + count).join(", ") || "none"),
  "- Reference-only portals: **" + referencePortals.length + "**; permitted for automated fetching by registry: **" + fetchablePortals + "/" + referencePortals.length + "**",
  "- Accepted licenses declared by policy: " + ((registry.policy && registry.policy.accepted_licenses) || []).join(", "),
  "- Human review before knowledge publication required by policy: **" + (registry.policy && registry.policy.require_human_review_before_knowledge_publication === true ? "yes" : "not specified") + "**",
  "",
  "## Literal equipment-name coverage proxy",
  "",
  "- Equipment-type labels literally present in the concatenated Worker-loaded Markdown: **" + literalMentioned.length + "/" + equipmentTypes.length + "**.",
  "- Labels with no literal match: " + (literalMissing.join(", ") || "none") + ".",
  "",
  "This is a conservative string-presence check only. It does not prove that a topic is technically covered when a label is present, or absent when a synonym or different wording is used.",
  "",
  "## Gaps and required review",
  "",
  "1. No structured OEM alarm-code index is present in the fault library. Do not claim manufacturer-specific code matching until code records are sourced and reviewed.",
  "2. " + nonApprovedCount + " source-registry entries are not marked approved (approved count: " + approvedCount + "). Candidate sources must not be treated as approved technical authority.",
  "3. " + literalMissing.length + " equipment labels lack a literal name match in the Worker-loaded documents. Review this list with a subject-matter expert; do not automatically fill the gaps with generated technical content.",
  "4. " + (referencePortals.length - fetchablePortals) + " reference-only portals are not allowlisted for automated fetching. Keep this restriction until reuse permissions are documented in the registry.",
  "",
  "## Manufacturer-specific case coverage and limits",
  "",
  "- The OEM matrix maps " + manufacturerProfileCount + " manufacturer/controller families to official documentation routes and contains " + manufacturerTemplateCount + " structured symptom templates.",
  "- The OEM platform index lists " + oemPlatformCount + " machine builders and component OEMs; " + modelVerifiedPlatformCount + " are model-verified. These entries are discovery routes only until exact model/manual evidence is reviewed.",
  "- These templates are not verified alarm-code definitions. A verified case requires exact model, controller/drive, firmware, manual revision, page/section, supported claim, and human review.",
  "- The " + manufacturerPortalCount + "-entry OEM source-discovery registry is separate from the " + (registry.sources || []).length + " license-tracked research sources above. Its URLs do not prove that a particular fault cause applies.",
  "",
  "## Method and limits",
  "",
  "- The document inventory is derived from the Worker KNOWLEDGE_FILES list, not from every Markdown file in the repository.",
  "- Word counts use whitespace-separated tokens; they are inventory measures, not measures of quality.",
  "- This audit does not validate technical correctness, OEM applicability, or the evidentiary support of every statement.",
  "- No source text is fetched by this script and no new technical content is generated.",
  ""
].join("\n");

const reportPath = "knowledge/KNOWLEDGE-AUDIT-REPORT.md";
if (process.argv.includes("--check")) {
  const committed = readFileSync(reportPath, "utf8");
  if (committed !== report) {
    console.error(reportPath + " is stale. Run: node scripts/knowledge-audit.mjs");
    process.exitCode = 1;
  } else {
    console.log("PASS: " + reportPath + " matches current repository inventory.");
  }
} else {
  writeFileSync(reportPath, report, "utf8");
  console.log("Wrote " + reportPath);
}
