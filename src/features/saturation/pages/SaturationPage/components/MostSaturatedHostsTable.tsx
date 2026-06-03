import { memo } from "react";

import type { HostSaturationRow } from "../../../api/saturationApi";
import type { Tone } from "../view-models/saturationScore";
import { RankBarRow } from "./RankBarRow";
import { SaturationCard } from "./SaturationCard";
import { SAT_TABLE_CLASS } from "./tableClasses";

type Props = {
  rows: HostSaturationRow[];
};

const TONES: Record<string, Tone> = { ok: "ok", warn: "warn", err: "err" };

function subsystemLabel(subsystem: string): string {
  return subsystem.charAt(0).toUpperCase() + subsystem.slice(1);
}

function metrics(host: HostSaturationRow): string {
  return `cpu ${Math.round(host.cpu)}% · mem ${Math.round(host.mem)}% · disk ${Math.round(host.disk)}%`;
}

function MostSaturatedHostsTableImpl({ rows }: Props): JSX.Element {
  return (
    <SaturationCard
      title="Most saturated hosts"
      subtitle={`Top ${rows.length} across the fleet · max(cpu, mem, disk)`}
    >
      <table className={SAT_TABLE_CLASS}>
        <thead>
          <tr>
            <th>Host</th>
            <th>System</th>
            <th>Metrics</th>
            <th>Saturation</th>
            <th className="num">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <RankBarRow
              key={row.host}
              primary={row.host}
              secondary={subsystemLabel(row.subsystem)}
              meta={metrics(row)}
              bar={row.saturation / 100}
              barLabel={`${Math.round(row.saturation)}%`}
              tone={TONES[row.tone] ?? "ok"}
            />
          ))}
        </tbody>
      </table>
    </SaturationCard>
  );
}

export const MostSaturatedHostsTable = memo(MostSaturatedHostsTableImpl);
