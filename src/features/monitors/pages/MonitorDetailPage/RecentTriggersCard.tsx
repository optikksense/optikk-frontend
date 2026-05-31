import { memo } from "react";

import type { MonitorEvent } from "../../api/monitorsApi";

interface Props {
  readonly events: readonly MonitorEvent[];
  readonly loading: boolean;
}

function RecentTriggersCard({ events, loading }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-medium text-foreground text-sm">Recent triggers</div>
      <div className="text-[11px] text-foreground-muted">last events</div>
      <table className="mt-3 w-full text-xs">
        <thead className="text-[10px] text-foreground-muted uppercase tracking-wider">
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
              <td colSpan={4} className="py-4 text-center text-foreground-muted">
                Loading…
              </td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-foreground-muted">
                No triggers yet.
              </td>
            </tr>
          ) : (
            events.map((e) => (
              <tr key={e.id} className="border-border border-t">
                <td className="py-1.5 font-mono">{new Date(e.started_at).toLocaleString()}</td>
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
