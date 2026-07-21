const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { loadCurriculum, validateCurriculum, normalizeLessonPath } = require('../scripts/lib/curriculum-contract.cjs');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE_URL = 'file://' + path.join(ROOT, 'src', 'data', 'curriculum.mjs').replace(/\\/g, '/');

let errors = 0;
let tests = 0;
function assert(condition, msg) {
  tests++;
  if (!condition) { console.log('  FAIL: ' + msg); errors++; }
  else { console.log('  PASS: ' + msg); }
}

const EXPECTED_SLUGS_SORTED = ['arquitectura', 'codex', 'engram', 'modelos', 'opencode', 'principiante-total', 'producto', 'programador'];

console.log('\n--- Curriculum Contract Tests ---\n');

// 1. profiles.length === 8
console.log('1. Profile count');
const curriculum = loadCurriculum();
assert(curriculum.profilesCount === 8, 'profiles.length === 8, got: ' + curriculum.profilesCount);

// 2. profile slugs match expected sorted set
console.log('2. Profile slugs');
const slugs = curriculum.profileSlugs;
assert(JSON.stringify(slugs) === JSON.stringify(EXPECTED_SLUGS_SORTED),
  'profile slugs match expected set\n    Expected: ' + JSON.stringify(EXPECTED_SLUGS_SORTED) + '\n    Got:      ' + JSON.stringify(slugs));

// 3. validateCurriculum returns empty array
console.log('3. validateCurriculum');
const validationErrors = validateCurriculum(curriculum);
assert(validationErrors.length === 0, 'validateCurriculum returns empty array\n    Errors: ' + JSON.stringify(validationErrors));

// 4. normalizeLessonPath works correctly
console.log('4. normalizeLessonPath');
assert(normalizeLessonPath('/gentle-ai-manual/00-empezar-aqui/01-bienvenida/') === '/00-empezar-aqui/01-bienvenida/',
  'strips base prefix');
assert(normalizeLessonPath('/00-empezar-aqui/01-bienvenida?q=test') === '/00-empezar-aqui/01-bienvenida/',
  'strips query params');
assert(normalizeLessonPath('/00-empezar-aqui/01-bienvenida#intro') === '/00-empezar-aqui/01-bienvenida/',
  'strips hash');
assert(normalizeLessonPath('00-empezar-aqui/01-bienvenida/') === '/00-empezar-aqui/01-bienvenida/',
  'ensures leading slash');
assert(normalizeLessonPath('/00-empezar-aqui/01-bienvenida') === '/00-empezar-aqui/01-bienvenida/',
  'ensures trailing slash');
assert(normalizeLessonPath('') === '', 'empty string returns empty');

// 5. every profile's lessonHrefs array is non-empty
console.log('5. Profile lessonHrefs non-empty');
const profileData = (() => {
  const tmpFile = path.join(ROOT, 'scripts', 'lib', '_load-profile-data.mjs');
  const loader = `
import { profiles } from ${JSON.stringify(DATA_FILE_URL)};
const result = profiles.map(p => ({ slug: p.slug, count: p.lessonHrefs.length, first: p.lessonHrefs[0] }));
console.log(JSON.stringify(result));
  `;
  fs.writeFileSync(tmpFile, loader, 'utf-8');
  try {
    const out = execSync(`node ${JSON.stringify(tmpFile)}`, { encoding: 'utf-8', cwd: ROOT });
    return JSON.parse(out.trim());
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
})();

profileData.forEach(p => {
  assert(p.count > 0, `profile "${p.slug}" has ${p.count} lessonHrefs (first: "${p.first}")`);
});

// 6. buildSidebar returns array with 8 stage entries
console.log('6. buildSidebar structure');
const sbData = (() => {
  const tmpFile = path.join(ROOT, 'scripts', 'lib', '_load-sidebar.mjs');
  const loader = `
import { buildSidebar } from ${JSON.stringify(DATA_FILE_URL)};
const sb = buildSidebar();
console.log(JSON.stringify({
  sidebarLength: sb.length,
  stageLabels: sb.map(s => s.label),
  firstItemLabel: sb.length > 0 && sb[0].items.length > 0 ? sb[0].items[0].label : null,
  firstItemSlug: sb.length > 0 && sb[0].items.length > 0 && sb[0].items[0].items ? sb[0].items[0].items[0].slug : null,
}));
  `;
  fs.writeFileSync(tmpFile, loader, 'utf-8');
  try {
    const out = execSync(`node ${JSON.stringify(tmpFile)}`, { encoding: 'utf-8', cwd: ROOT });
    return JSON.parse(out.trim());
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
})();

assert(sbData.sidebarLength === 8, `buildSidebar() returns 8 entries, got ${sbData.sidebarLength}`);
assert(sbData.firstItemLabel === '00. Empezar aquí', `first sidebar item label is "00. Empezar aquí", got "${sbData.firstItemLabel}"`);
assert(sbData.firstItemSlug === '00-empezar-aqui/01-bienvenida', `first lesson slug is "00-empezar-aqui/01-bienvenida", got "${sbData.firstItemSlug}"`);

console.log(`\n${tests} tests, ${errors} failure(s)`);
if (errors) process.exit(1);
