import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { PaginatedResponse } from "@/features/services/api/serviceDetailApi";

import {
  type ErrorGroup,
  type ErrorTimeSeriesPoint,
  getErrorVolume,
  listErrorGroups,
} from "../../api/errorGroupsApi";
import { ErrorsKpiStrip, type ErrorsKpis } from "./ErrorsKpiStrip";
import { IssuesTable } from "./IssuesTable";
import { type ServiceFacet, ServiceFacetRail } from "./ServiceFacetRail";

const PAGE_SIZE = 25;
/** Capped fetch used only for cross-page KPIs + facet counts (not the paginated table). */
const AGGREGATE_LIMIT = 200;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function ErrorTrackingPage(): JSX.Element {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  useEffect(() => {
    setPage(0);
    setCursors({});
  }, [serviceFilter]);

  const groupsQ = useTimeRangeQuery<PaginatedResponse<ErrorGroup[]>>(
    "errors-groups",
    (_t, s, e) =>
      listErrorGroups(s, e, {
        limit: PAGE_SIZE,
        cursor,
        serviceName: serviceFilter ?? undefined,
      }),
    { extraKeys: [page, cursor, serviceFilter ?? ""] }
  );

  const aggregateQ = useTimeRangeQuery<PaginatedResponse<ErrorGroup[]>>(
    "errors-groups-aggregate",
    (_t, s, e) => listErrorGroups(s, e, { limit: AGGREGATE_LIMIT })
  );

  const volumeQ = useTimeRangeQuery<ErrorTimeSeriesPoint[]>("errors-volume", (_t, s, e) =>
    getErrorVolume(s, e)
  );

  const nextCursor = groupsQ.data?.pageInfo?.nextCursor;
  const hasMore = groupsQ.data?.pageInfo?.hasMore ?? false;
  useEffect(() => {
    if (nextCursor) {
      setCursors((prev) => ({ ...prev, [page]: nextCursor }));
    }
  }, [nextCursor, page]);

  const allGroups = useMemo(() => aggregateQ.data?.results ?? [], [aggregateQ.data]);
  const volumeSeries = useMemo(() => volumeQ.data ?? [], [volumeQ.data]);

  const kpis = useMemo<ErrorsKpis>(() => {
    const totalErrorsSeries = volumeSeries.map((p) => p.error_count);
    const cutoff = Date.now() - ONE_DAY_MS;
    let newIssues = 0;
    const services = new Set<string>();
    for (const g of allGroups) {
      services.add(g.service_name);
      const first = new Date(g.first_occurrence).getTime();
      if (!Number.isNaN(first) && first >= cutoff) newIssues += 1;
    }
    return {
      totalErrors: totalErrorsSeries.reduce((sum, v) => sum + v, 0),
      totalErrorsSeries,
      activeIssues: allGroups.length,
      newIssues,
      servicesAffected: services.size,
    };
  }, [allGroups, volumeSeries]);

  const facets = useMemo<ServiceFacet[]>(() => {
    const counts = new Map<string, number>();
    for (const g of allGroups) {
      counts.set(g.service_name, (counts.get(g.service_name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [allGroups]);

  const pageRows = useMemo(() => {
    const rows = groupsQ.data?.results ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.operation_name} ${r.status_message} ${r.service_name}`.toLowerCase().includes(q)
    );
  }, [groupsQ.data, query]);

  return (
    <PageShell>
      <PageHeader
        title="Error tracking"
        subtitle="Grouped error issues across all services, ordered by error count in the selected range. Click a row to inspect occurrences and the latest stack trace."
        icon={<AlertTriangle size={24} />}
      />

      {groupsQ.error ? (
        <div
          className="rounded-md border border-error bg-error-subtle px-3 py-2 text-error text-sm"
          role="alert"
        >
          Could not load error groups: {(groupsQ.error as Error).message}
        </div>
      ) : null}

      <ErrorsKpiStrip kpis={kpis} />

      {}
      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search size={15} className="text-foreground-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues — error type, message, service…"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-foreground-muted"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={13} className="text-foreground-muted" />
          </button>
        ) : null}
      </div>

      {}
      {serviceFilter ? (
        <div className="-mt-2 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">
            Filters
          </span>
          <span className="flex items-center gap-1.5 rounded border border-border bg-muted/50 py-[3px] pr-1 pl-2 text-[13px]">
            <span className="text-foreground-secondary">service:</span>
            <span className="font-medium font-mono text-foreground">{serviceFilter}</span>
            <button
              type="button"
              onClick={() => setServiceFilter(null)}
              aria-label="Remove service filter"
              className="inline-flex rounded p-0.5 text-foreground-muted hover:text-foreground"
            >
              <X size={11} />
            </button>
          </span>
          <button
            type="button"
            onClick={() => setServiceFilter(null)}
            className="text-[12px] text-foreground-muted hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      ) : null}

      {}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[212px_1fr]">
        <ServiceFacetRail
          facets={facets}
          totalCount={allGroups.length}
          active={serviceFilter}
          onSelect={setServiceFilter}
        />

        <PageSurface padding="lg">
          <IssuesTable
            rows={pageRows}
            onOpen={(groupId) => navigate({ to: `/errors/${encodeURIComponent(groupId)}` })}
          />

          <div className="mt-4 flex items-center justify-between border-border/40 border-t pt-4">
            <div className="text-[11.5px] text-foreground-muted">
              Showing {pageRows.length} {pageRows.length === 1 ? "issue" : "issues"} · page{" "}
              {page + 1}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </PageSurface>
      </div>
    </PageShell>
  );
}
