import type { ReactNode } from "react";

/** Shared look for text inputs, selects and textareas. */
export const FIELD_CLASS =
  "font-body text-ink border-union-blue/15 border-b-union-blue/40 bg-union-blue/[0.02] " +
  "focus:border-b-union-red focus:ring-union-red/10 w-full rounded-none border border-b-2 " +
  "px-3 py-2.5 text-[15px] transition outline-none focus:bg-white/90 focus:ring-2";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-ui text-ink-3 text-[11px] font-medium tracking-[0.14em] uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="font-ui text-union-red text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
