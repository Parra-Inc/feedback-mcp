/**
 * `next/image` for Storybook, which does not boot Next.
 *
 * apps/site sets `images: { unoptimized: true }` in next.config.ts (it is a
 * static export for GitHub Pages), so in production next/image already emits
 * a plain `<img>` with the `src` it was handed. This does the same and drops
 * the props a plain tag does not know.
 */
import * as React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  placeholder?: string;
  blurDataURL?: string;
};

export default function Image({
  fill,
  priority,
  quality,
  unoptimized,
  placeholder,
  blurDataURL,
  style,
  alt = "",
  ...rest
}: Props) {
  void priority;
  void quality;
  void unoptimized;
  void placeholder;
  void blurDataURL;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
          : style
      }
      {...rest}
    />
  );
}
