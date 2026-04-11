import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { Card } from "@shared/components/primitives/ui";
import { buildLegacyDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import { infraGet } from "../../api/infrastructureApi";
import InfraNodesTable from "../../components/InfraNodesTable";
import type { InfrastructureNode, InfrastructureNodeSummary } from "../../types";

export default function NodesTab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const nodesQuery = useTimeRangeQuery<InfrastructureNode[]>(
    "infra-nodes-tab",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<InfrastructureNode[]>(
        "/v1/infrastructure/nodes",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    }
  );

  const summaryQuery = useTimeRangeQuery<InfrastructureNodeSummary>(
    "infra-nodes-summary-tab",
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

  const openNode = (host: string) => {
    const current = searchParams.toString();
    const base = current ? `?${current}` : "";
    const search = buildLegacyDashboardDrawerSearch(base, "node", host, host);
    navigate({ to: `${ROUTES.infrastructure}${search}` as never, replace: false });
  };

  const summary = summaryQuery.data;
  const nodes = useMemo(() => nodesQuery.data ?? [], [nodesQuery.data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Healthy
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatNumber(summary?.healthy_nodes ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Degraded
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--color-warning,#f79009)]">
            {formatNumber(summary?.degraded_nodes ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Unhealthy
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--color-error)]">
            {formatNumber(summary?.unhealthy_nodes ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Total pods
          </div>
          <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatNumber(summary?.total_pods ?? 0)}
          </div>
        </Card>
      </div>

      <InfraNodesTable nodes={nodes} onOpenNode={openNode} />
    </div>
  );
}
