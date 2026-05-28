import { Link } from "@tanstack/react-router";
import { Server } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";

import { ROUTES } from "@/shared/constants/routes";

import type { InfrastructureNode } from "../../types";

export type HostStatus = "healthy" | "warn" | "alerting" | "unknown";

interface HostDetailHeroProps {
  readonly host: string;
  readonly node: InfrastructureNode | null;
  readonly status: HostStatus;
}

const STATUS_PILL: Record<HostStatus, { variant: "success" | "warning" | "error" | "neutral"; label: string }> = {
  healthy: { variant: "success", label: "Healthy" },
  warn: { variant: "warning", label: "Warn" },
  alerting: { variant: "error", label: "Alerting" },
  unknown: { variant: "neutral", label: "Unknown" },
};

function Breadcrumb({ host }: { host: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
      <Link to={ROUTES.infrastructure} className="hover:text-[var(--text-primary)]">
        Infrastructure
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-[var(--text-primary)]">{host}</span>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <strong className="font-medium text-[var(--text-primary)]">{value}</strong>
    </span>
  );
}

function HostMeta({ node }: { node: InfrastructureNode }) {
  const role = node.services[0] ?? null;
  const items: Array<{ label: string; value: string }> = [];
  if (role) items.push({ label: "role", value: role });
  items.push({ label: "pods", value: String(node.pod_count) });
  items.push({ label: "services", value: String(node.services.length) });
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-[var(--text-muted)]">
      {items.map((it) => (
        <MetaItem key={it.label} label={it.label} value={it.value} />
      ))}
    </div>
  );
}

export function HostDetailHero({ host, node, status }: HostDetailHeroProps) {
  const pill = STATUS_PILL[status];
  return (
    <header>
      <Breadcrumb host={host} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)]">
          <Server size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="truncate font-mono font-semibold text-[22px] text-[var(--text-primary)] leading-tight">
              {host}
            </h1>
            <Pill variant={pill.variant} dot>
              {pill.label}
            </Pill>
          </div>
          {node && <HostMeta node={node} />}
        </div>
      </div>
    </header>
  );
}
