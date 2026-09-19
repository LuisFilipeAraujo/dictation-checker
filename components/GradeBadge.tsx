import type { Grade } from "@/lib/grade";

const BAND_CLASS: Record<Grade, string> = {
  excellent: "bg-racing-green/10 text-racing-green border-racing-green/30",
  good: "bg-gold/15 border-gold/35 text-[#6f5a22]",
  "needs-practice": "bg-union-red/10 border-union-red/25 text-[#a30d26]",
};

export function GradeBadge({ grade, label }: { grade: Grade; label: string }) {
  return (
    <p
      className={`font-ui mb-5 inline-block rounded-full border px-4 py-[7px] text-xs font-semibold tracking-[0.08em] ${BAND_CLASS[grade]}`}
    >
      {label}
    </p>
  );
}
