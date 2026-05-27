(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  const activateHero = (nextIndex) => {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (nextIndex + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === heroIndex);
    });
    heroDots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === heroIndex);
    });
  };

  const startHero = () => {
    if (heroTimer) {
      clearInterval(heroTimer);
    }
    heroTimer = setInterval(() => activateHero(heroIndex + 1), 5600);
  };

  heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.getAttribute('data-hero-dot')) || 0;
      activateHero(index);
      startHero();
    });
  });

  if (heroSlides.length) {
    startHero();
  }

  const searchBox = document.querySelector('[data-search-box]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  const filterCards = (value) => {
    const keyword = value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
      card.classList.toggle('hidden-card', keyword.length > 0 && !haystack.includes(keyword));
    });
  };

  if (searchBox) {
    const query = new URLSearchParams(window.location.search).get('q') || '';
    if (query) {
      searchBox.value = query;
      filterCards(query);
    }
    searchBox.addEventListener('input', () => filterCards(searchBox.value));
  }
})();
