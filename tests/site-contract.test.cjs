const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { validateBuiltSite } = require('../scripts/lib/site-contract.cjs');

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gentle-site-'));
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return root;
}

test('rejects a root-relative URL outside the Pages base', () => {
  const distDir = fixture({ 'index.html': '<svg class="mermaid"></svg><a href="/gentle-ai-mega-manual-es/start/">Start</a>' });
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.match(errors.join('\n'), /outside configured base/);
});

test('reports every stale course base in one pass', () => {
  const distDir = fixture({
    'index.html': '<svg class="mermaid"></svg><a href="/gentle-ai-mega-manual-es/00-empezar-aqui/">Start</a>',
    'selector/index.html': '<script src="/gentle-ai-mega-manual-es/scripts/model-selector.js"></script>',
  });
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.equal(errors.length, 2);
});

test('rejects a missing target inside the Pages base', () => {
  const distDir = fixture({ 'index.html': '<svg class="mermaid"></svg><script src="/gentle-ai-manual/scripts/missing.js"></script>' });
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.match(errors.join('\n'), /target does not exist/);
});

test('accepts generated directories, files, fragments, and relative assets', () => {
  const distDir = fixture({
    'index.html': '<svg class="mermaid"></svg><a href="./start/">Start</a>',
    'start/index.html': '<script src="../scripts/selector.js"></script><h1 id="ok">OK</h1>',
    'scripts/selector.js': 'void 0;',
  });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});

test('rejects relative traversal even when the target exists outside dist', () => {
  const workspace = fixture({
    'nested/level/dist/index.html': '<svg class="mermaid"></svg><a href="../../outside.js">Outside</a>',
    'nested/outside.js': 'void 0;',
  });
  const distDir = path.join(workspace, 'nested/level/dist');
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.match(errors.join('\n'), /outside generated site/);
});

test('rejects root-relative traversal even when the target exists outside dist', () => {
  const workspace = fixture({
    'nested/dist/index.html': '<svg class="mermaid"></svg><a href="/gentle-ai-manual/../outside.js">Outside</a>',
    'nested/outside.js': 'void 0;',
  });
  const distDir = path.join(workspace, 'nested/dist');
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.match(errors.join('\n'), /outside generated site/);
});

test('accepts a root-relative direct file after stripping query and fragment', () => {
  const distDir = fixture({
    'index.html': '<svg class="mermaid"></svg><script src="/gentle-ai-manual/scripts/app.js?v=1#boot"></script>',
    'scripts/app.js': 'void 0;',
  });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});

test('keeps query-only and fragment-only URLs on the current document', () => {
  const distDir = fixture({
    'guide.html': '<svg class="mermaid"></svg><a href="?mode=deep">Deep</a><a href="#section">Section</a>',
  });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});

test('rejects an unrendered Mermaid code fence in generated HTML', () => {
  const distDir = fixture({ 'index.html': '<pre><code class="language-mermaid">graph TD</code></pre>' });
  assert.match(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }).join('\n'), /unrendered Mermaid/);
});

test('accepts rendered Mermaid SVG', () => {
  const distDir = fixture({ 'index.html': '<svg class="mermaid" role="img"></svg>' });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});

test('accepts rehype-mermaid inline SVG output', () => {
  const distDir = fixture({
    'index.html': '<svg id="mermaid-0" class="flowchart" aria-roledescription="flowchart-v2"></svg>',
  });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});

test('rejects an unquoted Mermaid class in generated HTML', () => {
  const distDir = fixture({ 'index.html': '<pre><code class=language-mermaid>graph TD</code></pre>' });
  assert.match(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }).join('\n'), /unrendered Mermaid/);
});

test('ignores a Mermaid class string inside another attribute', () => {
  const distDir = fixture({
    'index.html': '<svg class="mermaid"></svg><code data-copy=\'class="language-mermaid"\'>example</code>',
  });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});

test('does not accept Mermaid SVG attributes embedded inside another attribute', () => {
  const distDir = fixture({
    'index.html': '<svg data-copy=\'id="mermaid-0" aria-roledescription="flowchart-v2"\'></svg>',
  });
  assert.match(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }).join('\n'), /rendered Mermaid SVG not found/);
});
