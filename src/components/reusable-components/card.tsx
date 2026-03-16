import React, { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

type AppItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  meta: string[];
  accent: string;
  locked?: boolean;
  critical?: boolean;
  step?: string;
  actions: string[];
};

const getMetaValue = (meta: string[], label: string) => {
  const found = meta.find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  if (!found) return "";
  const parts = found.split(":");
  return (parts[1] || "").trim();
};

const badgeIcon = (badge: string) => {
  switch (badge) {
    case "Game":
      return "🎮";
    case "Education":
      return "📚";
    case "Tool":
      return "🧰";
    case "Simulation":
      return "🌀";
    case "Creative":
      return "🎨";
    case "Critical":
      return "🛡️";
    default:
      return "✨";
  }
};

const intensityFor = (app: AppItem) => {
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

const hash32 = (input: string) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const sparklinePath = (seed: number, w = 160, h = 56, points = 24) => {
  let x = seed || 1;
  const rand = () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };

  const step = w / (points - 1);
  const ys = Array.from({ length: points }, () => rand());
  const smooth = ys.map((v, i) => {
    const a = ys[i - 1] ?? v;
    const b = v;
    const c = ys[i + 1] ?? v;
    return (a + b * 2 + c) / 4;
  });

  const yFor = (t: number) => 6 + (1 - t) * (h - 12);
  let d = `M 0 ${yFor(smooth[0] ?? 0.5).toFixed(2)}`;
  for (let i = 1; i < points; i++) {
    const px = i * step;
    const py = yFor(smooth[i] ?? 0.5);
    d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
  }
  return d;
};

