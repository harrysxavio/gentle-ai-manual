#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

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
  "quedás", "quedá",
  // Documented in the editorial skill's avoid list
  "continuás", "continuá",
];

// Enclitic voseo imperative forms (stem + pronoun)
// Build from stems that end with accented vowel (imperative forms).
// `se` is EXCLUDED from single-pronoun forms: "usase", "dejase", "crease" and
// "pensase" are also neutral imperfect subjunctives, so those forms would
// produce false positives in ordinary prose.
const VOSEO_ENCLITIC_STEMS = (() => {
  const enclitic = [];
  const stems = new Set(VOSEO_STEMS.filter((s) => /[áéíóú]$/.test(s)));
  for (const stem of stems) {
    for (const suffix of ["me", "te", "nos", "le", "les", "lo", "la", "los", "las"]) {
      enclitic.push(stem.replace(/[áéíóú]$/, (match) => {
        const map = { á: "a", é: "e", í: "i", ó: "o", ú: "u" };
        return map[match] + suffix;
      }));
    }
  }
  return enclitic;
})();

// Compound enclitic voseo forms (stem + pronoun + pronoun): "guardátelo",
// "copiámelo", "decímelo". Unlike single-pronoun forms, the stem KEEPS its
// written accent because the resulting word is esdrújula. Dativo first
// (me/te/se/nos/le/les), acusativo second (lo/la/los/las).
const VOSEO_COMPOUND_ENCLITIC_STEMS = (() => {
  const compounds = [];
  const stems = new Set(VOSEO_STEMS.filter((s) => /[áéíóú]$/.test(s)));
  const first = ["me", "te", "se", "nos", "le", "les"];
  const second = ["lo", "la", "los", "las"];
  for (const stem of stems) {
    for (const a of first) {
      for (const b of second) {
        compounds.push(stem + a + b);
      }
    }
  }
  return compounds;
})();

// All stems used for scanning: bare conjugations + single-pronoun enclitics +
// compound enclitics + the standalone voseo pronoun "vos". The pronoun is
// boundary-aware like every stem, so "vosotros" or "devos" never match.
const ALL_VOSEO_STEMS = [...VOSEO_STEMS, ...VOSEO_ENCLITIC_STEMS, ...VOSEO_COMPOUND_ENCLITIC_STEMS, "vos"];

// Build a pattern that matches the stem as a standalone word.
// The prefix boundary accepts whitespace, punctuation, or start-of-line.
// The suffix boundary accepts whitespace, punctuation, or end-of-line.
function buildPattern(stem) {
  return new RegExp(`(?:^|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])${stem}(?:$|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])`, "i");
}

// Separate stems that are ambiguous with neutral Spanish (rare single-syllable forms)
const AMBIGUOUS_STEMS = new Set(["vas"]);

// Accented -í imperative stems that are ALSO valid neutral first-person
// preterites of regular -ir verbs ("elegí", "abrí", "escribí", "seguí",
// "salí", "pedí", "subí", "recibí"). "vení" and "decí" are excluded because
// their preterites are irregular ("vine", "dije") and never collide.
const PRETERITE_AMBIGUOUS_STEMS = new Set([
  "elegí", "abrí", "escribí", "seguí", "salí", "pedí", "subí", "recibí",
]);

// Past-time / first-person markers that disambiguate the preterite reading.
// Only markers that establish a first-person PAST reading are accepted:
// subject pronoun "yo", past-time adverbs ("ayer", "anoche", "ya", "nunca",
// "jamás", "recién"). Sequencing connectors such as "antes", "después",
// "luego" or "mientras" are NOT sufficient — "Antes de continuar, elegí una
// opción" is a voseo instruction, not a preterite. The marker must appear in
// the SAME clause as the verb: "Yo terminé mi parte; elegí la opción" is a
// voseo imperative because the "yo" belongs to the earlier clause. The
// trade-off is documented: the validator prioritizes detecting instructions
// over accepting ambiguous narration.
const PRETERITE_CONTEXT_MARKERS = /\b(yo|ayer|anoche|ya|nunca|jamás|recién)\b/i;

// Split points between clauses: sentence punctuation, semicolons and
// newlines. The comma is deliberately NOT a boundary: it frequently separates
// an introductory adverb from the verb ("Ayer, elegí la primera opción") and
// the validator prioritizes not blocking neutral prose over catching every
// imperative. Strong boundaries (;, ., !, ?) still isolate clauses.
const CLAUSE_BOUNDARY = /[;.!?\n]/g;

// Subordinating conjunctions that separate a verb from a LATER marker. If a
// marker appears after the verb and one of these words sits between them, the
// marker belongs to a subordinate clause and cannot retroactively classify
// the verb as a preterite: "Elegí una opción que ya conozcas" is a voseo
// imperative. Without a conjunction, a later past-time adverb keeps the
// preterite reading: "Recibí tu mensaje anoche". The list is deliberately
// short and deterministic (no general grammar parsing).
const SUBORDINATING_CONJUNCTIONS = /\b(que|cuando|como|porque|si|donde|mientras|aunque)\b/i;

