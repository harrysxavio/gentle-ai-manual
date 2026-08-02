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
let resourcesPathOverride = null;
let personasPathOverride = null;
let catalogErrors = null;
let personaErrors = null;

// Normalize a snapshot value to the canonical version format (X.Y.Z without
// leading "v"). "v2.2.3" and "2.2.3" are the same canonical version.
function normalizeVersion(value) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/^v/i, "").trim();
  return /^\d+\.\d+\.\d+$/.test(normalized) ? normalized : null;
}

// Required fields for every persona record, documented in MIGRATION.md.
// Scalar fields must be non-empty strings; the list fields must be non-empty
// lists of strings. Duplicate ids would make lesson references ambiguous.
const PERSONA_SCALAR_FIELDS = ["nombre", "perfil", "contexto", "nivel_tecnico"];
const PERSONA_LIST_FIELDS = ["problemas_tipicos", "restricciones", "herramientas"];

function getPersonaIds() {
  if (personaIds) return personaIds;
  const personasPath = personasPathOverride || PERSONAS_PATH;
  if (!fs.existsSync(personasPath)) {
    personaErrors = [`personas.yml: mandatory catalog not found at ${personasPath}`];
    personaIds = new Set();
    return personaIds;
  }
  const raw = yaml.load(fs.readFileSync(personasPath, "utf8"));
  const records = raw.personas || [];
  const ids = new Set();
  personaErrors = [];
  if (records.length === 0) {
    personaErrors.push("personas.yml: mandatory persona catalog is empty");
  }
  for (const record of records) {
    const id = record && record.id;
    if (typeof id !== "string" || id.trim() === "") {
      personaErrors.push("personas.yml: every persona record must have a non-empty string 'id'");
      continue;
    }
    if (ids.has(id)) {
      personaErrors.push(`personas.yml: duplicate persona id '${id}'`);
    }
    ids.add(id);
    for (const field of PERSONA_SCALAR_FIELDS) {
      const value = record[field];
      if (typeof value !== "string" || value.trim() === "") {
        personaErrors.push(`personas.yml: persona '${id}' missing required field '${field}'`);
      }
    }
    for (const field of PERSONA_LIST_FIELDS) {
      const value = record[field];
      if (!Array.isArray(value) || value.length === 0 || value.some((e) => typeof e !== "string" || e.trim() === "")) {
        personaErrors.push(`personas.yml: persona '${id}' missing required field '${field}'`);
      }
    }
  }
  personaIds = ids;
  return personaIds;
}

// Required fields for every learning-resource record. MIGRATION.md documents
// the complete schema: id, title, url, type, language, access, provider,
// topics, level, purpose, verified_at, status, scope. Scalar fields must be
// non-empty strings; topics and level are non-empty string lists. A record
// that loses any documented field would silently degrade the catalog.
const RESOURCE_SCALAR_FIELDS = [
  "title", "url", "type", "language", "access", "provider",
  "purpose", "verified_at", "status", "scope",
];
const RESOURCE_LIST_FIELDS = ["topics", "level"];

// verified_at accepts a valid Date produced by js-yaml (an unquoted YAML
// timestamp such as `verified_at: 2026-07-31`) or a string that is EXACTLY a
// real calendar date in YYYY-MM-DD format. Dates are normalized to ISO
// YYYY-MM-DD before being validated or compared. null, empty strings,
// booleans, numbers, invalid dates, free text and out-of-range components
// ("2026-99-99") are rejected, and the UTC round-trip rejects impossible
// calendar dates ("2026-02-30") that `new Date(value)` would silently
// normalize. This mirrors the claims validator, which accepts either form
// for the same field.
const VERIFIED_AT_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function normalizeVerifiedAt(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = VERIFIED_AT_DATE_PATTERN.exec(trimmed);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return trimmed;
}

