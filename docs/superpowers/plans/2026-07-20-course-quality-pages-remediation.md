# Course Quality and GitHub Pages Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing course deploy reliably under GitHub Pages and make its rendering, CI, lint, and coverage claims verifiable.

**Architecture:** Keep Astro/Starlight and the current content structure. Add build-time Mermaid SVG rendering, official-parser validation, and a post-build site contract; use relative content URLs for Pages portability and deploy the exact artifact that passed quality checks.

**Tech Stack:** Astro 5, Starlight, MDX, Node.js 22 in CI, Node test runner, Mermaid, rehype-mermaid, Playwright Chromium, GitHub Actions, GitHub Pages.

## Global constraints

- Baseline is commit `a101c374fed207c39238f2cc00cf394f9728b8d5` on `codex/audit-course-pages`.
- Keep GitHub Pages base `/gentle-ai-manual/` and site `https://harrysxavio.github.io`.
- Do not implement Essential/Deep modes, progress, broad MDX migration, complete assessments, or benchmarks.
- Use RED → GREEN → REFACTOR for validator behavior; observe the expected failure before implementation.
- Do not make unrelated content or dependency changes.
- Do not create commits while executing this plan; hand the verified diff back for review first.

---

### Task 1: Lock the generated-site URL contract

**Files:**
- Create: `scripts/lib/site-contract.cjs`
- Create: `scripts/validate-built-site.cjs`
- Create: `tests/site-contract.test.cjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `validateBuiltSite({ distDir, base }) -> string[]`, where an empty array means success.
- Produces: CLI `node scripts/validate-built-site.cjs --base /gentle-ai-manual/ dist`.
- Consumes later: the built `dist/` tree created in Task 4.

- [ ] **Step 1: Write failing URL-resolution tests**

Create `tests/site-contract.test.cjs` with temporary HTML fixtures. Cover one behavior per test:

```javascript
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
  const distDir = fixture({ 'index.html': '<a href="/gentle-ai-mega-manual-es/start/">Start</a>' });
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.match(errors.join('\n'), /outside configured base/);
});

test('rejects a missing target inside the Pages base', () => {
  const distDir = fixture({ 'index.html': '<script src="/gentle-ai-manual/scripts/missing.js"></script>' });
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.match(errors.join('\n'), /target does not exist/);
});

test('accepts generated directories, files, fragments, and relative assets', () => {
  const distDir = fixture({
    'index.html': '<a href="./start/">Start</a>',
    'start/index.html': '<script src="../scripts/selector.js"></script><h1 id="ok">OK</h1>',
    'scripts/selector.js': 'void 0;',
  });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});
```

- [ ] **Step 2: Run the tests and observe RED**

Run:

```powershell
node --test tests/site-contract.test.cjs
```

Expected: FAIL with `Cannot find module '../scripts/lib/site-contract.cjs'`.

- [ ] **Step 3: Implement the minimal site contract**

Create `scripts/lib/site-contract.cjs`. The implementation must:

1. Walk HTML files below `distDir`.
2. Extract quoted `href` and `src` attributes.
3. Ignore `http:`, `https:`, `mailto:`, `tel:`, `data:`, and fragment-only values.
4. Resolve relative URLs against the current generated page.
5. Strip query and fragment before filesystem lookup.
6. Require root-relative URLs to start with `base`.
7. Accept a direct file or `<path>/index.html`.
8. Return deterministic `relative-page: URL: reason` errors.

Export exactly:

```javascript
module.exports = { validateBuiltSite };
```

Create `scripts/validate-built-site.cjs` as a thin CLI that parses `--base` and `dist`, calls `validateBuiltSite`, prints every returned error, and exits `1` when the array is non-empty.

- [ ] **Step 4: Verify GREEN**

Run:

```powershell
node --test tests/site-contract.test.cjs
```

Expected: 3 tests pass and exit code is `0`.

- [ ] **Step 5: Add the post-build command**

Add to `package.json`:

```json
"check-site": "node scripts/validate-built-site.cjs --base /gentle-ai-manual/ dist"
```

Do not add `check-site` to `validate` until Task 4 establishes build ordering.

---

### Task 2: Fix Pages routes, selector loading, and repository links

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/content/docs/index.mdx`
- Modify: `src/content/docs/14-modelos-y-enrutamiento/selector-modelos.mdx`
- Modify: `README.md`
- Test: `tests/site-contract.test.cjs`

**Interfaces:**
- Consumes: `validateBuiltSite` from Task 1.
- Produces: base-portable internal links and repository URL `https://github.com/harrysxavio/gentle-ai-manual`.

- [ ] **Step 1: Add a stale-base regression test**

