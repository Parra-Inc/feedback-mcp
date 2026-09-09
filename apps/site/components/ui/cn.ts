/** Joins class names, dropping falsy values. No conflict resolution: the
 * strings here never fight over the same utility, so clsx/tailwind-merge
 * would be one more dependency for nothing. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
