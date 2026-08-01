import { Activity, type LucideIcon, ScrollText } from "lucide-react";

import { cn } from "@shared/lib/utils";

const SOURCES: ReadonlyArray<{
  readonly label: string;
  readonly icon: LucideIcon;
  readonly enabled: boolean;
}> = [
  { label: "Metrics", icon: Activity, enabled: true },
  { label: "Logs", icon: ScrollText, enabled: false },
];

/** Data-source selector for widget creation; supports Metrics and Logs. */
export function DataSourceRow() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SOURCES.map(({ label, icon: Icon, enabled }) => (
        <div
          key={label}
          title={enabled ? undefined : "Coming soon"}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]",
            enabled
              ? "border-primary bg-[var(--color-primary-subtle-08)] font-medium text-foreground"
              : "cursor-not-allowed border-border text-foreground-muted opacity-50"
          )}
        >
          <Icon size={14} />
          <span className="truncate font-medium">{label}</span>
          {!enabled && <span className="ml-auto text-[8.5px] uppercase tracking-wide">soon</span>}
        </div>
      ))}
    </div>
  );
}
