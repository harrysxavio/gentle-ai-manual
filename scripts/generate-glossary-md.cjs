#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const YAML = require("js-yaml");

const yamlPath = path.resolve(__dirname, "..", "data", "terminology", "glossary.yml");
const outPath = path.resolve(__dirname, "..", "GLOSSARY.md");

const raw = fs.readFileSync(yamlPath, "utf8");
const parsed = YAML.load(raw);

if (!parsed || !Array.isArray(parsed.terms)) {
  console.error("glossary.yml must have a terms array");
  process.exitCode = 1;
  return;
}

// Deduplicate by term name (first wins)
const seen = new Set();
const terms = [];
for (const t of parsed.terms) {
  if (!seen.has(t.term)) {
    seen.add(t.term);
    terms.push(t);
  }
}

// Sort alphabetically (Spanish locale, case-insensitive)
terms.sort((a, b) => a.term.localeCompare(b.term, "es", { sensitivity: "base" }));

// Build output
const lines = [];
lines.push("# Glosario — Gentle AI Mega Manual");
lines.push("");
lines.push("> **Nivel**: Referencia");
lines.push("> **Versión**: 2026-07-20 (generado desde data/terminology/glossary.yml)");
lines.push("");
lines.push("Cada término incluye su primera definición simple (Nivel 1) y una referencia a dónde se explica en profundidad.");
lines.push("");

let currentLetter = "";
for (const t of terms) {
  const firstChar = t.term.charAt(0).toUpperCase();
  if (firstChar !== currentLetter) {
    currentLetter = firstChar;
    if (lines.length > 6) lines.push("---"); // separator between letter groups, but not at top
    lines.push("");
    lines.push(`## ${currentLetter}`);
    lines.push("");
  }

  lines.push(`### ${t.term}`);
  lines.push(`**Simple**: ${t.simple}`);
  const ref = t.reference || "content/";
  lines.push(`**Referencia**: \`${ref}\``);
  lines.push("");
}

// Write
fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Written ${outPath}`);
console.log(`  ${terms.length} terms, ${[...new Set(terms.map(t => t.term.charAt(0).toUpperCase()))].length} letter groups`);
