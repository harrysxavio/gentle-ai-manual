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
  "vas", "andás", "andá",
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
  // Technical imperatives commonly used in tutorials
  "configurás", "configurá",
  "ejecutás", "ejecutá",
  "guardás", "guardá",
  "instalás", "instalá",
  "creás", "creá",
  "buscás", "buscá",
  "modificás", "modificá",
  "eliminás", "eliminá",
  "copiás", "copiá",
  "pegás", "pegá",
  "descargás", "descargá",
  "actualizás", "actualizá",
  "probás", "probá",
  "verificás", "verificá",
  "subís", "subí",
  "bajás", "bajá",
  "movés", "mové",
  "cambiás", "cambiá",
  "encontrás", "encontrá",
  "recordás", "recordá",
  "pensás", "pensá",
  // Additional common tutorial imperatives
  "seleccionás", "seleccioná",
  "agregás", "agregá",
  "activás", "activá",
  "desactivás", "desactivá",
  "arrastrás", "arrastrá",
  "completás", "completá",
  "revisás", "revisá",
  "aceptás", "aceptá",
  "cancelás", "cancelá",
  "enviás", "enviá",
  "recibís", "recibí",
  "mostrás", "mostrá",
  "ocultás", "ocultá",
  "volvés", "volvé",
  "empezás", "empezá",
  "terminás", "terminá",
];

// Enclitic voseo imperative forms (stem + pronoun)
// Build from stems that end with accented vowel (imperative forms).
// Covers the full enclitic pronoun set: me, te, se, nos, le, les, lo, la, los, las.
const VOSEO_ENCLITIC_STEMS = (() => {
  const enclitic = [];
  const stems = new Set(VOSEO_STEMS.filter((s) => /[áéíóú]$/.test(s)));
  for (const stem of stems) {
    for (const suffix of ["me", "te", "se", "nos", "le", "les", "lo", "la", "los", "las"]) {
      enclitic.push(stem.replace(/[áéíóú]$/, (match) => {
        const map = { á: "a", é: "e", í: "i", ó: "o", ú: "u" };
        return map[match] + suffix;
      }));
    }
  }
  return enclitic;
})();

// Build a pattern that matches the stem as a standalone word.
// The prefix boundary accepts whitespace, punctuation, or start-of-line.
// The suffix boundary accepts whitespace, punctuation, or end-of-line.
function buildPattern(stem) {
  return new RegExp(`(?:^|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])${stem}(?:$|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])`, "i");
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

  const errors = [];

  // Reader-visible frontmatter fields (rendered by Starlight) must be scanned
  // BEFORE the frontmatter block is stripped. Technical fields such as IDs or
  // slugs are not scanned to avoid false positives.
  const visibleFields = ["title", "description", "learning_outcome"];
  for (const field of visibleFields) {
    const value = meta[field];
    if (!value || typeof value !== "string") continue;
    for (const stem of [...VOSEO_STEMS, ...VOSEO_ENCLITIC_STEMS]) {
      if (AMBIGUOUS_STEMS.has(stem)) continue;
      const pattern = buildPattern(stem);
      if (pattern.test(value)) {
        const match = value.match(pattern);
        errors.push(`${relative}: frontmatter '${field}' contains voseo '${match[0].trim()}' — use neutral Spanish instead`);
        break; // one error per field
      }
    }
  }

  // Strip frontmatter and code fences while preserving line count for accurate diagnostics.
  // Replace each removed multiline block with the same number of newlines.
  function preserveLines(match) {
    const count = (match.match(/\r?\n/g) || []).length;
    return "\n".repeat(count);
  }
  const visibleText = text
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, preserveLines)
    .replace(/```[\s\S]*?```/g, preserveLines)
    .replace(/~~~[\s\S]*?~~~/g, preserveLines)
    .replace(/`[^`\n]+`/g, "")
    .replace(/<!--[\s\S]*?-->/g, preserveLines)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, preserveLines);

  const lines = visibleText.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    // Strip Markdown delimiters from headings and tables to check visible text
    line = line.replace(/^#{1,6}\s*/, "").replace(/\|/g, " ").replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
    if (/^\s*$/.test(line)) continue;

    for (const stem of [...VOSEO_STEMS, ...VOSEO_ENCLITIC_STEMS]) {
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

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function main() {
  const args = process.argv.slice(2);
  let files;
  if (args.length) {
    files = args.map((file) => path.resolve(ROOT, file));
  } else {
    files = walk(path.join(ROOT, "src", "content", "docs"));
  }
  const mdFiles = files.filter((file) => /\.(md|mdx)$/i.test(file) && fs.existsSync(file));
  const errors = mdFiles.flatMap(validateFile);

  if (errors.length) {
    console.error("Voseo check failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Voseo check passed for ${mdFiles.length} file(s).`);
}

main();
