import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import { FacetRail } from "@shared/search/components/facets/FacetRail";
import {
  type ClientExplorerDefinition,
  useClientExplorer,
} from "@shared/search/hooks/useClientExplorer";
import { useExplorerKeyboard } from "@shared/search/hooks/useExplorerKeyboard";
import { useExplorerState } from "@shared/search/hooks/useExplorerState";

import { ROUTES } from "@/shared/constants/routes";

import { getFleetPods } from "../../../api/nodesApi";
import InfraPodsTable from "../../../components/InfraPodsTable";
import type { FleetPod } from "../../../types";
import { tierForErrorRate } from "../../../utils/nodeHealth";

const CONTAINERS_EXPLORER: ClientExplorerDefinition<FleetPod> = {
  fields: {
    container: { label: "Container", value: (pod) => pod.podName, facet: true },
    host: { label: "Host", value: (pod) => pod.host, facet: true },
    service: { label: "Service", value: (pod) => pod.services, facet: true },
    status: {
      label: "Status",
      value: (pod) => tierForErrorRate(pod.errorRate),
      facet: true,
    },
    requestCount: { label: "Requests", value: (pod) => pod.requestCount },
    errorRate: { label: "Error rate", value: (pod) => pod.errorRate },
    p95Ms: { label: "P95 latency", value: (pod) => pod.p95LatencyMs },
  },
  searchText: (pod) => `${pod.podName} ${pod.host} ${pod.services.join(" ")}`,
};

export default function ContainersTab() {
  const navigate = useNavigate();
  const state = useExplorerState();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const query = useTimeRangeQuery<FleetPod[]>("infrastructure.containers.list", (_tenant, s, e) =>
    getFleetPods(s, e)
  );

  const pods = query.data ?? [];
  const explorer = useClientExplorer({
    rows: pods,
    filters: state.filters,
    definition: CONTAINERS_EXPLORER,
  });

  const onOpenHost = (host: string) => {
    navigate({ to: ROUTES.hostDetail.replace("$host", encodeURIComponent(host as string & {})) });
  };

  const onOpenContainer = (container: string) => {
    navigate({
      to: ROUTES.containerDetail.replace(
        "$container",
        encodeURIComponent(container as string & {})
      ),
    });
  };

  useExplorerKeyboard({ onSearchFocus: () => searchInputRef.current?.focus() });

  return (
    <ExplorerLayout
      embedded
      header={
        <ExplorerHeader
          ref={searchInputRef}
          sticky={false}
          scope="infrastructure-containers"
          filters={state.filters}
          onChangeFilters={state.setFilters}
          valueSuggestions={explorer.valueSuggestions}
          searchPlaceholder="Search containers: service:checkout host:node-1 errorRate:>=2"
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
        query.isError ? (
          <div className="rounded-md border border-error/30 bg-error-subtle px-4 py-5 text-center text-[12.5px] text-error">
            Containers could not be loaded.
          </div>
        ) : (
          <InfraPodsTable
            pods={explorer.rows}
            onOpenContainer={onOpenContainer}
            onOpenHost={onOpenHost}
            isPending={query.isPending}
            emptyText="No containers match the current filters."
          />
        )
      }
    />
  );
}
