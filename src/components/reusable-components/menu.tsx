import React, { useEffect, useId, useRef, useState } from "react";

export function Menu({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; onSelect: () => void }>;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (e.target instanceof Node && wrapRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button className="btn-pill ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} type="button">
        {label}
      </button>
      {open ? (
        <div
          id={id}
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: 200,
            background: "var(--glass-strong)",
            border: "1px solid var(--ring)",
            borderRadius: 14,
            padding: 8,
            boxShadow: "0 22px 50px -40px rgba(18,16,12,0.35)",
            zIndex: 50,
          }}
        >
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                it.onSelect();
              }}
              type="button"
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                padding: "10px 10px",
                borderRadius: 12,
                cursor: "pointer",
                font: "inherit",
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
