(function() {
  var nav = document.getElementById('route-navigation');
  var dataEl = document.getElementById('route-navigation-data');
  var content = document.getElementById('route-nav-content');
  if (!nav || !dataEl || !content) return;

  var parsed;
  try { parsed = JSON.parse(dataEl.textContent); } catch(e) { return; }

  var base = parsed.base || '/gentle-ai-manual/';
  var routeData = parsed.routes || {};
  var validSlugs = Object.keys(routeData);

  var params = new URLSearchParams(window.location.search);
  var requested = params.get('ruta');
  var stored = sessionStorage.getItem('gentle-route');
  var routeSlug = validSlugs.indexOf(requested) !== -1 ? requested :
                  validSlugs.indexOf(stored) !== -1 ? stored : null;

  if (validSlugs.indexOf(requested) !== -1) {
    sessionStorage.setItem('gentle-route', requested);
  } else if (requested && validSlugs.indexOf(requested) === -1) {
    sessionStorage.removeItem('gentle-route');
  }

  if (!routeSlug) {
    content.style.display = 'block';
    content.innerHTML = '<p style="text-align:center;color:var(--sl-color-gray-500)">No est�s en una ruta activa. <a href="' + base + '00-empezar-aqui/02-indice-completo/">Ver �ndice completo</a></p>';
    return;
  }

  var pathname = window.location.pathname.replace(/\/$/, '') + '/';
  var normalized = pathname.replace(base, '');
  var lessons = routeData[routeSlug];
  if (!lessons) return;

  var currentIndex = -1;
  for (var i = 0; i < lessons.length; i++) {
    var lessonHref = lessons[i].href.replace(/\/$/, '');
    if (normalized.indexOf(lessonHref) !== -1) {
      currentIndex = i;
      break;
    }
  }

  if (currentIndex === -1) {
    content.style.display = 'block';
    content.innerHTML = '<p style="text-align:center;color:var(--sl-color-gray-500)">Esta p�gina no est� en tu ruta actual. <a href="' + base + '00-empezar-aqui/rutas/' + routeSlug + '/">Volver al �ndice de la ruta</a></p>';
    return;
  }

  var current = lessons[currentIndex];
  var total = lessons.length;
  var prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  var next = currentIndex < total - 1 ? lessons[currentIndex + 1] : null;

  var html = '';
  html += '<div class="route-nav-progress" role="status">Paso ' + (currentIndex + 1) + ' de ' + total + '</div>';
  html += '<div class="route-nav-links">';

  if (prev) {
    html += '<a href="' + base.slice(0, -1) + prev.href + '?ruta=' + routeSlug + '" class="route-nav-link" aria-label="Anterior: ' + (prev.title || '') + '">\u2190 ' + (prev.title || 'Anterior') + '</a>';
  } else {
    html += '<span class="route-nav-link" style="visibility:hidden">\u2190</span>';
  }

  html += '<span class="route-nav-link" aria-current="step">' + (current.title || 'Actual') + '</span>';

  if (next) {
    html += '<a href="' + base.slice(0, -1) + next.href + '?ruta=' + routeSlug + '" class="route-nav-link" aria-label="Siguiente: ' + (next.title || '') + '">' + (next.title || 'Siguiente') + ' \u2192</a>';
  } else {
    html += '<span class="route-nav-link" style="visibility:hidden">\u2192</span>';
  }

  html += '</div>';
  html += '<div class="route-nav-index"><a href="' + base + '00-empezar-aqui/rutas/' + routeSlug + '/">Volver al �ndice de la ruta</a></div>';

  content.innerHTML = html;
  content.style.display = 'block';
})();
