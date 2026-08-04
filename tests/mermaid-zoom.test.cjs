// tests/mermaid-zoom.test.cjs — Mermaid zoom script behavior tests.
// Covers the two fixes in public/scripts/mermaid-zoom.js:
//   1. Native <dialog>: clicking the backdrop (outside the dialog rect) closes.
//   2. No-showModal fallback: accessible modal overlay/panel with focus trap,
//      Escape, click-outside, body scroll lock, and multi-diagram independence.
//   3. Pointer-initiated closes install a time-bounded one-shot click guard
//      that swallows the second click of a double-click (backdrop-dismiss
//      regression) only within ~500ms, and the fallback scroll lock covers
//      both <html> and <body> for iOS Safari.
//   4. Fallback stacked closes route focus into the remaining panel (never an
//      aria-hidden subtree), and the click guard expires with time.
//   5. Focus-on-body robustness: a pointer click on non-focusable panel
//      content moves focus to body in real browsers, so the fallback binds
//      its Escape/Tab trap at DOCUMENT level; Escape still closes (only the
//      topmost overlay when stacked) and Tab is trapped into the panel.
//   6. Position-aware click guard: after a pointer close, only a click within
//      10px of the closing position is swallowed (the second click of a real
//      double-click); deliberate clicks elsewhere pass through, and closes
//      whose coordinates are (0,0) never swallow anything.
//   7. Production-shape focus coverage: the clone svg has no tabindex in
//      production, so the close button is the ONLY focusable; the single-
//      focusable wrap-around and the document-level trap are pinned.
//   8. Open-side click guard: a pointer click that OPENS the modal arms the
//      same position-aware guard (tighter radius), so the second click of a
//      double-click on the open button — which lands on the new
//      overlay/backdrop at the same position — cannot flash-close the modal
//      it just opened; a later deliberate click elsewhere still closes.
//   9. Stacked Escape ownership: with two fallback modals open, one Escape
//      with focus inside the top panel closes exactly the top overlay (the
//      panel handler stops propagation so the overlay below's document trap
//      never sees the event), and Escape from body still closes exactly one
//      overlay per keypress.
//  10. Escape disarm: a pointer open arms the position-aware click guard, but
//      every keyboard Escape close path (panel keydown, document keydown,
//      native dialog keydown) fully disarms it — window state, capture
//      listener, safety timer — so the next pointer click on the open button
//      is never swallowed, and the disarm is idempotent across stacked
//      modals.
//  11. Fallback aria-controls: while a fallback panel is live it is the
//      referenced dialog (the open button's aria-controls points at the
//      panel id, not the display:none <dialog>); closing restores the
//      original dialog id.
// Native path is exercised with prototype stubs (jsdom lacks showModal/close);
// the fallback path uses jsdom's default dialog (no showModal at all).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT_SOURCE = fs.readFileSync(path.join(ROOT, 'public/scripts/mermaid-zoom.js'), 'utf8');
const CSS_SOURCE = fs.readFileSync(path.join(ROOT, 'src/styles/custom.css'), 'utf8');

// Mirror of the rehype plugin output, simplified per test contract. The clone
// svg carries tabindex="0" by default so the fallback focus trap has two
// focusable nodes; pass { svgTabindex: false } for the production shape, where
// the clone svg has NO tabindex and the close button is the only focusable.
function makeFigure(id, opts) {
  opts = opts || {};
  const cloneSvg = opts.svgTabindex === false
    ? '<svg id="mz-mermaid-' + id + '-clone"></svg>'
    : '<svg id="mz-mermaid-' + id + '-clone" tabindex="0"></svg>';
  return [
    '<figure class="mermaid-zoom" data-mermaid-zoom>',
    '  <div class="mermaid-zoom__stage"><svg id="mermaid-' + id + '"></svg></div>',
    '  <figcaption class="mermaid-zoom__actions">',
    '    <button class="mermaid-zoom__btn" aria-haspopup="dialog" aria-controls="mz-mermaid-' + id + '" aria-expanded="false">Ampliar diagrama</button>',
    '  </figcaption>',
    '  <dialog id="mz-mermaid-' + id + '" class="mermaid-zoom__dialog" aria-label="Diagrama ampliado" data-pagefind-ignore>',
    '    <div class="mermaid-zoom__dialog-body">' + cloneSvg + '</div>',
    '    <button class="mermaid-zoom__close">Cerrar diagrama</button>',
    '  </dialog>',
    '</figure>',
  ].join('\n');
}

const RECT = {
  left: 100, top: 100, right: 300, bottom: 300,
  width: 200, height: 200, x: 100, y: 100,
  toJSON: function () { return this; },
};

// Stub the native dialog API on the prototype BEFORE the script binds, plus a
// per-dialog getBoundingClientRect (jsdom returns zeros otherwise).
function stubNative(dom) {
  const window = dom.window;
  window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  const dialogs = window.document.querySelectorAll('.mermaid-zoom__dialog');
  for (let i = 0; i < dialogs.length; i++) {
    dialogs[i].getBoundingClientRect = () => RECT;
  }
}

// Boot a fresh JSDOM page containing the given figures, load the script, and
// fire DOMContentLoaded (readyState is 'loading' under runScripts: 'outside-only').
function boot(html, opts) {
  opts = opts || {};
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body>' + html + '</body></html>', {
    runScripts: 'outside-only',
  });
  // jsdom has no window.scrollTo implementation and logs "Not implemented"
  // warnings to stderr on every scroll-lock release; stub it so the noise
  // disappears. FB23 still overrides it to undefined per-test to exercise the
  // runtime typeof guard in the script.
  dom.window.scrollTo = function () {};
  if (opts.native) stubNative(dom);
  dom.window.eval(SCRIPT_SOURCE);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}

function query(dom, selector) {
  return dom.window.document.querySelector(selector);
}

function clickAt(dom, target, x, y) {
  // detail >= 1 marks a real pointer click (the script ignores detail 0
  // synthetic activation clicks), matching browser behavior.
  target.dispatchEvent(new dom.window.MouseEvent('click', { clientX: x, clientY: y, bubbles: true, detail: 1 }));
}