function isPreteriteContext(text, matchIndex) {
  const boundary = new RegExp(CLAUSE_BOUNDARY.source, "g");
  let clauseStart = 0;
  let clauseEnd = text.length;
  let m;
  while ((m = boundary.exec(text)) !== null) {
    if (matchIndex < m.index) {
      clauseEnd = m.index;
      break;
    }
    clauseStart = m.index + 1;
  }
  const clause = text.slice(clauseStart, clauseEnd);
  const before = clause.slice(0, matchIndex - clauseStart);
  // Markers BEFORE the verb establish the preterite reading unless they sit
  // inside a preceding subordinate clause ("Si ya terminaste, elegí una
  // opción" is an imperative: the 'ya' belongs to the 'si' premise). The
  // subject pronoun "yo" is the exception: it is the subject of the main
  // clause, never a subordinate marker ("Cuando llegué, yo abrí el archivo").
  // Every preceding marker is examined, so a main-clause "yo" wins even when
  // an earlier subordinate marker exists ("Si ya había terminado, yo abrí").
  const markerPattern = new RegExp(PRETERITE_CONTEXT_MARKERS.source, PRETERITE_CONTEXT_MARKERS.flags + "g");
  let marker;
  while ((marker = markerPattern.exec(before)) !== null) {
    if (marker[0].toLowerCase() === "yo") {
      // "yo" must belong to the MAIN clause: it must appear after the last
      // comma of the preceding text ("Si ya había terminado, yo abrí ...").
      // A "yo" inside a preceding subordinate clause cannot exempt a later
      // imperative ("Aunque yo terminé mi parte, elegí una opción").
      if (before.lastIndexOf(",") < marker.index) return true;
    } else {
      const conjunctionBefore = SUBORDINATING_CONJUNCTIONS.test(before.slice(0, marker.index));
      if (!conjunctionBefore) return true;
    }
  }
  // Markers AFTER the verb only count when no subordinating conjunction
  // intervenes (see SUBORDINATING_CONJUNCTIONS).
  const after = clause.slice(matchIndex - clauseStart);
  const cut = after.search(SUBORDINATING_CONJUNCTIONS);
  return PRETERITE_CONTEXT_MARKERS.test(cut >= 0 ? after.slice(0, cut) : after);
}

// YAML-aware frontmatter parser. A line-based parser would silently skip V2
// pages whose frontmatter uses legal YAML formatting (quoted keys,
// indentation), letting voseo pass the aggregate CI check. Reuse the same
// parser family as validate-v2-contracts.cjs so both validators agree on
// whether a page is lesson-v2.
function frontmatter(text) {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end < 0) return {};
  const block = text.slice(4, end);
  try {
    const data = yaml.load(block);
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
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
    for (const stem of ALL_VOSEO_STEMS) {
      if (AMBIGUOUS_STEMS.has(stem)) continue;
      const pattern = new RegExp(buildPattern(stem).source, "ig");
      let exempted = true; // every occurrence resolved to a preterite context
      let match;
      while ((match = pattern.exec(value)) !== null) {
        if (PRETERITE_AMBIGUOUS_STEMS.has(stem) && isPreteriteContext(value, match.index)) {
          continue; // this occurrence is a first-person preterite
        }
        exempted = false;
        break;
      }
      if (!exempted) {
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
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, preserveLines)
    // HTML/MDX anchors and components: keep the rendered children, drop tag
    // attributes entirely. Anchor-specific handling covers quoted literals,
    // JSX expressions (literal and nonliteral) and multi-line tags; the
    // generic component rule covers non-anchor tags such as
    // `<Card href={routes.vos}>label</Card>`. Newlines from the removed
    // opening tag are padded BEFORE the label and newlines from the closing
    // tag AFTER it, so error line numbers stay accurate.
    .replace(/(<a\s+[^>]*href=(?:"[^"]*"|'[^']*'|\{[^}]*\})[^>]*>)([\s\S]*?)(<\/a>)/gi, (match, open, label, close) => {
      const openLines = (open.match(/\r?\n/g) || []).length;
      const closeLines = (close.match(/\r?\n/g) || []).length;
      return "\n".repeat(openLines) + label + "\n".repeat(closeLines);
    })
    .replace(/(<([A-Za-z][A-Za-z0-9]*)(?:\s+[^>]*)?>)([\s\S]*?)(<\/\2>)/g, (match, open, name, label, close) => {
      const openLines = (open.match(/\r?\n/g) || []).length;
      const closeLines = (close.match(/\r?\n/g) || []).length;
      return "\n".repeat(openLines) + label + "\n".repeat(closeLines);
    });

  const lines = visibleText.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    // Strip Markdown delimiters from headings and tables to check visible text
    line = line.replace(/^#{1,6}\s*/, "").replace(/\|/g, " ").replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
    // Keep link LABELS (reader-visible) but drop destinations and reference
    // markers: a scanned stem inside a URL or reference id is not prose.
    line = line.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");
    // Reference definitions ("[manual]: https://...") are not rendered text.
    if (/^\s*\[[^\]]+\]:\s*\S/.test(line)) continue;
    if (/^\s*$/.test(line)) continue;

    for (const stem of ALL_VOSEO_STEMS) {
      // Ambiguous stems like "vas" need extra context
      if (AMBIGUOUS_STEMS.has(stem)) continue;
      const pattern = new RegExp(buildPattern(stem).source, "ig");
      // Scan EVERY occurrence: exempting a stem after one preterite match
      // would let a genuine imperative later in the same line pass
      // ("Ayer elegí la primera opción; elegí la correcta").
      let exempted = true;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        // Accented -í forms with a past-time/first-person marker in the SAME
        // clause are neutral first-person preterites, not voseo imperatives.
        if (PRETERITE_AMBIGUOUS_STEMS.has(stem) && isPreteriteContext(line, match.index)) {
          continue; // check the next occurrence
        }
        exempted = false;
        break;
      }
      if (!exempted) {
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
