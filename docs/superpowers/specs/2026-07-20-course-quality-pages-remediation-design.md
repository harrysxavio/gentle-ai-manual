# Course Quality and GitHub Pages Remediation Design

This change makes the currently published course honest and dependable without expanding the curriculum. It fixes GitHub Pages navigation, the model selector asset, repository links, Mermaid rendering and syntax validation, CI coverage, localized Markdown violations, and the evidence claims in the coverage matrix.

## Verified baseline

The design was prepared against commit `a101c374fed207c39238f2cc00cf394f9728b8d5` on branch `codex/audit-course-pages`.

| Observation | Evidence at the verified commit | Consequence |
|---|---|---|
| Deployment base is `/gentle-ai-manual/` | `astro.config.mjs` | Root-absolute URLs using another base break on Pages. |
| Landing CTAs use `/gentle-ai-mega-manual-es/` | `src/content/docs/index.mdx` | Both primary calls to action leave the deployed site base. |
| Selector script uses `/gentle-ai-mega-manual-es/scripts/model-selector.js` | `src/content/docs/14-modelos-y-enrutamiento/selector-modelos.mdx` | The interactive selector loads no JavaScript on the deployed site. |
| Public repository is `harrysxavio/gentle-ai-manual` | README web URL and user-provided repository | Starlight social and landing clone instructions still point to the source project name. |
| There are 50 Mermaid fences | `src/content/docs/**/*.{md,mdx}` | They are emitted as code because no renderer is configured. |
| Mermaid validation checks only an allow-list prefix | `scripts/validate-mermaid.cjs` | Invalid diagram bodies can pass CI. |
| CI executes only Markdown lint and build | `.github/workflows/ci.yml` | `check`, validators, integrity tests, and built-site checks are omitted. |
| `MD022` and `MD036` are globally disabled | `.markdownlint.json` | Five localized defects are hidden across one lesson. |
| Coverage claims conflict with repository state | `docs/COVERAGE-VERIFICATION.md` | Planned, partial, and implemented work are presented as equivalent evidence. |

The worktree also contains an untracked `.codegraph/` index. It is operational metadata and is not part of this change.

## Outcome and boundaries

### In scope

1. Make internal links and static assets safe under the configured GitHub Pages base.
2. Point course-owned repository links to `https://github.com/harrysxavio/gentle-ai-manual`.
3. Render Mermaid fences to inline SVG at build time.
4. Parse every Mermaid fence with Mermaid's real parser before build.
5. Validate the generated `dist/` tree, including internal `href`/`src` targets and Mermaid rendering.
6. Make CI run the complete validation contract before uploading a single Pages artifact.
7. Re-enable `MD022` and `MD036` after correcting the five known violations locally.
8. Replace binary coverage assertions with evidence-based states.

### Explicitly out of scope

- Essential/Deep mode UI.
- Progress persistence or progress indicators.
- Broad Markdown-to-MDX migration.
- Complete assessments, rubrics, or learning analytics.
- Local benchmark/evaluation implementation.
- Broad content rewriting, source refreshes, or model-catalog changes.
- A custom domain or alternative hosting provider.

## Architecture

### 1. Base-safe navigation

Content links use relative URLs when the destination is inside the generated site:

- Landing page: `./00-empezar-aqui/` and `./05-instalacion/`.
- Selector script: `../../scripts/model-selector.js` from the selector route.

Relative URLs are deliberate: they preserve local preview behavior and continue to work if the repository slug changes. `astro.config.mjs` remains the deployment authority for `site` and `base`.

Repository URLs are not derived from the deployment base. The Starlight social link, README checkout instructions, and landing-page clone instructions must name the course repository explicitly.

### 2. Build-time Mermaid rendering

Add `rehype-mermaid` to Astro's Markdown pipeline with `strategy: 'inline-svg'`. This converts Mermaid code fences into SVG during the build, so the deployed course does not depend on client-side initialization or a CDN.

`rehype-mermaid` uses Playwright outside a browser. The project therefore declares `playwright` and installs Chromium explicitly in CI. Local contributors run `npx playwright install chromium` once after dependency installation.

The independent `check-mermaid` command extracts fences from both `.md` and `.mdx` files and sends every body to the official `mermaid.parse()` API. It reports file and opening-fence line on failure and exits non-zero if any diagram fails. The build remains a second rendering-level check.

### 3. Generated-site contract

Add a small Node-standard-library validator after `astro build`. It walks `dist/**/*.html` and checks:

