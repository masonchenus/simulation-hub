import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastItem = { id: string; message: string };

const ToastContext = createContext<{ push: (message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", right: 18, bottom: 18, display: "grid", gap: 10, zIndex: 99999 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "var(--glass-strong)",
              border: "1px solid var(--ring)",
              borderRadius: 14,
              padding: "10px 12px",
              boxShadow: "0 22px 50px -40px rgba(18,16,12,0.35)",
              color: "var(--ink)",
              fontSize: "0.92rem",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
