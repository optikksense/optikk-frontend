import { ChevronDown, Search } from "lucide-react";
import { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";

import { Popover } from "@/components/ui";
import { cn } from "@/lib/utils";

import { useMetricNames } from "../../hooks/useMetricNames";
import type { MetricNameEntry } from "../../types";

interface MetricSelectorProps {
  readonly value: string;
  readonly onChange: (metricName: string) => void;
}

function groupByPrefix(metrics: MetricNameEntry[]): Map<string, MetricNameEntry[]> {
  const groups = new Map<string, MetricNameEntry[]>();
  for (const m of metrics) {
    const dotIdx = m.name.indexOf(".");
    const prefix = dotIdx > 0 ? m.name.slice(0, dotIdx) : "other";
    const list = groups.get(prefix) ?? [];
    list.push(m);
    groups.set(prefix, list);
  }
  return groups;
}

export function MetricSelector({ value, onChange }: MetricSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useMetricNames(deferredSearch);
  const metrics = data?.metrics ?? [];

  const grouped = useMemo(() => groupByPrefix(metrics), [metrics]);

  const handleSelect = useCallback(
    (name: string) => {
      onChange(name);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
    }
  }, []);

  const displayLabel = value || "Select metric…";

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      className="max-h-[360px] w-[380px] overflow-hidden p-0"
      trigger={
        <button
          type="button"
          className={cn(
            "flex h-8 min-w-[200px] flex-1 items-center gap-2 rounded-[var(--card-radius)]",
            "border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3",
            "text-[12px] transition-colors duration-150",
            "hover:border-[rgba(148,163,184,0.25)]",
            value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
          )}
        >
          <span className="flex-1 truncate text-left">{displayLabel}</span>
          <ChevronDown size={14} className="shrink-0 text-[var(--text-muted)]" />
        </button>
      }
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-[var(--border-color)] border-b px-3 py-2">
          <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search metrics…"
            className="h-6 flex-1 bg-transparent text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto p-1">
          {metrics.length === 0 && (
            <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">
              {deferredSearch ? "No metrics found" : "Type to search metrics"}
            </div>
          )}

          {Array.from(grouped.entries()).map(([prefix, items]) => (
            <div key={prefix}>
              <div className="px-2 pt-2 pb-1 font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em]">
                {prefix}
              </div>
              {items.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handleSelect(m.name)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
                    "text-left text-[12px] transition-colors duration-100",
                    m.name === value
                      ? "bg-[rgba(77,166,200,0.14)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span className="flex-1 truncate font-mono">{m.name}</span>
                  {m.unit && (
                    <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{m.unit}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Popover>
  );
}
