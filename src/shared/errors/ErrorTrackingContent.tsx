import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";

import { PageSurface } from "@shared/components/ui";

import { ErrorsKpiStrip } from "./components/ErrorsKpiStrip";
import { IssuesTable } from "./components/IssuesTable";
import { ServiceFacetRail } from "./components/ServiceFacetRail";
import { useErrorTracking } from "./hooks/useErrorTracking";

interface ErrorTrackingContentProps {
  /** When set, scopes to one service and hides the service facet rail + chip. */
  readonly lockedService?: string;
}

/**
 * Body shared by the standalone Error Tracking page and the service-scoped
 * Errors tab: KPI strip + search + issues table + pager. The service facet rail
 * shows only in the unscoped (page) variant.
 */
export function ErrorTrackingContent({ lockedService }: ErrorTrackingContentProps) {
  const navigate = useNavigate();
  const t = useErrorTracking({ lockedService });

  const table = (
    <PageSurface padding="lg">
      <IssuesTable
        rows={t.pageRows}
        onOpen={(groupId) => navigate({ to: `/errors/${encodeURIComponent(groupId)}` })}
      />

      <div className="mt-4 flex items-center justify-between border-border/40 border-t pt-4">
        <div className="text-[11.5px] text-foreground-muted">
          Showing {t.pageRows.length} {t.pageRows.length === 1 ? "issue" : "issues"} · page{" "}
          {t.page + 1}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={t.page === 0}
            onClick={() => t.setPage((p) => Math.max(0, p - 1))}
            className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!t.hasMore}
            onClick={() => t.setPage((p) => p + 1)}
            className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </PageSurface>
  );

  return (
    <>
      {t.error ? (
        <div
          className="rounded-md border border-error bg-error-subtle px-3 py-2 text-error text-sm"
          role="alert"
        >
          Could not load error groups: {t.error.message}
        </div>
      ) : null}

      <ErrorsKpiStrip kpis={t.kpis} />

      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search size={15} className="text-foreground-muted" />
        <input
          value={t.query}
          onChange={(e) => t.setQuery(e.target.value)}
          placeholder="Search issues — error type, message, service…"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-foreground-muted"
        />
        {t.query ? (
          <button type="button" onClick={() => t.setQuery("")} aria-label="Clear search">
            <X size={13} className="text-foreground-muted" />
          </button>
        ) : null}
      </div>

      {lockedService ? (
        table
      ) : (
        <>
          {t.serviceFilter ? (
            <div className="-mt-2 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">
                Filters
              </span>
              <span className="flex items-center gap-1.5 rounded border border-border bg-muted/50 py-[3px] pr-1 pl-2 text-[13px]">
                <span className="text-foreground-secondary">service:</span>
                <span className="font-medium font-mono text-foreground">{t.serviceFilter}</span>
                <button
                  type="button"
                  onClick={() => t.setServiceFilter(null)}
                  aria-label="Remove service filter"
                  className="inline-flex rounded p-0.5 text-foreground-muted hover:text-foreground"
                >
                  <X size={11} />
                </button>
              </span>
              <button
                type="button"
                onClick={() => t.setServiceFilter(null)}
                className="text-[12px] text-foreground-muted hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[212px_1fr]">
            <ServiceFacetRail
              facets={t.facets}
              totalCount={t.totalGroups}
              active={t.serviceFilter}
              onSelect={t.setServiceFilter}
            />

            {table}
          </div>
        </>
      )}
    </>
  );
}
