"use strict";

// RED/GREEN: process and API boundaries.
//   - Lesson 01: the OPERATING SYSTEM loads and manages the AGENT's process.
//   - Lesson 04: the human↔agent interaction is a terminal/CLI/TUI, NOT an
//     API; the agent↔model and agent↔tools connections ARE APIs.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos");

test("RED: lesson 01 states the OS loads and manages the agent process", () => {
  const content = fs.readFileSync(path.join(DIR, "01-como-funciona-una-computadora.md"), "utf8");
  assert.match(
    content,
    /(carga|administra|gestiona)[\s\S]{0,120}el proceso del agente|el proceso del agente[\s\S]{0,120}(carga|administra|gestiona)/i,
    "lesson 01 must link the OS to the agent's process",
  );
});

test("RED: lesson 04 separates human↔agent interaction (terminal/CLI/TUI) from API connections", () => {
  const content = fs.readFileSync(path.join(DIR, "04-frontend-backend.md"), "utf8");
  assert.match(
    content,
    /(persona|usuario)[\s\S]{0,220}(terminal|cli|tui)[\s\S]{0,180}(no es|no son|no usa|en vez de|en lugar de)/i,
    "lesson 04 must say the human↔agent link is not an API",
  );
});

test("RED: lesson 04 states agent↔model and agent↔tools connections ARE APIs", () => {
  const content = fs.readFileSync(path.join(DIR, "04-frontend-backend.md"), "utf8");
  assert.match(
    content,
    /agente[\s\S]{0,140}(modelo|herramientas|tool)[\s\S]{0,140}api/i,
    "lesson 04 must present agent↔model/tools as API connections",
  );
});