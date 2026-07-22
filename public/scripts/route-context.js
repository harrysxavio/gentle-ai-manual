// route-context.js — Route continuity: reads embedded data, detects active route,
// renders context header, prev/next, route map, mobile bar, localStorage progress.
// Single source of route data from SSR — no array duplication.
// No telemetry, no remote requests.
(function () {
  'use strict';

  var dataEl = document.getElementById('route-context-data');
  var contentEl = document.querySelector('[data-route-content]');
  if (!dataEl || !contentEl) return;

  var parsed;
  try { parsed = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var base = parsed.base || '/gentle-ai-manual/';
  var routeData = parsed.routes || {};
  var profileNames = parsed.profileNames || {};
  var validSlugs = Object.keys(routeData);

  // ──────────────────────────────────────────────
  // 1. Determine active route
  // ──────────────────────────────────────────────
  var params = new URLSearchParams(window.location.search);
  var requested = params.get('ruta');
  var stored = sessionStorage.getItem('gentle-route');
  var routeSlug = validSlugs.indexOf(requested) !== -1 ? requested :
                  validSlugs.indexOf(stored) !== -1 ? stored : null;

  // ──────────────────────────────────────────────
  // 2. Persist valid route, clean up invalid
  // ──────────────────────────────────────────────
  if (validSlugs.indexOf(requested) !== -1) {
    sessionStorage.setItem('gentle-route', requested);
    try {
      localStorage.setItem('gentle-route-last', requested);
      localStorage.setItem('gentle-route-last-lesson', window.location.pathname);
    } catch (_) { /* localStorage may be blocked */ }
  } else if (requested && validSlugs.indexOf(requested) === -1) {
    sessionStorage.removeItem('gentle-route');
    try {
      var lastRoute = localStorage.getItem('gentle-route-last');
      if (lastRoute === requested) {
        localStorage.removeItem('gentle-route-last');
        localStorage.removeItem('gentle-route-last-lesson');
      }
    } catch (_) { /* ignore */ }
  }

  // ──────────────────────────────────────────────
  // 3. Validate localStorage state
  // ──────────────────────────────────────────────
  try {
    var lastRoute = localStorage.getItem('gentle-route-last');
    var lastLesson = localStorage.getItem('gentle-route-last-lesson');
    if (lastRoute && validSlugs.indexOf(lastRoute) === -1) {
      localStorage.removeItem('gentle-route-last');
      localStorage.removeItem('gentle-route-last-lesson');
    } else if (lastRoute && lastLesson && routeData[lastRoute]) {
      var ls = routeData[lastRoute];
      var normalizedStored = '/' + lastLesson.replace(base, '').replace(/^\/+|\/+$/g, '') + '/';
      var found = false;
      for (var i = 0; i < ls.length; i++) {
        var lh = '/' + ls[i].href.replace(/^\/+/g, '');
        if (normalizedStored === lh) { found = true; break; }
      }
      if (!found) {
        localStorage.removeItem('gentle-route-last');
        localStorage.removeItem('gentle-route-last-lesson');
      }
    }
  } catch (_) { /* ignore */ }

  // ──────────────────────────────────────────────
  // 4. Resolve current position in route
  // ──────────────────────────────────────────────
  if (!routeSlug || !routeData[routeSlug]) {
    contentEl.innerHTML =
      '<p class="route-context__inactive">Esta página no está en una ruta activa. ' +
      '<a href="' + base + '00-empezar-aqui/02-indice-completo/">Ver índice completo</a></p>';
    return;
  }

  var pathname = '/' + window.location.pathname.replace(base, '').replace(/^\/+|\/+$/g, '') + '/';
  if (pathname === '//') pathname = '/';

  var lessons = routeData[routeSlug];
  var currentIndex = -1;
  for (var i = 0; i < lessons.length; i++) {
    var lessonHref = '/' + lessons[i].href.replace(/^\/+/g, '');
    if (pathname === lessonHref) { currentIndex = i; break; }
  }

  if (currentIndex === -1) {
    contentEl.innerHTML =
      '<p class="route-context__inactive">Esta página no está en tu ruta actual. ' +
      '<a href="' + base + '00-empezar-aqui/rutas/' + routeSlug + '/">Volver al índice de la ruta</a></p>';
    return;
  }

  var current = lessons[currentIndex];
  var total = lessons.length;
  var pct = Math.round(((currentIndex + 1) / total) * 100);
  var prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  var next = currentIndex < total - 1 ? lessons[currentIndex + 1] : null;

  // Find the profile title from embedded names
  var routeTitle = profileNames[routeSlug] || routeSlug;

  // ──────────────────────────────────────────────
  // 5. Build HTML
  // ──────────────────────────────────────────────
  var html = '';

  // ── Context bar ──
  html += '<div class="route-context__bar">';
  html += '  <div class="route-context__info">';
  html += '    <span data-route-name><a href="' + base + '00-empezar-aqui/rutas/' + routeSlug + '/" class="route-context__route-link">' + esc(routeTitle) + '</a></span>';
  html += '    <span class="route-context__sep" aria-hidden="true">·</span>';
  html += '    <span data-route-step class="route-context__step">Paso ' + (currentIndex + 1) + ' de ' + total + '</span>';
  html += '    <span class="route-context__sep" aria-hidden="true">·</span>';
  html += '    <span data-route-pct class="route-context__pct">' + pct + '%</span>';
  html += '  </div>';
  html += '  <a data-route-index-link href="' + base + '00-empezar-aqui/rutas/' + routeSlug + '/" class="route-context__index-link">Ver recorrido completo →</a>';
  html += '</div>';

  // ── Previous / Next ──
  html += '<nav class="route-context__nav" aria-label="Lecciones anterior y siguiente">';
  html += '  <div class="route-context__nav-inner">';
  if (prev) {
    html += '    <a data-route-prev href="' + base.slice(0, -1) + prev.href + '?ruta=' + routeSlug + '" class="route-context__nav-link route-context__nav-link--prev"><span aria-hidden="true">←</span> ' + esc(prev.title || 'Anterior') + '</a>';
  } else {
    html += '    <span class="route-context__nav-link route-context__nav-link--disabled" aria-disabled="true"></span>';
  }
  html += '    <span class="route-context__nav-current" aria-current="step">' + esc(current.title || 'Actual') + '</span>';
  if (next) {
    html += '    <a data-route-next href="' + base.slice(0, -1) + next.href + '?ruta=' + routeSlug + '" class="route-context__nav-link route-context__nav-link--next">' + esc(next.title || 'Siguiente') + ' <span aria-hidden="true">→</span></a>';
  } else {
    html += '    <span class="route-context__nav-link route-context__nav-link--disabled" aria-disabled="true"></span>';
  }
  html += '  </div>';
  html += '</nav>';

  // ── Route map ──
  html += '<details data-route-map class="route-context__map">';
  html += '  <summary class="route-context__map-summary">Mostrar todas las lecciones de esta ruta</summary>';
  html += '  <ol class="route-context__map-list">';
  for (var j = 0; j < lessons.length; j++) {
    var isCurrent = j === currentIndex;
    html += '    <li class="route-context__map-item">';
    html += '      <a href="' + base.slice(0, -1) + lessons[j].href + '?ruta=' + routeSlug + '" class="route-context__map-link' + (isCurrent ? ' route-context__map-link--current' : '') + '"' + (isCurrent ? ' aria-current="step"' : '') + '>';
    html += '        <span class="route-context__map-num">Paso ' + (j + 1) + '</span>';
    html += '        <span class="route-context__map-title">' + esc(lessons[j].title || '') + '</span>';
    html += '      </a>';
    html += '    </li>';
  }
  html += '  </ol>';
  html += '</details>';

  // ── Exit ──
  html += '<div class="route-context__exit">';
  html += '  <a href="' + base + '00-empezar-aqui/02-indice-completo/" class="route-context__exit-link" data-route-exit>Salir de esta ruta</a>';
  html += '</div>';

  contentEl.innerHTML = html;

  // ──────────────────────────────────────────────
  // 6. Mobile sticky bar
  // ──────────────────────────────────────────────
  function renderMobileBar() {
    if (document.querySelector('[data-route-mobile-bar]')) return;

    var bar = document.createElement('div');
    bar.setAttribute('data-route-mobile-bar', '');
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Navegación de ruta en móvil');

    var label = document.createElement('span');
    label.className = 'route-context__mobile-label';
    label.textContent = (currentIndex + 1) + '/' + total + ' ' + (current.title || '');
    bar.appendChild(label);

    if (prev) {
      var prevLink = document.createElement('a');
      prevLink.className = 'route-context__mobile-link';
      prevLink.href = base.slice(0, -1) + prev.href + '?ruta=' + routeSlug;
      prevLink.textContent = '← Anterior';
      prevLink.setAttribute('aria-label', 'Anterior: ' + (prev.title || ''));
      bar.appendChild(prevLink);
    }

    if (next) {
      var nextLink = document.createElement('a');
      nextLink.className = 'route-context__mobile-link';
      nextLink.href = base.slice(0, -1) + next.href + '?ruta=' + routeSlug;
      nextLink.textContent = 'Siguiente →';
      nextLink.setAttribute('aria-label', 'Siguiente: ' + (next.title || ''));
      bar.appendChild(nextLink);
    }

    document.body.appendChild(bar);
  }

  if (window.innerWidth <= 768) {
    renderMobileBar();
  } else {
    var resizeHandler = function () {
      if (window.innerWidth <= 768) {
        renderMobileBar();
        window.removeEventListener('resize', resizeHandler);
      }
    };
    window.addEventListener('resize', resizeHandler);
  }

  // ──────────────────────────────────────────────
  // Utility
  // ──────────────────────────────────────────────
  function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
