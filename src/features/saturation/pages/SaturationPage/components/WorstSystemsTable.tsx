import { useNavigate } from "@tanstack/react-router";
import { memo, useCallback } from "react";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { WorstSystemRow } from "../hooks/useSaturationOverviewModel";
import { RankBarRow } from "./RankBarRow";
import { SaturationCard } from "./SaturationCard";
import { SAT_TABLE_CLASS } from "./tableClasses";

type Props = {
  rows: WorstSystemRow[];
};

function rowMetrics(row: WorstSystemRow): string {
  const lat = formatDuration(row.p95_latency_ms ?? 0);
  const err = formatPercentage(row.error_rate ?? 0, 2);
  const conn = formatNumber(row.active_connections ?? 0);
  return `p95 ${lat} · ${err} err · ${conn} conn`;
}

function WorstSystemsTableImpl({ rows }: Props): JSX.Element {
  const navigate = useNavigate();
  const open = useCallback(
    (system: string) => {
      const href = ROUTES.saturationDatastoreDetail.replace("$system", encodeURIComponent(system));
      void navigate(dynamicNavigateOptions(href));
    },
    [navigate]
  );

  return (
    <SaturationCard
      title="Most saturated systems"
      subtitle={`Top ${rows.length} across datastores · max(p95, errors, load)`}
    >
      <table className={SAT_TABLE_CLASS}>
        <thead>
          <tr>
            <th>System</th>
            <th>Category</th>
            <th>Metrics</th>
            <th>Saturation</th>
            <th className="num">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <RankBarRow
              key={row.system}
              primary={row.system}
              secondary={row.category}
              meta={rowMetrics(row)}
              bar={row.saturation}
              barLabel={`${Math.round(row.saturation * 100)}%`}
              tone={row.tone}
              onClick={() => open(row.system)}
            />
          ))}
        </tbody>
      </table>
    </SaturationCard>
  );
}

export const WorstSystemsTable = memo(WorstSystemsTableImpl);
