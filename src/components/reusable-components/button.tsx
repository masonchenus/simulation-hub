import React from "react";

type Variant = "primary" | "ghost";

type CommonProps = {
  variant?: Variant;
  icon?: string;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "ghost",
  icon,
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = ["btn-pill", variant, icon ? "icon" : "", className].filter(Boolean).join(" ");
  return (
    <button className={classes} data-icon={icon} type={props.type ?? "button"} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "ghost",
  icon,
  className,
  children,
  ...props
}: CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = ["btn-pill", variant, icon ? "icon" : "", className].filter(Boolean).join(" ");
  return (
    <a className={classes} data-icon={icon} {...props}>
      {children}
    </a>
  );
}
