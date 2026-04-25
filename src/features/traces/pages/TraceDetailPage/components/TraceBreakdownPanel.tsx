import { PieChart } from "lucide-react";
import { memo, useMemo } from "react";

import { formatDuration } from "@shared/utils/formatters";

interface Span {
  readonly span_id: string;
  readonly parent_span_id?: string | null;
  readonly service_name?: string;
  readonly duration_ms?: number;
}

interface Props {
  readonly spans: readonly Span[];
}

/** Self-time-by-service breakdown, Datadog-style horizontal stacked bar + legend. */
function TraceBreakdownPanelComponent({ spans }: Props) {
  const items = useMemo(() => computeSelfTimeByService(spans), [spans]);
  if (items.length === 0) return null;
  const total = items.reduce((acc, it) => acc + it.selfMs, 0);
  if (total <= 0) return null;
  return (
    <section className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)]">
      <header className="flex items-center gap-2 border-b border-[var(--border-color)] px-3 py-2">
        <PieChart size={14} className="text-[var(--text-muted)]" />
        <span className="text-[12px] font-semibold">Breakdown by service</span>
        <span className="text-[11px] text-[var(--text-muted)]">· self-time</span>
      </header>
      <div className="p-3">
        <div className="flex h-3 w-full overflow-hidden rounded bg-[var(--bg-secondary)]">
          {items.map((it) => (
            <div
              key={it.service}
              title={`${it.service} · ${formatDuration(it.selfMs)} · ${((it.selfMs / total) * 100).toFixed(1)}%`}
              style={{ width: `${(it.selfMs / total) * 100}%`, backgroundColor: colorFor(it.service) }}
            />
          ))}
        </div>
        <ul className="mt-3 grid gap-1 text-[11px] sm:grid-cols-2">
          {items.map((it) => (
            <li key={it.service} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded" style={{ backgroundColor: colorFor(it.service) }} />
              <span className="truncate font-semibold">{it.service}</span>
              <span className="ml-auto font-mono text-[var(--text-muted)]">
                {formatDuration(it.selfMs)} · {((it.selfMs / total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface BreakdownItem {
  readonly service: string;
  readonly selfMs: number;
}

function computeSelfTimeByService(spans: readonly Span[]): BreakdownItem[] {
  if (spans.length === 0) return [];
  const childSum: Record<string, number> = {};
  for (const s of spans) {
    const parentId = s.parent_span_id;
    if (!parentId) continue;
    childSum[parentId] = (childSum[parentId] ?? 0) + (s.duration_ms ?? 0);
  }
  const byService: Record<string, number> = {};
  for (const s of spans) {
    const svc = s.service_name ?? "";
    if (!svc) continue;
    const self = Math.max(0, (s.duration_ms ?? 0) - (childSum[s.span_id] ?? 0));
    byService[svc] = (byService[svc] ?? 0) + self;
  }
  return Object.entries(byService)
    .map(([service, selfMs]) => ({ service, selfMs }))
    .sort((a, b) => b.selfMs - a.selfMs);
}

const PALETTE = [
  "#4e9fdd", "#785EF0", "#e0b400", "#73c991", "#06aed5", "#e8494d", "#f59e0b", "#9ca3af",
];

function colorFor(service: string): string {
  const hash = service.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export const TraceBreakdownPanel = memo(TraceBreakdownPanelComponent);
