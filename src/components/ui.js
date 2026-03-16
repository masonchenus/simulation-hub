import { apps, conceptSets } from './data.js';
import { keys, addUnlockedApp, spendKey } from './state.js';

export function initUI(elements) {
    const {
        root, grid, nodes, motionToggle, alert, themeSelect, densityRange,
        textureToggle, previewModal, previewTitle, previewSummary,
        previewConcepts, previewClose, previewLaunch, baseAccent, baseAccentDark
    } = elements;

    // Initial alert update
    updateAlert();

    // Style Panel
    initStyleSettings();
    themeSelect.addEventListener("change", applyStyleSettings);
    densityRange.addEventListener("input", applyStyleSettings);
    textureToggle.addEventListener("change", applyStyleSettings);

    // Motion Toggle
    motionToggle.addEventListener("change", (event) => {
        document.body.dataset.motion = event.target.checked ? "off" : "on";
    });

    // Focus visibility
    document.addEventListener("keydown", (event) => {
        if (event.key === "Tab") document.body.classList.add("show-focus");
    });
    document.addEventListener("mousedown", () => {
        document.body.classList.remove("show-focus");
    });

    // Card interactions
    const cards = Array.from(grid.querySelectorAll(".card"));
    cards.forEach((card, index) => {
        card.dataset.index = String(index + 1);
        card.addEventListener("mouseenter", () => {
            setGlobalAccent(card);
            setPathActive(card.dataset.step);
        });
        card.addEventListener("focusin", () => {
            setGlobalAccent(card);
            setPathActive(card.dataset.step);
        });
        card.addEventListener("mouseleave", () => {
            root.style.setProperty("--accent", baseAccent);
            root.style.setProperty("--accent-dark", baseAccentDark);
            setPathActive(null);
        });
        card.addEventListener("focusout", () => {
            root.style.setProperty("--accent", baseAccent);
            root.style.setProperty("--accent-dark", baseAccentDark);
            setPathActive(null);
        });
        card.addEventListener("click", () => {
            setActiveCard(card, cards);
            setPathActive(card.dataset.step);
            root.style.setProperty("--accent-shift", `${index * 8}deg`);
        });
    });

    // Preview Modal
    grid.querySelectorAll(".preview-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const appId = button.dataset.appId;
            const app = apps.find((item) => item.id === appId);
            if (!app) return;
            previewTitle.textContent = app.title;
            previewSummary.textContent = app.description;
            previewLaunch.href = app.href;
            previewConcepts.innerHTML = (conceptSets[app.badge] || conceptSets.Simulation).slice(0, 10).map((c) => `<span>${c}</span>`).join("");
            previewModal.classList.add("is-open");
        });
    });

    previewClose.addEventListener("click", () => previewModal.classList.remove("is-open"));
    previewModal.addEventListener("click", (event) => {
        if (event.target === previewModal) previewModal.classList.remove("is-open");
    });

    // Unlock Logic
    grid.querySelectorAll(".unlock-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const appId = button.dataset.appId;
            if (keys < 1) {
                window.alert("Collect keys in the Key Vault first.");
                return;
            }
            addUnlockedApp(appId);
            spendKey();
            const card = button.closest(".card");
            if (card) {
                card.classList.remove("is-locked");
                card.querySelector(".lock-strip")?.remove();
                card.querySelector(".lock-progress")?.remove();
                card.querySelector(".locked-overlay")?.remove();
                const launchHref = card.dataset.href;
                button.outerHTML = `<a class="btn-pill primary icon" data-icon="→" href="${launchHref}">Launch</a>`;
            }
            updateAlert();
        });
    });

    // Save Logic (local-only)
    initSaves();

    function updateAlert() {
        if (localStorage.getItem("simhub-unlocked-all") === "true") {
            alert.innerHTML = "<strong>Status:</strong> All apps unlocked. Enjoy the experiments.";
        } else {
            alert.innerHTML = `<strong>Lock status:</strong> ${Math.min(keys, 300)} / 300 keys collected. <a class="link-ghost" href="games/key-vault.html">Go to Key Vault</a>`;
        }
    }

    function applyStyleSettings() {
        const theme = themeSelect.value;
        document.body.dataset.theme = theme === "classic" ? "" : theme;
        document.body.style.setProperty("--density", densityRange.value);
        document.body.dataset.texture = textureToggle.checked ? "on" : "off";
        localStorage.setItem("simhub-theme", theme);
        localStorage.setItem("simhub-density", densityRange.value);
        localStorage.setItem("simhub-texture", textureToggle.checked ? "on" : "off");
        document.body.style.setProperty("--dot-opacity", textureToggle.checked ? "0.35" : "0");
        document.body.style.setProperty("--grain-opacity", textureToggle.checked ? "0.25" : "0");
    }

    function initStyleSettings() {
        const savedTheme = localStorage.getItem("simhub-theme") || "classic";
        const savedDensity = localStorage.getItem("simhub-density") || "1";
        const savedTexture = localStorage.getItem("simhub-texture") || "on";
        themeSelect.value = savedTheme;
        densityRange.value = savedDensity;
        textureToggle.checked = savedTexture === "on";
        applyStyleSettings();
    }

    function setActiveCard(card, allCards) {
        allCards.forEach((item) => item.removeAttribute("data-active"));
        card.setAttribute("data-active", "true");
    }

    function setPathActive(step) {
        nodes.forEach((node) => {
            node.classList.toggle("is-active", node.dataset.step === step);
        });
    }

    function setGlobalAccent(card) {
        const accent = getComputedStyle(card).getPropertyValue("--card-accent") || baseAccent;
        root.style.setProperty("--accent", accent.trim());
        root.style.setProperty("--accent-dark", accent.trim());
    }

    function initSaves() {
        const saved = getSavedApps();
        grid.querySelectorAll(".save-btn").forEach((button) => {
            const appId = button.dataset.appId;
            if (!appId) return;
            setSavedButtonState(button, saved.includes(appId));
            button.addEventListener("click", () => {
                const nextSaved = new Set(getSavedApps());
                if (nextSaved.has(appId)) nextSaved.delete(appId);
                else nextSaved.add(appId);
                setSavedApps(Array.from(nextSaved));
                setSavedButtonState(button, nextSaved.has(appId));
            });
        });
    }

    function setSavedButtonState(button, isSaved) {
        button.setAttribute("aria-pressed", isSaved ? "true" : "false");
        button.dataset.icon = isSaved ? "★" : "☆";
        button.textContent = isSaved ? "Saved" : "Save";
        const card = button.closest(".card");
        if (card) card.classList.toggle("is-saved", isSaved);
    }

    function getSavedApps() {
        try {
            const raw = localStorage.getItem("simhub-saved-apps");
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
        } catch {
            return [];
        }
    }

    function setSavedApps(ids) {
        try {
            localStorage.setItem("simhub-saved-apps", JSON.stringify(ids));
        } catch {
            // ignore
        }
    }
}
