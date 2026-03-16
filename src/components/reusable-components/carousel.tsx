import React, { useRef } from "react";

export function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dx: number) => {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn-pill ghost" type="button" onClick={() => scrollBy(-320)}>
          ←
        </button>
        <button className="btn-pill ghost" type="button" onClick={() => scrollBy(320)}>
          →
        </button>
      </div>
      <div
        ref={ref}
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 8,
          scrollSnapType: "x mandatory",
        }}
      >
        {children}
      </div>
    </div>
  );
}
