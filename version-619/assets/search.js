(function () {
  var input = document.getElementById('search-input');
  var title = document.getElementById('search-title');
  var results = document.getElementById('search-results');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="movie-poster">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="movie-score">' + escapeHtml(movie.rating) + '</span>',
      '    <div class="poster-cover"><span>▶</span></div>',
      '  </div>',
      '  <div class="movie-info">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.desc) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre).slice(0, 12) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function render(value) {
    var text = value.trim().toLowerCase();
    var list = MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.category, movie.region, movie.type, movie.year, movie.genre, movie.desc, movie.tags.join(' ')].join(' ').toLowerCase();
      return !text || haystack.indexOf(text) !== -1;
    }).slice(0, text ? 120 : 24);

    title.textContent = text ? '搜索结果' : '热门推荐';
    results.innerHTML = list.map(card).join('');

    if (!list.length) {
      results.innerHTML = '<div class="empty-state is-visible">没有匹配的影片</div>';
    }
  }

  if (input) {
    input.value = query;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(query);
})();
