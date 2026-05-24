import { useMemo, useState } from "react";

import { CatalogDrawer } from "../catalog/CatalogDrawer";
import { CatalogTable } from "../catalog/CatalogTable";
import { SearchToolbar } from "../catalog/SearchToolbar";
import { useCatalogList } from "../hooks/useCatalogList";

function filterRows(
  rows: ReturnType<typeof useCatalogList>["rows"],
  search: string
): ReturnType<typeof useCatalogList>["rows"] {
  if (!search) return rows;
  const needle = search.toLowerCase();
  return rows.filter((row) => row.serviceName.toLowerCase().includes(needle));
}

function EmptyState({ isPending }: { isPending: boolean }) {
  return (
    <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
      {isPending ? "Loading services…" : "No services in the selected range."}
    </div>
  );
}

export function CatalogTab() {
  const { rows, isPending } = useCatalogList();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = useMemo(() => filterRows(rows, search), [rows, search]);
  const selectedRow = useMemo(
    () => rows.find((row) => row.serviceName === selected) ?? null,
    [rows, selected]
  );
  return (
    <div className="flex flex-col gap-3">
      <SearchToolbar value={search} onChange={setSearch} />
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
