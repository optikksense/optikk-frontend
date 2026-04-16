import { memo } from "react";

import { Card } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { ServiceSummarySnapshot } from "../types";

type Props = {
  serviceLabel: string;
  summaryMetrics: ServiceSummarySnapshot | null;
};

function ServiceDrawerCockpitCardComponent({ serviceLabel, summaryMetrics }: Props) {
  return (
    <Card
      padding="lg"
      className="border-[var(--color-primary-subtle-18)] bg-[linear-gradient(180deg,var(--color-primary-subtle-10),var(--color-primary-subtle-02))]"
    >
      <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">
            Service cockpit
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Runtime health, tail latency, and dependency posture for {serviceLabel}.
          </div>
          <p className="mt-2 text-[12px] text-[var(--text-secondary)] leading-6">
            Use this drawer for fast diagnostics, then jump into traces or logs for the exact window
            you want to investigate.
          </p>
        </div>
        {summaryMetrics ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                Requests
              </div>
              <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)]">
                {formatNumber(summaryMetrics.requestCount)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                Errors
              </div>
              <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)]">
                {formatPercentage(summaryMetrics.errorRate)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                P95
              </div>
              <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)]">
                {formatDuration(summaryMetrics.p95Latency)}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export const ServiceDrawerCockpitCard = memo(ServiceDrawerCockpitCardComponent);