function getResourceIds() {
  if (resourceIds) return resourceIds;
  const resourcesPath = resourcesPathOverride || RESOURCES_PATH;
  if (!fs.existsSync(resourcesPath)) {
    // The catalog is mandatory: its complete loss must fail the aggregate
    // check, not degrade to a warning (the repository currently has no
    // lesson-v2 pages, so lesson validation alone would not catch it).
    catalogErrors = [`learning-resources.yml: mandatory catalog not found at ${resourcesPath}`];
    resourceIds = new Set();
    return resourceIds;
  }
  const raw = yaml.load(fs.readFileSync(resourcesPath, "utf8"));
  const records = raw.resources || [];
  const ids = new Set();
  catalogErrors = [];
  if (records.length === 0) {
    catalogErrors.push("learning-resources.yml: mandatory resource catalog is empty");
  }
  for (const record of records) {
    const id = record && record.id;
    if (typeof id !== "string" || id.trim() === "") {
      catalogErrors.push("learning-resources.yml: every resource record must have a non-empty string 'id'");
      continue;
    }
    if (ids.has(id)) {
      catalogErrors.push(`learning-resources.yml: duplicate resource id '${id}'`);
    }
    ids.add(id);
    for (const field of RESOURCE_SCALAR_FIELDS) {
      const value = record[field];
      const valid =
        field === "verified_at"
          ? normalizeVerifiedAt(value) !== null
          : typeof value === "string" && value.trim() !== "";
      if (!valid) {
        catalogErrors.push(`learning-resources.yml: resource '${id}' missing required field '${field}'`);
      }
    }
    for (const field of RESOURCE_LIST_FIELDS) {
      const value = record[field];
      if (!Array.isArray(value) || value.length === 0 || value.some((e) => typeof e !== "string" || e.trim() === "")) {
        catalogErrors.push(`learning-resources.yml: resource '${id}' missing required field '${field}'`);
      }
    }
  }
  resourceIds = ids;
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

// Admitted versions come from the canonical compatibility registry.
// Only EXPLICITLY VERIFIED versions are accepted: each registered component's
// `version_verified` and every version-valued column in the compatibility
// matrix. `latest` is deliberately NOT admitted — an unverified update (for
// example engram 1.20.0) must not become a valid lesson snapshot, otherwise
// the validator would contradict the V2 contract's verified-snapshot
// guarantee. Lessons may snapshot any component they document (Gentle-AI,
// OpenCode, Codex, Engram, GGA, Node.js, ...) with a registry-backed version.
function getAdmittedVersions() {
  if (gentleAiVersions) return gentleAiVersions;
  if (!fs.existsSync(VERSIONS_PATH)) {
    console.error("Warning: versions file not found at", VERSIONS_PATH);
    gentleAiVersions = new Set();
    return gentleAiVersions;
  }
  const raw = yaml.load(fs.readFileSync(VERSIONS_PATH, "utf8"));
  const versions = new Set();
  for (const component of raw.components || []) {
    if (component.version_verified && normalizeVersion(component.version_verified)) {
      versions.add(normalizeVersion(component.version_verified));
    }
  }
  for (const row of raw.compatibility_matrix || []) {
    for (const value of Object.values(row)) {
      if (typeof value === "string" && normalizeVersion(value)) {
        versions.add(normalizeVersion(value));
      }
    }
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

// Canonical level vocabulary (see .opencode/skills/writing-gentle-manual-content/audience-levels.md)
const VALID_CONTENT_LEVELS = new Set(["beginner", "operator", "architect"]);

// Canonical source-status vocabulary. `verified` is the only value currently
// used across the manual (V1 and V2); extend here when a new status is
// documented in the editorial policy.
const VALID_SOURCE_STATUS = new Set(["verified"]);

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

  // source_status is also required: non-empty scalar from the canonical
  // vocabulary (truthiness alone would admit [], {} or whitespace strings)
  if (meta.source_status === undefined || meta.source_status === null) {
    errors.push(`${relative}: missing required field 'source_status'`);
  } else if (typeof meta.source_status !== "string" || meta.source_status.trim() === "") {
    errors.push(`${relative}: 'source_status' must be a non-empty string`);
  } else if (!VALID_SOURCE_STATUS.has(meta.source_status)) {
    errors.push(
      `${relative}: 'source_status' value '${meta.source_status}' is not in the canonical vocabulary ` +
        `(${[...VALID_SOURCE_STATUS].join(", ")})`
    );
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
  if (meta.estimated_minutes !== undefined && (typeof meta.estimated_minutes !== "number" || !Number.isInteger(meta.estimated_minutes) || meta.estimated_minutes <= 0)) {
    errors.push(`${relative}: 'estimated_minutes' must be a positive integer`);
  }
  if (meta.level !== undefined && (typeof meta.level !== "number" || !Number.isInteger(meta.level))) {
    errors.push(`${relative}: 'level' must be an integer between 1 and 3`);
  } else if (meta.level !== undefined && (meta.level < 1 || meta.level > 3)) {
    errors.push(`${relative}: 'level' must be between 1 and 3 (documented range in MIGRATION.md)`);
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

  // Each content_level entry must be a non-empty string from the canonical vocabulary
  if (Array.isArray(meta.content_level)) {
    for (const entry of meta.content_level) {
      if (typeof entry !== "string" || entry.trim() === "") {
        errors.push(`${relative}: 'content_level' entries must be non-empty strings`);
      } else if (!VALID_CONTENT_LEVELS.has(entry)) {
        errors.push(
          `${relative}: 'content_level' entry '${entry}' is not in the canonical vocabulary ` +
          `(${[...VALID_CONTENT_LEVELS].join(", ")})`
        );
      }
    }
  }

  // Each canonical_concepts entry must be a non-empty string (usable concept identifier)
  if (Array.isArray(meta.canonical_concepts)) {
    for (const entry of meta.canonical_concepts) {
      if (typeof entry !== "string" || entry.trim() === "") {
        errors.push(`${relative}: 'canonical_concepts' entries must be non-empty strings`);
      }
    }
  }

  // Snapshot must be `none` or a version admitted by the canonical registry
  if (meta.snapshot !== undefined && meta.snapshot !== null && meta.snapshot !== "none") {
    const normalized = normalizeVersion(meta.snapshot);
    const admitted = getAdmittedVersions();
    if (!normalized || !admitted.has(normalized)) {
      const admittedList = [...admitted].sort().join(", ") || "(registry empty or missing)";
      errors.push(
        `${relative}: snapshot '${meta.snapshot}' is not a verified version — ` +
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
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--resources" && args[i + 1]) {
      resourcesPathOverride = path.resolve(ROOT, args[i + 1]);
      i += 1;
    } else if (args[i] === "--personas" && args[i + 1]) {
      personasPathOverride = path.resolve(ROOT, args[i + 1]);
      i += 1;
    } else {
      positional.push(args[i]);
    }
  }
  if (positional.length) {
    files = positional.map((file) => path.resolve(ROOT, file));
  } else {
    files = walk(path.join(ROOT, "src", "content", "docs"));
  }
  const mdFiles = files.filter((file) => /\.(md|mdx)$/i.test(file) && fs.existsSync(file));
  // Load the catalogs eagerly: records must be validated even when the
  // repository has no lesson-v2 pages yet (validateFile only loads them when
  // a V2 page is found).
  getResourceIds();
  getPersonaIds();
  const errors = mdFiles.flatMap(validateFile);
  if (catalogErrors) errors.push(...catalogErrors);
  if (personaErrors) errors.push(...personaErrors);

  if (errors.length) {
    console.error("V2 contract validation failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`V2 contract validation passed for ${mdFiles.length} file(s).`);
}

main();