// Coordinate-bearing pointer click that returns the event: used by the
// position-aware guard tests to observe preventDefault (requires cancelable).
function pointerClickAt(dom, target, x, y) {
  const event = new dom.window.MouseEvent('click', {
    clientX: x, clientY: y, detail: 1, bubbles: true, cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

// Keyboard-activated click (Enter/Space on a button): detail 0 with clientX/Y
// (0,0), cancelable so defaultPrevented is observable. Returns the event.
function keyboardClickAt(dom, target) {
  const event = new dom.window.MouseEvent('click', {
    detail: 0, clientX: 0, clientY: 0, bubbles: true, cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function keyOn(dom, target, key, shiftKey) {
  const event = new dom.window.KeyboardEvent('keydown', {
    key: key, bubbles: true, cancelable: true, shiftKey: !!shiftKey,
  });
  target.dispatchEvent(event);
  return event;
}

function overlays(dom) {
  return dom.window.document.querySelectorAll('.mermaid-zoom__overlay');
}

function overlaysCount(dom) {
  return overlays(dom).length;
}

function panelOf(dom, index) {
  const node = overlays(dom)[index];
  return node ? node.querySelector('.mermaid-zoom__panel') : null;
}

function openFigure(dom, figure) {
  figure.querySelector('.mermaid-zoom__btn').click();
}

function closeFigure(dom, figure) {
  figure.querySelector('.mermaid-zoom__close').click();
}

/* ===================== NATIVE <dialog> matrix (8) ===================== */

test('N1: native — click outside the dialog rect closes the dialog', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  assert.equal(dialog.hasAttribute('open'), true, 'dialog should be open');
  clickAt(dom, dialog, 50, 50); // rect is 100..300, so 50,50 is outside
  assert.equal(dialog.hasAttribute('open'), false, 'backdrop click should close');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
});

test('N2: native — click inside the panel keeps the dialog open', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  clickAt(dom, dialog, 150, 150); // inside the rect
  assert.equal(dialog.hasAttribute('open'), true, 'click inside must not close');
  assert.equal(figure.querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'true');
});

test('N3: native — click in visible empty space inside the rect keeps open', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  clickAt(dom, dialog, 200, 150); // inside rect, on dialog surface
  assert.equal(dialog.hasAttribute('open'), true);
});

test('N4: native — close button closes the dialog', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  closeFigure(dom, figure);
  assert.equal(dialog.hasAttribute('open'), false);
});

test('N5: native — Escape closes the dialog', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  keyOn(dom, dialog, 'Escape');
  assert.equal(dialog.hasAttribute('open'), false);
});

test('N6: native — focus returns to the "Ampliar diagrama" button on close', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  closeFigure(dom, figure);
  assert.equal(dom.window.document.activeElement, openBtn);
});

test('N7: native — reopening works after a close', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  closeFigure(dom, figure);
  openFigure(dom, figure);
  assert.equal(dialog.hasAttribute('open'), true, 'dialog must be open again');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
});

test('N8: native — two diagrams are independent', () => {
  const dom = boot(makeFigure(0) + makeFigure(1), { native: true });
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const d0 = figures[0].querySelector('.mermaid-zoom__dialog');
  const d1 = figures[1].querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(d0.hasAttribute('open'), true);
  assert.equal(d1.hasAttribute('open'), true);
  closeFigure(dom, figures[0]);
  assert.equal(d0.hasAttribute('open'), false, 'closed diagram must close');
  assert.equal(d1.hasAttribute('open'), true, 'other diagram must stay open');
  assert.equal(figures[0].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'false');
  assert.equal(figures[1].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'true');
});

/* ============ Fallback matrix (no showModal — jsdom default, 19) ============ */

test('FB1: fallback — the old open-attribute fallback is gone (no open attr)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  assert.equal(dialog.hasAttribute('open'), false, 'dialog must never get an open attribute');
  assert.equal(dialog.open, false);
});

test('FB2: fallback — a dedicated overlay exists in the DOM', () => {
  const dom = boot(makeFigure(0));
  openFigure(dom, query(dom, 'figure[data-mermaid-zoom]'));
  assert.equal(overlaysCount(dom), 1);
  const overlay = overlays(dom)[0];
  assert.ok(overlay.classList.contains('mermaid-zoom__overlay'));
});

test('FB3: fallback — panel has role="dialog"', () => {
  const dom = boot(makeFigure(0));
  openFigure(dom, query(dom, 'figure[data-mermaid-zoom]'));
  assert.equal(panelOf(dom, 0).getAttribute('role'), 'dialog');
});

test('FB4: fallback — panel has aria-modal="true"', () => {
  const dom = boot(makeFigure(0));
  openFigure(dom, query(dom, 'figure[data-mermaid-zoom]'));
  assert.equal(panelOf(dom, 0).getAttribute('aria-modal'), 'true');
});

test('FB5: fallback — panel has accessible name "Diagrama ampliado"', () => {
  const dom = boot(makeFigure(0));
  openFigure(dom, query(dom, 'figure[data-mermaid-zoom]'));
  assert.equal(panelOf(dom, 0).getAttribute('aria-label'), 'Diagrama ampliado');
});

test('FB6: fallback — focus moves into the panel on open', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  assert.equal(dom.window.document.activeElement, closeBtn);
  assert.ok(panelOf(dom, 0).contains(closeBtn), 'focused node must live inside the panel');
});

test('FB7: fallback — Tab at the last focusable wraps to the first (preventDefault)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  openFigure(dom, figure);
  const panel = panelOf(dom, 0);
  const svg = panel.querySelector('#mz-mermaid-0-clone');
  const closeBtn = panel.querySelector('.mermaid-zoom__close');
  closeBtn.focus(); // last focusable
  const event = keyOn(dom, closeBtn, 'Tab', false);
  assert.equal(event.defaultPrevented, true, 'Tab on last must be prevented');
  assert.equal(dom.window.document.activeElement, svg, 'focus must wrap to the first focusable');
});

