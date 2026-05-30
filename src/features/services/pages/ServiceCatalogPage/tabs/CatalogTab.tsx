import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import { CatalogQuickLook } from "../catalog/CatalogQuickLook";
import { CatalogTable } from "../catalog/CatalogTable";
import { SearchToolbar } from "../catalog/SearchToolbar";
import { type StatusFilter } from "../catalog/StatusFilterPill";
import type { CatalogRow } from "../catalog/buildCatalogRows";
import { CatalogKpiStrip } from "../header/CatalogKpiStrip";
import { useCatalogAggregate } from "../hooks/useCatalogAggregate";
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

function applyFilters(
  rows: CatalogRow[],
  search: string,
  status: StatusFilter,
  env: string
): CatalogRow[] {
  const needle = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (!matchesStatus(row, status)) return false;
    if (env !== "any" && row.environment !== env) return false;
    if (needle && !row.serviceName.toLowerCase().includes(needle)) return false;
    return true;
  });
}

function EmptyState({ isPending }: { isPending: boolean }) {
  return (
    <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
      {isPending ? "Loading services…" : "No services match the current filters."}
    </div>
  );
}

export function CatalogTab() {
  const { rows, comparison, windowSec, isPending } = useCatalogList();
  const aggregate = useCatalogAggregate(rows, comparison, windowSec);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = normalizeStatusFilter(params.get("status"));
  const setStatus = (next: StatusFilter) => {
    const updated = new URLSearchParams(params);
    if (next === "any") updated.delete("status");
    else updated.set("status", next);
    setParams(updated);
  };
  const [search, setSearch] = useState("");
  const [env, setEnv] = useState("any");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const environments = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.environment && r.environment !== "—") set.add(r.environment);
    return [...set].sort();
  }, [rows]);

  const filtered = useMemo(
    () => applyFilters(rows, search, status, env),
    [rows, search, status, env]
  );

  const selected = useMemo(
    () => (selectedName ? (rows.find((r) => r.serviceName === selectedName) ?? null) : null),
    [rows, selectedName]
  );

  const openService = (serviceName: string) => {
    const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName));
    navigate(dynamicNavigateOptions(detail));
  };

  return (
    <div className="flex flex-col gap-4">
      <CatalogKpiStrip aggregate={aggregate} />
      <div className="flex gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-md border border-border bg-card p-4">
          <SearchToolbar
            value={search}
            onChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            env={env}
            onEnvChange={setEnv}
            environments={environments}
          />
          {filtered.length === 0 ? (
            <EmptyState isPending={isPending} />
          ) : (
            <CatalogTable rows={filtered} onRowClick={setSelectedName} />
          )}
        </div>
        {selected && (
          <CatalogQuickLook
            row={selected}
            onClose={() => setSelectedName(null)}
            onOpenService={openService}
          />
        )}
      </div>
    </div>
  );
}
