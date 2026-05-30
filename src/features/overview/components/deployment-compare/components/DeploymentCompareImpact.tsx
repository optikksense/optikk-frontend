import { memo } from "react";

import type { DeploymentImpactRow } from "@shared/api/deployments/deploymentsApi";
import { Badge, Card, SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatDuration, formatPercentage } from "@shared/utils/formatters";

import { DeltaPill } from "./DeltaPill";

interface Props {
  serviceName: string;
  impacts: readonly DeploymentImpactRow[];
  isLoading: boolean;
}

function impactColumns(): SimpleTableColumn<DeploymentImpactRow>[] {
  return [
    {
      title: "Version",
      key: "version",
      width: 180,
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{row.version || "—"}</span>
          {row.is_baseline ? <Badge variant="default">baseline</Badge> : null}
        </div>
      ),
    },
    {
      title: "Error rate Δ",
      key: "error_rate_delta",
      align: "right",
      width: 140,
      render: (_value, row) => (
        <DeltaPill delta={row.error_rate_delta} formatter={formatPercentage} invert />
      ),
    },
    {
      title: "p95 Δ",
      key: "p95_delta",
      align: "right",
      width: 120,
      render: (_value, row) => (
        <DeltaPill delta={row.p95_delta} formatter={formatDuration} invert />
      ),
    },
    {
      title: "RPS Δ",
      key: "rps_delta",
      align: "right",
      width: 120,
      render: (_value, row) => (
        <DeltaPill delta={row.rps_delta} formatter={(value) => `${value.toFixed(2)}/s`} />
      ),
    },
  ];
}

function DeploymentCompareImpactComponent({ serviceName, impacts, isLoading }: Props) {
  return (
    <Card padding="lg" className="border-border-light">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 font-semibold text-foreground">Per-version impact</h3>
        <span className="text-[11px] text-foreground-muted">{serviceName}</span>
      </div>
      {isLoading && impacts.length === 0 ? (
        <div className="text-[12px] text-foreground-muted">Loading impact…</div>
      ) : impacts.length === 0 ? (
        <div className="text-[12px] text-foreground-muted">No impact rows in this window.</div>
      ) : (
        <SimpleTable
          columns={impactColumns()}
          dataSource={[...impacts]}
          pagination={false}
          size="middle"
          rowKey={(row) => `${row.version}:${row.environment}:${row.deployed_at}`}
        />
      )}
    </Card>
  );
}

export const DeploymentCompareImpact = memo(DeploymentCompareImpactComponent);
