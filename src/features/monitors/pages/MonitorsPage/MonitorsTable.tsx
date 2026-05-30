import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { memo } from "react";

import MonitorStatusBadge from "../../components/MonitorStatusBadge";
import PriorityChip from "../../components/PriorityChip";
import type { Monitor } from "../../api/monitorsApi";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

interface Props {
  readonly monitors: readonly Monitor[];
}

const TYPE_COLORS: Record<string, string> = {
  metric: "text-primary",
  apm: "text-primary",
  log: "text-warning",
};

function formatScope(m: Monitor): string {
  const tags = m.scope.tags ?? [];
  return tags.map((t) => `${t.key}:${t.value}`).join(" ");
}

function formatValue(v: number | undefined, type: string): string {
  if (v === undefined) return "—";
  if (type === "apm") return `${v.toFixed(2)}`;
  return `${v}`;
}

function MonitorsTable({ monitors }: Props) {
  const navigate = useNavigate();
  if (monitors.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-foreground-muted">
        No monitors match your filters.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-[11px] uppercase tracking-wider text-foreground-muted">
          <tr>
            <th className="py-2 pl-4 text-left font-medium">Status</th>
            <th className="py-2 text-left font-medium">Monitor</th>
            <th className="py-2 text-left font-medium">Type</th>
            <th className="py-2 text-left font-medium">Priority</th>
            <th className="py-2 text-left font-medium">Scope</th>
            <th className="py-2 text-right font-medium">Current</th>
            <th className="py-2 text-left font-medium">Last eval</th>
            <th className="py-2 pr-4 text-right font-medium" />
          </tr>
        </thead>
        <tbody>
          {monitors.map((m) => (
            <tr
              key={m.id}
              onClick={() => navigate(dynamicNavigateOptions(`/monitors/${m.id}`))}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary"
            >
              <td className="py-2 pl-4">
                <MonitorStatusBadge status={m.status} />
              </td>
              <td className="py-2 pr-3">
                <div className="font-medium text-foreground">{m.name}</div>
                <div className="font-mono text-[10px] text-foreground-muted">m-{m.id}</div>
              </td>
              <td className="py-2">
                <span
                  className={`font-mono text-[10px] font-bold uppercase ${TYPE_COLORS[m.type] ?? ""}`}
                >
                  {m.type}
                </span>
              </td>
              <td className="py-2">
                <PriorityChip priority={m.priority} />
              </td>
              <td className="py-2 font-mono text-[11px] text-foreground-muted">
                {formatScope(m)}
              </td>
              <td className="py-2 text-right font-mono">{formatValue(m.current_value, m.type)}</td>
              <td className="py-2 font-mono text-[11px] text-foreground-muted">
                {m.last_evaluated_at ? new Date(m.last_evaluated_at).toLocaleTimeString() : "—"}
              </td>
              <td className="py-2 pr-4 text-right">
                <ChevronRight size={14} className="ml-auto text-foreground-muted" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(MonitorsTable);
