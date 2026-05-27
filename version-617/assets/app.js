(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-index")) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initSearch() {
    selectAll(".movie-search").forEach(function (input) {
      var area = input.closest(".listing-area") || document;
      var cards = selectAll(".movie-card", area);
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          card.classList.toggle("is-hidden", query.length > 0 && text.indexOf(query) === -1);
        });
      });
    });
  }

  function initPlayer() {
    var player = document.querySelector(".video-player");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var buttons = selectAll("[data-player-action='start']", player);
    var url = player.getAttribute("data-video-url") || "";
    var ready = false;
    var hls = null;

    function startVideo() {
      if (!video || !url) {
        return;
      }
      player.classList.add("is-playing");
      if (ready) {
        video.play().catch(function () {});
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        ready = true;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = url;
            ready = true;
            video.play().catch(function () {});
          }
        });
        return;
      }
      video.src = url;
      ready = true;
      video.play().catch(function () {});
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", startVideo);
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
