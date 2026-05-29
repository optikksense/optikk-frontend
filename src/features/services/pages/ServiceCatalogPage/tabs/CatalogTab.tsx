import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import type { CatalogRow } from "../catalog/buildCatalogRows";
import { CatalogTable } from "../catalog/CatalogTable";
import { SearchToolbar } from "../catalog/SearchToolbar";
import { type StatusFilter } from "../catalog/StatusFilterPill";
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

function EmptyState({ isPending }: { isPending: boolean }) {
  return (
    <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
      {isPending ? "Loading services…" : "No services match the current filters."}
    </div>
  );
}

export function CatalogTab() {
  const { rows, isPending } = useCatalogList();
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
  const filtered = useMemo(() => applyFilters(rows, search, status), [rows, search, status]);

  const openService = (serviceName: string) => {
    const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName));
    navigate(dynamicNavigateOptions(detail));
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <SearchToolbar
        value={search}
        onChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      {filtered.length === 0 ? (
        <EmptyState isPending={isPending} />
      ) : (
        <CatalogTable rows={filtered} onRowClick={openService} />
      )}
    </div>
  );
}
