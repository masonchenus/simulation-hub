import React, { useId, useState } from "react";

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid var(--ring)", borderRadius: 16, background: "var(--glass)" }}>
      <button
        className="btn-pill ghost"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", justifyContent: "space-between", border: "none" }}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div id={id} style={{ padding: "0 14px 14px", color: "var(--muted)", lineHeight: 1.5 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
