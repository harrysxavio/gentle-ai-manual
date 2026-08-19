"use strict";

// RED/GREEN: precision fixes distilled from the PR #19 review findings.
//   - Lesson 03: the SHELL (not the terminal) reads environment variables
//     when it launches a program.
//   - Lesson 05: a column is an attribute WITH A TYPE (it is not "the type");
//     the primary key is a DESIGN DECISION.
//   - Lesson 04: CLI/TUI are interaction modalities, not product classes.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos");

test("RED: lesson 03 says the SHELL reads environment variables", () => {
  const content = fs.readFileSync(path.join(DIR, "03-programacion.md"), "utf8");
  assert.match(
    content,
    /(el shell|un shell|PowerShell|Bash)[\s\S]{0,250}lee[\s\S]{0,180}variables de entorno/i,
    "lesson 03 must say the shell reads env vars when launching a program",
  );
});

test("RED: lesson 05 defines a column as an attribute with a type", () => {
  const content = fs.readFileSync(path.join(DIR, "05-bases-de-datos.md"), "utf8");
  assert.match(
    content,
    /columna[\s\S]{0,180}atributo[\s\S]{0,80}(tipo|texto|número|entero|fecha)/i,
    "lesson 05 must define a column as an attribute with a type",
  );
  assert.doesNotMatch(content, /la columna es tipo/i, "lesson 05 must not claim the column IS the type");
});

test("RED: lesson 05 presents the primary key as a design decision", () => {
  const content = fs.readFileSync(path.join(DIR, "05-bases-de-datos.md"), "utf8");
  assert.match(
    content,
    /clave primaria[\s\S]{0,200}(decisión|se elige|elegir|escoger)/i,
    "lesson 05 must present the primary key as a design decision",
  );
});

test("RED: lesson 04 presents CLI and TUI by interaction modality", () => {
  const content = fs.readFileSync(path.join(DIR, "04-frontend-backend.md"), "utf8");
  assert.match(content, /modalidad/i, "lesson 04 must use the concept of interaction modality");
});