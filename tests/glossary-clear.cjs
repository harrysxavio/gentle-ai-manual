// tests/glossary-clear.cjs — Verify Limpiar button fully resets glossary state
// Requires: `npx astro preview` running at the configured HOST + BASE
// Fails hard if server is unavailable — no silent skip
//
// Assertions:
//   1.  search input empty after clear
//   2.  Todas button active after clear
//   3.  Engram button inactive after clear
//   4.  all terms visible (71 de 71 términos)
//   5.  aria-live status updated
//   6.  search input focused after clear
//   7.  counter shows total after clear
//   8.  initial state: counter shows total
//   9.  initial state: Todas is active
//  10.  search narrows results
//  11.  mobile 390x844 no overflow after clear
//  12.  mobile 390x844 no overflow initial
//  13.  desktop no overflow after clear
//  14.  desktop no overflow initial

const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_BASE || '/gentle-ai-manual';
const HOST = process.env.TEST_HOST || 'http://localhost:4321';
const GLOSSARY_URL = HOST + BASE + '/20-referencia/02-glosario/';

let passed = 0, failed = 0;
async function check(name, fn) { try { await fn(); passed++; console.log('  \u2705 ' + name); } catch(e) { failed++; console.log('  \u274c ' + name + ': ' + e.message); } }

(async () => {
  const browser = await chromium.launch();

  // ═══ Desktop (1440x900, dark) ═══
  console.log('\nGlossary clear test — desktop (1440\u00d7900, dark)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(GLOSSARY_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // No glossary-status = server is wrong or page is wrong — fail hard
    const glossaryEl = page.locator('#glossary-status');
    await glossaryEl.waitFor({ state: 'visible', timeout: 10000 });

    // 1. Initial state
    await check('initial counter shows total (71)', async () => {
      const text = await page.locator('#glossary-status').textContent();
      assert.match(text, /71 de 71 t\u00e9rminos/);
    });
    await check('Todas button is active initially', async () => {
      const pressed = await page.locator('[data-cat="all"]').getAttribute('aria-pressed');
      assert.equal(pressed, 'true');
    });
    await check('no horizontal overflow initial', async () => {
      const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(w <= 1, 'overflow width: ' + w);
    });

    // 2. Type search text + select a category
    await page.locator('#glossary-search').fill('mem');
    await page.waitForTimeout(200);

    let searchCount = 71;
    await check('search narrows results', async () => {
      const text = await page.locator('#glossary-status').textContent();
      assert.match(text, /^\d+ de 71 t\u00e9rminos$/);
      searchCount = parseInt(text.match(/^(\d+)/)[1], 10);
      assert.ok(searchCount < 71, 'search should narrow below 71, got ' + searchCount);
    });

    await page.locator('#glossary-search').fill('');
    await page.waitForTimeout(200);
    await page.locator('[data-cat="engram"]').click();
    await page.waitForTimeout(200);
    await check('Engram category narrows independently', async () => {
      const text = await page.locator('#glossary-status').textContent();
      assert.match(text, /^\d+ de 71 t\u00e9rminos$/);
      const c = parseInt(text.match(/^(\d+)/)[1], 10);
      assert.ok(c >= 10 && c < 71, 'Engram category should narrow (got ' + c + ')');
    });
    await check('Engram button is active', async () => {
      const pressed = await page.locator('[data-cat="engram"]').getAttribute('aria-pressed');
      assert.equal(pressed, 'true');
    });

    // 3. Click Limpiar
    await page.locator('#glossary-clear').click();
    await page.waitForTimeout(200);

    // 4. Verify full reset
    await check('search input empty after clear', async () => {
      const val = await page.locator('#glossary-search').inputValue();
      assert.equal(val, '');
    });
    await check('Todas is active after clear', async () => {
      const active = await page.locator('[data-cat="all"]').getAttribute('aria-pressed');
      assert.equal(active, 'true');
    });
    await check('Engram category inactive after clear', async () => {
      const pressed = await page.locator('[data-cat="engram"]').getAttribute('aria-pressed');
      assert.equal(pressed, 'false');
    });
    await check('all terms visible after clear', async () => {
      const text = await page.locator('#glossary-status').textContent();
      assert.match(text, /71 de 71 t\u00e9rminos/);
    });
    await check('search input focused after clear', async () => {
      const activeEl = await page.evaluate(() => document.activeElement?.id);
      assert.equal(activeEl, 'glossary-search');
    });
    await check('no horizontal overflow after clear', async () => {
      const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(w <= 1, 'overflow width: ' + w);
    });

    await ctx.close();
  }

  // ═══ Mobile (390x844, dark) ═══
  console.log('\nGlossary clear test — mobile (390\u00d7844, dark)');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(GLOSSARY_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.locator('#glossary-status').waitFor({ state: 'visible', timeout: 10000 });

    await check('mobile no overflow initial', async () => {
      const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(w <= 1, 'mobile overflow width: ' + w);
    });

    // Click Engram, then Limpiar
    await page.locator('[data-cat="engram"]').click();
    await page.waitForTimeout(200);
    await page.locator('#glossary-clear').click();
    await page.waitForTimeout(200);

    await check('mobile no overflow after clear', async () => {
      const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(w <= 1, 'mobile overflow width: ' + w);
    });

    await ctx.close();
  }

  await browser.close();

  const allPassed = failed === 0;
  console.log('\nGlossary clear test: ' + (allPassed ? 'passed' : 'FAILED'));
  console.log('Skipped critical visual tests: 0');
  if (!allPassed) {
    console.log('FAILURES: ' + failed + ' assertion(s) failed');
  }
  process.exit(allPassed ? 0 : 1);
})();
