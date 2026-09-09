import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

/*
 * One field class for every text-like control, h-12: the height py-3 plus
 * text-base already renders at on the site's two CTA buttons (see
 * button.tsx), so a select or an input on the same row as a Button stays
 * the same height instead of drifting from padding alone. Ground and border
 * match Card (bg-panel, border-line); focus and hover pick up the same
 * accent the buttons use.
 */
export const fieldClass =
  "h-12 w-full rounded-lg border border-line bg-panel px-3.5 text-sm text-fg placeholder:text-muted outline-none transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

/** Checkboxes and radios share the accent token so they read as the same family as a filled Button. */
export const checkClass = "size-4 shrink-0 accent-accent disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, "h-auto min-h-28 resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

/**
 * Native select with the browser chrome stripped (appearance-none), the
 * fieldClass reused so it matches Input exactly, and a drawn chevron so it
 * still reads as a select. Width classes go on the wrapper so `w-40` and
 * `flex-1` behave the way they do on an Input. The option list stays
 * native, which is right on a phone.
 */
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select className={cn(fieldClass, "appearance-none pr-10")} {...props} />
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </span>
  );
}

export function Checkbox({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input type="checkbox" className={cn(checkClass, className)} {...props} />;
}

export function Radio({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input type="radio" className={cn(checkClass, "mt-0.5", className)} {...props} />;
}

/** Label above a control, with an optional hint line and error line. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  const Wrapper = htmlFor ? "div" : "label";
  return (
    <Wrapper className={cn("block", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
          {label}
        </label>
      ) : (
        <span className="block text-sm font-medium text-fg">{label}</span>
      )}
      {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-1.5 block text-xs text-red-400">{error}</span> : null}
    </Wrapper>
  );
}

/** A checkbox or radio with its label and an optional second line, sized to hug a single line of text. */
export function CheckRow({
  control,
  label,
  hint,
  className,
}: {
  control: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex items-start gap-3 text-sm text-fg", className)}>
      <span className="flex h-5 items-center">{control}</span>
      <span>
        <span className="block">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}
