// tests/run.cjs — Manual integrity checks, Node stdlib only
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'src', 'content', 'docs');
const REQUIRED_PATHS = [
  'src/content/docs', 'src/plugins/auto-import-components.js',
  'scripts/validate-mermaid.cjs', 'scripts/validate-models.cjs',
  'docs/adr/ADR-001-documentation-framework.md',
  'INDEX.md', 'GLOSSARY.md', 'astro.config.mjs', 'package.json',
];

let errors = 0;
function err(msg) { console.log('  FAIL: ' + msg); errors++; }

// 1. Required paths
console.log('Checking required paths...');
for (const p of REQUIRED_PATHS) {
  if (!fs.existsSync(path.join(ROOT, p))) err('Required path missing: ' + p);
}

// 2. Replacement/control characters in content
console.log('Scanning for replacement/control characters...');
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { walk(f); continue; }
    if (!e.name.endsWith('.md') && !e.name.endsWith('.mdx')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    if (content.includes('\uFFFD'))
      err('Replacement char U+FFFD in ' + path.relative(DOCS, f));
    for (let i = 0; i < content.length; i++) {
      const cp = content.charCodeAt(i);
      if ((cp < 0x20 && cp !== 0x09 && cp !== 0x0A && cp !== 0x0D) || cp === 0x7F)
        err('Control char U+' + cp.toString(16).padStart(4, '0') + ' at pos ' + i + ' in ' + path.relative(DOCS, f));
    }
  }
}
walk(DOCS);

// 3. Frontmatter delimiter integrity
console.log('Verifying frontmatter delimiters...');
(function checkFM(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { checkFM(f); continue; }
    if (!e.name.endsWith('.md') && !e.name.endsWith('.mdx')) continue;
    const c = fs.readFileSync(f, 'utf-8');
    if (c.startsWith('---') && !/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(c))
      err('Malformed frontmatter in ' + path.relative(DOCS, f));
  }
})(DOCS);

if (errors) { console.log('\n' + errors + ' error(s) found'); process.exit(1); }
console.log('All checks passed');