test('FB8: fallback — Shift+Tab at the first focusable wraps to the last', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  openFigure(dom, figure);
  const panel = panelOf(dom, 0);
  const svg = panel.querySelector('#mz-mermaid-0-clone');
  const closeBtn = panel.querySelector('.mermaid-zoom__close');
  svg.focus(); // first focusable
  const event = keyOn(dom, svg, 'Tab', true);
  assert.equal(event.defaultPrevented, true, 'Shift+Tab on first must be prevented');
  assert.equal(dom.window.document.activeElement, closeBtn, 'focus must wrap to the last focusable');
});

test('FB9: fallback — Escape closes the modal', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  assert.equal(overlaysCount(dom), 1);
  keyOn(dom, closeBtn, 'Escape');
  assert.equal(overlaysCount(dom), 0, 'overlay must be removed');
  assert.ok(figure.contains(closeBtn), 'close button must be back inside the figure');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
});

test('FB10: fallback — click on the overlay itself closes', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  openFigure(dom, figure);
  const overlay = overlays(dom)[0];
  overlay.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  assert.equal(figure.querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'false');
});

test('FB11: fallback — click inside the panel does not close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  openFigure(dom, figure);
  const panel = panelOf(dom, 0);
  const svg = panel.querySelector('#mz-mermaid-0-clone');
  svg.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal(overlaysCount(dom), 1, 'clicks on panel children must not close');
});

test('FB12: fallback — overlay covers the viewport (fixed, inset 0, body child)', () => {
  const dom = boot(makeFigure(0));
  openFigure(dom, query(dom, 'figure[data-mermaid-zoom]'));
  const overlay = overlays(dom)[0];
  assert.equal(overlay.parentElement, dom.window.document.body, 'overlay must be a direct body child');
  assert.match(CSS_SOURCE, /\.mermaid-zoom__overlay\s*\{[^}]*position:\s*fixed[^}]*inset:\s*0/);
});

test('FB13: fallback — body scroll is locked while open', () => {
  const dom = boot(makeFigure(0));
  openFigure(dom, query(dom, 'figure[data-mermaid-zoom]'));
  assert.equal(dom.window.document.body.style.overflow, 'hidden');
});

test('FB14: fallback — body scroll is restored on close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  closeBtn.click();
  assert.equal(dom.window.document.body.style.overflow, '');
});

test('FB15: fallback — focus returns to the open button on close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  closeBtn.click();
  assert.equal(dom.window.document.activeElement, openBtn);
});

test('FB16: fallback — overlay is removed from the DOM on close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  const overlay = overlays(dom)[0];
  closeBtn.click();
  assert.equal(overlaysCount(dom), 0);
  assert.ok(!dom.window.document.body.contains(overlay));
  assert.ok(figure.contains(closeBtn), 'children moved back into the dialog');
});

test('FB17: fallback — reopen creates exactly one fresh overlay (no accumulation)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  closeBtn.click();
  openFigure(dom, figure);
  assert.equal(overlaysCount(dom), 1, 'exactly one overlay after reopen');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  closeBtn.click();
  assert.equal(overlaysCount(dom), 0, 'a single close action still closes');
  assert.equal(dom.window.document.body.style.overflow, '');
});

test('FB18: fallback — several diagrams are independent; scroll lock is shared', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const body = dom.window.document.body;
  const c0 = figures[0].querySelector('.mermaid-zoom__close');
  const c1 = figures[1].querySelector('.mermaid-zoom__close');
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(overlaysCount(dom), 2, 'one overlay per open diagram');
  c0.click();
  assert.equal(overlaysCount(dom), 1, 'closing one leaves the other overlay');
  assert.equal(body.style.overflow, 'hidden', 'body stays locked while one modal is open');
  assert.equal(figures[1].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'true');
  c1.click();
  assert.equal(overlaysCount(dom), 0);
  assert.equal(body.style.overflow, '', 'body unlocked only after the last modal closes');
});

test('FB19: fallback — clone ids stay unique (children are moved, not cloned)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  openFigure(dom, figure);
  const clones = dom.window.document.querySelectorAll('#mz-mermaid-0-clone');
  assert.equal(clones.length, 1, 'exactly one clone node in the document');
  assert.ok(panelOf(dom, 0).contains(clones[0]), 'the single clone lives inside the panel');
});

/* ============ Regression fixes: double-open, synthetic clicks, focus trap, aria-hidden, scrollTo (6) ============ */

test('FB20: fallback — double open keeps exactly one overlay and one close clears it', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openBtn.click();
  openBtn.click();
  assert.equal(overlaysCount(dom), 1, 'second open must not create a second overlay');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  closeBtn.click();
  assert.equal(overlaysCount(dom), 0, 'one close must clear the single overlay');
  assert.equal(dom.window.document.body.style.overflow, '', 'scroll lock must be released');
});

test('N9: native — double open is a no-op even with a throwing showModal stub', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  let open = false;
  dialog.showModal = function () {
    if (open) throw new Error('already open');
    open = true;
    this.setAttribute('open', '');
  };
  dialog.close = function () {
    open = false;
    this.removeAttribute('open');
  };
  openBtn.click();
  assert.doesNotThrow(() => openBtn.click(), 'second open must never reach showModal');
  assert.equal(dialog.hasAttribute('open'), true, 'dialog must stay open');
  assert.equal(dialog.open, true, 'exactly one open state');
});

test('N10: native — synthetic keyboard click (detail 0) never closes the dialog', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  // Enter/Space activation fires click with detail 0 and clientX/Y (0,0), which
  // sits outside the rect and would look like a backdrop click without the guard.
  dialog.dispatchEvent(new dom.window.MouseEvent('click', {
    clientX: 50, clientY: 50, bubbles: true, detail: 0,
  }));
  assert.equal(dialog.hasAttribute('open'), true, 'detail 0 click must not close');
  dialog.dispatchEvent(new dom.window.MouseEvent('click', {
    clientX: 50, clientY: 50, bubbles: true, detail: 1,
  }));
  assert.equal(dialog.hasAttribute('open'), false, 'real click outside the rect still closes');
});