Extend `tests/site-contract.test.cjs` with a test that scans an HTML fixture containing each stale path and asserts both are rejected:

```javascript
test('reports every stale course base in one pass', () => {
  const distDir = fixture({
    'index.html': '<a href="/gentle-ai-mega-manual-es/00-empezar-aqui/">Start</a>',
    'selector/index.html': '<script src="/gentle-ai-mega-manual-es/scripts/model-selector.js"></script>',
  });
  const errors = validateBuiltSite({ distDir, base: '/gentle-ai-manual/' });
  assert.equal(errors.length, 2);
});
```

- [ ] **Step 2: Verify RED against the current source/build**

Run:

```powershell
npm run build
npm run check-site
```

Expected: FAIL and report emitted URLs under `/gentle-ai-mega-manual-es/` and/or unresolved selector assets.

- [ ] **Step 3: Apply the minimal URL changes**

Make these exact substitutions:

| File | Replace | With |
|---|---|---|
| `src/content/docs/index.mdx` | `/gentle-ai-mega-manual-es/00-empezar-aqui/` | `./00-empezar-aqui/` |
| `src/content/docs/index.mdx` | `/gentle-ai-mega-manual-es/05-instalacion/` | `./05-instalacion/` |
| `src/content/docs/14-modelos-y-enrutamiento/selector-modelos.mdx` | `/gentle-ai-mega-manual-es/scripts/model-selector.js` | `../../scripts/model-selector.js` |
| `astro.config.mjs` social GitHub URL | source-project URL | `https://github.com/harrysxavio/gentle-ai-manual` |
| landing clone block | source-project clone and directory | `git clone https://github.com/harrysxavio/gentle-ai-manual.git` and `cd gentle-ai-manual` |
| README checkout block | nested `cd gentle-ai-manual/gentle-ai-mega-manual-es` | `cd gentle-ai-manual` |

Remove the README claim that the web version has a progress bar; progress is explicitly out of scope.

- [ ] **Step 4: Verify source and built output**

Run:

```powershell
git grep -n "gentle-ai-mega-manual-es" -- README.md astro.config.mjs src/content/docs
npm run build
npm run check-site
```

Expected: grep returns no stale course URL or clone path (the internal npm package name is outside this check); build and site contract pass.

---

### Task 3: Replace Mermaid prefix checks with real parsing

**Files:**
- Create: `scripts/lib/mermaid-contract.cjs`
- Create: `tests/mermaid-contract.test.cjs`
- Modify: `scripts/validate-mermaid.cjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `extractMermaidBlocks(content, source) -> Array<{ source, line, diagram }>`.
- Produces: `validateMermaidFiles(files, parse) -> Promise<string[]>`.
- The `parse` argument has signature `(diagram: string) -> Promise<unknown>` and production passes `mermaid.parse`.

- [ ] **Step 1: Install the parser/render dependencies**

Run:

```powershell
npm install rehype-mermaid mermaid
npm install --save-dev playwright
npx playwright install chromium
```

Expected: `package.json` and `package-lock.json` contain the dependencies and Chromium installation exits `0`.

- [ ] **Step 2: Write failing extraction and parser tests**

Create `tests/mermaid-contract.test.cjs` with:

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { extractMermaidBlocks, validateMermaidBlocks } = require('../scripts/lib/mermaid-contract.cjs');

test('extracts Mermaid fences and records the opening line', () => {
  const blocks = extractMermaidBlocks('# Title\n\n```mermaid\ngraph TD\nA --> B\n```\n', 'lesson.md');
  assert.deepEqual(blocks, [{ source: 'lesson.md', line: 3, diagram: 'graph TD\nA --> B' }]);
});

test('reports parser failures with source and line', async () => {
  const blocks = [{ source: 'lesson.md', line: 7, diagram: 'not a diagram' }];
  const errors = await validateMermaidBlocks(blocks, async () => { throw new Error('Parse error'); });
  assert.deepEqual(errors, ['lesson.md:7: Parse error']);
});
```

- [ ] **Step 3: Observe RED**

Run:

```powershell
node --test tests/mermaid-contract.test.cjs
```

Expected: FAIL because `scripts/lib/mermaid-contract.cjs` does not exist.

- [ ] **Step 4: Implement extraction and parser delegation**

Create `scripts/lib/mermaid-contract.cjs` with only the two exported responsibilities:

```javascript
module.exports = { extractMermaidBlocks, validateMermaidBlocks };
```

Use a CRLF-safe fence expression, reset matching state for each file, trim diagram bodies, calculate the opening-fence line from the match index, reject empty blocks, and await `parse(block.diagram)` for every non-empty block. Do not retain the diagram-type allow-list.

Rewrite `scripts/validate-mermaid.cjs` to:

