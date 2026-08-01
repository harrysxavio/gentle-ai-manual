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
content_level: ["beginner"]
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

// P2: reader-visible frontmatter must be scanned for voseo before being stripped

test("RED: rejects voseo in reader-visible frontmatter 'title'", () => {
  const content = validLessonV2.replace('title: "API para principiantes"', 'title: "Elegí una opción"');
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Should reject voseo in frontmatter title");
  assert.match(result.stderr, /title/i);
});

test("RED: rejects voseo in reader-visible frontmatter 'description'", () => {
  const content = validLessonV2.replace('description: "Qué es una API"', 'description: "Podés continuar con la guía"');
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Should reject voseo in frontmatter description");
  assert.match(result.stderr, /description/i);
});

test("RED: rejects voseo in reader-visible frontmatter 'learning_outcome'", () => {
  const content = validLessonV2.replace('learning_outcome: "Explicar qué es una API"', 'learning_outcome: "Configurá la herramienta"');
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Should reject voseo in frontmatter learning_outcome");
  assert.match(result.stderr, /learning_outcome/i);
});

test("RED: accepts neutral Spanish in reader-visible frontmatter", () => {
  const content = validLessonV2
    .replace('title: "API para principiantes"', 'title: "Cómo elegir una opción"')
    .replace('description: "Qué es una API"', 'description: "Puedes continuar con la guía"');
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept neutral frontmatter");
});

// P2: enclitic voseo forms with me/te pronouns

test("RED: rejects enclitic voseo 'guardate' (me)", () => {
  const result = runValidator(validLessonV2 + "\nGuardate una copia del archivo.\n");
  assert.notEqual(result.status, 0, "Should reject enclitic voseo 'guardate'");
});

test("RED: rejects enclitic voseo 'poneme' (me)", () => {
  const result = runValidator(validLessonV2 + "\nPoneme un ejemplo concreto.\n");
  assert.notEqual(result.status, 0, "Should reject enclitic voseo 'poneme'");
});

test("RED: rejects enclitic voseo 'decime' (me)", () => {
  const result = runValidator(validLessonV2 + "\nDecime qué paso sigue.\n");
  assert.notEqual(result.status, 0, "Should reject enclitic voseo 'decime'");
});

test("RED: rejects enclitic voseo 'seguime' (me)", () => {
  const result = runValidator(validLessonV2 + "\nSeguime en este recorrido.\n");
  assert.notEqual(result.status, 0, "Should reject enclitic voseo 'seguime'");
});

test("RED: rejects enclitic voseo 'mostrame' (me)", () => {
  const result = runValidator(validLessonV2 + "\nMostrame el resultado.\n");
  assert.notEqual(result.status, 0, "Should reject enclitic voseo 'mostrame'");
});

// P2: compound enclitic voseo forms (two-pronoun -melo/-telo/-selo forms)

test("RED: rejects compound enclitic voseo 'guardátelo' (te+lo)", () => {
  const result = runValidator(validLessonV2 + "\nGuardátelo en la carpeta de respaldo.\n");
  assert.notEqual(result.status, 0, "Should reject compound enclitic voseo 'guardátelo'");
});

test("RED: rejects compound enclitic voseo 'copiámelo' (me+lo)", () => {
  const result = runValidator(validLessonV2 + "\nCopiámelo al portapapeles.\n");
  assert.notEqual(result.status, 0, "Should reject compound enclitic voseo 'copiámelo'");
});

test("RED: rejects compound enclitic voseo 'decímelo' (me+lo)", () => {
  const result = runValidator(validLessonV2 + "\nDecímelo cuando termines.\n");
  assert.notEqual(result.status, 0, "Should reject compound enclitic voseo 'decímelo'");
});

test("RED: rejects compound enclitic voseo 'hacételo' (te+lo)", () => {
  const result = runValidator(validLessonV2 + "\nHacételo vos mismo.\n");
  assert.notEqual(result.status, 0, "Should reject compound enclitic voseo 'hacételo'");
});

test("RED: rejects compound enclitic voseo 'quedátelo' (te+lo)", () => {
  const result = runValidator(validLessonV2 + "\nQuedátelo si te sirve.\n");
  assert.notEqual(result.status, 0, "Should reject compound enclitic voseo 'quedátelo'");
});

// P2: -se single-pronoun forms are ambiguous with the imperfect subjunctive

test("RED: accepts neutral imperfect subjunctive 'usase' (not voseo)", () => {
  const content = validLessonV2 + "\nEste enfoque sería útil si se usase con cautela.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept neutral 'usase' as imperfect subjunctive");
});

test("RED: accepts neutral imperfect subjunctive 'dejase' (not voseo)", () => {
  const content = validLessonV2 + "\nSi lo dejase así, el sistema perdería datos.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept neutral 'dejase' as imperfect subjunctive");
});

test("RED: accepts neutral imperfect subjunctive 'pensase' (not voseo)", () => {
  const content = validLessonV2 + "\nAunque se pensase lo contrario.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept neutral 'pensase' as imperfect subjunctive");
});