test('FB21: fallback — whitespace click keeps focus inside the panel trap', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  openFigure(dom, figure);
  const panel = panelOf(dom, 0);
  const closeBtn = panel.querySelector('.mermaid-zoom__close');
  assert.equal(panel.getAttribute('tabindex'), '-1', 'panel must be focusable');
  // Click on empty panel space; jsdom does not move focus on mousedown, so
  // focus the panel explicitly like a real browser would.
  panel.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, detail: 1 }));
  panel.focus();
  assert.equal(dom.window.document.activeElement, panel, 'whitespace click focuses the panel');
  let event = keyOn(dom, panel, 'Tab', false);
  assert.equal(event.defaultPrevented, true, 'Tab from the panel must be trapped');
  const svg = panel.querySelector('#mz-mermaid-0-clone');
  assert.equal(dom.window.document.activeElement, svg, 'Tab from panel goes to the first focusable');
  panel.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, detail: 1 }));
  panel.focus();
  event = keyOn(dom, panel, 'Tab', true);
  assert.equal(event.defaultPrevented, true, 'Shift+Tab from the panel must be trapped');
  assert.equal(dom.window.document.activeElement, closeBtn, 'Shift+Tab from panel goes to the last focusable');
  assert.ok(panel.contains(dom.window.document.activeElement), 'focus must stay inside the panel');
});

test('FB22: fallback — background is hidden from assistive tech while open', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  const children = dom.window.document.body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].getAttribute('aria-hidden'), 'true', 'every non-overlay body child must be hidden');
  }
  closeBtn.click();
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].hasAttribute('aria-hidden'), false, 'aria-hidden must be removed on close');
  }
});

test('FB23: fallback — close survives a missing window.scrollTo', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  dom.window.scrollTo = undefined;
  openFigure(dom, figure);
  assert.doesNotThrow(() => closeBtn.click(), 'close must not throw without scrollTo');
  assert.equal(overlaysCount(dom), 0, 'overlay must be removed');
  assert.equal(dom.window.document.body.style.overflow, '', 'scroll lock must be released');
});

test('FB24: fallback — out-of-order close (A open, B open, close A, close B) leaves no aria-hidden residue', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const body = dom.window.document.body;
  const closeA = figures[0].querySelector('.mermaid-zoom__close');
  const closeB = figures[1].querySelector('.mermaid-zoom__close');
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(overlaysCount(dom), 2, 'one overlay per open figure');
  assert.equal(body.style.overflow, 'hidden', 'body locked with both modals open');
  closeA.click();
  assert.equal(overlaysCount(dom), 1, 'closing A leaves B overlay');
  assert.equal(body.style.overflow, 'hidden', 'body stays locked while B is open');
  const afterCloseA = body.children;
  for (let i = 0; i < afterCloseA.length; i++) {
    if (afterCloseA[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(afterCloseA[i].getAttribute('aria-hidden'), 'true', 'background stays hidden after closing A');
  }
  closeB.click();
  assert.equal(overlaysCount(dom), 0, 'last close removes the final overlay');
  assert.equal(body.style.overflow, '', 'body unlocked only after the last close');
  const children = body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].hasAttribute('aria-hidden'), false, 'no aria-hidden residue after out-of-order close');
  }
  openFigure(dom, figures[0]);
  assert.equal(overlaysCount(dom), 1, 'reopen after out-of-order close creates exactly one overlay');
});

/* ===== Backdrop-dismiss regression: double-click pass-through, html scroll lock (4) ===== */

test('FB25: fallback — one-shot click guard swallows the second click of a double-click after overlay close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  // Pointer close on the overlay: the first click of the double-click pair.
  clickAt(dom, overlays(dom)[0], 10, 10);
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  assert.ok(figure.contains(closeBtn), 'children moved back into the dialog');
  // The second click of the pair lands on the open button underneath.
  clickAt(dom, openBtn, 10, 10);
  assert.equal(overlaysCount(dom), 0, 'the second click must be swallowed');
  assert.ok(figure.contains(closeBtn), 'dialog children still in the dialog');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
  // The guard removed itself: a fresh click reopens the modal.
  clickAt(dom, openBtn, 10, 10);
  assert.equal(overlaysCount(dom), 1, 'a fresh click must reopen exactly one overlay');
});

test('FB26: native — one-shot click guard after backdrop close', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  assert.equal(dialog.hasAttribute('open'), true, 'dialog must be open');
  // Pointer backdrop click (outside the rect): the first click of the pair.
  clickAt(dom, dialog, 50, 50);
  assert.equal(dialog.hasAttribute('open'), false, 'backdrop click must close');
  // The second click of a real double-click lands at the SAME position as
  // the first (50,50), on the open button underneath: it must be swallowed.
  clickAt(dom, openBtn, 50, 50);
  assert.equal(dialog.hasAttribute('open'), false, 'the same-position second click must be swallowed');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
  // The guard removed itself: a fresh click reopens the dialog.
  clickAt(dom, openBtn, 10, 10);
  assert.equal(dialog.hasAttribute('open'), true, 'a fresh click must reopen the dialog');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
});

test('FB27: fallback — scroll lock covers html and body', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  assert.equal(dom.window.document.documentElement.style.overflow, 'hidden', 'html must be locked');
  assert.equal(dom.window.document.body.style.overflow, 'hidden', 'body must be locked');
  closeBtn.click();
  assert.equal(dom.window.document.documentElement.style.overflow, '', 'html overflow restored');
  assert.equal(dom.window.document.body.style.overflow, '', 'body overflow restored');
});

test('FB28: fallback — Escape close does not swallow the next click', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  keyOn(dom, closeBtn, 'Escape');
  assert.equal(overlaysCount(dom), 0, 'Escape must close');
  clickAt(dom, openBtn, 10, 10);
  assert.equal(overlaysCount(dom), 1, 'the next click after Escape must open immediately');
});

/* ===== Determinism fixes: stacked-close focus routing, time-bounded swallow (2) ===== */

