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
