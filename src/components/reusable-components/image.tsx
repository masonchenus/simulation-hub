import React from "react";

export function Image({
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  return <img alt={alt} loading={props.loading ?? "lazy"} decoding={props.decoding ?? "async"} {...props} />;
}
