#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const ROOT = process.cwd();

// Load canonical data sources once
const PERSONAS_PATH = path.join(ROOT, "data", "resources", "personas.yml");
const RESOURCES_PATH = path.join(ROOT, "data", "resources", "learning-resources.yml");
const GLOSSARY_PATH = path.join(ROOT, "data", "terminology", "glossary.yml");
const VERSIONS_PATH = path.join(ROOT, "data", "compatibility", "versions.yml");

let personaIds = null;
let resourceIds = null;
let glossaryTerms = null;
let gentleAiVersions = null;

// Normalize a snapshot value to the canonical version format (X.Y.Z without
// leading "v"). "v2.2.3" and "2.2.3" are the same canonical version.
function normalizeVersion(value) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/^v/i, "").trim();
  return /^\d+\.\d+\.\d+$/.test(normalized) ? normalized : null;
}

function getPersonaIds() {
  if (personaIds) return personaIds;
  if (!fs.existsSync(PERSONAS_PATH)) {
    console.error("Warning: personas file not found at", PERSONAS_PATH);
    personaIds = new Set();
    return personaIds;
  }
  const raw = yaml.load(fs.readFileSync(PERSONAS_PATH, "utf8"));
  personaIds = new Set((raw.personas || []).map((p) => p.id));
  return personaIds;
}

function getResourceIds() {
  if (resourceIds) return resourceIds;
  if (!fs.existsSync(RESOURCES_PATH)) {
    console.error("Warning: resources file not found at", RESOURCES_PATH);
    resourceIds = new Set();
    return resourceIds;
  }
  const raw = yaml.load(fs.readFileSync(RESOURCES_PATH, "utf8"));
  resourceIds = new Set((raw.resources || []).map((r) => r.id));
  return resourceIds;
}

function getGlossaryTerms() {
  if (glossaryTerms) return glossaryTerms;
  if (!fs.existsSync(GLOSSARY_PATH)) {
    console.error("Warning: glossary file not found at", GLOSSARY_PATH);
    glossaryTerms = new Set();
    return glossaryTerms;
  }
  const raw = yaml.load(fs.readFileSync(GLOSSARY_PATH, "utf8"));
  glossaryTerms = new Set((raw.terms || []).map((t) => t.term));
  return glossaryTerms;
}

// Admitted Gentle-AI versions come from the canonical compatibility registry.
// Both `version_verified` entries in components and `gentle_ai` rows in the
// compatibility matrix are accepted, so historical snapshots keep validating.
function getGentleAiVersions() {
  if (gentleAiVersions) return gentleAiVersions;
  if (!fs.existsSync(VERSIONS_PATH)) {
    console.error("Warning: versions file not found at", VERSIONS_PATH);
    gentleAiVersions = new Set();
    return gentleAiVersions;
  }
  const raw = yaml.load(fs.readFileSync(VERSIONS_PATH, "utf8"));
  const versions = new Set();
  for (const component of raw.components || []) {
    if (component.name !== "gentle-ai") continue;
    if (component.version_verified) versions.add(component.version_verified);
    if (component.latest) versions.add(component.latest);
  }
  for (const row of raw.compatibility_matrix || []) {
    if (row.gentle_ai) versions.add(row.gentle_ai);
  }
  gentleAiVersions = versions;
  return gentleAiVersions;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end < 0) return null;
  const block = text.slice(4, end);
  try {
    return yaml.load(block) || {};
  } catch (_e) {
    return null;
  }
}

const VALID_MODES = {
  practice_mode: new Set(["guided", "none"]),
  diagram_mode: new Set(["mermaid", "none"]),
  faq_mode: new Set(["faq", "none"]),
};

const REQUIRED_FIELDS = [
  "title",
  "manual_contract",
  "description",
  "content_level",
  "estimated_minutes",
  "learning_outcome",
  "canonical_concepts",
  "lesson_terms",
  "persona",
  "learning_resources",
  "snapshot",
  "faq_mode",
  "practice_mode",
  "diagram_mode",
  "level",
  "estimatedTime",
];

