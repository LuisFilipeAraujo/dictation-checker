import { DictationChecker } from "@/components/DictationChecker";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="relative mx-auto w-full max-w-[820px] px-4 pt-11 pb-14 sm:px-6 sm:pt-14 sm:pb-18">
      <div className="union-bar absolute inset-x-0 top-0 h-2.5" aria-hidden />

      <SiteHeader />
      <DictationChecker />

      <footer className="font-ui text-ink-3 mt-9 text-center text-[11px] tracking-[0.14em] uppercase opacity-75">
        Set in Baskerville · British English spelling throughout
      </footer>
    </div>
  );
}
