(function () {
  function all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }

  all('[data-hero]').forEach(function (hero) {
    var slides = all('[data-slide]', hero);
    var dots = all('[data-dot]', hero);
    var prev = hero.querySelector('[data-prev]');
    var next = hero.querySelector('[data-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  all('[data-local-filter]').forEach(function (box) {
    var input = box.querySelector('[data-filter-input]');
    var select = box.querySelector('[data-filter-select]');
    var cards = all('[data-title]');

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var value = select ? select.value : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var region = card.getAttribute('data-region') || '';
        var matchKeyword = !keyword || title.indexOf(keyword) !== -1 || region.toLowerCase().indexOf(keyword) !== -1;
        var matchValue = !value || category === value || region === value;
        card.style.display = matchKeyword && matchValue ? '' : 'none';
      });
    }

    if (input) input.addEventListener('input', applyFilter);
    if (select) select.addEventListener('change', applyFilter);
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && typeof SITE_SEARCH_INDEX !== 'undefined') {
    var query = searchPage.querySelector('[data-search-query]');
    var category = searchPage.querySelector('[data-search-category]');
    var region = searchPage.querySelector('[data-search-region]');
    var results = searchPage.querySelector('[data-search-results]');

    function card(movie) {
      return [
        '<article class="movie-card group">',
        '<a href="' + movie.url + '" class="block">',
        '<div class="relative aspect-[3/4] overflow-hidden bg-gray-200 rounded-t-lg">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy">',
        '<div class="absolute top-2 right-2 rating-badge">★ ' + movie.rating + '</div>',
        '<div class="absolute bottom-2 left-2 category-badge">' + escapeHtml(movie.category) + '</div>',
        '</div>',
        '<div class="p-4">',
        '<h3 class="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">' + escapeHtml(movie.title) + '</h3>',
        '<div class="text-sm text-gray-500">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
        '<p class="text-sm text-gray-500 line-clamp-2 mt-2">' + escapeHtml(movie.oneLine) + '</p>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render() {
      var keyword = query ? query.value.trim().toLowerCase() : '';
      var cat = category ? category.value : '';
      var reg = region ? region.value : '';
      var list = SITE_SEARCH_INDEX.filter(function (movie) {
        var hay = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return (!keyword || hay.indexOf(keyword) !== -1) && (!cat || movie.category === cat) && (!reg || movie.region === reg);
      }).slice(0, 120);
      results.innerHTML = list.map(card).join('');
    }

    [query, category, region].forEach(function (node) {
      if (node) node.addEventListener('input', render);
      if (node) node.addEventListener('change', render);
    });
    render();
  }
})();
