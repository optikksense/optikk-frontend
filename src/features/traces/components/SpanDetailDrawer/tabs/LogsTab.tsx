import { useMemo } from "react";

import type { TraceLog } from "@shared/api/schemas/tracesSchemas";

import { useSpanLogs } from "../../../hooks/useSpanLogs";

interface Props {
  readonly traceId: string;
  readonly spanId: string | null;
}

/** Span-scoped logs tab (O8). Shows logs where logs.span_id = this span. */
export function LogsTab({ traceId, spanId }: Props) {
  const q = useSpanLogs(traceId, spanId);
  const logs = q.data?.logs ?? [];
  const severityCounts = useMemo(() => countSeverity(logs), [logs]);

  if (!spanId) return <Empty msg="Select a span to see its logs." />;
  if (q.isPending) return <Empty msg="Loading logs…" />;
  if (logs.length === 0) return <Empty msg="No logs attached to this span." />;

  return (
    <div className="flex flex-col gap-2">
      <SeveritySummary counts={severityCounts} />
      <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto font-mono text-[11px]">
        {logs.map((l, i) => (
          <li key={`${l.timestamp}-${i}`} className="flex items-start gap-2 rounded px-2 py-1 hover:bg-[var(--bg-secondary)]">
            <span className="flex-shrink-0 text-[var(--text-muted)]">{formatTs(l.timestamp)}</span>
            <span className="flex-shrink-0 font-semibold" style={{ color: severityColor(l.severity_text) }}>
              {(l.severity_text || "INFO").toUpperCase()}
            </span>
            <span className="truncate">{l.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SeveritySummary({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 px-2 text-[10px]">
      {entries.map(([sev, count]) => (
        <span key={sev} className="rounded px-1.5 py-0.5" style={{ backgroundColor: `${severityColor(sev)}22`, color: severityColor(sev) }}>
          {sev}: {count}
        </span>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}

function countSeverity(logs: readonly TraceLog[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of logs) {
    const key = (l.severity_text || "INFO").toUpperCase();
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function severityColor(sev: string): string {
  const s = sev.toUpperCase();
  if (s.startsWith("ERROR") || s.startsWith("FATAL")) return "#e8494d";
  if (s.startsWith("WARN")) return "#e0b400";
  if (s.startsWith("DEBUG") || s.startsWith("TRACE")) return "#7e8ea0";
  return "#4e9fdd";
}

function formatTs(ts: number | string): string {
  return new Date(Number(ts) / 1_000_000).toISOString().slice(11, 23);
}
