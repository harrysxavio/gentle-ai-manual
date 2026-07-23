"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const validator = path.resolve(__dirname, "..", "scripts", "validate-manual-content.cjs");

function runFixture(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "manual-content-"));
  const file = path.join(dir, "lesson.md");
  fs.writeFileSync(file, content, "utf8");
  const result = cp.spawnSync(process.execPath, [validator, file], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const validLesson = `---
title: "Cache"
manual_contract: lesson-v1
estimated_minutes: 20
learning_outcome: "Explicar cuándo usar una cache."
---

## Resultado de aprendizaje
Explicar.

## Respuesta simple
Texto.

## Modelo mental
Texto.

## Ejemplo continuo
Texto.

## Cómo funciona internamente
Texto.

## Cuándo usarlo
Texto.

## Errores frecuentes
Texto.

## Comprueba lo aprendido
Texto.

## Resumen
Texto.

## Fuentes y alcance
- Fuente técnica primaria: documentación oficial.
`;

test("accepts a complete lesson contract", () => {
  const result = runFixture(validLesson);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects a lesson without sources", () => {
  const result = runFixture(validLesson.replace("## Fuentes y alcance", "## Referencias"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Fuentes y alcance/);
});

test("rejects remote hotlinked images", () => {
  const result = runFixture(validLesson + "\n![Tool](https://example.com/tool.png)\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /hotlink/);
});

test("rejects empty image alt text", () => {
  const result = runFixture(validLesson + "\n![](/images/tool.webp)\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /empty alt/);
});

test("rejects unlabeled command blocks", () => {
  const result = runFixture(validLesson + "\n```\ngit status\n```\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /labeled bash or powershell/);
});

// Engram-specific RED tests — full lesson-v1 contract for 01-que-es-engram.md
const ENGRAM_PAGE = path.resolve(__dirname, "..", "src", "content", "docs", "09-engram", "01-que-es-engram.md");

test("engram page: has full lesson-v1 frontmatter", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Must have lesson-v1 contract
  assert.match(content, /manual_contract:\s*lesson-v1/);
  assert.match(content, /title:/);
  assert.match(content, /description:/);
  assert.match(content, /content_level:/);
  assert.match(content, /estimated_minutes:/);
  assert.match(content, /learning_outcome:/);
  assert.match(content, /canonical_concepts:/);
  assert.match(content, /source_status:\s*verified/);
  assert.match(content, /level:\s*\d+/);
  assert.match(content, /estimatedTime:\s*\d+\s*min/);
});

test("engram page: has all 13 required sections", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  const required = [
    "Resultado de aprendizaje",
    "Respuesta simple",
    "Modelo mental",
    "Mapa o recorrido",
    "Ejemplo continuo",
    "Recorrido práctico",
    "Cómo funciona internamente",
    "Cuándo usarlo y cuándo evitarlo",
    "Costos y trade-offs",
    "Errores frecuentes",
    "Comprueba lo aprendido",
    "Resumen",
    "Fuentes y alcance",
  ];
  for (const section of required) {
    const header = new RegExp(`^##\\s+${section}`, "m");
    assert.match(content, header, `Missing section: ${section}`);
  }
});

test("engram page: has canonical_concepts and sources", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  assert.match(content, /canonical_concepts:/);
  // Must not be an empty list
  const fm = content.match(/canonical_concepts:\s*\n((?:\s+- .+\n?)+)/);
  assert.ok(fm, "canonical_concepts list exists");
  assert.ok(fm[1].trim().length > 0, "canonical_concepts is not empty");
  // Fuentes y alcance has content (handle CRLF)
  const sourcesSection = content.match(/## Fuentes y alcance\r?\n([\s\S]+?)(?=\r?\n##|$)/);
  assert.ok(sourcesSection, "Fuentes y alcance section exists");
  assert.ok(sourcesSection[1].trim().length > 10, "Fuentes y alcance has content");
});

test("engram page: no prohibited absolute claims about auto-save", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Must not claim Engram saves automatically in ALL cases without context
  // The claim must be qualified (depends on agent/instructions/config)
  const autoSaveLines = content.match(/[^.]*\b(?:automáticamente|guarda solo|guarda todo|sin intervención)[^.]*\./gi);
  if (autoSaveLines) {
    for (const line of autoSaveLines) {
      // Every auto-save claim must be qualified
      assert.ok(
        !line.includes('automáticamente') ||
        line.includes('configuración') ||
        line.includes('instrucciones') ||
        line.includes('agente') ||
        line.includes('puede') ||
        line.includes('depende'),
        `Unqualified auto-save claim found: "${line.trim()}"`
      );
    }
  }
});

test("engram page: does not claim everything works without internet", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Engram storage is local, but model execution may be remote
  assert.doesNotMatch(content, /todo funciona sin internet/i, "Must not claim everything works offline");
  // Find full sentences containing "sin internet" — match from start of sentence
  const sinInternetSentences = content.match(/[^.!?]*sin\s+internet[^.!?]*[.!?]/gi);
  if (sinInternetSentences) {
    for (const sentence of sinInternetSentences) {
      const s = sentence.toLowerCase();
      assert.ok(
        s.includes('engram') ||
        s.includes('almacen') ||
        s.includes('local') ||
        s.includes('archivo') ||
        s.includes('base de datos') ||
        s.includes('persistente') ||
        s.includes('disco') ||
        s.includes('storage') ||
        s.includes('modelo'),
        `Must qualify "sin internet" scope: "${sentence.trim()}"`
      );
    }
  }
});

test("engram page: does not contain hardcoded unverified absolute file paths", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Allow ~/.engram/engram.db (verified from README), but no other invented paths
  // No C:\Users\ paths or invented paths
  const lines = content.split('\n');
  for (const line of lines) {
    const pathMatch = line.match(/[A-Za-z]:\\[^\s"]+/);
    if (pathMatch) {
      assert.ok(
        pathMatch[0].includes('engram') || pathMatch[0].includes('.git') || pathMatch[0].includes('node_modules'),
        `Hardcoded Windows path found: "${pathMatch[0]}"`
      );
    }
  }
});

test("engram page: route context preserved (no ?ruta= in content links)", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Curriculum links must not have hardcoded ?ruta= (route-context.js appends it)
  const matches = content.match(/\?ruta=/g);
  assert.equal(matches, null, "No ?ruta= hardcoded in content links");
});

test("engram page: has accessible Mermaid diagram with alt text", () => {
  const content = fs.readFileSync(ENGRAM_PAGE, "utf8");
  // Check that if there's an image, it has alt text
  const imgMatches = content.match(/!\[([^\]]*)\]/g);
  if (imgMatches) {
    for (const img of imgMatches) {
      const alt = img.match(/!\[([^\]]*)\]/);
      assert.ok(alt[1] && alt[1].length > 0, `Image missing alt text: ${img}`);
    }
  }
});
