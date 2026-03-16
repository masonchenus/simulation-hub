export function initAnimations(elements) {
    const { root, heroBar, unlockedAll } = elements;
    const cards = Array.from(document.querySelectorAll(".card"));

    // Mouse move for background gradient and card tilt
    document.addEventListener("mousemove", (event) => {
        const x = `${(event.clientX / window.innerWidth) * 100}%`;
        const y = `${(event.clientY / window.innerHeight) * 100}%`;
        root.style.setProperty("--mouse-x", x);
        root.style.setProperty("--mouse-y", y);

        const activeCard = document.querySelector('.card:hover, .card:focus-within');
        if (activeCard) {
            const rect = activeCard.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            root.style.setProperty("--tilt-x", `${(-py * 6).toFixed(2)}deg`);
            root.style.setProperty("--tilt-y", `${(px * 6).toFixed(2)}deg`);
        }
    });

    // Scroll-based animations
    const updateScroll = () => {
        const max = document.body.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
        root.style.setProperty("--scroll", progress.toFixed(2));
        if (heroBar) heroBar.style.width = `${progress}%`;
        root.style.setProperty("--dot-opacity", (0.2 + progress / 500).toFixed(2));
        root.style.setProperty("--hero-shift", `${(progress / 20).toFixed(1)}px`);
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    // Time-based animations
    const tickTime = () => {
        const now = Date.now();
        root.style.setProperty("--time", (now % 100000).toString());
        const phase = (now / 2000) % 1;
        root.style.setProperty("--grain-opacity", (0.18 + phase * 0.06).toFixed(2));
        requestAnimationFrame(tickTime);
    };
    tickTime();

    // Intersection observer for card reveal
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                }
            });
        },
        { threshold: 0.15 }
    );
    cards.forEach((card) => {
        card.classList.add("reveal");
        observer.observe(card);
    });

    // Locked card pulsing animation
    if (!unlockedAll) {
        const lockedCards = cards.filter((card) => card.classList.contains("is-locked"));
        let pulseIndex = 0;
        if (lockedCards.length > 0) {
            setInterval(() => {
                lockedCards.forEach((card) => card.classList.remove("is-active"));
                lockedCards[pulseIndex % lockedCards.length].classList.add("is-active");
                pulseIndex += 1;
            }, 1400);
        }
    }
}