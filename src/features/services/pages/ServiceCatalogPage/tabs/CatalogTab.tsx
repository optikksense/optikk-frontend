import { useMemo, useState } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

import ServiceDetailDrawer from "@shared/components/ui/drawers/ServiceDetailDrawer";

import { CatalogTable } from "../catalog/CatalogTable";
import { SearchToolbar } from "../catalog/SearchToolbar";
import type { StatusFilter } from "../catalog/StatusFilterPill";
import type { CatalogRow } from "../catalog/buildCatalogRows";
import { useCatalogList } from "../hooks/useCatalogList";

function normalizeStatusFilter(value: string | null): StatusFilter {
  if (value === "healthy" || value === "warn" || value === "error" || value === "unhealthy") {
    return value;
  }
  return "any";
}

function matchesStatus(row: CatalogRow, filter: StatusFilter): boolean {
  if (filter === "any") return true;
  if (filter === "unhealthy") return row.status === "warn" || row.status === "error";
  return row.status === filter;
}

function applyFilters(rows: CatalogRow[], search: string, status: StatusFilter): CatalogRow[] {
  const needle = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (!matchesStatus(row, status)) return false;
    if (needle && !row.serviceName.toLowerCase().includes(needle)) return false;
    return true;
  });
}

// Drawer seeds its summary from snake_case keys; map the camelCase row across.
function toDrawerInitialData(row: CatalogRow | null): Record<string, unknown> | null {
  if (!row) return null;
  return {
    request_count: row.requestCount,
    error_count: row.errorCount,
    error_rate: row.errorRate * 100, // row is decimal (0-1); drawer expects percent
    p95_latency: row.p95Ms,
    p99_latency: row.p99Ms,
    version: row.version,
    environment: row.environment,
    lang: row.lang,
    instances: row.instances,
  };
}

function EmptyState({ isPending }: { isPending: boolean }) {
  return (
    <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
      {isPending ? "Loading services…" : "No services match the current filters."}
    </div>
  );
}

export function CatalogTab() {
  const { rows, isPending } = useCatalogList();
  const [params, setParams] = useSearchParams();
  const status = normalizeStatusFilter(params.get("status"));
  const setStatus = (next: StatusFilter) => {
    const updated = new URLSearchParams(params);
    if (next === "any") updated.delete("status");
    else updated.set("status", next);
    setParams(updated);
  };
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const filtered = useMemo(() => applyFilters(rows, search, status), [rows, search, status]);

  const selected = useMemo(
    () => (selectedName ? (rows.find((r) => r.serviceName === selectedName) ?? null) : null),
    [rows, selectedName]
  );

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[14px] rounded-lg border border-border bg-card p-[22px_24px] shadow-[var(--shadow-md)]">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
        {filtered.length === 0 ? (
          <EmptyState isPending={isPending} />
        ) : (
          <CatalogTable rows={filtered} onRowClick={setSelectedName} />
        )}
      </div>
      <ServiceDetailDrawer
        open={Boolean(selectedName)}
        serviceName={selectedName ?? ""}
        initialData={toDrawerInitialData(selected)}
        onClose={() => setSelectedName(null)}
      />
    </div>
  );
}
