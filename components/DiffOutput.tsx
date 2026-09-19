import { Fragment } from "react";

import type { DiffOp } from "@/lib/diff";

const MARK_BASE = "rounded-[2px] px-0.5 py-px";

function DiffToken({ op }: { op: DiffOp }) {
  switch (op.type) {
    case "ok":
      return <span className="text-ink-2">{op.ref}</span>;

    case "replace":
      return (
        <span
          title={`Expected: ${op.ref}`}
          className={`${MARK_BASE} bg-union-red/10 text-[#a30d26] underline decoration-wavy underline-offset-[3px]`}
        >
          {op.student}
        </span>
      );

    case "delete":
      return (
        <span className={`${MARK_BASE} bg-racing-green/10 text-racing-green italic`}>
          [{op.ref}]
        </span>
      );

    case "insert":
      return (
        <span
          className={`${MARK_BASE} bg-gold/20 text-[#6f5a22] underline decoration-dotted underline-offset-[3px]`}
        >
          {op.student}
        </span>
      );
  }
}

export function DiffOutput({ ops }: { ops: DiffOp[] }) {
  return (
    <div className="border-union-blue/10 bg-union-blue/[0.02] text-ink-2 rounded-[2px] border px-5 py-[18px] text-[15px] leading-[2.1]">
      {ops.map((op, index) => (
        <Fragment key={index}>
          <DiffToken op={op} />{" "}
        </Fragment>
      ))}
    </div>
  );
}

const LEGEND = [
  { dot: "bg-union-red", text: "Wrong word" },
  { dot: "bg-racing-green", text: "Missing word" },
  { dot: "bg-gold", text: "Extra word" },
];

export function DiffLegend() {
  return (
    <div className="border-union-blue/15 font-ui text-ink-3 mt-[18px] flex flex-wrap gap-[18px] border-t pt-3.5 text-xs">
      {LEGEND.map((item) => (
        <div key={item.text} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
          {item.text}
        </div>
      ))}
    </div>
  );
}
