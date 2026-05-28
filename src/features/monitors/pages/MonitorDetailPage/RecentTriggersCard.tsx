import { memo } from "react";

import type { MonitorEvent } from "../../api/monitorsApi";

interface Props {
  readonly events: readonly MonitorEvent[];
  readonly loading: boolean;
}

function RecentTriggersCard({ events, loading }: Props) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="text-sm font-medium text-[var(--text-primary)]">Recent triggers</div>
      <div className="text-[11px] text-[var(--text-muted)]">last events</div>
      <table className="mt-3 w-full text-xs">
        <thead className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          <tr>
            <th className="py-1 text-left font-medium">When</th>
            <th className="py-1 text-left font-medium">Kind</th>
            <th className="py-1 text-right font-medium">Peak value</th>
            <th className="py-1 text-right font-medium">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {loading && events.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-[var(--text-muted)]">
                Loading…
              </td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-[var(--text-muted)]">
                No triggers yet.
              </td>
            </tr>
          ) : (
            events.map((e) => (
              <tr key={e.id} className="border-t border-[var(--border-color)]">
                <td className="py-1.5 font-mono">
                  {new Date(e.started_at).toLocaleString()}
                </td>
                <td className="py-1.5">{e.kind}</td>
                <td className="py-1.5 text-right font-mono">
                  {e.value !== undefined ? e.value.toFixed(2) : "—"}
                </td>
                <td className="py-1.5 text-right font-mono">
                  {e.threshold !== undefined ? e.threshold.toFixed(2) : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(RecentTriggersCard);
