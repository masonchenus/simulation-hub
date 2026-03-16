import React from "react";

export function Form({
  className,
  children,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement> & { children: React.ReactNode }) {
  return (
    <form className={className} {...props}>
      {children}
    </form>
  );
}
