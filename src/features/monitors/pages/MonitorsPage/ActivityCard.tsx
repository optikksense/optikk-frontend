import { memo } from "react";

import type { MonitorEvent } from "../../api/monitorsApi";

interface Props {
  readonly events: readonly MonitorEvent[];
  readonly loading: boolean;
}

const KIND_COLORS: Record<string, string> = {
  triggered: "bg-red-500",
  recovered: "bg-emerald-500",
  acked: "bg-blue-500",
  muted: "bg-zinc-500",
  test: "bg-zinc-400",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ActivityCard({ events, loading }: Props) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="text-sm font-medium text-[var(--text-primary)]">Recent activity</div>
      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">last 1 hour</div>
      <div className="mt-3 flex flex-col gap-2">
        {loading && events.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)]">Loading…</div>
        ) : events.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)]">No recent activity.</div>
        ) : (
          events.map((e) => (
            <div key={e.id} className="flex items-start gap-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${KIND_COLORS[e.kind] ?? "bg-zinc-400"}`}
              />
              <div className="flex-1">
                <div className="text-xs text-[var(--text-primary)]">
                  <span className="font-medium">{e.monitor_name}</span> · {e.kind}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">{timeAgo(e.started_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(ActivityCard);
