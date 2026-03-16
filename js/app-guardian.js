(() => {
  if (typeof window === "undefined") return;

  const LS_ENABLED = "force_app_loop_forever";
  const LS_RELOAD = "force_app_loop_reload";

  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const safe = (label, fn) => {
    try {
      return fn();
    } catch (err) {
      try {
        console.warn(`[app-guardian] ${label} failed:`, err);
      } catch {}
      return null;
    }
  };

  const state = {
    enabled: false,
    reloadOnStall: false,
    sawRaf: false,
    lastRafAt: now(),
    lastKickAt: 0,
    lastErrorAt: 0,
    kicks: 0,
  };

  function isVisible() {
    try {
      return !document || document.visibilityState !== "hidden";
    } catch {
      return true;
    }
  }

  // Track uncaught errors so we don't get stuck in reload loops.
  safe("install error handlers", () => {
    window.addEventListener("error", () => {
      state.lastErrorAt = now();
    });
    window.addEventListener("unhandledrejection", () => {
      state.lastErrorAt = now();
    });
  });

  // Patch rAF to observe activity (non-invasive).
  safe("patch requestAnimationFrame", () => {
    const orig = window.requestAnimationFrame?.bind(window);
    if (!orig) return;
    if (window.__app_guardian_patched_raf) return;
    window.__app_guardian_patched_raf = true;
    window.requestAnimationFrame = (cb) => {
      state.sawRaf = true;
      return orig((ts) => {
        state.lastRafAt = now();
        return cb(ts);
      });
    };
  });

  function kickLoop() {
    state.lastKickAt = now();
    state.kicks++;

    // Best-effort "restart" targets (common patterns across mini-apps).
    const candidates = [
      "draw",
      "render",
      "loop",
      "gameLoop",
      "animate",
      "tick",
      "update",
      "mainLoop",
    ];
    for (const name of candidates) {
      const fn = window[name];
      if (typeof fn === "function") {
        safe(`kick ${name}()`, () => fn());
        return true;
      }
    }

    // As a last resort, queue one rAF (some apps re-arm themselves inside callbacks).
    const raf = window.requestAnimationFrame?.bind(window);
    if (raf) {
      safe("kick rAF", () => raf(() => {}));
      return true;
    }
    return false;
  }

  function shouldReload(stallMs) {
    if (!state.reloadOnStall) return false;
    if (!state.sawRaf) return false; // don't reload static pages
    if (!isVisible()) return false;

    // Rate-limit reloads: max 2 in 60s per tab.
    try {
      const keyCount = "__app_guardian_reload_count";
      const keyAt = "__app_guardian_reload_at";
      const t = Date.now();
      const lastAt = Number(sessionStorage.getItem(keyAt) || 0);
      const count = Number(sessionStorage.getItem(keyCount) || 0);
      const within = t - lastAt < 60_000;
      const nextCount = within ? count + 1 : 1;
      if (within && nextCount > 2) return false;
      sessionStorage.setItem(keyAt, String(t));
      sessionStorage.setItem(keyCount, String(nextCount));
      // Avoid reload loops immediately after an error burst.
      if (now() - state.lastErrorAt < stallMs) return false;
      return true;
    } catch {
      return false;
    }
  }

  function guardianTick() {
    if (!state.enabled) return;
    if (!isVisible()) return;
    if (!state.sawRaf) return;

    const STALL_MS = 2200;
    const HARD_STALL_MS = 6500;
    const t = now();
    const dt = t - state.lastRafAt;
    if (dt < STALL_MS) return;

    // Try to kick the app loop first.
    kickLoop();

    if (dt > HARD_STALL_MS && shouldReload(HARD_STALL_MS)) {
      safe("reload", () => location.reload());
    }
  }

  function setForceAppLoopForever(on = true, opts = {}) {
    state.enabled = Boolean(on);
    if (typeof opts?.reload === "boolean") state.reloadOnStall = opts.reload;
    safe("persist settings", () => {
      localStorage.setItem(LS_ENABLED, state.enabled ? "1" : "0");
      if (typeof opts?.reload === "boolean") localStorage.setItem(LS_RELOAD, state.reloadOnStall ? "1" : "0");
    });

    // If the GD clone has a page-specific guardian, keep it in sync.
    safe("sync gd clone guardian", () => {
      if (typeof window.setForceLoopForever === "function") window.setForceLoopForever(state.enabled);
    });
    return { enabled: state.enabled, reloadOnStall: state.reloadOnStall };
  }

  function setForceLoopForeverEverywhere(on = true, opts = { reload: false }) {
    safe("persist everywhere", () => {
      localStorage.setItem(LS_ENABLED, Boolean(on) ? "1" : "0");
      if (typeof opts?.reload === "boolean") localStorage.setItem(LS_RELOAD, opts.reload ? "1" : "0");
    });
    return setForceAppLoopForever(on, opts);
  }

  window.setForceAppLoopForever = setForceAppLoopForever;
  window.setForceLoopForeverEverywhere = setForceLoopForeverEverywhere;
  window.__app_guardian = state;

  // Auto-enable if requested via localStorage or query param.
  safe("auto-enable", () => {
    const params = new URLSearchParams(location.search || "");
    const qp = params.get("forceLoop") || params.get("force_loop") || params.get("guardian");
    const enabled = qp === "1" || qp === "true" || localStorage.getItem(LS_ENABLED) === "1";
    const reload = localStorage.getItem(LS_RELOAD) === "1";
    if (enabled) setForceAppLoopForever(true, { reload });
  });

  // Run guardian checks.
  window.setInterval(guardianTick, 650);
})();

