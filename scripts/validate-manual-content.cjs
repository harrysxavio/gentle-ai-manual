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

function validateFile(file) {
  const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const text = fs.readFileSync(file, "utf8");
  const meta = frontmatter(text);
  const contract = meta.manual_contract;

  if (!contract) return [];
  if (!VALID_CONTRACTS.has(contract)) {
    return [`${relative}: unknown manual_contract '${contract}'`];
  }

  const errors = [];
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
