import { Minus, Plus } from "lucide-react";
import { memo, useMemo, useState } from "react";

import type { LogsFacetValue } from "../../api/logsAnalyticsApi";

interface Props {
  readonly field: string;
  readonly label: string;
  readonly values: readonly LogsFacetValue[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
}

const INITIAL_SHOW = 5;

function ResourceFacetComponent({ field, label, values, onInclude, onExclude }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? values : values.slice(0, INITIAL_SHOW);
  const hasMore = values.length > INITIAL_SHOW;

  if (values.length === 0) return null;

  return (
    <div className="border-b border-[var(--border-color)] px-3 py-2.5">
      <span className="mb-1.5 block font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </span>
      <div className="space-y-0.5">
        {visible.map((item) => (
          <div
            key={item.value}
            className="group flex items-center gap-1.5 rounded py-0.5 px-1 -mx-1 hover:bg-[var(--bg-hover)]"
          >
            <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--text-primary)]">
              {item.value || "(empty)"}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)] tabular-nums">
              {item.count.toLocaleString()}
            </span>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onInclude(field, item.value)}
                title={`Filter by ${item.value}`}
                className="flex h-4 w-4 items-center justify-center rounded text-[var(--color-success)] hover:bg-[var(--color-success-subtle)]"
              >
                <Plus size={10} />
              </button>
              <button
                type="button"
                onClick={() => onExclude(field, item.value)}
                title={`Exclude ${item.value}`}
                className="flex h-4 w-4 items-center justify-center rounded text-[var(--color-error)] hover:bg-[var(--color-error-subtle)]"
              >
                <Minus size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-1 text-[10px] text-[var(--color-primary)] hover:underline"
        >
          {showAll ? "Show less" : `Show all ${values.length}`}
        </button>
      ) : null}
    </div>
  );
}

export const ResourceFacet = memo(ResourceFacetComponent);