function validateFile(file) {
  const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const text = fs.readFileSync(file, "utf8");
  const meta = parseFrontmatter(text);

  if (!meta) return [];
  if (meta.manual_contract !== "lesson-v2") return [];

  const errors = [];
  const personas = getPersonaIds();
  const resources = getResourceIds();
  const glossary = getGlossaryTerms();

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    const val = meta[field];
    if (val === undefined || val === null || val === false || val === 0) {
      errors.push(`${relative}: missing required field '${field}'`);
    } else if (val === "" || (typeof val === "string" && val.trim() === "")) {
      errors.push(`${relative}: required field '${field}' is empty`);
    }
  }

  // source_status is also required
  if (!meta.source_status) {
    errors.push(`${relative}: missing required field 'source_status'`);
  }

  // Validate persona
  if (meta.persona && meta.persona !== "none" && !personas.has(meta.persona)) {
    errors.push(`${relative}: persona '${meta.persona}' not found in data/resources/personas.yml`);
  }

  // Validate learning resources
  let resourcesList = meta.learning_resources;
  if (resourcesList && Array.isArray(resourcesList)) {
    for (const rid of resourcesList) {
      if (!resources.has(rid)) {
        errors.push(`${relative}: learning resource '${rid}' not found in data/resources/learning-resources.yml`);
      }
    }
  }

  // Validate lesson_terms against glossary
  if (meta.lesson_terms && Array.isArray(meta.lesson_terms)) {
    for (const term of meta.lesson_terms) {
      if (!glossary.has(term)) {
        errors.push(`${relative}: lesson term '${term}' not found in data/terminology/glossary.yml`);
      }
    }
  }

  // Validate types of required fields
  if (meta.estimated_minutes !== undefined && (typeof meta.estimated_minutes !== "number" || !Number.isInteger(meta.estimated_minutes))) {
    errors.push(`${relative}: 'estimated_minutes' must be an integer`);
  }
  if (meta.level !== undefined && (typeof meta.level !== "number" || !Number.isInteger(meta.level))) {
    errors.push(`${relative}: 'level' must be an integer`);
  }
  if (meta.learning_outcome !== undefined && typeof meta.learning_outcome !== "string") {
    errors.push(`${relative}: 'learning_outcome' must be a string`);
  }
  if (meta.estimatedTime !== undefined && typeof meta.estimatedTime !== "string") {
    errors.push(`${relative}: 'estimatedTime' must be a string`);
  }
  if (meta.canonical_concepts !== undefined && !Array.isArray(meta.canonical_concepts)) {
    errors.push(`${relative}: 'canonical_concepts' must be an array`);
  }
  if (meta.lesson_terms !== undefined && !Array.isArray(meta.lesson_terms)) {
    errors.push(`${relative}: 'lesson_terms' must be an array`);
  }
  if (meta.learning_resources !== undefined && !Array.isArray(meta.learning_resources)) {
    errors.push(`${relative}: 'learning_resources' must be an array`);
  }
  if (meta.content_level !== undefined && !Array.isArray(meta.content_level)) {
    errors.push(`${relative}: 'content_level' must be an array of levels`);
  }

  // Required list fields must be non-empty (type AND length, not truthiness)
  const requiredListFields = ["content_level", "canonical_concepts", "lesson_terms", "learning_resources"];
  for (const field of requiredListFields) {
    const val = meta[field];
    if (Array.isArray(val) && val.length === 0) {
      errors.push(`${relative}: required list field '${field}' must not be empty`);
    }
  }

  // Snapshot must be `none` or a version admitted by the canonical registry
  if (meta.snapshot !== undefined && meta.snapshot !== null && meta.snapshot !== "none") {
    const normalized = normalizeVersion(meta.snapshot);
    const admitted = getGentleAiVersions();
    if (!normalized || !admitted.has(normalized)) {
      const admittedList = [...admitted].sort().join(", ") || "(registry empty or missing)";
      errors.push(
        `${relative}: snapshot '${meta.snapshot}' is not a verified Gentle-AI version — ` +
        `admitted versions: ${admittedList} (canonical file: data/compatibility/versions.yml)`
      );
    }
  }

  // Validate mode enums
  for (const [field, valid] of Object.entries(VALID_MODES)) {
    if (meta[field] && !valid.has(meta[field])) {
      errors.push(`${relative}: '${field}' must be one of ${[...valid].join(", ")}, got '${meta[field]}'`);
    }
  }

  // Validate canonical_concepts is an array
  if (meta.canonical_concepts && !Array.isArray(meta.canonical_concepts)) {
    errors.push(`${relative}: 'canonical_concepts' must be an array`);
  }

  // Validate lesson_terms is an array
  if (meta.lesson_terms && !Array.isArray(meta.lesson_terms)) {
    errors.push(`${relative}: 'lesson_terms' must be an array`);
  }

  // Validate learning_resources is an array
  if (meta.learning_resources && !Array.isArray(meta.learning_resources)) {
    errors.push(`${relative}: 'learning_resources' must be an array`);
  }

  return errors;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function main() {
  const args = process.argv.slice(2);
  let files;
  if (args.length) {
    files = args.map((file) => path.resolve(ROOT, file));
  } else {
    files = walk(path.join(ROOT, "src", "content", "docs"));
  }
  const mdFiles = files.filter((file) => /\.(md|mdx)$/i.test(file) && fs.existsSync(file));
  const errors = mdFiles.flatMap(validateFile);

  if (errors.length) {
    console.error("V2 contract validation failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`V2 contract validation passed for ${mdFiles.length} file(s).`);
}

main();
