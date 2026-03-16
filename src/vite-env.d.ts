/// <reference types="vite/client" />

import type * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "sim-badge": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        text?: string;
        color?: string;
        variant?: string;
        size?: string;
        icon?: string;
        subtext?: string;
        hint?: string;
        pulse?: string | boolean;
      };
    }
  }
}
