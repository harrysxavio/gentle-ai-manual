// tests/process-api-model.test.cjs
// RED/GREEN para REQ-024: dos invariantes del modelo de proceso y conexiones.
// Falla hoy (RED) con las formulaciones actuales; tras la corrección debe pasar (GREEN).
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("REQ-024: el sistema operativo carga y administra el proceso del agente", () => {
  const p01 = read("src/content/docs/01-fundamentos-tecnologicos/01-como-funciona-una-computadora.md");
  // El diagrama no debe mostrar un agente separado que crea su propio proceso.
  assert.match(p01, /Sistema operativo.*carga y administra.*Proceso del agente/si,
    "01 diagrama debe mostrar que el SO carga/administra el proceso del agente");
  assert.doesNotMatch(p01, /AG\["Agente[^\]]*"\] --> OS\["Sistema operativo"\]/,
    "01 no debe dibujar agente --> sistema operativo (agente que crea su proceso)");
  // La persona interactúa con el proceso del agente.
  assert.match(p01, /Tú escribes el prompt.*Proceso del agente/si,
    "01 debe conectar a la persona con el proceso del agente");
});

test("REQ-024: la interacción persona-agente no es una API; solo agente-modelo y agente-herramientas son APIs", () => {
  const p04 = read("src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md");
  // El diagrama debe etiquetar la unión persona->agente como terminal/CLI/TUI, no API.
  assert.match(p04, /U\["Tú"\] -->\|"terminal, CLI o TUI"\| A\["Agente/,
    "04 diagrama debe marcar la interacción persona-agente como terminal/CLI/TUI");
  // Solo las uniones agente-modelo y agente-herramientas son APIs.
  assert.match(p04, /\|"API del modelo"\|/,
    "04 debe marcar agente-modelo como API");
  assert.match(p04, /\|"API de herramientas"\|/,
    "04 debe marcar agente-herramientas como API");
  // El texto no debe decir que 'cada punto de unión' es una API.
  assert.doesNotMatch(p04, /Cada punto de uni[óo]n de este diagrama es una API/i,
    "04 no debe afirmar que cada unión del diagrama es una API");
  assert.match(p04, /esa interacci[óo]n no es una API/i,
    "04 debe aclarar que la interacción persona-agente no es una API");
});
