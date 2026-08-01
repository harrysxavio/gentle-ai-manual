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
