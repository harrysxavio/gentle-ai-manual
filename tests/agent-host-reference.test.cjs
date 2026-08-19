"use strict";

// RED/GREEN: the manual's rule is that the USER opens a host (OpenCode, Codex
// or Claude Code); Gentle-AI configures, the host executes. Lessons 01 and 05
// must never present "abrís/ejecutás Gentle-AI" as a user action, and they
// must reference the hosts the user actually opens.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos");

const PAGES = {
  "01": "01-como-funciona-una-computadora.md",
  "05": "05-bases-de-datos.md",
};

test("RED: lessons 01 and 05 never present opening/running Gentle-AI as a user action", () => {
  for (const file of Object.values(PAGES)) {
    const content = fs.readFileSync(path.join(DIR, file), "utf8");
    const re = /(abr[íi]s|abr[íi]|ejecut[áa]s|ejecut[áa])\s+(el\s+)?gentle-ai/gi;
    assert.doesNotMatch(content, re, `${file} must not have the user opening or running Gentle-AI`);
  }
});

test("RED: lessons 01 and 05 reference the hosts the user opens (OpenCode, Codex, Claude Code)", () => {
  for (const file of Object.values(PAGES)) {
    const content = fs.readFileSync(path.join(DIR, file), "utf8");
    assert.match(
      content,
      /OpenCode|Codex|Claude Code/i,
      `${file} must reference OpenCode, Codex or Claude Code as what the user opens`,
    );
  }
});