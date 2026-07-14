import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { formatDuration, formatNumber, formatRelativeTime } from "@shared/utils/formatters";

import type { InfrastructureNode } from "../types";

interface InfraHostsTableProps {
  readonly nodes: readonly InfrastructureNode[];
  readonly onOpenNode: (host: string) => void;
}

const STATUS_COLOR = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  err: "var(--err)",
};

function nodeStatus(errorRate: number): "ok" | "warn" | "err" {
  return errorRate >= 0.1 ? "err" : errorRate >= 0.02 ? "warn" : "ok";
}

export function InfraHostsTable({ nodes, onOpenNode }: InfraHostsTableProps) {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);

  const paged = nodes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="tbl w-full">
        <thead>
          <tr>
            <th className="text-left" style={{ paddingLeft: 18, width: 220 }}>
              Host
            </th>
            <th className="text-left">Services</th>
            <th className="text-left">Requests</th>
            <th className="text-left">Error rate</th>
            <th className="text-left">p95</th>
            <th className="text-left">Last seen</th>
            <th style={{ width: 18 }} />
          </tr>
        </thead>
        <tbody>
          {paged.map((n) => {
            const status = nodeStatus(n.error_rate);
            const errPct = n.error_rate * 100;
            const errColor =
              status === "err"
                ? "var(--err)"
                : status === "warn"
                  ? "var(--warn-fg)"
                  : "var(--fg-1)";

            return (
              <tr
                key={n.host}
                onClick={() => onOpenNode(n.host)}
                className="cursor-pointer transition-colors hover:bg-muted/40"
              >
                <td style={{ paddingLeft: 18, paddingTop: "10px", paddingBottom: "10px" }}>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: STATUS_COLOR[status],
                        flexShrink: 0,
                      }}
                    />
                    <div className="font-medium font-mono text-[13px] text-foreground">
                      {n.host}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-mono text-[13px] text-foreground">
                    {n.services.length > 0 ? n.services.join(", ") : "—"}
                  </div>
                  {n.pod_count > 0 && (
                    <div className="text-[11.5px] text-foreground-muted">{n.pod_count} pods</div>
                  )}
                </td>
                <td className="font-mono text-[12.5px] text-foreground-muted">
                  {formatNumber(n.request_count)}
                </td>
                <td className="font-mono font-semibold text-[12.5px]" style={{ color: errColor }}>
                  {errPct.toFixed(errPct >= 10 ? 0 : 1)}%
                </td>
                <td className="font-mono text-[12.5px] text-foreground-muted">
                  {formatDuration(n.p95_latency_ms)}
                </td>
                <td className="font-mono text-[12px] text-foreground-muted">
                  {formatRelativeTime(n.last_seen)}
                </td>
                <td>
                  <ChevronRight size={13} className="text-foreground-muted" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        className="flex items-center justify-between border-border border-t"
        style={{ padding: "10px 18px", background: "var(--bg-card)" }}
      >
        <span className="text-[12.5px] text-foreground-muted">
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, nodes.length)} of {nodes.length}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ opacity: page === 0 ? 0.4 : 1 }}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * PAGE_SIZE >= nodes.length}
            style={{ opacity: (page + 1) * PAGE_SIZE >= nodes.length ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
