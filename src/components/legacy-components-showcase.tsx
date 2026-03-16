import React, { useEffect, useRef } from "react";
import { apps } from "./data.js";
import { renderCard } from "./card.js";
import { keys, unlockedAll, unlockedApps } from "./state.js";
import { initAnimations } from "./animations.js";
import { initUI } from "./ui.js";

export function LegacyComponentsShowcase() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.innerHTML = "";
    const first = (apps as any[])[0];
    if (!first) return;

    // Render one legacy DOM card into a sandboxed container.
    const card = renderCard({ ...first, locked: false });
    card.style.maxWidth = "520px";
    card.style.margin = "0";
    mount.appendChild(card);

    return () => {
      mount.innerHTML = "";
    };
  }, []);

  return (
    <section style={{ marginTop: 22 }}>
      <div className="eyebrow">Legacy modules (src/components/*.js)</div>
      <div style={{ color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
        Loaded: <strong>{String(typeof initUI === "function")}</strong> (initUI),{" "}
        <strong>{String(typeof initAnimations === "function")}</strong> (initAnimations)
        <br />
        Keys: <strong>{keys}</strong> • Unlocked all: <strong>{String(unlockedAll)}</strong> • Unlocked apps:{" "}
        <strong>{Array.isArray(unlockedApps) ? unlockedApps.length : 0}</strong>
      </div>
      <div ref={mountRef} style={{ marginTop: 14 }} />
    </section>
  );
}

