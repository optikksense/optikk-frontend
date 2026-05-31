import { ChevronRight } from "lucide-react";
import { useState } from "react";

import type { FleetPod } from "../types";

interface InfraPodsTableProps {
  readonly pods: readonly (FleetPod & {
    readonly status: "running" | "pending" | "terminating" | "crashloop" | "oomkilled";
    readonly ns: string;
    readonly img: string;
    readonly age: string;
    readonly cpu: number;
    readonly mem: number;
    readonly restarts: number;
  })[];
  readonly onOpenContainer: (container: string) => void;
  readonly onOpenHost: (host: string) => void;
}

const STATUS_COLOR = {
  running: "var(--ok)",
  pending: "var(--warn)",
  terminating: "var(--fg-mute)",
  crashloop: "var(--err)",
  oomkilled: "var(--err)",
};

const STATUS_BADGE = {
  running: "success",
  pending: "warning",
  terminating: "neutral",
  crashloop: "error",
  oomkilled: "error",
};

const STATUS_LABEL = {
  running: "Running",
  pending: "Pending",
  terminating: "Terminating",
  crashloop: "CrashLoopBackOff",
  oomkilled: "OOMKilled",
};

export function getPodDetails(podName: string, host: string, errorRate: number) {
  let status: "running" | "pending" | "terminating" | "crashloop" | "oomkilled" = "running";
  let ns = "payments-prod";
  let img = "payment-svc:v8.12.0";
  let age = "18m";

  if (podName.includes("checkout")) {
    ns = "payments-prod";
    img = "checkout-bff:v3.4.1";
    age = "12d";
  } else if (podName.includes("search")) {
    ns = "discovery-prod";
    img = "search:v2.7.0";
    age = "4m";
    if (podName.includes("old")) {
      status = "terminating";
      age = "8m";
    } else if (podName.includes("pending") || errorRate > 0.05) {
      status = "pending";
      age = "2m";
    }
  } else if (podName.includes("cart")) {
    ns = "shopping-prod";
    img = "cart:v12.0.2";
    age = "5d";
  } else if (podName.includes("inventory")) {
    ns = "shopping-prod";
    img = "inventory:v9.8.1";
    age = "5d";
  } else if (podName.includes("fraud")) {
    ns = "trust-prod";
    img = "fraud-detect:v0.7.2";
    age = "14h";
    if (errorRate > 0.1) {
      status = "oomkilled";
    }
  } else if (podName.includes("tax")) {
    ns = "payments-prod";
    img = "tax-calc:v2.0.0";
    age = "54m";
  } else if (podName.includes("user")) {
    ns = "identity-prod";
    img = "user-profile:v4.1.3";
    age = "8d";
  } else if (podName.includes("sidekiq")) {
    ns = "messaging-prod";
    img = "sidekiq-prod:v3.2.1";
    age = "8d";
  } else if (podName.includes("agent") || podName.includes("datadog")) {
    ns = "monitoring";
    img = "datadog/agent:7.42.1";
    age = "8d";
  }

  if (errorRate > 0.1 && status === "running") {
    status = "crashloop";
  }

  let hash = 0;
  for (let i = 0; i < podName.length; i++) {
    hash = podName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const cpu = status === "running" ? 10 + (hash % 81) : status === "terminating" ? 12 : 0;
  const mem = status === "running" ? 15 + ((hash >> 1) % 76) : status === "terminating" ? 18 : 0;
  const restarts = errorRate > 0.1 ? 12 + (hash % 10) : errorRate > 0.02 ? 2 + (hash % 3) : 0;

  return { status, ns, img, age, cpu, mem, restarts };
}

export default function InfraPodsTable({ pods, onOpenContainer, onOpenHost }: InfraPodsTableProps) {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);

  const paged = pods.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="tbl w-full">
        <thead>
          <tr>
            <th className="text-left" style={{ paddingLeft: 18, width: 260 }}>
              Container
            </th>
            <th className="text-left">Image</th>
            <th className="text-left">Status</th>
            <th className="text-left">Host</th>
            <th className="text-right" style={{ width: 100 }}>
              CPU
            </th>
            <th className="text-right" style={{ width: 100 }}>
              Memory
            </th>
            <th className="text-right" style={{ width: 90 }}>
              Restarts
            </th>
            <th className="text-left" style={{ width: 80 }}>
              Age
            </th>
            <th style={{ width: 18 }}></th>
          </tr>
        </thead>
        <tbody>
          {paged.map((c) => {
            const badgeVariant = STATUS_BADGE[c.status];

            return (
              <tr
                key={`${c.pod_name}\0${c.host}`}
                onClick={() => onOpenContainer(c.pod_name)}
                className="cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <td style={{ paddingLeft: 18, paddingTop: "10px", paddingBottom: "10px" }}>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: STATUS_COLOR[c.status],
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div className="font-mono text-[13px] font-medium text-foreground">
                        {c.pod_name}
                      </div>
                      <div className="text-[11.5px] text-foreground-muted font-mono">
                        {c.ns} · pod {c.pod_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-[12.5px] text-foreground-secondary">{c.img}</td>
                <td>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${
                      badgeVariant === "success"
                        ? "border-[var(--ok)] bg-[var(--ok-soft)] text-[var(--ok)]"
                        : badgeVariant === "warning"
                          ? "border-[var(--warn)] bg-[var(--warn-soft)] text-[var(--warn-fg)]"
                          : badgeVariant === "error"
                            ? "border-[var(--err)] bg-[var(--err-soft)] text-[var(--err)]"
                            : "border-border bg-muted text-foreground-muted"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        badgeVariant === "success"
                          ? "bg-[var(--ok)]"
                          : badgeVariant === "warning"
                            ? "bg-[var(--warn)]"
                            : badgeVariant === "error"
                              ? "bg-[var(--err)]"
                              : "bg-foreground-muted"
                      }`}
                    />
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onOpenHost(c.host);
                    }}
                    className="font-mono text-[12.5px] text-primary hover:underline"
                  >
                    {c.host}
                  </button>
                </td>
                {(
                  [
                    ["cpu", c.cpu],
                    ["mem", c.mem],
                  ] as const
                ).map(([k, v]) => {
                  const color = v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn)" : "var(--ok)";
                  const fgColor =
                    v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn-fg)" : "var(--fg-1)";
                  return (
                    <td key={k} className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div
                          style={{
                            width: 44,
                            height: 4,
                            background: "var(--bg-inset)",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ width: v + "%", height: "100%", background: color }} />
                        </div>
                        <span
                          className="font-mono text-[12px] font-semibold min-w-[28px]"
                          style={{ color: fgColor }}
                        >
                          {v}%
                        </span>
                      </div>
                    </td>
                  );
                })}
                <td className="text-right">
                  <span
                    className={`font-mono text-[12.5px] ${
                      c.restarts > 5
                        ? "font-semibold text-[var(--err)]"
                        : c.restarts > 0
                          ? "font-semibold text-[var(--warn-fg)]"
                          : "text-foreground-muted"
                    }`}
                  >
                    {c.restarts}
                  </span>
                </td>
                <td className="font-mono text-[12.5px] text-foreground-muted">{c.age}</td>
                <td>
                  <ChevronRight size={13} className="text-foreground-muted" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        className="flex items-center justify-between border-t border-border"
        style={{ padding: "10px 18px", background: "var(--bg-card)" }}
      >
        <span className="text-[12.5px] text-foreground-muted">
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, pods.length)} of {pods.length}
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
            disabled={(page + 1) * PAGE_SIZE >= pods.length}
            style={{ opacity: (page + 1) * PAGE_SIZE >= pods.length ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
