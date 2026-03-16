import React from "react";
import { Input } from "./input";

export function Search({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}
