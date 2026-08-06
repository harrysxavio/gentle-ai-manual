// tests/cli-tui-interface.test.cjs
// RED/GREEN para REQ-019: CLI y TUI son interfaces de usuario que un mismo
// programa puede exponer, no tipos mutuamente excluyentes de programa.
// Falla hoy (RED) con las formulaciones que los presentan como tipos de
// programa; tras la corrección consolidada debe pasar (GREEN).
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos");
const GLOSSARY = path.join(ROOT, "data", "terminology", "glossary.yml");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("REQ-019: CLI y TUI son interfaces, no tipos excluyentes de programa", () => {
  const p02 = read("src/content/docs/01-fundamentos-tecnologicos/02-la-terminal.md");
  const p04 = read("src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md");

  // 1. Definición correcta de CLI: interfaz que un programa expone
  assert.match(p02, /CLI[^]*?es una interfaz/i,
    "02 debe definir CLI como interfaz");
  assert.doesNotMatch(p02, /Un \*\*CLI[^]*?\*\* es un programa/i,
    "02 no debe definir CLI como 'un programa'");

  // 2. Definición correcta de TUI: interfaz
  assert.match(p02, /TUI[^]*?es una interfaz/i,
    "02 debe definir TUI como interfaz");
  assert.doesNotMatch(p02, /Una \*\*TUI[^]*?\*\* es un programa/i,
    "02 no debe definir TUI como 'un programa'");

  // 3. Un mismo programa puede ofrecer ambas interfaces
  assert.match(p02, /mismo programa puede ofrecer (ambas|las dos)/i,
    "02 debe afirmar que un mismo programa puede ofrecer ambas interfaces");

  // 4. Coherencia del ejemplo OpenCode: 02 y 04 no deben contradecirse
  //    (OpenCode tiene CLI — comando opencode — y su interfaz es una TUI)
  assert.doesNotMatch(p04, /CLI[^]*?OpenCode[^]*?\*\* es un programa/i,
    "04 no debe presentar a OpenCode como 'un programa CLI' excluyente");
  assert.match(p04, /opencode[^]*?comando|CLI[^]*?OpenCode/i,
    "04 debe reconocer que opencode es un comando (CLI) del programa");

  // 5. La tabla resumen de 04 no debe definir CLI/TUI como programas
  assert.doesNotMatch(p04, /\| CLI \(Command Line Interface\) \| Programa que se opera por comandos \|/i,
    "04 tabla resumen no debe definir CLI como 'Programa que se opera por comandos'");
  assert.match(p04, /\| CLI \(Command Line Interface\) \| Interfaz para operar un programa escribiendo comandos u opciones \|/i,
    "04 tabla resumen debe definir CLI como interfaz para operar escribiendo comandos u opciones");
});

test("REQ-019: glosario define CLI y TUI como interfaces, no programas", () => {
  const g = read("data/terminology/glossary.yml");
  const cli = /CLI \(Command Line Interface\).*?simple: "([^"]+)"/s.exec(g);
  const tui = /TUI \(Text User Interface\).*?simple: "([^"]+)"/s.exec(g);
  assert.ok(cli, "glosario debe contener CLI");
  assert.ok(tui, "glosario debe contener TUI");
  assert.match(cli[1], /interfaz/i, "CLI en glosario = interfaz");
  assert.match(tui[1], /interfaz/i, "TUI en glosario = interfaz");
});
