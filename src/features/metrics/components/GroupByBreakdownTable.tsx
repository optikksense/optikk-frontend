import { Download } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSparkline,
} from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";

import type { MetricQueryDefinition, MetricQueryResult } from "../types";
import { buildBreakdownCsv, collectTagKeys, downloadCsv } from "../utils/breakdownCsv";
import { formatStatValue } from "../utils/formatStat";
import { computeSeriesStats } from "../utils/seriesStats";
import { DeltaBadge } from "./DeltaBadge";

interface GroupByBreakdownTableProps {
  readonly primaryQuery: MetricQueryDefinition | undefined;
  readonly result: MetricQueryResult | undefined;
}

function lastWindow(values: ReadonlyArray<number | null>): number[] {
  return values.filter((v): v is number => v != null && !Number.isNaN(v)).slice(-30);
}

/** Per-series breakdown table. One row per group-by combination, with min/avg/
 * p95/p99/max computed over each series' own value array across the window. */
export function GroupByBreakdownTable({ primaryQuery, result }: GroupByBreakdownTableProps) {
  const tagKeys = useMemo(() => collectTagKeys(result), [result]);

  const rows = useMemo(() => {
    if (!result) return [];
    return result.series.map((series) => ({
      tags: series.tags,
      stats: computeSeriesStats(series),
      spark: lastWindow(series.values),
    }));
  }, [result]);

  const groupByLabel = primaryQuery?.groupBy.join(", ") || "—";

  const handleExport = () => {
    const csv = buildBreakdownCsv(result);
    if (csv) downloadCsv(`${primaryQuery?.metricName || "metrics"}-breakdown.csv`, csv);
  };

  return (
    <PageSurface padding="lg" className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 pb-3">
        <div>
          <div className="font-semibold text-[15px] text-[var(--text-primary)] tracking-[0.01em]">
            Group-by breakdown
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--text-muted)]">
            <span className="font-mono">{primaryQuery?.metricName || "—"}</span> · grouped by{" "}
            <span className="font-mono">{groupByLabel}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={handleExport}>
          CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-[12px] text-[var(--text-muted)]">
          No grouped series. Add a group-by to the primary query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {tagKeys.map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
                <TableHead className="text-right">min</TableHead>
                <TableHead className="text-right">avg</TableHead>
                <TableHead className="text-right">p95</TableHead>
                <TableHead className="text-right">p99</TableHead>
                <TableHead className="text-right">max</TableHead>
                <TableHead className="w-[180px]">Last 1h</TableHead>
                <TableHead className="w-[90px] text-right">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {tagKeys.map((key) => (
                    <TableCell key={key} className="font-mono text-[12px] text-[var(--text-primary)]">
                      {row.tags[key] ?? "—"}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-mono">
                    {formatStatValue(row.stats.min)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatStatValue(row.stats.avg)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-[var(--text-primary)]">
                    {formatStatValue(row.stats.p95)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatStatValue(row.stats.p99)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatStatValue(row.stats.max)}
                  </TableCell>
                  <TableCell>
                    <TableSparkline
                      data={row.spark}
                      width={170}
                      height={26}
                      trend={
                        row.stats.delta == null || row.stats.delta === 0
                          ? "flat"
                          : row.stats.delta > 0
                            ? "down"
                            : "up"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DeltaBadge delta={row.stats.delta} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageSurface>
  );
}
