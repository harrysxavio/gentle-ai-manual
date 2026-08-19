"use strict";

// Regression invariants (must PASS on the current baseline and remain green
// after the rewrite): CLI and TUI are INTERFACES, never "programs"; the
// PowerShell/Bash comparison table covers structural elements (variables and
// exit code); a multiplexer is never described as a shell.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos");
const GLOSSARY = path.join(ROOT, "data", "terminology", "glossary.yml");

test("regression: glossary defines CLI and TUI as interfaces", () => {
  const parsed = yaml.load(fs.readFileSync(GLOSSARY, "utf8"));
  const terms = parsed.terms.filter((t) =>
    ["CLI (Command Line Interface)", "TUI (Text User Interface)"].includes(t.term),
  );
  assert.equal(terms.length, 2, "glossary must contain CLI and TUI entries");
  for (const t of terms) {
    assert.match(t.simple, /interfaz/i, `glossary entry "${t.term}" must describe an interface`);
  }
});

test("regression: lessons 02 and 04 never describe a CLI or TUI as a program", () => {
  for (const file of ["02-la-terminal.md", "04-frontend-backend.md"]) {
    const content = fs.readFileSync(path.join(DIR, file), "utf8");
    assert.doesNotMatch(
      content,
      /(el|la|un|una)\s+(CLI|TUI)[\s\S]{0,60}es un programa/i,
      `${file} must not claim a CLI/TUI is a program`,
    );
  }
});

test("regression: lesson 02 comparison table covers variables and exit code", () => {
  const content = fs.readFileSync(path.join(DIR, "02-la-terminal.md"), "utf8");
  assert.match(content, /Variable de entorno/, "lesson 02 table must cover environment variables");
  assert.match(content, /Código de salida/, "lesson 02 table must cover exit codes");
});

test("regression: lesson 02 does not treat a multiplexer as a shell", () => {
  const content = fs.readFileSync(path.join(DIR, "02-la-terminal.md"), "utf8");
  assert.doesNotMatch(content, /multiplexor[\s\S]{0,50}es un shell/i, "a multiplexer is not a shell");
});