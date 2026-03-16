import React, { useEffect, useMemo, useRef, useState } from "react";
import { apps as rawApps, conceptSets } from "./components/data.js";
import { AppCard } from "./components/reusable-components/card";
import { PageHeader } from "./components/reusable-components/header";
import { LayoutShell, LayoutMain, StylePanel } from "./components/reusable-components/layout";
import { Alert } from "./components/reusable-components/alert";
import { Modal } from "./components/reusable-components/modal";
import { Button, LinkButton } from "./components/reusable-components/button";
import { Footer } from "./components/reusable-components/footer";
import { ComponentShowcase } from "./components/reusable-components/showcase";
import { useToast } from "./components/reusable-components/toast";

type AppBadge = keyof typeof conceptSets | string;

type AppItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: AppBadge;
  meta: string[];
  accent: string;
  locked?: boolean;
  critical?: boolean;
  step?: string;
  actions: string[];
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const getSavedApps = () => {
  try {
    const raw = localStorage.getItem("simhub-saved-apps");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

const setSavedApps = (ids: string[]) => {
  try {
    localStorage.setItem("simhub-saved-apps", JSON.stringify(ids));
  } catch {
    // ignore
  }
};

const getUnlockedApps = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("simhub-unlocked-apps") || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

const setUnlockedApps = (ids: string[]) => {
  try {
    localStorage.setItem("simhub-unlocked-apps", JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export default function App() {
  const toast = useToast();
  const apps = rawApps as unknown as AppItem[];

  const [theme, setTheme] = useState(() => localStorage.getItem("simhub-theme") || "classic");
  const [density, setDensity] = useState(() => localStorage.getItem("simhub-density") || "1");
  const [texture, setTexture] = useState(() => (localStorage.getItem("simhub-texture") || "on") === "on");
  const [reduceMotion, setReduceMotion] = useState(false);

  const [keys, setKeys] = useState(() => Number(localStorage.getItem("simhub-keys") || "0"));
  const [unlockedAll] = useState(() => localStorage.getItem("simhub-unlocked-all") === "true");
  const [unlockedApps, setUnlockedAppsState] = useState<string[]>(() => getUnlockedApps());
  const [savedApps, setSavedAppsState] = useState<string[]>(() => getSavedApps());

  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [previewAppId, setPreviewAppId] = useState<string | null>(null);

  const baseAccentRef = useRef<string>("");
  const baseAccentDarkRef = useRef<string>("");

  const previewApp = useMemo(() => apps.find((a) => a.id === previewAppId) || null, [apps, previewAppId]);
  const previewConcepts = useMemo(() => {
    if (!previewApp) return [];
    const base = (conceptSets as any)[previewApp.badge] || (conceptSets as any).Simulation || [];
    return Array.isArray(base) ? base.slice(0, 10) : [];
  }, [previewApp]);

  useEffect(() => {
    document.body.dataset.theme = theme === "classic" ? "" : theme;
    document.body.style.setProperty("--density", density);
    document.body.dataset.texture = texture ? "on" : "off";
    document.body.style.setProperty("--dot-opacity", texture ? "0.35" : "0");
    document.body.style.setProperty("--grain-opacity", texture ? "0.25" : "0");

    localStorage.setItem("simhub-theme", theme);
    localStorage.setItem("simhub-density", density);
    localStorage.setItem("simhub-texture", texture ? "on" : "off");
  }, [theme, density, texture]);

  useEffect(() => {
    const root = document.documentElement;
    baseAccentRef.current = getComputedStyle(root).getPropertyValue("--accent").trim();
    baseAccentDarkRef.current = getComputedStyle(root).getPropertyValue("--accent-dark").trim();
  }, []);

  useEffect(() => {
    document.body.dataset.motion = reduceMotion ? "off" : "on";
  }, [reduceMotion]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / Math.max(1, window.innerWidth)) * 100;
      const y = (e.clientY / Math.max(1, window.innerHeight)) * 100;
      document.documentElement.style.setProperty("--mouse-x", `${x.toFixed(2)}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y.toFixed(2)}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const now = Date.now();
      document.documentElement.style.setProperty("--time", String(now % 100000));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    localStorage.setItem("simhub-keys", String(keys));
  }, [keys]);

  useEffect(() => {
    setUnlockedApps(unlockedApps);
  }, [unlockedApps]);

  useEffect(() => {
    setSavedApps(savedApps);
  }, [savedApps]);

  const alertHtml = useMemo(() => {
    if (unlockedAll) return "<strong>Status:</strong> All apps unlocked. Enjoy the experiments.";
    return `<strong>Lock status:</strong> ${Math.min(keys, 300)} / 300 keys collected. <a class="link-ghost" href="games/key-vault.html">Go to Key Vault</a>`;
  }, [keys, unlockedAll]);

  const toggleSave = (appId: string) => {
    setSavedAppsState((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return Array.from(next);
    });
    toast.push(savedApps.includes(appId) ? "Removed from Saved" : "Saved!");
  };

  const unlockApp = (appId: string) => {
    if (keys < 1) {
      window.alert("Collect keys in the Key Vault first.");
      return;
    }
    setKeys((k) => Math.max(0, k - 1));
    setUnlockedAppsState((prev) => (prev.includes(appId) ? prev : [...prev, appId]));
    const app = apps.find((a) => a.id === appId);
    toast.push(app ? `Unlocked: ${app.title}` : "Unlocked!");
  };

  const setGlobalAccent = (accent: string) => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-dark", accent);
  };

  const resetGlobalAccent = () => {
    const root = document.documentElement;
    root.style.setProperty("--accent", baseAccentRef.current || "#d94834");
    root.style.setProperty("--accent-dark", baseAccentDarkRef.current || "#000000");
  };

  const onCardEnter = (app: AppItem, index: number) => {
    setGlobalAccent(app.accent);
    setActiveStep(app.step || null);
    setActiveIndex(index);
  };

  const onCardLeave = () => {
    resetGlobalAccent();
    setActiveStep(null);
  };

  return (
    <main className="frame">
      <PageHeader
        eyebrow="Simulation Hub"
        title="Choose a simulation to explore and evolve."
        subtitle="Two focused experiments, each tuned for discovery. Start with fractals for generative patterns, or dive into collisions for cosmic dynamics."
      />

      <LayoutShell>
        <LayoutMain>
          <Alert html={alertHtml} />

          <section className="path" aria-label="Simulation path">
            <div className="path-label">Simulation Path</div>
            <div className="path-line">
              <div className="path-nodes">
                <div className={`path-node ${activeStep === "fractal" ? "is-active" : ""}`} data-step="fractal" style={{ color: "#1d7d6a" }}>
                  Fractals
                </div>
                <div className={`path-node ${activeStep === "collision" ? "is-active" : ""}`} data-step="collision" style={{ color: "#3360b7" }}>
                  Collisions
                </div>
                <div className={`path-node ${activeStep === "calculator" ? "is-active" : ""}`} data-step="calculator" style={{ color: "#d94834" }}>
                  Calculator
                </div>
              </div>
            </div>
          </section>

          <section className="grid" id="app-grid" aria-label="Apps">
            {apps.map((app, idx) => {
              const locked = Boolean(app.locked) && !unlockedAll && !unlockedApps.includes(app.id);
              const saved = savedApps.includes(app.id);
              const isActive = activeIndex === idx;
              const concepts = ((conceptSets as any)[app.badge] || (conceptSets as any).Simulation || []).slice(0, 10);

              return (
                <AppCard
                  key={app.id}
                  app={app}
                  concepts={concepts}
                  locked={locked}
                  keys={keys}
                  saved={saved}
                  active={isActive}
                  onEnter={() => onCardEnter(app, idx)}
                  onLeave={onCardLeave}
                  onClick={() => setActiveIndex(idx)}
                  onPreview={() => setPreviewAppId(app.id)}
                  onSave={() => toggleSave(app.id)}
                  onUnlock={() => unlockApp(app.id)}
                />
              );
            })}
          </section>
        </LayoutMain>

        <StylePanel
          theme={theme}
          onThemeChange={setTheme}
          density={density}
          onDensityChange={(v) => setDensity(String(clamp(Number(v), 0.8, 1.2)))}
          texture={texture}
          onTextureChange={setTexture}
        />
      </LayoutShell>

      <Modal open={Boolean(previewApp)} onClose={() => setPreviewAppId(null)} ariaLabel="Preview modal">
        {previewApp ? (
          <div className="preview-card">
            <h3 id="preview-title">{previewApp.title}</h3>
            <p id="preview-summary">{previewApp.description}</p>
            <div className="concepts" id="preview-concepts">
              {previewConcepts.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="preview-actions">
              <Button variant="ghost" onClick={() => setPreviewAppId(null)}>
                Close
              </Button>
              <LinkButton variant="primary" href={previewApp.href}>
                Launch
              </LinkButton>
            </div>
          </div>
        ) : null}
      </Modal>

      <Footer>
        <span>Built for quick experiments and satisfying visuals.</span>
        <label className="motion-toggle">
          <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
          Reduce motion
        </label>
        <a className="cta" href="simulations/fractal-sim.html">
          Start with Fractals
        </a>
      </Footer>

      <ComponentShowcase />
    </main>
  );
}
