(function () {
  function toggleNav() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var select = panel.querySelector('[data-type-filter]');
      var section = panel.closest('section');
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];
      var empty = section ? section.querySelector('[data-empty-state]') : null;

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var type = select ? select.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var search = (card.getAttribute('data-search') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var matchedQuery = !query || search.indexOf(query) !== -1;
          var matchedType = !type || cardType === type;
          var shouldShow = matchedQuery && matchedType;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-cover');
      var stream = shell.getAttribute('data-stream');
      var hlsInstance = null;

      function load() {
        if (!video || !stream || video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            maxBufferLength: 30
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }

      function play() {
        load();
        shell.classList.add('playing');
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              window.setTimeout(function () {
                video.play().catch(function () {});
              }, 300);
            });
          }
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.getAttribute('data-ready') !== '1') {
            play();
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleNav();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