1. Recursively collect `.md` and `.mdx` below `src/content/docs`.
2. Dynamically import `mermaid` from CommonJS.
3. Call `validateMermaidBlocks(blocks, diagram => mermaid.default.parse(diagram))`.
4. Print the number of parsed blocks on success.
5. Print all source-located failures and exit `1` otherwise.

- [ ] **Step 5: Verify GREEN and real-parser behavior**

Run:

```powershell
node --test tests/mermaid-contract.test.cjs
npm run check-mermaid
```

Expected: unit tests pass; the command reports exactly 50 parsed Mermaid diagrams. If any existing diagram fails, correct only that diagram's syntax and re-run until all 50 pass.

---

### Task 4: Render Mermaid as SVG and validate generated output

**Files:**
- Modify: `astro.config.mjs`
- Modify: `scripts/lib/site-contract.cjs`
- Modify: `tests/site-contract.test.cjs`
- Modify: `package.json`
- Modify: `docs/adr/ADR-003-mermaid.md`

**Interfaces:**
- Consumes: `rehype-mermaid` and installed Chromium.
- Produces: inline SVG in generated course pages.
- Extends: `validateBuiltSite` to require rendered Mermaid and reject surviving Mermaid code fences.

- [ ] **Step 1: Add RED generated-output tests**

Add separate tests to `tests/site-contract.test.cjs`:

```javascript
test('rejects an unrendered Mermaid code fence in generated HTML', () => {
  const distDir = fixture({ 'index.html': '<pre><code class="language-mermaid">graph TD</code></pre>' });
  assert.match(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }).join('\n'), /unrendered Mermaid/);
});

test('accepts rendered Mermaid SVG', () => {
  const distDir = fixture({ 'index.html': '<svg class="mermaid" role="img"></svg>' });
  assert.deepEqual(validateBuiltSite({ distDir, base: '/gentle-ai-manual/' }), []);
});
```

- [ ] **Step 2: Observe RED**

Run:

```powershell
node --test tests/site-contract.test.cjs
```

Expected: the unrendered-fence test fails because the validator does not yet inspect Mermaid output.

- [ ] **Step 3: Register build-time rendering**

In `astro.config.mjs`, import `rehypeMermaid` and add:

```javascript
markdown: {
  rehypePlugins: [[rehypeMermaid, { strategy: 'inline-svg' }]],
},
```

Keep the existing integrations and Pages settings unchanged.

- [ ] **Step 4: Implement generated Mermaid checks**

Extend `validateBuiltSite` to report every `code` element whose class contains `language-mermaid`. Across the complete generated site, require at least one Mermaid-generated SVG. Keep this check independent from syntax parsing.

- [ ] **Step 5: Verify GREEN at unit and build levels**

Run:

```powershell
node --test tests/site-contract.test.cjs
npm run build
npm run check-site
```

Expected: all unit tests pass, build exits `0`, generated output contains SVG, and no generated HTML retains `language-mermaid`.

- [ ] **Step 6: Align the ADR with reality**

Update `docs/adr/ADR-003-mermaid.md` to state:

- `rehype-mermaid` renders inline SVG during Astro builds.
- Playwright Chromium is a build prerequisite.
- `npm run check-mermaid` uses the official parser.
- `npm run check-site` proves generated rendering.

Remove the inaccurate claim that Starlight provides a native Mermaid plugin.

---

### Task 5: Restore localized Markdown quality rules

**Files:**
- Modify: `.markdownlint.json`
- Modify: `src/content/docs/06-primer-proyecto/01-primer-sdd.md`

**Interfaces:**
- Produces: Markdown accepted with `MD022` and `MD036` enabled globally.

- [ ] **Step 1: Reproduce the five hidden violations**

Run:

```powershell
npx markdownlint-cli "src/content/docs" --enable MD022 MD036
```

Expected: one `MD022` failure near line 253 and four `MD036` failures near lines 406, 444, 484, and 566, all in `01-primer-sdd.md`.

- [ ] **Step 2: Apply only the localized corrections**

In `.markdownlint.json`, delete the `MD022` and `MD036` overrides.

In the lesson:

- Add one blank line after `## Validaciones`.
- Convert each emphasized task label to a level-three heading:

```markdown
### Tarea T002: storage.ts
### Tarea T003: notas.ts
### Tarea T004: index.ts
### Tarea T005: package.json y tsconfig.json
```

Do not reformat unrelated content or enable any other disabled rule in this task.

- [ ] **Step 3: Verify GREEN**

Run:

```powershell
npm run lint
```

Expected: exit code `0` with `MD022` and `MD036` active.

---

### Task 6: Make the coverage matrix evidence-based

