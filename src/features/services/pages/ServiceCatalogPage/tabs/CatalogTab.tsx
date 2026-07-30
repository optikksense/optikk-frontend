import { useMemo, useRef, useState } from "react";

import ServiceDetailDrawer from "@shared/components/ui/drawers/ServiceDetailDrawer";
import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import { FacetRail } from "@shared/search/components/facets/FacetRail";
import {
  type ClientExplorerDefinition,
  useClientExplorer,
} from "@shared/search/hooks/useClientExplorer";
import { useExplorerKeyboard } from "@shared/search/hooks/useExplorerKeyboard";
import { useExplorerState } from "@shared/search/hooks/useExplorerState";

import { CatalogTable } from "../catalog/CatalogTable";
import type { CatalogRow } from "../catalog/buildCatalogRows";
import { useCatalogList } from "../hooks/useCatalogList";

const SERVICE_EXPLORER: ClientExplorerDefinition<CatalogRow> = {
  fields: {
    service: { label: "Service", value: (row) => row.serviceName, facet: true },
    status: { label: "Status", value: (row) => row.status, facet: true },
    rps: { label: "RPS", value: (row) => row.rps },
    errorRate: { label: "Error rate", value: (row) => row.errorRate },
    p99Ms: { label: "P99 latency", value: (row) => row.p99Ms },
    version: { label: "Version", value: (row) => row.version, suggest: true },
    environment: {
      label: "Environment",
      value: (row) => row.environment,
      suggest: true,
    },
  },
  searchText: (row) =>
    [row.serviceName, row.status, row.version, row.environment, row.lang].join(" "),
};

function toDrawerInitialData(row: CatalogRow | null): Record<string, unknown> | null {
  if (!row) return null;
  return {
    requestCount: row.requestCount,
    errorCount: row.errorCount,
    errorRate: row.errorRate,
    p95Latency: row.p95Ms,
    p99Latency: row.p99Ms,
    version: row.version,
    environment: row.environment,
    lang: row.lang,
    instances: row.instances,
  };
}

export function CatalogTab() {
  const { rows, isPending, isError } = useCatalogList();
  const state = useExplorerState();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const explorer = useClientExplorer({
    rows,
    filters: state.filters,
    definition: SERVICE_EXPLORER,
  });

  const selected = useMemo(
    () => (selectedName ? (rows.find((r) => r.serviceName === selectedName) ?? null) : null),
    [rows, selectedName]
  );

  useExplorerKeyboard({ onSearchFocus: () => searchInputRef.current?.focus() });

  return (
    <>
      <ExplorerLayout
        embedded
        header={
          <ExplorerHeader
            ref={searchInputRef}
            sticky={false}
            scope="services"
            filters={state.filters}
            onChangeFilters={state.setFilters}
            valueSuggestions={explorer.valueSuggestions}
            searchPlaceholder="Search services: status:error errorRate:>=2 service:checkout"
          />
        }
        facets={
          <FacetRail
            groups={explorer.facetGroups}
            onInclude={(field, value) => state.addFilter({ field, op: "eq", value })}
            activeFilterCount={state.filters.length}
            onClearAll={state.clearAll}
          />
        }
        content={
          isError ? (
            <div className="rounded-md border border-error/30 bg-error-subtle px-4 py-5 text-center text-[12.5px] text-error">
              Services could not be loaded.
            </div>
          ) : (
            <CatalogTable rows={explorer.rows} loading={isPending} onRowClick={setSelectedName} />
          )
        }
      />
      <ServiceDetailDrawer
        open={Boolean(selectedName)}
        serviceName={selectedName ?? ""}
        initialData={toDrawerInitialData(selected)}
        onClose={() => setSelectedName(null)}
      />
    </>
  );
}
