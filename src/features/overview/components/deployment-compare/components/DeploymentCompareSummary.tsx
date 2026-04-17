import { memo, useMemo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";

import { SummaryCard } from "./SummaryCard";
import { buildSummaryTiles } from "./summaryTiles";

interface Props {
  compare: DeploymentCompareResponse;
}

function DeploymentCompareSummaryComponent({ compare }: Props) {
  const tiles = useMemo(() => buildSummaryTiles(compare), [compare]);
  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
      {tiles.map((tile) => (
        <SummaryCard key={tile.label} {...tile} />
      ))}
    </div>
  );
}

export const DeploymentCompareSummary = memo(DeploymentCompareSummaryComponent);