**Files:**
- Modify: `docs/COVERAGE-VERIFICATION.md`

**Interfaces:**
- Produces: a 45-row matrix using only `Implemented`, `Partial`, `Planned`, or `Not verified`.

- [ ] **Step 1: Capture the contradictions before editing**

Run:

```powershell
git grep -n -E "42 cubiertos|42 de 45|Modos Esencial|Benchmark local|Laboratorios|Diagramas válidos|Enlaces válidos|barra de progreso" -- docs/COVERAGE-VERIFICATION.md README.md
```

Expected: current output includes implemented checkmarks for planned or unverified behavior and the unsupported `42 of 45` total.

- [ ] **Step 2: Rewrite status semantics and affected rows**

Add the four-state legend from the design document. Preserve all criterion numbers, but classify each row from direct evidence. At minimum:

- Criterion 7 is `Planned`, not implemented.
- Criterion 8 is `Implemented` only after Tasks 3 and 4 pass.
- Criterion 9 is `Implemented` only after Task 1 validates generated targets.
- Criterion 27 is `Planned` because benchmarks remain out of scope.
- Criterion 29 may describe existing laboratory content, but must not claim completed evaluation/rubric behavior.
- Claims 33, 39, 41, 43, 44, and 45 are `Partial` or `Not verified` unless direct, complete evidence is listed.

Delete historical phase claims that contradict the current tree. Replace the `42 of 45` result with counts recalculated from the final row states. State explicitly that planned artifacts are not implemented coverage.

- [ ] **Step 3: Check matrix integrity**

Run:

```powershell
$rows = (Select-String -Path docs/COVERAGE-VERIFICATION.md -Pattern '^\|\s*(?:[1-9]|[1-3][0-9]|4[0-5])\s*\|').Count
if ($rows -ne 45) { throw "Expected 45 criterion rows, found $rows" }
git grep -n -E "42 cubiertos|42 de 45" -- docs/COVERAGE-VERIFICATION.md
```

Expected: row count is `45`; grep returns no match.

---

### Task 7: Make CI validate once and deploy the same artifact

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `check-mermaid`, `test`, `build`, and `check-site` from prior tasks.
- Produces: a Pages artifact whose bytes passed the quality job.

- [ ] **Step 1: Make the npm contract sequential**

Set these scripts in `package.json`:

```json
"test": "node tests/run.cjs && node --test tests/*.test.cjs",
"validate": "npm run check && npm run lint && npm run check-mermaid && npm run check-models && npm run test && npm run build && npm run check-site"
```

The `&&` operators are required. The existing single `&` operators do not provide a portable fail-fast sequence.

- [ ] **Step 2: Run the complete contract locally**

Run:

```powershell
npm run validate
```

Expected order: Astro check → Markdown lint → 50 Mermaid parses → model validation → integrity and contract tests → build → built-site validation. Any non-zero stage stops the sequence.

- [ ] **Step 3: Restructure the workflow**

In `.github/workflows/ci.yml`, make `quality` perform this exact sequence after `npm ci`:

```yaml
- name: Install Chromium for Mermaid rendering
  run: npx playwright install --with-deps chromium
- name: Validate course
  run: npm run validate
- uses: actions/configure-pages@v4
- uses: actions/upload-pages-artifact@v3
  with:
    path: dist/
```

Keep the deploy job dependent on `quality`, but remove checkout, Node setup, dependency installation, and rebuild from deploy. Its only material action after environment setup must be:

```yaml
- id: deployment
  uses: actions/deploy-pages@v4
```

Keep Pages permissions least-privileged and ensure deployment runs only for pushes to `main`, not pull requests.

- [ ] **Step 4: Validate workflow and final repository contract**

Run:

```powershell
npm run validate
git diff --check
git status --short
```

Expected:

- Full validation exits `0`.
- `git diff --check` emits no whitespace errors.
- Status lists only the planned remediation paths; `.codegraph/` remains untracked and must not be staged.

After push by the maintainer, verify the Actions run shows a successful `quality` job before `deploy`, and manually smoke-test:

- `https://harrysxavio.github.io/gentle-ai-manual/`
- Both landing CTAs.
- A rendered Mermaid diagram in light and dark themes.
- Model selector filtering and clear action.
- Starlight GitHub social link.

## Final self-review checklist

- [ ] Every requirement in the design maps to one task above.
- [ ] No task implements an explicit non-goal.
- [ ] Validator behavior was observed failing before implementation.
- [ ] All interfaces and commands use the same `/gentle-ai-manual/` base.
- [ ] `npm run validate` is sequential and includes post-build validation.
- [ ] The deployed artifact is not rebuilt after quality approval.
- [ ] No real commit was created.
