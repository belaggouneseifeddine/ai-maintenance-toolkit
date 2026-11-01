#!/usr/bin/env node
"use strict";

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = "agent-skills";
const errors = [];
const directories = readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort();

if (!directories.length) errors.push("No skill directories found under agent-skills/.");

for (const directory of directories) {
  const file = join(root, directory, "SKILL.md");
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    errors.push(`${file}: missing SKILL.md`);
    continue;
  }

  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) {
    errors.push(`${file}: missing valid YAML frontmatter delimiters`);
    continue;
  }

  const name = frontmatter[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  const description = frontmatter[1].match(/^description:\s*(.+?)\s*$/m)?.[1];
  if (!name) errors.push(`${file}: missing or invalid name field`);
  else if (name !== directory) errors.push(`${file}: name "${name}" does not match directory "${directory}"`);
  if (!description) errors.push(`${file}: missing description field`);
  if (source.slice(frontmatter[0].length).trim().length < 200) {
    errors.push(`${file}: instruction body is unexpectedly short`);
  }
}

const config = JSON.parse(readFileSync("skills.sh.json", "utf8"));
if (!Array.isArray(config.paths) || !config.paths.includes("./agent-skills")) {
  errors.push("skills.sh.json must register ./agent-skills in paths.");
}

const bayesian = readFileSync(join(root, "maintenance-bayesian-reasoning", "SKILL.md"), "utf8");
for (const phrase of ["not a calibrated probability", "unknown", "safety"]) {
  if (!bayesian.toLowerCase().includes(phrase)) {
    errors.push(`maintenance-bayesian-reasoning: missing guardrail phrase "${phrase}"`);
  }
}

const oem = readFileSync(join(root, "maintenance-oem-evidence-validation", "SKILL.md"), "utf8");
for (const phrase of ["printed page", "firmware", "permission", "field-verified"]) {
  if (!oem.toLowerCase().includes(phrase)) {
    errors.push(`maintenance-oem-evidence-validation: missing evidence-control phrase "${phrase}"`);
  }
}

if (errors.length) {
  console.error("FAIL: Agent skill validation");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log(`PASS: validated ${directories.length} agent skills, names, descriptions, discovery config, and critical guardrails.`);
}
