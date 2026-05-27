(function () {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      const opened = mobilePanel.hasAttribute("hidden");
      if (opened) {
        mobilePanel.removeAttribute("hidden");
      } else {
        mobilePanel.setAttribute("hidden", "");
      }
      menuToggle.setAttribute("aria-expanded", String(opened));
      if (header) {
        header.classList.toggle("is-open", opened);
      }
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    const grid = panel.parentElement.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const keyword = panel.querySelector("[data-filter-keyword]");
    const year = panel.querySelector("[data-filter-year]");
    const type = panel.querySelector("[data-filter-type]");
    const years = Array.from(new Set(cards.map(function (card) {
      return card.dataset.year || "";
    }).filter(Boolean))).sort().reverse();
    const types = Array.from(new Set(cards.map(function (card) {
      return card.dataset.type || "";
    }).filter(Boolean))).sort();
    years.forEach(function (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      year.appendChild(option);
    });
    types.forEach(function (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      type.appendChild(option);
    });
    const apply = function () {
      const q = (keyword.value || "").trim().toLowerCase();
      const y = year.value;
      const t = type.value;
      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(" ").toLowerCase();
        const ok = (!q || text.includes(q)) && (!y || card.dataset.year === y) && (!t || card.dataset.type === t);
        card.classList.toggle("is-filter-hidden", !ok);
      });
    };
    [keyword, year, type].forEach(function (item) {
      item.addEventListener("input", apply);
      item.addEventListener("change", apply);
    });
  });

  const players = Array.from(document.querySelectorAll("[data-player]"));
  players.forEach(function (panel) {
    const video = panel.querySelector("video");
    const trigger = panel.querySelector("[data-play-trigger]");
    if (!video || !trigger) {
      return;
    }
    let loaded = false;
    let hlsInstance = null;
    const source = video.getAttribute("data-hls-url");
    const load = function () {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hlsInstance = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    const begin = function () {
      load();
      trigger.classList.add("is-hidden");
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          trigger.classList.remove("is-hidden");
        });
      }
    };
    trigger.addEventListener("click", begin);
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  const searchResults = document.getElementById("searchResults");
  if (searchResults && Array.isArray(globalThis.movieSearchIndex)) {
    const params = new URLSearchParams(window.location.search);
    const input = document.getElementById("searchInput");
    const heading = document.getElementById("searchHeading");
    const q = (params.get("q") || "").trim();
    if (input) {
      input.value = q;
    }
    const normalized = q.toLowerCase();
    const matches = globalThis.movieSearchIndex.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase().includes(normalized);
    }).slice(0, 120);
    if (heading) {
      heading.textContent = q ? "“" + q + "” 的影片匹配" : "热门影片浏览";
    }
    if (!matches.length) {
      searchResults.innerHTML = '<div class="empty-state">暂未找到匹配影片，可以尝试更换关键词。</div>';
      return;
    }
    searchResults.innerHTML = matches.map(function (movie) {
      const tags = movie.tags.split("、").filter(Boolean).slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="./' + movie.file + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async" />',
        '<span class="poster-shade"></span><span class="poster-play">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-list">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
