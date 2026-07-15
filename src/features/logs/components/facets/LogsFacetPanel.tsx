import { Maximize2, Search, X } from "lucide-react";
import { memo, useState } from "react";

import { cn } from "@shared/lib/utils";

import type { LogsFacets } from "@shared/logs/api/logsAnalyticsApi";
import { useLogsExplorerStore } from "@shared/logs/store/logsExplorerStore";
import { ResourceFacet } from "./ResourceFacet";
import { SeverityFacet } from "./SeverityFacet";

// Sticks under the app header while the row list scrolls the page. The cap
// stays just short of the scrollport so a long rail scrolls internally.
const FACETS_ASIDE =
  "sticky top-4 flex max-h-[calc(100vh-var(--space-header-h,56px)-3rem)] min-w-0 flex-col gap-[14px] overflow-y-auto rounded-[8px] border border-[var(--line)] bg-[var(--bg-1)] p-[14px]";
const ICON_BTN =
  "inline-grid h-[28px] w-[28px] cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]";

interface Props {
  readonly facets: LogsFacets | undefined;
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly activeFilterCount: number;
  readonly onClearAll: () => void;
}

function LogsFacetPanelComponent({
  facets,
  onInclude,
  onExclude,
  activeFilterCount,
  onClearAll,
}: Props) {
  const collapsed = useLogsExplorerStore((s) => s.facetCollapsed);
  const setCollapsed = useLogsExplorerStore((s) => s.setFacetCollapsed);
  const [search, setSearch] = useState("");

  if (collapsed) {
    return (
      <aside className={cn(FACETS_ASIDE, "!p-[6px] w-10 items-center justify-start")}>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className={ICON_BTN}
          aria-label="Expand facets"
        >
          <Maximize2 size={14} />
        </button>
      </aside>
    );
  }

  const matchesSearch = (label: string) =>
    !search || label.toLowerCase().includes(search.toLowerCase());

  return (
    <aside className={FACETS_ASIDE}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[11px] text-[var(--fg-2)] uppercase tracking-[0.08em]">
          Facets
          {activeFilterCount > 0 ? (
            <span className="ml-[6px] rounded-full bg-[var(--accent)] px-[6px] text-[10px] text-[oklch(0.99_0.005_270)]">
              {activeFilterCount}
            </span>
          ) : null}
        </span>
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex cursor-pointer items-center gap-[2px] border-0 bg-transparent p-0 text-[11px] text-[var(--fg-3)] hover:text-[var(--fg-0)]"
              title="Clear all filters"
            >
              <X size={10} /> Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="cursor-pointer border-0 bg-transparent p-0 text-[var(--fg-3)] hover:text-[var(--fg-0)]"
            aria-label="Collapse facets"
            title="Collapse"
          >
            <Maximize2 size={12} className="rotate-180" />
          </button>
        </div>
      </div>

      <div className="flex h-[30px] items-center gap-[7px] rounded-md border border-[var(--line)] bg-[var(--bg-0)] px-[10px]">
        <span className="inline-flex text-[var(--fg-3)]">
          <Search size={12} />
        </span>
        <input
          placeholder="Search facets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
        />
      </div>

      {facets ? (
        <>
          {matchesSearch("severity") ? (
            <SeverityFacet
              labels={facets.severity_bucket}
              onInclude={onInclude}
              onExclude={onExclude}
            />
          ) : null}
          {facets.service.length > 0 && matchesSearch("service") ? (
            <ResourceFacet
              field="service_name"
              label="Service"
              values={facets.service}
              onInclude={onInclude}
              onExclude={onExclude}
            />
          ) : null}
          {facets.host && facets.host.length > 0 && matchesSearch("host") ? (
            <ResourceFacet
              field="host"
              label="Host"
              values={facets.host}
              onInclude={onInclude}
              onExclude={onExclude}
            />
          ) : null}
          {facets.pod && facets.pod.length > 0 && matchesSearch("pod") ? (
            <ResourceFacet
              field="pod"
              label="Pod"
              values={facets.pod}
              onInclude={onInclude}
              onExclude={onExclude}
            />
          ) : null}
          {facets.environment && facets.environment.length > 0 && matchesSearch("environment") ? (
            <ResourceFacet
              field="environment"
              label="Environment"
              values={facets.environment}
              onInclude={onInclude}
              onExclude={onExclude}
            />
          ) : null}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-md bg-[var(--bg-2)] opacity-40" />
          ))}
        </div>
      )}
    </aside>
  );
}

export const LogsFacetPanel = memo(LogsFacetPanelComponent);
