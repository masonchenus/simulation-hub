import React from "react";

export function Sidebar({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside style={{ display: "grid", gap: 12 }}>
      {title ? <div className="eyebrow">{title}</div> : null}
      {children}
    </aside>
  );
}
