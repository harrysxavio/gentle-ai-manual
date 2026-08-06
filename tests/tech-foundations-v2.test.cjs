// tests/tech-foundations-v2.test.cjs
// RED/GREEN de contrato para el módulo 01-fundamentos-tecnologicos (PR 9).
// Las 5 páginas objetivo deben ser lesson-v2 válidas según
// scripts/validate-v2-contracts.cjs: frontmatter completo (16 campos +
// source_status), referencias cruzadas a catálogos (personas, recursos,
// glosario, versiones) y vocabularios de modos admitidos. Hoy (V1 sin
// manual_contract) este test falla (RED); tras la reescritura debe pasar
// (GREEN). También garantiza que los slugs de URL no cambian y que cada
// página tiene un único H1 visible (título no duplicado).
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "src", "content", "docs");

const TARGET_PAGES = [
  "01-fundamentos-tecnologicos/01-como-funciona-una-computadora.md",
  "01-fundamentos-tecnologicos/02-la-terminal.md",
  "01-fundamentos-tecnologicos/03-programacion.md",
  "01-fundamentos-tecnologicos/04-frontend-backend.md",
  "01-fundamentos-tecnologicos/05-bases-de-datos.md",
];

const REQUIRED_FIELDS = [
  "title", "manual_contract", "description", "content_level",
  "estimated_minutes", "learning_outcome", "canonical_concepts",
  "lesson_terms", "persona", "learning_resources", "snapshot",
  "faq_mode", "practice_mode", "diagram_mode", "level", "estimatedTime",
];

// Mismos dominios que scripts/validate-v2-contracts.cjs
const VALID_MODES = {
  practice_mode: new Set(["guided", "none"]),
  diagram_mode: new Set(["mermaid", "none"]),
  faq_mode: new Set(["faq", "none"]),
  source_status: new Set(["verified"]),
};
const VALID_CONTENT_LEVELS = new Set(["beginner", "operator", "architect"]);

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseFrontmatter(file) {
  const text = stripBom(fs.readFileSync(file, "utf8"));
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!m) return null;
  return yaml.load(m[1]);
}

function loadYaml(rel) {
  return yaml.load(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

// Normalización de versiones X.Y.Z (misma que el validador canónico)
function normalizeVersion(value) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/^v/i, "").trim();
  return /^\d+\.\d+\.\d+$/.test(normalized) ? normalized : null;
}

function getAdmittedVersions() {
  const raw = loadYaml("data/compatibility/versions.yml");
  const versions = new Set();
  for (const component of raw.components || []) {
    const n = normalizeVersion(component.version_verified);
    if (n) versions.add(n);
  }
  for (const row of raw.compatibility_matrix || []) {
    for (const value of Object.values(row)) {
      const n = normalizeVersion(value);
      if (n) versions.add(n);
    }
  }
  return versions;
}

// Canonical data sets
const personas = new Set((loadYaml("data/resources/personas.yml").personas || []).map((r) => r.id));
const resources = new Set((loadYaml("data/resources/learning-resources.yml").resources || []).map((r) => r.id));
const glossary = new Set((loadYaml("data/terminology/glossary.yml").terms || []).map((r) => r.term));
const admittedVersions = getAdmittedVersions();

