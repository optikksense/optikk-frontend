import { Select } from "@/components/ui";

import { AGGREGATION_OPTIONS } from "../../constants";
import type { MetricAggregation } from "../../types";

interface AggregationPickerProps {
  readonly value: MetricAggregation;
  readonly onChange: (value: MetricAggregation) => void;
}

export function AggregationPicker({ value, onChange }: AggregationPickerProps) {
  return (
    <Select
      size="sm"
      value={value}
      onChange={onChange}
      options={AGGREGATION_OPTIONS}
      className="w-[100px] shrink-0"
    />
  );
}
