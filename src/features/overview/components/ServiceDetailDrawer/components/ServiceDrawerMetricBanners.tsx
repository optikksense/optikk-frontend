import { memo } from "react";

type Props = {
  metricsError: boolean;
  hasSummary: boolean;
  summaryLoading: boolean;
};

function ServiceDrawerMetricBannersComponent({ metricsError, hasSummary, summaryLoading }: Props) {
  return (
    <>
      {metricsError && !hasSummary ? (
        <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-[12px] text-[var(--text-muted)]">
          Service summary is unavailable right now. You can still open Logs or Traces for this
          service.
        </div>
      ) : null}

      {!metricsError && !summaryLoading && !hasSummary ? (
        <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-[12px] text-[var(--text-muted)]">
          No service metrics were found for this service in the current time range.
        </div>
      ) : null}
    </>
  );
}

export const ServiceDrawerMetricBanners = memo(ServiceDrawerMetricBannersComponent);
