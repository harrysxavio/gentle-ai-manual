// tests/glossary-clear.test.cjs — RED: prove clear button doesn't reset category
// GREEN (after fix): clear must reset search + category + counter + accessibility
// Requires: running `npx astro preview`

const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_BASE || '';
const HOST = process.env.TEST_HOST || 'http://localhost:4321';

let passed = 0, failed = 0;
async function check(name, fn) { try { await fn(); passed++; console.log('  \u2705 ' + name); } catch(e) { failed++; console.log('  \u274c ' + name + ': ' + e.message); } }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto(HOST + BASE + '/20-referencia/02-glosario/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Verify the page actually has our glossary component
  const glossaryEl = await page.locator('#glossary-status');
  await glossaryEl.waitFor({ state: 'visible', timeout: 5000 });

  // 1. Initial state
  await check('initial counter shows total (60)', async () => {
    const text = await page.locator('#glossary-status').textContent();
    assert.match(text, /60 de 60 términos/);
  });
  await check('Todas button is active initially', async () => {
    const pressed = await page.locator('[data-cat="all"]').getAttribute('aria-pressed');
    assert.equal(pressed, 'true');
  });

  // 2. Type search text + select a category
  await page.locator('#glossary-search').fill('IA');
  await check('search narrows results', async () => {
    const text = await page.locator('#glossary-status').textContent();
    assert.match(text, /26 de 60 términos/);
  });

  await page.locator('[data-cat="engram"]').click();
  await page.waitForTimeout(200);
  await check('Engram category narrows further', async () => {
    const text = await page.locator('#glossary-status').textContent();
    assert.match(text, /1 de 60 términos/);
  });
  await check('Engram button is active', async () => {
    const pressed = await page.locator('[data-cat="engram"]').getAttribute('aria-pressed');
    assert.equal(pressed, 'true');
  });

  // 3. Click Limpiar
  await page.locator('#glossary-clear').click();
  await page.waitForTimeout(200);

  // 4. Verify full reset
  await check('search input is empty after clear', async () => {
    const val = await page.locator('#glossary-search').inputValue();
    assert.equal(val, '');
  });
  await check('Todas is active after clear', async () => {
    const active = await page.locator('[data-cat="all"]').getAttribute('aria-pressed');
    assert.equal(active, 'true');
  });
  await check('all terms visible after clear', async () => {
    const text = await page.locator('#glossary-status').textContent();
    assert.match(text, /60 de 60 términos/);
  });
  await check('Engram category inactive after clear', async () => {
    const pressed = await page.locator('[data-cat="engram"]').getAttribute('aria-pressed');
    assert.equal(pressed, 'false');
  });
  await check('no horizontal overflow after clear', async () => {
    const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(w === 0, 'overflow width: ' + w);
  });

  await browser.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
})();
