function initMoviePlayer(videoUrl) {
  const video = document.getElementById('movie-player');
  const playButton = document.querySelector('[data-play-button]');

  if (!video || !playButton || !videoUrl) {
    return;
  }

  let started = false;
  let hls = null;

  const begin = () => {
    if (started) {
      video.play().catch(() => {});
      return;
    }

    started = true;
    playButton.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      }, { once: true });
      video.play().catch(() => {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      video.play().catch(() => {});
      return;
    }

    video.src = videoUrl;
    video.play().catch(() => {});
  };

  playButton.addEventListener('click', begin);
  video.addEventListener('click', () => {
    if (!started) {
      begin();
    }
  });
  video.addEventListener('play', () => {
    playButton.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
