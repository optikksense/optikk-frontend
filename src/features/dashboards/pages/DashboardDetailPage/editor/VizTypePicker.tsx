import { BarChart3, Hash, LineChart, type LucideIcon, Table2 } from "lucide-react";

import { cn } from "@shared/lib/utils";

import type { WidgetVizType } from "../../../builder/metricsWidget";

const VIZ_OPTIONS: ReadonlyArray<{
  readonly value: WidgetVizType;
  readonly label: string;
  readonly icon: LucideIcon;
}> = [
  { value: "timeseries", label: "Timeseries", icon: LineChart },
  { value: "value", label: "Query value", icon: Hash },
  { value: "toplist", label: "Top list", icon: BarChart3 },
  { value: "table", label: "Table", icon: Table2 },
];

interface VizTypePickerProps {
  readonly value: WidgetVizType;
  readonly onChange: (viz: WidgetVizType) => void;
}

/** Four-way visualization selector backed by the basic metrics engine. */
export function VizTypePicker({ value, onChange }: VizTypePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {VIZ_OPTIONS.map(({ value: viz, label, icon: Icon }) => {
        const active = viz === value;
        return (
          <button
            key={viz}
            type="button"
            onClick={() => onChange(viz)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 transition-colors",
              active
                ? "border-primary bg-[var(--color-primary-subtle-08)] text-foreground"
                : "border-border text-foreground-muted hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Icon size={18} />
            <span className="font-medium text-[11px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