test('FB29: fallback — closing the first of two open diagrams moves focus into the remaining panel, not an aria-hidden subtree', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const body = dom.window.document.body;
  const closeA = figures[0].querySelector('.mermaid-zoom__close');
  const closeB = figures[1].querySelector('.mermaid-zoom__close');
  const openBtnB = figures[1].querySelector('.mermaid-zoom__btn');
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(overlaysCount(dom), 2, 'one overlay per open figure');
  closeA.click();
  assert.equal(overlaysCount(dom), 1, 'closing A leaves B overlay');
  // Focus must land inside B's panel — never on A's open button, which sits
  // in a body child still hidden with aria-hidden (restored only when the
  // last modal closes).
  const panelB = panelOf(dom, 0);
  const active = dom.window.document.activeElement;
  assert.ok(panelB.contains(active), 'focus must land inside the remaining panel');
  let holder = active;
  while (holder && holder.parentElement !== body) {
    holder = holder.parentElement;
  }
  assert.ok(holder, 'active element must be reachable from a body child');
  assert.ok(holder.classList.contains('mermaid-zoom__overlay'), 'focus must live inside an overlay, never an aria-hidden subtree');
  assert.notEqual(holder.getAttribute('aria-hidden'), 'true', 'focus holder must not be hidden');
  closeB.click();
  assert.equal(overlaysCount(dom), 0, 'last close removes the final overlay');
  assert.equal(dom.window.document.activeElement, openBtnB, 'focus returns to the last-closed figure\'s open button');
  const children = body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].hasAttribute('aria-hidden'), false, 'no aria-hidden residue after both closes');
  }
});

test('FB30: fallback — the click swallow is time-bounded (expired after ~500ms)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  // Deterministic fake clock for the guard's Date.now() window. node:test's
  // mock timers cannot reach Date.now() inside the jsdom window realm (each
  // jsdom window carries its own built-ins), so drive the window's Date
  // directly: the script's Date resolves to dom.window.Date.
  const originalNow = dom.window.Date.now;
  let fakeNow = 1000;
  dom.window.Date.now = function () { return fakeNow; };
  try {
    openFigure(dom, figure);
    assert.equal(overlaysCount(dom), 1, 'modal must be open');
    // Pointer close on the overlay arms the 500ms guard (window: 1000..1500).
    clickAt(dom, overlays(dom)[0], 10, 10);
    assert.equal(overlaysCount(dom), 0, 'overlay click must close');
    // Inside the window the immediate next click is still swallowed.
    clickAt(dom, openBtn, 10, 10);
    assert.equal(overlaysCount(dom), 0, 'click inside the 500ms window must be swallowed');
    // Advance the clock past the window: a click now must open the modal.
    fakeNow = 1700;
    clickAt(dom, openBtn, 10, 10);
    assert.equal(overlaysCount(dom), 1, 'click after the window must open the modal');
    assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  } finally {
    dom.window.Date.now = originalNow;
  }
});

/* ===== Position-aware click guard: radius, pass-through, safe (0,0) default (4) ===== */

test('FB34: fallback — a deliberate click on a different element (different position) is NOT swallowed after a close-button close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  // A counter button standing in for a nav link or page control.
  const counterBtn = dom.window.document.createElement('button');
  let clicks = 0;
  counterBtn.addEventListener('click', () => { clicks++; });
  dom.window.document.body.appendChild(counterBtn);
  // Pointer close via the close button at (50,50) arms the guard.
  pointerClickAt(dom, closeBtn, 50, 50);
  assert.equal(overlaysCount(dom), 0, 'close-button pointer click must close');
  // Within 500ms, a deliberate single click on a different element at a
  // different position must NOT be swallowed: it must reach its handler.
  const event = pointerClickAt(dom, counterBtn, 10, 10);
  assert.equal(event.defaultPrevented, false, 'distant click must not be prevented');
  assert.equal(clicks, 1, 'distant click must reach its handler');
  assert.equal(overlaysCount(dom), 0, 'no phantom reopen from the swallowed guard');
});

test('FB35: fallback — the same-position second click (double-click) is still swallowed after an overlay close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  // First click of the pair: pointer close on the overlay at (10,10).
  pointerClickAt(dom, overlays(dom)[0], 10, 10);
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  // Second click of the pair lands at the SAME position (10,10) — the
  // double-click case — and must still be swallowed with coordinates set.
  const event = pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(event.defaultPrevented, true, 'same-position click must be swallowed');
  assert.equal(overlaysCount(dom), 0, 'swallowed click must not reopen');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
  // The guard consumed itself: a fresh click reopens the modal.
  pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(overlaysCount(dom), 1, 'a fresh click must reopen exactly one overlay');
});

test('FB36: fallback — radius boundary: exactly 10px away is swallowed, 11px away is not', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  // Pointer close at (10,10); a click exactly 10px away (radius boundary) is
  // still part of the double-click and must be swallowed.
  pointerClickAt(dom, overlays(dom)[0], 10, 10);
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  let event = pointerClickAt(dom, openBtn, 20, 10);
  assert.equal(event.defaultPrevented, true, 'click at the 10px boundary must be swallowed');
  assert.equal(overlaysCount(dom), 0, 'boundary click must not reopen');
  // Guard consumed; reopen, close again, then click 11px away: NOT swallowed.
  pointerClickAt(dom, openBtn, 20, 10);
  assert.equal(overlaysCount(dom), 1, 'a fresh click must reopen');
  pointerClickAt(dom, overlays(dom)[0], 10, 10);
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  event = pointerClickAt(dom, openBtn, 21, 10);
  assert.equal(event.defaultPrevented, false, 'click 11px away must not be swallowed');
  assert.equal(overlaysCount(dom), 1, 'click just outside the radius must reopen the modal');
});

