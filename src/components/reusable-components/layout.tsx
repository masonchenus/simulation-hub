import React from "react";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return <div className="layout-shell">{children}</div>;
}

export function LayoutMain({ children }: { children: React.ReactNode }) {
  return <div className="layout-main">{children}</div>;
}

export function StylePanel({
  theme,
  onThemeChange,
  density,
  onDensityChange,
  texture,
  onTextureChange,
}: {
  theme: string;
  onThemeChange: (v: string) => void;
  density: string;
  onDensityChange: (v: string) => void;
  texture: boolean;
  onTextureChange: (v: boolean) => void;
}) {
  return (
    <section className="style-panel" aria-label="Style settings">
      <div className="eyebrow">Style Lab</div>
      <label htmlFor="theme-select">Theme</label>
      <select id="theme-select" value={theme} onChange={(e) => onThemeChange(e.target.value)}>
        <option value="classic">Classic</option>
        <option value="aurora">Aurora</option>
        <option value="graphite">Graphite</option>
        <option value="solar">Solar</option>
      </select>
      <label htmlFor="density-range">Card Density</label>
      <input
        type="range"
        id="density-range"
        min={0.8}
        max={1.2}
        step={0.05}
        value={density}
        onChange={(e) => onDensityChange(e.target.value)}
      />
      <label>
        <input type="checkbox" checked={texture} onChange={(e) => onTextureChange(e.target.checked)} />
        Texture Layer
      </label>
    </section>
  );
}
