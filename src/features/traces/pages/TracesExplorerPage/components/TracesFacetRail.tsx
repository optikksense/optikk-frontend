import type { FacetGroupModel } from "@/features/explorer/components/facets/FacetGroup";
import { formatNumber } from "@shared/utils/formatters";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { getServiceColor } from "../../../utils/serviceColor";

interface Props {
  groups: readonly FacetGroupModel[];
  onInclude: (field: string, value: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

const STATUS_DOT: Record<string, string> = {
  ok: "var(--ok)",
  warn: "var(--color-warning)",
  error: "var(--err)",
};

/** Dot color for a facet value: status by name, service by hash, else none. */
function dotColor(field: string, value: string): string | null {
  if (field.includes("status")) return STATUS_DOT[value.toLowerCase()] ?? null;
  if (field.includes("service")) return getServiceColor(value);
  return null;
}

export function TracesFacetRail({ groups, onInclude, onClearAll, activeFilterCount }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  return (
    <div
      className="overflow-y-auto border-border border-r bg-background"
      style={{ padding: "16px 14px" }}
    >
      <div className="flex flex-row items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="font-semibold text-[11px] text-foreground-muted uppercase tracking-[0.06em]">
          Facets
        </div>
        <div className="flex flex-row items-center gap-2">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="font-medium text-[11px] text-brand hover:underline"
            >
              Clear
            </button>
          ) : null}
          <ExternalLink size={13} className="text-foreground-muted" />
        </div>
      </div>

      <div
        className="flex flex-row items-center bg-card"
        style={{
          height: 34,
          padding: "0 10px",
          gap: 8,
          borderRadius: 6,
          border: "1px solid var(--line)",
          marginBottom: 20,
        }}
      >
        <Search size={14} className="text-foreground-muted" />
        <input
          placeholder="Search facets…"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-foreground-muted"
        />
      </div>

      {groups.map((g) => {
        const isExpanded = expandedGroups[g.field];
        const visibleBuckets = isExpanded ? g.buckets : g.buckets.slice(0, 8);
        const hasMore = g.buckets.length > 8;

        return (
          <div key={g.field} style={{ marginBottom: 24 }}>
            <div
              className="font-semibold text-[11px] text-foreground-muted uppercase tracking-[0.06em]"
              style={{ marginBottom: 10 }}
            >
              {g.label}
            </div>
            {visibleBuckets.map((b) => {
              const dot = dotColor(g.field, b.value);
              return (
                <div
                  key={b.value}
                  onClick={() => onInclude(g.field, b.value)}
                  className="flex cursor-pointer flex-row items-center justify-between rounded-md hover:bg-card-hover"
                  style={{ padding: "5px 6px" }}
                >
                  <div className="flex flex-row items-center" style={{ gap: 8, minWidth: 0 }}>
                    {dot ? (
                      <span
                        className="shrink-0"
                        style={{ width: 8, height: 8, borderRadius: "50%", background: dot }}
                      />
                    ) : null}
                    <span
                      className={
                        dot
                          ? "truncate text-[13.5px] text-foreground-secondary"
                          : "truncate font-mono text-[13px] text-foreground-secondary"
                      }
                    >
                      {b.value || "(empty)"}
                    </span>
                  </div>
                  <span className="ml-2 font-mono text-[12px] text-foreground-muted">
                    {formatNumber(b.count)}
                  </span>
                </div>
              );
            })}
            {hasMore && (
              <button
                type="button"
                onClick={() =>
                  setExpandedGroups((prev) => ({
                    ...prev,
                    [g.field]: !prev[g.field],
                  }))
                }
                className="mt-1 text-[11px] font-medium text-brand hover:underline"
                style={{ padding: "2px 6px" }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
