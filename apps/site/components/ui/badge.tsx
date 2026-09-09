import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type BadgeTone = "accent" | "sky" | "neutral";

/*
 * The pill classes lifted from the hero eyebrow ("Free • Open source • MIT
 * licensed • Self-hosted"), generalised to one badge per fact so a platform
 * or form-type list can use the same piece.
 */
const tones: Record<BadgeTone, string> = {
  accent: "border-line bg-panel text-accent",
  sky: "border-line bg-panel text-sky",
  neutral: "border-line bg-panel text-muted",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "accent", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-3 text-xs font-medium tracking-wide whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
