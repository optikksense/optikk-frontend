import { memo } from "react";

import type { AnalyticsResponse } from "../../types/analytics";

interface Props {
  readonly data: AnalyticsResponse;
}

/**
 * Plain tabular view for analytics results. Virtualization is intentionally
 * omitted here — analytics queries cap at ~1000 rows by design, below the
 * threshold where react-virtual pays for itself. Headers come straight from
 * the backend `columns` array (name + type).
 */
function AnalyticsTableImpl({ data }: Props) {
  if (!data.columns.length || !data.rows.length) {
    return <div className="p-6 text-sm text-[var(--text-secondary)]">No data</div>;
  }
  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-[var(--bg-secondary)]">
          <tr>
            {data.columns.map((col) => (
              <th
                key={col.name}
                className="border-b border-[var(--border-color)] px-3 py-2 text-left font-medium text-[var(--text-secondary)]"
                scope="col"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIdx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are stable within a response
            <tr key={rowIdx} className="odd:bg-[var(--bg-primary)] even:bg-[var(--bg-tertiary)]">
              {row.map((cell, i) => {
                const col = data.columns[i];
                const align = col?.type === "number" ? "text-right font-mono" : "text-left";
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional
                  <td key={i} className={`border-b border-[var(--border-color)] px-3 py-1.5 ${align}`}>
                    {String(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const AnalyticsTable = memo(AnalyticsTableImpl);
