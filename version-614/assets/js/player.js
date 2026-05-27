(function () {
  function readConfig() {
    var node = document.getElementById('player-config');
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || '{}');
    } catch (error) {
      return null;
    }
  }

  function setupPlayer() {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('playButton');
    var shell = document.getElementById('playerArea');
    var config = readConfig();
    if (!video || !button || !shell || !config || !config.source) {
      return;
    }

    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    function start() {
      attach();
      button.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    attach();
    button.addEventListener('click', start);
    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
