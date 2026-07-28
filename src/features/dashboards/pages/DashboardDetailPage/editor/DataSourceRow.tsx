import {
  Activity,
  Boxes,
  Database,
  type LucideIcon,
  MousePointerClick,
  ScrollText,
  Sparkles,
} from "lucide-react";

import { cn } from "@shared/lib/utils";

const SOURCES: ReadonlyArray<{
  readonly label: string;
  readonly icon: LucideIcon;
  readonly enabled: boolean;
}> = [
  { label: "Metrics", icon: Activity, enabled: true },
  { label: "APM", icon: Boxes, enabled: false },
  { label: "Infrastructure", icon: Database, enabled: false },
  { label: "Logs", icon: ScrollText, enabled: false },
  { label: "Events", icon: Sparkles, enabled: false },
  { label: "RUM", icon: MousePointerClick, enabled: false },
];

                                                                          
export function DataSourceRow() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SOURCES.map(({ label, icon: Icon, enabled }) => (
        <div
          key={label}
          title={enabled ? undefined : "Coming soon"}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]",
            enabled
              ? "border-primary bg-[var(--color-primary-subtle-08)] text-foreground"
              : "border-border text-foreground-muted opacity-50"
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
