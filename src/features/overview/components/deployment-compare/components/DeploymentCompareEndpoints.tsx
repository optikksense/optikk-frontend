import { GitCompare } from "lucide-react";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@shared/api/deployments/deploymentsApi";
import { Card, SimpleTable } from "@shared/components/primitives/ui";

import { ENDPOINT_COLUMNS } from "./endpointColumns";

interface Props {
  compare: DeploymentCompareResponse;
}

function DeploymentCompareEndpointsComponent({ compare }: Props) {
  return (
    <Card padding="lg" className="border-[var(--border-light)]">
      <div className="mb-4 flex items-center gap-2">
        <GitCompare size={16} className="text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">Endpoint regressions</h3>
      </div>
      {compare.top_endpoints.length === 0 ? (
        <div className="text-[12px] text-[var(--text-muted)]">
          No endpoint regression candidates were found for this release.
        </div>
      ) : (
        <SimpleTable
          columns={ENDPOINT_COLUMNS}
          dataSource={compare.top_endpoints}
          pagination={false}
          size="middle"
          rowKey={(row) => `${row.http_method}:${row.endpoint_name}:${row.operation_name}`}
        />
      )}
    </Card>
  );
}

export const DeploymentCompareEndpoints = memo(DeploymentCompareEndpointsComponent);
