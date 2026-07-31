#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

// Voseo word stems. The validator builds boundary-aware patterns because
// JavaScript `\b` does not recognize accented characters as word chars.
const VOSEO_STEMS = [
  "podés", "podé",
  "elegís", "elegí",
  "necesitás", "necesitá",
  "comenzás", "comenzá",
  "hacés", "hacé",
  "comprobás", "comprobá",
  "tenés", "tené",
  "querés", "queré",
  "decís", "decí",
  "sabés", "sabé",
  "vas", // "vas a" is Rioplatense; flagged in conjunction
  "andás", "andá",
  "seguís", "seguí",
  "mirás", "mirá",
  "entendés", "entendé",
  "esperás", "esperá",
  "usás", "usá",
  "dejás", "dejá",
  "ponés", "poné",
  "salís", "salí",
  "venís", "vení",
  "escribís", "escribí",
  "leés", "leé",
  "abrís", "abrí",
  "cerrás", "cerrá",
  "corrés", "corré",
  "pedís", "pedí",
  "conocés", "conocé",
];

// Build a pattern that matches the stem as a standalone word,
// handling accented characters that JavaScript \b doesn't recognize.
function buildPattern(stem) {
  return new RegExp(`(?:^|\\s)${stem}(?:$|\\s|[.,;:!?])`, "i");
}

// Separate stems that are ambiguous with neutral Spanish (rare single-syllable forms)
const AMBIGUOUS_STEMS = new Set(["vas"]);

function frontmatter(text) {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end < 0) return {};
  const block = text.slice(4, end);
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const match = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    data[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return data;
}

function validateFile(file) {
  const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const text = fs.readFileSync(file, "utf8");
  const meta = frontmatter(text);

  // Only validate lesson-v2 pages
  if (meta.manual_contract !== "lesson-v2") return [];

  // Strip frontmatter and code fences before checking
  const visibleText = text
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "")
    .replace(/`[^`\n]+`/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  const errors = [];
  const lines = visibleText.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // Skip lines that are pure headings, code, or tables — short context check
    if (/^\s*#/.test(line) || /^\s*\|/.test(line) || /^\s*>/.test(line)) continue;

    for (const stem of VOSEO_STEMS) {
      // Ambiguous stems like "vas" need extra context
      if (AMBIGUOUS_STEMS.has(stem)) continue;
      const pattern = buildPattern(stem);
      if (pattern.test(line)) {
        const match = line.match(pattern);
        errors.push(`${relative}:${i + 1}: voseo '${match[0].trim()}' — use neutral Spanish instead`);
        break; // one error per line
      }
    }
  }

  return errors;
}

function main() {
  const files = process.argv.slice(2).map((file) => path.resolve(ROOT, file));
  const mdFiles = files.filter((file) => /\.md$/i.test(file) && fs.existsSync(file));
  const errors = mdFiles.flatMap(validateFile);

  if (errors.length) {
    console.error("Voseo check failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Voseo check passed for ${mdFiles.length} file(s).`);
}

main();
