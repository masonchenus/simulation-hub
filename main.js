// Main entry point for the Simulation Hub application.
import { apps } from './src/components/data.js';
import { unlockedAll } from './src/components/state.js';
import { renderCard } from './src/components/card.js';
import { initUI } from './src/components/ui.js';
import { initAnimations } from './src/components/animations.js';
import './src/components/reusable-components/sim-header.js';
import './src/components/reusable-components/sim-footer.js';
import './src/components/reusable-components/sim-decoration.js';
import './src/components/reusable-components/sim-badge.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Select all DOM elements
    const elements = {
        root: document.documentElement,
        grid: document.getElementById("app-grid"),
        nodes: Array.from(document.querySelectorAll(".path-node")),
        motionToggle: document.getElementById("motion-toggle"),
        alert: document.getElementById("hub-alert"),
        heroBar: document.querySelector(".hero-bar span"),
        themeSelect: document.getElementById("theme-select"),
        densityRange: document.getElementById("density-range"),
        textureToggle: document.getElementById("texture-toggle"),
        previewModal: document.getElementById("preview-modal"),
        previewTitle: document.getElementById("preview-title"),
        previewSummary: document.getElementById("preview-summary"),
        previewConcepts: document.getElementById("preview-concepts"),
        previewClose: document.getElementById("preview-close"),
        previewLaunch: document.getElementById("preview-launch"),
        baseAccent: getComputedStyle(document.documentElement).getPropertyValue("--accent"),
        baseAccentDark: getComputedStyle(document.documentElement).getPropertyValue("--accent-dark"),
        unlockedAll: unlockedAll
    };

    // 2. Render initial app grid
    apps.forEach((app) => elements.grid.appendChild(renderCard(app)));

    // 3. Initialize UI event listeners and animations
    initUI(elements);
    initAnimations(elements);
});