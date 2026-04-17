import { memo } from "react";

import { Card } from "@shared/components/primitives/ui";

import { DeltaPill } from "./DeltaPill";

interface Props {
  label: string;
  beforeValue?: number | null;
  afterValue: number;
  delta: number;
  formatter: (value: number) => string;
  invertDelta?: boolean;
}

function SummaryCardComponent({
  label,
  beforeValue,
  afterValue,
  delta,
  formatter,
  invertDelta = false,
}: Props) {
  return (
    <Card
      padding="lg"
      className="border-[rgba(255,255,255,0.07)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            {label}
          </div>
          <div className="mt-2 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatter(afterValue)}
          </div>
        </div>
        <DeltaPill delta={delta} formatter={formatter} invert={invertDelta} />
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <span>Before</span>
        <span className="font-medium text-[var(--text-primary)]">
          {beforeValue == null ? "—" : formatter(beforeValue)}
        </span>
      </div>
    </Card>
  );
}

export const SummaryCard = memo(SummaryCardComponent);
