(function() {
  var search = document.getElementById('glossary-search');
  var clear = document.getElementById('glossary-clear');
  var status = document.getElementById('glossary-status');
  var terms = document.querySelectorAll('[data-glossary-term]');
  if (!search || !terms.length) return;

  function filter() {
    var query = search.value.toLowerCase().trim();
    var count = 0;
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var text = (term.textContent || '').toLowerCase();
      var match = !query || text.indexOf(query) !== -1;
      term.style.display = match ? '' : 'none';
      if (match) count++;
    }
    if (status) status.textContent = count + ' de ' + terms.length + ' términos';
  }

  var catBtns = document.querySelectorAll('[data-cat]');
  var activeCat = 'all';

  function filterCategory(cat) {
    activeCat = cat;
    for (var i = 0; i < catBtns.length; i++) {
      var btn = catBtns[i];
      var isActive = btn.getAttribute('data-cat') === cat;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
    applyFilters();
  }

  function applyFilters() {
    var query = search.value.toLowerCase().trim();
    var count = 0;
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var text = (term.textContent || '').toLowerCase();
      var matchesSearch = !query || text.indexOf(query) !== -1;
      var matchesCat = activeCat === 'all' || term.getAttribute('data-category') === activeCat;
      term.style.display = matchesSearch && matchesCat ? '' : 'none';
      if (matchesSearch && matchesCat) count++;
    }
    if (status) status.textContent = count + ' de ' + terms.length + ' términos';
  }

  search.addEventListener('input', applyFilters);

  for (var j = 0; j < catBtns.length; j++) {
    catBtns[j].addEventListener('click', function() {
      filterCategory(this.getAttribute('data-cat'));
    });
  }

  function resetGlossary() {
    // Reset search
    search.value = '';
    // Reset category to 'all'
    activeCat = 'all';
    for (var k = 0; k < catBtns.length; k++) {
      var btn = catBtns[k];
      var isActive = btn.getAttribute('data-cat') === 'all';
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
    applyFilters();
    search.focus();
  }

  if (clear) {
    clear.addEventListener('click', resetGlossary);
  }
})();
