import { Grid3x3 } from "lucide-react";
import { memo } from "react";

import type { OverviewSummary } from "../view-models/subsystemSpecs";
import { StatusChip } from "./StatusChip";

type Props = {
  summary: OverviewSummary;
};

function SaturationOverviewHeaderImpl({ summary }: Props): JSX.Element {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="inline-grid h-9 w-9 place-items-center rounded-lg bg-[var(--accent-bg)] text-[var(--color-primary)]">
          <Grid3x3 size={20} aria-hidden />
        </div>
        <div>
          <h1 className="m-0 text-[20px] font-semibold tracking-[-0.012em] text-[var(--fg-0)]">
            Saturation
          </h1>
          <div className='mt-[2px] font-["Geist_Mono",monospace] text-[12px] text-[var(--fg-3)]'>
            {summary.subline}
          </div>
        </div>
        <StatusChip tone={summary.tone} text={summary.statusText} />
      </div>
    </header>
  );
}

export const SaturationOverviewHeader = memo(SaturationOverviewHeaderImpl);
