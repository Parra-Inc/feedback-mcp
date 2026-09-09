/** `next/link` for Storybook: a plain anchor. Nothing here navigates. */
import * as React from "react";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
};

export default function Link({ href, prefetch, scroll, replace, ...rest }: Props) {
  void prefetch;
  void scroll;
  void replace;
  const h = typeof href === "string" ? href : (href.pathname ?? "#");
  return <a href={h} {...rest} />;
}
