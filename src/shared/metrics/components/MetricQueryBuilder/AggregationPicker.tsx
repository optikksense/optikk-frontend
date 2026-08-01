import { Select } from "@shared/components/primitives/ui/select";

import { AGGREGATION_OPTIONS } from "@shared/metrics/constants";
import type { MetricAggregation, MetricNameEntry } from "@shared/metrics/types";
import { getValidAggregations } from "@shared/metrics/utils/metricHelpers";

interface AggregationPickerProps {
  readonly value: MetricAggregation;
  readonly onChange: (value: MetricAggregation) => void;
  readonly metricEntry?: MetricNameEntry;
}

export function AggregationPicker({ value, onChange, metricEntry }: AggregationPickerProps) {
  const valid = getValidAggregations(metricEntry);
  const options = AGGREGATION_OPTIONS.filter((opt) => valid.includes(opt.value));

  return (
    <Select
      size="sm"
      value={value}
      onChange={(v) => onChange(v as MetricAggregation)}
      options={options}
      className="w-[100px] shrink-0"
    />
  );
}
