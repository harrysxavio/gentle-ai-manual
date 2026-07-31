"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const validator = path.resolve(__dirname, "..", "scripts", "validate-voseo.cjs");

function runValidator(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "voseo-test-"));
  const file = path.join(dir, "lesson.md");
  fs.writeFileSync(file, content, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const validLessonV2 = `---
title: "API para principiantes"
manual_contract: lesson-v2
description: "Qué es una API"
content_level: principiante
estimated_minutes: 15
learning_outcome: "Explicar qué es una API"
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

## Respuesta simple

Imagina un mesero en un restaurante.
`;

// RED tests — these MUST fail before the validator exists

test("RED: rejects voseo 'podés' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nPodés usar la herramienta desde PowerShell.\n");
  assert.notEqual(result.status, 0, "Should reject voseo 'podés'");
  assert.match(result.stderr, /voseo/i);
});

test("RED: rejects voseo 'necesitás' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nNecesitás instalar Node.js primero.\n");
  assert.notEqual(result.status, 0, "Should reject voseo 'necesitás'");
});

test("RED: rejects voseo 'hacé' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nHacé clic en el botón.\n");
  assert.notEqual(result.status, 0, "Should reject voseo 'hacé'");
});

test("RED: rejects voseo 'comenzá' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nComenzá por el primer paso.\n");
  assert.notEqual(result.status, 0, "Should reject voseo 'comenzá'");
});

test("RED: rejects voseo 'elegí' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nElegí la opción correcta.\n");
  assert.notEqual(result.status, 0, "Should reject voseo 'elegí'");
});

test("RED: rejects voseo 'comprobá' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nComprobá el resultado.\n");
  assert.notEqual(result.status, 0, "Should reject voseo 'comprobá'");
});

test("RED: accepts neutral 'puedes' and 'elige' in lesson-v2 content", () => {
  const result = runValidator(validLessonV2 + "\nPuedes usar PowerShell. Elige la opción.\n");
  assert.equal(result.status, 0, "Should accept neutral Spanish");
});

test("RED: allows explicit allowlist for legitimate voseo in quotes", () => {
  const content = validLessonV2 + `
\`\`\`powershell
# Some tools use voseo in their messages: "podés continuar"
Write-Output "Operación completada"
\`\`\`
`;
  // Voseo inside code fences should not trigger the check
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should allow voseo inside code fences");
});

test("RED: skips V1 pages (only validates lesson-v2)", () => {
  const v1Content = validLessonV2.replace("lesson-v2", "lesson-v1") + "\nPodés usar la herramienta.\n";
  const result = runValidator(v1Content);
  assert.equal(result.status, 0, "Should not validate voseo on V1 pages");
});
