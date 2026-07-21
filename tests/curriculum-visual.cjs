// tests/curriculum-visual.cjs — Visual + accessibility verification
// Requires: npx playwright install --with-deps chromium + running `npx astro preview`

const { chromium } = require('playwright');
const { expect } = require('playwright/test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const BASE = '/gentle-ai-manual';
const HOST = 'http://localhost:4321';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'tmp', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let passed = 0, failed = 0;
async function check(name, fn) { try { await fn(); passed++; console.log(`  \u2705 ${name}`); } catch(e) { failed++; console.log(`  \u274c ${name}: ${e.message}`); } }

(async () => {
  const browser = await chromium.launch();

  // ═══ LANDING PAGE — dark desktop ═══
  console.log('\nLanding page \u2014 dark desktop (1440\u00d7900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-desktop-dark.png'), fullPage: true });

    await check('8 profile cards', async () => assert.equal(await page.locator('[data-profile-card]').count(), 8));
    await check('grid is 2 cols', async () => {
      const c = await page.locator('.curriculum-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.ok(c >= 2);
    });
    await check('cards have border', async () => {
      assert.notEqual(await page.locator('[data-profile-card]').first().evaluate(el => getComputedStyle(el).borderTopWidth), '0px');
    });
    await check('cards have bg', async () => {
      const bg = await page.locator('[data-profile-card]').first().evaluate(el => getComputedStyle(el).backgroundColor);
      assert.ok(bg !== 'rgba(0, 0, 0, 0)');
    });
    await check('CTA visible', async () => assert.ok(await page.locator('.route-card__cta').first().isVisible()));

    // Accessibility — use aria-labelledby/describedby, not aria-label
    await check('accessible name via aria-labelledby', async () => {
      const card = page.locator('[data-profile-card]').first();
      const labelledBy = await card.getAttribute('aria-labelledby');
      assert.ok(labelledBy, 'Missing aria-labelledby');
      const titleEl = page.locator(`#${labelledBy}`);
      await expect(titleEl).toBeVisible();
    });
    await check('CI fail-red verification', async () => {
      assert.equal(1, 2, 'This MUST fail to verify CI turns red - will be reverted');
    });
    await check('accessible description via aria-describedby', async () => {
      const card = page.locator('[data-profile-card]').first();
      const describedBy = await card.getAttribute('aria-describedby');
      assert.ok(describedBy, 'Missing aria-describedby');
    });

    await ctx.close();
  }

  // ═══ LANDING PAGE — light desktop ═══
  console.log('\nLanding page \u2014 light desktop (1440\u00d7900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-desktop-light.png'), fullPage: true });
    await check('cards have bg in light', async () => {
      const bg = await page.locator('[data-profile-card]').first().evaluate(el => getComputedStyle(el).backgroundColor);
      assert.ok(bg !== 'rgba(0, 0, 0, 0)');
    });
    await ctx.close();
  }

  // ═══ LANDING PAGE — mobile ═══
  console.log('\nLanding page \u2014 mobile (390\u00d7844)');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'landing-mobile-dark.png'), fullPage: true });
    await check('grid is 1 col mobile', async () => {
      const c = await page.locator('.curriculum-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(c, 1);
    });
    await ctx.close();
  }

  // ═══ ROUTE PAGE — dark desktop ═══
  console.log('\nRoute page \u2014 dark desktop (1440\u00d7900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/rutas/principiante-total/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-principiante-desktop-dark.png'), fullPage: true });

    await check('start CTA visible', async () => assert.ok(await page.locator('.route-page__start-cta').isVisible()));
    await check('timeline visible', async () => assert.ok(await page.locator('.timeline').isVisible()));

    // Overview items — computed styles
    await check('overview items have border', async () => {
      const bw = await page.locator('[data-route-overview] .route-overview-item').first().evaluate(el => getComputedStyle(el).borderTopWidth);
      assert.notEqual(bw, '0px');
    });
    await check('overview items have bg', async () => {
      const bg = await page.locator('[data-route-overview] .route-overview-item').first().evaluate(el => getComputedStyle(el).backgroundColor);
      assert.ok(bg !== 'rgba(0, 0, 0, 0)');
    });
    await check('overview items have padding', async () => {
      const pad = await page.locator('[data-route-overview] .route-overview-item').first().evaluate(el => getComputedStyle(el).paddingTop);
      assert.notEqual(pad, '0px');
    });
    await check('overview items have border-radius', async () => {
      const rad = await page.locator('[data-route-overview] .route-overview-item').first().evaluate(el => getComputedStyle(el).borderRadius);
      assert.notEqual(rad, '0px');
    });
    await check('no horizontal overflow', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width);
    });

    await ctx.close();
  }

  // ═══ ROUTE PAGE — light desktop ═══
  console.log('\nRoute page \u2014 light desktop (1440\u00d7900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/rutas/principiante-total/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-principiante-desktop-light.png'), fullPage: true });
    await check('overview items have bg in light', async () => {
      const bg = await page.locator('[data-route-overview] .route-overview-item').first().evaluate(el => getComputedStyle(el).backgroundColor);
      assert.ok(bg !== 'rgba(0, 0, 0, 0)');
    });
    await ctx.close();
  }

  // ═══ ROUTE PAGE — mobile ═══
  console.log('\nRoute page \u2014 mobile (390\u00d7844)');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/rutas/principiante-total/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-principiante-mobile-dark.png'), fullPage: true });
    await check('no horizontal overflow mobile', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width);
    });
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
