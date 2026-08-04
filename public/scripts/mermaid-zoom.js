// mermaid-zoom.js — Accessible zoom for Mermaid diagrams.
// Paired with the rehype-mermaid-zoom build plugin: every wrapped diagram has
// an "Ampliar diagrama" button, a <dialog> with a static clone of the svg, and
// a "Cerrar diagrama" button. The native <dialog> element traps focus and
// closes on Escape; this script reinforces focus restore, closes native
// dialogs when the backdrop is clicked, and covers browsers without <dialog>
// support with an accessible modal fallback (overlay + panel).
(function () {
  'use strict';

  // Defense-in-depth against double script execution: if this script is ever
  // injected twice, skip the second run instead of double-binding every
  // figure. The current build loads the script exactly once.
  if (window.__mermaidZoomBound) {
    return;
  }
  window.__mermaidZoomBound = true;

  // Module-level shared state: number of fallback modals currently open, the
  // body and html (documentElement) scroll settings captured when the first
  // one locks the page, and the body children hidden from assistive tech
  // while any fallback is open.
  var openCount = 0;
  var scrollLocked = false;
  var savedOverflow = '';
  var savedHtmlOverflow = '';
  var savedPageYOffset = 0;
  var hiddenNodes = [];

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function lockScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    savedOverflow = document.body.style.overflow;
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedPageYOffset = window.pageYOffset || 0;
    // Lock both <body> and <html>: iOS Safari 14.x — a target of this
    // fallback — scrolls from the root scroller, where body-only
    // overflow:hidden is a documented unreliable scroll lock.
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function unlockScroll() {
    openCount = openCount - 1;
    if (openCount <= 0) {
      openCount = 0;
      if (scrollLocked) {
        scrollLocked = false;
        document.body.style.overflow = savedOverflow;
        document.documentElement.style.overflow = savedHtmlOverflow;
        savedOverflow = '';
        savedHtmlOverflow = '';
        // Guard for exotic environments (and jsdom) that lack scrollTo.
        if (typeof window.scrollTo === 'function') {
          window.scrollTo(0, savedPageYOffset);
        }
        savedPageYOffset = 0;
      }
      // The last close restores the body children hidden at first open. The
      // bookkeeping is module-level and shared, so overlapping fallbacks that
      // close out of order never leak aria-hidden onto the page.
      for (var i = 0; i < hiddenNodes.length; i++) {
        var entry = hiddenNodes[i];
        if (entry.prev === null) {
          entry.el.removeAttribute('aria-hidden');
        } else {
          entry.el.setAttribute('aria-hidden', entry.prev);
        }
      }
      hiddenNodes.length = 0;
    }
  }

  // The topmost open fallback overlay, or null when none is open. Overlays are
  // appended to body in open order, so the last one in the DOM owns Escape and
  // Tab, matching native <dialog> stacking semantics.
  function topmostOverlay() {
    var open = document.querySelectorAll('.mermaid-zoom__overlay');
    return open.length > 0 ? open[open.length - 1] : null;
  }

  // Time-bounded, one-shot click guard for pointer-initiated opens and
  // closes. When a modal is dismissed by pointer (backdrop click, fallback
  // overlay click, or the close button), the FIRST click closes it and the
  // SECOND click of a fast double-click lands on the page content that was
  // underneath — activating buttons or links there. The same guard covers
  // the open side: when a pointer click OPENS the modal, the second click of
  // a double-click on the open button lands on the new overlay/backdrop at
  // the same position and would otherwise close the modal it just opened. A
  // single capture-phase listener on document is installed ONCE and armed on
  // every pointer open/close: it swallows (prevented + stopped) the first
  // click that arrives within 500ms of the arm AND within the radius of the
  // armed pointer position, then removes itself no matter what, so no click
  // later than ~500ms is ever eaten. The position check keeps the guard
  // precise: only the second click of a real double-click (which lands at
  // the same spot, give or take a few pixels) is swallowed; a deliberate
  // single click anywhere else inside the window passes through untouched
  // and simply consumes the guard. Closing pointer events without usable
  // coordinates (0,0 — synthetic events) arm a guard that swallows NOTHING:
  // the position is unverifiable, so the safe default is to let the next
  // click through. Open-side arms use a tighter radius (SWALLOW_RADIUS_OPEN)
  // than close-side arms: the open button is small, so a real double-click's
  // second click lands within a few pixels, and 5px keeps the guard from
  // eating deliberate overlay clicks that happen to fall near the button
  // within the window. A 550ms safety timeout guarantees the listener cannot
  // survive even if no click arrives. Rapid successive opens/closes just
  // refresh the window and re-schedule the timeout. Only real pointer clicks
  // (detail >= 1) arm it, and only real pointer clicks are ever swallowed:
  // keyboard activation (detail 0) and Escape paths never do — a keyboard
  // click arriving inside the window still consumes the guard (the
  // double-click pairing is over) but is never preventDefaulted or stopped,
  // so Enter/Space activation always reaches its button.
  var SWALLOW_RADIUS = 10;
  var SWALLOW_RADIUS_OPEN = 5;
  var swallowUntil = 0;
  var swallowX = 0;
  var swallowY = 0;
  var swallowRadius = SWALLOW_RADIUS;
  var swallowHandler = null;
  var swallowTimer = 0;
  function armClickGuard(x, y, radius) {
    swallowUntil = Date.now() + 500;
    // Missing coordinates normalize to (0,0); a guard armed at (0,0) treats
    // the position as unavailable and swallows nothing (see the handler).
    swallowX = x || 0;
    swallowY = y || 0;
    swallowRadius = radius || SWALLOW_RADIUS;
    if (!swallowHandler) {
      var handler = function (event) {
        var now = Date.now();
        if (
          now <= swallowUntil &&
          (swallowX !== 0 || swallowY !== 0) &&
          // Only real pointer clicks (detail >= 1) are ever swallowed. A
          // keyboard-activated click (Enter/Space fires click with detail 0
          // and clientX/Y (0,0)) must never be eaten, even when the armed
          // position is within radius of (0,0). It is still a new intentional
          // action, so it consumes the guard below, but is not prevented or
          // stopped.
          event.detail >= 1 &&
          Math.abs(event.clientX - swallowX) <= swallowRadius &&
          Math.abs(event.clientY - swallowY) <= swallowRadius
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
        swallowUntil = 0;
        document.removeEventListener('click', handler, true);
        if (swallowHandler === handler) {
          swallowHandler = null;
        }
      };
      swallowHandler = handler;
      document.addEventListener('click', handler, true);
    }
    // Safety timeout: even with no click at all the listener is removed just
    // past the window. Re-arming clears the previous timeout; a stale one
    // that fires anyway is a no-op (removing an already removed listener is
    // safe, as is clearing swallowUntil again).
    if (swallowTimer) {
      window.clearTimeout(swallowTimer);
    }
    swallowTimer = window.setTimeout(function () {
      swallowUntil = 0;
      if (swallowHandler) {
        document.removeEventListener('click', swallowHandler, true);
        swallowHandler = null;
      }
    }, 550);
  }

  // Escape closes are keyboard-driven, never pointer-driven: no double-click
  // sequence is in flight, so a guard armed by an earlier pointer event must
  // be fully disarmed — the swallow window state, the capture-phase listener
  // (only the currently armed one-shot; swallowHandler is null once any click
  // or the safety timer has consumed it, so the single-instance invariant
  // holds), and the 550ms safety timer. Every Escape close path (panel
  // keydown, document keydown, native dialog keydown) calls this before
  // closing, so the very next pointer click on the open button is never
  // swallowed. Pointer closes still arm their own guard on the way out, so
  // close-side double-click protection is unaffected. Idempotent: calling it
  // with nothing armed is a no-op, so stacked Escape closes never double-
  // remove a listener or throw.
  function disarmClickGuard() {
    swallowUntil = 0;
    if (swallowHandler) {
      document.removeEventListener('click', swallowHandler, true);
      swallowHandler = null;
    }
    if (swallowTimer) {
      window.clearTimeout(swallowTimer);
      swallowTimer = 0;
    }
  }

  function bindZoom(figure) {
    var openBtn = figure.querySelector('.mermaid-zoom__btn');
    var dialog = figure.querySelector('.mermaid-zoom__dialog');
    var closeBtn = figure.querySelector('.mermaid-zoom__close');
    if (!openBtn || !dialog || !closeBtn) return;

    var supportsDialog = typeof dialog.showModal === 'function';
    var isOpen = false;
    var overlay = null;
    // Fallback mode moves the visible dialog role onto a created panel; while
    // that panel is live the open button's aria-controls must reference it
    // (the original <dialog> is display:none). originalControls captures the
    // dialog id once, and closeFallback restores it when the panel is removed.
    // The native path is untouched: the dialog stays visible and aria-controls
    // is already correct.
    var originalControls = openBtn.getAttribute('aria-controls') || dialog.id;

    // Document-level Escape/Tab trap for fallback mode. A pointer click on
    // non-focusable panel content (the clone svg has no tabindex in
    // production, and the .mermaid-zoom__dialog-body ring is plain div
    // padding) moves focus to body in real browsers; keydown events
    // dispatched on body never reach the panel-level listener, so Escape
    // would stop closing and Tab would leak focus to the page behind the
    // overlay. Binding the trap at document level while a fallback is open
    // restores both, regardless of where focus landed. Only the topmost
    // overlay owns the keys; the panel-level trap still covers events that
    // originate inside this figure's panel (wrap-around, panel-focus
    // routing), and the native dialog path is untouched.
    function onDocKeydown(event) {
      if (!isOpen || !overlay) return;
      if (topmostOverlay() !== overlay) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        disarmClickGuard();
        closeDialog();
        return;
      }
      if (event.key !== 'Tab') return;
      var activeEl = document.activeElement;
      if (!activeEl) return;
      var panelEl = overlay.querySelector('.mermaid-zoom__panel');
      if (panelEl && panelEl.contains(activeEl)) return;
      event.preventDefault();
      // The close button is the first (and in production the only) focusable
      // node in the panel.
      var closeEl = overlay.querySelector('.mermaid-zoom__close');
      if (closeEl) {
        closeEl.focus();
      }
    }

    // Fallback open: build a fixed full-viewport overlay with an accessible
    // panel and MOVE the dialog's children (clone svg + close button) into the
    // panel so the rebased unique clone ids are preserved with no duplicates.
    function openFallback() {
      var panel;
      var panelId;

      overlay = document.createElement('div');
      overlay.className = 'mermaid-zoom__overlay';

      panel = document.createElement('div');
      panel.className = 'mermaid-zoom__panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', 'Diagrama ampliado');
      // The panel is now the live dialog: give it a stable id (derived from
      // the dialog's mz-mermaid-<id>) and repoint the open button's
      // aria-controls at it so assistive tech finds the visible dialog, not
      // the display:none <dialog>.
      panelId = 'mz-panel-' + dialog.id.replace(/^mz-mermaid-/, '');
      panel.setAttribute('id', panelId);
      openBtn.setAttribute('aria-controls', panelId);

      while (dialog.firstChild) {
        panel.appendChild(dialog.firstChild);
      }
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      openCount = openCount + 1;

      // Old screen readers ignore aria-modal and keep reading the page behind
      // the overlay, so hide every other body child from assistive tech while
      // any fallback is open. The shared list is built only on the first open;
      // unlockScroll restores it when the last modal closes, so out-of-order
      // closes never leak aria-hidden. aria-hidden is the correct reversible
      // mechanism here: inert is unsupported by the old Safari this fallback
      // targets.
      if (openCount === 1) {
        hiddenNodes = [];
        var bodyChildren = document.body.children;
        for (var i = 0; i < bodyChildren.length; i++) {
          var child = bodyChildren[i];
          if (child.classList.contains('mermaid-zoom__overlay')) continue;
          hiddenNodes.push({
            el: child,
            prev: child.getAttribute('aria-hidden')
          });
          child.setAttribute('aria-hidden', 'true');
        }
      }

      lockScroll();

      panel.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          disarmClickGuard();
          closeDialog();
          // Keep the event out of the document-level trap: with stacked
          // fallbacks, a bubbling Escape would reach the overlay BELOW,
          // whose onDocKeydown would now see itself as topmost (this overlay
          // was just removed from the DOM) and close a second modal on one
          // keypress. The trap exists only for keydowns that originate
          // outside any panel (focus on body) and does not need this event.
          event.stopPropagation();
          return;
        }
        if (event.key !== 'Tab') return;
        var focusables = panel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        var active = document.activeElement;
        if (active === panel) {
          // Focus landed on the panel itself (e.g. after a whitespace click):
          // route Tab/Shift+Tab into the trap instead of letting it escape to
          // the page behind the modal.
          event.preventDefault();
          if (event.shiftKey) {
            last.focus();
          } else {
            first.focus();
          }
        } else if (!panel.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      });

      // The fallback trap listens at document level while this overlay is
      // open so Escape/Tab survive focus landing on body (see onDocKeydown).
      document.addEventListener('keydown', onDocKeydown);

      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          if (closeDialog() && event.detail >= 1) {
            armClickGuard(event.clientX, event.clientY);
          }
        }
      });

      // Make the panel itself focusable: whitespace clicks then land focus on
      // the panel (not body), keeping Tab inside the trap, and screen readers
      // get a focus point that carries the dialog's aria-label.
      panel.setAttribute('tabindex', '-1');
      panel.focus();

      closeBtn.focus();
    }

    // Fallback close: move the children back into the dialog and drop the
    // overlay. Listeners die with the nodes, so nothing accumulates (the
    // document-level keydown trap is unbound explicitly here; removing a
    // listener that is not registered is a safe no-op). The shared
    // aria-hidden bookkeeping is restored by unlockScroll when the last
    // modal closes.
    function closeFallback() {
      var panel;

      document.removeEventListener('keydown', onDocKeydown);
      if (!overlay) return;
      // The panel is going away: point aria-controls back at the original
      // dialog id, which is the control target while closed.
      openBtn.setAttribute('aria-controls', originalControls);
      panel = overlay.querySelector('.mermaid-zoom__panel');
      if (panel) {
        while (panel.firstChild) {
          dialog.appendChild(panel.firstChild);
        }
      }
      overlay.parentNode.removeChild(overlay);
      overlay = null;
      unlockScroll();
    }

    function openDialog() {
      if (isOpen) return;
      if (supportsDialog) {
        dialog.showModal();
        closeBtn.focus();
      } else {
        openFallback();
      }
      isOpen = true;
      openBtn.setAttribute('aria-expanded', 'true');
    }

    // Fallback close focus routing. In fallback mode the aria-hidden
    // bookkeeping on body children is restored only when the LAST modal
    // closes, so while another overlay is still open this figure's open
    // button sits in a subtree hidden from assistive tech. Route focus to
    // the topmost remaining overlay's panel (tabindex="-1") instead; only
    // when nothing remains open restore to the open button.
    function focusAfterFallbackClose() {
      var remaining = document.querySelectorAll('.mermaid-zoom__overlay');
      if (remaining.length > 0) {
        var topPanel = remaining[remaining.length - 1].querySelector('.mermaid-zoom__panel');
        if (topPanel) {
          topPanel.focus();
          return;
        }
      }
      openBtn.focus();
    }

    function closeDialog() {
      if (!isOpen) return false;
      if (supportsDialog) {
        dialog.close();
        // Native modal stacking keeps the background inert, so the open
        // button is always the correct focus restore target.
        openBtn.focus();
      } else {
        closeFallback();
        focusAfterFallbackClose();
      }
      isOpen = false;
      openBtn.setAttribute('aria-expanded', 'false');
      return true;
    }

    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.addEventListener('click', function (event) {
      // Pointer-initiated opens arm the click guard too: the second click of
      // a double-click on this button lands on the new overlay/backdrop at
      // the same position (the button is now covered) and would otherwise
      // close the modal it just opened. Keyboard opens (Enter/Space,
      // detail 0) never arm. The tighter open radius is set in
      // armClickGuard's callers; this call site passes SWALLOW_RADIUS_OPEN.
      if (event.detail >= 1) {
        armClickGuard(event.clientX, event.clientY, SWALLOW_RADIUS_OPEN);
      }
      openDialog();
    });
    closeBtn.addEventListener('click', function (event) {
      if (closeDialog() && event.detail >= 1) {
        armClickGuard(event.clientX, event.clientY);
      }
    });

    // Backdrop click: close native dialogs only when the click lands outside
    // the dialog rect (inside clicks, including empty panel space, must not
    // close). In fallback mode the dialog is display:none and the overlay's
    // own click handler covers dismissal.
    dialog.addEventListener('click', function (event) {
      if (!isOpen) return;
      // Keyboard/screen-reader activated clicks (Enter/Space on a control)
      // fire with detail 0 and clientX/clientY (0,0), which would otherwise
      // look like an outside click and close the modal. Real pointer clicks
      // always carry detail >= 1, so skip only the synthetic ones.
      if (event.detail === 0) return;
      var rect = dialog.getBoundingClientRect();
      if (!rect) return;
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        if (closeDialog()) {
          armClickGuard(event.clientX, event.clientY);
        }
      }
    });

    // Native <dialog> already handles Escape; we reinforce focus restore and
    // cover the no-dialog fallback where closing is fully manual.
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        disarmClickGuard();
        closeDialog();
      }
    });
  }

  onReady(function () {
    var figures = document.querySelectorAll('figure[data-mermaid-zoom]');
    for (var i = 0; i < figures.length; i++) {
      bindZoom(figures[i]);
    }
  });
})();