- Every root-relative `href` and `src` starts with `/gentle-ai-manual/`.
- Every same-site target resolves to a generated file, directory `index.html`, or public asset.
- No stale `/gentle-ai-mega-manual-es/` URL is emitted.
- The output contains rendered Mermaid SVG and contains no remaining `code.language-mermaid` blocks.
- The selector page references an asset that resolves inside `dist/scripts/`.

The URL resolution and Mermaid-fence extraction logic lives in testable helper modules. CLI files only perform filesystem traversal, reporting, and exit-code handling.

### 4. One CI contract, one deploy artifact

`npm run validate` becomes a sequential, fail-fast pipeline:

1. `astro check`
2. Markdown lint
3. Mermaid parser validation
4. model catalog validation
5. Node tests
6. Astro build
7. generated-site validation

The quality job installs Chromium, executes `npm run validate`, configures Pages, and uploads the validated `dist/`. The deploy job consumes that artifact instead of rebuilding a second, potentially different tree.

### 5. Honest coverage states

`docs/COVERAGE-VERIFICATION.md` uses four meanings consistently:

| State | Meaning |
|---|---|
| Implemented | User-visible behavior or content exists and has direct repository evidence. |
| Partial | Some evidence exists, but the acceptance criterion is not fully demonstrated. |
| Planned | A design, placeholder, or intent exists without usable implementation. |
| Not verified | The repository does not contain enough evidence to assert the criterion. |

The summary must be calculated from the updated rows and must not call a directory, ADR, template, or validator configuration proof of completed behavior. This change records gaps; it does not fill the excluded ones.

## File map

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Register build-time Mermaid rendering and correct repository social URL. |
| `package.json`, `package-lock.json` | Declare renderer/parser/browser dependencies and sequential validation scripts. |
| `src/content/docs/index.mdx` | Base-safe CTAs and correct clone instructions. |
| `src/content/docs/14-modelos-y-enrutamiento/selector-modelos.mdx` | Base-safe selector script URL. |
| `README.md` | Correct checkout path and remove unsupported progress claim. |
| `scripts/lib/mermaid-contract.cjs` | Extract Mermaid fences with source locations and validate through an injected parser. |
| `scripts/validate-mermaid.cjs` | Run the official Mermaid parser across course content. |
| `scripts/lib/site-contract.cjs` | Resolve generated URLs and evaluate built-site invariants. |
| `scripts/validate-built-site.cjs` | Validate `dist/` and emit actionable failures. |
| `tests/mermaid-contract.test.cjs` | RED/GREEN parser contract tests. |
| `tests/site-contract.test.cjs` | RED/GREEN base-path and generated-target tests. |
| `.github/workflows/ci.yml` | Run full checks and deploy the already-validated artifact. |
| `.markdownlint.json` | Re-enable `MD022` and `MD036`. |
| `src/content/docs/06-primer-proyecto/01-primer-sdd.md` | Correct the five localized Markdown violations. |
| `docs/adr/ADR-003-mermaid.md` | Record the actual build-time renderer and parser validation. |
| `docs/COVERAGE-VERIFICATION.md` | Report evidence-based status without overclaiming. |

## Acceptance criteria

- `npm run validate` runs sequentially and exits zero only when every stage passes.
- A deliberately malformed Mermaid fixture fails before implementation and passes only after the validator calls the official parser.
- All 50 current Mermaid blocks parse successfully.
- Generated course pages contain Mermaid SVG, not visible Mermaid code fences.
- No generated local URL contains `/gentle-ai-mega-manual-es/`.
- Landing CTAs, selector script, and every generated same-site target resolve under `/gentle-ai-manual/`.
- Markdown lint passes with `MD022` and `MD036` enabled.
- CI uploads the exact `dist/` tree produced by the quality job; deploy does not rebuild.
- The coverage document distinguishes implemented, partial, planned, and unverified criteria and does not retain the unsupported `42 of 45` claim.
- No excluded feature is implemented as part of this remediation.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Headless Chromium makes CI slower | Install only Chromium, cache npm dependencies, and build once. |
| A Mermaid diagram accepted by the prefix checker is actually invalid | Official parser test is authoritative; render build is independent confirmation. |
| Raw HTML links bypass Starlight's link validator | Validate the generated HTML tree after build. |
| Relative selector asset path changes if route depth changes | Built-site target validation fails with the emitted page path and URL. |
| Coverage rewrite becomes a new content audit | Restrict edits to claims contradicted by repository evidence and preserve criterion numbering. |
