import { AreaChart, BarChart3, LineChart } from "lucide-react";

import { Select } from "@/components/ui";
import { cn } from "@/lib/utils";

import { SPACE_AGGREGATION_OPTIONS, TIME_STEP_OPTIONS } from "../constants";
import type { ChartType, MetricSpaceAggregation, TimeStep } from "../types";

interface MetricsExplorerToolbarProps {
  readonly chartType: ChartType;
  readonly step: TimeStep;
  readonly spaceAgg: MetricSpaceAggregation;
  readonly onChartTypeChange: (ct: ChartType) => void;
  readonly onStepChange: (s: TimeStep) => void;
  readonly onSpaceAggChange: (sa: MetricSpaceAggregation) => void;
}

const CHART_TYPE_BUTTONS: { value: ChartType; icon: typeof LineChart; label: string }[] = [
  { value: "line", icon: LineChart, label: "Line" },
  { value: "area", icon: AreaChart, label: "Area" },
  { value: "bar", icon: BarChart3, label: "Bar" },
];

export function MetricsExplorerToolbar({
  chartType,
  step,
  spaceAgg,
  onChartTypeChange,
  onStepChange,
  onSpaceAggChange,
}: MetricsExplorerToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Left: chart type toggle */}
      <div className="inline-flex overflow-hidden rounded-lg border border-[var(--border-color)]">
        {CHART_TYPE_BUTTONS.map(({ value, icon: Icon, label }) => {
          const active = chartType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChartTypeChange(value)}
              title={label}
              className={cn(
                "flex h-8 items-center gap-1.5 px-3 font-medium text-[12px]",
                "transition-colors duration-150",
                active
                  ? "border-[rgba(77,166,200,0.45)] border-r bg-[rgba(77,166,200,0.14)] text-[var(--text-primary)]"
                  : "border-[var(--border-color)] border-r text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
                "last:border-r-0"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Right: step + space agg */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
            Step
          </span>
          <Select
            size="sm"
            value={step}
            onChange={onStepChange}
            options={TIME_STEP_OPTIONS}
            className="w-[80px]"
          />
        </div>

        <div className="h-4 w-px bg-[var(--border-color)]" />

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
            Space
          </span>
          <Select
            size="sm"
            value={spaceAgg}
            onChange={onSpaceAggChange}
            options={SPACE_AGGREGATION_OPTIONS}
            className="w-[90px]"
          />
        </div>
      </div>
    </div>
  );
}
