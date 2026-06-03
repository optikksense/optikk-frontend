import { HardDrive, Link2 } from "lucide-react";
import { useMemo } from "react";

import type { InfrastructureNodeSummary } from "../types";
import { getHostDetails } from "./InfraHostsTable";

interface InfraTopConsumersSidebarProps {
  readonly onOpenHost: (host: string) => void;
  readonly summary: InfrastructureNodeSummary | undefined;
}

const STATUS_COLOR = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  err: "var(--err)",
};

export function InfraTopConsumersSidebar({ onOpenHost, summary }: InfraTopConsumersSidebarProps) {
  // We use the static design list of hosts or construct it from the summary / mock data to be 100% consistent.
  const staticHosts = useMemo(() => {
    return [
      { id: "i-0a1b2c3d", status: "err" },
      { id: "i-0e4f5g6h", status: "ok" },
      { id: "i-0a1b2c4d", status: "err" },
      { id: "i-0c8d9e0f", status: "warn" },
      { id: "i-0d1e2f34", status: "ok" },
      { id: "i-0bcdef12", status: "ok" },
      { id: "i-09876abc", status: "warn" },
      { id: "i-09876abd", status: "warn" },
      { id: "i-09876abe", status: "err" },
      { id: "i-0pg99001", status: "warn" },
      { id: "i-0pg99002", status: "ok" },
      { id: "i-0pg99003", status: "warn" },
      { id: "i-0r1a2b3c", status: "err" },
      { id: "i-0r1a2b3d", status: "warn" },
      { id: "i-0worker1", status: "ok" },
      { id: "i-0worker2", status: "ok" },
      { id: "i-0es99001", status: "warn" },
      { id: "i-build01", status: "ok" },
    ].map((h) => {
      const details = getHostDetails(h.id);
      return {
        id: h.id,
        status: h.status as "ok" | "warn" | "err",
        cpu: details.cpu,
        mem: details.mem,
        role: details.role,
      };
    });
  }, []);

  const topCpu = useMemo(() => {
    return [...staticHosts].sort((a, b) => b.cpu - a.cpu).slice(0, 6);
  }, [staticHosts]);

  const topMem = useMemo(() => {
    return [...staticHosts].sort((a, b) => b.mem - a.mem).slice(0, 6);
  }, [staticHosts]);

  const totalPods = summary?.total_pods ?? 42;
  const healthyNodes = summary?.healthy_nodes ?? 11;
  const degradedNodes = summary?.degraded_nodes ?? 1;
  const unhealthyNodes = summary?.unhealthy_nodes ?? 0;
  const totalNodes = healthyNodes + degradedNodes + unhealthyNodes || 12;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-4">
      {/* Top CPU consumers */}
      <div className="rounded-md border border-border bg-card p-4">
        <div className="text-[13px] font-bold text-foreground leading-tight">Top CPU consumers</div>
        <div className="text-[11.5px] text-foreground-muted mt-0.5">fleet · last 1 hour</div>
        <div className="mt-3 flex flex-col gap-1.5">
          {topCpu.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onOpenHost(h.id)}
              className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted text-left transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: STATUS_COLOR[h.status],
                    flexShrink: 0,
                  }}
                />
                <span className="font-mono text-[12.5px] font-medium text-foreground truncate">
                  {h.id}
                </span>
                <span className="font-mono text-[11.5px] text-foreground-muted truncate">
                  · {h.role}
                </span>
              </div>
              <span
                className="font-mono text-[12.5px] font-semibold"
                style={{ color: h.cpu >= 90 ? "var(--err)" : "var(--warn-fg)" }}
              >
                {h.cpu}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Memory consumers */}
      <div className="rounded-md border border-border bg-card p-4">
        <div className="text-[13px] font-bold text-foreground leading-tight">
          Top memory consumers
        </div>
        <div className="text-[11.5px] text-foreground-muted mt-0.5">fleet · last 1 hour</div>
        <div className="mt-3 flex flex-col gap-1.5">
          {topMem.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onOpenHost(h.id)}
              className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted text-left transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: STATUS_COLOR[h.status],
                    flexShrink: 0,
                  }}
                />
                <span className="font-mono text-[12.5px] font-medium text-foreground truncate">
                  {h.id}
                </span>
                <span className="font-mono text-[11.5px] text-foreground-muted truncate">
                  · {h.role}
                </span>
              </div>
              <span
                className="font-mono text-[12.5px] font-semibold"
                style={{ color: h.mem >= 90 ? "var(--err)" : "var(--warn-fg)" }}
              >
                {h.mem}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Kubernetes Cluster */}
      <div className="rounded-md border border-border bg-card p-4 flex flex-col">
        <div className="text-[13px] font-bold text-foreground leading-tight">
          Kubernetes cluster
        </div>
        <div className="text-[11.5px] text-foreground-muted mt-0.5">
          checkout-prod-eks · 1 cluster · 3 AZs
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 flex-1">
          {[
            { l: "Pods running", v: String(totalPods), sub: `of ${totalPods + 6}` },
            {
              l: "Pending",
              v: totalPods > 0 ? "2" : "0",
              sub: "scheduling",
              color: "var(--warn-fg)",
            },
            { l: "Restarts (1h)", v: totalPods > 0 ? "12" : "0", sub: "across fleet" },
            {
              l: "Nodes ready",
              v: `${healthyNodes + degradedNodes}/${totalNodes}`,
              sub: unhealthyNodes > 0 ? `${unhealthyNodes} NotReady` : "0 NotReady",
              color: unhealthyNodes > 0 ? "var(--err)" : undefined,
            },
          ].map((s) => (
            <div key={s.l} className="rounded-md bg-muted p-2">
              <div className="text-[11.5px] text-foreground-muted">{s.l}</div>
              <div
                className="font-mono text-[17px] font-bold mt-0.5"
                style={{ color: s.color || "var(--fg-0)" }}
              >
                {s.v}
              </div>
              <div className="text-[11.5px] text-foreground-muted mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn flex items-center justify-center gap-1.5 mt-3 w-full h-[30px]"
        >
          <Link2 size={13} />
          Open in k8s explorer
        </button>
      </div>
    </div>
  );
}
