import { Link } from "@tanstack/react-router";
import { Server } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";
import { formatRelativeTime } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import type { HostOverview } from "../../api/hostDetailApi";
import type { InfrastructureNode } from "../../types";

export type HostStatus = "healthy" | "warn" | "alerting" | "unknown";

interface HostDetailHeroProps {
  readonly host: string;
  readonly node: InfrastructureNode | null;
  readonly overview: HostOverview | null;
  readonly status: HostStatus;
}

const STATUS_PILL: Record<
  HostStatus,
  { variant: "success" | "warning" | "error" | "neutral"; label: string }
> = {
  healthy: { variant: "success", label: "Healthy" },
  warn: { variant: "warning", label: "Warn" },
  alerting: { variant: "error", label: "Alerting" },
  unknown: { variant: "neutral", label: "Unknown" },
};

function Breadcrumb({ host }: { host: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <Link to={ROUTES.infrastructure} className="hover:text-foreground">
        Infrastructure
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground">{host}</span>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <strong className="font-medium text-foreground">{value}</strong>
    </span>
  );
}

function loadSummary(overview: HostOverview): string | null {
  const parts = [overview.load_1m, overview.load_5m, overview.load_15m];
  if (parts.every((v) => v == null)) return null;
  return parts.map((v) => (v == null ? "–" : v.toFixed(2))).join(" / ");
}

function buildMetaItems(
  node: InfrastructureNode | null,
  overview: HostOverview | null
): Array<{ label: string; value: string }> {
  const items: Array<{ label: string; value: string }> = [];
  if (overview && overview.environments.length > 0) {
    items.push({ label: "env", value: overview.environments.join(", ") });
  }
  if (overview && overview.namespaces.length > 0) {
    items.push({ label: "namespaces", value: overview.namespaces.join(", ") });
  }
  if (node) {
    items.push({ label: "services", value: String(node.services.length) });
    items.push({ label: "pods", value: String(node.pod_count) });
  }
  const load = overview ? loadSummary(overview) : null;
  if (load) items.push({ label: "load 1m/5m/15m", value: load });
  if (overview?.process_count != null) {
    items.push({ label: "processes", value: String(Math.round(overview.process_count)) });
  }
  if (overview?.last_seen) {
    items.push({ label: "last seen", value: formatRelativeTime(overview.last_seen) });
  }
  return items;
}

export function HostDetailHero({ host, node, overview, status }: HostDetailHeroProps) {
  const pill = STATUS_PILL[status];
  const meta = buildMetaItems(node, overview);
  return (
    <header>
      <Breadcrumb host={host} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-primary">
          <Server size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="truncate font-mono font-semibold text-[22px] text-foreground leading-tight">
              {host}
            </h1>
            <Pill variant={pill.variant} dot>
              {pill.label}
            </Pill>
          </div>
          {meta.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-foreground-muted">
              {meta.map((it) => (
                <MetaItem key={it.label} label={it.label} value={it.value} />
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
