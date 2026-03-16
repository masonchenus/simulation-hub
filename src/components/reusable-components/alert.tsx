import React from "react";

export function Alert({ html, children }: { html?: string; children?: React.ReactNode }) {
  return (
    <div className="hub-alert" id="hub-alert">
      {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : children}
    </div>
  );
}
