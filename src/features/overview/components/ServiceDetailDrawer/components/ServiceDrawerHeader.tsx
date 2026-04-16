import { ArrowUpRight, GitBranch, Server } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui";
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { ServiceSummarySnapshot } from "../types";
import { healthLabelForErrorRate, healthVariantForErrorRate } from "../utils";

type Props = {
  serviceLabel: string;
  summaryMetrics: ServiceSummarySnapshot | null;
  onOpenTraces: () => void;
  onOpenLogs: () => void;
};

function ServiceDrawerHeaderComponent({
  serviceLabel,
  summaryMetrics,
  onOpenTraces,
  onOpenLogs,
}: Props) {
  return (
    <DrawerHeader className="items-start">
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DrawerTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <Server size={18} className="shrink-0" />
              <span className="truncate">{serviceLabel || "Service"}</span>
            </DrawerTitle>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              Frontend-owned service detail drawer with quick diagnostics and workflow links.
            </p>
          </div>
          <DrawerClose
            aria-label="Close"
            className="shrink-0 rounded-[var(--card-radius)] border border-[var(--border-color)] px-3 py-1 text-[18px] text-[var(--text-secondary)] leading-none transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            &times;
          </DrawerClose>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {summaryMetrics ? (
            <>
              <Badge variant={healthVariantForErrorRate(summaryMetrics.errorRate)}>
                {healthLabelForErrorRate(summaryMetrics.errorRate)}
              </Badge>
              <Badge variant="default">{formatNumber(summaryMetrics.requestCount)} req</Badge>
              <Badge variant="default">{formatPercentage(summaryMetrics.errorRate)} error</Badge>
              <Badge variant="default">{formatDuration(summaryMetrics.p95Latency)} p95</Badge>
            </>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            icon={<GitBranch size={14} />}
            onClick={onOpenTraces}
          >
            Open in Traces
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowUpRight size={14} />}
            onClick={onOpenLogs}
          >
            Open in Logs
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { href: "#service-drawer-overview", label: "Overview" },
            { href: "#service-drawer-endpoints", label: "Endpoints" },
            { href: "#service-drawer-dependencies", label: "Dependencies" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-1 text-[11px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </DrawerHeader>
  );
}

export const ServiceDrawerHeader = memo(ServiceDrawerHeaderComponent);
