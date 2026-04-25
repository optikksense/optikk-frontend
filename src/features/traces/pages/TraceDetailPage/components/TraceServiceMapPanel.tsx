import { ArrowRight, GitBranch } from "lucide-react";
import { memo } from "react";

import type { ServiceMapEdge, ServiceMapNode, ServiceMapResponse } from "@shared/api/schemas/tracesSchemas";

import { formatDuration } from "@shared/utils/formatters";

interface Props {
  readonly data: ServiceMapResponse | undefined;
  readonly isPending: boolean;
}

/**
 * Per-trace service map as a compact list + edge table. A full React-Flow
 * canvas is nice but expensive; this view ships parity data in 1/5 the code
 * and works on narrow viewports.
 */
function TraceServiceMapPanelComponent({ data, isPending }: Props) {
  if (isPending) return <Loading />;
  if (!data || (data.nodes.length === 0 && data.edges.length === 0)) return <Empty />;
  return (
    <section className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)]">
      <Header nodeCount={data.nodes.length} edgeCount={data.edges.length} />
      <div className="grid gap-4 p-3 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Services</h4>
          <ul className="flex flex-col gap-1">
            {data.nodes.map((n) => <ServiceNode key={n.service} node={n} />)}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Calls</h4>
          {data.edges.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)]">Single-service trace (no cross-service calls).</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {data.edges.map((e) => <EdgeRow key={`${e.from}->${e.to}`} edge={e} />)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Header({ nodeCount, edgeCount }: { nodeCount: number; edgeCount: number }) {
  return (
    <header className="flex items-center gap-2 border-b border-[var(--border-color)] px-3 py-2">
      <GitBranch size={14} className="text-[var(--text-muted)]" />
      <span className="text-[12px] font-semibold">Service map</span>
      <span className="text-[11px] text-[var(--text-muted)]">· {nodeCount} services · {edgeCount} edges</span>
    </header>
  );
}

function ServiceNode({ node }: { node: ServiceMapNode }) {
  const errTone = node.error_count > 0;
  return (
    <li className="flex items-center justify-between rounded border border-[var(--border-color)] px-2 py-1 text-[12px]">
      <span className="truncate font-semibold">{node.service}</span>
      <span className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)]">
        <span>{node.span_count} spans</span>
        <span style={{ color: errTone ? "#e8494d" : undefined }}>{node.error_count} err</span>
        <span>{formatDuration(node.total_ms)}</span>
      </span>
    </li>
  );
}

function EdgeRow({ edge }: { edge: ServiceMapEdge }) {
  const errTone = edge.error_count > 0;
  return (
    <li className="flex items-center justify-between gap-2 rounded border border-[var(--border-color)] px-2 py-1 text-[12px]">
      <span className="flex min-w-0 items-center gap-1 truncate">
        <span className="truncate">{edge.from}</span>
        <ArrowRight size={12} className="flex-shrink-0 text-[var(--text-muted)]" />
        <span className="truncate font-semibold">{edge.to}</span>
      </span>
      <span className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)]">
        <span>{edge.call_count}×</span>
        <span style={{ color: errTone ? "#e8494d" : undefined }}>{edge.error_count} err</span>
        <span>{formatDuration(edge.total_ms)}</span>
      </span>
    </li>
  );
}

function Loading() {
  return <div className="p-4 text-[12px] text-[var(--text-muted)]">Loading service map…</div>;
}

function Empty() {
  return <div className="p-4 text-[12px] text-[var(--text-muted)]">No service map available.</div>;
}

export const TraceServiceMapPanel = memo(TraceServiceMapPanelComponent);
