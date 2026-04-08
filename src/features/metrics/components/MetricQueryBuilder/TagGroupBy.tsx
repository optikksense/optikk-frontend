import { Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Popover, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

import { useMetricTags } from "../../hooks/useMetricTags";

interface TagGroupByProps {
  readonly metricName: string;
  readonly groupBy: string[];
  readonly onChange: (groupBy: string[]) => void;
}

export function TagGroupBy({ metricName, groupBy, onChange }: TagGroupByProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  const { data: tagsData } = useMetricTags(metricName);
  const tags = tagsData?.tags ?? [];

  const availableOptions = useMemo(() => {
    const used = new Set(groupBy);
    return tags.filter((t) => !used.has(t.key)).map((t) => ({ label: t.key, value: t.key }));
  }, [tags, groupBy]);

  const handleAdd = useCallback(() => {
    if (!selectedKey) return;
    onChange([...groupBy, selectedKey]);
    setSelectedKey("");
    setAddOpen(false);
  }, [selectedKey, groupBy, onChange]);

  const handleRemove = useCallback(
    (key: string) => {
      onChange(groupBy.filter((k) => k !== key));
    },
    [groupBy, onChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {groupBy.map((key) => (
        <span
          key={key}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border px-2 py-1",
            "border-[var(--border-color)] bg-[var(--bg-tertiary)]",
            "text-[12px] text-[var(--text-secondary)]",
            "fade-in-0 zoom-in-95 animate-in duration-150"
          )}
        >
          <span className="max-w-[120px] truncate font-mono text-[11px]">{key}</span>
          <button
            type="button"
            onClick={() => handleRemove(key)}
            className="opacity-55 transition-opacity hover:opacity-100"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {metricName && availableOptions.length > 0 && (
        <Popover
          open={addOpen}
          onOpenChange={setAddOpen}
          className="w-[220px] p-3"
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
              <span>by</span>
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            <Select
              size="sm"
              placeholder="Tag key"
              options={availableOptions}
              value={selectedKey}
              onChange={setSelectedKey}
            />
            <button
              type="button"
              disabled={!selectedKey}
              onClick={handleAdd}
              className={cn(
                "h-8 rounded-[var(--card-radius)] px-3 font-medium text-[12px]",
                "transition-colors duration-150",
                selectedKey
                  ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                  : "cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              )}
            >
              Add group
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
}
