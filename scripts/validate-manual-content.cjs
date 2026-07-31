#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const ROOT = process.cwd();
const DOC_ROOT = path.join(ROOT, "src", "content", "docs");
const VALID_CONTRACTS = new Set(["lesson-v1", "reference-v1", "lab-v1"]);
const REQUIRED_LESSON_GROUPS = [
  ["Resultado de aprendizaje"],
  ["Respuesta simple", "En pocas palabras"],
  ["Modelo mental"],
  ["Ejemplo continuo", "Ejemplo guiado"],
  ["Cómo funciona internamente", "Cómo funciona"],
  ["Cuándo usarlo", "Cuándo usarlo y cuándo evitarlo"],
  ["Errores frecuentes"],
  ["Comprueba lo aprendido", "Cómo verificar", "Ejercicio"],
  ["Resumen"],
  ["Fuentes y alcance"],
];

function parseArgs(argv) {
  const out = { all: false, changedFrom: null, files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--all") out.all = true;
    else if (arg === "--changed-from") out.changedFrom = argv[++i];
    else out.files.push(arg);
  }
  return out;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function changedFiles(baseRef) {
  const result = cp.spawnSync(
    "git",
    ["diff", "--name-only", `${baseRef}...HEAD`, "--", "src/content/docs"],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`git diff failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => path.join(ROOT, file));
}

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

function headings(text) {
  return text
    .split(/\r?\n/)
    .map((line) => /^#{2,3}\s+(.+?)\s*$/.exec(line))
    .filter(Boolean)
    .map((match) => match[1].replace(/[*_`]/g, "").trim());
}

function hasHeadingGroup(found, alternatives) {
  return alternatives.some((wanted) =>
    found.some((actual) => actual.toLocaleLowerCase("es") === wanted.toLocaleLowerCase("es")),
  );
}

function validateImageSyntax(text, relative) {
  const errors = [];
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  for (const match of text.matchAll(imagePattern)) {
    const alt = match[1].trim();
    const src = match[2].trim();
    if (!alt) errors.push(`${relative}: image has empty alt text`);
    if (/^https?:\/\//.test(src)) {
      errors.push(`${relative}: remote image hotlink is not allowed (${src})`);
    }
  }
  return errors;
}

function validateCodeFences(text, relative) {
  const errors = [];
  const shellFence = /```(sh|shell|console)?\n([\s\S]*?)```/g;
  for (const match of text.matchAll(shellFence)) {
    const body = match[2];
    if (/(^|\n)\s*(npm|git|cd|ls|pwd|curl|gentle-ai|engram|opencode)\b/m.test(body)) {
      errors.push(`${relative}: command block must be labeled bash or powershell`);
    }
  }
  return errors;
}

