import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { memo, useState } from "react";

import type { LogsFacets } from "../../api/logsAnalyticsApi";
import { useLogsExplorerStore } from "../../store/logsExplorerStore";
import { ResourceFacet } from "./ResourceFacet";
import { SeverityFacet } from "./SeverityFacet";

interface Props {
  readonly facets: LogsFacets | undefined;
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly activeFilterCount: number;
  readonly onClearAll: () => void;
}

function LogsFacetPanelComponent({ facets, onInclude, onExclude, activeFilterCount, onClearAll }: Props) {
  const collapsed = useLogsExplorerStore((s) => s.facetCollapsed);
  const setCollapsed = useLogsExplorerStore((s) => s.setFacetCollapsed);
  const [search, setSearch] = useState("");

  if (collapsed) {
    return (
      <aside className="flex w-9 shrink-0 flex-col items-center border-r border-[var(--border-color)] bg-[var(--bg-primary)] py-2">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Expand facets"
        >
          <PanelLeftOpen size={14} />
        </button>
      </aside>
    );
  }

  const matchesSearch = (label: string) =>
    !search || label.toLowerCase().includes(search.toLowerCase());

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
            Facets
          </span>
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-0.5 rounded px-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={10} /> Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Collapse facets"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-3 py-2">
        <input
          type="search"
          placeholder="Search facets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-[11px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Facet groups */}
      {facets ? (
        <div className="flex-1 overflow-y-auto">
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
        </div>
      ) : (
        <div className="space-y-2 px-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-[var(--bg-secondary)]" />
          ))}
        </div>
      )}
    </aside>
  );
}

export const LogsFacetPanel = memo(LogsFacetPanelComponent);
