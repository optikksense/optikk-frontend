import { Select } from "@shared/components/primitives/ui";

import { AGGREGATION_OPTIONS } from "@shared/metrics/constants";
import type { MetricAggregation } from "@shared/metrics/types";

interface AggregationPickerProps {
  readonly value: MetricAggregation;
  readonly onChange: (value: MetricAggregation) => void;
}

export function AggregationPicker({ value, onChange }: AggregationPickerProps) {
  return (
    <Select
      size="sm"
      value={value}
      onChange={(v) => onChange(v as MetricAggregation)}
      options={AGGREGATION_OPTIONS}
      className="w-[100px] shrink-0"
    />
  );
}
