// tests/global-ux.test.cjs — Global UX contract tests (PR 8: global UX + navigation)
// Source-level invariants (run with npm test, no build required).
// A. Brand: "Manual Gentil para IA" as the canonical site brand.
// B. Landing: no quick-start section, no repo-file references on the home page.
// C. Welcome page: horizontal course diagram, no version-verification section,
//    no INDEX.md/GLOSSARY.md repo-file references, no duplicated manual "Siguiente" link.
// D. Search: glossary terms carry data-pagefind-weight so glossary-first ranking works.
// E. Route continuity: the route context hides Starlight's native pagination when a route is active.
// F. Mermaid zoom: accessible zoom (button + dialog + Escape + focus restore) exists and is wired.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

test('A1: starlight site title is the canonical brand "Manual Gentil para IA"', () => {
  const cfg = read('astro.config.mjs');
  assert.match(cfg, /title:\s*'Manual Gentil para IA'/);
  assert.doesNotMatch(cfg, /title:\s*'Gentle AI — Mega Manual'/);
});

test('A2: home page no longer advertises the old brand in its frontmatter title', () => {
  const home = read('src/content/docs/index.mdx');
  assert.doesNotMatch(home, /title:\s*Gentle AI — Mega Manual/);
  assert.match(home, /Manual Gentil para IA/);
});

test('B1: landing has no quick-start section (no git clone / npm install / "Inicio rápido")', () => {
  const home = read('src/content/docs/index.mdx');
  assert.doesNotMatch(home, /Inicio rápido/);
  assert.doesNotMatch(home, /git clone/);
  assert.doesNotMatch(home, /npm install/);
  assert.doesNotMatch(home, /landing-quickstart/);
});

test('B2: landing CTA does not jump straight to install (no "Instalar" button)', () => {
  const home = read('src/content/docs/index.mdx');
  assert.doesNotMatch(home, />Instalar</);
  assert.doesNotMatch(home, /landing-button-secondary/);
});

test('C1: welcome page course diagram is horizontal (flowchart LR)', () => {
  const welcome = read('src/content/docs/00-empezar-aqui/01-bienvenida.md');
  assert.match(welcome, /flowchart LR/);
  assert.doesNotMatch(welcome, /flowchart TB/);
});

test('C2: welcome page drops the "Verificación de versiones" section', () => {
  const welcome = read('src/content/docs/00-empezar-aqui/01-bienvenida.md');
  assert.doesNotMatch(welcome, /Verificación de versiones/);
});

test('C3: welcome page has no repo-file references (INDEX.md / GLOSSARY.md)', () => {
  const welcome = read('src/content/docs/00-empezar-aqui/01-bienvenida.md');
  assert.doesNotMatch(welcome, /INDEX\.md/);
  assert.doesNotMatch(welcome, /GLOSSARY\.md/);
});

test('C4: welcome page has no manual duplicated "Siguiente" link (pager is the single source)', () => {
  const welcome = read('src/content/docs/00-empezar-aqui/01-bienvenida.md');
  assert.doesNotMatch(welcome, /\*\*Siguiente\*\*|> \*\*Siguiente\*\*|Siguiente.*Módulo 01/);
});

test('C5: welcome page links the web glossary route instead of the repo file', () => {
  const welcome = read('src/content/docs/00-empezar-aqui/01-bienvenida.md');
  assert.match(welcome, /20-referencia\/02-glosario/);
});

test('D1: glossary terms carry data-pagefind-weight for glossary-first search ranking', () => {
  const glossary = read('src/components/reference/Glossary.astro');
  assert.match(glossary, /data-pagefind-weight/);
  assert.match(glossary, /data-pagefind-weight="10"/);
});

test('E1: route context hides Starlight native pagination when a route is active', () => {
  const routeCtx = read('public/scripts/route-context.js');
  assert.match(routeCtx, /pagination-links/);
});

test('E2: route context adds a body-level flag when a route is active', () => {
  const routeCtx = read('public/scripts/route-context.js');
  assert.match(routeCtx, /data-route-active|has-active-route/);
});

test('F1: accessible Mermaid zoom script exists with button, dialog, Escape, focus restore', () => {
  const zoom = read('public/scripts/mermaid-zoom.js');
  assert.match(zoom, /Ampliar diagrama/);
  assert.match(zoom, /dialog/);
  assert.match(zoom, /Escape/);
  assert.match(zoom, /focus/);
});

test('F2: the Mermaid zoom rehype plugin exists and wraps diagrams', () => {
  const plugin = read('src/plugins/mermaid-zoom.js');
  assert.match(plugin, /aria-roledescription|mermaid/);
  assert.match(plugin, /Ampliar diagrama/);
});

test('F3: astro.config registers the mermaid zoom plugin after rehypeMermaid', () => {
  const cfg = read('astro.config.mjs');
  assert.match(cfg, /mermaid-zoom/);
});

test('G1: custom.css provides the landing width override (1050-1200px)', () => {
  const css = read('src/styles/custom.css');
  assert.match(css, /landing/);
  assert.match(css, /72rem|73rem|74rem|1152px|1200px/);
});

test('G2: custom.css grows curriculum cards to 3 columns on wide screens', () => {
  const css = read('src/styles/custom.css');
  assert.match(css, /curriculum-grid/);
  assert.match(css, /repeat\(3/);
});
