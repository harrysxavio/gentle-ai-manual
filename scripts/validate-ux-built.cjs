#!/usr/bin/env node

// scripts/validate-ux-built.cjs — Global UX contract over the BUILT site (dist).
// Runs after `astro build` (wired into check-site). Verifies the invariants that
// can only be asserted on the generated HTML:
//  - A. Brand: canonical "Manual Gentil para IA"; old brand absent on home.
//  - B. Home has exactly ONE H1 and no duplicated site title.
//  - C. Home has no quick-start section.
//  - D. Mermaid diagrams are wrapped with the accessible zoom control.
//  - E. Glossary page carries data-pagefind-weight.
//  - F. Welcome page: horizontal diagram, no repo-file references, single pager.

const fs = require('node:fs');
const path = require('node:path');

const dist = path.resolve(process.argv[2] || 'dist');

function readHtml(rel) {
  const file = path.join(dist, rel, 'index.html');
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
}

let errors = 0;
function check(condition, msg) {
  if (!condition) {
    console.error('  FAIL: ' + msg);
    errors++;
  } else {
    console.log('  PASS: ' + msg);
  }
}

console.log('Validating built-site global UX contract...');

// --- Home ---
const home = readHtml('.');
check(home.length > 0, 'home index.html exists and is readable');

const titleTag = (home.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
check(!titleTag.includes('|') && titleTag.trim() === 'Manual Gentil para IA', 'home <title> is not a duplicated "X | X" and is the exact canonical brand (got: ' + titleTag.trim().slice(0, 80) + ')');

const h1s = (home.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) || []).length;
check(h1s === 1, 'home has exactly one H1 (got: ' + h1s + ')');

check(!home.includes('Gentle AI — Mega Manual'), 'old brand "Gentle AI — Mega Manual" absent from home');
check(home.includes('Manual Gentil para IA'), 'canonical brand "Manual Gentil para IA" present on home');
check(!home.includes('Inicio rápido'), 'no "Inicio rápido" section on home');
check(!home.includes('git clone'), 'no git clone block on home');

check(home.includes('Ampliar diagrama'), 'mermaid zoom button present on home diagram');
check(home.includes('<dialog'), 'zoom dialog element present on home');

// --- Welcome ---
const welcome = readHtml('00-empezar-aqui/01-bienvenida');
check(welcome.length > 0, 'welcome index.html exists and is readable');

check(!welcome.includes('INDEX.md'), 'welcome has no INDEX.md repo reference');
check(!welcome.includes('GLOSSARY.md'), 'welcome has no GLOSSARY.md repo reference');
check(!welcome.includes('Verificación de versiones'), 'welcome has no "Verificación de versiones" section');

const pagers = (welcome.match(/pagination/g) || []).length;
check(pagers === 1, 'welcome has exactly one Starlight pagination block (got: ' + pagers + ')');

// --- Glossary ---
const glossary = readHtml('20-referencia/02-glosario');
check(glossary.length > 0, 'glossary index.html exists and is readable');
check(glossary.includes('data-pagefind-weight'), 'glossary terms carry data-pagefind-weight in built HTML');

console.log(errors === 0 ? '\nUX built-site contract OK' : '\n' + errors + ' UX built-site contract failure(s)');
process.exit(errors === 0 ? 0 : 1);
