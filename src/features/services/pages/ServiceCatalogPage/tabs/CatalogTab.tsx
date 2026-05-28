import { useMemo, useState } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

import type { CatalogRow } from "../catalog/buildCatalogRows";
import { CatalogDrawer } from "../catalog/CatalogDrawer";
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

function applyFilters(
  rows: ReturnType<typeof useCatalogList>["rows"],
  search: string,
  status: StatusFilter
): ReturnType<typeof useCatalogList>["rows"] {
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
  const [params, setParams] = useSearchParams();
  const status = normalizeStatusFilter(params.get("status"));
  const setStatus = (next: StatusFilter) => {
    const updated = new URLSearchParams(params);
    if (next === "any") updated.delete("status");
    else updated.set("status", next);
    setParams(updated);
  };
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = useMemo(() => applyFilters(rows, search, status), [rows, search, status]);
  const selectedRow = useMemo(
    () => rows.find((row) => row.serviceName === selected) ?? null,
    [rows, selected]
  );
  return (
    <div className="flex flex-col gap-3">
      <SearchToolbar
        value={search}
        onChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      {filtered.length === 0 ? (
        <EmptyState isPending={isPending} />
      ) : (
        <div
          className="grid grid-cols-1 gap-3"
          style={selectedRow ? { gridTemplateColumns: "minmax(0, 1fr) 360px" } : undefined}
        >
          <CatalogTable rows={filtered} onSelect={setSelected} selectedServiceName={selected} />
          {selectedRow && <CatalogDrawer row={selectedRow} onClose={() => setSelected(null)} />}
        </div>
      )}
    </div>
  );
}
