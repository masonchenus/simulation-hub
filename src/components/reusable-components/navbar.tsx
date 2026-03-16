import React from "react";

export function Navbar({
  brand,
  children,
}: {
  brand?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
      <div>{brand}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>{children}</div>
    </nav>
  );
}
