(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var panel = document.querySelector('.mobile-panel');

  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startHero();
    });
  });

  startHero();

  var filterInput = document.querySelector('[data-filter-input]');
  var filterGrid = document.querySelector('[data-filter-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-search-text]'));

    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    });
  }
})();
