(function () {
  function attachStream(video, stream) {
    if (video.dataset.ready === '1') {
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = stream;
  }

  function start(shell) {
    var video = shell.querySelector('video');
    var stream = shell.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    attachStream(video, stream);
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');

    if (!video) {
      return;
    }

    if (button) {
      button.addEventListener('click', function () {
        start(shell);
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start(shell);
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
  });
})();
