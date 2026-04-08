import type { ExplorerAnalyticsResult } from "../../api/explorerAnalyticsApi";
import { cellValue } from "../../utils/analyticsResult";

interface AnalyticsPieChartProps {
  result: ExplorerAnalyticsResult;
  className?: string;
}

const COLORS = [
  "rgba(77,166,200,0.85)",
  "rgba(147,112,219,0.85)",
  "rgba(240,180,96,0.85)",
  "rgba(96,200,140,0.85)",
  "rgba(240,96,120,0.85)",
];

export function AnalyticsPieChart({ result, className = "" }: AnalyticsPieChartProps): JSX.Element {
  const { columns, rows } = result;
  if (columns.length < 2 || rows.length === 0) {
    return (
      <div className={`text-[13px] text-[var(--text-muted)] ${className}`}>
        Not enough data for pie chart.
      </div>
    );
  }

  const dim = columns[0];
  const metric = columns[columns.length - 1];
  const slices = rows
    .map((row) => ({
      label: String(cellValue(row, dim) ?? ""),
      value: Number(cellValue(row, metric) ?? 0),
    }))
    .filter((s) => s.label);
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;

  let acc = 0;
  const gradient = slices
    .map((s, i) => {
      const start = acc / total;
      acc += s.value;
      const end = acc / total;
      return `${COLORS[i % COLORS.length]} ${start * 100}% ${end * 100}%`;
    })
    .join(", ");

  return (
    <div className={`flex flex-wrap items-center gap-8 ${className}`}>
      <div
        className="h-44 w-44 shrink-0 rounded-full border border-[var(--border-color)]"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <ul className="min-w-0 flex-1 space-y-2 text-[12px]">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 truncate">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-[var(--text-primary)]">{s.label}</span>
            </span>
            <span className="font-mono text-[var(--text-muted)] tabular-nums">
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
