import React from "react";

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < pageCount;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <button className="btn-pill ghost" disabled={!canPrev} onClick={() => onPageChange(page - 1)} type="button">
        Prev
      </button>
      <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Page {page} / {pageCount}
      </span>
      <button className="btn-pill ghost" disabled={!canNext} onClick={() => onPageChange(page + 1)} type="button">
        Next
      </button>
    </div>
  );
}