// Collapse inline Markdown/HTML delimiters so visible text like `Coming **soon**`,
// `<strong>próximamente</strong>`, `Coming<br />soon`, `Coming&nbsp;soon`,
// `<input placeholder="Coming soon" />`, or a soft line break still matches the
// placeholder check. Must run AFTER code fences, inline code, and comments are
// stripped.
function normalizeInlineMarkup(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // links -> label text
    // Preserve ALL visible text carried by HTML attributes before tags are
    // dropped (e.g. `<input title="Search" placeholder="Coming soon" />`).
    .replace(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g, (match, tag, attrs) => {
      const values = [...attrs.matchAll(/\b(placeholder|title|alt|aria-label)\s*=\s*"([^"]*)"/gi)].map((m) => m[2]);
      return values.length ? ` ${values.join(" ")} ` : match;
    })
    .replace(/<br\s*\/?>/gi, " ")              // HTML line break -> space
    .replace(/<[^>]+>/g, "")                   // other HTML tags
    .replace(/&nbsp;/gi, " ")                  // non-breaking space -> space
    .replace(/&#160;/gi, " ")                  // numeric non-breaking space -> space
    .replace(/&#32;/gi, " ")                   // numeric space -> space
    .replace(/&amp;/gi, "&")                   // ampersand
    .replace(/&lt;/gi, "<")                    // less-than
    .replace(/&gt;/gi, ">")                    // greater-than
    .replace(/&quot;/gi, "\"")                 // double quote
    .replace(/&#39;/gi, "'")                   // apostrophe
    .replace(/\*\*([^*]+)\*\*/g, "$1")         // bold
    .replace(/__([^_]+)__/g, "$1")             // bold (alt)
    .replace(/\*([^*\n]+)\*/g, "$1")           // italic
    .replace(/_([^_\n]+)_/g, "$1")             // italic (alt)
    .replace(/~~([^~]+)~~/g, "$1")             // strikethrough
    .replace(/`[^`\n]+`/g, "")                 // stray inline code
    .replace(/\s+/g, " ");                     // rendered separators -> single space
}

function validateFile(file) {
  const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const text = fs.readFileSync(file, "utf8");
  const meta = frontmatter(text);
  const contract = meta.manual_contract;

  // Global checks applied to all files regardless of contract
  const errors = [];

  // Block placeholders in published content (visible prose only)
  // Strip frontmatter, code fences, inline code, and HTML comments first,
  // then normalize inline markup so formatted placeholders still match.
  const visibleText = normalizeInlineMarkup(
    text
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")   // strip frontmatter (anchored to start)
      .replace(/```[\s\S]*?```/g, "")                     // strip backtick code fences
      .replace(/~~~[\s\S]*?~~~/g, "")                     // strip tilde code fences
      .replace(/`[^`\n]+`/g, "")                          // strip inline code
      .replace(/<!--[\s\S]*?-->/g, ""),                   // strip HTML comments
  );
  if (/\b(próximamente|proximamente|coming\s+soon)\b/i.test(visibleText)) {
    errors.push(`${relative}: placeholder 'próximamente' or 'coming soon' found in published content`);
  }

  if (!contract) return errors;
  if (!VALID_CONTRACTS.has(contract)) {
    errors.push(`${relative}: unknown manual_contract '${contract}'`);
    return errors;
  }

  const foundHeadings = headings(text);

  if (contract === "lesson-v1") {
    for (const group of REQUIRED_LESSON_GROUPS) {
      if (!hasHeadingGroup(foundHeadings, group)) {
        errors.push(`${relative}: missing section (${group.join(" OR ")})`);
      }
    }
    if (!meta.learning_outcome) {
      errors.push(`${relative}: frontmatter learning_outcome is required`);
    }
    if (!meta.estimated_minutes || !/^\d+$/.test(meta.estimated_minutes)) {
      errors.push(`${relative}: estimated_minutes must be an integer`);
    }
  }

  if (contract === "lab-v1") {
    const required = [
      "Capacidad demostrada",
      "Escenario",
      "Prerrequisitos",
      "Tarea",
      "Evidencia",
      "Rúbrica",
      "Recuperación",
    ];
    for (const section of required) {
      if (!hasHeadingGroup(foundHeadings, [section])) {
        errors.push(`${relative}: missing lab section '${section}'`);
      }
    }
  }

  if (!hasHeadingGroup(foundHeadings, ["Fuentes y alcance"])) {
    errors.push(`${relative}: missing 'Fuentes y alcance'`);
  }

  if (text.includes("@ts-nocheck")) {
    errors.push(`${relative}: @ts-nocheck is forbidden`);
  }

  if (/última versión|más reciente versión|latest version/i.test(text) &&
      !/Fecha de verificación|verified_at/i.test(text)) {
    errors.push(`${relative}: volatile latest-version claim lacks verification date`);
  }

  errors.push(...validateImageSyntax(text, relative));
  errors.push(...validateCodeFences(text, relative));
  return errors;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let files;

  if (args.files.length) {
    files = args.files.map((file) => path.resolve(ROOT, file));
  } else if (args.changedFrom) {
    files = changedFiles(args.changedFrom);
  } else {
    files = walk(DOC_ROOT);
  }

  files = files.filter((file) => /\.(md|mdx)$/i.test(file) && fs.existsSync(file));
  const errors = files.flatMap(validateFile);

  if (errors.length) {
    console.error("Manual content validation failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Manual content validation passed for ${files.length} file(s).`);
}

main();
