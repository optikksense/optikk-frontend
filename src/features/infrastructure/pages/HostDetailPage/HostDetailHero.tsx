import { Server } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";
import { formatRelativeTime } from "@shared/utils/formatters";

import {
  DetailBreadcrumb,
  DetailHeroLayout,
  DetailMetaRow,
  MetaItem,
} from "../../components/detail/DetailHero";

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

function loadSummary(overview: HostOverview): string | null {
  const parts = [overview.load1m, overview.load5m, overview.load15m];
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
    items.push({ label: "pods", value: String(node.podCount) });
  }
  const load = overview ? loadSummary(overview) : null;
  if (load) items.push({ label: "load 1m/5m/15m", value: load });
  if (overview?.processCount != null) {
    items.push({ label: "processes", value: String(Math.round(overview.processCount)) });
  }
  if (overview?.lastSeen) {
    items.push({ label: "last seen", value: formatRelativeTime(overview.lastSeen) });
  }
  return items;
}

export function HostDetailHero({ host, node, overview, status }: HostDetailHeroProps) {
  const pill = STATUS_PILL[status];
  const meta = buildMetaItems(node, overview);
  return (
    <header>
      <DetailBreadcrumb segments={[{ label: host }]} />
      <DetailHeroLayout
        icon={<Server size={20} />}
        title={host}
        badge={
          <Pill variant={pill.variant} dot>
            {pill.label}
          </Pill>
        }
      >
        {meta.length > 0 && (
          <DetailMetaRow>
            {meta.map((it) => (
              <MetaItem key={it.label} label={it.label} value={it.value} />
            ))}
          </DetailMetaRow>
        )}
      </DetailHeroLayout>
    </header>
  );
}
