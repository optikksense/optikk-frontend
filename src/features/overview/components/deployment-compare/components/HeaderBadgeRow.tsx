import { memo } from "react";

import { Badge } from "@shared/components/primitives/ui";
import { formatRelativeTime } from "@shared/utils/formatters";

import type { DeploymentSeed } from "../types";

function HeaderBadgeRowComponent({ seed }: { seed: DeploymentSeed }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="info">{seed.version}</Badge>
      <Badge variant="default">{seed.environment || "unknown env"}</Badge>
      <Badge variant={seed.isActive ? "success" : "warning"}>
        {seed.isActive ? "Active release" : "Historical release"}
      </Badge>
      <span className="text-[12px] text-[var(--text-secondary)]">
        deployed {formatRelativeTime(seed.deployedAtMs)}
      </span>
      {seed.lastSeenAtMs ? (
        <span className="text-[12px] text-[var(--text-muted)]">
          last seen {formatRelativeTime(seed.lastSeenAtMs)}
        </span>
      ) : null}
    </div>
  );
}

export const HeaderBadgeRow = memo(HeaderBadgeRowComponent);
