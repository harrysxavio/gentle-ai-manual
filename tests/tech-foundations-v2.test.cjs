"use strict";

// RED/GREEN: the five foundational lessons (01-05) must be complete lesson-v2
// pages. The validator only checks lesson-v2 pages, so migrating these pages
// to the V2 contract is the essence of PR 9. Covers:
//   - manual_contract: lesson-v2
//   - all 16 required V2 fields + source_status
//   - no H1 in the body (Starlight renders the frontmatter title)
//   - slugs registered in src/data/curriculum.mjs (never renames a URL)

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos");

const LESSONS = [
  "01-como-funciona-una-computadora.md",
  "02-la-terminal.md",
  "03-programacion.md",
  "04-frontend-backend.md",
  "05-bases-de-datos.md",
];

// 16 fields required by scripts/validate-v2-contracts.cjs + source_status
const REQUIRED_FIELDS = [
  "title",
  "manual_contract",
  "description",
  "content_level",
  "estimated_minutes",
  "learning_outcome",
  "canonical_concepts",
  "lesson_terms",
  "persona",
  "learning_resources",
  "snapshot",
  "faq_mode",
  "practice_mode",
  "diagram_mode",
  "level",
  "estimatedTime",
  "source_status",
];

function readFrontmatter(file) {
  const content = fs.readFileSync(path.join(DIR, file), "utf8");
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  try {
    return yaml.load(m[1]);
  } catch {
    return null;
  }
}

for (const file of LESSONS) {
  test(`RED: ${file} is a complete lesson-v2 page`, () => {
    const meta = readFrontmatter(file);
    assert.ok(meta, `${file} must have parseable frontmatter`);
    assert.equal(meta.manual_contract, "lesson-v2", `${file} must declare manual_contract: lesson-v2`);
    for (const field of REQUIRED_FIELDS) {
      const val = meta[field];
      assert.ok(
        val !== undefined && val !== null && val !== false && val !== 0 && val !== "",
        `${file} is missing required field '${field}'`,
      );
    }
    assert.ok(
      Array.isArray(meta.content_level) && meta.content_level.length > 0,
      `${file} content_level must be a non-empty list`,
    );
    assert.ok(
      Array.isArray(meta.lesson_terms) && meta.lesson_terms.length > 0,
      `${file} lesson_terms must be a non-empty list`,
    );
    assert.ok(
      Array.isArray(meta.learning_resources) && meta.learning_resources.length > 0,
      `${file} learning_resources must be a non-empty list`,
    );
    assert.equal(meta.practice_mode, "none", `${file} must use practice_mode: none`);
    assert.equal(meta.snapshot, "none", `${file} must use snapshot: none`);
  });
}

test("RED: lesson-v2 pages have no H1 in the body (Starlight renders the title)", () => {
  for (const file of LESSONS) {
    const content = fs.readFileSync(path.join(DIR, file), "utf8");
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
    assert.doesNotMatch(body, /^#\s/m, `${file} must not contain an H1 in the body`);
  }
});

test("RED: lesson slugs are registered in curriculum.mjs (URLs never change)", () => {
  const { modules } = require(path.join(ROOT, "src", "data", "curriculum.mjs"));
  const slugs = new Set();
  modules.forEach((m) => m.lessons.forEach((l) => slugs.add(l.slug)));
  for (const file of LESSONS) {
    const slug = file.replace(/\.md$/, "");
    assert.ok(slugs.has("01-fundamentos-tecnologicos/" + slug), `curriculum missing slug: ${slug}`);
  }
});