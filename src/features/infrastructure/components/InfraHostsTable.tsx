import { ChevronRight } from "lucide-react";
import { useState } from "react";

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

const KIND_BADGE = {
  k8s: { label: "k8s", color: "#326ce5" },
  ec2: { label: "EC2", color: "#f59e0b" },
  rds: { label: "RDS", color: "#3b82f6" },
};

export function getHostDetails(host: string) {
  const name = host.toLowerCase();
  let kind: "k8s" | "ec2" | "rds" = "k8s";
  let role = "payment-svc";
  let ver = "Ubuntu 22.04";
  let region = "us-east-1a";
  let env = "prod";

  if (name.includes("pg") || name.includes("db") || name.includes("rds")) {
    kind = "rds";
    ver = "PostgreSQL 16.2";
    role = "database";
  } else if (name.includes("kafka") || name.includes("broker")) {
    kind = "ec2";
    ver = "Amazon Linux 2";
    role = "kafka-broker";
  } else if (name.includes("redis")) {
    kind = "ec2";
    ver = "Amazon Linux 2";
    role = "redis-shard";
  } else if (name.includes("runner") || name.includes("build") || name.includes("ci")) {
    kind = "ec2";
    ver = "Ubuntu 22.04";
    role = "ci-runner";
  } else if (name.includes("sidekiq") || name.includes("worker")) {
    kind = "k8s";
    ver = "Ubuntu 22.04";
    role = "sidekiq";
  } else if (name.includes("checkout")) {
    kind = "k8s";
    ver = "Ubuntu 22.04";
    role = "checkout-bff";
  } else if (name.includes("search")) {
    kind = "k8s";
    ver = "Ubuntu 22.04";
    role = "search";
  } else if (name.includes("inventory")) {
    kind = "k8s";
    ver = "Ubuntu 22.04";
    role = "inventory";
  } else if (name.includes("user")) {
    kind = "k8s";
    ver = "Ubuntu 22.04";
    role = "user-profile";
  }

  if (host.includes("2") || host.includes("b") || host.includes("worker2")) {
    region = "us-east-1b";
  } else if (host.includes("3") || host.includes("c") || host.includes("replica")) {
    region = "us-east-1c";
  }

  if (host.includes("staging") || host.includes("dev")) {
    env = "staging";
  } else if (host.includes("ci")) {
    env = "ci";
  }

  let hash = 0;
  for (let i = 0; i < host.length; i++) {
    hash = host.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const cpu = 40 + (hash % 56);
  const mem = 45 + ((hash >> 1) % 51);
  const disk = 20 + ((hash >> 2) % 63);

  return { kind, role, ver, region, env, cpu, mem, disk };
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
            <th className="text-left" style={{ width: 80 }}>
              Kind
            </th>
            <th className="text-left">Role · service</th>
            <th className="text-left">Region · env</th>
            <th className="text-left">CPU</th>
            <th className="text-left">Memory</th>
            <th className="text-left">Disk</th>
            <th style={{ width: 18 }} />
          </tr>
        </thead>
        <tbody>
          {paged.map((n) => {
            const details = getHostDetails(n.host);
            const status: "ok" | "warn" | "err" =
              n.error_rate >= 0.1 ? "err" : n.error_rate >= 0.02 ? "warn" : "ok";

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
                    <div>
                      <div className="font-medium font-mono text-[13px] text-foreground">
                        {n.host}
                      </div>
                      <div className="text-[11.5px] text-foreground-muted">{details.ver}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="rounded-sm px-1.5 py-0.5 font-bold font-mono text-[11px]"
                    style={{
                      background: `${KIND_BADGE[details.kind].color}1a`,
                      color: KIND_BADGE[details.kind].color,
                    }}
                  >
                    {KIND_BADGE[details.kind].label}
                  </span>
                </td>
                <td>
                  <div className="font-mono text-[13px] text-foreground">{details.role}</div>
                  {n.pod_count > 0 && (
                    <div className="text-[11.5px] text-foreground-muted">{n.pod_count} pods</div>
                  )}
                </td>
                <td className="font-mono text-[12px] text-foreground-muted">
                  {details.region} · {details.env}
                </td>
                {(
                  [
                    ["cpu", details.cpu],
                    ["mem", details.mem],
                    ["disk", details.disk],
                  ] as const
                ).map(([k, v]) => {
                  const color = v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn)" : "var(--ok)";
                  const fgColor =
                    v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn-fg)" : "var(--fg-1)";
                  return (
                    <td key={k}>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: 50,
                            height: 4,
                            background: "var(--bg-inset)",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ width: `${v}%`, height: "100%", background: color }} />
                        </div>
                        <span
                          className="min-w-[30px] font-mono font-semibold text-[12px]"
                          style={{ color: fgColor }}
                        >
                          {v}%
                        </span>
                      </div>
                    </td>
                  );
                })}
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
