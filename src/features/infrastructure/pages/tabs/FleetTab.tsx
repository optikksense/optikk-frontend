import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { Card } from "@shared/components/primitives/ui";
import { buildLegacyDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import {
  buildLogsHubHref,
  hostEqualsFilter,
  podEqualsFilter,
} from "@shared/observability/deepLinks";
import { formatNumber } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import { infraGet } from "../../api/infrastructureApi";
import InfraFleetMap from "../../components/InfraFleetMap";
import InfraFleetToolbar from "../../components/InfraFleetToolbar";
import InfraNodesTable from "../../components/InfraNodesTable";
import InfraPodsTable from "../../components/InfraPodsTable";
import {
  INFRA_FILL,
  INFRA_GROUP,
  INFRA_LENS,
  INFRA_SIZE,
  type InfraFillMetric,
  type InfraGroupMode,
  type InfraLensId,
  type InfraSizeMetric,
  URL_FILL,
  URL_FILTER,
  URL_GROUP,
  URL_LENS,
  URL_SIZE,
} from "../../constants";
import type { FleetPod, InfrastructureNode, InfrastructureNodeSummary } from "../../types";

function parseEnum<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  if (raw && (allowed as readonly string[]).includes(raw)) return raw as T;
  return fallback;
}

export default function FleetTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getTimeRange } = useTimeRange();

  const lens = parseEnum(
    searchParams.get(URL_LENS),
    [INFRA_LENS.host, INFRA_LENS.pod],
    INFRA_LENS.host
  );
  const fill = parseEnum(
    searchParams.get(URL_FILL),
    [
      INFRA_FILL.error_rate,
      INFRA_FILL.avg_latency_ms,
      INFRA_FILL.pod_count,
      INFRA_FILL.request_count,
    ],
    INFRA_FILL.error_rate
  );
  const size = parseEnum(
    searchParams.get(URL_SIZE),
    [INFRA_SIZE.request_count, INFRA_SIZE.pod_count, INFRA_SIZE.uniform],
    INFRA_SIZE.uniform
  );
  const group = parseEnum(
    searchParams.get(URL_GROUP),
    [INFRA_GROUP.none, INFRA_GROUP.health, INFRA_GROUP.host_prefix],
    INFRA_GROUP.none
  );
  const filterText = searchParams.get(URL_FILTER) ?? "";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const nodesQuery = useTimeRangeQuery<InfrastructureNode[]>(
    "infra-nodes-fleet",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<InfrastructureNode[]>(
        "/v1/infrastructure/nodes",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    },
    { enabled: lens === INFRA_LENS.host }
  );

  const podsQuery = useTimeRangeQuery<FleetPod[]>(
    "infra-fleet-pods",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<FleetPod[]>(
        "/v1/infrastructure/fleet/pods",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    },
    { enabled: lens === INFRA_LENS.pod }
  );

  const summaryQuery = useTimeRangeQuery<InfrastructureNodeSummary>(
    "infra-nodes-summary",
    async (teamId, start, end) => {
      if (!teamId) {
        return {
          healthy_nodes: 0,
          degraded_nodes: 0,
          unhealthy_nodes: 0,
          total_pods: 0,
        };
      }
      return infraGet<InfrastructureNodeSummary>(
        "/v1/infrastructure/nodes/summary",
        teamId,
        Number(start),
        Number(end)
      );
    }
  );

  const filteredNodes = useMemo(() => {
    const rows = nodesQuery.data ?? [];
    const q = filterText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((n) => n.host.toLowerCase().includes(q));
  }, [nodesQuery.data, filterText]);

  const filteredPods = useMemo(() => {
    const rows = podsQuery.data ?? [];
    const q = filterText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) => p.pod_name.toLowerCase().includes(q) || p.host.toLowerCase().includes(q)
    );
  }, [podsQuery.data, filterText]);

  const openHostLogs = (host: string): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [hostEqualsFilter(host)],
        fromMs: Number(startTime),
        toMs: Number(endTime),
      }) as never,
    });
  };

  const openPodLogs = (podName: string): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [podEqualsFilter(podName)],
        fromMs: Number(startTime),
        toMs: Number(endTime),
      }) as never,
    });
  };

  const openNode = (host: string) => {
    const current = searchParams.toString();
    const base = current ? `?${current}` : "";
    const search = buildLegacyDashboardDrawerSearch(base, "node", host, host);
    navigate({ to: `${ROUTES.infrastructure}${search}` as never, replace: false });
  };

  const summary = summaryQuery.data;

  const filterResourceLabel = lens === INFRA_LENS.pod ? "Filter pods" : "Filter hosts";
  const filterPlaceholder =
    lens === INFRA_LENS.pod ? "Pod name or host substring" : "Substring match on hostname";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Healthy
          </div>
          <div className="mt-1 font-semibold text-[24px] text-[var(--text-primary)]">
            {formatNumber(summary?.healthy_nodes ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Degraded
          </div>
          <div className="mt-1 font-semibold text-[24px] text-[var(--color-warning,#f79009)]">
            {formatNumber(summary?.degraded_nodes ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Unhealthy
          </div>
          <div className="mt-1 font-semibold text-[24px] text-[var(--color-error)]">
            {formatNumber(summary?.unhealthy_nodes ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Total pods
          </div>
          <div className="mt-1 font-semibold text-[24px] text-[var(--text-primary)]">
            {formatNumber(summary?.total_pods ?? 0)}
          </div>
        </Card>
      </div>

      <InfraFleetToolbar
        lens={lens as InfraLensId}
        onLensChange={(v) => setParam(URL_LENS, v)}
        filterResourceLabel={filterResourceLabel}
        filterPlaceholder={filterPlaceholder}
        fill={fill as InfraFillMetric}
        onFillChange={(v) => setParam(URL_FILL, v)}
        size={size as InfraSizeMetric}
        onSizeChange={(v) => setParam(URL_SIZE, v)}
        group={group as InfraGroupMode}
        onGroupChange={(v) => setParam(URL_GROUP, v)}
        filterText={filterText}
        onFilterChange={(v) => setParam(URL_FILTER, v.trim() || null)}
      />

      {lens === INFRA_LENS.host ? (
        <>
          <div>
            <h3 className="mb-2 font-semibold text-[13px] text-[var(--text-primary)]">Fleet map</h3>
            <InfraFleetMap
              nodes={filteredNodes}
              fill={fill as InfraFillMetric}
              size={size as InfraSizeMetric}
              group={group as InfraGroupMode}
              onHostClick={openNode}
            />
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-[13px] text-[var(--text-primary)]">Hosts</h3>
            <InfraNodesTable
              nodes={filteredNodes}
              onOpenNode={openNode}
              onOpenHostLogs={openHostLogs}
            />
          </div>
        </>
      ) : (
        <div>
          <h3 className="mb-2 font-semibold text-[13px] text-[var(--text-primary)]">Pods</h3>
          <p className="mb-3 text-[12px] text-[var(--text-muted)]">
            Pods are derived from root spans with{" "}
            <code className="rounded bg-[var(--bg-tertiary)] px-1">k8s.pod.name</code> set. Use Logs
            to open the log explorer with a matching pod filter for the current time range.
          </p>
          <InfraPodsTable pods={filteredPods} onOpenPodLogs={openPodLogs} />
        </div>
      )}
    </div>
  );
}
