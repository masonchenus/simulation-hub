import React from "react";

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border: "2px solid rgba(18,16,12,0.18)",
          borderTopColor: "rgba(18,16,12,0.65)",
          animation: "spin 900ms linear infinite",
        }}
      />
      <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{label}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
