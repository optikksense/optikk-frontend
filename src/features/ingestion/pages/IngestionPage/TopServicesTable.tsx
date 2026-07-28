import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";

import { PanelCard } from "@shared/components/ui/PanelCard";

import type { IngestionServiceRow, IngestionServices } from "../../api/ingestionApi";
import {
  type IngestionUnit,
  SERVICE_PALETTE,
  SIGNAL_COLORS,
  fmtCount,
  fmtValue,
} from "../../utils/format";

interface Props {
  readonly data: IngestionServices | undefined;
  readonly isPending: boolean;
  readonly unit: IngestionUnit;
}

function MixBar({ row }: { row: IngestionServiceRow }) {
  const parts = [
    { label: "Logs", v: row.logs, color: SIGNAL_COLORS.logs },
    { label: "Spans", v: row.spans, color: SIGNAL_COLORS.spans },
    { label: "Timeseries", v: row.timeseries, color: SIGNAL_COLORS.metrics },
  ];
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  return (
    <div
      className="flex h-2 w-full gap-0.5"
      title={parts.map((p) => `${p.label}: ${fmtCount(p.v)}`).join(" · ")}
    >
      {parts.map((p, i) => (
        <div
          key={i}
          className="h-full rounded-sm"
          style={{ width: `${(p.v / total) * 100}%`, background: p.color }}
        />
      ))}
    </div>
  );
}

                                                                        
function Delta({ pct }: { pct: number }) {
  if (Math.abs(pct) < 0.5) return <span className="text-foreground-muted">·</span>;
  const up = pct > 0;
  return (
    <span className={up ? "text-error" : "text-success"}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {pct.toFixed(0)}%
    </span>
  );
}

const TH =
  "px-3 py-2.5 text-left font-semibold text-[10.5px] text-foreground-muted uppercase tracking-[0.06em]";
const TD = "px-3 py-2.5 border-t border-border align-middle";

export function TopServicesTable({ data, isPending, unit }: Props) {
  const bytes = unit === "bytes";
  const services = data?.services ?? [];
  const topShare = bytes ? data?.topShareBytesPct : data?.topSharePct;
  const footer = data
    ? `Showing top ${services.length} of ${data.totalServices} services · top ${services.length} account for ${Math.round(topShare ?? 0)}% of ingest`
    : "";

  return (
    <PanelCard
      title="Top ingesting services"
      subtitle="volume by service across all telemetry · this period"
      padded={false}
    >
      {isPending ? (
        <div className="grid h-[160px] place-items-center text-[12px] text-foreground-muted">
          Loading…
        </div>
      ) : services.length === 0 ? (
        <div className="grid h-[160px] place-items-center text-[12px] text-foreground-muted">
          No service ingestion in this period.
        </div>
      ) : (
        <>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className={TH}>Service</th>
                <th className={`${TH} w-[140px]`}>Mix</th>
                <th className={`${TH} text-right`}>Logs</th>
                <th className={`${TH} text-right`}>Spans</th>
                <th className={`${TH} text-right`}>Timeseries</th>
                <th className={`${TH} text-right`}>{bytes ? "Volume" : "Total"}</th>
                <th className={`${TH} w-[56px] text-right`}>%</th>
                <th className={`${TH} w-[130px]`}>Trend</th>
                <th
                  className={`${TH} w-[64px] text-right`}
                  title="Change vs previous period (records)"
                >
                  Δ
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.name} className="hover:bg-secondary/50">
                  <td className={TD}>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-sm"
                        style={{ background: SERVICE_PALETTE[i % SERVICE_PALETTE.length] }}
                      />
                      <div>
                        <div className="mono font-medium text-[13px] text-foreground">{s.name}</div>
                        {s.env && (
                          <div className="mono text-[11.5px] text-foreground-muted">
                            env:{s.env}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={TD}>
                    <MixBar row={s} />
                  </td>
                  <td className={`${TD} mono text-right`}>{fmtCount(s.logs)}</td>
                  <td className={`${TD} mono text-right`}>{fmtCount(s.spans)}</td>
                  <td className={`${TD} mono text-right text-foreground-secondary`}>
                    {fmtCount(s.timeseries)}
                  </td>
                  <td className={`${TD} mono text-right font-semibold text-foreground`}>
                    {fmtValue(unit, bytes ? s.bytes : s.total)}
                  </td>
                  <td className={`${TD} mono text-right text-foreground-secondary`}>
                    {(bytes ? s.bytesPct : s.pct).toFixed(1)}%
                  </td>
                  <td className={TD}>
                    <SparklineChart
                      data={[...((bytes ? s.byteSpark : s.spark) ?? [])]}
                      color={SERVICE_PALETTE[i % SERVICE_PALETTE.length]}
                      width={120}
                      height={24}
                    />
                  </td>
                  <td className={`${TD} mono text-right font-medium`}>
                    <Delta pct={s.deltaPct} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-border border-t bg-secondary px-4 py-2.5 text-[12.5px] text-foreground-muted">
            {footer}
          </div>
        </>
      )}
    </PanelCard>
  );
}
