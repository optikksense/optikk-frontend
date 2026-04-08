import { Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Popover, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

import { useMetricTags } from "../../hooks/useMetricTags";
import type { MetricFilterOperator, MetricTagFilter } from "../../types";

interface TagFilterProps {
  readonly metricName: string;
  readonly filters: MetricTagFilter[];
  readonly onChange: (filters: MetricTagFilter[]) => void;
}

const OPERATOR_OPTIONS = [
  { label: "=", value: "eq" },
  { label: "!=", value: "neq" },
  { label: "in", value: "in" },
  { label: "not in", value: "not_in" },
  { label: "~", value: "wildcard" },
];

function operatorDisplay(op: MetricFilterOperator): string {
  return OPERATOR_OPTIONS.find((o) => o.value === op)?.label ?? op;
}

function filterDisplay(f: MetricTagFilter): string {
  const val = Array.isArray(f.value) ? f.value.join(", ") : f.value;
  return `${f.key} ${operatorDisplay(f.operator)} ${val}`;
}

export function TagFilter({ metricName, filters, onChange }: TagFilterProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedOp, setSelectedOp] = useState<MetricFilterOperator>("eq");
  const [selectedValue, setSelectedValue] = useState("");

  const { data: tagsData } = useMetricTags(metricName);
  const tags = tagsData?.tags ?? [];

  const tagKeyOptions = useMemo(() => tags.map((t) => ({ label: t.key, value: t.key })), [tags]);

  const tagValueOptions = useMemo(() => {
    const tag = tags.find((t) => t.key === selectedKey);
    return (tag?.values ?? []).map((v) => ({ label: v, value: v }));
  }, [tags, selectedKey]);

  const handleAdd = useCallback(() => {
    if (!selectedKey || !selectedValue) return;
    const newFilter: MetricTagFilter = {
      key: selectedKey,
      operator: selectedOp,
      value: selectedValue,
    };
    onChange([...filters, newFilter]);
    setSelectedKey("");
    setSelectedOp("eq");
    setSelectedValue("");
    setAddOpen(false);
  }, [selectedKey, selectedOp, selectedValue, filters, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(filters.filter((_, i) => i !== index));
    },
    [filters, onChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {filters.map((f, i) => (
        <span
          key={`${f.key}-${f.operator}-${i}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-2xl border px-[10px] py-[2px]",
            "border-[var(--color-primary-subtle-28)] bg-[var(--color-primary-subtle-12)]",
            "fade-in-0 zoom-in-95 animate-in text-[11px] text-[var(--color-primary)] duration-150"
          )}
        >
          <span className="max-w-[180px] truncate">{filterDisplay(f)}</span>
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="ml-0.5 opacity-55 transition-opacity hover:opacity-100"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {metricName && (
        <Popover
          open={addOpen}
          onOpenChange={setAddOpen}
          className="w-[280px] p-3"
          trigger={
            <button
              type="button"
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-md px-1.5",
                "text-[11px] text-[var(--text-muted)]",
                "hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
                "transition-colors duration-100"
              )}
            >
              <Plus size={12} />
              <span>where</span>
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            <Select
              size="sm"
              placeholder="Tag key"
              options={tagKeyOptions}
              value={selectedKey}
              onChange={(v) => {
                setSelectedKey(v);
                setSelectedValue("");
              }}
            />
            <Select
              size="sm"
              placeholder="Operator"
              options={OPERATOR_OPTIONS}
              value={selectedOp}
              onChange={(v) => setSelectedOp(v as MetricFilterOperator)}
            />
            <Select
              size="sm"
              placeholder="Value"
              options={tagValueOptions}
              value={selectedValue}
              onChange={setSelectedValue}
            />
            <button
              type="button"
              disabled={!selectedKey || !selectedValue}
              onClick={handleAdd}
              className={cn(
                "h-8 rounded-[var(--card-radius)] px-3 font-medium text-[12px]",
                "transition-colors duration-150",
                selectedKey && selectedValue
                  ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                  : "cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              )}
            >
              Add filter
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
}
