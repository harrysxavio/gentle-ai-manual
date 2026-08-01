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

// P2: the frontmatter parser must be YAML-aware so legal YAML formatting
// (quoted keys, indentation) does not make the validator skip a V2 page

test("RED: detects voseo on a V2 page with a quoted YAML key", () => {
  const content = validLessonV2.replace("manual_contract: lesson-v2", '"manual_contract": lesson-v2') + "\nPodés usar la herramienta desde PowerShell.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Should detect voseo even when manual_contract uses a quoted YAML key");
});

// P2: preterite markers must be scoped to the clause containing the verb

test("RED: rejects voseo imperative in a later clause 'Yo terminé mi parte; elegí la opción correcta'", () => {
  const content = validLessonV2 + "\nYo terminé mi parte; elegí la opción correcta.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "A marker in an earlier clause must not suppress a voseo imperative");
});

test("RED: accepts first-person preterite when the marker is in the same clause 'Cuando llegué, yo abrí el archivo'", () => {
  const content = validLessonV2 + "\nCuando llegué, yo abrí el archivo.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Marker in the same clause as the verb is a preterite");
});

// P2: the standalone voseo pronoun must be detected

test("RED: rejects standalone voseo pronoun 'vos'", () => {
  const content = validLessonV2 + "\nSi vos quieres, puedes continuar.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Should reject standalone voseo pronoun 'vos'");
  assert.match(result.stderr, /vos/i);
});

test("RED: accepts 'vosotros' and 'devos' as non-pronoun words", () => {
  const content = validLessonV2 + "\nVosotros usáis otra variante. Devos el mérito.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Boundary-aware 'vos' must not match vosotros/devos");
});

// P2: every occurrence of a stem must be scanned, and optional commas after
// introductory adverbs stay inside the clause

test("RED: rejects a later-clause imperative after an exempted preterite occurrence", () => {
  const content = validLessonV2 + "\nAyer elegí la primera opción; elegí la correcta para continuar.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The second 'elegí' is a voseo imperative despite the first being a preterite");
});

test("RED: accepts a preterite with an optional comma after the marker", () => {
  const content = validLessonV2 + "\nAyer, elegí la primera opción.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Optional comma after the marker must not split the clause");
});

// P2: first-person preterites are not voseo imperatives. Accented -í forms such
// as "elegí", "abrí" or "escribí" are also valid neutral first-person
// preterites ("Ayer elegí la primera opción"). Contextual markers before the
// form (subject pronoun "yo" or past-time adverbs) disambiguate the preterite.

test("RED: accepts first-person preterite 'Ayer elegí la primera opción' (not voseo)", () => {
  const content = validLessonV2 + "\nAyer elegí la primera opción.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept 'Ayer elegí' as first-person preterite");
});

test("RED: accepts first-person preterite 'Yo abrí el archivo' (not voseo)", () => {
  const content = validLessonV2 + "\nYo abrí el archivo y revisé el contenido.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept 'Yo abrí' as first-person preterite");
});

test("RED: accepts first-person preterite 'Yo escribí una nota antes de continuar' (not voseo)", () => {
  const content = validLessonV2 + "\nYo escribí una nota antes de continuar.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Should accept 'Yo escribí' with first-person subject as preterite");
});

test("RED: still rejects instruction 'Elegí la opción correcta' (voseo imperative)", () => {
  const result = runValidator(validLessonV2 + "\nElegí la opción correcta.\n");
  assert.notEqual(result.status, 0, "Should keep rejecting voseo imperative without preterite context");
});

test("RED: rejects voseo imperative even with a sequencing marker 'Antes de continuar, elegí una opción'", () => {
  const content = validLessonV2 + "\nAntes de continuar, elegí una opción.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Sequencing markers do not establish a preterite reading");
});

test("RED: rejects voseo imperative even with a sequencing marker 'Después, abrí el archivo'", () => {
  const content = validLessonV2 + "\nDespués, abrí el archivo.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Sequencing markers do not establish a preterite reading");
});

// P2: markers AFTER the verb must not exempt it when a subordinating
// conjunction separates verb and marker ("Elegí una opción que ya conozcas").

test("RED: rejects imperative with a later marker inside a subordinate clause", () => {
  const content = validLessonV2 + "\nElegí una opción que ya conozcas.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "A later 'ya' in a 'que' clause must not classify 'elegí' as preterite");
});

test("RED: accepts a preterite with a later marker in the same clause", () => {
  const content = validLessonV2 + "\nRecibí tu mensaje anoche.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "A later past-time adverb without a conjunction keeps the preterite reading");
});

// P2: Markdown link destinations must not be scanned as visible prose.

test("RED: accepts a link whose URL contains a scanned stem", () => {
  const content = validLessonV2 + "\nConsulta [la guía](https://example.test/vos/inicio).\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "The URL destination is not reader-visible text");
});

test("RED: still rejects voseo inside a link label", () => {
  const content = validLessonV2 + "\nConsulta [Podés verla](https://example.test/guia).\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The link label IS reader-visible text");
});

// P2: markers inside a preceding subordinate clause must not exempt a later
// imperative ("Si ya terminaste, elegí una opción").

test("RED: rejects imperative with a marker in a preceding conditional clause", () => {
  const content = validLessonV2 + "\nSi ya terminaste, elegí una opción.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The 'ya' belongs to the 'si' premise, not to 'elegí'");
});

// P2: reference-style link definitions are invisible; only the label is text.

