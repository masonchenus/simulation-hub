(() => {
  const body = document.body;
  const appId = body.dataset.appId || "unknown";
  if (appId === "key-vault") return;

  const unlockedAll = localStorage.getItem("simhub-unlocked-all") === "true";
  const unlockedApps = JSON.parse(localStorage.getItem("simhub-unlocked-apps") || "[]");
  if (unlockedAll || unlockedApps.includes(appId)) return;

  const overlay = document.createElement("div");
  overlay.className = "lock-overlay";
  overlay.innerHTML = `
    <div class="lock-card">
      <div style="font-size:2.2rem">🔒</div>
      <h2>Locked Experiment</h2>
      <p>This app is locked while we squash bugs. Collect 300 keys to unlock everything.</p>
      <a href="key-vault.html">Collect Keys</a>
      <div style="font-size:0.85rem;opacity:0.7">App ID: ${appId}</div>
    </div>
  `;
  body.classList.add("is-locked");
  body.appendChild(overlay);
})();
