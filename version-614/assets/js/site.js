(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
        window.clearInterval(timer);
        show(next);
        play();
      });
    });

    show(0);
    play();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));
  }

  function setupLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-local-filter]');
      var grid = document.querySelector('[data-card-grid]');
      if (!input || !grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.children);
      input.addEventListener('input', function () {
        var term = normalize(input.value);
        cards.forEach(function (card) {
          card.classList.toggle('is-filtered-out', term && cardText(card).indexOf(term) === -1);
        });
      });
    });
  }

  function setupSorting() {
    var select = document.querySelector('[data-sort-cards]');
    var grid = document.querySelector('[data-card-grid]');
    if (!select || !grid) {
      return;
    }
    select.addEventListener('change', function () {
      var cards = Array.prototype.slice.call(grid.children);
      var value = select.value;
      cards.sort(function (a, b) {
        if (value === 'year') {
          return normalize(b.getAttribute('data-year')).localeCompare(normalize(a.getAttribute('data-year')), 'zh-CN');
        }
        if (value === 'title') {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-CN');
        }
        return 0;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  function setupSearchPage() {
    var grid = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    if (!grid || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var cards = Array.prototype.slice.call(grid.children);
    input.value = q;
    function apply() {
      var term = normalize(input.value);
      cards.forEach(function (card) {
        card.classList.toggle('is-filtered-out', term && cardText(card).indexOf(term) === -1);
      });
    }
    input.addEventListener('input', apply);
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupSorting();
    setupSearchPage();
  });
})();
