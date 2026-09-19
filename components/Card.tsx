import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Institutional document card: navy spine, hairline rule trailing the title. */
export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section
      className={`border-union-blue/15 border-l-union-blue relative mb-7 rounded-[3px] border border-l-4 bg-white/85 px-5 py-6 shadow-[0_18px_40px_rgb(1_17_58/0.12)] sm:px-10 sm:py-9 ${className}`}
    >
      <h2 className="font-ui text-union-blue mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
        {title}
        <span className="from-union-red to-union-blue/15 h-px flex-1 bg-gradient-to-r" />
      </h2>
      {children}
    </section>
  );
}
