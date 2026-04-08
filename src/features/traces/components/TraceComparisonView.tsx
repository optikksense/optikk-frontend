import { AlertTriangle, GitCompare, Layers } from "lucide-react";

import { Badge, Card, SimpleTable } from "@/components/ui";
import { formatDuration, formatNumber } from "@/shared/utils/formatters";
import type { SimpleTableColumn } from "@shared/components/primitives/ui/simple-table";

import type { TraceComparisonResult } from "../types";

interface TraceComparisonViewProps {
  comparison: TraceComparisonResult;
}

export default function TraceComparisonView({ comparison }: TraceComparisonViewProps): JSX.Element {
  const matchedColumns: SimpleTableColumn<TraceComparisonResult["matchedSpans"][number]>[] = [
    {
      title: "Span",
      key: "signature",
      render: (_value: unknown, row: TraceComparisonResult["matchedSpans"][number]) => (
        <div className="space-y-1">
          <div className="font-medium text-[12.5px] text-[var(--text-primary)]">
            {row.signature.operation}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {row.signature.service} • {row.signature.spanKind} • depth {row.signature.depth}
          </div>
        </div>
      ),
    },
    {
      title: "Trace A",
      dataIndex: "durationMsA",
      key: "durationMsA",
      render: (value) => formatDuration(typeof value === "number" ? value : Number(value ?? 0)),
    },
    {
      title: "Trace B",
      dataIndex: "durationMsB",
      key: "durationMsB",
      render: (value) => formatDuration(typeof value === "number" ? value : Number(value ?? 0)),
    },
    {
      title: "Delta",
      dataIndex: "deltaMs",
      key: "deltaMs",
      render: (value) => {
        const normalized = typeof value === "number" ? value : Number(value ?? 0);
        return (
          <span
            className={normalized > 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}
          >
            {normalized > 0 ? "+" : ""}
            {formatDuration(normalized)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card padding="lg" className="space-y-3 border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Trace A</h3>
            <Badge variant="info">{comparison.traceA.traceId.slice(0, 12)}</Badge>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            {formatNumber(comparison.traceA.spanCount)} spans •{" "}
            {formatDuration(comparison.traceA.durationMs)}
          </p>
        </Card>

        <Card padding="lg" className="space-y-3 border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Trace B</h3>
            <Badge variant="warning">{comparison.traceB.traceId.slice(0, 12)}</Badge>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            {formatNumber(comparison.traceB.spanCount)} spans •{" "}
            {formatDuration(comparison.traceB.durationMs)}
          </p>
        </Card>

        <Card
          padding="lg"
          className="space-y-3 border-[var(--color-primary-subtle-28)] bg-[var(--color-primary-subtle-08)]"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Total Delta</h3>
            <GitCompare size={16} className="text-[var(--color-primary)]" />
          </div>
          <p className="font-semibold text-2xl text-[var(--text-primary)]">
            {comparison.totalDeltaMs > 0 ? "+" : ""}
            {formatDuration(comparison.totalDeltaMs)}
          </p>
          <p className="text-[var(--text-secondary)] text-xs">
            Compare service deltas, missing spans, and latency changes side by side.
          </p>
        </Card>
      </div>

      <Card padding="lg" className="space-y-4 border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2">
          <GitCompare size={16} />
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">Matched Spans</h3>
        </div>
        <SimpleTable
          columns={matchedColumns}
          dataSource={comparison.matchedSpans}
          pagination={false}
          size="middle"
        />
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card padding="lg" className="space-y-4 border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Only In Trace A</h3>
          </div>
          {comparison.onlyInA.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No unique spans in Trace A.</p>
          ) : (
            <div className="space-y-2">
              {comparison.onlyInA.map((span) => (
                <div
                  key={span.spanId}
                  className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3"
                >
                  <div className="font-medium text-[var(--text-primary)] text-sm">
                    {span.operation}
                  </div>
                  <div className="mt-1 text-[var(--text-muted)] text-xs">
                    {span.service} • {span.spanKind} • {formatDuration(span.durationMs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg" className="space-y-4 border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <Layers size={16} />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Only In Trace B</h3>
          </div>
          {comparison.onlyInB.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No unique spans in Trace B.</p>
          ) : (
            <div className="space-y-2">
              {comparison.onlyInB.map((span) => (
                <div
                  key={span.spanId}
                  className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3"
                >
                  <div className="font-medium text-[var(--text-primary)] text-sm">
                    {span.operation}
                  </div>
                  <div className="mt-1 text-[var(--text-muted)] text-xs">
                    {span.service} • {span.spanKind} • {formatDuration(span.durationMs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