test("RED: accepts a reference-style link whose definition URL contains a scanned stem", () => {
  const content = validLessonV2 + "\nConsulta [la guía][manual]\n\n[manual]: https://example.test/vos/inicio\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Reference definitions are not reader-visible text");
});

test("RED: still rejects voseo inside a reference-style link label", () => {
  const content = validLessonV2 + "\nConsulta [Podés verla][manual]\n\n[manual]: https://example.test/guia\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The reference label IS reader-visible text");
});

// P2: all preceding markers must be scanned, not just the first one, and the
// documented 'continuá' forms must be detected.

test("RED: accepts first-person narration with a subordinate marker before the subject", () => {
  const content = validLessonV2 + "\nSi ya había terminado, yo abrí el archivo.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "The main-clause 'yo' must win over the subordinate 'ya'");
});

test("RED: rejects voseo 'continuá' imperative", () => {
  const content = validLessonV2 + "\nContinuá con el siguiente paso.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "'continuá' is listed as voseo to avoid in the editorial skill");
});

test("RED: rejects voseo 'continuás' present form", () => {
  const content = validLessonV2 + "\nContinuás con el siguiente paso.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "'continuás' is the voseo present form");
});

test("RED: accepts neutral 'continúa' form", () => {
  const content = validLessonV2 + "\nContinúa con el siguiente paso.\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "'continúa' is neutral Spanish");
});

// P2: HTML/MDX anchor destinations are invisible, and a subordinate-clause
// "yo" must not exempt a later imperative.

test("RED: accepts an HTML anchor whose href contains a scanned stem", () => {
  const content = validLessonV2 + '\n<a href="https://example.test/vos/inicio">la guía</a>\n';
  const result = runValidator(content);
  assert.equal(result.status, 0, "The href attribute is not reader-visible text");
});

test("RED: still rejects voseo inside an HTML anchor label", () => {
  const content = validLessonV2 + '\n<a href="https://example.test/guia">Podés verla</a>\n';
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The anchor label IS reader-visible text");
});

test("RED: rejects imperative with a subordinate-clause 'yo' before it", () => {
  const content = validLessonV2 + "\nAunque yo terminé mi parte, elegí una opción.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The 'yo' belongs to the 'Aunque' clause, not to 'elegí'");
});

// P2: MDX expression-valued anchor destinations are invisible.

test("RED: accepts an MDX anchor with an expression-valued href", () => {
  const content = validLessonV2 + '\n<a href={"https://example.test/vos/inicio"}>la guía</a>\n';
  const result = runValidator(content);
  assert.equal(result.status, 0, "The JSX expression href is not reader-visible text");
});

test("RED: still rejects voseo inside an MDX anchor label", () => {
  const content = validLessonV2 + '\n<a href={"https://example.test/guia"}>Podés verla</a>\n';
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The MDX anchor label IS reader-visible text");
});

// P2: nonliteral JSX href expressions and multi-line anchors must be stripped
// before scanning; only the rendered label remains.

test("RED: accepts an MDX anchor with a nonliteral href expression", () => {
  const content = validLessonV2 + "\n<a href={routes.vos}>la guía</a>\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "The nonliteral JSX href is not reader-visible text");
});

test("RED: accepts a multi-line MDX anchor with an href destination", () => {
  const content = validLessonV2 + '\n<a\n  href="https://example.test/vos/inicio"\n>\n  la guía\n</a>\n';
  const result = runValidator(content);
  assert.equal(result.status, 0, "Multi-line anchors keep only their visible label");
});

test("RED: still rejects voseo inside a multi-line anchor label", () => {
  const content = validLessonV2 + '\n<a\n  href="https://example.test/guia"\n>\n  Podés verla\n</a>\n';
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The rendered label of a multi-line anchor IS visible text");
});

// P2: non-anchor MDX components pass invisible attributes through; only their
// children are reader-visible.

test("RED: accepts an MDX component with an invisible href attribute", () => {
  const content = validLessonV2 + "\n<Card href={routes.vos}>la guía</Card>\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Component attributes are not reader-visible text");
});

test("RED: still rejects voseo inside an MDX component label", () => {
  const content = validLessonV2 + "\n<Card href={routes.guia}>Podés verla</Card>\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The component children ARE reader-visible text");
});

// P2: self-closing JSX/MDX components carry invisible attributes.

test("RED: accepts a self-closing MDX component with an invisible href", () => {
  const content = validLessonV2 + "\n<Card href={routes.vos} />\n";
  const result = runValidator(content);
  assert.equal(result.status, 0, "Self-closing component attributes are not reader-visible text");
});

test("RED: still rejects voseo in prose following a self-closing component", () => {
  const content = validLessonV2 + "\n<Card href={routes.guia} />\nPodés verla ahora.\n";
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "Prose after the component IS reader-visible text");
});

// P3: line numbers must stay accurate when an anchor's opening tag spans
// lines before its label.

test("RED: reports voseo at the label line of a multi-line anchor", () => {
  const prefix = validLessonV2 + '\n<a\n  href="https://example.test/guia"\n>';
  const label = "Podés verla";
  const content = prefix + "\n" + label + "\n</a>\n";
  const labelLine = content.split("\n").findIndex((l) => l === label) + 1;
  const result = runValidator(content);
  assert.notEqual(result.status, 0, "The label is visible");
  assert.ok(result.stderr.includes(`:${labelLine}:`), `Expected error at line ${labelLine}, got:\n${result.stderr}`);
});
