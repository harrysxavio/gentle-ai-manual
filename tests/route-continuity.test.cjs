// tests/route-continuity.test.cjs — Route continuity contract tests
// Tests the curriculum.mjs functions that support route continuity

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE_URL = 'file://' + path.join(ROOT, 'src', 'data', 'curriculum.mjs').replace(/\\/g, '/');

let errors = 0;
let tests = 0;
function assert(condition, msg) {
  tests++;
  if (!condition) { console.log('  FAIL: ' + msg); errors++; }
  else { console.log('  PASS: ' + msg); }
}

console.log('\n--- Route Continuity Tests ---\n');

// Helper to run a curriculum.mjs expression and return JSON
function evalCurriculum(expr) {
  const tmpFile = path.join(ROOT, 'scripts', 'lib', '_tmp-curriculum-eval.mjs');
  const loader = `
import { getRouteProgress, getProfile, getLesson, profiles, normalizeHref } from ${JSON.stringify(DATA_FILE_URL)};
const result = ${expr};
console.log(JSON.stringify(result));
  `;
  fs.writeFileSync(tmpFile, loader, 'utf-8');
  try {
    const out = execSync(`node ${JSON.stringify(tmpFile)}`, { encoding: 'utf-8', cwd: ROOT });
    return JSON.parse(out.trim());
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

// 1. getRouteProgress returns correct values for first lesson in a profile
console.log('1. getRouteProgress for first lesson');
const progress1 = evalCurriculum(`getRouteProgress("principiante-total", "/00-empezar-aqui/01-bienvenida/")`);
assert(progress1 !== null, 'getRouteProgress returns non-null');
assert(progress1.currentIndex === 0, `currentIndex is 0, got: ${progress1.currentIndex}`);
assert(progress1.total > 0, `total > 0, got: ${progress1.total}`);
assert(progress1.profile.slug === 'principiante-total', `profile slug is "principiante-total", got: "${progress1.profile.slug}"`);
assert(progress1.prev === null, 'prev is null for first lesson');
assert(progress1.next !== null, 'next is non-null for first lesson');
assert(progress1.next.includes('?') === false, 'next href has no query param (query appended by component, not data)');

// 2. getRouteProgress for middle lesson
console.log('2. getRouteProgress for middle lesson');
const progress2 = evalCurriculum(`getRouteProgress("principiante-total", "/04-ecosistema-gentle/01-vision-general/")`);
assert(progress2 !== null, 'getRouteProgress returns non-null');
assert(progress2.currentIndex > 0, `currentIndex > 0, got: ${progress2.currentIndex}`);
assert(progress2.prev !== null, 'prev is non-null for middle lesson');
assert(progress2.next !== null, 'next is non-null for middle lesson');

// 3. getRouteProgress for last lesson
console.log('3. getRouteProgress for last lesson');
const profilePrincipiante = evalCurriculum(`getProfile("principiante-total")`);
const lastHref = profilePrincipiante.lessonHrefs[profilePrincipiante.lessonHrefs.length - 1];
const progress3 = evalCurriculum(`getRouteProgress("principiante-total", ${JSON.stringify(lastHref)})`);
assert(progress3 !== null, 'getRouteProgress returns non-null for last lesson');
assert(progress3.currentIndex === profilePrincipiante.lessonHrefs.length - 1, `currentIndex is last, got: ${progress3.currentIndex}`);
assert(progress3.next === null, 'next is null for last lesson');

// 4. Percentage can be derived from currentIndex + 1 / total * 100
console.log('4. Percentage derivation');
const pct = Math.round(((progress1.currentIndex + 1) / progress1.total) * 100);
assert(pct > 0, `percentage > 0, got: ${pct}`);
assert(pct <= 100, `percentage <= 100, got: ${pct}`);

// 5. Invalid route slug returns null
console.log('5. Invalid route slug');
const invalid = evalCurriculum(`getRouteProgress("ruta-invalida", "/00-empezar-aqui/01-bienvenida/")`);
assert(invalid === null, 'invalid route returns null');

// 6. Pathname not in route returns null
console.log('6. Pathname not in route');
const notInRoute = evalCurriculum(`getRouteProgress("principiante-total", "/20-referencia/02-glosario/")`);
assert(notInRoute === null, 'pathname not in route returns null');

// 7. normalizeHref strips base prefix, query, hash
console.log('7. normalizeHref');
assert(evalCurriculum(`normalizeHref("/gentle-ai-manual/00-empezar-aqui/01-bienvenida/")`) === '/00-empezar-aqui/01-bienvenida/', 'strips base prefix');
assert(evalCurriculum(`normalizeHref("/00-empezar-aqui/01-bienvenida?ruta=principiante-total")`) === '/00-empezar-aqui/01-bienvenida/', 'strips query params');
assert(evalCurriculum(`normalizeHref("/00-empezar-aqui/01-bienvenida#intro")`) === '/00-empezar-aqui/01-bienvenida/', 'strips hash');

// 8. getRouteProgress works with the normalizeHref normalization (full URL pathname without base)
console.log('8. getRouteProgress with base-prefixed pathname');
const prefixed = evalCurriculum(`getRouteProgress("principiante-total", "/gentle-ai-manual/00-empezar-aqui/01-bienvenida/")`);
assert(prefixed !== null, 'works with base-prefixed pathname');
assert(prefixed.currentIndex === 0, `currentIndex is 0 with base-prefixed pathname, got: ${prefixed.currentIndex}`);

// 9. All profile slugs have valid getRouteProgress for every lesson
console.log('9. All profiles have valid route progress');
const allProfiles = evalCurriculum(`profiles.map(p => p.slug)`);
let allValid = true;
for (const slug of allProfiles) {
  const p = evalCurriculum(`getProfile(${JSON.stringify(slug)})`);
  if (!p.lessonHrefs || p.lessonHrefs.length === 0) {
    console.log(`  FAIL: profile "${slug}" has no lessonHrefs`);
    allValid = false;
    errors++;
    tests++;
    continue;
  }
  for (let i = 0; i < p.lessonHrefs.length; i++) {
    const prog = evalCurriculum(`getRouteProgress(${JSON.stringify(slug)}, ${JSON.stringify(p.lessonHrefs[i])})`);
    if (!prog || prog.currentIndex !== i) {
      console.log(`  FAIL: profile "${slug}" lesson ${i} (${p.lessonHrefs[i]}) currentIndex mismatch`);
      allValid = false;
      errors++;
      tests++;
    }
  }
}
if (allValid) {
  tests++;
  console.log(`  PASS: all ${allProfiles.length} profiles have valid getRouteProgress for every lesson`);
}

// 10. Route query string should be preserved: verify no href in curriculum has ?ruta=
console.log('10. No hardcoded ?ruta= in curriculum hrefs');
let hasQuery = false;
for (const slug of allProfiles) {
  const p = evalCurriculum(`getProfile(${JSON.stringify(slug)})`);
  for (const href of p.lessonHrefs) {
    if (href.includes('?')) {
      console.log(`  FAIL: profile "${slug}" has href with query: ${href}`);
      hasQuery = true;
      errors++;
      tests++;
    }
  }
}
if (!hasQuery) {
  tests++;
  console.log('  PASS: no hardcoded ?ruta= in curriculum hrefs');
}

// 11. All profiles have canonical title (not slug) — iterate curriculum source
console.log('11. All profiles have canonical titles');
const titleData = evalCurriculum(`profiles.map(p => ({ slug: p.slug, title: p.title }))`);
let titleOK = true;
for (const p of titleData) {
  // Title must exist and differ from slug (slug uses hyphens, title uses spaces)
  if (!p.title || p.title.length < 2) {
    console.log(`  FAIL: profile "${p.slug}" has no title`);
    titleOK = false; errors++; tests++;
    continue;
  }
  // Title must NOT be the raw slug
  if (p.title === p.slug) {
    console.log(`  FAIL: profile "${p.slug}" title is the raw slug: "${p.title}"`);
    titleOK = false; errors++; tests++;
    continue;
  }
  // Title must contain the slug parts in human-readable form (either full words or semantic)
  const slugWords = p.slug.split('-').filter(w => w.length > 2);
  const titleLower = p.title.toLowerCase();
  let wordFound = false;
  // Each profile slug has at least one distinct word that should appear in the title
  if (slugWords.length > 0 && slugWords.some(w => titleLower.includes(w))) {
    wordFound = true;
  }
  // Exception: short slug words like "ya", "se" may not appear
  if (slugWords.length > 0 && !wordFound && slugWords.every(w => w.length <= 2)) {
    wordFound = true; // short-only slugs are ok
  }
  if (!wordFound) {
    console.log(`  WARN: profile "${p.slug}" title "${p.title}" may not relate to slug words`);
  }
}
if (titleOK) {
  tests++;
  console.log('  PASS: all profiles have canonical titles');
}

// 12. Every profile's title is distinct from its slug (regression guard)
console.log('12. Title vs slug — regression guard');
let regrOK = true;
for (const p of titleData) {
  if (p.title === p.slug) {
    console.log(`  FAIL: profile "${p.slug}" uses raw slug as title: "${p.title}"`);
    regrOK = false; errors++; tests++;
  }
}
if (regrOK) {
  tests++;
  console.log('  PASS: no profile uses slug as display title');
}

// 13. Every profile's lessonHrefs preserve the slug in query params when appended
console.log('13. Query param preserves slug, not title');
const qpData = evalCurriculum(`profiles.map(p => ({
  slug: p.slug,
  title: p.title,
  firstHref: p.lessonHrefs[0] || null
}))`);
let qpOK = true;
for (const p of qpData) {
  if (!p.firstHref) {
    console.log(`  FAIL: profile "${p.slug}" has no lessonHrefs`);
    qpOK = false; errors++; tests++;
    continue;
  }
  // When we append ?ruta=, we must use the SLUG, not the title
  // Verify slug and title are different (otherwise the URL would be ambiguous)
  if (p.title === p.slug) {
    console.log(`  FAIL: profile "${p.slug}" slug and title are identical — URL query would be ambiguous`);
    qpOK = false; errors++; tests++;
  }
}
if (qpOK) {
  tests++;
  console.log('  PASS: query param uses slug (verified slug ≠ title for all profiles)');
}

// 14. Invalid route slug is rejected (not invented)
console.log('14. Invalid route slug is rejected');
const invalidProfile = evalCurriculum(`(function() { try { getProfile("ruta-inexistente"); return "ok"; } catch(e) { return "error"; } })()`);
assert(invalidProfile === 'error', 'unknown profile slug throws');
const invalidProgress = evalCurriculum(`getRouteProgress("ruta-inexistente", "/00-empezar-aqui/01-bienvenida/")`);
assert(invalidProgress === null, 'invalid slug returns null from getRouteProgress');

console.log(`\n${tests} tests, ${errors} failure(s)`);
if (errors) process.exit(1);
