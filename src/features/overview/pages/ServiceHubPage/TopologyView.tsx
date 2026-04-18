import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { ServiceTopologyGraph } from "@shared/components/ui/charts/ServiceTopologyGraph";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { buildServiceDrawerSearch } from "../../components/serviceDrawerState";
import { TopologyToolbar } from "./topology/TopologyToolbar";
import { type ServiceTopologyResponse, getServiceTopology } from "./topology/api";
import {
  buildTopologyGraph,
  topologyEdgeTypes,
  topologyNodeTypes,
} from "./topology/buildGraph";

function useTopologyQuery(focusService: string) {
  return useTimeRangeQuery<ServiceTopologyResponse>(
    "services-topology",
    async (_teamId, startTime, endTime) =>
      getServiceTopology({
        startTime,
        endTime,
        service: focusService || undefined,
      }),
    { extraKeys: [focusService] }
  );
}

function TopologyCanvas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusService = searchParams.get("topologyFocus") ?? "";
  const filter = searchParams.get("serviceSearch") ?? "";

  const query = useTopologyQuery(focusService);
  const data = query.data ?? { nodes: [], edges: [] };

  const openService = (name: string): void => {
    const search = buildServiceDrawerSearch(location.search, name);
    navigate({ to: location.pathname + search, replace: true });
  };

  const setFocus = (name: string): void => {
    const next = new URLSearchParams(searchParams);
    if (name) next.set("topologyFocus", name);
    else next.delete("topologyFocus");
    setSearchParams(next);
  };

  const setFilter = (value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("serviceSearch", value);
    else next.delete("serviceSearch");
    setSearchParams(next, { replace: true });
  };

  const { nodes, edges } = useMemo(
    () => buildTopologyGraph({ data, filter, onOpen: openService }),
    // openService closes over searchParams; re-creating per render is cheap.
    [data, filter]
  );

  const isEmpty = !query.isLoading && nodes.length === 0;

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)]">
      <TopologyToolbar
        filter={filter}
        onFilterChange={setFilter}
        nodeCount={data.nodes.length}
        edgeCount={data.edges.length}
        focusService={focusService}
        onClearFocus={() => setFocus("")}
      />
      <div className="relative flex-1">
        {query.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
            Loading topology…
          </div>
        ) : null}
        {query.isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--color-error)]">
            Failed to load service topology.
          </div>
        ) : null}
        {isEmpty && !query.isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
            No service activity in this time range.
          </div>
        ) : null}
        <ServiceTopologyGraph
          nodes={nodes}
          edges={edges}
          nodeTypes={topologyNodeTypes}
          edgeTypes={topologyEdgeTypes}
          onNodeDoubleClick={setFocus}
        />
      </div>
    </div>
  );
}

export default function TopologyView() {
  return <TopologyCanvas />;
}
