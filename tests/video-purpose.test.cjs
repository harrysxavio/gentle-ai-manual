"use strict";

// Regression invariants (must PASS on the current baseline and remain green
// after the rewrite): no lesson references the `video-programacion-introduccion`
// resource (its purpose is misaligned), the resource is absent from the
// learning-resources catalog, and lesson 03 references only non-video learning
// resources.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "src", "content", "docs");
const RESOURCES = path.join(ROOT, "data", "resources", "learning-resources.yml");

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...walk(p));
    } else if (/\.(md|mdx)$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

test("regression: no lesson references the video-programacion-introduccion resource", () => {
  const files = walk(DOCS);
  assert.ok(files.length > 0, "expected content files to scan");
  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(
      content,
      /video-programacion-introduccion/,
      `${path.relative(ROOT, f)} must not reference video-programacion-introduccion`,
    );
  }
});

test("regression: learning-resources.yml has no video-programacion-introduccion entry", () => {
  const parsed = yaml.load(fs.readFileSync(RESOURCES, "utf8"));
  const ids = (parsed.resources || []).map((r) => r.id);
  assert.ok(!ids.includes("video-programacion-introduccion"), "resource must not exist in the catalog");
});

test("regression: lesson 03 references only non-video learning resources", () => {
  const file = path.join(DOCS, "01-fundamentos-tecnologicos", "03-programacion.md");
  const content = fs.readFileSync(file, "utf8");
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, "lesson 03 must have frontmatter");
  const parsed = yaml.load(m[1]);
  const refs = Array.isArray(parsed.learning_resources) ? parsed.learning_resources : [];
  for (const r of refs) {
    assert.ok(!String(r).startsWith("video-"), `lesson 03 must not reference a video resource: ${r}`);
  }
});