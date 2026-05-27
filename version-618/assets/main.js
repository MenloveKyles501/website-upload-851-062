(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var searchInput = scope.querySelector("[data-search-input]");
      var categorySelect = scope.querySelector("[data-category-select]");
      var yearInput = scope.querySelector("[data-year-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var result = scope.querySelector("[data-result-count]");

      function apply() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var category = categorySelect ? categorySelect.value : "all";
        var year = yearInput ? yearInput.value.trim() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (category !== "all" && cardCategory !== category) {
            matched = false;
          }
          if (year && cardYear.indexOf(year) === -1) {
            matched = false;
          }

          card.classList.toggle("hidden-by-filter", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = visible ? "已筛选出 " + visible + " 部影片" : "没有匹配结果";
        }
      }

      [searchInput, categorySelect, yearInput].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initPlayer = function (url) {
    ready(function () {
      var video = document.querySelector(".movie-video");
      var layer = document.querySelector(".play-layer");
      if (!video || !url) {
        return;
      }
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        load();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
