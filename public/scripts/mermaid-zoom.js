// mermaid-zoom.js — Accessible zoom for Mermaid diagrams.
// Paired with the rehype-mermaid-zoom build plugin: every wrapped diagram has
// an "Ampliar diagrama" button, a <dialog> with a static clone of the svg, and
// a "Cerrar diagrama" button. The native <dialog> element traps focus and
// closes on Escape; this script reinforces focus restore and covers browsers
// without <dialog> support (attribute fallback).
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function bindZoom(figure) {
    var openBtn = figure.querySelector('.mermaid-zoom__btn');
    var dialog = figure.querySelector('.mermaid-zoom__dialog');
    var closeBtn = figure.querySelector('.mermaid-zoom__close');
    if (!openBtn || !dialog || !closeBtn) return;

    var supportsDialog = typeof dialog.showModal === 'function';

    function openDialog() {
      if (supportsDialog) {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      openBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }

    function closeDialog() {
      if (supportsDialog) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }

    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.addEventListener('click', openDialog);
    closeBtn.addEventListener('click', closeDialog);

    // Native <dialog> already handles Escape; we reinforce focus restore and
    // cover the no-dialog fallback where closing is fully manual.
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
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
