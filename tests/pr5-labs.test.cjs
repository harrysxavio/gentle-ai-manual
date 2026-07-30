#!/usr/bin/env node
/**
 * PR 5 — Mastery Labs & Verifiable Capstone
 *
 * RED phase: all tests fail because lab pages don't exist yet.
 * GREEN phase: all tests pass after lab pages are created.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const assert = require('assert/strict');

const DOCS = path.resolve(__dirname, '..', 'src', 'content', 'docs');
const CURRICULUM = path.resolve(__dirname, '..', 'src', 'data', 'curriculum.mjs');
const GLOSSARY = path.resolve(__dirname, '..', 'data', 'terminology', 'glossary.yml');
const CLAIMS = path.resolve(__dirname, '..', 'data', 'evidence', 'verified-claims.yml');
const LAB_DIR = path.join(DOCS, '19-laboratorios');
const CATALOG = path.resolve(__dirname, '..', 'data', 'evidence', 'gentle-command-catalog.yml');

const REQUIRED_LABS = [
  { slug: '19-laboratorios/02-solicitud-web', title: 'Trazar una solicitud web' },
  { slug: '19-laboratorios/03-elegir-stack', title: 'Elegir un stack tecnológico' },
  { slug: '19-laboratorios/04-escala-y-carga', title: 'Evolucionar un sistema bajo carga' },
  { slug: '19-laboratorios/05-arquitectura-agentes', title: 'Diseñar una arquitectura de agentes' },
  { slug: '19-laboratorios/06-roles-y-modelos', title: 'Asignar roles y modelos con fallback' },
  { slug: '19-laboratorios/07-flujo-organico-rdd', title: 'Ejecutar un flujo orgánico y RDD' },
  { slug: '19-laboratorios/08-revision-pr', title: 'Revisar una PR con confianza verificable' },
  { slug: '19-laboratorios/09-capstone', title: 'Capstone completo' },
];

const LAB_CONTRACT_SECTIONS = [
  /## Contexto/i,
  /## Objetivo observable/i,
  /## Escenario/i,
  /## Restricciones/i,
  /## Información disponible/i,
  /## Preguntas de decisión/i,
  /## Artefacto esperado/i,
  /## Criterios de aceptación/i,
  /## Rúbrica/i,
  /## Autoevaluación/i,
  /## Errores frecuentes/i,
  /## Extensión avanzada/i,
  /## Solución/i,
  /## Fuentes/i,
];

const RUBRIC_LEVELS = [/inicial/i, /competente/i, /avanzado/i, /experto/i];
// Patterns that REQUIRE paid providers (not cost discussions)
const PAID_REQUIRE_PATTERNS = [
  /registr(?:arse?|ate?)\s+(en|on)\s+(openai|claude|gemini|anthropic)/i,
  /api\s+key\s+(de|of|from|for)\s+(openai|claude|gemini|anthropic)/i,
  /pagar\s+\$/i,
  /(?:suscrib|subscribe?|sign\s+up|crear\s+cuenta).*(?:openai|claude|gemini|anthropic)/i,
  /(?:openai|claude|gemini|anthropic)\s+(?:api\s+)?(?:key|token|credential)/i,
];

function findLabFiles() {
  return REQUIRED_LABS.map(lab => {
    const filePath = path.join(DOCS, ...lab.slug.split('/')) + '.md';
    return { ...lab, filePath, exists: fs.existsSync(filePath) };
  });
}

// ============================================================
// Tests
// ============================================================

// 1. Lab pages exist
findLabFiles().forEach(lab => {
  const testName = `Lab page exists: ${lab.slug}`;
  try {
    assert.ok(lab.exists, `Expected file at ${lab.filePath}`);
    console.log(`  PASS: ${testName}`);
  } catch (e) {
    console.log(`  FAIL: ${testName} — ${e.message}`);
    process.exitCode = 1;
  }
});

// 2-14. Lab contract sections (run only if files exist)
findLabFiles().filter(l => l.exists).forEach(lab => {
  const content = fs.readFileSync(lab.filePath, 'utf-8');
  const lines = content.split('\n');

  LAB_CONTRACT_SECTIONS.forEach((pattern, idx) => {
    const hasSection = lines.some(line => pattern.test(line));
    const sectionName = pattern.source.replace(/[/\\]/g, '').trim();
    const testName = `${lab.slug}: section "${sectionName}"`;
    try {
      assert.ok(hasSection, `Expected section "${sectionName}" in ${lab.filePath}`);
      console.log(`  PASS: ${testName}`);
    } catch (e) {
      console.log(`  FAIL: ${testName} — ${e.message}`);
      process.exitCode = 1;
    }
  });
});

// 15. Rubric levels
findLabFiles().filter(l => l.exists).forEach(lab => {
  const content = fs.readFileSync(lab.filePath, 'utf-8');
  const rubricSection = content.split(/## Rúbrica/i)[1]?.split(/## /)[0] || '';
  const testName = `${lab.slug}: rubric has 4 levels (inicial/competente/avanzado/experto)`;
  const missingLevels = RUBRIC_LEVELS.filter(pattern => !pattern.test(rubricSection));
  try {
    assert.equal(missingLevels.length, 0, `Missing levels: ${missingLevels.join(', ')}`);
    console.log(`  PASS: ${testName}`);
  } catch (e) {
    console.log(`  FAIL: ${testName} — ${e.message}`);
    process.exitCode = 1;
  }
});

// 16. No paid providers
findLabFiles().filter(l => l.exists).forEach(lab => {
  const content = fs.readFileSync(lab.filePath, 'utf-8');
  const testName = `${lab.slug}: no paid provider requirement`;
  const found = PAID_REQUIRE_PATTERNS.filter(p => p.test(content));
  try {
    assert.equal(found.length, 0, `Found paid patterns: ${found.join(', ')}`);
    console.log(`  PASS: ${testName}`);
  } catch (e) {
    console.log(`  FAIL: ${testName} — ${e.message}`);
    process.exitCode = 1;
  }
});

// 17. Organic RDD lab uses claims and catalog
const rddLab = findLabFiles().find(l => l.slug.includes('flujo-organico'));
if (rddLab && rddLab.exists) {
  const content = fs.readFileSync(rddLab.filePath, 'utf-8');
  const claimsContent = fs.readFileSync(CLAIMS, 'utf-8');
  const catalogContent = fs.readFileSync(CATALOG, 'utf-8');

  let rddOk = true;

  // RDD lab references claims
  if (content.includes('verified-claims.yml') || content.includes('claims')) {
    console.log(`  PASS: ${rddLab.slug}: references claims`);
  } else {
    console.log(`  FAIL: ${rddLab.slug}: does NOT reference verified-claims.yml`);
    rddOk = false;
    process.exitCode = 1;
  }

  // RDD lab references command catalog
  if (content.includes('command-catalog') || content.includes('catálogo') || content.includes('catalog')) {
    console.log(`  PASS: ${rddLab.slug}: references command catalog`);
  } else {
    console.log(`  FAIL: ${rddLab.slug}: does NOT reference command catalog`);
    rddOk = false;
    process.exitCode = 1;
  }
}

// 18. RDD lab has conceptual variant without Gentle-AI
if (rddLab && rddLab.exists) {
  const content = fs.readFileSync(rddLab.filePath, 'utf-8');
  const hasConceptualVariant = content.includes('sin gentle') || content.includes('sin Gentle') || content.includes('conceptual') || content.includes('genérico');
  const hasActualVariant = content.includes('v2.2.0') || content.includes('gentle-ai review');
  const testName = `${rddLab.slug}: has conceptual + Gentle-AI variants`;
  try {
    assert.ok(hasConceptualVariant, 'Missing conceptual variant');
    assert.ok(hasActualVariant, 'Missing Gentle-AI variant');
    console.log(`  PASS: ${testName}`);
  } catch (e) {
    console.log(`  FAIL: ${testName} — ${e.message}`);
    process.exitCode = 1;
  }
}

// 19. Curriculum registration
if (fs.existsSync(CURRICULUM)) {
  const curriculumRaw = fs.readFileSync(CURRICULUM, 'utf-8');
  REQUIRED_LABS.forEach(lab => {
    const testName = `curriculum registered: ${lab.slug}`;
    try {
      assert.ok(curriculumRaw.includes(lab.slug), `Missing ${lab.slug} in curriculum.mjs`);
      console.log(`  PASS: ${testName}`);
    } catch (e) {
      console.log(`  FAIL: ${testName} — ${e.message}`);
      process.exitCode = 1;
    }
  });
}

// 20. Each profile has at least one practice
const PROFILE_PRACTICES = {
  'principiante-total': ['19-laboratorios/02-solicitud-web', '19-laboratorios/03-elegir-stack'],
  'programador': ['19-laboratorios/02-solicitud-web', '19-laboratorios/03-elegir-stack', '19-laboratorios/04-escala-y-carga', '19-laboratorios/08-revision-pr'],
  'opencode': ['19-laboratorios/06-roles-y-modelos', '19-laboratorios/07-flujo-organico-rdd'],
  'codex': ['19-laboratorios/06-roles-y-modelos', '19-laboratorios/08-revision-pr'],
  'engram': ['19-laboratorios/06-roles-y-modelos'],
  'modelos': ['19-laboratorios/06-roles-y-modelos'],
  'producto': ['19-laboratorios/09-capstone', '19-laboratorios/02-solicitud-web', '19-laboratorios/03-elegir-stack', '19-laboratorios/04-escala-y-carga', '19-laboratorios/05-arquitectura-agentes'],
  'arquitectura': ['19-laboratorios/04-escala-y-carga', '19-laboratorios/05-arquitectura-agentes', '19-laboratorios/06-roles-y-modelos', '19-laboratorios/07-flujo-organico-rdd'],
};

if (fs.existsSync(CURRICULUM)) {
  // Import curriculum to check per-profile lessonHrefs, not global string search
  const curriculumMod = require(CURRICULUM);
  const profiles = (curriculumMod.profiles || (curriculumMod.default && curriculumMod.default.profiles) || []);
  Object.entries(PROFILE_PRACTICES).forEach(([profileSlug, expectedLabs]) => {
    const profile = profiles.find(p => p.slug === profileSlug);
    assert.ok(profile, `Profile "${profileSlug}" not found in curriculum`);
    expectedLabs.forEach(labSlug => {
      const href = `/${labSlug}/`;
      const testName = `profile "${profileSlug}" includes ${labSlug}`;
      try {
        assert.ok(profile.lessonHrefs.includes(href), `Missing ${labSlug} (href "${href}") in ${profileSlug} lessonHrefs`);
        console.log(`  PASS: ${testName}`);
      } catch (e) {
        console.log(`  FAIL: ${testName} — ${e.message}`);
        process.exitCode = 1;
      }
    });
  });
}

// 21. Capstone has all required sections
const capstone = REQUIRED_LABS.find(l => l.slug.includes('capstone'));
if (capstone && fs.existsSync(capstone.filePath)) {
  const content = fs.readFileSync(capstone.filePath, 'utf-8');
  const capstoneSections = [
    /## Contexto/i, /## Escenario/i, /## Criterios de aceptación/i,
    /## Decisiones arquitectónicas/i, /## Plan de pruebas/i, /## Plan de rollback/i,
    /## Entregables/i, /## Rúbrica/i, /## Checklist de finalización/i,
    /## Extensión avanzada/i, /## Fuentes/i,
  ];
  capstoneSections.forEach(pattern => {
    const sectionName = pattern.source.replace(/[/\\]/g, '').trim();
    const testName = `capstone: section "${sectionName}"`;
    try {
      assert.ok(pattern.test(content), `Missing section "${sectionName}" in capstone`);
      console.log(`  PASS: ${testName}`);
    } catch (e) {
      console.log(`  FAIL: ${testName} — ${e.message}`);
      process.exitCode = 1;
    }
  });
}

// 22. Built site contains lab routes
const DIST = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  REQUIRED_LABS.forEach(lab => {
    const htmlPath = path.join(DIST, ...lab.slug.split('/'), 'index.html');
    const testName = `built site includes: ${lab.slug}`;
    try {
      assert.ok(fs.existsSync(htmlPath), `Expected ${htmlPath}`);
      const html = fs.readFileSync(htmlPath, 'utf-8');
      assert.ok(html.length > 100, 'HTML too short');
      console.log(`  PASS: ${testName}`);
    } catch (e) {
      console.log(`  FAIL: ${testName} — ${e.message}`);
      process.exitCode = 1;
    }
  });
}

// 23. No retired commands as instructions (content check)
if (fs.existsSync(CATALOG)) {
  const catalog = yaml.load(fs.readFileSync(CATALOG, 'utf-8'));
  const retiredCommands = (Array.isArray(catalog) ? catalog : catalog.commands || []).filter(c => c.status === 'retired').map(c => c.name);
  REQUIRED_LABS.filter(l => l.filePath && fs.existsSync(l.filePath)).forEach(lab => {
    const content = fs.readFileSync(lab.filePath, 'utf-8');
    retiredCommands.forEach(cmd => {
      // Allow mentions in context of migration/warning, not as instruction
      const lines = content.split('\n').filter(line => line.includes(cmd) && !line.includes('retirado') && !line.includes('retired') && !line.startsWith('#'));

      lines.forEach(line => {
        const testName = `${lab.slug}: retired command "${cmd}" not used as instruction`;
        try {
          const isBlockCode = content.split('\n').indexOf(line) > 0;
          // Only flag if inside a code block (executable)
          const lineIdx = content.split('\n').indexOf(line);
          const beforeContent = content.split('\n').slice(Math.max(0, lineIdx - 3), lineIdx).join('\n');
          const inCodeBlock = /```/.test(beforeContent) && /```/g.test(beforeContent);
          if (!inCodeBlock) {
            console.log(`  PASS: ${testName}`);
          } else {
            assert.ok(false, `"${cmd}" appears as executable instruction`);
            process.exitCode = 1;
          }
        } catch (e) {
          console.log(`  FAIL: ${testName} — ${e.message}`);
          process.exitCode = 1;
        }
      });
    });
  });
}

// 24. Capstone claim IDs exist in verified-claims.yml
if (fs.existsSync(CLAIMS)) {
  const claimsData = yaml.load(fs.readFileSync(CLAIMS, 'utf-8'));
  const existingIds = new Set((claimsData.claims || []).map(c => c.id));
  const capstonePath = path.join(LAB_DIR, '09-capstone.md');
  if (fs.existsSync(capstonePath)) {
    const capstoneContent = fs.readFileSync(capstonePath, 'utf-8');
    // Extract claim IDs from the claims reference table (backtick-wrapped IDs only)
    const claimMatches = [...capstoneContent.matchAll(/^\| `([\w./-]+)` \|/gm)];
    const expectedMinRows = 6;
    try {
      assert.ok(claimMatches.length >= expectedMinRows,
        `Expected at least ${expectedMinRows} claim rows in table, found ${claimMatches.length}`);
      console.log(`  PASS: capstone claims table has ${claimMatches.length} rows (≥ ${expectedMinRows})`);
    } catch (e) {
      console.log(`  FAIL: capstone claims table — ${e.message}`);
      process.exitCode = 1;
    }
    for (const match of claimMatches) {
      const claimId = match[1];
      const testName = `capstone claim "${claimId}" exists in verified-claims.yml`;
      try {
        assert.ok(existingIds.has(claimId), `Claim "${claimId}" not found in verified-claims.yml`);
        console.log(`  PASS: ${testName}`);
      } catch (e) {
        console.log(`  FAIL: ${testName} — ${e.message}`);
        process.exitCode = 1;
      }
    }
  }
}

console.log('\n---');
console.log('RED phase complete. All FAILs expected until labs are implemented.');
console.log('Run: node tests/pr5-labs.test.cjs 2>&1 | Select-String -Pattern "(PASS|FAIL)"');