import { Minus, Plus } from "lucide-react";
import { memo, useState } from "react";

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
    <div className="ok-facet">
      <div className="ok-facet-t">{label}</div>
      {visible.map((item) => (
        <button
          key={item.value || "(empty)"}
          type="button"
          className="ok-list-row"
          onClick={() => onInclude(field, item.value)}
          onContextMenu={(e) => {
            e.preventDefault();
            onExclude(field, item.value);
          }}
          title={`Click to filter, right-click to exclude`}
        >
          <span className="ok-list-row-n">{item.value || "(empty)"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              className="opacity-0 group-hover:opacity-100"
              style={{ display: "inline-flex", gap: 2 }}
            >
              <Plus size={10} className="text-[var(--color-success)]" />
              <Minus size={10} className="text-[var(--color-error)]" />
            </span>
            <span className="ok-list-row-c">{item.count.toLocaleString()}</span>
          </span>
        </button>
      ))}
      {hasMore ? (
        <button type="button" onClick={() => setShowAll(!showAll)} className="ok-facet-more">
          {showAll ? "Show less" : `Show all ${values.length}`}
        </button>
      ) : null}
    </div>
  );
}

export const ResourceFacet = memo(ResourceFacetComponent);