test('FB36b: fallback — a pointer close at coordinates (0,0) never swallows the next click (safe default)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  // Pointer close whose coordinates are unavailable (0,0 — synthetic-style
  // event): the guard must treat the position as unverifiable, swallow
  // nothing, and disarm on the next click.
  pointerClickAt(dom, closeBtn, 0, 0);
  assert.equal(overlaysCount(dom), 0, 'close-button pointer click must close');
  const event = pointerClickAt(dom, openBtn, 0, 0);
  assert.equal(event.defaultPrevented, false, 'a click at (0,0) must never be swallowed');
  assert.equal(overlaysCount(dom), 1, 'the click must reach the open button');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
});

/* ===== Focus-on-body robustness: document-level Escape/Tab trap (3) ===== */

// Real browsers move focus to body after a pointer click on non-focusable
// modal content (the production clone svg has no tabindex, and the
// .mermaid-zoom__dialog-body ring is plain div padding). The keydown trap is
// bound to the panel only, so Escape/Tab keydowns dispatched on body never
// reach it. jsdom does not move focus on mousedown and its body.focus() is a
// no-op while another element holds focus, so blur the focused node: the
// focusing steps move focus to body, reproducing the same deterministic
// state a real browser reaches.
function focusBody(dom) {
  const active = dom.window.document.activeElement;
  if (active && active.blur) active.blur();
}

test('FB31: fallback — Escape closes even when focus is on body (document-level handler)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  assert.equal(overlaysCount(dom), 1, 'modal must be open');
  focusBody(dom);
  assert.equal(dom.window.document.activeElement, dom.window.document.body, 'focus must be on body');
  const event = keyOn(dom, dom.window.document, 'Escape');
  assert.equal(event.defaultPrevented, true, 'Escape must be handled at document level');
  assert.equal(overlaysCount(dom), 0, 'overlay must be removed');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
  const children = dom.window.document.body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].hasAttribute('aria-hidden'), false, 'aria-hidden must be restored on close');
  }
});

test('FB32: fallback — Tab from body is trapped into the panel (document-level handler)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  focusBody(dom);
  assert.equal(dom.window.document.activeElement, dom.window.document.body, 'focus must be on body');
  const event = keyOn(dom, dom.window.document, 'Tab', false);
  assert.equal(event.defaultPrevented, true, 'Tab on body must be prevented');
  assert.equal(dom.window.document.activeElement, closeBtn, 'focus must land on the close button inside the panel');
  assert.ok(panelOf(dom, 0).contains(closeBtn), 'focused node must live inside the panel');
  assert.equal(overlaysCount(dom), 1, 'modal must stay open');
});

test('FB33: fallback — Escape from body with stacked overlays closes only the topmost', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const body = dom.window.document.body;
  const closeA = figures[0].querySelector('.mermaid-zoom__close');
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(overlaysCount(dom), 2, 'one overlay per open figure');
  focusBody(dom);
  const event = keyOn(dom, dom.window.document, 'Escape');
  assert.equal(event.defaultPrevented, true, 'Escape must be handled');
  assert.equal(overlaysCount(dom), 1, 'only the topmost overlay must close');
  const remaining = overlays(dom)[0];
  assert.equal(remaining.getAttribute('aria-hidden'), null, 'remaining overlay must never be hidden');
  assert.ok(remaining.contains(closeA), 'deeper overlay still holds its close button (visible)');
  assert.equal(figures[0].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'true', 'deeper figure stays open');
  assert.equal(figures[1].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'false', 'topmost figure closed');
  focusBody(dom);
  keyOn(dom, dom.window.document, 'Escape');
  assert.equal(overlaysCount(dom), 0, 'a second Escape closes the remaining overlay');
  const children = body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].hasAttribute('aria-hidden'), false, 'no aria-hidden residue after both closes');
  }
});

/* ===== Production-shape focus coverage: clone svg has NO tabindex (3) ===== */

// Production emits the clone svg without a tabindex, so the close button is
// the ONLY focusable in the fallback panel (first === last). These tests
// pin the single-focusable wrap-around and the document-level trap against
// the production shape; the two-focusable fixture above stays untouched.

test('FB37: fallback — production shape: Tab from body is trapped onto the close button (document-level)', () => {
  const dom = boot(makeFigure(0, { svgTabindex: false }));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  focusBody(dom);
  assert.equal(dom.window.document.activeElement, dom.window.document.body, 'focus must be on body');
  const event = keyOn(dom, dom.window.document, 'Tab', false);
  assert.equal(event.defaultPrevented, true, 'Tab on body must be prevented');
  assert.equal(dom.window.document.activeElement, closeBtn, 'focus must land on the close button (the only focusable)');
  assert.ok(panelOf(dom, 0).contains(closeBtn), 'focused node must live inside the panel');
  assert.equal(overlaysCount(dom), 1, 'modal must stay open');
});

test('FB38: fallback — production shape: Tab on the close button wraps onto itself (first === last)', () => {
  const dom = boot(makeFigure(0, { svgTabindex: false }));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  openFigure(dom, figure);
  closeBtn.focus();
  assert.equal(dom.window.document.activeElement, closeBtn, 'close button must be focused');
  const event = keyOn(dom, closeBtn, 'Tab', false);
  assert.equal(event.defaultPrevented, true, 'Tab on the only focusable must be prevented');
  assert.equal(dom.window.document.activeElement, closeBtn, 'focus must stay on the close button');
  assert.equal(overlaysCount(dom), 1, 'modal must stay open');
});

test('FB39: fallback — production shape: Escape on document still closes with a single focusable', () => {
  const dom = boot(makeFigure(0, { svgTabindex: false }));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  focusBody(dom);
  assert.equal(dom.window.document.activeElement, dom.window.document.body, 'focus must be on body');
  const event = keyOn(dom, dom.window.document, 'Escape');
  assert.equal(event.defaultPrevented, true, 'Escape must be handled at document level');
  assert.equal(overlaysCount(dom), 0, 'overlay must be removed');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
});

/* ===== Open-side double-click guard + stacked Escape ownership (4) ===== */

