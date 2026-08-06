// tests/persistence-client-url.test.cjs
// RED/GREEN para REQ-025: tres invariantes de persistencia, cliente y URL.
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

test("REQ-025: persistencia no es exclusiva del backend", () => {
  const p04 = read("src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md");
  // No afirmar que "el backend guarda los datos que deben durar" como absoluto.
  assert.doesNotMatch(p04, /el backend guarda los datos que deben durar/i,
    "04 no debe afirmar que solo el backend persiste como regla absoluta");
  assert.match(p04, /localStorage|IndexedDB|frontend tambi[ée]n puede|el frontend puede guardar/i,
    "04 debe mencionar que el frontend también puede persistir datos");
});

test("REQ-025: URL del servidor local incluye el puerto completo", () => {
  const p04 = read("src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md");
  // La instrucción debe incluir la URL completa con puerto.
  assert.doesNotMatch(p04, /escribiendo `localhost` en la direcci[óo]n(?!.*puerto)/i,
    "04 no debe decir solo 'localhost' sin mencionar el puerto");
  assert.match(p04, /direcci[óo]n completa|URL completa|incluye.*puerto|con el puerto/i,
    "04 debe mencionar que se usa la URL completa con el puerto");
});

test("REQ-025: el cliente es el navegador/programa, no la computadora completa", () => {
  const p04 = read("src/content/docs/01-fundamentos-tecnologicos/04-frontend-backend.md");
  // El diagrama no debe etiquetar "tu computadora" como cliente.
  assert.doesNotMatch(p04, /C\["Cliente: tu computadora"\]/,
    "04 diagrama no debe etiquetar la computadora completa como cliente");
  assert.match(p04, /Cliente:.*navegador|C\["\w+: el navegador/i,
    "04 diagrama debe identificar al navegador como cliente");
});
