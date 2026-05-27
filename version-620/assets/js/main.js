(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-global-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = "./movies.html?q=" + encodeURIComponent(query);
      }
    });
  });

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (heroSlides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (heroSlides.length) {
    showHero(0);
    startHero();

    heroDots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(heroTimer);
        showHero(index);
        startHero();
      });
    });
  }

  var filterPanel = document.querySelector("[data-filter-panel]");

  if (filterPanel) {
    var searchInput = filterPanel.querySelector("[data-filter-search]");
    var regionSelect = filterPanel.querySelector("[data-filter-region]");
    var yearSelect = filterPanel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyState = filterPanel.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.category,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));

        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedRegion = !region || card.dataset.region === region;
        var matchedYear = !year || card.dataset.year === year;
        var show = matchedKeyword && matchedRegion && matchedYear;

        card.hidden = !show;

        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function initializePlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play]");
    var source = player.dataset.src;
    var fallback = player.dataset.fallbackSrc;
    var activeHls = null;
    var triedFallback = false;

    if (!video || !source) {
      return;
    }

    function attach(url) {
      if (activeHls) {
        activeHls.destroy();
        activeHls = null;
      }

      if (window.Hls && window.Hls.isSupported()) {
        activeHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        activeHls.loadSource(url);
        activeHls.attachMedia(video);

        activeHls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && fallback && !triedFallback) {
            triedFallback = true;
            attach(fallback);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (fallback && !triedFallback) {
        triedFallback = true;
        video.src = fallback;
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attach(video.currentSrc || video.src || source);
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    attach(source);

    if (button) {
      button.addEventListener("click", function () {
        playVideo();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button) {
        button.classList.remove("hidden");
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(initializePlayer);
})();
