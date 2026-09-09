import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/*
 * The raised panel three sections of the page build from independently
 * ("How it works" steps, the feature grid, the FAQ entries): rounded-2xl
 * border border-line bg-panel p-6, each typed out fresh.
 */
export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-panel p-6", className)} {...props} />
  );
}
