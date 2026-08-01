"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const validator = path.resolve(__dirname, "..", "scripts", "validate-v2-contracts.cjs");

function runValidator(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v2-contract-"));
  const file = path.join(dir, "lesson.md");
  fs.writeFileSync(file, content, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const validV2 = `---
title: "API para principiantes"
manual_contract: lesson-v2
description: "Qué es una API"
content_level: ["beginner"]
estimated_minutes: 15
learning_outcome: "Explicar qué es una API con un ejemplo"
canonical_concepts: ["api"]
lesson_terms: ["API"]
persona: producto
learning_resources: ["mdn-web-docs"]
snapshot: none
practice_mode: none
diagram_mode: none
faq_mode: none
source_status: verified
level: 1
estimatedTime: 15 min
---

## Propósito

Una API permite que dos programas se comuniquen.
`;

// RED tests — these MUST fail before the validator is created

test("RED: accepts a valid lesson-v2 fixture", () => {
  const result = runValidator(validV2);
  assert.equal(result.status, 0, "Should accept valid V2 contract");
});

test("RED: rejects lesson-v2 without learning_outcome", () => {
  const bad = validV2.replace('learning_outcome: "Explicar qué es una API con un ejemplo"', "");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject missing learning_outcome");
});

test("RED: rejects lesson-v2 without lesson_terms", () => {
  const bad = validV2.replace('lesson_terms: ["API"]', "");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject missing lesson_terms");
});

test("RED: rejects lesson-v2 with invalid persona ID", () => {
  const bad = validV2.replace("producto", "superheroe");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject unknown persona");
});

test("RED: rejects lesson-v2 with invalid learning resource ID", () => {
  const bad = validV2.replace('"mdn-web-docs"', '"fake-resource-999"');
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject unknown resource");
});

test("RED: rejects lesson-v2 with unknown lesson term (not in glossary)", () => {
  const bad = validV2.replace('"API"', '"TérminoInventadoXYZ123"');
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject unknown term");
});

test("RED: rejects lesson-v2 with invalid practice_mode", () => {
  const bad = validV2.replace("practice_mode: none", "practice_mode: quiz");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject invalid practice_mode");
});

test("RED: rejects lesson-v2 with invalid diagram_mode", () => {
  const bad = validV2.replace("diagram_mode: none", "diagram_mode: svg");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject invalid diagram_mode");
});

test("RED: allows lesson-v2 with practice_mode: none (no exercise required)", () => {
  const result = runValidator(validV2);
  assert.equal(result.status, 0, "Should allow practice_mode: none");
});

test("RED: allows lesson-v2 with diagram_mode: none (no diagram required)", () => {
  const result = runValidator(validV2);
  assert.equal(result.status, 0, "Should allow diagram_mode: none");
});

test("RED: skips V1 pages (only validates lesson-v2)", () => {
  const v1 = validV2.replace("lesson-v2", "lesson-v1").replace('lesson_terms: ["API"]\n', "").replace('persona: producto\n', "").replace('learning_resources: ["mdn-web-docs"]\n', "").replace("practice_mode: none\n", "").replace("diagram_mode: none\n", "").replace("snapshot: none\n", "");
  const result = runValidator(v1);
  assert.equal(result.status, 0, "Should not validate V1 pages");
});

// P2: required list fields must reject empty arrays

test("RED: rejects empty canonical_concepts array", () => {
  const bad = validV2.replace('canonical_concepts: ["api"]', "canonical_concepts: []");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject empty canonical_concepts array");
  assert.match(result.stderr, /canonical_concepts/i);
});

test("RED: rejects empty lesson_terms array", () => {
  const bad = validV2.replace('lesson_terms: ["API"]', "lesson_terms: []");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject empty lesson_terms array");
  assert.match(result.stderr, /lesson_terms/i);
});

test("RED: rejects empty learning_resources array", () => {
  const bad = validV2.replace('learning_resources: ["mdn-web-docs"]', "learning_resources: []");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject empty learning_resources array");
  assert.match(result.stderr, /learning_resources/i);
});

test("RED: rejects empty content_level array", () => {
  const bad = validV2.replace('content_level: ["beginner"]', "content_level: []");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject empty content_level array");
  assert.match(result.stderr, /content_level/i);
});

test("RED: rejects scalar content_level (must be a list)", () => {
  const bad = validV2.replace('content_level: ["beginner"]', "content_level: principiante");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject scalar content_level");
  assert.match(result.stderr, /content_level/i);
});

test("RED: rejects non-string entries inside content_level", () => {
  const bad = validV2.replace('content_level: ["beginner"]', "content_level: [false]");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject non-string content_level entries");
  assert.match(result.stderr, /content_level/i);
});

test("RED: rejects empty-string entries inside content_level", () => {
  const bad = validV2.replace('content_level: ["beginner"]', 'content_level: [""]');
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject empty-string content_level entries");
  assert.match(result.stderr, /content_level/i);
});

test("RED: rejects content_level entries outside the canonical vocabulary", () => {
  const bad = validV2.replace('content_level: ["beginner"]', 'content_level: ["superexperto"]');
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject unknown level vocabulary");
  assert.match(result.stderr, /content_level/i);
});

test("RED: accepts canonical content_level vocabulary (beginner/operator/architect)", () => {
  const content = validV2.replace('content_level: ["beginner"]', 'content_level: ["beginner", "operator"]');
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept canonical level vocabulary");
});

// P2: snapshot must be validated against the canonical compatibility registry

test("RED: rejects unknown snapshot version v999.0.0", () => {
  const bad = validV2.replace("snapshot: none", "snapshot: v999.0.0");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject snapshot not present in versions.yml");
  assert.match(result.stderr, /snapshot/i);
});

test("RED: accepts snapshot version present in the compatibility registry", () => {
  const content = validV2.replace("snapshot: none", "snapshot: 2.2.0");
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept snapshot 2.2.0 from versions.yml");
});

test("RED: accepts snapshot version with 'v' prefix from the compatibility registry", () => {
  const content = validV2.replace("snapshot: none", "snapshot: v2.2.0");
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept normalized snapshot v2.2.0");
});

test("RED: accepts canonical snapshot 2.2.3 from the compatibility registry", () => {
  const content = validV2.replace("snapshot: none", "snapshot: 2.2.3");
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept canonical snapshot 2.2.3");
});

test("RED: still accepts snapshot: none as intentional opt-out", () => {
  const result = runValidator(validV2);
  assert.equal(result.status, 0, "Should accept snapshot: none");
});

// P2: canonical_concepts entries must be non-empty strings

test("RED: rejects non-string entries inside canonical_concepts", () => {
  const bad = validV2.replace('canonical_concepts: ["api"]', "canonical_concepts: [false]");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject non-string canonical_concepts entries");
  assert.match(result.stderr, /canonical_concepts/i);
});

test("RED: rejects empty-string entries inside canonical_concepts", () => {
  const bad = validV2.replace('canonical_concepts: ["api"]', 'canonical_concepts: [""]');
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject empty-string canonical_concepts entries");
  assert.match(result.stderr, /canonical_concepts/i);
});

test("RED: rejects object entries inside canonical_concepts", () => {
  const bad = validV2.replace('canonical_concepts: ["api"]', "canonical_concepts: [{id: 1}]");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject object canonical_concepts entries");
  assert.match(result.stderr, /canonical_concepts/i);
});

// P2: snapshots for every registered component

test("RED: accepts OpenCode snapshot version from the registry", () => {
  const content = validV2.replace("snapshot: none", "snapshot: 1.17.20");
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept OpenCode 1.17.20 from versions.yml");
});

test("RED: accepts Codex snapshot version from the registry", () => {
  const content = validV2.replace("snapshot: none", "snapshot: 0.144.0");
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept Codex 0.144.0 from versions.yml");
});

test("RED: accepts Engram snapshot version from the registry", () => {
  const content = validV2.replace("snapshot: none", "snapshot: 1.19.0");
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept Engram 1.19.0 from versions.yml");
});

// P2: lesson level must be an integer between 1 and 3 (see MIGRATION.md)

test("RED: rejects level below the documented range", () => {
  const bad = validV2.replace("level: 1", "level: -1");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject level: -1 (documented range is 1-3)");
  assert.match(result.stderr, /level/i);
});

test("RED: rejects level above the documented range", () => {
  const bad = validV2.replace("level: 1", "level: 99");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject level: 99 (documented range is 1-3)");
  assert.match(result.stderr, /level/i);
});

test("RED: accepts level at the boundaries 1 and 3", () => {
  const low = validV2.replace("level: 1", "level: 3");
  const result = runValidator(low);
  assert.equal(result.status, 0, "Should accept level: 3 (upper boundary)");
});

// P2: unverified "latest" versions must not be admitted as snapshots

test("RED: rejects unverified latest version as snapshot (engram 1.20.0)", () => {
  const content = validV2.replace("snapshot: none", "snapshot: 1.20.0");
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Should reject 1.20.0: latest but not yet verified");
  assert.match(result.stderr, /snapshot/i);
});

// P2: estimated_minutes must be a positive integer

test("RED: rejects negative estimated_minutes", () => {
  const bad = validV2.replace("estimated_minutes: 15", "estimated_minutes: -1");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject estimated_minutes: -1");
  assert.match(result.stderr, /estimated_minutes/i);
});

test("RED: rejects zero estimated_minutes", () => {
  const bad = validV2.replace("estimated_minutes: 15", "estimated_minutes: 0");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject estimated_minutes: 0");
  assert.match(result.stderr, /estimated_minutes/i);
});

// P2: source_status must be a non-empty scalar from the supported vocabulary

test("RED: rejects empty-list source_status", () => {
  const bad = validV2.replace("source_status: verified", "source_status: []");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject source_status: []");
  assert.match(result.stderr, /source_status/i);
});

test("RED: rejects empty-object source_status", () => {
  const bad = validV2.replace("source_status: verified", "source_status: {}");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject source_status: {}");
  assert.match(result.stderr, /source_status/i);
});

test("RED: rejects whitespace-only source_status", () => {
  const bad = validV2.replace("source_status: verified", 'source_status: " "');
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject whitespace-only source_status");
  assert.match(result.stderr, /source_status/i);
});

test("RED: rejects unknown source_status vocabulary", () => {
  const bad = validV2.replace("source_status: verified", "source_status: pendiente");
  const result = runValidator(bad);
  assert.notEqual(result.status, 0, "Should reject non-canonical source_status");
  assert.match(result.stderr, /source_status/i);
});

// P2: learning-resources.yml records must be complete and unique. The catalog
// loader reduces every record to its ID; a malformed record (missing required
// fields) or a duplicate ID must fail the aggregate check.

function runCatalogFixture(catalogContent) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v2-catalog-"));
  const file = path.join(dir, "lesson.md");
  fs.writeFileSync(file, validV2, "utf8");
  const catalog = path.join(dir, "learning-resources.yml");
  fs.writeFileSync(catalog, catalogContent, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, "--resources", catalog, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const completeCatalog = [
  "resources:",
  "  - id: mdn-web-docs",
  "    title: MDN Web Docs",
  "    url: https://developer.mozilla.org/",
  "    type: documentacion",
  "    language: es",
  "    access: gratuito",
  "    provider: Mozilla",
  "    topics: [html, css, javascript, web, api]",
  "    level: [principiante, intermedio, avanzado]",
  "    purpose: referencia tecnica autorizada",
  '    verified_at: "2026-07-31"',
  "    status: activo",
  "    scope: learning",
].join("\n");

test("RED: accepts a complete learning-resources catalog", () => {
  const result = runCatalogFixture(completeCatalog);
  assert.equal(result.status, 0, "Should accept a complete catalog");
});

test("RED: rejects a catalog record missing required fields", () => {
  const bad = ["resources:", "  - id: mdn-web-docs", "    url: https://example.com/"].join("\n");
  const result = runCatalogFixture(bad);
  assert.notEqual(result.status, 0, "Missing title/verified_at/status must fail");
  assert.match(result.stderr, /missing required field/);
});

test("RED: rejects duplicate resource ids", () => {
  const dup = [completeCatalog, "  - id: mdn-web-docs", "    title: Otro", "    url: https://otro.example/", '    verified_at: "2026-07-31"', "    status: activo"].join("\n");
  const result = runCatalogFixture(dup);
  assert.notEqual(result.status, 0, "Duplicate ids must fail");
  assert.match(result.stderr, /duplicate resource id/);
});

// P2: the catalog must be validated eagerly, even when the repository has no
// lesson-v2 pages yet (currently none exist).

function runCatalogOnlyFixture(catalogContent) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v2-catalog-only-"));
  const file = path.join(dir, "reference.md");
  fs.writeFileSync(file, "# Referencia sin contrato V2\n", "utf8");
  const catalog = path.join(dir, "learning-resources.yml");
  fs.writeFileSync(catalog, catalogContent, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, "--resources", catalog, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test("RED: rejects a malformed catalog even without lesson-v2 pages", () => {
  const bad = ["resources:", "  - id: mdn-web-docs", "    url: https://example.com/"].join("\n");
  const result = runCatalogOnlyFixture(bad);
  assert.notEqual(result.status, 0, "Catalog errors must not depend on lesson-v2 migration");
  assert.match(result.stderr, /missing required field/);
});

// P2: a missing catalog is a validation error, and the complete documented
// record schema (MIGRATION.md) must be enforced.

test("RED: rejects a missing resource catalog", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v2-catalog-missing-"));
  const file = path.join(dir, "reference.md");
  fs.writeFileSync(file, "# Referencia sin contrato V2\n", "utf8");
  const missing = path.join(dir, "no-such-catalog.yml");
  const result = cp.spawnSync(process.execPath, [validator, "--resources", missing, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  assert.notEqual(result.status, 0, "A missing mandatory catalog must fail, not warn");
});

test("RED: rejects a catalog record missing documented schema fields", () => {
  const partial = [
    "resources:",
    "  - id: mdn-web-docs",
    "    title: MDN Web Docs",
    "    url: https://developer.mozilla.org/",
    '    verified_at: "2026-07-31"',
    "    status: activo",
  ].join("\n");
  const result = runCatalogOnlyFixture(partial);
  assert.notEqual(result.status, 0, "type/language/access/provider/topics/level/purpose/scope are documented as required");
  assert.match(result.stderr, /missing required field/);
});

// P2: personas.yml records must follow the documented schema (MIGRATION.md)
// with unique ids, and the catalog must be validated eagerly.

const completePersonas = [
  "personas:",
  "  - id: administracion",
  "    nombre: Camila",
  "    perfil: administrativa",
  "    contexto: gestiona tareas",
  "    problemas_tipicos:",
  "      - organizar informacion",
  "    restricciones:",
  "      - no programa",
  "    herramientas: [Windows, Excel]",
  "    nivel_tecnico: principiante",
].join("\n");

function runPersonasFixture(personasContent) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v2-personas-"));
  const file = path.join(dir, "reference.md");
  fs.writeFileSync(file, "# Referencia sin contrato V2\n", "utf8");
  const personas = path.join(dir, "personas.yml");
  fs.writeFileSync(personas, personasContent, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, "--personas", personas, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test("RED: accepts a complete personas catalog", () => {
  const result = runPersonasFixture(completePersonas);
  assert.equal(result.status, 0, "Should accept a complete personas catalog");
});

test("RED: rejects a persona missing documented fields", () => {
  const bad = ["personas:", "  - id: administracion", "    nombre: Camila"].join("\n");
  const result = runPersonasFixture(bad);
  assert.notEqual(result.status, 0, "perfil/contexto/problemas_tipicos/restricciones/herramientas/nivel_tecnico are required");
  assert.match(result.stderr, /missing required field/);
});

test("RED: rejects duplicate persona ids", () => {
  const dup = [completePersonas, "  - id: administracion", "    nombre: Otra", "    perfil: tecnica", "    contexto: otro", "    problemas_tipicos:", "      - x", "    restricciones:", "      - y", "    herramientas: [VSCode]", "    nivel_tecnico: avanzado"].join("\n");
  const result = runPersonasFixture(dup);
  assert.notEqual(result.status, 0, "Duplicate persona ids must fail");
  assert.match(result.stderr, /duplicate persona id/);
});

test("RED: rejects a missing personas catalog", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v2-personas-missing-"));
  const file = path.join(dir, "reference.md");
  fs.writeFileSync(file, "# Referencia sin contrato V2\n", "utf8");
  const missing = path.join(dir, "no-such-personas.yml");
  const result = cp.spawnSync(process.execPath, [validator, "--personas", missing, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  assert.notEqual(result.status, 0, "A missing mandatory personas catalog must fail, not warn");
});

// P2: an empty mandatory catalog must fail like a missing one.

test("RED: rejects an empty personas catalog", () => {
  const result = runPersonasFixture("personas: []\n");
  assert.notEqual(result.status, 0, "An empty persona bank bypasses the missing-catalog protection");
  assert.match(result.stderr, /empty/);
});

test("RED: rejects an empty learning-resources catalog", () => {
  const result = runCatalogOnlyFixture("resources: []\n");
  assert.notEqual(result.status, 0, "An empty resource catalog bypasses the missing-catalog protection");
  assert.match(result.stderr, /empty/);
});
