import { Maximize2, Search, X } from "lucide-react";
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
      <aside
        className="ok-facets"
        style={{ width: 40, padding: 6, alignItems: "center", justifyContent: "flex-start" }}
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="ok-ib"
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
    <aside className="ok-facets">
      <div className="ok-facets-h">
        <span className="ok-facets-t">
          Facets
          {activeFilterCount > 0 ? (
            <span
              style={{
                marginLeft: 6,
                padding: "0 6px",
                borderRadius: 999,
                background: "var(--accent)",
                color: "oklch(0.99 0.005 270)",
                fontSize: 10,
              }}
            >
              {activeFilterCount}
            </span>
          ) : null}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="ok-facets-c"
              title="Clear all filters"
              style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11 }}
            >
              <X size={10} /> Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="ok-facets-c"
            aria-label="Collapse facets"
            title="Collapse"
          >
            <Maximize2 size={12} style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      </div>

      <div className="ok-facet-search">
        <span className="ok-facet-search-i">
          <Search size={12} />
        </span>
        <input
          placeholder="Search facets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ height: 96, borderRadius: 6, background: "var(--bg-2)", opacity: 0.4 }}
            />
          ))}
        </div>
      )}
    </aside>
  );
}

export const LogsFacetPanel = memo(LogsFacetPanelComponent);
