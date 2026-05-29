import { memo } from "react";

import { formatNumber } from "@shared/utils/formatters";

import type { LogsSummary } from "../../api/logsAnalyticsApi";
import { severityColor } from "../../utils/severity";

interface Props {
  readonly summary: LogsSummary | undefined;
}

interface Chip {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
}

/**
 * Severity count chips for the logs trend strip — TOTAL / ERROR / WARN.
 * Colors mirror the trend chart's stacked severities (see utils/severity.ts)
 * so the strip and chart read as one unit.
 */
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
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-1)] px-2.5 py-1 text-xs text-[var(--fg-2)]"
        >
          {chip.color ? (
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: chip.color }} />
          ) : null}
          <span className="uppercase tracking-wider text-[10px] text-[var(--fg-3)]">
            {chip.label}
          </span>
          <span className="font-semibold tabular-nums text-[var(--fg-0)]">
            {formatNumber(chip.value)}
          </span>
        </span>
      ))}
    </div>
  );
}

export const LogsSummaryChips = memo(LogsSummaryChipsComponent);