export function AppCard({
  app,
  concepts,
  locked,
  keys,
  saved,
  active,
  onEnter,
  onLeave,
  onClick,
  onPreview,
  onSave,
  onUnlock,
}: {
  app: AppItem;
  concepts: string[];
  locked: boolean;
  keys: number;
  saved: boolean;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
  onPreview: () => void;
  onSave: () => void;
  onUnlock: () => void;
}) {
  const [burst, setBurst] = useState(false);
  const burstTimer = useRef<number | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
    };
  }, []);

  const mode = useMemo(() => getMetaValue(app.meta, "Mode"), [app.meta]);
  const focus = useMemo(() => getMetaValue(app.meta, "Focus"), [app.meta]);
  const hint = useMemo(() => [mode ? `Mode: ${mode}` : "", focus ? `Focus: ${focus}` : ""].filter(Boolean).join(" • "), [mode, focus]);
  const intensity = useMemo(() => intensityFor(app), [app]);
  const sessionMins = useMemo(() => {
    const base = app.critical ? 12 : 5;
    const bonus = intensity * 3;
    return Math.min(30, Math.max(3, base + bonus));
  }, [app.critical, intensity]);

  const sparkD = useMemo(() => sparklinePath(hash32(app.id)), [app.id]);
  const intensityDots = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`meter-dot ${i < intensity ? "is-on" : ""}`} />
      )),
    [intensity],
  );

  const keyProgress = Math.max(0, Math.min(300, keys)) / 300;

  const cardClass = ["card", app.critical ? "is-critical" : "", locked ? "is-locked" : "", saved ? "is-saved" : ""]
    .filter(Boolean)
    .join(" ");

  const triggerBurst = () => {
    setBurst(true);
    if (burstTimer.current) window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(false), 720);
  };

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--card-tilt-x", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--card-tilt-y", `${(px * 6).toFixed(2)}deg`);
    el.style.setProperty("--card-glow-x", `${((e.clientX - rect.left) / rect.width * 100).toFixed(2)}%`);
    el.style.setProperty("--card-glow-y", `${((e.clientY - rect.top) / rect.height * 100).toFixed(2)}%`);
  };

  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--card-tilt-x", "0deg");
    cardRef.current.style.setProperty("--card-tilt-y", "0deg");
  };

  return (
    <article
      className={cardClass}
      style={{ ["--card-accent" as any]: app.accent }}
      data-href={app.href}
      data-step={app.step || undefined}
      data-active={active ? "true" : undefined}
      data-burst={burst ? "true" : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={() => {
        resetTilt();
        onLeave();
      }}
      onFocus={onEnter}
      onBlur={() => {
        resetTilt();
        onLeave();
      }}
      onClick={(e) => {
        onClick();
        const target = e.target as HTMLElement | null;
        if (target && target.closest("a,button,input,select,textarea,label,[role='button']")) return;
        if (locked) return;
        window.location.assign(app.href);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const target = e.target as HTMLElement | null;
        if (target && target.closest("a,button,input,select,textarea,label,[role='button']")) return;
        if (locked) return;
        window.location.assign(app.href);
      }}
      onMouseMove={onMove}
      ref={(node) => {
        cardRef.current = node;
      }}
      tabIndex={0}
    >
      <div className="card-chrome" aria-hidden="true" />
      <div className="card-ornaments" aria-hidden="true">
        <div className="card-sparkline">
          <svg viewBox="0 0 160 56" width="160" height="56" focusable="false" aria-hidden="true">
            <path className="spark-glow" d={sparkD} />
            <path className="spark-line" d={sparkD} />
          </svg>
        </div>
      </div>
      <header className="card-top">
        <sim-badge
          text={app.badge}
          subtext={mode}
          hint={hint}
          color={app.accent}
          variant={app.critical ? "glass" : "solid"}
          icon={badgeIcon(app.badge)}
          {...(app.critical ? { pulse: true } : {})}
        />
        <div className="card-top-right">
          {app.critical ? <div className="critical-flag">Critical</div> : null}
          {locked ? <div className="lock-strip">Locked</div> : null}
          <div className="app-index">#{app.id.replace(/-/g, "").slice(0, 6).toUpperCase()}</div>
        </div>
      </header>

      <div className="hover-preview" aria-hidden="true">
        Preview: {app.description}
      </div>

      <h2>{app.title}</h2>
      <p>{app.description}</p>

      <div className="card-chips" onClick={(e) => e.stopPropagation()} aria-label="Quick tags">
        <span className="card-chip" data-tone={locked ? "locked" : "ready"}>
          {locked ? "🔒 Locked" : "✅ Ready"}
        </span>
        <span className="card-chip" data-tone="time">
          ⏱ ≈{sessionMins}m
        </span>
        {saved ? (
          <span className="card-chip" data-tone="saved">
            ★ Saved
          </span>
        ) : null}
      </div>

      <div className="card-kpis">
        <div className="kpi">
          <span className="kpi-icon">🧭</span>
          <span className="kpi-label">Mode</span>
          <span className="kpi-value">{mode || "—"}</span>
        </div>
        <div className="kpi">
          <span className="kpi-icon">🎯</span>
          <span className="kpi-label">Focus</span>
          <span className="kpi-value">{focus || "—"}</span>
        </div>
        <div className="kpi kpi-meter" aria-label="Intensity">
          <span className="kpi-icon">⚡</span>
          <span className="kpi-label">Intensity</span>
          <span className="meter" aria-hidden="true">
            {intensityDots}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-icon">⏱</span>
          <span className="kpi-label">Session</span>
          <span className="kpi-value">≈{sessionMins} min</span>
        </div>
      </div>

      {locked ? (
        <div className="lock-progress" aria-label="Key progress">
          <div className="lock-progress-top">
            <span className="lock-progress-label">Keys</span>
            <span className="lock-progress-value">
              {Math.min(keys, 300)} / 300
            </span>
          </div>
          <div
            className="lock-progress-bar"
            role="progressbar"
            aria-valuenow={Math.round(keyProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="lock-progress-fill" style={{ width: `${(keyProgress * 100).toFixed(1)}%` }} />
          </div>
        </div>
      ) : null}

      <div className="meta">
        {app.meta.map((item) => {
          const [label, ...rest] = item.split(":");
          return (
            <span key={item}>
              <strong>{label}:</strong> {rest.join(":").trim()}
            </span>
          );
        })}
      </div>

      <div className="concepts">
        {concepts.slice(0, 10).map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>

      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        {locked && keys < 300 ? (
          <a className="btn-pill primary icon" data-icon="🔑" href="games/key-vault.html">
            Collect Key
          </a>
        ) : locked ? (
          <button
            className="btn-pill primary unlock-btn"
            onClick={() => {
              triggerBurst();
              onUnlock();
            }}
            type="button"
          >
            Unlock
          </button>
        ) : (
          <a className="btn-pill primary icon" data-icon="→" href={app.href}>
            {app.actions[0] || "Launch"}
          </a>
        )}

        <a className="btn-pill ghost icon" data-icon="📄" href={`info/read-more.html?id=${app.id}`}>
          Read more
        </a>

        <button className="btn-pill ghost icon preview-btn" data-icon="👁" onClick={onPreview} type="button">
          Preview
        </button>

        <button
          className="btn-pill ghost icon save-btn"
          data-icon={saved ? "★" : "☆"}
          aria-pressed={saved ? "true" : "false"}
          onClick={() => {
            triggerBurst();
            onSave();
          }}
          type="button"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {locked ? (
        <div className="locked-overlay">
          <span>{keys >= 300 ? "Locked — click unlock" : "Locked — collect keys"}</span>
        </div>
      ) : null}
    </article>
  );
}
