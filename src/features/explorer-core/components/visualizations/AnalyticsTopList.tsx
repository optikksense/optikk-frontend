import type { ExplorerAnalyticsResult } from "../../api/explorerAnalyticsApi";
import { cellValue } from "../../utils/analyticsResult";

interface AnalyticsTopListProps {
  result: ExplorerAnalyticsResult;
  className?: string;
}

export function AnalyticsTopList({ result, className = "" }: AnalyticsTopListProps): JSX.Element {
  const { columns, rows } = result;
  if (columns.length < 2 || rows.length === 0) {
    return (
      <div className={`text-[13px] text-[var(--text-muted)] ${className}`}>
        Not enough data for top list.
      </div>
    );
  }

  const dim = columns[0];
  const metric = columns[columns.length - 1];
  const parsed = rows
    .map((row) => ({
      label: String(cellValue(row, dim) ?? ""),
      value: Number(cellValue(row, metric) ?? 0),
    }))
    .filter((r) => r.label)
    .sort((a, b) => b.value - a.value)
    .slice(0, 25);

  const max = Math.max(...parsed.map((p) => p.value), 1);

  return (
    <div className={`space-y-2 ${className}`}>
      {parsed.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <div
            className="w-[180px] shrink-0 truncate text-[12px] text-[var(--text-primary)]"
            title={row.label}
          >
            {row.label}
          </div>
          <div className="h-6 min-w-0 flex-1 overflow-hidden rounded bg-[var(--bg-tertiary)]">
            <div
              className="h-full rounded bg-[rgba(77,166,200,0.45)] transition-all"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <div className="w-20 shrink-0 text-right font-mono text-[12px] text-[var(--text-secondary)] tabular-nums">
            {row.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
