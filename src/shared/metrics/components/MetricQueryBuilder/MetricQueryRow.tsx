import { X } from "lucide-react";

import { cn } from "@shared/lib/utils";

import { QUERY_LABEL_COLORS } from "@shared/metrics/constants";
import type {
  MetricAggregation,
  MetricQueryDefinition,
  MetricTagFilter,
} from "@shared/metrics/types";
import { AggregationPicker } from "./AggregationPicker";
import { MetricSelector } from "./MetricSelector";
import { TagFilter } from "./TagFilter";
import { TagGroupBy } from "./TagGroupBy";

interface MetricQueryRowProps {
  readonly query: MetricQueryDefinition;
  readonly canRemove: boolean;
  readonly onAggregationChange: (agg: MetricAggregation) => void;
  readonly onMetricChange: (metricName: string) => void;
  readonly onWhereChange: (filters: MetricTagFilter[]) => void;
  readonly onGroupByChange: (groupBy: string[]) => void;
  readonly onRemove: () => void;
}

export function MetricQueryRow({
  query,
  canRemove,
  onAggregationChange,
  onMetricChange,
  onWhereChange,
  onGroupByChange,
  onRemove,
}: MetricQueryRowProps) {
  const labelColor = QUERY_LABEL_COLORS[query.id] ?? "#6b7280";

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-border",
        "min-h-[48px] bg-secondary px-3 py-2",
        "transition-colors duration-150",
        "hover:border-border"
      )}
    >
      {/* Query label */}
      <div
        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-semibold text-[11px] text-white"
        style={{ backgroundColor: labelColor }}
      >
        {query.id}
      </div>

      {}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {}
        <div className="flex items-center gap-2">
          <AggregationPicker value={query.aggregation} onChange={onAggregationChange} />
          <MetricSelector value={query.metricName} onChange={onMetricChange} />
        </div>

        {}
        {query.metricName && (
          <div className="flex flex-wrap items-center gap-3">
            <TagFilter
              metricName={query.metricName}
              filters={[...query.where]}
              onChange={onWhereChange}
            />
            <div className="h-4 w-px bg-border" />
            <TagGroupBy
              metricName={query.metricName}
              groupBy={[...query.groupBy]}
              onChange={onGroupByChange}
            />
          </div>
        )}
      </div>

      {}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-1 shrink-0 rounded-md p-1 opacity-50 transition-all duration-100 hover:bg-accent hover:opacity-100"
        >
          <X size={14} className="text-foreground-muted" />
        </button>
      )}
    </div>
  );
}
