import { AlertTriangle } from "lucide-react";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Card } from "@shared/components/primitives/ui";

import { ErrorRowItem } from "./ErrorRowItem";

interface Props {
  compare: DeploymentCompareResponse;
}

function DeploymentCompareErrorsComponent({ compare }: Props) {
  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-[var(--color-warning)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">Top error regressions</h3>
      </div>
      {compare.top_errors.length === 0 ? (
        <div className="text-[12px] text-[var(--text-muted)]">
          {compare.has_baseline
            ? "No notable error regressions were found for this release."
            : "A previous deployment baseline is required to rank error regressions."}
        </div>
      ) : (
        <div className="space-y-3">
          {compare.top_errors.map((row) => (
            <ErrorRowItem key={row.group_id} row={row} />
          ))}
        </div>
      )}
    </Card>
  );
}

export const DeploymentCompareErrors = memo(DeploymentCompareErrorsComponent);
