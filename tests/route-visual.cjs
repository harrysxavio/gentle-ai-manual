// tests/route-visual.cjs — Visual + accessibility verification for Route Continuity
// Requires: npx playwright install --with-deps chromium + running `npx astro preview`

const { chromium } = require('playwright');
const { expect } = require('playwright/test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const BASE = '/gentle-ai-manual';
const HOST = 'http://localhost:4321';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'tmp', 'route-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let passed = 0, failed = 0;
async function check(name, fn) { try { await fn(); passed++; console.log(`  ✅ ${name}`); } catch(e) { failed++; console.log(`  ❌ ${name}: ${e.message}`); } }

(async () => {
  const browser = await chromium.launch();

  // ═══ ROUTE CONTEXT — dark desktop ═══
  console.log('\nRoute context — dark desktop (1440×900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-context-desktop-dark.png'), fullPage: true });

    // Route context header exists
    await check('route context section visible', async () => {
      assert.ok(await page.locator('[data-route-context]').isVisible());
    });

    // Route name is shown
    await check('route title shown', async () => {
      const text = await page.locator('[data-route-name]').textContent();
      assert.ok(text.includes('Principiante') || text.includes('total'), `route name contains "Principiante", got: "${text}"`);
    });

    // Step N of M is shown
    await check('step N of M shown', async () => {
      const text = await page.locator('[data-route-step]').textContent();
      assert.ok(/Paso \d+ de \d+/.test(text), `step text matches "Paso N de M", got: "${text}"`);
    });

    // Percentage is shown
    await check('percentage shown', async () => {
      const text = await page.locator('[data-route-pct]').textContent();
      assert.ok(text.includes('%'), `percentage includes "%", got: "${text}"`);
    });

    // "Ver recorrido" link exists
    await check('route index link exists', async () => {
      const link = page.locator('[data-route-index-link]');
      await expect(link).toBeVisible();
      const href = await link.getAttribute('href');
      assert.ok(href.includes('principiante-total'), `link points to principiante-total route index, got: "${href}"`);
    });

    // Previous link preserves ?ruta=
    await check('previous link preserves ?ruta=', async () => {
      // First lesson has no previous — check it's hidden or absent
      // The first lesson in principiante-total has prev = null
      const prevLink = page.locator('[data-route-prev]');
      const count = await prevLink.count();
      if (count > 0) {
        const href = await prevLink.getAttribute('href');
        if (href) assert.ok(href.includes('?ruta='), `prev link has ?ruta=, got: "${href}"`);
      }
    });

    // Current lesson has aria-current="step"
    await check('aria-current="step" on current lesson', async () => {
      // The current step marker in the route map
      const currentInMap = page.locator('[data-route-map] [aria-current="step"]');
      const count = await currentInMap.count();
      assert.ok(count >= 1, `found ${count} element(s) with aria-current="step"`);
    });

    // Collapsible route map exists
    await check('route map details element exists', async () => {
      const details = page.locator('[data-route-map]');
      const tag = await details.evaluate(el => el.tagName.toLowerCase());
      assert.equal(tag, 'details', 'route map is a <details> element');
    });

    await check('no horizontal overflow', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width, `overflow: ${ow} > ${page.viewportSize().width}`);
    });

    await check('no nested links', async () => {
      const nested = await page.evaluate(() => {
        const all = document.querySelectorAll('a');
        for (const a of all) {
          if (a.querySelector('a')) return true;
        }
        return false;
      });
      assert.equal(nested, false, 'found nested <a> elements');
    });

    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — light desktop ═══
  console.log('\nRoute context — light desktop (1440×900)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-context-desktop-light.png'), fullPage: true });
    await check('route context visible in light mode', async () => {
      assert.ok(await page.locator('[data-route-context]').isVisible());
    });
    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — tablet (768px) ═══
  console.log('\nRoute context — tablet (768×1024)');
  {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-context-tablet.png'), fullPage: true });
    await check('route context visible on tablet', async () => {
      assert.ok(await page.locator('[data-route-context]').isVisible());
    });
    await check('no horizontal overflow tablet', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width);
    });
    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — mobile (390×844) ═══
  console.log('\nRoute context — mobile (390×844)');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'route-context-mobile-dark.png'), fullPage: true });
    await check('no horizontal overflow mobile', async () => {
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(ow <= page.viewportSize().width);
    });
    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — middle lesson with prev/next ═══
  console.log('\nRoute context — middle lesson');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/01-fundamentos-tecnologicos/01-como-funciona-una-computadora/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Previous link should exist
    await check('previous link exists on middle lesson', async () => {
      const prev = page.locator('[data-route-prev]');
      await expect(prev).toBeVisible();
      const href = await prev.getAttribute('href');
      assert.ok(href.includes('?ruta='), `prev link has ?ruta=, got: "${href}"`);
    });

    // Next link should exist
    await check('next link exists on middle lesson', async () => {
      const next = page.locator('[data-route-next]');
      await expect(next).toBeVisible();
      const href = await next.getAttribute('href');
      assert.ok(href.includes('?ruta='), `next link has ?ruta=, got: "${href}"`);
    });

    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — no query (fallback) ═══
  console.log('\nRoute context — no ?ruta= (fallback)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Standard Starlight pagination should still be available
    // (no-JS fallback: Starlight's own prev/next should work)
    await check('Starlight default pagination available without ruta param', async () => {
      const pagination = page.locator('.pagination-links, .sl-flex a[rel="prev"], .sl-flex a[rel="next"]');
      const count = await pagination.count();
      // Starlight main-content pagination exists for prev/next
      assert.ok(count >= 1, `found ${count} pagination links`);
    });
    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — keyboard access ═══
  console.log('\nRoute context — keyboard access');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Keyboard: tab through route map <details>
    await check('route map toggles via keyboard', async () => {
      const details = page.locator('[data-route-map]');
      const summary = details.locator('summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      const isOpen = await details.evaluate(el => el.hasAttribute('open'));
      assert.ok(isOpen, 'details opened after Enter keyboard press');
      await page.keyboard.press('Escape');
    });

    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — reduced motion ═══
  console.log('\nRoute context — reduced motion');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await check('route context visible with reduced motion', async () => {
      assert.ok(await page.locator('[data-route-context]').isVisible());
    });
    await ctx.close();
  }

  // ═══ ROUTE CONTEXT — no remote requests ═══
  console.log('\nRoute context — no remote requests');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();

    // Track all requests
    const requests = [];
    page.on('request', req => requests.push(req.url()));

    await page.goto(`${HOST}${BASE}/00-empezar-aqui/01-bienvenida/?ruta=principiante-total`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Only allow requests to our own host, static assets, or data URIs
    await check('no tracking or analytics requests', async () => {
      const suspicious = requests.filter(url =>
        !url.startsWith(HOST) &&
        !url.startsWith('data:') &&
        !url.includes('/gentle-ai-manual/')
      );
      assert.equal(suspicious.length, 0, `found unexpected requests: ${JSON.stringify(suspicious)}`);
    });
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
