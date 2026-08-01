import type { CreateMonitorPayload, MetricQueryShape } from "../../../api/monitorsApi";

import { MetricSelector } from "@shared/metrics/components/MetricQueryBuilder/MetricSelector";
import { AGGREGATION_OPTIONS } from "@shared/metrics/constants";
import { useMetricNames } from "@shared/metrics/hooks/useMetricNames";
import type { MetricAggregation } from "@shared/metrics/types";
import {
  getDefaultAggregationForMetric,
  getValidAggregations,
} from "@shared/metrics/utils/metricHelpers";

import FieldRow from "./FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

const ALL_AGGREGATIONS = AGGREGATION_OPTIONS.map(({ value }) => value);
const WINDOWS = [60, 300, 900, 3600];

export default function MetricQuery({ draft, setDraft }: Props) {
  const { data } = useMetricNames("");
  const q: MetricQueryShape = draft.query.metric ?? {
    metric: "",
    aggregation: "avg",
    windowSec: 300,
  };

  const metricEntry = data?.metrics.find((m) => m.name === q.metric);
  const validAggs = getValidAggregations(metricEntry);
  const aggregations = ALL_AGGREGATIONS.filter((aggregation) => validAggs.includes(aggregation));

  const update = (patch: Partial<MetricQueryShape>) =>
    setDraft((prev) => ({
      ...prev,
      query: { metric: { ...q, ...patch } },
    }));

  const handleMetricChange = (name: string) => {
    const entry = data?.metrics.find((m) => m.name === name);
    const aggregation = getDefaultAggregationForMetric(entry, q.aggregation as MetricAggregation);
    update({ metric: name, aggregation });
  };

  return (
    <>
      <FieldRow label="Metric">
        <MetricSelector value={q.metric} onChange={handleMetricChange} />
      </FieldRow>
      <FieldRow label="Aggregation">
        <div className="flex flex-wrap items-center gap-1.5">
          {aggregations.map((a) => {
            const active = q.aggregation === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => update({ aggregation: a })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground-secondary hover:text-foreground"
                }`}
              >
                {a}
              </button>
            );
          })}
          <span className="text-foreground-muted text-xs">over</span>
          {WINDOWS.map((w) => {
            const active = q.windowSec === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => update({ windowSec: w })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground-secondary hover:text-foreground"
                }`}
              >
                {w >= 3600 ? `${w / 3600}h` : `${w / 60}m`}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </>
  );
}