test('FB40: fallback — double-click on the open button does not flash-close the new overlay', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  // Click 1 of the pair: a pointer click opens the modal. The button is now
  // covered by the full-viewport overlay, so click 2 lands on the overlay at
  // the same position.
  pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(overlaysCount(dom), 1, 'click 1 must open exactly one overlay');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  const second = pointerClickAt(dom, overlays(dom)[0], 10, 10);
  assert.equal(second.defaultPrevented, true, 'click 2 at the same position must be swallowed');
  assert.equal(overlaysCount(dom), 1, 'click 2 must not close the modal it just opened');
  assert.ok(panelOf(dom, 0).contains(closeBtn), 'children must stay inside the panel');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  // A later deliberate click on the overlay at a different position closes.
  pointerClickAt(dom, overlays(dom)[0], 400, 400);
  assert.equal(overlaysCount(dom), 0, 'a deliberate overlay click must close');
  assert.ok(figure.contains(closeBtn), 'children moved back into the dialog');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
});

test('FB41: native — double-click on the open button does not flash-close the dialog', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(dialog.hasAttribute('open'), true, 'click 1 must open the dialog');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  // The open button sits outside the dialog rect (100..300), so click 2
  // lands on the backdrop at the same position.
  const second = pointerClickAt(dom, dialog, 10, 10);
  assert.equal(second.defaultPrevented, true, 'click 2 at the same position must be swallowed');
  assert.equal(dialog.hasAttribute('open'), true, 'click 2 must not close the dialog');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  // A later deliberate backdrop click outside the rect closes.
  pointerClickAt(dom, dialog, 400, 400);
  assert.equal(dialog.hasAttribute('open'), false, 'a deliberate backdrop click must close');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'false');
});

test('FB42: fallback — stacked Escape with focus inside the top panel closes exactly the top overlay', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const closeA = figures[0].querySelector('.mermaid-zoom__close');
  const closeB = figures[1].querySelector('.mermaid-zoom__close');
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(overlaysCount(dom), 2, 'one overlay per open figure');
  closeB.focus();
  assert.equal(dom.window.document.activeElement, closeB, 'focus must be inside the top panel');
  const event = keyOn(dom, closeB, 'Escape');
  assert.equal(event.defaultPrevented, true, 'Escape must be handled');
  assert.equal(overlaysCount(dom), 1, 'exactly one overlay must remain (not zero)');
  const remaining = overlays(dom)[0];
  assert.ok(remaining.contains(closeA), 'the deeper overlay must still hold its close button');
  assert.equal(figures[0].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'true', 'deeper figure stays open');
  assert.equal(figures[1].querySelector('.mermaid-zoom__btn').getAttribute('aria-expanded'), 'false', 'topmost figure closed');
});

test('FB43: fallback — stacked Escape with focus on body closes exactly one overlay per keypress', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const body = dom.window.document.body;
  openFigure(dom, figures[0]);
  openFigure(dom, figures[1]);
  assert.equal(overlaysCount(dom), 2, 'one overlay per open figure');
  focusBody(dom);
  assert.equal(dom.window.document.activeElement, body, 'focus must be on body');
  keyOn(dom, dom.window.document, 'Escape');
  assert.equal(overlaysCount(dom), 1, 'one Escape from body closes exactly the top overlay');
  focusBody(dom);
  keyOn(dom, dom.window.document, 'Escape');
  assert.equal(overlaysCount(dom), 0, 'a second Escape closes the remaining overlay');
  const children = body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('mermaid-zoom__overlay')) continue;
    assert.equal(children[i].hasAttribute('aria-hidden'), false, 'no aria-hidden residue after both closes');
  }
});

/* ===== Escape disarm: a keyboard close must clear an armed click guard (3) ===== */

test('FB44: fallback — a document-level Escape close disarms the open-side click guard (the next pointer click reopens)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(overlaysCount(dom), 1, 'pointer open must arm the open-side guard and open');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
  focusBody(dom);
  keyOn(dom, dom.window.document, 'Escape');
  assert.equal(overlaysCount(dom), 0, 'Escape must close');
  const again = pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(again.defaultPrevented, false, 'the reopened click must NOT be swallowed');
  assert.equal(overlaysCount(dom), 1, 'the modal must reopen immediately');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
});

test('FB45: native — an Escape close disarms the open-side click guard (the dialog reopens)', () => {
  const dom = boot(makeFigure(0), { native: true });
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(dialog.hasAttribute('open'), true, 'pointer open must open the dialog');
  keyOn(dom, dialog, 'Escape');
  assert.equal(dialog.hasAttribute('open'), false, 'Escape must close the dialog');
  const again = pointerClickAt(dom, openBtn, 10, 10);
  assert.equal(again.defaultPrevented, false, 'the reopened click must NOT be swallowed');
  assert.equal(dialog.hasAttribute('open'), true, 'the dialog must reopen immediately');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
});

test('FB46: fallback — stacked Escape disarms the shared guard and the disarm is idempotent (no listener leak)', () => {
  const dom = boot(makeFigure(0) + makeFigure(1));
  const figures = dom.window.document.querySelectorAll('figure[data-mermaid-zoom]');
  const openBtnA = figures[0].querySelector('.mermaid-zoom__btn');
  const openBtnB = figures[1].querySelector('.mermaid-zoom__btn');
  // Distinct positions so the two pointer opens stack (a same-position
  // second open IS the open-side double-click case and is correctly
  // swallowed). The last arm (B at 20,20, r5) is the shared guard state that
  // an Escape close must clear.
  pointerClickAt(dom, openBtnA, 10, 10);
  pointerClickAt(dom, openBtnB, 20, 20);
  assert.equal(overlaysCount(dom), 2, 'two pointer opens must stack');
  focusBody(dom);
  const esc1 = keyOn(dom, dom.window.document, 'Escape');
  assert.equal(esc1.defaultPrevented, true, 'first Escape must be handled');
  assert.equal(overlaysCount(dom), 1, 'exactly the top overlay must close');
  // The remaining shared guard state must not swallow a deliberate click at
  // the armed position (B's button position): the click closes the bottom
  // modal normally.
  const armedClick = pointerClickAt(dom, overlays(dom)[0], 20, 20);
  assert.equal(armedClick.defaultPrevented, false, 'the disarmed click must not be swallowed');
  assert.equal(overlaysCount(dom), 0, 'the deliberate click must close the bottom overlay');
  // Reopen and double-Escape: the disarm must be idempotent (no throw) and
  // must leave no capture listener behind (a leaked one would swallow the
  // armed-position click after the closes). Positions are >10px from the
  // close-side arm (20,20, r10) left by the previous click so the reopen
  // clicks are never boundary-swallowed.
  pointerClickAt(dom, openBtnA, 40, 40);
  pointerClickAt(dom, openBtnB, 60, 60);
  assert.equal(overlaysCount(dom), 2, 'reopened for the double-Escape pass');
  focusBody(dom);
  keyOn(dom, dom.window.document, 'Escape');
  focusBody(dom);
  assert.doesNotThrow(() => keyOn(dom, dom.window.document, 'Escape'), 'a second Escape on a disarmed guard must not throw');
  assert.equal(overlaysCount(dom), 0, 'both overlays must close');
  const fresh = pointerClickAt(dom, openBtnA, 40, 40);
  assert.equal(fresh.defaultPrevented, false, 'no leaked listener: the click proceeds normally');
  assert.equal(overlaysCount(dom), 1, 'the click reopens a fresh overlay');
});

