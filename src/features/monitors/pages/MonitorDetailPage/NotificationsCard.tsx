import { Send } from "lucide-react";
import { memo } from "react";

import type { Monitor } from "../../api/monitorsApi";

interface Props {
  readonly monitor: Monitor;
}

function NotificationsCard({ monitor }: Props) {
  const ids = monitor.notify.channel_ids ?? [];
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="text-sm font-medium text-[var(--text-primary)]">Notifications</div>
      <div className="text-[11px] text-[var(--text-muted)]">{ids.length} channels configured</div>
      <div className="mt-3 flex flex-col gap-2">
        {ids.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)]">No channels configured.</div>
        ) : (
          ids.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between rounded bg-[var(--bg-secondary)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Send size={13} className="text-[var(--text-muted)]" />
                <span className="font-mono text-xs">channel #{id}</span>
              </div>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-500">
                wired
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(NotificationsCard);
