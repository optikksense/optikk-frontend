import { memo } from "react";

import type { MonitorListStatusCounts } from "../../api/monitorsApi";

export type MonitorTab = "triggered" | "all" | "muted" | "no_data";

interface Props {
  readonly tab: MonitorTab;
  readonly setTab: (t: MonitorTab) => void;
  readonly counts: MonitorListStatusCounts;
}

function Tabs({ tab, setTab, counts }: Props) {
  const tabs: { id: MonitorTab; label: string; badge: number; tone: string }[] = [
    {
      id: "triggered",
      label: "Triggered",
      badge: counts.alert + counts.warn,
      tone: "bg-error-subtle text-error",
    },
    { id: "all", label: "All", badge: counts.total, tone: "bg-muted text-foreground-secondary" },
    { id: "muted", label: "Muted", badge: counts.muted, tone: "bg-muted text-foreground-secondary" },
    { id: "no_data", label: "No data", badge: counts.no_data, tone: "bg-muted text-foreground-secondary" },
  ];
  return (
    <div className="flex items-center gap-1 border-b border-[var(--border-color)]">
      {tabs.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors ${
              active
                ? "border-primary text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
            <span className={`rounded px-1.5 py-0.5 text-[10px] ${t.tone}`}>{t.badge}</span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(Tabs);
