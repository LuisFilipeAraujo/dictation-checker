import type { ComparisonResult } from "@/lib/diff";
import { gradeFor } from "@/lib/grade";

import { Card } from "./Card";
import { DiffLegend, DiffOutput } from "./DiffOutput";
import { GradeBadge } from "./GradeBadge";

interface ResultsCardProps {
  studentName: string;
  dictationNumber: number;
  result: ComparisonResult;
}

export function ResultsCard({ studentName, dictationNumber, result }: ResultsCardProps) {
  const { grade, label } = gradeFor(result.scorePct);

  return (
    <Card title="Results">
      <div className="mb-5 flex flex-wrap items-baseline gap-2.5">
        <span className="font-ui text-ink-3 text-[11px] tracking-[0.14em] uppercase">Student</span>
        <span className="font-display text-union-blue-deep text-[17px]">{studentName}</span>
        <span aria-hidden className="text-ink-3">
          ·
        </span>
        <span className="font-ui text-ink-3 text-[11px] tracking-[0.14em] uppercase">
          Dictation
        </span>
        <span className="font-display text-union-blue-deep text-[17px]">{dictationNumber}</span>
      </div>

      <GradeBadge grade={grade} label={label} />

      <div className="mb-6 flex justify-start">
        <div className="border-union-blue/15 border-t-union-red rounded-[2px] border border-t-[3px] bg-white px-[30px] py-4 text-center shadow-[0_6px_14px_rgb(1_17_58/0.06)]">
          <span className="font-display text-union-red mb-1.5 block text-[32px] leading-none font-bold">
            {result.errors}
          </span>
          <span className="font-ui text-ink-3 text-[10px] tracking-[0.16em] uppercase">Errors</span>
        </div>
      </div>

      <p className="font-ui text-union-blue border-union-blue/10 mb-3.5 border-b pb-2 text-xs font-semibold tracking-[0.16em] uppercase">
        Comparison — Reference vs Student
      </p>

      <DiffOutput ops={result.ops} />
      <DiffLegend />
    </Card>
  );
}
