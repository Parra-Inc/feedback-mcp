import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/*
 * The canonical button classes, lifted from the strings repeated across
 * app/page.tsx (the hero CTA, the "How it works" anchor, the footer CTA and
 * the nav GitHub link were each their own one-off string with no shared
 * height). Sizes are explicit heights, not padding alone: md and lg are
 * both h-12, which is the height py-3 with text-base already renders at on
 * the two CTA buttons, so a form field can be given the same explicit
 * height and line up beside the button instead of drifting from it.
 */
const variants: Record<ButtonVariant, string> = {
  primary: "rounded-xl bg-accent font-semibold text-ink hover:bg-accent-dim",
  secondary: "rounded-xl border border-line font-semibold text-fg hover:border-accent",
  ghost: "rounded-lg border border-line text-muted hover:border-accent hover:text-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-12 px-8 text-base",
};

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export type ButtonProps = Common &
  (
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">)
  );

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: Pick<Common, "variant" | "size" | "className"> = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    sizes[size],
    variants[variant],
    className,
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { href, variant, size, className, children, ...rest } = props;
    return (
      <a href={href} className={buttonClass({ variant, size, className })} {...rest}>
        {children}
      </a>
    );
  }
  const { variant, size, className, children, ...rest } = props;
  return (
    <button type="button" className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
