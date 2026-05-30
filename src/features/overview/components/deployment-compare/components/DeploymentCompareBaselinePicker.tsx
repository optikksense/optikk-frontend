import { useLocation, useNavigate } from "@tanstack/react-router";
import { memo, useCallback } from "react";

import type { DeploymentRow } from "@shared/api/deployments/deploymentsApi";
import { buildDeploymentCompareDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { Card } from "@shared/components/primitives/ui";

interface Props {
  readonly serviceName: string;
  readonly deployments: readonly DeploymentRow[];
  readonly currentVersion: string;
}

function reseedToVersion(
  location: { search: string; pathname: string },
  navigate: ReturnType<typeof useNavigate>,
  serviceName: string,
  row: DeploymentRow
): void {
  const nextSearch = buildDeploymentCompareDrawerSearch(location.search, {
    serviceName,
    version: row.version,
    environment: row.environment,
    deployedAt: row.first_seen,
    lastSeenAt: row.last_seen,
    isActive: false,
  });
  navigate(
    dynamicNavigateOptions(
      location.pathname,
      Object.fromEntries(new URLSearchParams(nextSearch)) as Record<string, unknown>
    )
  );
}

function DeploymentCompareBaselinePickerComponent({
  serviceName,
  deployments,
  currentVersion,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const version = event.target.value;
      const row = deployments.find((deployment) => deployment.version === version);
      if (!row) return;
      reseedToVersion(location, navigate, serviceName, row);
    },
    [deployments, location, navigate, serviceName]
  );

  if (deployments.length <= 1) return null;

  return (
    <Card padding="md" className="border-[var(--border-light)]">
      <label className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="text-[var(--text-secondary)]">Compare against baseline:</span>
        <select
          value={currentVersion}
          onChange={onChange}
          className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1 font-medium text-[var(--text-primary)]"
        >
          {deployments.map((row) => (
            <option key={`${row.version}:${row.first_seen}`} value={row.version}>
              {row.version} ({row.environment || "—"})
            </option>
          ))}
        </select>
      </label>
    </Card>
  );
}

export const DeploymentCompareBaselinePicker = memo(DeploymentCompareBaselinePickerComponent);
