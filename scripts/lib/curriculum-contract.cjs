const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'curriculum.mjs');
const DATA_FILE_URL = 'file://' + DATA_FILE.replace(/\\/g, '/');

function loadCurriculum() {
  const tmpFile = path.join(ROOT, 'scripts', 'lib', '_load-curriculum.mjs');
  const loader = `
import { stages, modules, profiles, lessonsByHref, buildSidebar, normalizeHref } from ${JSON.stringify(DATA_FILE_URL)};
console.log(JSON.stringify({
  stagesCount: stages.length,
  modulesCount: modules.length,
  profilesCount: profiles.length,
  profileSlugs: profiles.map(p => p.slug).sort(),
  lessonHrefs: Array.from(lessonsByHref.keys()).sort(),
  stageModuleCounts: stages.map(s => ({ id: s.id, count: s.moduleIds.length })),
  allLessonHrefsResolve: profiles.every(p => p.lessonHrefs.every(h => lessonsByHref.has(h))),
  sidebarLength: buildSidebar().length,
  duplicateSlugs: (() => {
    const slugs = profiles.map(p => p.slug);
    return slugs.filter((s, i) => slugs.indexOf(s) !== i);
  })(),
  duplicateHrefs: (() => {
    const hrefs = Array.from(lessonsByHref.keys());
    return hrefs.filter((h, i) => hrefs.indexOf(h) !== i);
  })(),
  noWrongPrefix: (() => {
    const hrefs = Array.from(lessonsByHref.keys());
    return hrefs.every(h => !h.includes('/gentle-ai-mega-manual-es/'));
  })(),
}));
  `;
  fs.writeFileSync(tmpFile, loader, 'utf-8');
  let stdout;
  try {
    stdout = execSync(`node ${JSON.stringify(tmpFile)}`, { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
  return JSON.parse(stdout.trim());
}

function normalizeLessonPath(p) {
  if (!p) return '';
  let h = String(p);
  h = h.replace(/^\/gentle-ai-manual/, '');
  h = h.replace(/[?#].*$/, '');
  if (!h.startsWith('/')) h = '/' + h;
  if (!h.endsWith('/')) h = h + '/';
  return h;
}

function validateCurriculum(curriculum) {
  const errors = [];

  if (!curriculum || curriculum.profilesCount !== 8) {
    errors.push(`Expected 8 profiles, got ${curriculum ? curriculum.profilesCount : 'undefined'}`);
  }

  if (curriculum && curriculum.duplicateSlugs && curriculum.duplicateSlugs.length > 0) {
    errors.push(`Duplicate profile slugs: ${curriculum.duplicateSlugs.join(', ')}`);
  }

  if (curriculum && curriculum.duplicateHrefs && curriculum.duplicateHrefs.length > 0) {
    errors.push(`Duplicate lesson hrefs: ${curriculum.duplicateHrefs.join(', ')}`);
  }

  if (curriculum && curriculum.stageModuleCounts) {
    curriculum.stageModuleCounts.forEach(s => {
      if (s.count === 0) errors.push(`Stage "${s.id}" has 0 modules`);
    });
  }

  if (curriculum && curriculum.allLessonHrefsResolve !== undefined && !curriculum.allLessonHrefsResolve) {
    errors.push('Some profile lessonHrefs do not resolve to actual lessons');
  }

  if (curriculum && curriculum.noWrongPrefix === false) {
    errors.push('Some hrefs contain /gentle-ai-mega-manual-es/ prefix');
  }

  return errors;
}

module.exports = { loadCurriculum, validateCurriculum, normalizeLessonPath };
