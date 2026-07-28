import { memo } from "react";

import { formatNumber } from "@shared/utils/formatters";

import type { LogsSummary } from "@shared/logs/api/logsAnalyticsApi";
import { severityColor } from "@shared/logs/utils/severity";

interface Props {
  readonly summary: LogsSummary | undefined;
}

interface Chip {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
}

   
                                                                        
                                                                             
                                           
   
function LogsSummaryChipsComponent({ summary }: Props) {
  if (!summary) return null;
  const chips: readonly Chip[] = [
    { label: "Total", value: summary.total },
    { label: "Errors", value: summary.errors, color: severityColor(4) },
    { label: "Warnings", value: summary.warns, color: severityColor(3) },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-1)] px-2.5 py-1 text-[var(--fg-2)] text-xs"
        >
          {chip.color ? (
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: chip.color }} />
          ) : null}
          <span className="text-[10px] text-[var(--fg-3)] uppercase tracking-wider">
            {chip.label}
          </span>
          <span className="font-semibold text-[var(--fg-0)] tabular-nums">
            {formatNumber(chip.value)}
          </span>
        </span>
      ))}
    </div>
  );
}

export const LogsSummaryChips = memo(LogsSummaryChipsComponent);
