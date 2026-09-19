import { UnionFlag } from "./UnionFlag";

export function SiteHeader() {
  return (
    <header className="mb-10 pt-6 text-center">
      <div className="border-union-blue/20 mb-4 inline-flex items-center gap-2 rounded-[2px] border bg-white/60 py-1.5 pr-3.5 pl-2.5">
        <UnionFlag className="border-union-blue/35 block h-[10px] w-5 shrink-0 border" />
        <span className="font-ui text-union-blue text-[11px] font-semibold tracking-[0.24em] uppercase">
          British English
        </span>
      </div>

      <h1 className="font-display text-union-blue-deep text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold">
        Dictation Checker
      </h1>

      <p className="font-accent text-ink-3 mt-2.5 text-lg italic">
        Spelling &amp; transcription, marked to British standards
      </p>
    </header>
  );
}
