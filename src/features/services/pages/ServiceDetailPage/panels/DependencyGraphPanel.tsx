import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

import { fmtMs, fmtNum, fmtPct } from "../formatters";
import { type DependencyEdge, useServiceTopology } from "../hooks/useServiceTopology";
import { PanelCard } from "./PanelCard";

function DependencyRow({ edge }: { edge: DependencyEdge }) {
  const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(edge.peer));
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2 text-[12px]">
      <Link
        to={detail}
        className="truncate font-mono text-[var(--color-info,#3b82f6)] hover:underline"
      >
        {edge.peer}
      </Link>
      <div className="flex shrink-0 items-baseline gap-3 text-[var(--text-muted)]">
        <span>{fmtNum(edge.callCount)} calls</span>
        <span>{fmtPct(edge.errorRate)}</span>
        <span>{fmtMs(edge.p95LatencyMs)} p95</span>
      </div>
    </li>
  );
}

function DependencyColumn({ label, edges }: { label: string; edges: DependencyEdge[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="px-4 py-2 text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
        {label}
        <span className="ml-1 text-[var(--text-primary)]">({edges.length})</span>
      </div>
      {edges.length === 0 ? (
        <div className="px-4 py-3 text-[12px] text-[var(--text-muted)]">No services.</div>
      ) : (
        <ul className="divide-y divide-[var(--border-color)]">
          {edges.map((edge) => (
            <DependencyRow key={edge.peer} edge={edge} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function DependencyGraphPanel({ serviceName }: { serviceName: string }) {
  const { dependencies, isPending } = useServiceTopology(serviceName);
  return (
    <PanelCard
      title="Dependencies"
      subtitle={
        isPending
          ? "Loading topology…"
          : `${dependencies.upstream.length} upstream · ${dependencies.downstream.length} downstream`
      }
      padded={false}
    >
      <div className="grid grid-cols-1 divide-y divide-[var(--border-color)] md:grid-cols-2 md:divide-x md:divide-y-0">
        <DependencyColumn label="Upstream" edges={dependencies.upstream} />
        <DependencyColumn label="Downstream" edges={dependencies.downstream} />
      </div>
    </PanelCard>
  );
}
