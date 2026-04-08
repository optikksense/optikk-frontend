import type { ExplorerAnalyticsResult } from "../../api/explorerAnalyticsApi";
import { rowToRecord } from "../../utils/analyticsResult";

interface AnalyticsTableProps {
  result: ExplorerAnalyticsResult;
  className?: string;
}

export function AnalyticsTable({ result, className = "" }: AnalyticsTableProps): JSX.Element {
  const { columns, rows } = result;
  return (
    <div className={`overflow-auto rounded-xl border border-[var(--border-color)] ${className}`}>
      <table className="w-full min-w-[480px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-[var(--border-color)] border-b bg-[var(--bg-tertiary)]">
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold text-[var(--text-secondary)]">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const rec = rowToRecord(columns, row);
            return (
              <tr
                key={ri}
                className="border-[var(--border-color)]/60 border-b hover:bg-[rgba(255,255,255,0.03)]"
              >
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2 font-mono text-[var(--text-primary)]">
                    {rec[c] === null || rec[c] === undefined ? "—" : String(rec[c])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
