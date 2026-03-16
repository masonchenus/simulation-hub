import { conceptSets } from './data.js';
import { unlockedAll, unlockedApps, keys } from './state.js';

const getStarRating = (rating) => {
    const r = Math.max(0, Math.min(5, rating || 0));
    const full = '★'.repeat(Math.floor(r));
    const half = (r % 1 >= 0.5) ? '½' : '';
    const empty = '☆'.repeat(5 - Math.ceil(r));
    return `<span class="star-rating" title="${r.toFixed(1)} / 5.0">${full}${half}${empty}</span>`;
};

const getDifficultyMeter = (difficulty) => {
    const d = Math.max(0, Math.min(5, difficulty || 1));
    const dots = Array.from({ length: 5 }, (_, i) => `<span class="diff-dot ${i < d ? 'is-on' : ''}"></span>`).join('');
    return `<div class="difficulty-meter" title="Difficulty: ${d}/5">${dots}</div>`;
};

const isNew = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
};

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';


const buildConcepts = (app) => {
    const base = conceptSets[app.badge] || conceptSets.Simulation;
    return base.slice(0, 10);
};

const getMetaValue = (meta, label) => {
    if (!Array.isArray(meta)) return "";
    const found = meta.find((item) => typeof item === "string" && item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    if (!found) return "";
    const parts = found.split(":");
    return (parts[1] || "").trim();
};

const getBadgeIcon = (badge) => {
    const map = {
        Game: "🎮",
        Tool: "🧰",
        Simulation: "🌀",
        Education: "📚",
        Creative: "🎨",
        Critical: "🛡️",
    };
    return map[badge] || "✨";
};

const intensityFor = (app) => {
    if (app.critical) return 5;
    switch (app.badge) {
        case "Game":
            return 4;
        case "Simulation":
            return 3;
        case "Creative":
            return 3;
        case "Tool":
            return 2;
        case "Education":
            return 2;
        default:
            return 3;
    }
};

export const renderCard = (app) => {
    const {
        id, title, description, href, badge, meta, accent, locked: isLockedRaw, critical, step, actions,
        version, lastUpdated, rating, difficulty, featured, tags = []
    } = app;

    const card = document.createElement("article");
    card.className = critical ? "card is-critical" : "card";
    card.style.setProperty("--card-accent", accent);
    card.dataset.href = href;
    card.dataset.appId = id;
    if (step) card.dataset.step = step;
    const locked = isLockedRaw && !unlockedAll && !unlockedApps.includes(id);
    if (locked) card.classList.add("is-locked");

    const mode = getMetaValue(app.meta, "Mode");
    const focus = getMetaValue(app.meta, "Focus");
    const hintParts = [mode ? `Mode: ${mode}` : "", focus ? `Focus: ${focus}` : ""].filter(Boolean);
    const badgeHint = hintParts.join(" • ");
    const intensity = intensityFor(app);
    const intensityDots = Array.from({ length: 5 }, (_, i) => `<span class="meter-dot ${i < intensity ? "is-on" : ""}"></span>`).join("");

    const allConcepts = buildConcepts(app);
    const conceptsHTML = allConcepts.map((concept) => `<span>${concept}</span>`).join("");
    const metaHTML = meta.map((item) => `<li><strong>${item.split(":")[0]}:</strong> ${item.split(":")[1].trim()}</li>`).join("");

    const icon = getBadgeIcon(badge);
    const badgeVariant = critical ? "glass" : "solid";
    const keyProgress = Math.max(0, Math.min(300, keys)) / 300;

    const newFlag = isNew(lastUpdated);
    const ribbonText = featured ? 'Featured' : newFlag ? 'New' : null;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front" itemprop="softwareApplication" itemscope itemtype="http://schema.org/SoftwareApplication">
          ${ribbonText ? `<div class="card-ribbon">${ribbonText}</div>` : ''}
          <div class="card-chrome" aria-hidden="true"></div>
          <header class="card-top">
            <sim-badge
              text="${badge}"
              subtext="${mode}"
              hint="${badgeHint}"
              color="${accent}"
              variant="${badgeVariant}"
              icon="${icon}"
              ${critical ? "pulse" : ""}
            ></sim-badge>
            <div class="card-top-right">
              ${critical ? `<div class="critical-flag">Critical</div>` : ""}
              ${locked ? `<div class="lock-strip">Locked</div>` : ""}
              <button class="copy-id-btn" title="Copy App ID">#${id.replace(/-/g, "").slice(0, 6).toUpperCase()}</button>
            </div>
          </header>
          <section class="card-body">
            <h2 itemprop="name">${title}</h2>
            <div class="card-ratings">
              ${getStarRating(rating)}
              ${getDifficultyMeter(difficulty)}
            </div>
            <p itemprop="description">${description}</p>
          </section>
          <div class="card-kpis" role="group" aria-label="Key Performance Indicators">
            <div class="kpi" title="Primary mode of interaction"><span class="kpi-icon">🧭</span><span class="kpi-label">Mode</span><span class="kpi-value">${mode || "—"}</span></div>
            <div class="kpi" title="Main cognitive or skill focus"><span class="kpi-icon">🎯</span><span class="kpi-label">Focus</span><span class="kpi-value">${focus || "—"}</span></div>
            <div class="kpi kpi-meter" title="Overall intensity and complexity">
              <span class="kpi-icon">⚡</span>
              <span class="kpi-label">Intensity</span>
              <span class="meter" aria-label="Intensity ${intensity} out of 5">${intensityDots}</span>
            </div>
          </div>
          ${locked ? `<div class="lock-progress" aria-label="Key progress">
              <div class="lock-progress-top">
                <span class="lock-progress-label">Keys</span>
                <span class="lock-progress-value">${Math.min(keys, 300)} / 300</span>
              </div>
              <div class="lock-progress-bar" role="progressbar" aria-valuenow="${Math.round(keyProgress * 100)}" aria-valuemin="0" aria-valuemax="100">
                <span class="lock-progress-fill" style="width:${(keyProgress * 100).toFixed(1)}%"></span>
              </div>
            </div>` : ""}
          <footer class="card-actions">
            <div class="action-group-main">
              ${locked && keys < 300 ? `<a class="btn-pill primary icon" data-icon="🔑" href="games/key-vault.html">Collect Key</a>`
              : locked ? `<button class="btn-pill primary unlock-btn" data-app-id="${id}">Unlock</button>`
              : `<a class="btn-pill primary icon" data-icon="→" href="${href}">${actions[0]}</a>`
            }
            </div>
            <div class="action-group-secondary">
              <button class="btn-pill ghost icon flip-btn" data-icon="🔄" type="button" title="More Info">Info</button>
              <button class="btn-pill ghost icon preview-btn" data-icon="👁" data-app-id="${id}" type="button">Preview</button>
              <button class="btn-pill ghost icon save-btn" data-icon="☆" data-app-id="${id}" aria-pressed="false" type="button">Save</button>
              <button class="btn-pill ghost icon share-btn" data-icon="🔗" type="button" title="Copy Link">Share</button>
            </div>
          </footer>
          <div class="locked-overlay"><span>${keys >= 300 ? "Locked — click unlock" : "Locked — collect keys"}</span></div>
        </div>
        <div class="card-face card-back">
            <header class="card-back-header">
                <h3>${title}</h3>
                <button class="btn-pill ghost icon flip-back-btn" data-icon="↩" type="button" title="Back">Back</button>
            </header>
            <section class="card-back-body">
                <h4>Concepts</h4>
                <div class="concepts">${conceptsHTML}</div>
                <h4>Tags</h4>
                <div class="tags">${tags.length > 0 ? tags.map(t => `<span>${t}</span>`).join('') : '<span>None</span>'}</div>
                <h4>Details</h4>
                <ul class="meta-list">
                    ${metaHTML}
                    <li><strong>Version:</strong> ${version || '1.0'}</li>
                    <li><strong>Updated:</strong> ${formatDate(lastUpdated)}</li>
                </ul>
            </section>
            <footer class="card-back-footer">
                <svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,15 C10,5 20,25 30,15 S50,5 60,15 80,25 90,15 100,5 100,15" fill="none" stroke="currentColor" stroke-width="2"/></svg>
            </footer>
        </div>
      </div>
    `;

    // Add event listeners for new interactive elements
    const flipBtn = card.querySelector('.flip-btn');
    if (flipBtn) {
        flipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('is-flipped');
        });
    }
    const flipBackBtn = card.querySelector('.flip-back-btn');
    if (flipBackBtn) {
        flipBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('is-flipped');
        });
    }

    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const shareUrl = new URL(href, window.location.href).href;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('App URL copied to clipboard!');
            }).catch(err => console.error('Failed to copy URL', err));
        });
    }

    const copyIdBtn = card.querySelector('.copy-id-btn');
    if (copyIdBtn) {
        copyIdBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(id).then(() => {
                alert(`App ID "${id}" copied to clipboard!`);
            });
        });
    }

    return card;
};
