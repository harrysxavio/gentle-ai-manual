// tests/curriculum-visual.test.cjs — Visual verification for curriculum components

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const BASE = '/gentle-ai-manual';
const HOST = 'http://localhost:4321';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'tmp', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try { await fn(); passed++; console.log(`  ✅ ${name}`); }
  catch (e) { failed++; console.log(`  ❌ ${name}: ${e.message}`); }
}

async function run() {
  const browser = await chromium.launch();

  // ─── Landing page — dark desktop ───
  console.log('\nLanding page — dark desktop (1440×900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-desktop-dark.png'), fullPage: true });

    await check('8 profile cards', async () => {
      assert.equal(await page.locator('[data-profile-card]').count(), 8);
    });
    await check('grid is 2 columns', async () => {
      const cols = await page.locator('.curriculum-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.ok(cols >= 2);
    });
    await check('cards have visible border', async () => {
      const bw = await page.locator('[data-profile-card]').first().evaluate(el => getComputedStyle(el).borderTopWidth);
      assert.notEqual(bw, '0px');
    });
    await check('cards have background', async () => {
      const bg = await page.locator('[data-profile-card]').first().evaluate(el => getComputedStyle(el).backgroundColor);
      assert.ok(bg !== 'rgba(0, 0, 0, 0)');
    });
    await check('CTA is visible', async () => {
      assert.ok(await page.locator('.route-card__cta').first().isVisible());
    });
    await check('recommended badge exists', async () => {
      assert.ok(await page.locator('.route-card__badge').first().isVisible());
    });
    await check('no horizontal overflow', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width);
    });
    await ctx.close();
  }

  // ─── Landing page — light desktop ───
  console.log('\nLanding page — light desktop (1440×900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-desktop-light.png'), fullPage: true });

    await check('cards have background in light mode', async () => {
      const bg = await page.locator('[data-profile-card]').first().evaluate(el => getComputedStyle(el).backgroundColor);
      assert.ok(bg !== 'rgba(0, 0, 0, 0)');
    });
    await ctx.close();
  }

  // ─── Landing page — mobile ───
  console.log('\nLanding page — mobile (390×844)');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-mobile-dark.png'), fullPage: true });

    await check('grid is 1 column on mobile', async () => {
      const cols = await page.locator('.curriculum-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(cols, 1);
    });
    await check('no horizontal overflow', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width);
    });
    await ctx.close();
  }

  // ─── Route page — desktop ───
  console.log('\nRoute page — dark desktop');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/rutas/principiante-total/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-principiante-desktop-dark.png'), fullPage: true });

    await check('start CTA visible', async () => assert.ok(await page.locator('.route-page__start-cta').isVisible()));
    await check('timeline visible', async () => assert.ok(await page.locator('.timeline').isVisible()));
    await check('overview items exist', async () => {
      const n = await page.locator('.route-overview-item').count();
      assert.ok(n >= 4);
    });
    await ctx.close();
  }

  await browser.close();

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
