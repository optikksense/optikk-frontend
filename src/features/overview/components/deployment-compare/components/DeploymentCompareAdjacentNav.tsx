import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useMemo } from "react";

import type { DeploymentRow } from "@shared/api/deployments/deploymentsApi";
import { buildDeploymentCompareDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { Button } from "@shared/components/primitives/ui";

interface Props {
  readonly serviceName: string;
  readonly deployments: readonly DeploymentRow[];
  readonly currentVersion: string;
}

function sortByRecency(rows: readonly DeploymentRow[]): DeploymentRow[] {
  return [...rows].sort((left, right) => {
    const leftMs = new Date(left.first_seen).getTime();
    const rightMs = new Date(right.first_seen).getTime();
    return rightMs - leftMs;
  });
}

function neighbors(
  ordered: readonly DeploymentRow[],
  version: string
): { prev: DeploymentRow | null; next: DeploymentRow | null } {
  const idx = ordered.findIndex((row) => row.version === version);
  if (idx < 0) return { prev: null, next: null };
  return {
    next: idx > 0 ? ordered[idx - 1] : null,
    prev: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}

function buildReseed(
  location: { search: string; pathname: string },
  navigate: ReturnType<typeof useNavigate>,
  serviceName: string,
  row: DeploymentRow
): () => void {
  return () => {
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
  };
}

function DeploymentCompareAdjacentNavComponent({
  serviceName,
  deployments,
  currentVersion,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const ordered = useMemo(() => sortByRecency(deployments), [deployments]);
  const { prev, next } = useMemo(
    () => neighbors(ordered, currentVersion),
    [ordered, currentVersion]
  );

  if (!prev && !next) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        icon={<ChevronLeft size={14} />}
        disabled={!prev}
        onClick={prev ? buildReseed(location, navigate, serviceName, prev) : undefined}
      >
        Older release
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<ChevronRight size={14} />}
        disabled={!next}
        onClick={next ? buildReseed(location, navigate, serviceName, next) : undefined}
      >
        Newer release
      </Button>
    </div>
  );
}

export const DeploymentCompareAdjacentNav = memo(DeploymentCompareAdjacentNavComponent);