function validatePage(rel) {
  const file = path.join(DOCS, rel);
  const errors = [];
  if (!fs.existsSync(file)) return [`${rel}: file not found`];
  const text = stripBom(fs.readFileSync(file, "utf8"));
  const meta = parseFrontmatter(file);
  if (!meta) return [`${rel}: malformed frontmatter`];

  if (meta.manual_contract !== "lesson-v2") {
    errors.push(`${rel}: expected manual_contract=lesson-v2, got ${JSON.stringify(meta.manual_contract)}`);
    return errors; // stop early: no aplica contrato V2 aún
  }

  for (const field of REQUIRED_FIELDS) {
    const val = meta[field];
    if (val === undefined || val === null || val === false || val === 0) {
      errors.push(`${rel}: missing required field '${field}'`);
    } else if (val === "" || (typeof val === "string" && val.trim() === "")) {
      errors.push(`${rel}: required field '${field}' is empty`);
    }
  }

  if (!VALID_MODES.source_status.has(meta.source_status)) {
    errors.push(`${rel}: source_status must be one of [${[...VALID_MODES.source_status].join(", ")}]`);
  }

  if (!Array.isArray(meta.content_level) || meta.content_level.length === 0) {
    errors.push(`${rel}: content_level must be a non-empty list`);
  } else {
    if (!meta.content_level.includes("beginner")) errors.push(`${rel}: content_level must include 'beginner'`);
    for (const entry of meta.content_level) {
      if (!VALID_CONTENT_LEVELS.has(entry)) {
        errors.push(`${rel}: content_level entry '${entry}' not allowed`);
      }
    }
  }

  for (const mode of ["faq_mode", "practice_mode", "diagram_mode"]) {
    const val = meta[mode];
    if (!VALID_MODES[mode].has(val)) {
      errors.push(`${rel}: ${mode} must be one of [${[...VALID_MODES[mode]].join(", ")}], got ${JSON.stringify(val)}`);
    }
  }

  for (const listField of ["canonical_concepts", "lesson_terms", "learning_resources"]) {
    const arr = meta[listField];
    if (!Array.isArray(arr) || arr.length === 0) {
      errors.push(`${rel}: ${listField} must be a non-empty list`);
    }
  }
  if (Array.isArray(meta.lesson_terms)) {
    for (const term of meta.lesson_terms) {
      if (!glossary.has(term)) errors.push(`${rel}: lesson term '${term}' not found in glossary.yml`);
    }
  }
  if (Array.isArray(meta.learning_resources)) {
    for (const rid of meta.learning_resources) {
      if (!resources.has(rid)) errors.push(`${rel}: resource '${rid}' not found in learning-resources.yml`);
    }
  }
  if (meta.persona !== "none" && !personas.has(meta.persona)) {
    errors.push(`${rel}: persona '${meta.persona}' not found in personas.yml`);
  }
  if (meta.snapshot !== "none" && meta.snapshot !== undefined && meta.snapshot !== null) {
    const n = normalizeVersion(meta.snapshot);
    if (!n || !admittedVersions.has(n)) {
      errors.push(`${rel}: snapshot '${meta.snapshot}' not in admitted versions`);
    }
  }
  if (typeof meta.learning_outcome !== "string" || meta.learning_outcome.trim() === "") {
    errors.push(`${rel}: learning_outcome must be a non-empty string`);
  }
  if (!Number.isInteger(meta.estimated_minutes) || meta.estimated_minutes <= 0) {
    errors.push(`${rel}: estimated_minutes must be a positive integer`);
  }
  if (!Number.isInteger(meta.level) || meta.level < 1 || meta.level > 3) {
    errors.push(`${rel}: level must be an integer 1..3`);
  }
  if (typeof meta.estimatedTime !== "string" || meta.estimatedTime.trim() === "") {
    errors.push(`${rel}: estimatedTime must be a non-empty string`);
  }

  // Título visible único: Starlight renderiza el H1 desde el frontmatter title,
  // así que el cuerpo NO debe tener ningún H1 (evitar dos H1 visibles).
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  const h1s = body.match(/^#\s+.+$/gm) || [];
  if (h1s.length !== 0) errors.push(`${rel}: expected zero H1 in the body (Starlight renders the title), found ${h1s.length}`);

  return errors;
}

test("PR 9: las 5 páginas de fundamentos tecnológicos son lesson-v2 válidas", () => {
  const all = [];
  for (const rel of TARGET_PAGES) {
    all.push(...validatePage(rel));
  }
  assert.deepEqual(all, [], "Errores de contrato V2:\n" + all.join("\n"));
});

test("PR 9: los slugs de URL de las 5 páginas permanecen estables", () => {
  // La matriz URL→fase y el currículo exigen URLs estables; el archivo .md
  // debe seguir en el mismo directorio y el slug no cambia.
  const curriculum = fs.readFileSync(path.join(ROOT, "src", "data", "curriculum.mjs"), "utf8");
  const slugs = [
    "01-fundamentos-tecnologicos/01-como-funciona-una-computadora",
    "01-fundamentos-tecnologicos/02-la-terminal",
    "01-fundamentos-tecnologicos/03-programacion",
    "01-fundamentos-tecnologicos/04-frontend-backend",
    "01-fundamentos-tecnologicos/05-bases-de-datos",
  ];
  for (const slug of slugs) {
    assert.ok(curriculum.includes(slug), `curriculum.mjs debe contener el slug estable '${slug}'`);
  }
});