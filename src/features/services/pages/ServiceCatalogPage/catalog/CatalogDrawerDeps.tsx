import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicTo } from "@shared/utils/navigation";

import { fmtMs, fmtNum, fmtPct } from "../../ServiceDetailPage/formatters";
import { useServiceTopology } from "../../ServiceDetailPage/hooks/useServiceTopology";

interface CatalogDrawerDepsProps {
  readonly serviceName: string;
}

function DepRow({
  peer,
  callCount,
  errorRate,
  p95LatencyMs,
}: {
  peer: string;
  callCount: number;
  errorRate: number;
  p95LatencyMs: number;
}) {
  const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(peer));
  return (
    <li className="flex items-baseline justify-between gap-2 border-[var(--border-color)] border-t px-3 py-1.5 text-[11px] first:border-t-0">
      <Link
        to={dynamicTo(detail)}
        className="truncate font-mono text-[var(--color-info,#3b82f6)] hover:underline"
      >
        {peer}
      </Link>
      <span className="text-[var(--text-muted)]">
        {fmtNum(callCount)} · {fmtPct(errorRate)} · {fmtMs(p95LatencyMs)}
      </span>
    </li>
  );
}

export function CatalogDrawerDeps({ serviceName }: CatalogDrawerDepsProps) {
  const { dependencies } = useServiceTopology(serviceName);
  const all = [
    ...dependencies.upstream.map((edge) => ({ ...edge, label: "↑" })),
    ...dependencies.downstream.map((edge) => ({ ...edge, label: "↓" })),
  ];
  if (all.length === 0) {
    return <div className="text-[11px] text-[var(--text-muted)]">No dependencies in window.</div>;
  }
  return (
    <ul>
      {all.map((edge) => (
        <DepRow
          key={`${edge.label}-${edge.peer}`}
          peer={edge.peer}
          callCount={edge.callCount}
          errorRate={edge.errorRate}
          p95LatencyMs={edge.p95LatencyMs}
        />
      ))}
    </ul>
  );
}
