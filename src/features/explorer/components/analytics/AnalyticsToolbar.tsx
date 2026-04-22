import { memo, useCallback } from "react";

import type {
  AnalyticsAggregation,
  AnalyticsRequest,
  AnalyticsVizMode,
} from "../../types/analytics";
import { AnalyticsVizTabs } from "./AnalyticsVizTabs";

const MAX_GROUP_BY = 4;
const MAX_AGGS = 8;

export interface AnalyticsToolbarValue {
  readonly groupBy: readonly string[];
  readonly aggregations: readonly AnalyticsAggregation[];
  readonly step: string;
  readonly vizMode: AnalyticsVizMode;
}

interface Props {
  readonly value: AnalyticsToolbarValue;
  readonly onChange: (next: AnalyticsToolbarValue) => void;
  readonly availableFields: readonly { readonly key: string; readonly label: string }[];
  readonly stepOptions?: readonly string[];
}

function toggleIn(list: readonly string[], key: string, cap: number): string[] {
  if (list.includes(key)) return list.filter((entry) => entry !== key);
  if (list.length >= cap) return [...list];
  return [...list, key];
}

function GroupByControl({
  selected,
  available,
  onChange,
}: {
  selected: readonly string[];
  available: Props["availableFields"];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
        Group by
      </span>
      {available.map((field) => {
        const active = selected.includes(field.key);
        return (
          <button
            key={field.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(toggleIn(selected, field.key, MAX_GROUP_BY))}
            className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
              active
                ? "border-[var(--accent)] bg-[rgba(99,102,241,0.15)] text-[var(--text-primary)]"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {field.label}
          </button>
        );
      })}
    </div>
  );
}

function StepControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
      Step
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[12px] text-[var(--text-primary)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type AggField = AnalyticsRequest["aggregations"];

function AggSummary({ aggs }: { aggs: AggField }) {
  if (aggs.length === 0) return <span className="text-[11px] text-[var(--text-muted)]">+ add aggregation</span>;
  return (
    <span className="text-[11px] text-[var(--text-secondary)]">
      {aggs.length} / {MAX_AGGS} aggregations
    </span>
  );
}

function AnalyticsToolbarComponent(props: Props) {
  const {
    value,
    onChange,
    availableFields,
    stepOptions = ["auto", "10s", "30s", "1m", "5m", "15m", "1h"],
  } = props;
  const setGroupBy = useCallback((next: string[]) => onChange({ ...value, groupBy: next }), [onChange, value]);
  const setStep = useCallback((step: string) => onChange({ ...value, step }), [onChange, value]);
  const setViz = useCallback((vizMode: AnalyticsVizMode) => onChange({ ...value, vizMode }), [onChange, value]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-3">
        <GroupByControl selected={value.groupBy} available={availableFields} onChange={setGroupBy} />
        <AggSummary aggs={value.aggregations} />
        <StepControl value={value.step} options={stepOptions} onChange={setStep} />
      </div>
      <AnalyticsVizTabs value={value.vizMode} onChange={setViz} />
    </div>
  );
}

export const AnalyticsToolbar = memo(AnalyticsToolbarComponent);
