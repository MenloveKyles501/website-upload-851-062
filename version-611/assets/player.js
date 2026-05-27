(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-play-cover]');
    var button = shell.querySelector('[data-play-button]');
    var src = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var ready = false;

    function load() {
      if (!video || !src || ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      load();
      if (cover) cover.classList.add('hidden');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (cover) cover.classList.remove('hidden');
        });
      }
    }

    if (cover) cover.addEventListener('click', play);
    if (button) button.addEventListener('click', play);
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (cover) cover.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 && cover) cover.classList.remove('hidden');
      });
      video.addEventListener('error', function () {
        if (cover) cover.classList.remove('hidden');
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
