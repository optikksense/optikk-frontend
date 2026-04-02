import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, ScrollArea } from '@/components/ui';
import { PageSurface } from '@shared/components/ui';

import { cn } from '@/lib/utils';

import type { FacetGroup } from '../types';

const DEFAULT_VISIBLE = 10;

interface FacetRailProps {
  groups: FacetGroup[];
  selected: Record<string, string | string[] | null | undefined>;
  onSelect: (groupKey: string, value: string | null) => void;
  /** When set, clicking a value toggles membership (multi-select). */
  onToggleValue?: (groupKey: string, value: string) => void;
  multiSelect?: boolean;
}

function isValueActive(
  groupKey: string,
  value: string,
  selected: FacetRailProps['selected'],
  multiSelect: boolean
): boolean {
  const raw = selected[groupKey];
  if (multiSelect && Array.isArray(raw)) {
    return raw.includes(value);
  }
  return raw === value;
}

export function FacetRail({
  groups,
  selected,
  onSelect,
  onToggleValue,
  multiSelect = false,
}: FacetRailProps): JSX.Element {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedBuckets, setExpandedBuckets] = useState<Record<string, boolean>>({});

  const toggleCollapsed = (key: string): void => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleGroups = useMemo(() => groups, [groups]);

  return (
    <PageSurface padding="lg" className="h-full min-h-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Facets</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Narrow results by dimension; multi-select keeps a running OR within a group when
            enabled.
          </p>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-360px)] pr-3">
        <div className="space-y-3">
          {visibleGroups.map((group) => {
            const isCollapsed = collapsed[group.key] === true;
            const showMore = expandedBuckets[group.key] === true;
            const buckets = showMore ? group.buckets : group.buckets.slice(0, DEFAULT_VISIBLE);
            const hiddenCount = Math.max(0, group.buckets.length - DEFAULT_VISIBLE);

            return (
              <section
                key={group.key}
                className="space-y-2 rounded-xl border border-[var(--border-color)]/50 bg-[rgba(255,255,255,0.02)] p-2"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 text-left"
                  onClick={() => toggleCollapsed(group.key)}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    {group.label}
                  </span>
                  <Badge variant="default">{group.buckets.length}</Badge>
                </button>
                {!isCollapsed ? (
                  <div className="space-y-1.5 pl-1">
                    {buckets.map((bucket) => {
                      const active = isValueActive(group.key, bucket.value, selected, multiSelect);
                      return (
                        <button
                          key={`${group.key}-${bucket.value}`}
                          type="button"
                          onClick={() => {
                            if (multiSelect && onToggleValue) {
                              onToggleValue(group.key, bucket.value);
                            } else {
                              onSelect(group.key, active ? null : bucket.value);
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
                            active
                              ? 'border-[rgba(77,166,200,0.45)] bg-[rgba(77,166,200,0.14)] text-[var(--text-primary)]'
                              : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.16)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span className="truncate text-[13px]">{bucket.value || 'Unknown'}</span>
                          <span className="ml-3 text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
                            {bucket.count}
                          </span>
                        </button>
                      );
                    })}
                    {hiddenCount > 0 && !showMore ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-[11px]"
                        onClick={() =>
                          setExpandedBuckets((prev) => ({ ...prev, [group.key]: true }))
                        }
                      >
                        Show {hiddenCount} more
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </ScrollArea>
    </PageSurface>
  );
}
