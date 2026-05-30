import { cn } from "@/lib/utils";

import type { DeploymentRow } from "@shared/api/deployments/deploymentsApi";

import { fmtNum, relativeTimeFromIso } from "../formatters";
import { useServiceDeploys } from "../hooks/useServiceDeploys";
import { PanelCard } from "./PanelCard";

function DeployRow({ row, isActive }: { row: DeploymentRow; isActive: boolean }) {
  return (
    <li
      className={cn(
        "flex items-baseline justify-between gap-3 border-border border-t px-4 py-3 first:border-t-0",
        isActive && "bg-[var(--bg-elevated,rgba(255,255,255,0.04))]"
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[12px] text-foreground">{row.version}</span>
          {isActive && (
            <span className="rounded bg-[var(--color-success-bg,rgba(16,185,129,0.16))] px-1.5 py-0.5 text-[10px] text-[var(--color-success,#10b981)] uppercase">
              active
            </span>
          )}
        </div>
        <span className="text-[11px] text-foreground-muted">
          {row.environment} · {fmtNum(row.span_count)} spans
        </span>
      </div>
      <div className="text-right text-[11px] text-foreground-muted">
        first seen {relativeTimeFromIso(row.first_seen)}
        <div>last seen {relativeTimeFromIso(row.last_seen)}</div>
      </div>
    </li>
  );
}

interface DeploysListPanelProps {
  readonly serviceName: string;
  readonly maxRows?: number;
  readonly title?: string;
}

export function DeploysListPanel({
  serviceName,
  maxRows = 6,
  title = "Recent deploys",
}: DeploysListPanelProps) {
  const { data, isPending } = useServiceDeploys(serviceName);
  const rows = (data?.deployments ?? []).slice(0, maxRows);
  const activeVersion = data?.active_version || "";
  return (
    <PanelCard
      title={title}
      subtitle={data ? `${data.total} deploys · active ${activeVersion || "—"}` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No deploys in selected range."}
        </div>
      ) : (
        <ul>
          {rows.map((row) => (
            <DeployRow
              key={`${row.version}::${row.environment}`}
              row={row}
              isActive={row.version === activeVersion}
            />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
