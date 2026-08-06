// tests/precision-fixes.test.cjs
// RED/GREEN para REQ-021: tres invariantes de precisión técnica.
// Falla hoy (RED) con las formulaciones actuales; tras la corrección
// consolidada debe pasar (GREEN).
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("REQ-021: el shell lee las variables de entorno, no la terminal", () => {
  const p03 = read("src/content/docs/01-fundamentos-tecnologicos/03-programacion.md");
  // El shell es quien lee el entorno e imprime; la terminal solo muestra la salida.
  assert.match(p03, /al shell que la muestre|el shell (es quien|lee)/i,
    "03 debe atribuir la lectura del entorno al shell");
  assert.doesNotMatch(p03, /le pides a la terminal que la muestre/i,
    "03 no debe decir que le pides a la terminal que muestre la variable");
  assert.doesNotMatch(p03, /un programa \(la terminal\) que lo lee/i,
    "03 no debe llamar a la terminal 'el programa que lo lee'");
});

test("REQ-021: errores de compilación/sintaxis vs errores de ejecución sin absolutos falsos", () => {
  const p03 = read("src/content/docs/01-fundamentos-tecnologicos/03-programacion.md");
  // La tabla no debe afirmar que TODOS los errores se detectan antes de ejecutar en compilados.
  assert.match(p03, /errores de (compilaci[óo]n|sintaxis)/i,
    "03 debe mencionar errores de compilación/sintaxis");
  assert.match(p03, /errores de ejecuci[óo]n/i,
    "03 debe mencionar errores de ejecución");
  assert.doesNotMatch(p03, /\| Errores \| Se detectan antes de ejecutar \| Se detectan durante la ejecuci[óo]n \|/,
    "03 no debe tener la fila absoluta 'Errores: antes vs durante'");
});

test("REQ-021: nombre de columna vs tipo de dato", () => {
  const p05 = read("src/content/docs/01-fundamentos-tecnologicos/05-bases-de-datos.md");
  // Cada columna es un atributo con nombre y un tipo asociado (TEXT, DATE, enum), no un tipo de dato.
  assert.match(p05, /cada columna es un (atributo|campo)/i,
    "05 debe describir cada columna como atributo/campo con nombre");
  assert.match(p05, /tipo/i,
    "05 debe mencionar que cada columna tiene un tipo asociado");
  assert.doesNotMatch(p05, /Cada columna es un tipo de dato/i,
    "05 no debe decir que la columna ES un tipo de dato");
});

test("REQ-022: CLI vs TUI se distinguen por modalidad de interacción, no por duración del proceso", () => {
  const p04 = read("src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md");
  // Una CLI puede ser interactiva o de larga duración; no se distingue por si el proceso termina.
  assert.match(p04, /modalidad de interacci[óo]n|interfaz navegable|escribiendo comandos/i,
    "04 debe distinguir CLI de TUI por la forma de interactuar");
  assert.doesNotMatch(p04, /si escribes un comando y el programa termina, es un CLI/i,
    "04 no debe distinguir CLI por si el proceso termina");
});

test("REQ-022: el identificador de fila es una decisión de diseño, no una garantía inherente", () => {
  const p05 = read("src/content/docs/01-fundamentos-tecnologicos/05-bases-de-datos.md");
  // Las tablas bien diseñadas suelen definir una clave primaria; no es automático por defecto.
  assert.match(p05, /clave primaria|identificador/i,
    "05 debe mencionar identificador o clave primaria");
  assert.doesNotMatch(p05, /Cada fila adem[áa]s tiene un identificador que no se repite/i,
    "05 no debe afirmar que toda fila tiene identificador único por defecto");
});
