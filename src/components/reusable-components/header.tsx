import React, { useEffect } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      document.documentElement.style.setProperty("--scroll", String(progress));
      document.documentElement.style.setProperty("--hero-shift", `${Math.min(0, -progress * 0.15)}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header>
      <div className="nav-row">
        <div className="eyebrow">{eyebrow || "Welcome"}</div>
        {backHref ? (
          <a href={backHref} className="back-link">
            ← {backLabel}
          </a>
        ) : null}
      </div>
      <h1>{title}</h1>
      {subtitle ? <p className="subhead">{subtitle}</p> : null}
      <div className="hero-bar" aria-hidden="true">
        <span />
      </div>
      {children}
    </header>
  );
}