/* ===== Fallback aria-controls: the panel is the referenced dialog (2) ===== */

test('FB47: fallback — the open button\'s aria-controls points at the live panel, not the hidden dialog', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  openFigure(dom, figure);
  const panel = panelOf(dom, 0);
  assert.equal(panel.getAttribute('role'), 'dialog');
  assert.equal(panel.getAttribute('aria-modal'), 'true');
  assert.equal(panel.getAttribute('aria-label'), 'Diagrama ampliado');
  const panelId = panel.getAttribute('id');
  assert.ok(panelId, 'the panel must carry an id');
  assert.notEqual(panelId, dialog.getAttribute('id'), 'the panel id must differ from the dialog id');
  assert.equal(openBtn.getAttribute('aria-controls'), panelId, 'aria-controls must reference the panel');
  assert.equal(dom.window.document.getElementById(panelId), panel, 'the referenced element must be the live panel');
  assert.ok(!dialog.hasAttribute('open'), 'fallback keeps the dialog closed (display:none)');
});

test('FB48: fallback — aria-controls is restored to the dialog id on close', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  const dialog = figure.querySelector('.mermaid-zoom__dialog');
  // Captured before opening: while the fallback is open the close button
  // lives inside the overlay panel, not in the figure.
  const closeBtn = figure.querySelector('.mermaid-zoom__close');
  const dialogId = dialog.getAttribute('id');
  openFigure(dom, figure);
  assert.notEqual(openBtn.getAttribute('aria-controls'), dialogId, 'while open, aria-controls must point at the panel');
  closeBtn.click();
  assert.equal(openBtn.getAttribute('aria-controls'), dialogId, 'after close, aria-controls must be restored to the dialog');
});

/* ===== Keyboard-activation clicks are never swallowed (2) ===== */

// The capture-phase click guard is armed only by real pointer clicks
// (detail >= 1), but before the detail check the SWALLOW side matched any
// click by coordinates alone: a keyboard-activated click (Enter/Space fires
// click with detail 0 and clientX/Y (0,0)) could be swallowed when the last
// pointer close armed the guard within 10px of viewport (0,0) — e.g.
// dismissing the fallback overlay by clicking its top-left corner region —
// silently losing the keyboard activation. The guard must never eat a
// keyboard click; a keyboard click is a new intentional action, so it still
// CONSUMES the guard, but is never preventDefaulted/stopPropagationed.

test('FB49: fallback — a keyboard click (detail 0) is never swallowed, even when the guard is armed near viewport (0,0)', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  assert.equal(overlaysCount(dom), 1, 'modal must be open');
  // Pointer close near the top-left corner of the viewport (5,5): within the
  // 10px close-side swallow radius of a keyboard click's (0,0) coordinates.
  pointerClickAt(dom, overlays(dom)[0], 5, 5);
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  // Enter/Space activation on the open button fires detail 0 with clientX/Y
  // (0,0): |0-5| <= 10 && |0-5| <= 10, so without the detail guard this
  // keyboard click would be swallowed and the modal would never reopen.
  const kb = keyboardClickAt(dom, openBtn);
  assert.equal(kb.defaultPrevented, false, 'a keyboard click must never be swallowed');
  assert.equal(overlaysCount(dom), 1, 'the keyboard activation must reopen the modal');
  assert.equal(openBtn.getAttribute('aria-expanded'), 'true');
});

test('FB50: fallback — a keyboard click consumes the guard: the next pointer click at the armed position is not swallowed', () => {
  const dom = boot(makeFigure(0));
  const figure = query(dom, 'figure[data-mermaid-zoom]');
  const openBtn = figure.querySelector('.mermaid-zoom__btn');
  openFigure(dom, figure);
  assert.equal(overlaysCount(dom), 1, 'modal must be open');
  // Pointer close at (5,5) arms the close-side guard (r10, 500ms window).
  pointerClickAt(dom, overlays(dom)[0], 5, 5);
  assert.equal(overlaysCount(dom), 0, 'overlay click must close');
  // The keyboard activation is not swallowed and consumes the guard (the
  // double-click pairing is over); the modal reopens.
  const kb = keyboardClickAt(dom, openBtn);
  assert.equal(kb.defaultPrevented, false, 'keyboard click must not be swallowed');
  assert.equal(overlaysCount(dom), 1, 'keyboard click must reopen the modal');
  // No residual arming: a pointer click at the armed position (5,5) on the
  // new overlay is a normal click — it closes the modal instead of being
  // swallowed by a stale guard.
  const pointer = pointerClickAt(dom, overlays(dom)[0], 5, 5);
  assert.equal(pointer.defaultPrevented, false, 'no residual arming: the click must not be swallowed');
  assert.equal(overlaysCount(dom), 0, 'the click must close the modal normally');
});
