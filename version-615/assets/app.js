(function () {
    const scriptElement = document.currentScript;
    const assetBase = scriptElement && scriptElement.src
        ? scriptElement.src.replace(/\/[^\/]*$/, "/")
        : "./assets/";

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initHeader() {
        const header = document.querySelector("[data-header]");
        const toggle = document.querySelector("[data-menu-toggle]");
        const menu = document.querySelector("[data-mobile-menu]");

        if (header) {
            const update = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 18);
            };
            update();
            window.addEventListener("scroll", update, { passive: true });
        }

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }
    }

    function initHero() {
        const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

        if (!slides.length) {
            return;
        }

        let activeIndex = 0;

        function setActive(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setActive(index);
            });
        });

        setActive(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                setActive(activeIndex + 1);
            }, 5200);
        }
    }

    function initFilters() {
        const forms = Array.from(document.querySelectorAll("[data-filter-form]"));

        forms.forEach(function (form) {
            const cards = Array.from(document.querySelectorAll(".movie-card"));
            const emptyState = document.querySelector("[data-empty-state]");
            const search = form.querySelector("[name='q']");
            const region = form.querySelector("[name='region']");
            const type = form.querySelector("[name='type']");
            const year = form.querySelector("[name='year']");
            const params = new URLSearchParams(window.location.search);

            if (search && params.get("q")) {
                search.value = params.get("q");
            }

            function matches(card) {
                const keyword = search ? search.value.trim().toLowerCase() : "";
                const regionValue = region ? region.value : "";
                const typeValue = type ? type.value : "";
                const yearValue = year ? year.value : "";
                const haystack = [
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.year
                ].join(" ").toLowerCase();

                if (keyword && !haystack.includes(keyword)) {
                    return false;
                }

                if (regionValue && card.dataset.region !== regionValue) {
                    return false;
                }

                if (typeValue && card.dataset.type !== typeValue) {
                    return false;
                }

                if (yearValue && card.dataset.year !== yearValue) {
                    return false;
                }

                return true;
            }

            function applyFilters() {
                let visible = 0;

                cards.forEach(function (card) {
                    const isVisible = matches(card);
                    card.style.display = isVisible ? "" : "none";
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            }

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilters();
            });

            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    }

    async function resolveHlsClass() {
        if (window.Hls) {
            return window.Hls;
        }

        try {
            const module = await import(assetBase + "hls-vendor-dru42stk.js");
            return module.H || module.default || null;
        } catch (error) {
            return null;
        }
    }

    window.bindMoviePlayer = function (options) {
        const video = document.getElementById(options.videoId);
        const button = document.getElementById(options.buttonId);
        const overlay = document.getElementById(options.overlayId);
        const source = options.source;

        if (!video || !button || !overlay || !source) {
            return;
        }

        let started = false;
        let hlsInstance = null;

        async function start() {
            overlay.classList.add("is-hidden");
            video.controls = true;

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }

            const HlsClass = await resolveHlsClass();

            if (HlsClass && HlsClass.isSupported()) {
                hlsInstance = new HlsClass({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(HlsClass.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(HlsClass.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.src = source;
                        video.play().catch(function () {});
                    }
                });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        }

        button.addEventListener("click", start);
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initHeader();
        initHero();
        initFilters();
    });
})();
